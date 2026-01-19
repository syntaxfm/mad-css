CREATE TABLE `tournament_result` (
	`id` text PRIMARY KEY NOT NULL,
	`game_id` text NOT NULL,
	`winner_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tournament_result_game_id_unique` ON `tournament_result` (`game_id`);--> statement-breakpoint
CREATE INDEX `tournament_result_gameId_idx` ON `tournament_result` (`game_id`);--> statement-breakpoint
CREATE TABLE `user_score` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`round1_score` integer DEFAULT 0 NOT NULL,
	`round2_score` integer DEFAULT 0 NOT NULL,
	`round3_score` integer DEFAULT 0 NOT NULL,
	`round4_score` integer DEFAULT 0 NOT NULL,
	`total_score` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_score_user_id_unique` ON `user_score` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_score_userId_idx` ON `user_score` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_score_totalScore_idx` ON `user_score` (`total_score`);