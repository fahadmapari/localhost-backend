import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    pax: {
      type: Number,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const bookingSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  leadFirstName: {
    type: String,
    required: true,
  },
  leadLastName: {
    type: String,
    required: true,
  },
  leadEmail: {
    type: String,
    required: true,
  },
  leadMobile: {
    countryCode: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
  },
  agencyRef: {
    type: String,
  },
  comments: {
    type: String,
  },
  orderItems: {
    type: [orderItemSchema],
    required: true,
  },
  discountCode: {
    type: String,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending",
  },
  bookedFrom: {
    type: String,
    enum: ["website", "admin"],
    default: "website",
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
