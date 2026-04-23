import mongoose from "mongoose";
import ProductRemark from "../models/product-remark.model";
import { createError } from "../utils/errorHandlers";

export const listProductRemarksService = async (productId: string) => {
  try {
    const remarks = await ProductRemark.find({ productId })
      .sort({ createdAt: -1 })
      .populate("authorId", "name email role")
      .lean();
    return remarks;
  } catch (error) {
    throw error;
  }
};

export const createProductRemarkService = async (
  productId: string,
  text: string,
  authorId: string
) => {
  try {
    const remark = await ProductRemark.create({
      productId: new mongoose.Types.ObjectId(productId),
      authorId: new mongoose.Types.ObjectId(authorId),
      text,
    });

    const populated = await ProductRemark.findById(remark._id)
      .populate("authorId", "name email role")
      .lean();

    return populated;
  } catch (error) {
    throw error;
  }
};

export const deleteProductRemarkService = async (
  remarkId: string,
  requesterId: string,
  requesterRole: string
) => {
  try {
    const remark = await ProductRemark.findById(remarkId);
    if (!remark) throw createError("Remark not found", 404);

    const isOwner = remark.authorId.toString() === requesterId;
    const isSuperAdmin = requesterRole === "super admin";
    if (!isOwner && !isSuperAdmin) {
      throw createError(
        "You can only delete your own remarks",
        403
      );
    }

    await ProductRemark.deleteOne({ _id: remarkId });
    return { _id: remarkId };
  } catch (error) {
    throw error;
  }
};
