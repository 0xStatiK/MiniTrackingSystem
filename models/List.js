// models/List.js
const { get, run, all } = require('../config/database');

/**
 * List Model
 * Handles all database operations for lists
 */
class List {
  /**
   * Get all lists for a specific user
   * @param {number} userId - User ID
   * @returns {Array} Array of list objects with item counts
   */
  static getAllByUser(userId) {
    const lists = all(
      `
      SELECT
        l.*,
        COUNT(li.id) as item_count
      FROM lists l
      LEFT JOIN list_items li ON l.id = li.list_id
      WHERE l.user_id = ?
      GROUP BY l.id
      ORDER BY l.updated_at DESC
    `,
      [userId]
    );

    return lists.map((list) => ({
      id: list.id,
      userId: list.user_id,
      name: list.name,
      description: list.description,
      isPublic: Boolean(list.is_public),
      itemCount: list.item_count,
      createdAt: list.created_at,
      updatedAt: list.updated_at,
    }));
  }

  /**
   * Get all public lists
   * @param {number} limit - Results per page
   * @param {number} offset - Pagination offset
   * @returns {Object} Object with lists array and total count
   */
  static getAllPublic(limit = 20, offset = 0) {
    const lists = all(
      `
      SELECT
        l.*,
        u.username,
        COUNT(li.id) as item_count
      FROM lists l
      INNER JOIN users u ON l.user_id = u.id
      LEFT JOIN list_items li ON l.id = li.list_id
      WHERE l.is_public = 1
      GROUP BY l.id
      ORDER BY l.updated_at DESC
      LIMIT ? OFFSET ?
    `,
      [limit, offset]
    );

    const countResult = get('SELECT COUNT(*) as count FROM lists WHERE is_public = 1');

    return {
      lists: lists.map((list) => ({
        id: list.id,
        userId: list.user_id,
        username: list.username,
        name: list.name,
        description: list.description,
        itemCount: list.item_count,
        createdAt: list.created_at,
        updatedAt: list.updated_at,
      })),
      total: countResult.count,
      limit,
      offset,
      hasMore: offset + lists.length < countResult.count,
    };
  }

  /**
   * Get single list with all items
   * @param {number} id - List ID
   * @returns {Object|undefined} List with items array
   */
  static findById(id) {
    const list = get(
      `
      SELECT l.*, u.username
      FROM lists l
      INNER JOIN users u ON l.user_id = u.id
      WHERE l.id = ?
    `,
      [id]
    );

    if (!list) {
      return undefined;
    }

    // Get all items in this list
    const items = all(
      `
      SELECT
        li.*,
        m.name as miniature_name,
        f.name as faction_name,
        ut.name as unit_type_name
      FROM list_items li
      INNER JOIN miniatures m ON li.miniature_id = m.id
      LEFT JOIN factions f ON m.faction_id = f.id
      LEFT JOIN unit_types ut ON m.unit_type_id = ut.id
      WHERE li.list_id = ?
      ORDER BY li.added_at DESC
    `,
      [id]
    );

    // Calculate statistics
    const stats = {
      totalItems: items.length,
      totalPoints: items.reduce((sum, item) => sum + (item.points_value || 0) * item.quantity, 0),
      assemblyProgress: {
        'Not Started': 0,
        'In Progress': 0,
        Assembled: 0,
      },
      paintingProgress: {
        Unpainted: 0,
        Primed: 0,
        'Base Coated': 0,
        Detailed: 0,
        Finished: 0,
      },
    };

    items.forEach((item) => {
      stats.assemblyProgress[item.assembly_status] += item.quantity;
      stats.paintingProgress[item.painting_status] += item.quantity;
    });

    return {
      list: {
        id: list.id,
        userId: list.user_id,
        username: list.username,
        name: list.name,
        description: list.description,
        isPublic: Boolean(list.is_public),
        createdAt: list.created_at,
        updatedAt: list.updated_at,
      },
      items: items.map((item) => ({
        id: item.id,
        miniatureId: item.miniature_id,
        miniatureName: item.miniature_name,
        factionName: item.faction_name,
        unitTypeName: item.unit_type_name,
        quantity: item.quantity,
        assemblyStatus: item.assembly_status,
        paintingStatus: item.painting_status,
        notes: item.notes,
        addedAt: item.added_at,
      })),
      statistics: stats,
    };
  }

  /**
   * Create new list
   * @param {Object} listData - List data
   * @returns {Object} Created list with ID
   */
  static create(listData) {
    const { userId, name, description, isPublic } = listData;

    const result = run(
      `
      INSERT INTO lists (user_id, name, description, is_public)
      VALUES (?, ?, ?, ?)
    `,
      [userId, name, description || null, isPublic ? 1 : 0]
    );

    return {
      id: result.lastID,
      userId,
      name,
      description: description || null,
      isPublic: Boolean(isPublic),
    };
  }

  /**
   * Update list
   * @param {number} id - List ID
   * @param {Object} listData - Updated data
   */
  static update(id, listData) {
    const updates = [];
    const params = [];

    if (listData.name !== undefined) {
      updates.push('name = ?');
      params.push(listData.name);
    }

    if (listData.description !== undefined) {
      updates.push('description = ?');
      params.push(listData.description);
    }

    if (listData.isPublic !== undefined) {
      updates.push('is_public = ?');
      params.push(listData.isPublic ? 1 : 0);
    }

    updates.push("updated_at = datetime('now')");

    if (updates.length > 0) {
      params.push(id);
      run(`UPDATE lists SET ${updates.join(', ')} WHERE id = ?`, params);
    }
  }

  /**
   * Delete list
   * @param {number} id - List ID
   */
  static delete(id) {
    run('DELETE FROM lists WHERE id = ?', [id]);
  }

  /**
   * Check if user owns a list
   * @param {number} listId - List ID
   * @param {number} userId - User ID
   * @returns {boolean} True if user owns the list
   */
  static isOwnedBy(listId, userId) {
    const result = get('SELECT COUNT(*) as count FROM lists WHERE id = ? AND user_id = ?', [listId, userId]);
    return result.count > 0;
  }

  /**
   * Check if list is public
   * @param {number} id - List ID
   * @returns {boolean} True if list is public
   */
  static isPublic(id) {
    const result = get('SELECT is_public FROM lists WHERE id = ?', [id]);
    return result ? Boolean(result.is_public) : false;
  }
}

module.exports = List;
