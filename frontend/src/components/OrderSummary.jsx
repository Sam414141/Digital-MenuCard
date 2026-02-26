import React from "react";

export default function OrderSummary({ cart, totalPrice }) {
  return (
    <div className="order-summary">
      <h3>Order Summary</h3>
      <div className="summary-items">
        {cart.map((item) => (
          <div key={item.id} className="summary-item">
            <div className="item-name">{item.name}</div>
            <div className="item-details">
              <span className="item-quantity">Qty: {item.quantity}</span>
              <span className="item-price">₹{item.price.toFixed(2)} each</span>
              <span className="item-total">Total: ₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="summary-total">
        <span className="total-label">Total Amount:</span>
        <span className="total-amount">₹{totalPrice}</span>
      </div>
    </div>
  );
}
