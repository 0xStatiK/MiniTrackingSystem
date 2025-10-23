// routes/metadata.js
const express = require('express');

const router = express.Router();
const Metadata = require('../models/Metadata');
const ListItem = require('../models/ListItem');
const List = require('../models/List');
const { isAuthenticated } = require('../middleware/auth');

/**
 * GET /api/list-items/:id/metadata
 * Get metadata for list item
 */
router.get('/:id/metadata', (req, res) => {
  try {
    const listItemId = parseInt(req.params.id, 10);

    // Get list ID from item to check permissions
    const listId = ListItem.getListId(listItemId);

    if (!listId) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'List item not found',
          code: 'NOT_FOUND',
        },
      });
    }

    // Check if user can view this list
    const isOwner =
      req.session?.userId && List.isOwnedBy(listId, req.session.userId);
    const isPublicList = List.isPublic(listId);

    if (!isPublicList && !isOwner) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You do not have permission to view this metadata',
          code: 'FORBIDDEN',
        },
      });
    }

    const metadata = Metadata.findByListItemId(listItemId);

    if (!metadata) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'No metadata found for this item',
          code: 'NOT_FOUND',
        },
      });
    }

    res.json({
      success: true,
      data: {
        id: metadata.id,
        listItemId: metadata.list_item_id,
        paintColors: metadata.paint_colors,
        techniques: metadata.techniques,
        purchaseDate: metadata.purchase_date,
        cost: metadata.cost,
        storageLocation: metadata.storage_location,
        customNotes: metadata.custom_notes,
      },
    });
  } catch (error) {
    console.error('Get metadata error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get metadata',
        code: 'INTERNAL_ERROR',
      },
    });
  }
});

/**
 * POST /api/list-items/:id/metadata
 * Create or update metadata
 */
router.post('/:id/metadata', isAuthenticated, (req, res) => {
  try {
    const listItemId = parseInt(req.params.id, 10);
    const {
      paintColors,
      techniques,
      purchaseDate,
      cost,
      storageLocation,
      customNotes,
    } = req.body;

    // Get list ID from item
    const listId = ListItem.getListId(listItemId);

    if (!listId) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'List item not found',
          code: 'NOT_FOUND',
        },
      });
    }

    // Check if user owns the list
    if (!List.isOwnedBy(listId, req.session.userId)) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You do not have permission to edit this metadata',
          code: 'FORBIDDEN',
        },
      });
    }

    // Validation
    if (purchaseDate && !Metadata.isValidDate(purchaseDate)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid date format. Use YYYY-MM-DD',
          code: 'VALIDATION_ERROR',
          field: 'purchaseDate',
        },
      });
    }

    if (cost !== undefined && (cost < 0 || Number.isNaN(Number(cost)))) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cost must be a positive number',
          code: 'VALIDATION_ERROR',
          field: 'cost',
        },
      });
    }

    const metadata = Metadata.createOrUpdate(listItemId, {
      paintColors,
      techniques,
      purchaseDate,
      cost: cost !== undefined ? Number(cost) : undefined,
      storageLocation,
      customNotes,
    });

    res.status(metadata.id ? 200 : 201).json({
      success: true,
      data: {
        message: 'Metadata saved successfully',
        id: metadata.id,
      },
    });
  } catch (error) {
    console.error('Save metadata error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to save metadata',
        code: 'INTERNAL_ERROR',
      },
    });
  }
});

/**
 * DELETE /api/metadata/:id
 * Delete metadata
 */
router.delete('/:id', isAuthenticated, (req, res) => {
  try {
    const metadataId = parseInt(req.params.id, 10);

    // Get list item ID from metadata
    const listItemId = Metadata.getListItemId(metadataId);

    if (!listItemId) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Metadata not found',
          code: 'NOT_FOUND',
        },
      });
    }

    // Get list ID from item
    const listId = ListItem.getListId(listItemId);

    // Check if user owns the list
    if (!List.isOwnedBy(listId, req.session.userId)) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You do not have permission to delete this metadata',
          code: 'FORBIDDEN',
        },
      });
    }

    Metadata.delete(metadataId);

    res.json({
      success: true,
      data: {
        message: 'Metadata deleted successfully',
      },
    });
  } catch (error) {
    console.error('Delete metadata error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete metadata',
        code: 'INTERNAL_ERROR',
      },
    });
  }
});

module.exports = router;
