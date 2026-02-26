import React from "react";
import { FaFacebook, FaInstagram, FaTwitter, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import "../styles/Footer.css";
import { Link } from "react-router-dom";


const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand & Description */}
        <div className="footer-brand">
          <h2>Majestic Manor</h2>
          <p>Experience luxury dining and hospitality like never before.</p>
        </div>

        {/* Quick Links */}
        <div className="footer-links">
          <h3>Quick Links</h3>
          <ul>
          <li > <Link to="/menu">Menu</Link></li>
          <li > <Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="footer-contact">
          <h3>Contact Us</h3>
          <p><FaMapMarkerAlt /> 123 Luxury St, City, Country</p>
          <p><FaPhone /> +123 456 7890</p>
          <p><FaEnvelope /> contact@majesticmanor.com</p>
        </div>

        {/* Social Media */}
        <div className="footer-social">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="#"><FaFacebook /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaTwitter /></a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Majestic Manor. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
