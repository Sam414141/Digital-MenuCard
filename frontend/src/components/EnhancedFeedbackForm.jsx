import React, { useState } from "react";
import feedbackService from "../services/feedbackService";
import FeedbackSuccessNotification from './FeedbackSuccessNotification';
import { Star, ThumbsUp, ThumbsDown, Send, X } from 'lucide-react';
import './EnhancedFeedbackForm.css';

export default function EnhancedFeedbackForm({
  orderId,
  tableNumber,
  customerName,
  mobileNumber,
  userEmail,
  isOpen,
  onClose,
  onSubmitSuccess
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [overallExperienceText, setOverallExperienceText] = useState('');
  const [overallExperienceRating, setOverallExperienceRating] = useState(0);
  const [overallExperienceRatingHover, setOverallExperienceRatingHover] = useState(0);
  const [foodQuality, setFoodQuality] = useState(0);
  const [foodQualityHover, setFoodQualityHover] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [serviceRatingHover, setServiceRatingHover] = useState(0);
  const [ambienceRating, setAmbienceRating] = useState(0);
  const [ambienceRatingHover, setAmbienceRatingHover] = useState(0);
  const [wouldRecommend, setWouldRecommend] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const feedbackData = {
        orderId,
        tableNumber,
        customerName,
        mobileNumber,
        userEmail,
        rating,
        comment,
        overallExperience: overallExperienceText,
        overallExperienceRating,
        foodQuality,
        serviceRating,
        ambienceRating,
        wouldRecommend
      };

      await feedbackService.submitFeedback(feedbackData);
      
      setSuccess(true);
      setShowSuccessNotification(true);
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      
      // Reset form after successful submission
      setTimeout(() => {
        resetForm();
        if (onClose) onClose();
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setHoverRating(0);
    setComment('');
    setOverallExperienceText('');
    setOverallExperienceRating(0);
    setOverallExperienceRatingHover(0);
    setFoodQuality(0);
    setFoodQualityHover(0);
    setServiceRating(0);
    setServiceRatingHover(0);
    setAmbienceRating(0);
    setAmbienceRatingHover(0);
    setWouldRecommend(null);
    setError('');
    setSuccess(false);
    setShowSuccessNotification(false);
  };

  const getRatingDescription = (rating) => {
    const descriptions = {
      5: { text: 'Excellent', detail: 'Loved everything' },
      4: { text: 'Very Good', detail: 'Great experience' },
      3: { text: 'Good', detail: 'Average, can improve' },
      2: { text: 'Poor', detail: 'Faced some issues' },
      1: { text: 'Very Poor', detail: 'Not satisfied' }
    };
    
    return rating > 0 ? descriptions[rating] : null;
  };

  const renderStars = (currentRating, onClick, onMouseEnter, onMouseLeave) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={32}
            className={`star ${star <= (hoverRating || currentRating) ? 'filled' : ''}`}
            onClick={() => onClick(star)}
            onMouseEnter={() => onMouseEnter(star)}
            onMouseLeave={onMouseLeave}
          />
        ))}
      </div>
    );
  };

  const renderRatingStars = (currentRating, hoverRating, setRating, setHoverRating, label) => {
    return (
      <div className="rating-field">
        <label>{label}</label>
        <div className="star-rating-container">
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={24}
                className={`star ${star <= (hoverRating || currentRating) ? 'filled' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              />
            ))}
          </div>
          <span className="rating-value">
            {currentRating > 0 ? (
              <>
                <strong>{getRatingDescription(currentRating)?.text}</strong>
                <br />
                <small>{getRatingDescription(currentRating)?.detail}</small>
              </>
            ) : 'Select rating'}
          </span>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="feedback-overlay">
        <div className="feedback-modal">
          <div className="feedback-header">
            <h2 className="feedback-header-text">We Value Your Feedback!</h2>
            <button className="close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="feedback-content">
            {success ? (
              <div className="success-message">
                <ThumbsUp size={48} className="success-icon" />
                <h3>Thank You!</h3>
                <p>Your feedback has been submitted successfully.</p>
                <p>We appreciate you taking the time to share your experience.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="feedback-form">
                {error && <div className="error-message">{error}</div>}
                
                <div className="form-section">
                  <h3>Overall Rating</h3>
                  <div className="rating-section">
                    {renderStars(
                      rating,
                      setRating,
                      setHoverRating,
                      () => setHoverRating(0)
                    )}
                    <span className="rating-text">
                      {rating > 0 ? (
                        <>
                          <strong>{getRatingDescription(rating)?.text}</strong>
                          <br />
                          <small>{getRatingDescription(rating)?.detail}</small>
                        </>
                      ) : 'Select rating'}
                    </span>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Detailed Feedback</h3>
                  
                  <div className="form-group">
                    <label htmlFor="overallExperience">Overall Dining Experience *</label>
                    <textarea
                      id="overallExperience"
                      value={overallExperienceText}
                      onChange={(e) => setOverallExperienceText(e.target.value)}
                      placeholder="How was your overall dining experience?"
                      required
                    />
                  </div>

                  {renderRatingStars(
                    overallExperienceRating, 
                    overallExperienceRatingHover, 
                    setOverallExperienceRating, 
                    setOverallExperienceRatingHover, 
                    "Overall Experience Rating *"
                  )}

                  {renderRatingStars(
                    foodQuality, 
                    foodQualityHover, 
                    setFoodQuality, 
                    setFoodQualityHover, 
                    "Food Quality Rating *"
                  )}

                  {renderRatingStars(
                    serviceRating, 
                    serviceRatingHover, 
                    setServiceRating, 
                    setServiceRatingHover, 
                    "Service Rating *"
                  )}

                  {renderRatingStars(
                    ambienceRating, 
                    ambienceRatingHover, 
                    setAmbienceRating, 
                    setAmbienceRatingHover, 
                    "Ambience Rating *"
                  )}

                  <div className="form-group">
                    <label>Would you recommend us to others? *</label>
                    <div className="recommend-buttons">
                      <button
                        type="button"
                        className={`recommend-btn ${wouldRecommend === 'yes' ? 'selected' : ''}`}
                        onClick={() => setWouldRecommend('yes')}
                      >
                        <ThumbsUp size={20} />
                        Yes
                      </button>
                      <button
                        type="button"
                        className={`recommend-btn ${wouldRecommend === 'no' ? 'selected' : ''}`}
                        onClick={() => setWouldRecommend('no')}
                      >
                        <ThumbsDown size={20} />
                        No
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="comment">Additional Comments</label>
                    <textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Any additional comments or suggestions..."
                      rows={4}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading || !rating || !overallExperienceText || !overallExperienceRating || !foodQuality || !serviceRating || !ambienceRating || wouldRecommend === null}
                  >
                    {loading ? (
                      <>
                        <div className="spinner"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Submit Feedback
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      
      <FeedbackSuccessNotification 
        isVisible={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
      />
    </>
  );
};