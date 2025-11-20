CREATE TABLE "game_codes" (
	"id" varchar(3) PRIMARY KEY NOT NULL,
	"total_rounds" integer NOT NULL,
	"timer_per_round" integer NOT NULL,
	"difficulty" varchar(10)
);
--> statement-breakpoint
CREATE TABLE "scores" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "scores_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"total_score" integer NOT NULL,
	"user_id" integer NOT NULL,
	"game_code_id" varchar(3),
	"date" date DEFAULT now() NOT NULL,
	"total_time" integer NOT NULL,
	"penalties" integer
);
--> statement-breakpoint
ALTER TABLE "scores" ADD CONSTRAINT "scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scores" ADD CONSTRAINT "scores_game_code_id_game_codes_id_fk" FOREIGN KEY ("game_code_id") REFERENCES "public"."game_codes"("id") ON DELETE set null ON UPDATE cascade;