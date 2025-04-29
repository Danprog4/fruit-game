CREATE TABLE "allianceSeasons" (
	"seasonCurr" varchar(255) DEFAULT 'strawberry' NOT NULL,
	"seasonStart" timestamp with time zone DEFAULT now() NOT NULL,
	"seasonEnd" timestamp with time zone DEFAULT NOW() + INTERVAL '30 days' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alliances" (
	"id" serial PRIMARY KEY NOT NULL,
	"ownerId" bigint NOT NULL,
	"name" varchar(255) NOT NULL,
	"avatarId" uuid,
	"telegramChannelUrl" varchar(255),
	"members" bigint DEFAULT 1,
	"capacity" bigint DEFAULT 10,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigint PRIMARY KEY NOT NULL,
	"referrerId" bigint,
	"tokenBalance" bigint DEFAULT 0 NOT NULL,
	"photoUrl" varchar(255),
	"name" varchar(255),
	"allianceId" bigint,
	"allianceJoinDate" timestamp with time zone,
	"farms" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"lastUpdatedBalance" timestamp with time zone,
	"balances" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"starBalance" bigint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alliances" ADD CONSTRAINT "alliances_ownerId_users_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;