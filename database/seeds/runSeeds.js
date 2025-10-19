// database/seeds/runSeeds.js
const bcrypt = require('bcrypt');
const { run } = require('../../config/database');

async function seedDatabase() {
  console.log('Seeding database...');

  try {
    // Seed users
    const adminPasswordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    const testPasswordHash = await bcrypt.hash(process.env.TEST_PASSWORD || 'test123', 10);

    await run(`
      INSERT OR IGNORE INTO users (username, password_hash, email, is_admin)
      VALUES (?, ?, ?, ?)
    `, [process.env.ADMIN_USERNAME || 'admin', adminPasswordHash, process.env.ADMIN_EMAIL || 'admin@localhost', 1]);

    await run(`
      INSERT OR IGNORE INTO users (username, password_hash, email, is_admin)
      VALUES (?, ?, ?, ?)
    `, [process.env.TEST_USERNAME || 'testuser', testPasswordHash, process.env.TEST_EMAIL || 'test@localhost', 0]);

    console.log('✅ Users seeded');

    // Seed factions
    const factions = [
      ['Space Marines', 'The Angels of Death, superhuman warriors of the Imperium'],
      ['Chaos Space Marines', 'Traitorous Space Marines who serve the Chaos Gods'],
      ['Orks', 'Brutal and warlike green-skinned aliens'],
      ['Tyranids', 'Extra-galactic hive mind organism'],
      ['Aeldari', 'Ancient and advanced alien race'],
      ['T\'au Empire', 'Technologically advanced alien civilization'],
      ['Necrons', 'Ancient robotic race awakening from eons of slumber'],
      ['Imperial Guard', 'Vast armies of humanity\'s soldiers'],
      ['Adeptus Mechanicus', 'Tech-priests of Mars'],
      ['Genestealer Cults', 'Insidious alien-hybrid cults']
    ];

    for (const [name, description] of factions) {
      await run('INSERT OR IGNORE INTO factions (name, description) VALUES (?, ?)', [name, description]);
    }

    console.log('✅ Factions seeded');

    // Seed unit types
    const unitTypes = [
      ['HQ', 'Headquarters units - leaders and commanders'],
      ['Troops', 'Core infantry units'],
      ['Elites', 'Specialized veteran units'],
      ['Fast Attack', 'Fast-moving units'],
      ['Heavy Support', 'Heavy weapons and vehicles'],
      ['Flyer', 'Aircraft and flying units'],
      ['Dedicated Transport', 'Vehicles for transporting units'],
      ['Fortification', 'Defensive structures'],
      ['Lord of War', 'Super-heavy units']
    ];

    for (const [name, description] of unitTypes) {
      await run('INSERT OR IGNORE INTO unit_types (name, description) VALUES (?, ?)', [name, description]);
    }

    console.log('✅ Unit types seeded');

    // Seed sample miniatures
    const miniatures = [
      ['Space Marine Intercessors', 1, 2, 100, '32mm', 'Standard Primaris infantry'],
      ['Space Marine Captain', 1, 1, 80, '40mm', 'Commander of Space Marine forces'],
      ['Ork Boyz', 3, 2, 90, '32mm', 'Basic Ork infantry mob'],
      ['Tyranid Termagants', 4, 2, 60, '28mm', 'Basic Tyranid organisms'],
      ['Imperial Guard Infantry Squad', 8, 2, 65, '25mm', 'Standard human soldiers']
    ];

    for (const [name, faction_id, unit_type_id, points, base_size, description] of miniatures) {
      await run(`
        INSERT OR IGNORE INTO miniatures (name, faction_id, unit_type_id, points_value, base_size, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [name, faction_id, unit_type_id, points, base_size, description]);
    }

    console.log('✅ Sample miniatures seeded');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\nDefault login credentials:');
    console.log(`Admin - Username: ${process.env.ADMIN_USERNAME || 'admin'}, Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    console.log(`Test User - Username: ${process.env.TEST_USERNAME || 'testuser'}, Password: ${process.env.TEST_PASSWORD || 'test123'}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };