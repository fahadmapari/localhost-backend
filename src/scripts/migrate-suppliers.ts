/**
 * One-off migration: normalise legacy-shaped supplier JSONB fields in PostgreSQL.
 *
 * Usage (dry-run by default):
 *   npx tsx src/scripts/migrate-suppliers.ts
 *   npx tsx src/scripts/migrate-suppliers.ts --apply
 *
 * Transforms applied per row:
 *   - personalInfo.availabilityTime (string)    → []
 *   - personalInfo.typeOfServicesProvided (str) → []
 *   - contact.whatsapp (string)                 → { code: "", number: <string> }
 *   - experience.guidingLocation  ([string])    → [{ location }]
 *   - experience.guidingLanguages ([string])    → [{ language }]
 *   - contract.rateTiers (absent/empty)         → seeded with 15 standard buckets
 *   - cancellationTerms ({hours, days1, days2}) → [{ type, value, percentage }, …]
 *   - amendments ({…})                          → []
 *   - locationSupplements (non-array)           → []
 *   - languageSupplements (non-array)           → []
 */

import { db, connectDB } from "@/db";
import { suppliers } from "@/db/schema";
import { STANDARD_RATE_TIER_HOURS } from "@/config/constants";
import { eq } from "drizzle-orm";

const APPLY = process.argv.includes("--apply");

type CancellationBucket = { percentage?: number | null; days?: number | null };
type LegacyCancellationTerms =
  | { hours?: CancellationBucket; days1?: CancellationBucket; days2?: CancellationBucket }
  | unknown[];

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === "string");

const normaliseCancellationTerms = (
  legacy: LegacyCancellationTerms
): { type: "Hours" | "Days"; value: number; percentage?: number }[] => {
  if (!legacy || Array.isArray(legacy)) {
    return Array.isArray(legacy)
      ? (legacy as { type: "Hours" | "Days"; value: number; percentage?: number }[])
      : [];
  }
  const out: { type: "Hours" | "Days"; value: number; percentage?: number }[] = [];
  const push = (bucket: CancellationBucket | undefined, kind: "Hours" | "Days") => {
    if (!bucket) return;
    const value = bucket.days ?? undefined;
    const percentage = bucket.percentage ?? undefined;
    if (value == null && percentage == null) return;
    out.push({ type: kind, value: value ?? 0, ...(percentage != null ? { percentage } : {}) });
  };
  push((legacy as any).hours, "Hours");
  push((legacy as any).days1, "Days");
  push((legacy as any).days2, "Days");
  return out;
};

type SupplierUpdates = {
  personalInfo?: unknown;
  contact?: unknown;
  experience?: unknown;
  contract?: unknown;
  cancellationTerms?: unknown;
  amendments?: unknown;
  locationSupplements?: unknown;
  languageSupplements?: unknown;
};

const computeUpdates = (row: typeof suppliers.$inferSelect): SupplierUpdates | null => {
  const updates: SupplierUpdates = {};

  // personalInfo.availabilityTime / typeOfServicesProvided
  const pi = row.personalInfo as any;
  let piUpdated = { ...pi };
  let piChanged = false;
  if (pi?.availabilityTime !== undefined && !Array.isArray(pi.availabilityTime)) {
    piUpdated = { ...piUpdated, availabilityTime: [] };
    piChanged = true;
  }
  if (pi?.typeOfServicesProvided !== undefined && !Array.isArray(pi.typeOfServicesProvided)) {
    piUpdated = { ...piUpdated, typeOfServicesProvided: [] };
    piChanged = true;
  }
  if (piChanged) updates.personalInfo = piUpdated;

  // contact.whatsapp
  const ct = row.contact as any;
  if (typeof ct?.whatsapp === "string") {
    updates.contact = { ...ct, whatsapp: { code: "", number: ct.whatsapp } };
  }

  // experience.guidingLocation / guidingLanguages
  const exp = row.experience as any;
  let expUpdated = { ...exp };
  let expChanged = false;
  if (isStringArray(exp?.guidingLocation)) {
    expUpdated = { ...expUpdated, guidingLocation: exp.guidingLocation.map((loc: string) => ({ location: loc })) };
    expChanged = true;
  }
  if (isStringArray(expUpdated?.guidingLanguages)) {
    expUpdated = { ...expUpdated, guidingLanguages: expUpdated.guidingLanguages.map((lang: string) => ({ language: lang })) };
    expChanged = true;
  }
  if (expChanged) updates.experience = expUpdated;

  // contract.rateTiers
  const contract = row.contract as any;
  if (!Array.isArray(contract?.rateTiers) || contract.rateTiers.length === 0) {
    updates.contract = { ...contract, rateTiers: STANDARD_RATE_TIER_HOURS.map((hours) => ({ hours })) };
  }

  // cancellationTerms
  const terms = row.cancellationTerms;
  if (isPlainObject(terms)) {
    updates.cancellationTerms = normaliseCancellationTerms(terms as LegacyCancellationTerms);
  } else if (!Array.isArray(terms)) {
    updates.cancellationTerms = [];
  }

  // amendments
  if (isPlainObject(row.amendments)) {
    updates.amendments = [];
  }

  // locationSupplements / languageSupplements
  if (!Array.isArray(row.locationSupplements)) updates.locationSupplements = [];
  if (!Array.isArray(row.languageSupplements)) updates.languageSupplements = [];

  return Object.keys(updates).length > 0 ? updates : null;
};

const run = async () => {
  await connectDB();

  const rows = await db.query.suppliers.findMany();

  let total = 0;
  let changed = 0;

  for (const row of rows) {
    total++;
    const updates = computeUpdates(row);
    if (!updates) continue;

    changed++;

    if (!APPLY && changed <= 3) {
      console.log(`[dry-run] id=${row.id} →`, JSON.stringify(updates, null, 2));
    }

    if (APPLY) {
      await db.update(suppliers).set(updates).where(eq(suppliers.id, row.id));
    }
  }

  console.log(
    `\nScanned ${total} supplier(s); ${changed} require migration.${
      APPLY ? ` Applied.` : " (dry-run — pass --apply to commit)"
    }`
  );

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
