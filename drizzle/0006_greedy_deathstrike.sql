ALTER TABLE `scenarios` ADD `personaRole` varchar(255);--> statement-breakpoint
ALTER TABLE `scenarios` ADD `personaCompany` varchar(255);--> statement-breakpoint
ALTER TABLE `scenarios` ADD `personaPersonality` varchar(64);--> statement-breakpoint
ALTER TABLE `scenarios` ADD `channel` varchar(32) DEFAULT 'text';--> statement-breakpoint
ALTER TABLE `scenarios` ADD `learnerRole` varchar(255);--> statement-breakpoint
ALTER TABLE `scenarios` ADD `learnerTeam` varchar(255);--> statement-breakpoint
ALTER TABLE `scenarios` ADD `focusSkill` varchar(255);--> statement-breakpoint
ALTER TABLE `scenarios` ADD `scoringNotes` text;