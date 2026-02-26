import React, { useState, useEffect } from 'react';

const IPUpdater = () => {
  const [ipAddress, setIpAddress] = useState('');
  const [message, setMessage] = useState('');

  // Load saved IP on component mount
  useEffect(() => {
    const savedIp = localStorage.getItem("serverIp") || '';
    setIpAddress(savedIp);
  }, []);

  const handleIPChange = (e) => {
    setIpAddress(e.target.value);
  };

  const saveIP = () => {
    if (ipAddress) {
      try {
        localStorage.setItem("serverIp", ipAddress);
        setMessage(`IP address ${ipAddress} saved successfully!`);
        // Reload the page to apply changes
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (e) {
        setMessage('Error saving IP address. Please try again.');
        console.error('Error saving IP:', e);
      }
    } else {
      setMessage('Please enter a valid IP address.');
    }
  };

  const containerStyle = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    padding: '15px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 10000,
    maxWidth: '300px',
    fontFamily: 'Arial, sans-serif'
  };

  const inputStyle = {
    width: '100%',
    padding: '8px',
    marginBottom: '10px',
    borderRadius: '4px',
    border: '1px solid #ced4da',
    boxSizing: 'border-box'
  };

  const buttonStyle = {
    width: '100%',
    padding: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  };

  const messageStyle = {
    marginTop: '10px',
    padding: '8px',
    borderRadius: '4px',
    fontSize: '12px',
    textAlign: 'center'
  };

  const successMessageStyle = {
    ...messageStyle,
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb'
  };

  const errorMessageStyle = {
    ...messageStyle,
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb'
  };

  return (
    <div style={containerStyle}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#333' }}>Update Server IP</h3>
      <p style={{ fontSize: '12px', color: '#666', margin: '0 0 10px 0' }}>
        Enter your backend server IP address:
      </p>
      <input
        type="text"
        value={ipAddress}
        onChange={handleIPChange}
        placeholder="e.g., 192.168.1.100"
        style={inputStyle}
      />
      <button onClick={saveIP} style={buttonStyle}>
        Save IP Address
      </button>
      {message && (
        <div style={message.includes('Error') ? errorMessageStyle : successMessageStyle}>
          {message}
        </div>
      )}
      <p style={{ fontSize: '11px', color: '#999', margin: '10px 0 0 0' }}>
        Note: Page will reload after saving
      </p>
    </div>
  );
};

export default IPUpdater;