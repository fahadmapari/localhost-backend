import { nanoid } from "nanoid";
import { db, connectDB } from "@/db";
import { bookings, bookingOrderItems, users } from "@/db/schema";
import { eq, or } from "drizzle-orm";

const BOOKING_REF_PREFIX = "TRV-";

const STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;
const PAYMENT_STATUSES = ["unpaid", "paid", "partiallyPaid"] as const;

const pick = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomDateWithinDays = (minDays: number, maxDays: number): string => {
  const offsetDays = randomInt(minDays, maxDays);
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

async function seedBookings() {
  await connectDB();

  try {
    const seedCount = Number(process.env.SEED_COUNT ?? 12);

    const [clients, variants, adminUser] = await Promise.all([
      db.query.clientProfiles.findMany(),
      db.query.productVariants.findMany({ with: { baseProduct: true } }),
      db.query.users.findFirst({
        where: or(eq(users.role, "admin"), eq(users.role, "super admin")),
      }),
    ]);

    if (clients.length === 0) {
      throw new Error("No client_profiles rows found — cannot seed bookings.");
    }
    if (variants.length === 0) {
      throw new Error("No product_variants rows found — cannot seed bookings.");
    }
    if (!adminUser) {
      throw new Error("No admin/super admin user found — cannot seed bookings.");
    }

    const usableVariants = variants.filter((v) => {
      const mp = v.meetingPoint as any;
      const av = v.availability as any;
      return v.baseProduct?.id && v.baseProduct?.title && mp?.text && av?.startTime && av?.duration?.value;
    });

    if (usableVariants.length === 0) {
      throw new Error("No product_variants with required fields (baseProduct, meetingPoint, availability).");
    }

    let inserted = 0;

    for (let i = 0; i < seedCount; i++) {
      const status = STATUSES[i % STATUSES.length];
      const isPast = status === "completed" || status === "cancelled";
      const client = pick(clients);
      const mobile = client.mobile as any;

      const [booking] = await db
        .insert(bookings)
        .values({
          bookingRef: BOOKING_REF_PREFIX + nanoid(8).toUpperCase(),
          clientId: client.id,
          leadFirstName: client.firstName,
          leadLastName: client.lastName,
          leadEmail: client.email,
          leadMobile: {
            countryCode: mobile?.code ?? "+1",
            number: mobile?.number ?? "5555550100",
          },
          totalPrice: "0",
          status,
          bookedFrom: "admin",
          bookedBy: adminUser.id,
          paymentStatus: pick(PAYMENT_STATUSES),
          comments: `Seeded booking #${i + 1}`,
        })
        .returning();

      const itemCount = randomInt(1, 3);
      let totalPrice = 0;

      for (let j = 0; j < itemCount; j++) {
        const variant = pick(usableVariants);
        const base = variant.baseProduct!;
        const mp = variant.meetingPoint as any;
        const ep = variant.endPoint as any;
        const av = variant.availability as any;
        const price = parseFloat(String(variant.b2bRateInstant ?? variant.b2cRateInstant ?? "100"));
        const quantity = randomInt(1, 3);
        totalPrice += price * quantity;

        await db.insert(bookingOrderItems).values({
          bookingId: booking.id,
          position: j,
          productId: base.id,
          productTitle: base.title,
          quantity,
          price: price.toString(),
          paxCount: randomInt(2, 6),
          meetingPoint: mp?.text ?? "",
          endPoint: ep?.text ?? mp?.text ?? "",
          startTime: av?.startTime ?? "09:00",
          duration: String(av?.duration?.value ?? 2),
          details: "Seeded order item",
          date: isPast ? randomDateWithinDays(-90, -1) : randomDateWithinDays(1, 90),
        });
      }

      await db
        .update(bookings)
        .set({ totalPrice: totalPrice.toString() })
        .where(eq(bookings.id, booking.id));

      inserted++;
    }

    console.log(`Inserted ${inserted} bookings.`);
  } finally {
    process.exit(0);
  }
}

seedBookings().catch((error) => {
  console.error("Failed to seed bookings", error);
  process.exit(1);
});
