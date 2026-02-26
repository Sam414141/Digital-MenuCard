import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiService from "../services/apiService"; // Use apiService instead of axios
import "../styles/Contact.css";
import { Mail, User, MessageSquare, Send } from 'lucide-react';

const Contact = () => {
  const [email,setEmail] = useState("");
  const [name,setName] = useState("");
  const [message,setMessage] = useState("");

  const send = (event) => {
    event.preventDefault(); // Prevent page refresh
  
    // Use apiService instead of direct axios call
    apiService._request('POST', `/contact`, {
      name: name,
      email: email,
      message: message,
    })
    .then((response) => {
      console.log(response);
      toast.success("Message sent successfully!");
      setName("");
      setEmail("");
      setMessage("");
    })
    .catch((error) => {
      console.log(error);
      toast.error("Failed to send message. Please try again.");
    });
  };
  

  return (
    <>
    <Navbar/>
    <div className="contact-container">
      <h1>Contact Us</h1>
      <p>We'd love to hear from you! Reach out to us through any of the methods below.</p>
      
      <div className="contact-info">
        <div className="contact-item">
          <FaMapMarkerAlt className="icon" />
          <h3>Our Location</h3>
          <p>123 Luxury St, City, Country</p>
        </div>
        <div className="contact-item">
          <FaPhone className="icon" />
          <h3>Phone</h3>
          <p>+123 456 7890</p>
        </div>
        <div className="contact-item">
          <FaEnvelope className="icon" />
          <h3>Email</h3>
          <p>contact@majesticmanor.com</p>
        </div>
      </div>

      <div className="contact-form">
        <h2>Send Us a Message</h2>
        <form onSubmit={send}> 
            <input type="text" placeholder="Your Name" required value={name} onChange={(e) => setName(e.target.value)} />
            <input type="email" placeholder="Your Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <textarea placeholder="Your Message" rows="5" required value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
            <button type="submit" className="btn-primary">Send Message</button>
        </form>
      </div>
    </div>
    <Footer/>
    </>
  );
};
export default Contact;