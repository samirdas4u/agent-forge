import mysql from "mysql2/promise";

const url = process.env.DATABASE_URL;
// Parse the URL to extract components
const parsed = new URL(url);
const conn = await mysql.createConnection({
  host: parsed.hostname,
  port: parseInt(parsed.port || "3306"),
  user: parsed.username,
  password: parsed.password,
  database: parsed.pathname.slice(1),
  ssl: { rejectUnauthorized: true },
  multipleStatements: true,
});

const tables = [
  `CREATE TABLE IF NOT EXISTS \`agent_events\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`agentType\` enum('simulation','coaching','evaluation','planning','orchestrator') NOT NULL,
    \`eventType\` varchar(100) NOT NULL,
    \`userId\` int,
    \`sessionId\` int,
    \`payload\` json,
    \`createdAt\` timestamp NOT NULL DEFAULT (now()),
    CONSTRAINT \`agent_events_id\` PRIMARY KEY(\`id\`)
  )`,
  `CREATE TABLE IF NOT EXISTS \`coaching_nudges\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`userId\` int NOT NULL,
    \`sessionId\` int,
    \`nudgeType\` enum('encouragement','tip','warning','milestone','difficulty_change') NOT NULL DEFAULT 'tip',
    \`title\` varchar(200) NOT NULL,
    \`body\` text NOT NULL,
    \`viewed\` boolean NOT NULL DEFAULT false,
    \`helpful\` boolean,
    \`createdAt\` timestamp NOT NULL DEFAULT (now()),
    CONSTRAINT \`coaching_nudges_id\` PRIMARY KEY(\`id\`)
  )`,
  `CREATE TABLE IF NOT EXISTS \`difficulty_adjustments\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`userId\` int NOT NULL,
    \`sessionId\` int,
    \`fromDifficulty\` enum('beginner','intermediate','advanced') NOT NULL,
    \`toDifficulty\` enum('beginner','intermediate','advanced') NOT NULL,
    \`reason\` varchar(500),
    \`createdAt\` timestamp NOT NULL DEFAULT (now()),
    CONSTRAINT \`difficulty_adjustments_id\` PRIMARY KEY(\`id\`)
  )`,
  `CREATE TABLE IF NOT EXISTS \`learning_paths\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`userId\` int NOT NULL,
    \`title\` varchar(200) NOT NULL,
    \`description\` text,
    \`scenarioIds\` json NOT NULL,
    \`completedIds\` json NOT NULL,
    \`status\` enum('active','completed','paused') NOT NULL DEFAULT 'active',
    \`createdAt\` timestamp NOT NULL DEFAULT (now()),
    \`updatedAt\` timestamp NOT NULL DEFAULT (now()),
    CONSTRAINT \`learning_paths_id\` PRIMARY KEY(\`id\`)
  )`,
];

for (const sql of tables) {
  try {
    await conn.execute(sql);
    const tableName = sql.match(/CREATE TABLE IF NOT EXISTS `(\w+)`/)?.[1];
    console.log(`✓ ${tableName}`);
  } catch (e) {
    console.error(`✗ Error:`, e.message);
  }
}

await conn.end();
console.log("Migration complete.");
