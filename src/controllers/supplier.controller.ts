import { ExpressController } from "../types/controller.types";
import {
  supplierCreateSchema,
  supplierUpdateSchema,
} from "../schema/supplier.schema";
import {
  createSupplierService,
  deleteSupplierCvService,
  deleteSupplierPhotoService,
  deleteSupplierService,
  getAllSuppliersService,
  getSupplierByIdService,
  searchActiveSuppliersService,
  updateSupplierService,
  uploadSupplierCvService,
  uploadSupplierPhotoService,
} from "../services/supplier.service";
import { sendResponse } from "../utils/controller";
import { createError } from "../utils/errorHandlers";

export const createSupplierController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user) throw createError("Unauthorized", 401);

    const parsedBody = supplierCreateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return sendResponse(res, {
        message: "Invalid Fields",
        statusCode: 400,
        data: { error: parsedBody.error },
      });
    }

    const supplier = await createSupplierService(parsedBody.data, req.user.id);

    sendResponse(res, {
      message: "Supplier created successfully",
      statusCode: 201,
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
};

export const getSuppliersController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    const { page = 0, limit = 15, status, q } = req.query;
    const data = await getAllSuppliersService(
      Number(page),
      Number(limit) < 100 ? Number(limit) : 100,
      typeof status === "string" ? status : undefined,
      typeof q === "string" ? q.trim() || undefined : undefined
    );

    sendResponse(res, {
      message: "Suppliers fetched successfully",
      statusCode: 200,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getSupplierByIdController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    if (!req.params.id) throw createError("Supplier id is required", 400);
    const supplier = await getSupplierByIdService(req.params.id);
    sendResponse(res, {
      message: "Supplier fetched successfully",
      statusCode: 200,
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSupplierController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user) throw createError("Unauthorized", 401);
    if (!req.params.id) throw createError("Supplier id is required", 400);

    const parsedBody = supplierUpdateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return sendResponse(res, {
        message: "Invalid Fields",
        statusCode: 400,
        data: { error: parsedBody.error },
      });
    }

    const supplier = await updateSupplierService(
      req.params.id,
      parsedBody.data,
      req.user.id
    );

    sendResponse(res, {
      message: "Supplier updated successfully",
      statusCode: 200,
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSupplierController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    if (!req.params.id) throw createError("Supplier id is required", 400);
    await deleteSupplierService(req.params.id);
    sendResponse(res, {
      message: "Supplier deleted successfully",
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

export const searchSuppliersController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    const { q } = req.query;
    const suppliers = await searchActiveSuppliersService(
      typeof q === "string" ? q : undefined
    );
    sendResponse(res, {
      message: "Suppliers fetched successfully",
      statusCode: 200,
      data: suppliers,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadSupplierPhotoController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user) throw createError("Unauthorized", 401);
    if (!req.params.id) throw createError("Supplier id is required", 400);
    if (!req.file) throw createError("Photo file is required", 400);

    const result = await uploadSupplierPhotoService(
      req.params.id,
      req.file,
      req.user.id
    );
    sendResponse(res, {
      message: "Photo uploaded successfully",
      statusCode: 200,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadSupplierCvController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user) throw createError("Unauthorized", 401);
    if (!req.params.id) throw createError("Supplier id is required", 400);
    if (!req.file) throw createError("CV file is required", 400);

    const result = await uploadSupplierCvService(
      req.params.id,
      req.file,
      req.user.id
    );
    sendResponse(res, {
      message: "CV uploaded successfully",
      statusCode: 200,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSupplierPhotoController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user) throw createError("Unauthorized", 401);
    if (!req.params.id) throw createError("Supplier id is required", 400);

    await deleteSupplierPhotoService(req.params.id, req.user.id);
    sendResponse(res, {
      message: "Photo removed successfully",
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSupplierCvController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user) throw createError("Unauthorized", 401);
    if (!req.params.id) throw createError("Supplier id is required", 400);

    await deleteSupplierCvService(req.params.id, req.user.id);
    sendResponse(res, {
      message: "CV removed successfully",
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};
