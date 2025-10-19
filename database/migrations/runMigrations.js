const fs = require('fs');
const path = require('path');
const { getDatabase } = require('../../config/database');

const MIGRATIONS_DIR = __dirname;

async function runMigrations() {
    console.log('Running database migrations...');

    try {
        // Read the SQL file
        const sqlFile = path.join(MIGRATIONS_DIR, '001_initial_schema.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');

        // Split by semicolon and filter empty statements
        const statements = sql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

        const db = getDatabase();

        // Execute each statement
        for (const statement of statements) {
            db.prepare(statement).run();
        }

        db.close();
        console.log('✅ Migrations completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

// Run migrations if this file is executed directly
if (require.main === module) {
    runMigrations();
}

module.exports = { runMigrations };