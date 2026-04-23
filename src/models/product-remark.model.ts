import mongoose, { InferSchemaType } from "mongoose";

const productRemarkSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
      index: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

productRemarkSchema.index({ productId: 1, createdAt: -1 });

export type ProductRemarkDocument = InferSchemaType<
  typeof productRemarkSchema
>;

const ProductRemark = mongoose.model("ProductRemark", productRemarkSchema);

export default ProductRemark;
