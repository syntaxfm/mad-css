CREATE TABLE `user_bracket_status` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`is_locked` integer DEFAULT false NOT NULL,
	`locked_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_bracket_status_user_id_unique` ON `user_bracket_status` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_bracket_status_userId_idx` ON `user_bracket_status` (`user_id`);--> statement-breakpoint
CREATE TABLE `user_prediction` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`game_id` text NOT NULL,
	`predicted_winner_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_prediction_userId_idx` ON `user_prediction` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_prediction_userId_gameId_idx` ON `user_prediction` (`user_id`,`game_id`);