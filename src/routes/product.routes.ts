import { Router } from "express";
import { addProduct, getProducts } from "../controllers/product.controller.ts";

const productRouter = Router();

productRouter.get("/", getProducts);

productRouter.post("/", addProduct);

export default productRouter;
