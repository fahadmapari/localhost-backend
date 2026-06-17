import { db } from "@/db";
import { productRemarks, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { createError } from "@/utils/errorHandlers";

export const listProductRemarksService = async (productVariantId: string) => {
  return db.query.productRemarks.findMany({
    where: eq(productRemarks.productVariantId, productVariantId),
    orderBy: [desc(productRemarks.createdAt)],
    with: { author: { columns: { name: true, email: true, role: true } } },
  });
};

export const createProductRemarkService = async (
  productVariantId: string,
  text: string,
  authorId: string,
) => {
  const [remark] = await db
    .insert(productRemarks)
    .values({ productVariantId, authorId, text })
    .returning();

  return db.query.productRemarks.findFirst({
    where: eq(productRemarks.id, remark.id),
    with: { author: { columns: { name: true, email: true, role: true } } },
  });
};

export const deleteProductRemarkService = async (
  remarkId: string,
  requesterId: string,
  requesterRole: string,
) => {
  const remark = await db.query.productRemarks.findFirst({
    where: eq(productRemarks.id, remarkId),
  });

  if (!remark) throw createError("Remark not found", 404);

  const isOwner = remark.authorId === requesterId;
  const isSuperAdmin = requesterRole === "super admin";
  if (!isOwner && !isSuperAdmin) {
    throw createError("You can only delete your own remarks", 403);
  }

  await db.delete(productRemarks).where(eq(productRemarks.id, remarkId));
  return { id: remarkId };
};
