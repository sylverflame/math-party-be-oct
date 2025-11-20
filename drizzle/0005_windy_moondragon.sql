ALTER TABLE "scores" DROP CONSTRAINT "scores_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "scores" ADD COLUMN "username" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "scores" ADD CONSTRAINT "scores_username_users_username_fk" FOREIGN KEY ("username") REFERENCES "public"."users"("username") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scores" DROP COLUMN "user_id";