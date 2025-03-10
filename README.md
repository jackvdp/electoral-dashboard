# Event Country Management

This document explains how to add new countries to the event management system.

## Adding a New Country

The system includes a script to automate the process of adding a new country/event location.

### Prerequisites

- Node.js installed
- `.env.local` file with your `POSTGRES_URL` database connection string
- `dotenv` package installed (`npm install dotenv`)

### Steps to Add a Country

1. Run the `add-country.js` script with the country name:

```bash
node src/scripts/add-country.js thailand
```

2. The script will:
    - Update the Prisma schema to include the new country
    - Create database tables for the new country
    - Copy template data from the default-symposium schema
    - Update the TypeScript types and event helpers
    - Generate a new Prisma client

3. After running the script, restart your development server:

```bash
npm run dev
```

4. Your new country should now be accessible at:
    - URL: `/thailand`
    - API: `/api/thailand/tasks` and `/api/thailand/sponsors`

### Known Issues

⚠️ **IMPORTANT**: Currently, there is a bug with country names containing hyphens. Until fixed:

- Do not use hyphens in country names (e.g., use "southafrica" instead of "south-africa")
- If you need a multi-word name, use camelCase (e.g., "southAfrica")

This issue affects the Prisma client's ability to properly recognize models with hyphenated schema names.

### Manually Adding a Country

If you need to manually add a country:

1. Add the country to the `schemas` array in `prisma/schema.prisma`
2. Create model definitions for the new country's tables
3. Add the country's model types to `PrismaClientWithSchemas` interface in `src/lib/prisma.ts`
4. Add a case for the country in the `getEventModels` function
5. Add the country to the `VALID_EVENTS` array
6. Run database migrations to create the schema and tables
7. Generate the Prisma client using `npx prisma generate`