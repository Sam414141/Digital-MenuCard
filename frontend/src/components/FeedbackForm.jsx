import React, { useState } from "react";
import feedbackService from "../services/feedbackService";
import { Star, ThumbsUp, ThumbsDown, Send, X } from 'lucide-react';
import './FeedbackForm.css';

export default function FeedbackForm({
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
  const [overallExperience, setOverallExperience] = useState('');
  const [foodQuality, setFoodQuality] = useState('');
  const [serviceRating, setServiceRating] = useState('');
  const [ambienceRating, setAmbienceRating] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
        overallExperience,
        foodQuality,
        serviceRating,
        ambienceRating,
        wouldRecommend
      };

      await feedbackService.submitFeedback(feedbackData);
      
      setSuccess(true);
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
    setOverallExperience('');
    setFoodQuality('');
    setServiceRating('');
    setAmbienceRating('');
    setWouldRecommend(null);
    setError('');
    setSuccess(false);
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

  if (!isOpen) return null;

  return (
    <div className="feedback-overlay">
      <div className="feedback-modal">
        <div className="feedback-header">
          <h2>We Value Your Feedback!</h2>
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
                    value={overallExperience}
                    onChange={(e) => setOverallExperience(e.target.value)}
                    placeholder="How was your overall dining experience?"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="foodQuality">Food Quality *</label>
                  <select
                    id="foodQuality"
                    value={foodQuality}
                    onChange={(e) => setFoodQuality(e.target.value)}
                    required
                  >
                    <option value="">Select food quality rating</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="average">Average</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="serviceRating">Service Rating *</label>
                  <select
                    id="serviceRating"
                    value={serviceRating}
                    onChange={(e) => setServiceRating(e.target.value)}
                    required
                  >
                    <option value="">Select service rating</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="average">Average</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="ambienceRating">Ambience Rating *</label>
                  <select
                    id="ambienceRating"
                    value={ambienceRating}
                    onChange={(e) => setAmbienceRating(e.target.value)}
                    required
                  >
                    <option value="">Select ambience rating</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="average">Average</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

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
                  disabled={loading || !rating || !overallExperience || !foodQuality || !serviceRating || !ambienceRating || wouldRecommend === null}
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
  );
}