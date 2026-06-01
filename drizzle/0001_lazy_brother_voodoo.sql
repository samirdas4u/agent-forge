CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`feedback` text,
	`messageScore` float,
	`scoreDimensions` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scenarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` enum('sales','customer_service','interview','negotiation','presentation') NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
	`systemPrompt` text NOT NULL,
	`aiPersona` varchar(255),
	`tags` json DEFAULT ('[]'),
	`estimatedMinutes` int DEFAULT 10,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scenarios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`scenarioId` int NOT NULL,
	`status` enum('active','completed','abandoned') NOT NULL DEFAULT 'active',
	`overallScore` float,
	`clarityScore` float,
	`empathyScore` float,
	`persuasivenessScore` float,
	`objectionHandlingScore` float,
	`professionalismScore` float,
	`feedbackSummary` text,
	`strengths` json DEFAULT ('[]'),
	`improvements` json DEFAULT ('[]'),
	`durationSeconds` int,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `walkthrough_completions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`walkthroughId` int NOT NULL,
	`completedSteps` json DEFAULT ('[]'),
	`isCompleted` boolean NOT NULL DEFAULT false,
	`score` float,
	`completedAt` timestamp,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `walkthrough_completions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `walkthroughs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
	`steps` json NOT NULL,
	`estimatedMinutes` int DEFAULT 5,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `walkthroughs_id` PRIMARY KEY(`id`)
);
