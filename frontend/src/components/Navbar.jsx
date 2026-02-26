import { useContext, useState } from "react";
import { Menu, X, Search, ShoppingCart, User, LogOut } from "lucide-react";
import "../styles/Navbar.css"; // Importing the CSS file
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cart } = useContext(CartContext);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/menu');
  };
  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <h2>Majestic Manor</h2>
          </div>

          {/* Desktop & Mobile Menu */}
          <ul className={`nav-links ${isOpen ? "active" : ""}`}>
            {/* <li className="nav-tab"> <Link to="/home">Home</Link></li> */}
            <li className="nav-tab"> <Link to="/menu">Menu</Link></li>
            {/* <li className="nav-tab"> <Link to="/aboutus">About Us</Link></li> */}
            <li className="nav-tab"> <Link to="/aiwaiter">AIWaiter</Link></li>  
            {/* <li className="nav-tab"> <Link to="/contact">Contact</Link></li> */}
          </ul>

            
            

          {/* Right Section: Search, Cart, User Menu, Menu Button */}
          <div className="right-section">
            {/* <div className="search-box">
              <input type="text" placeholder="Search menu..." />
              <Search size={20} className="search-icon" />
            </div> */}

          {/* Cart Icon */}
          <div className="cart-box">
            <Link to="/cart" className="cart-icon">
              <ShoppingCart size={24} />
              {cart.length > 0 && (
            <span className="cart-count">
             {cart.length}
            </span>
              )}
            </Link>
            </div>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="user-menu">
                <div className="user-info">
                  <User size={20} />
                  <span className="user-name">Hi, {user?.firstName}</span>
                </div>
                <div className="user-dropdown">
                  <Link to="/profile" className="dropdown-item">
                    <User size={16} />
                    My Profile
                  </Link>
                  <Link to="/orders" className="dropdown-item">
                    <ShoppingCart size={16} />
                    Order History
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item logout">
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="login-btn">
                  Login
                </Link>
                <Link to="/register" className="register-btn">
                  Sign Up
                </Link>
              </div>
            )}

            

            {/* Mobile Menu Button */}
            <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>
      
    </>
  );
};

export default Navbar;
