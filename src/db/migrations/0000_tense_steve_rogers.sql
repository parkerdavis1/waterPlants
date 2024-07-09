CREATE TABLE `house` (
	`id` text PRIMARY KEY DEFAULT '01J2CG29W176DGEM30SHERB3W2' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `plant` (
	`id` text PRIMARY KEY DEFAULT '01J2CG29W02G9JBKTQF39SETT4' NOT NULL,
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
	`id` text PRIMARY KEY DEFAULT '01J2CG29W195ESBWW9W21AD412' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`house_id` text,
	`name` text NOT NULL,
	FOREIGN KEY (`house_id`) REFERENCES `house`(`id`) ON UPDATE no action ON DELETE no action
);
