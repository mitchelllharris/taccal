const express = require('express');
const Quote = require('../models/Quote');
const router = express.Router();

// GET /api/quotes - Get all quotes with optional search
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    // Build search query
    let query = {};
    if (search) {
      query = {
        $or: [
          { 'clientInfo.firstName': { $regex: search, $options: 'i' } },
          { 'clientInfo.lastName': { $regex: search, $options: 'i' } },
          { 'clientInfo.fullName': { $regex: search, $options: 'i' } },
          { 'projectInfo.quoteNumber': { $regex: search, $options: 'i' } },
          { 'serviceInfo.type': { $regex: search, $options: 'i' } },
          { 'clientInfo.email': { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Execute query
    const quotes = await Quote.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count for pagination
    const total = await Quote.countDocuments(query);

    res.json({
      success: true,
      data: quotes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch quotes',
      message: error.message 
    });
  }
});

// GET /api/quotes/:id - Get a specific quote
router.get('/:id', async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id).select('-__v');
    
    if (!quote) {
      return res.status(404).json({ 
        success: false, 
        error: 'Quote not found' 
      });
    }

    res.json({
      success: true,
      data: quote
    });
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch quote',
      message: error.message 
    });
  }
});

// POST /api/quotes - Create a new quote
router.post('/', async (req, res) => {
  try {
    const quoteData = req.body;

    // Ensure formData and results are present
    if (!quoteData.formData || !quoteData.results) {
      return res.status(400).json({
        success: false,
        error: 'Missing formData or results in request body'
      });
    }

    // Check if quote number already exists
    if (quoteData.projectInfo?.quoteNumber) {
      const existingQuote = await Quote.findOne({ 
        'projectInfo.quoteNumber': quoteData.projectInfo.quoteNumber 
      });
      
      if (existingQuote) {
        return res.status(400).json({
          success: false,
          error: 'Quote number already exists'
        });
      }
    }

    // Create new quote
    const quote = new Quote(quoteData);
    await quote.save();

    res.status(201).json({
      success: true,
      message: 'Quote created successfully',
      data: quote
    });
  } catch (error) {
    console.error('Error creating quote:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors,
        message: `Validation failed: ${validationErrors.join(', ')}`
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate quote number',
        message: 'A quote with this number already exists'
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Failed to create quote',
      message: error.message 
    });
  }
});

// PUT /api/quotes/:id - Update a quote
router.put('/:id', async (req, res) => {
  try {
    const quoteData = req.body;
    const quoteId = req.params.id;

    // Ensure formData and results are present
    if (!quoteData.formData || !quoteData.results) {
      return res.status(400).json({
        success: false,
        error: 'Missing formData or results in request body'
      });
    }

    // Check if quote exists
    const existingQuote = await Quote.findById(quoteId);
    if (!existingQuote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found'
      });
    }

    // Check if quote number is being changed and if it already exists
    if (quoteData.projectInfo?.quoteNumber && 
        quoteData.projectInfo.quoteNumber !== existingQuote.projectInfo.quoteNumber) {
      const duplicateQuote = await Quote.findOne({ 
        'projectInfo.quoteNumber': quoteData.projectInfo.quoteNumber,
        _id: { $ne: quoteId } // Exclude current document
      });
      
      if (duplicateQuote) {
        return res.status(400).json({
          success: false,
          error: 'Quote number already exists'
        });
      }
    }

    // Update quote
    const updatedQuote = await Quote.findByIdAndUpdate(
      quoteId,
      quoteData,
      { new: true, runValidators: true }
    ).select('-__v');

    res.json({
      success: true,
      message: 'Quote updated successfully',
      data: updatedQuote
    });
  } catch (error) {
    console.error('Error updating quote:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors,
        message: `Validation failed: ${validationErrors.join(', ')}`
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate quote number',
        message: 'A quote with this number already exists'
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Failed to update quote',
      message: error.message 
    });
  }
});

// DELETE /api/quotes/:id - Delete a quote
router.delete('/:id', async (req, res) => {
  try {
    const quote = await Quote.findByIdAndDelete(req.params.id);
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found'
      });
    }

    res.json({
      success: true,
      message: 'Quote deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting quote:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete quote',
      message: error.message 
    });
  }
});

// GET /api/quotes/stats/summary - Get summary statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const totalQuotes = await Quote.countDocuments();
    const totalValue = await Quote.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$calculations.totalWithTax' },
          average: { $avg: '$calculations.totalWithTax' }
        }
      }
    ]);

    const recentQuotes = await Quote.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('projectInfo.quoteNumber clientInfo.fullName calculations.totalWithTax createdAt');

    const serviceTypes = await Quote.aggregate([
      {
        $group: {
          _id: '$serviceInfo.type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalQuotes,
        totalValue: totalValue[0]?.total || 0,
        averageValue: totalValue[0]?.average || 0,
        recentQuotes,
        serviceTypes
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch statistics',
      message: error.message 
    });
  }
});

module.exports = router; 