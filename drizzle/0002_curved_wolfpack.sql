ALTER TABLE `users` ADD `streakDays` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `longestStreak` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `lastPracticeDate` varchar(10);--> statement-breakpoint
ALTER TABLE `users` ADD `totalSessions` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `avgScore` float;