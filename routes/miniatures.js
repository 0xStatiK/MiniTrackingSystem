// routes/miniatures.js
const express = require('express');

const router = express.Router();
const Miniature = require('../models/Miniature');
const { isAdmin } = require('../middleware/auth');

/**
 * GET /api/miniatures
 * Get all miniatures with optional filtering
 * Public endpoint
 */
router.get('/', (req, res) => {
  try {
    const { faction, unitType, search, limit, offset } = req.query;

    const filters = {
      factionId: faction ? parseInt(faction, 10) : undefined,
      unitTypeId: unitType ? parseInt(unitType, 10) : undefined,
      search: search || undefined,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    };

    const result = Miniature.getAll(filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get miniatures error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get miniatures',
        code: 'INTERNAL_ERROR',
      },
    });
  }
});

/**
 * GET /api/miniatures/:id
 * Get single miniature with full details
 * Public endpoint
 */
router.get('/:id', (req, res) => {
  try {
    const miniature = Miniature.findById(req.params.id);

    if (!miniature) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Miniature not found',
          code: 'NOT_FOUND',
        },
      });
    }

    res.json({
      success: true,
      data: miniature,
    });
  } catch (error) {
    console.error('Get miniature error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get miniature',
        code: 'INTERNAL_ERROR',
      },
    });
  }
});

/**
 * POST /api/miniatures
 * Create new miniature
 * Admin only
 */
router.post('/', isAdmin, (req, res) => {
  try {
    const { name, factionId, unitTypeId, pointsValue, baseSize, description } = req.body;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Miniature name is required',
          code: 'VALIDATION_ERROR',
          field: 'name',
        },
      });
    }

    // Validate points value if provided
    if (pointsValue !== undefined && pointsValue !== null) {
      const points = parseInt(pointsValue, 10);
      if (Number.isNaN(points) || points < 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Points value must be a positive number',
            code: 'VALIDATION_ERROR',
            field: 'pointsValue',
          },
        });
      }
    }

    const miniature = Miniature.create({
      name: name.trim(),
      factionId: factionId || null,
      unitTypeId: unitTypeId || null,
      pointsValue: pointsValue || null,
      baseSize: baseSize?.trim() || null,
      description: description?.trim() || null,
    });

    res.status(201).json({
      success: true,
      data: miniature,
    });
  } catch (error) {
    console.error('Create miniature error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create miniature',
        code: 'INTERNAL_ERROR',
      },
    });
  }
});

/**
 * PUT /api/miniatures/:id
 * Update miniature
 * Admin only
 */
router.put('/:id', isAdmin, (req, res) => {
  try {
    const miniatureId = req.params.id;
    const { name, factionId, unitTypeId, pointsValue, baseSize, description } = req.body;

    // Check if miniature exists
    const miniature = Miniature.findById(miniatureId);
    if (!miniature) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Miniature not found',
          code: 'NOT_FOUND',
        },
      });
    }

    // Validate name if provided
    if (name !== undefined && name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Miniature name cannot be empty',
          code: 'VALIDATION_ERROR',
          field: 'name',
        },
      });
    }

    // Validate points value if provided
    if (pointsValue !== undefined && pointsValue !== null) {
      const points = parseInt(pointsValue, 10);
      if (Number.isNaN(points) || points < 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Points value must be a positive number',
            code: 'VALIDATION_ERROR',
            field: 'pointsValue',
          },
        });
      }
    }

    Miniature.update(miniatureId, {
      name: name?.trim(),
      factionId,
      unitTypeId,
      pointsValue,
      baseSize: baseSize?.trim(),
      description: description?.trim(),
    });

    res.json({
      success: true,
      data: {
        message: 'Miniature updated successfully',
      },
    });
  } catch (error) {
    console.error('Update miniature error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update miniature',
        code: 'INTERNAL_ERROR',
      },
    });
  }
});

/**
 * DELETE /api/miniatures/:id
 * Delete miniature
 * Admin only
 */
router.delete('/:id', isAdmin, (req, res) => {
  try {
    const miniatureId = req.params.id;

    // Check if miniature exists
    const miniature = Miniature.findById(miniatureId);
    if (!miniature) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Miniature not found',
          code: 'NOT_FOUND',
        },
      });
    }

    // Check if miniature is in use
    if (Miniature.isInUse(miniatureId)) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Cannot delete miniature that is in use by lists',
          code: 'CONFLICT',
        },
      });
    }

    Miniature.delete(miniatureId);

    res.json({
      success: true,
      data: {
        message: 'Miniature deleted successfully',
      },
    });
  } catch (error) {
    console.error('Delete miniature error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete miniature',
        code: 'INTERNAL_ERROR',
      },
    });
  }
});

module.exports = router;
