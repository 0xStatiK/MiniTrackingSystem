// routes/lists.js
const express = require('express');

const router = express.Router();
const List = require('../models/List');
const { isAuthenticated, optionalAuth } = require('../middleware/auth');

/**
 * GET /api/lists
 * Get lists (user's own lists if authenticated, or public lists)
 * Public endpoint with optional auth
 */
router.get('/', optionalAuth, (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // If authenticated, return user's own lists
    if (req.session && req.session.userId) {
      const lists = List.getAllByUser(req.session.userId);

      return res.json({
        success: true,
        data: lists,
      });
    }

    // Otherwise, return public lists
    const result = List.getAllPublic(parseInt(limit, 10), offset);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get lists error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get lists',
        code: 'INTERNAL_ERROR',
      },
    });
  }
});

/**
 * GET /api/lists/:id
 * Get single list with all items and statistics
 * Public for public lists, requires auth for private lists
 */
router.get('/:id', optionalAuth, (req, res) => {
  try {
    const listId = req.params.id;
    const result = List.findById(listId);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'List not found',
          code: 'NOT_FOUND',
        },
      });
    }

    // Check if user has permission to view this list
    const isOwner = req.session && req.session.userId === result.list.userId;
    const isPublic = result.list.isPublic;

    if (!isPublic && !isOwner) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied. This list is private.',
          code: 'FORBIDDEN',
        },
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get list error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get list',
        code: 'INTERNAL_ERROR',
      },
    });
  }
});

/**
 * POST /api/lists
 * Create new list
 * Requires authentication
 */
router.post('/', isAuthenticated, (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'List name is required',
          code: 'VALIDATION_ERROR',
          field: 'name',
        },
      });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'List name must be 100 characters or less',
          code: 'VALIDATION_ERROR',
          field: 'name',
        },
      });
    }

    const list = List.create({
      userId: req.session.userId,
      name: name.trim(),
      description: description?.trim() || null,
      isPublic: Boolean(isPublic),
    });

    res.status(201).json({
      success: true,
      data: list,
      message: 'List created successfully',
    });
  } catch (error) {
    console.error('Create list error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create list',
        code: 'INTERNAL_ERROR',
      },
    });
  }
});

/**
 * PUT /api/lists/:id
 * Update list
 * Requires authentication and ownership
 */
router.put('/:id', isAuthenticated, (req, res) => {
  try {
    const listId = req.params.id;
    const { name, description, isPublic } = req.body;

    // Check if list exists
    const result = List.findById(listId);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'List not found',
          code: 'NOT_FOUND',
        },
      });
    }

    // Check ownership
    if (!List.isOwnedBy(listId, req.session.userId)) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied. You can only edit your own lists.',
          code: 'FORBIDDEN',
        },
      });
    }

    // Validate name if provided
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'List name cannot be empty',
            code: 'VALIDATION_ERROR',
            field: 'name',
          },
        });
      }

      if (name.trim().length > 100) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'List name must be 100 characters or less',
            code: 'VALIDATION_ERROR',
            field: 'name',
          },
        });
      }
    }

    // Update the list
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim() || null;
    if (isPublic !== undefined) updateData.isPublic = Boolean(isPublic);

    List.update(listId, updateData);

    res.json({
      success: true,
      data: {
        message: 'List updated successfully',
      },
    });
  } catch (error) {
    console.error('Update list error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update list',
        code: 'INTERNAL_ERROR',
      },
    });
  }
});

/**
 * DELETE /api/lists/:id
 * Delete list
 * Requires authentication and ownership
 */
router.delete('/:id', isAuthenticated, (req, res) => {
  try {
    const listId = req.params.id;

    // Check if list exists
    const result = List.findById(listId);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'List not found',
          code: 'NOT_FOUND',
        },
      });
    }

    // Check ownership
    if (!List.isOwnedBy(listId, req.session.userId)) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied. You can only delete your own lists.',
          code: 'FORBIDDEN',
        },
      });
    }

    // Delete the list (will cascade delete all items and metadata)
    List.delete(listId);

    res.json({
      success: true,
      data: {
        message: 'List deleted successfully',
      },
    });
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete list',
        code: 'INTERNAL_ERROR',
      },
    });
  }
});

module.exports = router;
