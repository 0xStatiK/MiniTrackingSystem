// models/Faction.js
const { get, run, all } = require('../config/database');

/**
 * Faction Model
 * Handles all database operations for factions
 */
class Faction {
  /**
   * Get all factions
   * @returns {Array} Array of faction objects
   */
  static getAll() {
    return all('SELECT * FROM factions ORDER BY name');
  }

  /**
   * Find faction by ID
   * @param {number} id - Faction ID
   * @returns {Object|undefined} Faction object
   */
  static findById(id) {
    return get('SELECT * FROM factions WHERE id = ?', [id]);
  }

  /**
   * Find faction by name
   * @param {string} name - Faction name
   * @returns {Object|undefined} Faction object
   */
  static findByName(name) {
    return get('SELECT * FROM factions WHERE name = ?', [name]);
  }

  /**
   * Create new faction
   * @param {Object} factionData - Faction data
   * @param {string} factionData.name - Faction name
   * @param {string} factionData.description - Faction description
   * @returns {Object} Created faction with ID
   */
  static create(factionData) {
    const { name, description } = factionData;
    const result = run('INSERT INTO factions (name, description) VALUES (?, ?)', [name, description || null]);

    return {
      id: result.lastID,
      name,
      description: description || null,
    };
  }

  /**
   * Update faction
   * @param {number} id - Faction ID
   * @param {Object} factionData - Updated faction data
   */
  static update(id, factionData) {
    const { name, description } = factionData;

    if (name) {
      run('UPDATE factions SET name = ? WHERE id = ?', [name, id]);
    }

    if (description !== undefined) {
      run('UPDATE factions SET description = ? WHERE id = ?', [description, id]);
    }
  }

  /**
   * Delete faction
   * @param {number} id - Faction ID
   */
  static delete(id) {
    run('DELETE FROM factions WHERE id = ?', [id]);
  }

  /**
   * Check if faction name exists
   * @param {string} name - Faction name
   * @returns {boolean} True if exists
   */
  static nameExists(name) {
    const result = get('SELECT COUNT(*) as count FROM factions WHERE name = ?', [name]);
    return result.count > 0;
  }

  /**
   * Check if faction is in use by miniatures
   * @param {number} id - Faction ID
   * @returns {boolean} True if in use
   */
  static isInUse(id) {
    const result = get('SELECT COUNT(*) as count FROM miniatures WHERE faction_id = ?', [id]);
    return result.count > 0;
  }
}

module.exports = Faction;
