import { z } from "zod";

const orderItemSchema = z.object({
  productId: z.string("Product id is required"),
  productTitle: z.string("Product title is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  paxCount: z.coerce.number().min(1, "Pax count must be at least 1"),
  meetingPoint: z.string("Meeting point is required"),
  endPoint: z.string("End point is required"),
  startTime: z.string("Start time is required"),
  duration: z.coerce.number().min(0, "Duration must be non-negative"),
  details: z.string().optional(),
  date: z.coerce.date("Date is required"),
});

export const bookingZodSchema = z.object({
  clientId: z.string().min(1, "Client id is required"),
  leadFirstName: z.string().min(1, "Lead first name is required"),
  leadLastName: z.string().min(1, "Lead last name is required"),
  leadEmail: z.email("Lead email is invalid"),
  leadMobile: z.object({
    countryCode: z.string().min(1, "Country code is required"),
    number: z.string().min(1, "Mobile number is required"),
  }),
  agencyRef: z.string().optional(),
  comments: z.string().optional(),
  orderItems: z
    .array(orderItemSchema, "Order items are required")
    .min(1, "At least one order item is required"),
  discountCode: z.string().optional(),
});

export type BookingInput = z.infer<typeof bookingZodSchema>;

const objectIdLikeSchema = z
  .string()
  .min(1)
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const orderItemOperationsSchema = z
  .object({
    internalComment: z.string().optional(),
    accountingComment: z.string().optional(),
    transportDetails: z.string().optional(),
    supplierRemark: z.string().optional(),
    finalDetailsToProvider: z.boolean().optional(),
    finalDetailsByEmail: z.boolean().optional(),
    finalDetailsToClient: z.boolean().optional(),
    controlCallPicId: objectIdLikeSchema.nullable().optional(),
    picId: objectIdLikeSchema.nullable().optional(),
  })
  .strict();

export type OrderItemOperationsInput = z.infer<
  typeof orderItemOperationsSchema
>;

export const assignGuideSchema = z.object({
  supplierId: objectIdLikeSchema,
  notes: z.string().optional(),
});

export const updateGuideAssignmentSchema = z
  .object({
    status: z
      .enum(["invited", "confirmed", "declined", "completed"])
      .optional(),
    notes: z.string().optional(),
  })
  .strict();

export type AssignGuideInput = z.infer<typeof assignGuideSchema>;
export type UpdateGuideAssignmentInput = z.infer<
  typeof updateGuideAssignmentSchema
>;
