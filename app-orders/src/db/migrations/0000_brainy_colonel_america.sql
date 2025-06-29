CREATE TYPE "public"."orders_status" AS ENUM('pending', 'paid', 'canceled');--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"costumer_id" text NOT NULL,
	"amount" integer NOT NULL,
	"status" "orders_status" DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL
);
