CREATE TABLE `house` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `plant` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`photo` blob,
	`house_id` text NOT NULL,
	`room_id` text,
	FOREIGN KEY (`house_id`) REFERENCES `house`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`room_id`) REFERENCES `room`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `room` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`house_id` text,
	`name` text NOT NULL,
	FOREIGN KEY (`house_id`) REFERENCES `house`(`id`) ON UPDATE no action ON DELETE no action
);
