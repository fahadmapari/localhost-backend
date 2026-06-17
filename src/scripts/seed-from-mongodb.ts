/**
 * ETL: MongoDB → PostgreSQL
 *
 * Reads every collection from MongoDB and inserts into PostgreSQL via Drizzle.
 * Maintains an ObjectId → UUID mapping so all FK relationships are preserved.
 *
 * Usage:
 *   npx tsx src/scripts/seed-from-mongodb.ts
 *
 * Reads DB_URI (MongoDB) and DATABASE_URL (PostgreSQL) from .env.development.local.
 *
 * Run after:
 *   npx drizzle-kit migrate   ← schema must exist first
 *
 * Run before:
 *   npm run seed:pinecone:temp  ← re-index with new UUID-based product IDs
 */

import { config } from "dotenv";
config({ path: `.env.${process.env.NODE_ENV || "development.local"}` });

import { MongoClient } from "mongodb";
import { randomUUID } from "crypto";
import { db } from "@/db";
import {
  users,
  clientProfiles,
  products,
  productVariants,
  productRemarks,
  conversations,
  conversationParticipants,
  messages,
  bookings,
  bookingOrderItems,
  guideAssignments,
  subscriptions,
  suppliers,
} from "@/db/schema";

const MONGO_URI = process.env.DB_URI;
if (!MONGO_URI) throw new Error("DB_URI not set in env");

const BATCH = 200;

// ─── ID mapping ───────────────────────────────────────────────────────────────
// Keeps ObjectId string → new UUID so FK references stay consistent.

const idMap = new Map<string, string>();

const toUUID = (oid: unknown): string | null => {
  if (!oid) return null;
  return idMap.get(String(oid)) ?? null;
};

const requireUUID = (oid: unknown, label: string): string => {
  const id = toUUID(oid);
  if (!id) throw new Error(`No UUID mapping for ${label}: ${oid}`);
  return id;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toDateStr = (d: unknown): string | null => {
  if (!d) return null;
  try { return new Date(d as any).toISOString().slice(0, 10); } catch { return null; }
};

const chunk = <T>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  const mongo = new MongoClient(MONGO_URI!);
  await mongo.connect();
  const mdb = mongo.db();
  console.log("✅ Connected to MongoDB");

  try {
    // ── 1. Pre-allocate all UUIDs ─────────────────────────────────────────────
    // Must happen before any inserts so FK references can be resolved.

    console.log("\n📋 Building ID map...");
    const topLevelCollections = [
      "users",
      "profiles",
      "products",
      "productvariants",
      "productremarks",
      "conversations",
      "messages",
      "bookings",
      "subscriptions",
      "guides",
    ];
    for (const name of topLevelCollections) {
      const ids = await mdb.collection(name).distinct("_id");
      for (const id of ids) idMap.set(String(id), randomUUID());
    }
    console.log(`   Mapped ${idMap.size} ObjectIds → UUIDs`);

    // ── 2. Users ──────────────────────────────────────────────────────────────

    console.log("\n👤 Migrating users...");
    const mongoUsers = await mdb.collection("users").find({}).toArray();
    for (const ch of chunk(mongoUsers, BATCH)) {
      await db.insert(users).values(
        ch.map((u) => ({
          id: requireUUID(u._id, "user"),
          name: String(u.name ?? ""),
          email: String(u.email ?? ""),
          password: String(u.password ?? ""),
          role: (u.role as any) ?? "client",
          createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
          updatedAt: u.updatedAt ? new Date(u.updatedAt) : new Date(),
        })),
      ).onConflictDoNothing();
    }
    console.log(`   ✓ ${mongoUsers.length} users`);

    // ── 3. Client Profiles ────────────────────────────────────────────────────

    console.log("\n🧑‍💼 Migrating client profiles...");
    const mongoProfiles = await mdb
      .collection("profiles")
      .find({ profileType: "ClientProfile" })
      .toArray();
    for (const ch of chunk(mongoProfiles, BATCH)) {
      const rows = ch.flatMap((p) => {
        const userId = toUUID(p.userId);
        if (!userId) {
          console.warn(`   ⚠ Skipping profile ${p._id} — userId not in map`);
          return [];
        }
        return [{
          id: requireUUID(p._id, "clientProfile"),
          userId,
          status: Boolean(p.status ?? false),
          firstName: String(p.firstName ?? ""),
          lastName: String(p.lastName ?? ""),
          email: String(p.email ?? ""),
          mobile: (p.mobile as any) ?? { code: "", number: "" },
          whatsapp: (p.whatsapp as any) ?? { code: "", number: "" },
          teamsId: String(p.teamsId ?? ""),
          position: p.position ? String(p.position) : null,
          boardedFromOnlinePortal: Boolean(p.boardedFromOnlinePortal ?? true),
          companyInformation: (p.companyInformation as any) ?? null,
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
          updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        }];
      });
      if (rows.length) await db.insert(clientProfiles).values(rows).onConflictDoNothing();
    }
    console.log(`   ✓ ${mongoProfiles.length} client profiles`);

    // ── 4. Suppliers (collection: "guides") ───────────────────────────────────

    console.log("\n🏢 Migrating suppliers...");
    const mongoSuppliers = await mdb.collection("guides").find({}).toArray();
    for (const ch of chunk(mongoSuppliers, BATCH)) {
      await db.insert(suppliers).values(
        ch.map((s) => ({
          id: requireUUID(s._id, "supplier"),
          personalInfo: (s.personalInfo as any) ?? {},
          // Normalise legacy singular address → addresses array
          addresses: Array.isArray(s.addresses) && s.addresses.length > 0
            ? (s.addresses as any)
            : s.address
              ? [{ ...(s.address as any), isPrimary: true }]
              : [],
          contact: (s.contact as any) ?? {},
          experience: (s.experience as any) ?? null,
          billing: (s.billing as any) ?? null,
          contract: (s.contract as any) ?? null,
          cancellationTerms: Array.isArray(s.cancellationTerms) ? (s.cancellationTerms as any) : [],
          amendments: Array.isArray(s.amendments) ? (s.amendments as any) : [],
          locationSupplements: Array.isArray(s.locationSupplements) ? (s.locationSupplements as any) : [],
          languageSupplements: Array.isArray(s.languageSupplements) ? (s.languageSupplements as any) : [],
          docs: (s.docs as any) ?? null,
          serviceConfig: (s.serviceConfig as any) ?? null,
          rating: (s.rating as any) ?? { averageRating: 0, totalReviews: 0 },
          comments: s.comments ? String(s.comments) : null,
          autoBookings: Boolean(s.autoBookings ?? false),
          employee: Boolean(s.employee ?? false),
          status: (s.status as any) ?? "Pending",
          createdBy: s.createdBy ? toUUID(s.createdBy) : null,
          updatedBy: s.updatedBy ? toUUID(s.updatedBy) : null,
          createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
          updatedAt: s.updatedAt ? new Date(s.updatedAt) : new Date(),
        })),
      ).onConflictDoNothing();
    }
    console.log(`   ✓ ${mongoSuppliers.length} suppliers`);

    // ── 5. Products ───────────────────────────────────────────────────────────

    console.log("\n📦 Migrating products...");
    const mongoProducts = await mdb.collection("products").find({}).toArray();
    for (const ch of chunk(mongoProducts, BATCH)) {
      await db.insert(products).values(
        ch.map((p) => ({
          id: requireUUID(p._id, "product"),
          title: String(p.title ?? ""),
          tourTextLanguage: (p.tourTextLanguage as any) ?? "english",
          tourGuideLanguageInstant: Array.isArray(p.tourGuideLanguageInstant) ? p.tourGuideLanguageInstant : [],
          tourGuideLanguageOnRequest: Array.isArray(p.tourGuideLanguageOnRequest) ? p.tourGuideLanguageOnRequest : [],
          images: Array.isArray(p.images) ? p.images : [],
          embeddingStatus: (p.embeddingStatus as any) ?? "pending",
          embeddingLastError: p.embeddingLastError ? String(p.embeddingLastError) : null,
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
          updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        })),
      ).onConflictDoNothing();
    }
    console.log(`   ✓ ${mongoProducts.length} products`);

    // ── 6. Product Variants ───────────────────────────────────────────────────

    console.log("\n🎫 Migrating product variants...");
    const mongoVariants = await mdb.collection("productvariants").find({}).toArray();
    for (const ch of chunk(mongoVariants, BATCH)) {
      const rows = ch.flatMap((v) => {
        const baseProductId = toUUID(v.baseProduct ?? v.baseProductId);
        if (!baseProductId) {
          console.warn(`   ⚠ Skipping variant ${v._id} — baseProduct not in map`);
          return [];
        }
        return [{
          id: requireUUID(v._id, "productVariant"),
          baseProductId,
          url: String(v.url ?? ""),
          productCode: String(v.productCode ?? ""),
          serviceType: (v.serviceType as any) ?? "guide",
          tourType: (v.tourType as any) ?? "private",
          activityType: (v.activityType as any) ?? "city tours",
          subType: (v.subType as any) ?? "walking tours",
          description: String(v.description ?? ""),
          willSee: Array.isArray(v.willSee) ? v.willSee : [],
          willLearn: Array.isArray(v.willLearn) ? v.willLearn : [],
          bookingType: (v.bookingType as any) ?? null,
          tourGuideLanguage: v.tourGuideLanguage ? String(v.tourGuideLanguage) : null,
          mandatoryInformation: Array.isArray(v.mandatoryInformation) ? v.mandatoryInformation : [],
          // Handle typo in old model: recommdendedInformation
          recommendedInformation: Array.isArray(v.recommdendedInformation ?? v.recommendedInformation)
            ? (v.recommdendedInformation ?? v.recommendedInformation)
            : [],
          included: Array.isArray(v.included) ? v.included : [],
          excluded: Array.isArray(v.excluded) ? v.excluded : [],
          activitySuitableFor: (v.activitySuitableFor as any) ?? "all",
          voucherType: (v.voucherType as any) ?? "printed or e-voucher accepted",
          maxPax: Number(v.maxPax ?? 0),
          meetingPoint: (v.meetingPoint as any) ?? {},
          endPoint: (v.endPoint as any) ?? null,
          tags: Array.isArray(v.tags) ? v.tags : [],
          closedDates: Array.isArray(v.closedDates)
            ? v.closedDates.map((d: any) => toDateStr(d)).filter(Boolean)
            : [],
          holidayDates: Array.isArray(v.holidayDates)
            ? v.holidayDates.map((d: any) => toDateStr(d)).filter(Boolean)
            : [],
          availability: (v.availability as any) ?? {},
          cancellationTerms: Array.isArray(v.cancellationTerms) ? v.cancellationTerms : [],
          // Handle typo in old model: realease
          release: String(v.realease ?? v.release ?? ""),
          firstRoundReview: Boolean(v.firstRoundReview ?? false),
          firstRoundReviewRemarks: Array.isArray(v.firstRoundReviewRemarks) ? v.firstRoundReviewRemarks : [],
          secondRoundReview: Boolean(v.secondRoundReview ?? false),
          secondRoundReviewRemarks: Array.isArray(v.secondRoundReviewRemarks) ? v.secondRoundReviewRemarks : [],
          priceModel: (v.priceModel as any) ?? "fixed rate",
          currency: (v.currency as any) ?? "EUR",
          b2bRateInstant: String(v.b2bRateInstant ?? "0"),
          // Handle typo in old model: b2bExtraHourSupplementInsant
          b2bExtraHourSupplementInstant: String(v.b2bExtraHourSupplementInsant ?? v.b2bExtraHourSupplementInstant ?? "0"),
          b2bRateOnRequest: String(v.b2bRateOnRequest ?? "0"),
          b2bExtraHourSupplementOnRequest: String(v.b2bExtraHourSupplementOnRequest ?? "0"),
          b2cRateInstant: String(v.b2cRateInstant ?? "0"),
          b2cExtraHourSupplementInstant: String(v.b2cExtraHourSupplementInstant ?? "0"),
          b2cRateOnRequest: String(v.b2cRateOnRequest ?? "0"),
          b2cExtraHourSupplementOnRequest: String(v.b2cExtraHourSupplementOnRequest ?? "0"),
          publicHolidaySupplementPercent: v.publicHolidaySupplementPercent != null
            ? String(v.publicHolidaySupplementPercent) : null,
          weekendSupplementPercent: v.weekendSupplementPercent != null
            ? String(v.weekendSupplementPercent) : null,
          isB2B: Boolean(v.isB2B ?? true),
          isB2C: Boolean(v.isB2C ?? true),
          overridePriceFromContract: Boolean(v.overridePriceFromContract ?? false),
          isBookingPerProduct: Boolean(v.isBookingPerProduct ?? false),
          createdAt: v.createdAt ? new Date(v.createdAt) : new Date(),
          updatedAt: v.updatedAt ? new Date(v.updatedAt) : new Date(),
        }];
      });
      if (rows.length) await db.insert(productVariants).values(rows).onConflictDoNothing();
    }
    console.log(`   ✓ ${mongoVariants.length} product variants`);

    // ── 7. Product Remarks ────────────────────────────────────────────────────

    console.log("\n💬 Migrating product remarks...");
    const mongoRemarks = await mdb.collection("productremarks").find({}).toArray();
    for (const ch of chunk(mongoRemarks, BATCH)) {
      const rows = ch.flatMap((r) => {
        const productVariantId = toUUID(r.productVariant ?? r.productVariantId);
        const authorId = toUUID(r.author ?? r.authorId);
        if (!productVariantId || !authorId) {
          console.warn(`   ⚠ Skipping remark ${r._id} — missing FK`);
          return [];
        }
        return [{
          id: requireUUID(r._id, "productRemark"),
          productVariantId,
          authorId,
          text: String(r.text ?? ""),
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
          updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
        }];
      });
      if (rows.length) await db.insert(productRemarks).values(rows).onConflictDoNothing();
    }
    console.log(`   ✓ ${mongoRemarks.length} product remarks`);

    // ── 8. Subscriptions ──────────────────────────────────────────────────────

    console.log("\n🔔 Migrating subscriptions...");
    const mongoSubs = await mdb.collection("subscriptions").find({}).toArray();
    for (const ch of chunk(mongoSubs, BATCH)) {
      const rows = ch.flatMap((s) => {
        // Old model used `user` field, not `userId`
        const userId = toUUID(s.user ?? s.userId);
        if (!userId) {
          console.warn(`   ⚠ Skipping subscription ${s._id} — user not in map`);
          return [];
        }
        return [{
          id: requireUUID(s._id, "subscription"),
          userId,
          name: String(s.name ?? ""),
          price: String(s.price ?? "0"),
          frequency: (s.frequency as any) ?? "monthly",
          currency: (s.currency as any) ?? "INR",
          category: (s.category as any) ?? "others",
          paymentMethod: (s.paymentMethod as any) ?? "credit card",
          status: (s.status as any) ?? "active",
          startDate: toDateStr(s.startDate) ?? new Date().toISOString().slice(0, 10),
          renewalDate: toDateStr(s.renewalDate),
          createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
          updatedAt: s.updatedAt ? new Date(s.updatedAt) : new Date(),
        }];
      });
      if (rows.length) await db.insert(subscriptions).values(rows).onConflictDoNothing();
    }
    console.log(`   ✓ ${mongoSubs.length} subscriptions`);

    // ── 9. Conversations + Participants ───────────────────────────────────────

    console.log("\n💭 Migrating conversations...");
    const mongoConvos = await mdb.collection("conversations").find({}).toArray();
    for (const ch of chunk(mongoConvos, BATCH)) {
      await db.insert(conversations).values(
        ch.map((c) => ({
          id: requireUUID(c._id, "conversation"),
          title: String(c.title ?? "Untitled"),
          createdBy: requireUUID(c.createdBy, "conversation.createdBy"),
          // Old model: lastMessage field (singular), new schema: lastMessageId
          lastMessageId: c.lastMessage ? toUUID(c.lastMessage) : null,
          createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
          updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date(),
        })),
      ).onConflictDoNothing();

      // participants array → junction table
      const participantRows = ch.flatMap((c) => {
        const conversationId = requireUUID(c._id, "conversation");
        return (Array.isArray(c.participants) ? c.participants : [])
          .map((pid: any) => toUUID(pid))
          .filter((uid): uid is string => uid !== null)
          .map((userId) => ({ conversationId, userId }));
      });
      for (const pCh of chunk(participantRows, BATCH)) {
        if (pCh.length) await db.insert(conversationParticipants).values(pCh).onConflictDoNothing();
      }
    }
    console.log(`   ✓ ${mongoConvos.length} conversations`);

    // ── 10. Messages ──────────────────────────────────────────────────────────

    console.log("\n✉️  Migrating messages...");
    const mongoMessages = await mdb.collection("messages").find({}).toArray();
    for (const ch of chunk(mongoMessages, BATCH)) {
      const rows = ch.flatMap((m) => {
        const conversationId = toUUID(m.conversationId ?? m.conversation);
        // Old model: sender field, new schema: senderId
        const senderId = toUUID(m.sender ?? m.senderId);
        if (!conversationId || !senderId) {
          console.warn(`   ⚠ Skipping message ${m._id} — missing FK`);
          return [];
        }
        return [{
          id: requireUUID(m._id, "message"),
          conversationId,
          senderId,
          text: String(m.text ?? ""),
          createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
          updatedAt: m.updatedAt ? new Date(m.updatedAt) : new Date(),
        }];
      });
      if (rows.length) await db.insert(messages).values(rows).onConflictDoNothing();
    }
    console.log(`   ✓ ${mongoMessages.length} messages`);

    // ── 11. Bookings + Order Items + Guide Assignments ────────────────────────
    // guideAssignments were embedded inside each orderItem in MongoDB.

    console.log("\n📅 Migrating bookings...");
    const mongoBookings = await mdb.collection("bookings").find({}).toArray();
    let totalItems = 0;
    let totalAssignments = 0;

    for (const bDoc of mongoBookings) {
      const bookingId = requireUUID(bDoc._id, "booking");
      const clientId = toUUID(bDoc.clientId);
      if (!clientId) {
        console.warn(`   ⚠ Skipping booking ${bDoc._id} — clientId not in map`);
        continue;
      }

      await db.insert(bookings).values({
        id: bookingId,
        bookingRef: String(bDoc.bookingRef ?? ""),
        clientId,
        leadFirstName: String(bDoc.leadFirstName ?? ""),
        leadLastName: String(bDoc.leadLastName ?? ""),
        leadEmail: String(bDoc.leadEmail ?? ""),
        leadMobile: (bDoc.leadMobile as any) ?? { countryCode: "", number: "" },
        agencyRef: bDoc.agencyRef ? String(bDoc.agencyRef) : null,
        comments: bDoc.comments ? String(bDoc.comments) : null,
        discountCode: bDoc.discountCode ? String(bDoc.discountCode) : null,
        totalPrice: String(bDoc.totalPrice ?? "0"),
        status: (bDoc.status as any) ?? "pending",
        bookedFrom: (bDoc.bookedFrom as any) ?? "website",
        bookedBy: bDoc.bookedBy ? toUUID(bDoc.bookedBy) : null,
        paymentStatus: (bDoc.paymentStatus as any) ?? "unpaid",
        clientItinerary: (bDoc.clientItinerary as any) ?? null,
        createdAt: bDoc.createdAt ? new Date(bDoc.createdAt) : new Date(),
        updatedAt: bDoc.updatedAt ? new Date(bDoc.updatedAt) : new Date(),
      }).onConflictDoNothing();

      const items: any[] = Array.isArray(bDoc.orderItems) ? bDoc.orderItems : [];
      for (let pos = 0; pos < items.length; pos++) {
        const item = items[pos];
        const productId = toUUID(item.productId);
        if (!productId) {
          console.warn(`   ⚠ Skipping orderItem[${pos}] in booking ${bDoc._id} — productId not in map`);
          continue;
        }

        const orderItemId = randomUUID();

        await db.insert(bookingOrderItems).values({
          id: orderItemId,
          bookingId,
          position: pos,
          productId,
          productTitle: String(item.productTitle ?? ""),
          quantity: Number(item.quantity ?? 1),
          price: String(item.price ?? "0"),
          paxCount: Number(item.paxCount ?? 1),
          meetingPoint: String(item.meetingPoint ?? ""),
          endPoint: String(item.endPoint ?? ""),
          startTime: String(item.startTime ?? ""),
          duration: String(item.duration ?? "0"),
          details: item.details ? String(item.details) : null,
          date: toDateStr(item.date) ?? new Date().toISOString().slice(0, 10),
          operations: (item.operations as any) ?? null,
          guideItinerary: (item.guideItinerary as any) ?? null,
          createdAt: bDoc.createdAt ? new Date(bDoc.createdAt) : new Date(),
          updatedAt: bDoc.updatedAt ? new Date(bDoc.updatedAt) : new Date(),
        }).onConflictDoNothing();
        totalItems++;

        const assignments: any[] = Array.isArray(item.guideAssignments) ? item.guideAssignments : [];
        for (const ga of assignments) {
          const supplierId = toUUID(ga.supplierId);
          if (!supplierId) {
            console.warn(`   ⚠ Skipping guideAssignment — supplierId not in map`);
            continue;
          }
          // guideAssignments had _id: true in the old schema
          const gaId = ga._id ? (idMap.get(String(ga._id)) ?? randomUUID()) : randomUUID();
          await db.insert(guideAssignments).values({
            id: gaId,
            orderItemId,
            supplierId,
            status: (ga.status as any) ?? "invited",
            notes: ga.notes ? String(ga.notes) : null,
            assignedAt: ga.assignedAt ? new Date(ga.assignedAt) : new Date(),
            respondedAt: ga.respondedAt ? new Date(ga.respondedAt) : null,
            assignedBy: ga.assignedBy ? toUUID(ga.assignedBy) : null,
          }).onConflictDoNothing();
          totalAssignments++;
        }
      }
    }
    console.log(`   ✓ ${mongoBookings.length} bookings · ${totalItems} order items · ${totalAssignments} guide assignments`);

    // ── Summary ───────────────────────────────────────────────────────────────

    console.log("\n✅ Migration complete!\n");
    console.log(`   Users              ${mongoUsers.length}`);
    console.log(`   Client profiles    ${mongoProfiles.length}`);
    console.log(`   Suppliers          ${mongoSuppliers.length}`);
    console.log(`   Products           ${mongoProducts.length}`);
    console.log(`   Product variants   ${mongoVariants.length}`);
    console.log(`   Product remarks    ${mongoRemarks.length}`);
    console.log(`   Subscriptions      ${mongoSubs.length}`);
    console.log(`   Conversations      ${mongoConvos.length}`);
    console.log(`   Messages           ${mongoMessages.length}`);
    console.log(`   Bookings           ${mongoBookings.length}`);
    console.log(`   Order items        ${totalItems}`);
    console.log(`   Guide assignments  ${totalAssignments}`);
    console.log("\n⚠️  Run 'npm run seed:pinecone:temp' to re-index products with their new UUIDs.");
  } finally {
    await mongo.close();
    process.exit(0);
  }
}

run().catch((err) => {
  console.error("\n❌ Migration failed:", err);
  process.exit(1);
});
