import path from "path";
import { randomUUID } from "crypto";
import mongoose from "mongoose";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import Supplier, { STANDARD_RATE_TIER_HOURS } from "../models/supplier.model";
import s3Client from "../config/s3";
import { S3_BUCKET_NAME } from "../config/env";
import {
  SupplierCreateInput,
  SupplierUpdateInput,
} from "../schema/supplier.schema";
import { createError } from "../utils/errorHandlers";

const seedRateTiers = (
  tiers: SupplierCreateInput["contract"]["rateTiers"]
) => {
  const provided = tiers ?? [];
  if (provided.length > 0) return provided;
  return STANDARD_RATE_TIER_HOURS.map((hours) => ({ hours, rate: undefined }));
};

const uploadSupplierFileToS3 = async (
  file: Express.Multer.File,
  supplierId: string,
  kind: "photo" | "cv"
): Promise<{ key: string }> => {
  const ext = path.extname(file.originalname);
  const key = `suppliers/${supplierId}/${kind}-${randomUUID()}${ext}`;
  await s3Client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );
  return { key };
};

const deleteS3Object = async (key: string) => {
  try {
    await s3Client.send(
      new DeleteObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key })
    );
  } catch {
    // Best-effort deletion.
  }
};

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
      contract: {
        ...data.contract,
        rateTiers: seedRateTiers(data.contract.rateTiers),
      },
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
  status?: string,
  searchTerm?: string
) => {
  try {
    const filter: Record<string, unknown> = {};
    if (status && status !== "all") {
      filter.status = status;
    }
    if (searchTerm) {
      const regex = new RegExp(
        searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );
      filter.$or = [
        { "personalInfo.firstName": regex },
        { "personalInfo.lastName": regex },
        { "contact.email": regex },
      ];
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
    if (supplier.docs?.photoUpload) await deleteS3Object(supplier.docs.photoUpload);
    if (supplier.docs?.cvUpload) await deleteS3Object(supplier.docs.cvUpload);
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

export const uploadSupplierPhotoService = async (
  id: string,
  file: Express.Multer.File,
  updatedBy: string
) => {
  const supplier = await Supplier.findById(id);
  if (!supplier) throw createError("Supplier not found", 404);

  const previous = supplier.docs?.photoUpload;
  const { key } = await uploadSupplierFileToS3(file, id, "photo");

  supplier.set("docs.photoUpload", key);
  supplier.set("updatedBy", new mongoose.Types.ObjectId(updatedBy));
  await supplier.save();

  if (previous) await deleteS3Object(previous);
  return { key };
};

export const uploadSupplierCvService = async (
  id: string,
  file: Express.Multer.File,
  updatedBy: string
) => {
  const supplier = await Supplier.findById(id);
  if (!supplier) throw createError("Supplier not found", 404);

  const previous = supplier.docs?.cvUpload;
  const { key } = await uploadSupplierFileToS3(file, id, "cv");

  supplier.set("docs.cvUpload", key);
  supplier.set("updatedBy", new mongoose.Types.ObjectId(updatedBy));
  await supplier.save();

  if (previous) await deleteS3Object(previous);
  return { key };
};

export const deleteSupplierPhotoService = async (
  id: string,
  updatedBy: string
) => {
  const supplier = await Supplier.findById(id);
  if (!supplier) throw createError("Supplier not found", 404);
  const previous = supplier.docs?.photoUpload;
  supplier.set("docs.photoUpload", undefined);
  supplier.set("updatedBy", new mongoose.Types.ObjectId(updatedBy));
  await supplier.save();
  if (previous) await deleteS3Object(previous);
  return { success: true };
};

export const deleteSupplierCvService = async (
  id: string,
  updatedBy: string
) => {
  const supplier = await Supplier.findById(id);
  if (!supplier) throw createError("Supplier not found", 404);
  const previous = supplier.docs?.cvUpload;
  supplier.set("docs.cvUpload", undefined);
  supplier.set("updatedBy", new mongoose.Types.ObjectId(updatedBy));
  await supplier.save();
  if (previous) await deleteS3Object(previous);
  return { success: true };
};
