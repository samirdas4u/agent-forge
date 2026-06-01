CREATE TABLE `feature_flags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sandboxId` int NOT NULL,
	`flagKey` varchar(100) NOT NULL,
	`description` text,
	`enabled` boolean NOT NULL DEFAULT false,
	`rolloutPct` int NOT NULL DEFAULT 0,
	`targeting` json DEFAULT ('{}'),
	`killSwitch` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feature_flags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `personas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sandboxId` int,
	`ownerId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`role` varchar(255),
	`tone` enum('professional','friendly','aggressive','skeptical','neutral','enthusiastic') NOT NULL DEFAULT 'professional',
	`systemPrompt` text NOT NULL,
	`temperature` float NOT NULL DEFAULT 0.7,
	`isPublished` boolean NOT NULL DEFAULT false,
	`version` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `personas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sandbox_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sandboxId` int NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`payload` json DEFAULT ('{}'),
	`userId` int,
	`severity` enum('info','warning','error','debug') NOT NULL DEFAULT 'info',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sandbox_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sandbox_instances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` enum('active','paused','archived') NOT NULL DEFAULT 'active',
	`shareToken` varchar(64),
	`snapshotData` json,
	`baseTemplate` enum('blank','sales','customer_service','onboarding') NOT NULL DEFAULT 'blank',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sandbox_instances_id` PRIMARY KEY(`id`),
	CONSTRAINT `sandbox_instances_shareToken_unique` UNIQUE(`shareToken`)
);
--> statement-breakpoint
CREATE TABLE `test_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sandboxId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`script` json NOT NULL,
	`status` enum('pending','running','passed','failed','error') NOT NULL DEFAULT 'pending',
	`results` json DEFAULT ('[]'),
	`durationMs` int,
	`passCount` int DEFAULT 0,
	`failCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `test_runs_id` PRIMARY KEY(`id`)
);
