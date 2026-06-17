/**
 * One-off migration: legacy Supplier shape → TRAVMONDE-aligned shape.
 *
 * Usage (dry-run by default):
 *   npx tsx src/scripts/migrate-suppliers.ts
 *   npx tsx src/scripts/migrate-suppliers.ts --apply
 *
 * Transforms applied per document:
 *   - address (singular object)                 → addresses: [<same>], isPrimary=true
 *   - personalInfo.availabilityTime (string)    → [] (old enum values don't map to new ones)
 *   - personalInfo.typeOfServicesProvided (str) → [] (old values were tour categories, not service roles)
 *   - contact.whatsapp (string)                 → { code: "", number: <string> }
 *   - experience.guidingLocation  ([string])    → [{ location }]
 *   - experience.guidingLanguages ([string])    → [{ language }]
 *   - contract.rateTiers (absent)               → seeded with 15 standard buckets (rate undefined)
 *   - cancellationTerms ({hours, days1, days2}) → [{ type, value, percentage }, …]
 *   - amendments ({canBeAddedByClicking,…})     → []
 *   - locationSupplement (object)               → dropped; locationSupplements = []
 *   - languageSupplement (object)               → dropped; languageSupplements = []
 *
 * Fields that don't exist in legacy docs (title, transportationDetail, maxPax) remain undefined.
 */

import mongoose from "mongoose";
import { connectDB } from "../db/mongoDB";
import { STANDARD_RATE_TIER_HOURS } from "../models/supplier.model";

const APPLY = process.argv.includes("--apply");

type LegacyAddress = {
  streetAndNumber?: string;
  city?: string;
  municipality?: string;
  district?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isPrimary?: boolean;
};

type LegacyCancellationBucket = {
  percentage?: number | null;
  days?: number | null;
};

type LegacySupplier = {
  _id: mongoose.Types.ObjectId;
  personalInfo?: {
    availabilityTime?: string | string[];
    typeOfServicesProvided?: string | string[];
    [k: string]: unknown;
  };
  address?: LegacyAddress;
  addresses?: LegacyAddress[];
  contact?: {
    whatsapp?: string | { code?: string; number?: string };
    [k: string]: unknown;
  };
  experience?: {
    guidingLocation?: unknown;
    guidingLanguages?: unknown;
    [k: string]: unknown;
  };
  contract?: {
    rateTiers?: { hours: number; rate?: number }[];
    [k: string]: unknown;
  };
  cancellationTerms?:
    | {
        hours?: LegacyCancellationBucket;
        days1?: LegacyCancellationBucket;
        days2?: LegacyCancellationBucket;
      }
    | unknown[];
  amendments?: unknown;
  locationSupplement?: unknown;
  languageSupplement?: unknown;
  locationSupplements?: unknown[];
  languageSupplements?: unknown[];
};

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === "string");

const normaliseCancellationTerms = (
  legacy: LegacySupplier["cancellationTerms"]
): { type: "Hours" | "Days"; value: number; percentage?: number }[] => {
  if (!legacy || Array.isArray(legacy)) {
    // Already array-shaped (or absent): no conversion needed.
    return Array.isArray(legacy)
      ? (legacy as {
          type: "Hours" | "Days";
          value: number;
          percentage?: number;
        }[])
      : [];
  }
  const out: { type: "Hours" | "Days"; value: number; percentage?: number }[] =
    [];
  const push = (bucket: LegacyCancellationBucket | undefined, kind: "Hours" | "Days") => {
    if (!bucket) return;
    const value = bucket.days ?? undefined;
    const percentage = bucket.percentage ?? undefined;
    if (value == null && percentage == null) return;
    out.push({
      type: kind,
      value: value ?? 0,
      ...(percentage != null ? { percentage } : {}),
    });
  };
  push(legacy.hours, "Hours");
  push(legacy.days1, "Days");
  push(legacy.days2, "Days");
  return out;
};

const transform = (doc: LegacySupplier) => {
  const set: Record<string, unknown> = {};
  const unset: Record<string, ""> = {};

  // addresses ---------------------------------------------------------------
  if (!Array.isArray(doc.addresses) || doc.addresses.length === 0) {
    if (isPlainObject(doc.address)) {
      set["addresses"] = [{ ...doc.address, isPrimary: true }];
    } else {
      set["addresses"] = [];
    }
  }
  if (doc.address !== undefined) unset["address"] = "";

  // personalInfo.availabilityTime (string → []) -----------------------------
  if (
    doc.personalInfo?.availabilityTime !== undefined &&
    !Array.isArray(doc.personalInfo.availabilityTime)
  ) {
    set["personalInfo.availabilityTime"] = [];
  }

  // personalInfo.typeOfServicesProvided (string → []) -----------------------
  if (
    doc.personalInfo?.typeOfServicesProvided !== undefined &&
    !Array.isArray(doc.personalInfo.typeOfServicesProvided)
  ) {
    set["personalInfo.typeOfServicesProvided"] = [];
  }

  // contact.whatsapp (string → {code, number}) ------------------------------
  if (typeof doc.contact?.whatsapp === "string") {
    set["contact.whatsapp"] = {
      code: "",
      number: doc.contact.whatsapp,
    };
  }

  // experience.guidingLocation ([string] → [{location}]) --------------------
  if (isStringArray(doc.experience?.guidingLocation)) {
    set["experience.guidingLocation"] = (
      doc.experience!.guidingLocation as string[]
    ).map((location) => ({ location }));
  }

  // experience.guidingLanguages ([string] → [{language}]) -------------------
  if (isStringArray(doc.experience?.guidingLanguages)) {
    set["experience.guidingLanguages"] = (
      doc.experience!.guidingLanguages as string[]
    ).map((language) => ({ language }));
  }

  // contract.rateTiers (seed 15 buckets if absent) --------------------------
  if (!Array.isArray(doc.contract?.rateTiers) || doc.contract!.rateTiers.length === 0) {
    set["contract.rateTiers"] = STANDARD_RATE_TIER_HOURS.map((hours) => ({
      hours,
    }));
  }

  // cancellationTerms ({…} → [...]) -----------------------------------------
  if (isPlainObject(doc.cancellationTerms)) {
    set["cancellationTerms"] = normaliseCancellationTerms(doc.cancellationTerms);
  }

  // amendments ({…} → []) ---------------------------------------------------
  if (isPlainObject(doc.amendments)) {
    set["amendments"] = [];
  }

  // locationSupplement / languageSupplement (obj → drop + plural empty) ----
  if (doc.locationSupplement !== undefined) {
    unset["locationSupplement"] = "";
    if (!Array.isArray(doc.locationSupplements)) {
      set["locationSupplements"] = [];
    }
  }
  if (doc.languageSupplement !== undefined) {
    unset["languageSupplement"] = "";
    if (!Array.isArray(doc.languageSupplements)) {
      set["languageSupplements"] = [];
    }
  }

  return { set, unset };
};

const run = async () => {
  await connectDB();

  const collection = mongoose.connection.collection("guides");
  const cursor = collection.find<LegacySupplier>({});

  let total = 0;
  let changed = 0;
  const ops: mongoose.mongo.AnyBulkWriteOperation[] = [];

  for await (const doc of cursor) {
    total += 1;
    const { set, unset } = transform(doc);

    const hasSet = Object.keys(set).length > 0;
    const hasUnset = Object.keys(unset).length > 0;
    if (!hasSet && !hasUnset) continue;

    changed += 1;
    const update: Record<string, unknown> = {};
    if (hasSet) update.$set = set;
    if (hasUnset) update.$unset = unset;

    if (!APPLY && changed <= 3) {
      console.log(
        `[dry-run] _id=${doc._id} →`,
        JSON.stringify(update, null, 2)
      );
    }

    ops.push({
      updateOne: {
        filter: { _id: doc._id },
        update: update as mongoose.mongo.UpdateFilter<mongoose.mongo.Document>,
      },
    });
  }

  console.log(
    `\nScanned ${total} supplier(s); ${changed} require migration.${
      APPLY ? "" : " (dry-run — pass --apply to commit)"
    }`
  );

  if (APPLY && ops.length > 0) {
    const result = await collection.bulkWrite(ops, { ordered: false });
    console.log(
      `Applied: matched=${result.matchedCount} modified=${result.modifiedCount}`
    );
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
