// models/Metadata.js
const { get, run } = require('../config/database');

/**
 * Metadata Model
 * Handles all database operations for list item metadata
 */
class Metadata {
  /**
   * Find metadata by list item ID
   * @param {number} listItemId - List item ID
   * @returns {Object|undefined} Metadata object
   */
  static findByListItemId(listItemId) {
    return get('SELECT * FROM metadata WHERE list_item_id = ?', [listItemId]);
  }

  /**
   * Find metadata by ID
   * @param {number} id - Metadata ID
   * @returns {Object|undefined} Metadata object
   */
  static findById(id) {
    return get('SELECT * FROM metadata WHERE id = ?', [id]);
  }

  /**
   * Create or update metadata for a list item
   * @param {number} listItemId - List item ID
   * @param {Object} metadataData - Metadata values
   * @returns {Object} Created/updated metadata with ID
   */
  static createOrUpdate(listItemId, metadataData) {
    const existing = Metadata.findByListItemId(listItemId);

    if (existing) {
      // Update existing metadata
      Metadata.update(existing.id, metadataData);
      return {
        id: existing.id,
        listItemId,
        ...metadataData,
      };
    }

    // Create new metadata
    const {
      paintColors,
      techniques,
      purchaseDate,
      cost,
      storageLocation,
      customNotes,
    } = metadataData;

    const result = run(
      `
      INSERT INTO metadata (
        list_item_id, paint_colors, techniques,
        purchase_date, cost, storage_location, custom_notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        listItemId,
        paintColors || null,
        techniques || null,
        purchaseDate || null,
        cost !== undefined ? cost : null,
        storageLocation || null,
        customNotes || null,
      ]
    );

    return {
      id: result.lastID,
      listItemId,
      paintColors: paintColors || null,
      techniques: techniques || null,
      purchaseDate: purchaseDate || null,
      cost: cost !== undefined ? cost : null,
      storageLocation: storageLocation || null,
      customNotes: customNotes || null,
    };
  }

  /**
   * Update metadata
   * @param {number} id - Metadata ID
   * @param {Object} metadataData - Updated values
   */
  static update(id, metadataData) {
    const updates = [];
    const params = [];

    if (metadataData.paintColors !== undefined) {
      updates.push('paint_colors = ?');
      params.push(metadataData.paintColors);
    }

    if (metadataData.techniques !== undefined) {
      updates.push('techniques = ?');
      params.push(metadataData.techniques);
    }

    if (metadataData.purchaseDate !== undefined) {
      updates.push('purchase_date = ?');
      params.push(metadataData.purchaseDate);
    }

    if (metadataData.cost !== undefined) {
      updates.push('cost = ?');
      params.push(metadataData.cost);
    }

    if (metadataData.storageLocation !== undefined) {
      updates.push('storage_location = ?');
      params.push(metadataData.storageLocation);
    }

    if (metadataData.customNotes !== undefined) {
      updates.push('custom_notes = ?');
      params.push(metadataData.customNotes);
    }

    if (updates.length > 0) {
      params.push(id);
      run(`UPDATE metadata SET ${updates.join(', ')} WHERE id = ?`, params);
    }
  }

  /**
   * Delete metadata
   * @param {number} id - Metadata ID
   */
  static delete(id) {
    run('DELETE FROM metadata WHERE id = ?', [id]);
  }

  /**
   * Get list item ID for metadata
   * @param {number} metadataId - Metadata ID
   * @returns {number|null} List item ID
   */
  static getListItemId(metadataId) {
    const metadata = get('SELECT list_item_id FROM metadata WHERE id = ?', [
      metadataId,
    ]);
    return metadata ? metadata.list_item_id : null;
  }

  /**
   * Validate date format (YYYY-MM-DD)
   * @param {string} date - Date string
   * @returns {boolean} True if valid
   */
  static isValidDate(date) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(date)) {
      return false;
    }

    const dateObj = new Date(date);
    return dateObj instanceof Date && !Number.isNaN(dateObj.getTime());
  }
}

module.exports = Metadata;
