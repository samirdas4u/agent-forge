CREATE TABLE `agent_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentType` enum('simulation','coaching','evaluation','planning','orchestrator') NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`userId` int,
	`sessionId` int,
	`payload` json DEFAULT ('{}'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coaching_nudges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` int,
	`nudgeType` enum('encouragement','tip','warning','milestone','difficulty_change') NOT NULL DEFAULT 'tip',
	`title` varchar(200) NOT NULL,
	`body` text NOT NULL,
	`viewed` boolean NOT NULL DEFAULT false,
	`helpful` boolean,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coaching_nudges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `difficulty_adjustments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` int,
	`fromDifficulty` enum('beginner','intermediate','advanced') NOT NULL,
	`toDifficulty` enum('beginner','intermediate','advanced') NOT NULL,
	`reason` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `difficulty_adjustments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learning_paths` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`scenarioIds` json NOT NULL DEFAULT ('[]'),
	`completedIds` json NOT NULL DEFAULT ('[]'),
	`status` enum('active','completed','paused') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learning_paths_id` PRIMARY KEY(`id`)
);
