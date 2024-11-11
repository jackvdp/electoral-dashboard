import { createSponsorsTable } from '../lib/db/sponsors'
import './load-env.js';  // Add this at the top

async function migrate() {
    try {
        await createSponsorsTable()
        console.log('Migration completed successfully')
        process.exit(0)
    } catch (error) {
        console.error('Migration failed:', error)
        process.exit(1)
    }
}

migrate()