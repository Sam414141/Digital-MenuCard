import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';

const QRScanner = ({ onScanResult, onError }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [manualTable, setManualTable] = useState('');
  const [isCameraSupported, setIsCameraSupported] = useState(true);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Check camera support on component mount
  useEffect(() => {
    const checkCameraSupport = () => {
      // Check if we're in a secure context (HTTPS or localhost)
      const isSecureContext = window.isSecureContext;
      const isLocalhost = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname === '[::1]';
      
      if (!isSecureContext && !isLocalhost) {
        setIsCameraSupported(false);
        setError('Camera access requires a secure connection (HTTPS). Please use manual entry.');
        return;
      }
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsCameraSupported(false);
        setError('Camera not supported in this browser. Please use manual entry.');
      }
    };
    
    checkCameraSupport();
  }, []);

  const handleManualSubmit = () => {
    if (manualTable && !isNaN(manualTable)) {
      onScanResult(manualTable);
      setIsScanning(false);
      setManualTable('');
    } else {
      setError('Please enter a valid table number');
    }
  };

  const startScanning = async () => {
    setIsScanning(true);
    setError('');
    setManualTable('');
    
    // Check if mediaDevices is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('MediaDevices API not supported');
      setError('Camera not supported in this browser. Please use manual entry or try a different browser.');
      setIsScanning(false);
      onError && onError(new Error('MediaDevices API not supported'));
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Start scanning interval
        scanIntervalRef.current = setInterval(scanQRCode, 500);
      }
    } catch (err) {
      console.error('Camera error:', err);
      let errorMessage = 'Camera access denied or not available. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please grant camera permissions.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera is being used by another application.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage += 'Camera constraints cannot be satisfied.';
      } else if (err.name === 'SecurityError') {
        errorMessage += 'Camera access requires a secure connection (HTTPS).';
      } else {
        errorMessage += 'Please use manual entry.';
      }
      
      setError(errorMessage);
      setIsScanning(false);
      onError && onError(err);
    }
  };

  const scanQRCode = () => {
    if (!videoRef.current || videoRef.current.readyState !== 4) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
      try {
        console.log('Scanned QR data:', code.data);
        
        // Check if it's a URL or just a table number
        if (code.data.startsWith('http')) {
          // Parse the URL to extract table number
          const url = new URL(code.data);
          const tableParam = url.searchParams.get('table');
          
          if (tableParam) {
            stopScanning();
            onScanResult(tableParam);
          } else {
            setError('Invalid QR code format. Please scan a valid table QR code.');
          }
        } else {
          // If it's just a number, use it directly
          if (!isNaN(code.data)) {
            stopScanning();
            onScanResult(code.data);
          } else {
            setError('Invalid QR code format. Please scan a valid table QR code.');
          }
        }
      } catch (err) {
        console.error('Error parsing QR code:', err);
        setError('Failed to parse QR code. Please try again.');
        onError && onError(err);
      }
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    setError('');
    setManualTable('');
    
    // Stop the scanning interval
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    // Stop the video stream
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="qr-scanner">
      <div className="scanner-container">
        {isScanning ? (
          <div className="scanner-active">
            <div className="scanner-preview">
              <video 
                ref={videoRef}
                style={{ width: '100%', height: 'auto' }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <div className="scanner-overlay">
                <div className="scan-frame"></div>
              </div>
              <p>Point camera at QR code</p>
              <p className="scanner-hint">Make sure the QR code is well-lit and in focus</p>
            </div>
            <button className="btn btn-secondary" onClick={stopScanning}>
              Stop Scanning
            </button>
            <div className="manual-input">
              <p>Or enter table number manually:</p>
              <input
                type="number"
                value={manualTable}
                onChange={(e) => setManualTable(e.target.value)}
                placeholder="Table number"
                className="form-input"
                min="1"
              />
              <button 
                className="btn btn-primary" 
                onClick={handleManualSubmit}
                disabled={!manualTable}
              >
                Submit Table Number
              </button>
            </div>
          </div>
        ) : (
          <div className="scanner-inactive">
            <div className="scanner-placeholder">
              <div className="camera-icon">📷</div>
              {isCameraSupported ? (
                <>
                  <p>Camera access required for scanning</p>
                  <p className="small">Make sure to allow camera permissions</p>
                </>
              ) : (
                <>
                  <p>Camera not supported in this browser</p>
                  <p className="small">Please use manual entry below</p>
                </>
              )}
            </div>
            {isCameraSupported && (
              <button className="btn btn-primary" onClick={startScanning}>
                Start QR Scanner
              </button>
            )}
            <div className="manual-input">
              <p>Or enter table number manually:</p>
              <input
                type="number"
                value={manualTable}
                onChange={(e) => setManualTable(e.target.value)}
                placeholder="Table number"
                className="form-input"
                min="1"
              />
              <button 
                className="btn btn-primary" 
                onClick={handleManualSubmit}
                disabled={!manualTable}
              >
                Submit Table Number
              </button>
            </div>
          </div>
        )}
        
        {error && <div className="scanner-error">{error}</div>}
      </div>
    </div>
  );
};

export default QRScanner;