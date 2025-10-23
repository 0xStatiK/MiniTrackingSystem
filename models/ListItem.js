// models/ListItem.js
const { get, run } = require('../config/database');

/**
 * ListItem Model
 * Handles all database operations for list items
 */
class ListItem {
  /**
   * Valid assembly status values
   */
  static ASSEMBLY_STATUS = ['Not Started', 'In Progress', 'Assembled'];

  /**
   * Valid painting status values
   */
  static PAINTING_STATUS = [
    'Unpainted',
    'Primed',
    'Base Coated',
    'Detailed',
    'Finished',
  ];

  /**
   * Find list item by ID
   * @param {number} id - List item ID
   * @returns {Object|undefined} List item object
   */
  static findById(id) {
    return get('SELECT * FROM list_items WHERE id = ?', [id]);
  }

  /**
   * Add miniature to list
   * @param {Object} itemData - List item data
   * @returns {Object} Created list item with ID
   */
  static create(itemData) {
    const {
      listId,
      miniatureId,
      quantity,
      assemblyStatus,
      paintingStatus,
      notes,
    } = itemData;

    const result = run(
      `
      INSERT INTO list_items (
        list_id, miniature_id, quantity,
        assembly_status, painting_status, notes
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        listId,
        miniatureId,
        quantity || 1,
        assemblyStatus || 'Not Started',
        paintingStatus || 'Unpainted',
        notes || null,
      ]
    );

    // Update list's updated_at timestamp
    run("UPDATE lists SET updated_at = datetime('now') WHERE id = ?", [
      listId,
    ]);

    return {
      id: result.lastID,
      listId,
      miniatureId,
      quantity: quantity || 1,
      assemblyStatus: assemblyStatus || 'Not Started',
      paintingStatus: paintingStatus || 'Unpainted',
      notes: notes || null,
    };
  }

  /**
   * Update list item
   * @param {number} id - List item ID
   * @param {Object} itemData - Updated data
   */
  static update(id, itemData) {
    const updates = [];
    const params = [];

    if (itemData.quantity !== undefined) {
      updates.push('quantity = ?');
      params.push(itemData.quantity);
    }

    if (itemData.assemblyStatus !== undefined) {
      updates.push('assembly_status = ?');
      params.push(itemData.assemblyStatus);
    }

    if (itemData.paintingStatus !== undefined) {
      updates.push('painting_status = ?');
      params.push(itemData.paintingStatus);
    }

    if (itemData.notes !== undefined) {
      updates.push('notes = ?');
      params.push(itemData.notes);
    }

    if (updates.length > 0) {
      params.push(id);
      run(`UPDATE list_items SET ${updates.join(', ')} WHERE id = ?`, params);

      // Update list's updated_at timestamp
      const item = ListItem.findById(id);
      if (item) {
        run("UPDATE lists SET updated_at = datetime('now') WHERE id = ?", [
          item.list_id,
        ]);
      }
    }
  }

  /**
   * Delete list item
   * @param {number} id - List item ID
   */
  static delete(id) {
    // Get list ID before deleting
    const item = ListItem.findById(id);

    run('DELETE FROM list_items WHERE id = ?', [id]);

    // Update list's updated_at timestamp
    if (item) {
      run("UPDATE lists SET updated_at = datetime('now') WHERE id = ?", [
        item.list_id,
      ]);
    }
  }

  /**
   * Get list ID for a list item
   * @param {number} itemId - List item ID
   * @returns {number|null} List ID
   */
  static getListId(itemId) {
    const item = get('SELECT list_id FROM list_items WHERE id = ?', [itemId]);
    return item ? item.list_id : null;
  }

  /**
   * Validate assembly status
   * @param {string} status - Status to validate
   * @returns {boolean} True if valid
   */
  static isValidAssemblyStatus(status) {
    return ListItem.ASSEMBLY_STATUS.includes(status);
  }

  /**
   * Validate painting status
   * @param {string} status - Status to validate
   * @returns {boolean} True if valid
   */
  static isValidPaintingStatus(status) {
    return ListItem.PAINTING_STATUS.includes(status);
  }
}

module.exports = ListItem;
