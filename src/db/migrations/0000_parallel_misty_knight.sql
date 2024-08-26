CREATE TABLE `house` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `plant` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`species` text NOT NULL,
	`name` text,
	`water_schedule` integer DEFAULT 7 NOT NULL,
	`notes` text,
	`image_url` text,
	`house_id` integer NOT NULL,
	`room_id` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`house_id`) REFERENCES `house`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`room_id`) REFERENCES `room`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `room` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`house_id` integer,
	`name` text NOT NULL,
	FOREIGN KEY (`house_id`) REFERENCES `house`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`avatar_url` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`default_house_id` integer,
	FOREIGN KEY (`default_house_id`) REFERENCES `house`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_to_house` (
	`user_id` integer,
	`house_id` integer,
	PRIMARY KEY(`user_id`, `house_id`)
);
--> statement-breakpoint
CREATE TABLE `watering_event` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`notes` text,
	`watered` integer,
	`fertilized` integer,
	`image_url` text,
	`plant_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`timestamp` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`plant_id`) REFERENCES `plant`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
