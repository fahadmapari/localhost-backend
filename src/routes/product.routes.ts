import { Router } from "express";
import { addProduct, getProducts } from "../controllers/product.controller";

const productRouter = Router();

productRouter.get("/", getProducts);

productRouter.post("/", addProduct);

export default productRouter;
