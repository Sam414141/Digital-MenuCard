import React from 'react';
import { Mail, Phone, Calendar, Clock, MessageSquare } from 'lucide-react';

const ContactItem = ({ contact, index }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Invalid Time';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Time' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const truncateMessage = (message, maxLength = 100) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  const truncateSubject = (subject, maxLength = 30) => {
    if (!subject) return '';
    if (subject.length <= maxLength) return subject;
    return subject.substring(0, maxLength) + '...';
  };

  const showContactDetails = (contact) => {
    const details = `
Contact Details:

Name: ${contact.name}
Email: ${contact.email}
Phone: ${contact.phone || 'N/A'}
Subject: ${contact.subject || 'No Subject'}
Date: ${new Date(contact.createdAt).toLocaleString()}

Message: ${contact.message}
    `;
    alert(details);
  };

  return (
    <div key={contact.id || index} className={`contact-item contact-item-${index % 4}`}>
      <div className="contact-header">
        <div className="contact-user-info">
          <div className="contact-personal-info">
            <div className="contact-name-section">
              <h4 className="contact-name">{contact.name}</h4>
              {contact.subject && (
                <span className="contact-subject-badge">{truncateSubject(contact.subject)}</span>
              )}
            </div>
            <div className="contact-details">
              <div className="contact-email">
                <Mail size={14} className="contact-icon" />
                <span>{contact.email}</span>
              </div>
              {contact.phone && (
                <div className="contact-phone">
                  <Phone size={14} className="contact-icon" />
                  <span>{contact.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="contact-meta">
          <span className="contact-date">{formatDate(contact.createdAt)}</span>
          <span className="contact-time">{formatTime(contact.createdAt)}</span>
        </div>
      </div>
      
      <div className="contact-message-section">
        <div className="contact-message">
          {truncateMessage(contact.message, 100)}
        </div>
      </div>
      
      <div className="contact-actions">
        <button 
          className="view-details-btn"
          onClick={() => showContactDetails(contact)}
        >
          <MessageSquare size={16} />
          View Details
        </button>
      </div>
    </div>
  );
};

export default ContactItem;