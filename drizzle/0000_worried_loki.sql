CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email_id" varchar(255) NOT NULL,
	"username" varchar(255),
	"country" varchar(3),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_country_unique" UNIQUE("country")
);
