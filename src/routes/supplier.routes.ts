import { Router } from "express";
import {
  createSupplierController,
  deleteSupplierController,
  getSupplierByIdController,
  getSuppliersController,
  searchSuppliersController,
  updateSupplierController,
} from "../controllers/supplier.controller";
import {
  authorizationMiddleware,
  isAdminMiddleware,
} from "../middlewares/auth.middleware";

const supplierRouter = Router();

supplierRouter.get(
  "/",
  authorizationMiddleware,
  isAdminMiddleware,
  getSuppliersController
);

supplierRouter.get(
  "/search",
  authorizationMiddleware,
  isAdminMiddleware,
  searchSuppliersController
);

supplierRouter.get(
  "/:id",
  authorizationMiddleware,
  isAdminMiddleware,
  getSupplierByIdController
);

supplierRouter.post(
  "/",
  authorizationMiddleware,
  isAdminMiddleware,
  createSupplierController
);

supplierRouter.patch(
  "/:id",
  authorizationMiddleware,
  isAdminMiddleware,
  updateSupplierController
);

supplierRouter.delete(
  "/:id",
  authorizationMiddleware,
  isAdminMiddleware,
  deleteSupplierController
);

export default supplierRouter;
