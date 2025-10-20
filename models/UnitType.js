// models/UnitType.js
const { get, run, all } = require('../config/database');

/**
 * UnitType Model
 * Handles all database operations for unit types
 */
class UnitType {
  /**
   * Get all unit types
   * @returns {Array} Array of unit type objects
   */
  static getAll() {
    return all('SELECT * FROM unit_types ORDER BY name');
  }

  /**
   * Find unit type by ID
   * @param {number} id - Unit type ID
   * @returns {Object|undefined} Unit type object
   */
  static findById(id) {
    return get('SELECT * FROM unit_types WHERE id = ?', [id]);
  }

  /**
   * Find unit type by name
   * @param {string} name - Unit type name
   * @returns {Object|undefined} Unit type object
   */
  static findByName(name) {
    return get('SELECT * FROM unit_types WHERE name = ?', [name]);
  }

  /**
   * Create new unit type
   * @param {Object} unitTypeData - Unit type data
   * @param {string} unitTypeData.name - Unit type name
   * @param {string} unitTypeData.description - Unit type description
   * @returns {Object} Created unit type with ID
   */
  static create(unitTypeData) {
    const { name, description } = unitTypeData;
    const result = run(
      'INSERT INTO unit_types (name, description) VALUES (?, ?)',
      [name, description || null]
    );

    return {
      id: result.lastID,
      name,
      description: description || null
    };
  }

  /**
   * Update unit type
   * @param {number} id - Unit type ID
   * @param {Object} unitTypeData - Updated unit type data
   */
  static update(id, unitTypeData) {
    const { name, description } = unitTypeData;

    if (name) {
      run('UPDATE unit_types SET name = ? WHERE id = ?', [name, id]);
    }

    if (description !== undefined) {
      run('UPDATE unit_types SET description = ? WHERE id = ?', [description, id]);
    }
  }

  /**
   * Delete unit type
   * @param {number} id - Unit type ID
   */
  static delete(id) {
    run('DELETE FROM unit_types WHERE id = ?', [id]);
  }

  /**
   * Check if unit type name exists
   * @param {string} name - Unit type name
   * @returns {boolean} True if exists
   */
  static nameExists(name) {
    const result = get('SELECT COUNT(*) as count FROM unit_types WHERE name = ?', [name]);
    return result.count > 0;
  }

  /**
   * Check if unit type is in use by miniatures
   * @param {number} id - Unit type ID
   * @returns {boolean} True if in use
   */
  static isInUse(id) {
    const result = get('SELECT COUNT(*) as count FROM miniatures WHERE unit_type_id = ?', [id]);
    return result.count > 0;
  }
}

module.exports = UnitType;
