// models/Miniature.js
const { get, run, all } = require('../config/database');

/**
 * Miniature Model
 * Handles all database operations for miniatures
 */
class Miniature {
  /**
   * Get all miniatures with optional filtering
   * @param {Object} filters - Filter options
   * @param {number} filters.factionId - Filter by faction ID
   * @param {number} filters.unitTypeId - Filter by unit type ID
   * @param {string} filters.search - Search by name
   * @param {number} filters.limit - Results per page
   * @param {number} filters.offset - Pagination offset
   * @returns {Object} Object with miniatures array and total count
   */
  static getAll(filters = {}) {
    const { factionId, unitTypeId, search, limit = 50, offset = 0 } = filters;

    // Build query
    let query = `
      SELECT
        m.*,
        f.name as faction_name,
        ut.name as unit_type_name
      FROM miniatures m
      LEFT JOIN factions f ON m.faction_id = f.id
      LEFT JOIN unit_types ut ON m.unit_type_id = ut.id
      WHERE 1=1
    `;
    const params = [];

    if (factionId) {
      query += ' AND m.faction_id = ?';
      params.push(factionId);
    }

    if (unitTypeId) {
      query += ' AND m.unit_type_id = ?';
      params.push(unitTypeId);
    }

    if (search) {
      query += ' AND m.name LIKE ?';
      params.push(`%${search}%`);
    }

    // Get total count
    const countQuery = query.replace(/SELECT.*FROM/s, 'SELECT COUNT(*) as count FROM');
    const countResult = get(countQuery, params);
    const total = countResult.count;

    // Add ordering and pagination
    query += ' ORDER BY m.name LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const miniatures = all(query, params);

    return {
      miniatures: miniatures.map((m) => ({
        id: m.id,
        name: m.name,
        factionId: m.faction_id,
        factionName: m.faction_name,
        unitTypeId: m.unit_type_id,
        unitTypeName: m.unit_type_name,
        pointsValue: m.points_value,
        baseSize: m.base_size,
        description: m.description,
        createdAt: m.created_at,
      })),
      total,
      limit,
      offset,
      hasMore: offset + miniatures.length < total,
    };
  }

  /**
   * Find miniature by ID with related data
   * @param {number} id - Miniature ID
   * @returns {Object|undefined} Miniature object with faction and unit type
   */
  static findById(id) {
    const miniature = get(
      `
      SELECT
        m.*,
        f.id as faction_id,
        f.name as faction_name,
        ut.id as unit_type_id,
        ut.name as unit_type_name
      FROM miniatures m
      LEFT JOIN factions f ON m.faction_id = f.id
      LEFT JOIN unit_types ut ON m.unit_type_id = ut.id
      WHERE m.id = ?
    `,
      [id]
    );

    if (!miniature) {
      return undefined;
    }

    return {
      id: miniature.id,
      name: miniature.name,
      faction: {
        id: miniature.faction_id,
        name: miniature.faction_name,
      },
      unitType: {
        id: miniature.unit_type_id,
        name: miniature.unit_type_name,
      },
      pointsValue: miniature.points_value,
      baseSize: miniature.base_size,
      description: miniature.description,
      createdAt: miniature.created_at,
    };
  }

  /**
   * Create new miniature
   * @param {Object} miniatureData - Miniature data
   * @returns {Object} Created miniature with ID
   */
  static create(miniatureData) {
    const { name, factionId, unitTypeId, pointsValue, baseSize, description } = miniatureData;

    const result = run(
      `
      INSERT INTO miniatures (name, faction_id, unit_type_id, points_value, base_size, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [name, factionId || null, unitTypeId || null, pointsValue || null, baseSize || null, description || null]
    );

    return {
      id: result.lastID,
      name,
      factionId: factionId || null,
      unitTypeId: unitTypeId || null,
      pointsValue: pointsValue || null,
      baseSize: baseSize || null,
      description: description || null,
    };
  }

  /**
   * Update miniature
   * @param {number} id - Miniature ID
   * @param {Object} miniatureData - Updated miniature data
   */
  static update(id, miniatureData) {
    const updates = [];
    const params = [];

    if (miniatureData.name !== undefined) {
      updates.push('name = ?');
      params.push(miniatureData.name);
    }

    if (miniatureData.factionId !== undefined) {
      updates.push('faction_id = ?');
      params.push(miniatureData.factionId || null);
    }

    if (miniatureData.unitTypeId !== undefined) {
      updates.push('unit_type_id = ?');
      params.push(miniatureData.unitTypeId || null);
    }

    if (miniatureData.pointsValue !== undefined) {
      updates.push('points_value = ?');
      params.push(miniatureData.pointsValue || null);
    }

    if (miniatureData.baseSize !== undefined) {
      updates.push('base_size = ?');
      params.push(miniatureData.baseSize || null);
    }

    if (miniatureData.description !== undefined) {
      updates.push('description = ?');
      params.push(miniatureData.description || null);
    }

    if (updates.length > 0) {
      params.push(id);
      run(`UPDATE miniatures SET ${updates.join(', ')} WHERE id = ?`, params);
    }
  }

  /**
   * Delete miniature
   * @param {number} id - Miniature ID
   */
  static delete(id) {
    run('DELETE FROM miniatures WHERE id = ?', [id]);
  }

  /**
   * Check if miniature is in use by list items
   * @param {number} id - Miniature ID
   * @returns {boolean} True if in use
   */
  static isInUse(id) {
    const result = get('SELECT COUNT(*) as count FROM list_items WHERE miniature_id = ?', [id]);
    return result.count > 0;
  }
}

module.exports = Miniature;
