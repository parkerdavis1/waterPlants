CREATE TABLE `push_subscription` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`user_agent` text,
	`created_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `push_subscription_endpoint_unique` ON `push_subscription` (`endpoint`);--> statement-breakpoint
DROP INDEX "push_subscription_endpoint_unique";--> statement-breakpoint
ALTER TABLE `house` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (unixepoch('subsec') * 1000);--> statement-breakpoint
ALTER TABLE `plant` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (unixepoch('subsec') * 1000);--> statement-breakpoint
ALTER TABLE `plant` DROP COLUMN `waitUntil`;--> statement-breakpoint
ALTER TABLE `room` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (unixepoch('subsec') * 1000);--> statement-breakpoint
ALTER TABLE `user` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (unixepoch('subsec') * 1000);--> statement-breakpoint
ALTER TABLE `watering_event` ALTER COLUMN "timestamp" TO "timestamp" integer NOT NULL DEFAULT (unixepoch('subsec') * 1000);--> statement-breakpoint
ALTER TABLE `watering_event` ADD `waitUntil` integer;--> statement-breakpoint
ALTER TABLE `watering_event` ADD `notified_at` integer;