import mongoose from "mongoose";

interface ISubscription {
  name: string;
  price: number;
  frequency: string;
  currency: string;
  category: string;
  paymentMethod: string;
  status: string;
  startDate: Date;
  renewalDate: Date;
  user: mongoose.Types.ObjectId;
}

const subscriptionSchema = new mongoose.Schema<ISubscription>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [100, "Name must be at most 50 characters long"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      default: "monthly",
    },
    currency: {
      type: String,
      enum: ["USD", "EUR", "GBP", "INR"],
      default: "INR",
    },
    category: {
      type: String,
      enum: ["sports", "entertainment", "travel", "others", "food"],
      default: "others",
      required: [true, "Category is required"],
    },
    paymentMethod: {
      type: String,
      enum: ["credit card", "net banking", "paypal", "cash"],
      default: "Credit Card",
      required: [true, "Payment Method is required"],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "cancelled"],
      default: "active",
    },
    startDate: {
      type: Date,
      required: [true, "Start Date is required"],
      validate: {
        validator: function (v: Date) {
          return v < new Date();
        },
        message: "Start Date cannot be in future",
      },
    },
    renewalDate: {
      type: Date,
      validate: {
        validator: function (v: Date) {
          return v > this.startDate;
        },
        message: "Renewal Date cannot be before Start Date",
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.pre("save", function (next) {
  if (!this.renewalDate) {
    this.renewalDate = this.startDate;

    const renewalPeriods: Record<string, number> = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      yearly: 365,
    };

    this.renewalDate.setDate(
      this.renewalDate.getDate() + renewalPeriods[this.frequency]
    );

    if (this.renewalDate > new Date()) {
      this.status = "expired";
    }
  }

  next();
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
