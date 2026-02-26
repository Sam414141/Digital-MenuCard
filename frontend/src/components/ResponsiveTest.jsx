import React from 'react';
import './ResponsiveTest.css';
import '../styles/responsive.css';
const ResponsiveTest = () => {
  return (
    <div className="responsive-test-container">
      <h1>Responsive Design Test</h1>
      
      <div className="grid-responsive grid-cols-auto">
        <div className="card">
          <h2>Card 1</h2>
          <p>This is a responsive card that should adapt to different screen sizes.</p>
        </div>
        
        <div className="card">
          <h2>Card 2</h2>
          <p>This is a responsive card that should adapt to different screen sizes.</p>
        </div>
        
        <div className="card">
          <h2>Card 3</h2>
          <p>This is a responsive card that should adapt to different screen sizes.</p>
        </div>
      </div>
      
      <div className="btn-container">
        <button className="btn btn-primary btn-responsive">Responsive Button</button>
        <button className="btn btn-secondary btn-responsive">Another Button</button>
      </div>
      
      <div className="form-test">
        <input type="text" className="form-input" placeholder="Responsive Input" />
        <select className="form-select">
          <option>Option 1</option>
          <option>Option 2</option>
          <option>Option 3</option>
        </select>
      </div>
    </div>
  );
};

export default ResponsiveTest;