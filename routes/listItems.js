// routes/listItems.js
const express = require('express');

const router = express.Router();
const ListItem = require('../models/ListItem');
const List = require('../models/List');
const { isAuthenticated } = require('../middleware/auth');

/**
 * PUT /api/list-items/:id
 * Update list item
 * Requires authentication and ownership
 */
router.put('/:id', isAuthenticated, (req, res) => {
  try {
    const itemId = parseInt(req.params.id, 10);
    const { quantity, assemblyStatus, paintingStatus, notes } = req.body;

    // Get list ID from item
    const listId = ListItem.getListId(itemId);

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
          message: 'You do not have permission to edit this item',
          code: 'FORBIDDEN',
        },
      });
    }

    // Validation
    if (quantity !== undefined && (quantity < 1 || !Number.isInteger(quantity))) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Quantity must be a positive integer',
          code: 'VALIDATION_ERROR',
          field: 'quantity',
        },
      });
    }

    if (assemblyStatus && !ListItem.isValidAssemblyStatus(assemblyStatus)) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Invalid assembly status. Must be one of: ${ListItem.ASSEMBLY_STATUS.join(', ')}`,
          code: 'VALIDATION_ERROR',
          field: 'assemblyStatus',
        },
      });
    }

    if (paintingStatus && !ListItem.isValidPaintingStatus(paintingStatus)) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Invalid painting status. Must be one of: ${ListItem.PAINTING_STATUS.join(', ')}`,
          code: 'VALIDATION_ERROR',
          field: 'paintingStatus',
        },
      });
    }

    ListItem.update(itemId, {
      quantity,
      assemblyStatus,
      paintingStatus,
      notes,
    });

    res.json({
      success: true,
      data: {
        message: 'List item updated successfully',
      },
    });
  } catch (error) {
    console.error('Update list item error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update list item',
        code: 'INTERNAL_ERROR',
      },
    });
  }
});

/**
 * DELETE /api/list-items/:id
 * Remove item from list
 * Requires authentication and ownership
 */
router.delete('/:id', isAuthenticated, (req, res) => {
  try {
    const itemId = parseInt(req.params.id, 10);

    // Get list ID from item
    const listId = ListItem.getListId(itemId);

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
          message: 'You do not have permission to delete this item',
          code: 'FORBIDDEN',
        },
      });
    }

    ListItem.delete(itemId);

    res.json({
      success: true,
      data: {
        message: 'Item removed from list successfully',
      },
    });
  } catch (error) {
    console.error('Delete list item error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to remove item from list',
        code: 'INTERNAL_ERROR',
      },
    });
  }
});

module.exports = router;
