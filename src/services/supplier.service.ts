import mongoose from "mongoose";
import Supplier from "../models/supplier.model";
import {
  SupplierCreateInput,
  SupplierUpdateInput,
} from "../schema/supplier.schema";
import { createError } from "../utils/errorHandlers";

export const createSupplierService = async (
  data: SupplierCreateInput,
  createdBy: string
) => {
  try {
    const existing = await Supplier.findOne({
      "contact.email": data.contact.email,
    }).lean();
    if (existing) {
      throw createError(
        "A supplier with this email already exists",
        409
      );
    }

    const supplier = await Supplier.create({
      ...data,
      createdBy: new mongoose.Types.ObjectId(createdBy),
    });

    return supplier;
  } catch (error) {
    throw error;
  }
};

export const getAllSuppliersService = async (
  page: number,
  limit: number,
  status?: string
) => {
  try {
    const filter: Record<string, unknown> = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    const [suppliers, total] = await Promise.all([
      Supplier.find(filter)
        .sort({ createdAt: -1 })
        .skip(page * limit)
        .limit(limit)
        .lean(),
      Supplier.countDocuments(filter),
    ]);

    return { suppliers, total };
  } catch (error) {
    throw error;
  }
};

export const getSupplierByIdService = async (id: string) => {
  try {
    const supplier = await Supplier.findById(id).lean();
    if (!supplier) throw createError("Supplier not found", 404);
    return supplier;
  } catch (error) {
    throw error;
  }
};

export const updateSupplierService = async (
  id: string,
  data: SupplierUpdateInput,
  updatedBy: string
) => {
  try {
    if (data.contact?.email) {
      const existing = await Supplier.findOne({
        "contact.email": data.contact.email,
        _id: { $ne: id },
      }).lean();
      if (existing) {
        throw createError(
          "Another supplier already uses this email",
          409
        );
      }
    }

    const supplier = await Supplier.findByIdAndUpdate(
      id,
      {
        $set: {
          ...data,
          updatedBy: new mongoose.Types.ObjectId(updatedBy),
        },
      },
      { new: true, runValidators: true }
    );
    if (!supplier) throw createError("Supplier not found", 404);
    return supplier;
  } catch (error) {
    throw error;
  }
};

export const deleteSupplierService = async (id: string) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(id);
    if (!supplier) throw createError("Supplier not found", 404);
    return supplier;
  } catch (error) {
    throw error;
  }
};

export const searchActiveSuppliersService = async (searchTerm?: string) => {
  try {
    const filter: Record<string, unknown> = { status: "Active" };

    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i");
      filter.$or = [
        { "personalInfo.firstName": regex },
        { "personalInfo.lastName": regex },
        { "contact.email": regex },
      ];
    }

    const suppliers = await Supplier.find(filter)
      .select(
        "personalInfo.firstName personalInfo.lastName contact.email contact.mobile experience.guidingLanguages experience.guidingLocation status"
      )
      .sort({ "personalInfo.firstName": 1 })
      .limit(50)
      .lean();

    return suppliers;
  } catch (error) {
    throw error;
  }
};
