// routes/unitTypes.js
const express = require('express');

const router = express.Router();
const UnitType = require('../models/UnitType');
const { isAdmin } = require('../middleware/auth');

/**
 * GET /api/unit-types
 * Get all unit types
 * Public endpoint
 */
router.get('/', (req, res) => {
  try {
    const unitTypes = UnitType.getAll();

    res.json({
      success: true,
      data: unitTypes,
    });
  } catch (error) {
    console.error('Get unit types error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get unit types',
        code: 'INTERNAL_ERROR',
      },
    });
  }
});

/**
 * GET /api/unit-types/:id
 * Get single unit type
 * Public endpoint
 */
router.get('/:id', (req, res) => {
  try {
    const unitType = UnitType.findById(req.params.id);

    if (!unitType) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Unit type not found',
          code: 'NOT_FOUND',
        },
      });
    }

    res.json({
      success: true,
      data: unitType,
    });
  } catch (error) {
    console.error('Get unit type error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get unit type',
        code: 'INTERNAL_ERROR',
      },
    });
  }
});

/**
 * POST /api/unit-types
 * Create new unit type
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
          message: 'Unit type name is required',
          code: 'VALIDATION_ERROR',
          field: 'name',
        },
      });
    }

    // Check for duplicate
    if (UnitType.nameExists(name)) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Unit type name already exists',
          code: 'DUPLICATE_ENTRY',
          field: 'name',
        },
      });
    }

    const unitType = UnitType.create({ name: name.trim(), description });

    res.status(201).json({
      success: true,
      data: unitType,
    });
  } catch (error) {
    console.error('Create unit type error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create unit type',
        code: 'INTERNAL_ERROR',
      },
    });
  }
});

/**
 * PUT /api/unit-types/:id
 * Update unit type
 * Admin only
 */
router.put('/:id', isAdmin, (req, res) => {
  try {
    const { name, description } = req.body;
    const unitTypeId = req.params.id;

    // Check if unit type exists
    const unitType = UnitType.findById(unitTypeId);
    if (!unitType) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Unit type not found',
          code: 'NOT_FOUND',
        },
      });
    }

    // Validate name if provided
    if (name && name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Unit type name cannot be empty',
          code: 'VALIDATION_ERROR',
          field: 'name',
        },
      });
    }

    // Check for duplicate name (excluding current unit type)
    if (name) {
      const existingUnitType = UnitType.findByName(name);
      if (existingUnitType && existingUnitType.id !== parseInt(unitTypeId, 10)) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'Unit type name already exists',
            code: 'DUPLICATE_ENTRY',
            field: 'name',
          },
        });
      }
    }

    UnitType.update(unitTypeId, { name: name?.trim(), description });

    res.json({
      success: true,
      data: {
        message: 'Unit type updated successfully',
      },
    });
  } catch (error) {
    console.error('Update unit type error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update unit type',
        code: 'INTERNAL_ERROR',
      },
    });
  }
});

/**
 * DELETE /api/unit-types/:id
 * Delete unit type
 * Admin only
 */
router.delete('/:id', isAdmin, (req, res) => {
  try {
    const unitTypeId = req.params.id;

    // Check if unit type exists
    const unitType = UnitType.findById(unitTypeId);
    if (!unitType) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Unit type not found',
          code: 'NOT_FOUND',
        },
      });
    }

    // Check if unit type is in use
    if (UnitType.isInUse(unitTypeId)) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Cannot delete unit type that is in use by miniatures',
          code: 'CONFLICT',
        },
      });
    }

    UnitType.delete(unitTypeId);

    res.json({
      success: true,
      data: {
        message: 'Unit type deleted successfully',
      },
    });
  } catch (error) {
    console.error('Delete unit type error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete unit type',
        code: 'INTERNAL_ERROR',
      },
    });
  }
});

module.exports = router;
