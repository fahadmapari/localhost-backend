import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { connectDB } from "../db/mongoDB";
import Booking from "../models/booking.models";
import { ProductVariant } from "../models/product.model";
import { ClientProfile } from "../models/profile.model";
import User from "../models/user.model";

const BOOKING_REF_PREFIX = "TRV-";

const STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;
const PAYMENT_STATUSES = ["unpaid", "paid", "partiallyPaid"] as const;

const pick = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomDateWithinDays = (minDays: number, maxDays: number) => {
  const offsetDays = randomInt(minDays, maxDays);
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d;
};

async function seedBookings() {
  await connectDB();

  try {
    const seedCount = Number(process.env.SEED_COUNT ?? 12);

    const [clients, variants, adminUser] = await Promise.all([
      ClientProfile.find({}).lean(),
      ProductVariant.find({}).populate("baseProduct").lean(),
      User.findOne({ role: { $in: ["admin", "super admin"] } }).lean(),
    ]);

    if (clients.length === 0) {
      throw new Error("No ClientProfile docs found — cannot seed bookings.");
    }
    if (variants.length === 0) {
      throw new Error("No ProductVariant docs found — cannot seed bookings.");
    }
    if (!adminUser) {
      throw new Error(
        "No admin/super admin User found — cannot seed bookings."
      );
    }

    const usableVariants = variants.filter(
      (v: any) =>
        v.baseProduct?._id &&
        v.baseProduct?.title &&
        v.meetingPoint?.text &&
        v.availability?.startTime &&
        v.availability?.duration?.value
    );

    if (usableVariants.length === 0) {
      throw new Error(
        "No ProductVariants with required fields (baseProduct, meetingPoint, availability)."
      );
    }

    const bookingsToInsert = Array.from({ length: seedCount }, (_, i) => {
      const status = STATUSES[i % STATUSES.length];
      const isPast = status === "completed" || status === "cancelled";
      const client = pick(clients) as any;

      const itemCount = randomInt(1, 3);
      const orderItems = Array.from({ length: itemCount }, () => {
        const variant = pick(usableVariants) as any;
        const base = variant.baseProduct;
        const price = variant.b2bRateInstant ?? variant.b2cRateInstant ?? 100;
        return {
          productId: base._id,
          productTitle: base.title,
          quantity: randomInt(1, 3),
          price,
          paxCount: randomInt(2, 6),
          meetingPoint: variant.meetingPoint.text,
          endPoint: variant.endPoint?.text ?? variant.meetingPoint.text,
          startTime: variant.availability.startTime,
          duration: variant.availability.duration.value,
          details: "Seeded order item",
          date: isPast
            ? randomDateWithinDays(-90, -1)
            : randomDateWithinDays(1, 90),
        };
      });

      const totalPrice = orderItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      return {
        bookingRef: BOOKING_REF_PREFIX + nanoid(8).toUpperCase(),
        clientId: client._id,
        leadFirstName: client.firstName,
        leadLastName: client.lastName,
        leadEmail: client.email,
        leadMobile: {
          countryCode: client.mobile?.code ?? "+1",
          number: client.mobile?.number ?? "5555550100",
        },
        orderItems,
        totalPrice,
        status,
        bookedFrom: "admin",
        bookedBy: adminUser._id,
        paymentStatus: pick(PAYMENT_STATUSES),
        comments: `Seeded booking #${i + 1}`,
      };
    });

    const inserted = await Booking.insertMany(bookingsToInsert);
    console.log(`Inserted ${inserted.length} bookings.`);
  } finally {
    await mongoose.disconnect();
  }
}

seedBookings().catch((error) => {
  console.error("Failed to seed bookings", error);
  process.exit(1);
});
