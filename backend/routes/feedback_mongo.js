const express = require('express');
const router = express.Router();
const { verifyToken, optionalAuth } = require('../middleware/auth_mongo');
const {
  Feedback,
  Order,
  User
} = require('../db_mongo');

/**
 * Submit Feedback
 * POST /api/feedback/submit
 */
router.post('/submit', verifyToken, async (req, res) => {
  try {
    const {
      orderId,
      tableNumber,
      customerName,
      mobileNumber,
      userEmail,
      rating,
      comment,
      overallExperience,
      overallExperienceRating,
      foodQuality,
      serviceRating,
      ambienceRating,
      wouldRecommend
    } = req.body;

    // Validate required fields - overallExperienceRating is optional, derive from main rating if not provided
    if (!orderId || !rating || !overallExperience || 
        !foodQuality || !serviceRating || !ambienceRating || !wouldRecommend) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }

    // Convert string ratings to numeric values if needed
    const convertRatingToStringOrNumber = (rating) => {
      // Handle undefined/null values
      if (rating === undefined || rating === null) return 3; // default to average
      
      if (typeof rating === 'number') return rating;
      if (typeof rating === 'string') {
        // If it's already a number in string form, convert to number
        if (!isNaN(rating) && !isNaN(parseFloat(rating))) {
          return parseFloat(rating);
        }
        // If it's a descriptive string, convert to a numeric equivalent
        switch(rating.toLowerCase()) {
          case 'excellent': return 5;
          case 'very good': return 4.5;
          case 'good': return 4;
          case 'above average': return 3.5;
          case 'average': return 3;
          case 'below average': return 2.5;
          case 'poor': return 2;
          case 'very poor': return 1.5;
          case 'terrible': return 1;
          default: return 3; // default to average
        }
      }
      return 3; // default to average
    };
    
    // Convert ratings to numeric values
    const numericRating = convertRatingToStringOrNumber(rating);
    // Use overallExperienceRating if provided, otherwise default to the main rating
    const numericOverallExperienceRating = overallExperienceRating 
      ? convertRatingToStringOrNumber(overallExperienceRating) 
      : numericRating;
    const numericFoodQuality = convertRatingToStringOrNumber(foodQuality);
    const numericServiceRating = convertRatingToStringOrNumber(serviceRating);
    const numericAmbienceRating = convertRatingToStringOrNumber(ambienceRating);
    
    // Validate numeric rating values (1-5)
    const ratings = [numericRating, numericOverallExperienceRating, numericFoodQuality, numericServiceRating, numericAmbienceRating];
    if (ratings.some(r => r < 1 || r > 5)) {
      return res.status(400).json({
        status: 'error',
        message: 'Ratings must be between 1 and 5'
      });
    }

    // Validate wouldRecommend value
    if (!['yes', 'no'].includes(wouldRecommend)) {
      return res.status(400).json({
        status: 'error',
        message: 'wouldRecommend must be either "yes" or "no"'
      });
    }

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Validate that user_id exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: 'error',
        message: 'User authentication required for feedback submission'
      });
    }

    // Create feedback document
    const feedback = new Feedback({
      order_id: orderId,
      user_id: req.user.id, // Add user_id from authenticated user (authentication is now required)
      email: userEmail,
      message: comment || '',
      rating: numericRating,
      sentiment_score: calculateSentimentScore(comment),
      sentiment_category: categorizeSentiment(comment),
      metadata: {
        tableNumber,
        customerName,
        mobileNumber,
        overallExperience,
        overallExperienceRating: numericOverallExperienceRating,
        foodQuality: numericFoodQuality,
        serviceRating: numericServiceRating,
        ambienceRating: numericAmbienceRating,
        wouldRecommend
      }
    });

    await feedback.save();

    // Update order with feedback reference (optional)
    order.feedback_id = feedback._id;
    await order.save();

    res.status(201).json({
      status: 'success',
      message: 'Feedback submitted successfully',
      data: {
        feedbackId: feedback._id,
        orderId: orderId
      }
    });

  } catch (error) {
    console.error('Error submitting feedback:', error.message);
    if (error.name === 'ValidationError') {
      res.status(400).json({
        status: 'error',
        message: 'Validation error: ' + error.message
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to submit feedback'
      });
    }
  }
});

/**
 * Legacy Submit Feedback (handles old Cart.jsx format)
 * POST /api/feedback
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      customerId,
      orderId,
      email,
      message
    } = req.body;

    // Validate required fields
    if (!orderId || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: orderId and message are required'
      });
    }

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Validate that user_id exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: 'error',
        message: 'User authentication required for feedback submission'
      });
    }

    // Create feedback document using the legacy format
    const feedback = new Feedback({
      order_id: orderId,
      user_id: req.user.id, // User is now required to be authenticated
      email: email || '',
      message: message,
      rating: 0, // Default rating for legacy format
      sentiment_score: calculateSentimentScore(message),
      sentiment_category: categorizeSentiment(message),
      metadata: {
        tableNumber: order.table_number || null,
        // Attempt to get customer info if customerId is provided
        customerName: null, // Legacy format doesn't provide customer name
        mobileNumber: null, // Legacy format doesn't provide mobile number
        overallExperience: message.substring(0, 100), // Use message as overall experience
        overallExperienceRating: 3, // Default to neutral
        foodQuality: 3, // Default to neutral
        serviceRating: 3, // Default to neutral
        ambienceRating: 3, // Default to neutral
        wouldRecommend: 'yes' // Default to yes
      }
    });

    await feedback.save();

    // Update order with feedback reference (optional)
    order.feedback_id = feedback._id;
    await order.save();

    res.status(201).json({
      status: 'success',
      message: 'Feedback submitted successfully',
      data: {
        feedbackId: feedback._id,
        orderId: orderId
      }
    });

  } catch (error) {
    console.error('Error submitting legacy feedback:', error.message);
    if (error.name === 'ValidationError') {
      res.status(400).json({
        status: 'error',
        message: 'Validation error: ' + error.message
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to submit feedback'
      });
    }
  }
});

/**
 * Get Feedback for Specific Order
 * GET /api/feedback/order/:orderId
 */
router.get('/order/:orderId', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const feedback = await Feedback.findOne({ order_id: orderId });
    
    if (!feedback) {
      return res.status(404).json({
        status: 'error',
        message: 'No feedback found for this order'
      });
    }

    res.json({
      status: 'success',
      data: formatFeedbackResponse(feedback)
    });

  } catch (error) {
    console.error('Error fetching feedback:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch feedback'
    });
  }
});

/**
 * Get User's Feedback (authenticated user)
 * GET /api/feedback/user
 */
router.get('/user', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's orders first
    const orders = await Order.find({ user_id: userId });
    const orderIds = orders.map(order => order._id);
    
    // Get feedback for those orders
    const feedbacks = await Feedback.find({ 
      order_id: { $in: orderIds } 
    }).sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: feedbacks.map(formatFeedbackResponse)
    });

  } catch (error) {
    console.error('Error fetching user feedback:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch feedback'
    });
  }
});

/**
 * Get All Feedback (Admin only)
 * GET /api/feedback/all
 */
router.get('/all', verifyToken, async (req, res) => {
  try {
    // Check if user is admin (you might want to add role check middleware)
    // For now, assuming verifyToken provides user info
    
    const feedbacks = await Feedback.find({}).sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: feedbacks.map(formatFeedbackResponse)
    });

  } catch (error) {
    console.error('Error fetching all feedback:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch feedback'
    });
  }
});

/**
 * Helper function to calculate sentiment score
 */
function calculateSentimentScore(text) {
  if (!text) return 0;
  
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'perfect'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disappointing', 'poor', 'worst', 'hate'];
  
  const lowerText = text.toLowerCase();
  let score = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) score += 0.2;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score -= 0.2;
  });
  
  return Math.max(-1, Math.min(1, score));
}

/**
 * Helper function to categorize sentiment
 */
function categorizeSentiment(text) {
  const score = calculateSentimentScore(text);
  
  if (score > 0.3) return 'positive';
  if (score < -0.3) return 'negative';
  return 'neutral';
}

/**
 * Helper function to format feedback response
 */
function formatFeedbackResponse(feedback) {
  return {
    id: feedback._id,
    orderId: feedback.order_id,
    email: feedback.email,
    message: feedback.message,
    rating: feedback.rating,
    sentimentScore: feedback.sentiment_score,
    sentimentCategory: feedback.sentiment_category,
    metadata: feedback.metadata,
    createdAt: feedback.createdAt,
    updatedAt: feedback.updatedAt
  };
}

module.exports = router;