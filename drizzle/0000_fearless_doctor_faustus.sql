CREATE TYPE "public"."activity_suitable_for" AS ENUM('all', 'adults', 'children');--> statement-breakpoint
CREATE TYPE "public"."activity_type" AS ENUM('city tours');--> statement-breakpoint
CREATE TYPE "public"."booked_from" AS ENUM('website', 'admin');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."booking_type" AS ENUM('instant', 'request');--> statement-breakpoint
CREATE TYPE "public"."client_currency" AS ENUM('EUR', 'USD', 'INR');--> statement-breakpoint
CREATE TYPE "public"."duration_unit" AS ENUM('minutes', 'hours', 'days');--> statement-breakpoint
CREATE TYPE "public"."embedding_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."guide_assignment_status" AS ENUM('invited', 'confirmed', 'declined', 'completed');--> statement-breakpoint
CREATE TYPE "public"."payment_agreement" AS ENUM('Pre-Service', 'Post-Service');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('unpaid', 'paid', 'partiallyPaid');--> statement-breakpoint
CREATE TYPE "public"."preferred_payment_method" AS ENUM('Bank transfer', 'Net banking', 'Credit card');--> statement-breakpoint
CREATE TYPE "public"."price_model" AS ENUM('fixed rate', 'per pax');--> statement-breakpoint
CREATE TYPE "public"."product_currency" AS ENUM('USD', 'EUR', 'GBP', 'INR');--> statement-breakpoint
CREATE TYPE "public"."service_type" AS ENUM('guide', 'assistant');--> statement-breakpoint
CREATE TYPE "public"."sub_type" AS ENUM('walking tours');--> statement-breakpoint
CREATE TYPE "public"."subscription_category" AS ENUM('sports', 'entertainment', 'travel', 'others', 'food');--> statement-breakpoint
CREATE TYPE "public"."subscription_currency" AS ENUM('USD', 'EUR', 'GBP', 'INR');--> statement-breakpoint
CREATE TYPE "public"."subscription_frequency" AS ENUM('daily', 'weekly', 'monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."subscription_payment_method" AS ENUM('credit card', 'net banking', 'paypal', 'cash');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'inactive', 'cancelled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."supplier_status" AS ENUM('Active', 'Inactive', 'Pending', 'Suspended');--> statement-breakpoint
CREATE TYPE "public"."tour_text_language" AS ENUM('english');--> statement-breakpoint
CREATE TYPE "public"."tour_type" AS ENUM('shared', 'private');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('super admin', 'admin', 'client', 'supplier');--> statement-breakpoint
CREATE TYPE "public"."voucher_type" AS ENUM('printed or e-voucher accepted', 'printed', 'e-voucher accepted');--> statement-breakpoint
CREATE TABLE "booking_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"product_id" uuid NOT NULL,
	"product_title" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"pax_count" integer NOT NULL,
	"meeting_point" text NOT NULL,
	"end_point" text NOT NULL,
	"start_time" varchar(20) NOT NULL,
	"duration" numeric(8, 2) NOT NULL,
	"details" text,
	"date" date NOT NULL,
	"operations" jsonb,
	"guide_itinerary" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_ref" varchar(50) NOT NULL,
	"client_id" uuid NOT NULL,
	"lead_first_name" varchar(100) NOT NULL,
	"lead_last_name" varchar(100) NOT NULL,
	"lead_email" varchar(255) NOT NULL,
	"lead_mobile" jsonb NOT NULL,
	"agency_ref" varchar(100),
	"comments" text,
	"discount_code" varchar(100),
	"total_price" numeric(10, 2) NOT NULL,
	"status" "booking_status" DEFAULT 'pending',
	"booked_from" "booked_from" DEFAULT 'website',
	"booked_by" uuid,
	"payment_status" "payment_status" DEFAULT 'unpaid',
	"client_itinerary" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" boolean DEFAULT false NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"mobile" jsonb NOT NULL,
	"whatsapp" jsonb NOT NULL,
	"teams_id" varchar(255) NOT NULL,
	"position" varchar(100),
	"boarded_from_online_portal" boolean DEFAULT true,
	"company_information" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation_participants" (
	"conversation_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "conversation_participants_conversation_id_user_id_pk" PRIMARY KEY("conversation_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"created_by" uuid NOT NULL,
	"last_message_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guide_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_item_id" uuid NOT NULL,
	"supplier_id" uuid NOT NULL,
	"status" "guide_assignment_status" DEFAULT 'invited',
	"notes" text,
	"assigned_at" timestamp DEFAULT now(),
	"responded_at" timestamp,
	"assigned_by" uuid
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_remarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"text" varchar(2000) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" varchar(500) NOT NULL,
	"product_code" varchar(100) NOT NULL,
	"service_type" "service_type" DEFAULT 'guide',
	"tour_type" "tour_type" DEFAULT 'private',
	"activity_type" "activity_type" DEFAULT 'city tours',
	"sub_type" "sub_type" DEFAULT 'walking tours',
	"description" text NOT NULL,
	"will_see" text[] NOT NULL,
	"will_learn" text[] NOT NULL,
	"base_product_id" uuid NOT NULL,
	"booking_type" "booking_type",
	"tour_guide_language" varchar(100),
	"mandatory_information" text[] NOT NULL,
	"recommended_information" text[] NOT NULL,
	"included" text[] NOT NULL,
	"excluded" text[] DEFAULT '{}',
	"activity_suitable_for" "activity_suitable_for" DEFAULT 'all',
	"voucher_type" "voucher_type" DEFAULT 'printed or e-voucher accepted',
	"max_pax" integer NOT NULL,
	"meeting_point" jsonb NOT NULL,
	"end_point" jsonb,
	"tags" text[] NOT NULL,
	"closed_dates" date[] DEFAULT '{}',
	"holiday_dates" date[] DEFAULT '{}',
	"availability" jsonb NOT NULL,
	"cancellation_terms" text[] NOT NULL,
	"release" varchar(100) NOT NULL,
	"first_round_review" boolean DEFAULT false NOT NULL,
	"first_round_review_remarks" text[] DEFAULT '{}',
	"second_round_review" boolean DEFAULT false NOT NULL,
	"second_round_review_remarks" text[] DEFAULT '{}',
	"price_model" "price_model" DEFAULT 'fixed rate',
	"currency" "product_currency" DEFAULT 'EUR',
	"b2b_rate_instant" numeric(10, 2) NOT NULL,
	"b2b_extra_hour_supplement_instant" numeric(10, 2) DEFAULT '0',
	"b2b_rate_on_request" numeric(10, 2) NOT NULL,
	"b2b_extra_hour_supplement_on_request" numeric(10, 2) DEFAULT '0',
	"b2c_rate_instant" numeric(10, 2) NOT NULL,
	"b2c_extra_hour_supplement_instant" numeric(10, 2) DEFAULT '0',
	"b2c_rate_on_request" numeric(10, 2) NOT NULL,
	"b2c_extra_hour_supplement_on_request" numeric(10, 2) DEFAULT '0',
	"public_holiday_supplement_percent" numeric(5, 2),
	"weekend_supplement_percent" numeric(5, 2),
	"is_b2b" boolean DEFAULT true NOT NULL,
	"is_b2c" boolean DEFAULT true NOT NULL,
	"override_price_from_contract" boolean DEFAULT false NOT NULL,
	"is_booking_per_product" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"tour_text_language" "tour_text_language" DEFAULT 'english',
	"tour_guide_language_instant" text[] DEFAULT '{}',
	"tour_guide_language_on_request" text[] NOT NULL,
	"images" text[] NOT NULL,
	"embedding_status" "embedding_status" DEFAULT 'pending',
	"embedding_last_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"frequency" "subscription_frequency" DEFAULT 'monthly',
	"currency" "subscription_currency" DEFAULT 'INR',
	"category" "subscription_category" DEFAULT 'others' NOT NULL,
	"payment_method" "subscription_payment_method" DEFAULT 'credit card' NOT NULL,
	"status" "subscription_status" DEFAULT 'active',
	"start_date" date NOT NULL,
	"renewal_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"personal_info" jsonb NOT NULL,
	"addresses" jsonb DEFAULT '[]'::jsonb,
	"contact" jsonb NOT NULL,
	"experience" jsonb,
	"billing" jsonb,
	"contract" jsonb,
	"cancellation_terms" jsonb DEFAULT '[]'::jsonb,
	"amendments" jsonb DEFAULT '[]'::jsonb,
	"location_supplements" jsonb DEFAULT '[]'::jsonb,
	"language_supplements" jsonb DEFAULT '[]'::jsonb,
	"docs" jsonb,
	"service_config" jsonb,
	"rating" jsonb DEFAULT '{"averageRating":0,"totalReviews":0}'::jsonb,
	"comments" text,
	"auto_bookings" boolean DEFAULT false,
	"employee" boolean DEFAULT false,
	"status" "supplier_status" DEFAULT 'Pending',
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "user_role" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking_order_items" ADD CONSTRAINT "booking_order_items_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_order_items" ADD CONSTRAINT "booking_order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_client_id_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_booked_by_users_id_fk" FOREIGN KEY ("booked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guide_assignments" ADD CONSTRAINT "guide_assignments_order_item_id_booking_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."booking_order_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guide_assignments" ADD CONSTRAINT "guide_assignments_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guide_assignments" ADD CONSTRAINT "guide_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_remarks" ADD CONSTRAINT "product_remarks_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_remarks" ADD CONSTRAINT "product_remarks_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_base_product_id_products_id_fk" FOREIGN KEY ("base_product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_ref_idx" ON "bookings" USING btree ("booking_ref");--> statement-breakpoint
CREATE INDEX "product_remarks_variant_created_idx" ON "product_remarks" USING btree ("product_variant_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "product_variants_url_idx" ON "product_variants" USING btree ("url");--> statement-breakpoint
CREATE UNIQUE INDEX "product_variants_product_code_idx" ON "product_variants" USING btree ("product_code");--> statement-breakpoint
CREATE INDEX "suppliers_status_idx" ON "suppliers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "suppliers_created_at_idx" ON "suppliers" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");