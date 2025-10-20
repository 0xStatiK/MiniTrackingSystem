// routes/factions.js
const express = require('express');
const router = express.Router();
const Faction = require('../models/Faction');
const { isAdmin } = require('../middleware/auth');

/**
 * GET /api/factions
 * Get all factions
 * Public endpoint
 */
router.get('/', (req, res) => {
  try {
    const factions = Faction.getAll();

    res.json({
      success: true,
      data: factions
    });

  } catch (error) {
    console.error('Get factions error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get factions',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

/**
 * GET /api/factions/:id
 * Get single faction
 * Public endpoint
 */
router.get('/:id', (req, res) => {
  try {
    const faction = Faction.findById(req.params.id);

    if (!faction) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Faction not found',
          code: 'NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: faction
    });

  } catch (error) {
    console.error('Get faction error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get faction',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

/**
 * POST /api/factions
 * Create new faction
 * Admin only
 */
router.post('/', isAdmin, (req, res) => {
  try {
    const { name, description } = req.body;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Faction name is required',
          code: 'VALIDATION_ERROR',
          field: 'name'
        }
      });
    }

    // Check for duplicate
    if (Faction.nameExists(name)) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Faction name already exists',
          code: 'DUPLICATE_ENTRY',
          field: 'name'
        }
      });
    }

    const faction = Faction.create({ name: name.trim(), description });

    res.status(201).json({
      success: true,
      data: faction
    });

  } catch (error) {
    console.error('Create faction error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create faction',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

/**
 * PUT /api/factions/:id
 * Update faction
 * Admin only
 */
router.put('/:id', isAdmin, (req, res) => {
  try {
    const { name, description } = req.body;
    const factionId = req.params.id;

    // Check if faction exists
    const faction = Faction.findById(factionId);
    if (!faction) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Faction not found',
          code: 'NOT_FOUND'
        }
      });
    }

    // Validate name if provided
    if (name && name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Faction name cannot be empty',
          code: 'VALIDATION_ERROR',
          field: 'name'
        }
      });
    }

    // Check for duplicate name (excluding current faction)
    if (name) {
      const existingFaction = Faction.findByName(name);
      if (existingFaction && existingFaction.id !== parseInt(factionId)) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'Faction name already exists',
            code: 'DUPLICATE_ENTRY',
            field: 'name'
          }
        });
      }
    }

    Faction.update(factionId, { name: name?.trim(), description });

    res.json({
      success: true,
      data: {
        message: 'Faction updated successfully'
      }
    });

  } catch (error) {
    console.error('Update faction error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update faction',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

/**
 * DELETE /api/factions/:id
 * Delete faction
 * Admin only
 */
router.delete('/:id', isAdmin, (req, res) => {
  try {
    const factionId = req.params.id;

    // Check if faction exists
    const faction = Faction.findById(factionId);
    if (!faction) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Faction not found',
          code: 'NOT_FOUND'
        }
      });
    }

    // Check if faction is in use
    if (Faction.isInUse(factionId)) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Cannot delete faction that is in use by miniatures',
          code: 'CONFLICT'
        }
      });
    }

    Faction.delete(factionId);

    res.json({
      success: true,
      data: {
        message: 'Faction deleted successfully'
      }
    });

  } catch (error) {
    console.error('Delete faction error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete faction',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

module.exports = router;
