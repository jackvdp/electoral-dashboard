#!/usr/bin/env node
import {readFileSync, writeFileSync, unlinkSync} from 'fs';
import {execSync} from 'child_process';
import {resolve} from 'path';
import {config} from "dotenv";

config({path: '.env.local'});

// Ensure database URL is available
if (!process.env.POSTGRES_URL) {
    console.error('Error: POSTGRES_URL environment variable not found in .env.local');
    process.exit(1);
}

// Get country name from command line args
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('Please provide a country name, e.g., "node add-country.js thailand"');
    process.exit(1);
}

// Format country name
const rawCountryName = args[0].toLowerCase();
const countryName = rawCountryName.replace(/\s+/g, '-');

// Create a camelCase version for property names (e.g., "south-africa" -> "southAfrica")
const camelCaseName = countryName
    .split('-')
    .map((word, index) => {
        return index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join('');

// Create PascalCase name for model names (e.g., "south-africa" -> "SouthAfrica")
const pascalCaseCountry = countryName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

// Paths
const schemaPath = resolve('./prisma/schema.prisma');
const prismaLibPath = resolve('./src/lib/prisma.ts');

// 1. Update schema.prisma
console.log(`Adding ${pascalCaseCountry} to schema.prisma...`);
let schemaContent = readFileSync(schemaPath, 'utf8');

// Add to schemas array
schemaContent = schemaContent.replace(
    /(schemas\s*=\s*\[)(.*?)(\])/,
    `$1$2, "${countryName}"$3`
);

// Add new models
const sponsorModel = `
model ${pascalCaseCountry}Sponsor {
  id                      String   @id @default(uuid())
  name                    String
  initialContact          Boolean  @default(false)
  receivedProgrammeAdvert Boolean  @default(false)
  numberOfAttendees       Int      @default(0)
  attendeeNames           String?
  contactEmail            String?
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  specialRequirments      String   @default("")
  exhibitionSpace         Boolean  @default(false)
  flightDetails           String   @default("")

  @@schema("${countryName}")
  @@map("Sponsor")
}

model ${pascalCaseCountry}Task {
  id           String   @id @default(cuid())
  completed    Boolean  @default(false)
  task         String
  details      String?
  section      String
  order        Int
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  assignedToId String?

  @@schema("${countryName}")
  @@map("Task")
}
`;

schemaContent += sponsorModel;
writeFileSync(schemaPath, schemaContent);

// 2. Update prisma.ts
console.log(`Adding ${pascalCaseCountry} to prisma.ts...`);
let prismaContent = readFileSync(prismaLibPath, 'utf8');

// Add to interface - Use camelCase for Prisma properties
prismaContent = prismaContent.replace(
    /(interface PrismaClientWithSchemas extends PrismaClient \{)([\s\S]*?)(\})/,
    `$1$2    ${camelCaseName}Task: PrismaClient['task']\n    ${camelCaseName}Sponsor: PrismaClient['sponsor']\n$3`
);

// Add to getEventModels - Use proper casing for property access
const modelCase = `        case '${countryName}':\n            return {\n                task: prisma.${camelCaseName}Task,\n                sponsor: prisma.${camelCaseName}Sponsor\n            }\n`;

prismaContent = prismaContent.replace(
    /(switch\(event\) \{)([\s\S]*?)(        default:)/,
    `$1$2${modelCase}$3`
);

// Add to VALID_EVENTS - use original countryName with hyphens for URL paths
prismaContent = prismaContent.replace(
    /(VALID_EVENTS = \[)(.*?)(\])/,
    `$1$2, '${countryName}'$3`
);

writeFileSync(prismaLibPath, prismaContent);

// 3. Run Prisma commands
console.log('Running Prisma commands...');
try {
    // Create new schema and tables
    console.log('Creating database schema and tables...');

    // Create the SQL file with schema and table creation commands
    const tempSqlPath = resolve('./temp-schema.sql');
    const createTablesSql = `
-- Create schema
CREATE SCHEMA IF NOT EXISTS "${countryName}";

-- Create Sponsor table
CREATE TABLE IF NOT EXISTS "${countryName}"."Sponsor" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "initialContact" BOOLEAN NOT NULL DEFAULT false,
  "receivedProgrammeAdvert" BOOLEAN NOT NULL DEFAULT false,
  "numberOfAttendees" INTEGER NOT NULL DEFAULT 0,
  "attendeeNames" TEXT,
  "contactEmail" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "specialRequirments" TEXT NOT NULL DEFAULT '',
  "exhibitionSpace" BOOLEAN NOT NULL DEFAULT false,
  "flightDetails" TEXT NOT NULL DEFAULT '',
  CONSTRAINT "${countryName}_Sponsor_pkey" PRIMARY KEY ("id")
);

-- Create Task table
CREATE TABLE IF NOT EXISTS "${countryName}"."Task" (
  "id" TEXT NOT NULL,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "task" TEXT NOT NULL,
  "details" TEXT,
  "section" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "assignedToId" TEXT,
  CONSTRAINT "${countryName}_Task_pkey" PRIMARY KEY ("id")
);
`;

    writeFileSync(tempSqlPath, createTablesSql);

    // Pass the environment variable directly to the command
    const psqlCommand = `POSTGRES_URL="${process.env.POSTGRES_URL}" npx prisma db execute --file="${tempSqlPath}"`;
    execSync(psqlCommand, {stdio: 'inherit'});

    // Get the source schema for copying data
    const sourceSchema = "default-data";

    const copyDataSql = `
-- Copy data from template tasks to ${countryName} tasks
INSERT INTO "${countryName}"."Task" (
  "id", "completed", "task", "details", 
  "section", "order", "createdAt", "updatedAt", "assignedToId"
)
SELECT 
  gen_random_uuid(), "completed", "task", "details", 
  "section", "order", "createdAt", CURRENT_TIMESTAMP, "assignedToId"
FROM "${sourceSchema}"."Task";
`;

    // Create a new SQL file for copying data
    const copyDataSqlPath = resolve('./copy-data.sql');
    writeFileSync(copyDataSqlPath, copyDataSql);

    // Execute the data copy command
    console.log(`Copying task data from ${sourceSchema} to ${pascalCaseCountry}...`);
    const copyCommand = `POSTGRES_URL="${process.env.POSTGRES_URL}" npx prisma db execute --file="${copyDataSqlPath}"`;
    execSync(copyCommand, {stdio: 'inherit'});

    // Clean up the copy SQL file
    unlinkSync(copyDataSqlPath);

    // Clean up temp file
    unlinkSync(tempSqlPath);

    // Generate Prisma client
    console.log('Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    console.log(`\n✅ Successfully added ${pascalCaseCountry}!`);
    console.log(`\nYou can now access it at:
- URL: /${countryName}
- API: /api/${countryName}/tasks and /api/${countryName}/sponsors`);
} catch (error) {
    console.error('Error executing Prisma commands:', error);
    process.exit(1);
}