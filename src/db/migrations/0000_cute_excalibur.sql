CREATE TABLE `house` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `plant` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`species` text,
	`water_period` integer DEFAULT 7,
	`image_url` text,
	`house_id` integer NOT NULL,
	`room_id` integer,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`house_id`) REFERENCES `house`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`room_id`) REFERENCES `room`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `room` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`house_id` integer,
	`name` text NOT NULL,
	FOREIGN KEY (`house_id`) REFERENCES `house`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`avatar_url` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`default_house_id` integer,
	FOREIGN KEY (`default_house_id`) REFERENCES `house`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_to_house` (
	`user_id` integer,
	`house_id` integer,
	PRIMARY KEY(`house_id`, `user_id`)
);
--> statement-breakpoint
CREATE TABLE `watering_event` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comments` text,
	`fertilized` integer DEFAULT false,
	`image_url` text,
	`plant_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`timestamp` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`plant_id`) REFERENCES `plant`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
