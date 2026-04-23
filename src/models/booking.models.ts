import mongoose from "mongoose";

const itineraryFileSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { _id: false }
);

const guideAssignmentSchema = new mongoose.Schema(
  {
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    status: {
      type: String,
      enum: ["invited", "confirmed", "declined", "completed"],
      default: "invited",
    },
    notes: { type: String },
    assignedAt: { type: Date, default: Date.now },
    respondedAt: { type: Date },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { _id: true, timestamps: false }
);

const orderItemOperationsSchema = new mongoose.Schema(
  {
    internalComment: { type: String },
    accountingComment: { type: String },
    transportDetails: { type: String },
    supplierRemark: { type: String },
    finalDetailsToProvider: { type: Boolean, default: false },
    finalDetailsByEmail: { type: Boolean, default: false },
    finalDetailsToClient: { type: Boolean, default: false },
    controlCallPicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    picId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productTitle: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    paxCount: {
      type: Number,
      required: true,
    },
    meetingPoint: {
      type: String,
      required: true,
    },
    endPoint: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    details: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
    },
    operations: {
      type: orderItemOperationsSchema,
      default: () => ({}),
    },
    guideItinerary: {
      type: itineraryFileSchema,
      default: null,
    },
    guideAssignments: {
      type: [guideAssignmentSchema],
      default: [],
    },
  },
  {
    _id: false,
  }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingRef: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
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
      number: {
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
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "partiallyPaid"],
      default: "unpaid",
    },
    clientItinerary: {
      type: itineraryFileSchema,
      default: null,
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
