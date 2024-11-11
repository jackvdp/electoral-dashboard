import * as dotenv from 'dotenv'
import path from 'path'

// Load the correct .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env.development.local') })