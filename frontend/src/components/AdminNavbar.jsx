import { useContext, useState } from "react";
import { Menu, X, Search, ShoppingCart, LogOut } from "lucide-react";
import "../styles/Navbar.css"; // Importing the CSS file
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cart } = useContext(CartContext);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
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
            <li className="nav-tab"> <Link to="/admin/dashboard">DashBoard</Link></li>
            <li className="nav-tab"> <Link to="/admin/kitchen-dashboard">Kitchen Dashboard</Link></li>
            <li className="nav-tab"> <Link to="/admin/waiter-dashboard">Waiter Dashboard</Link></li>
            <li className="nav-tab"> <Link to="/admin/control-panel">Control Panel</Link></li>
          </ul>

            
            

          {/* Right Section: User Menu, Menu Button */}
          <div className="right-section">
            {/* User Menu */}
            <div className="user-menu">
              <div className="user-info">
                <span className="user-name">Hi, {user?.firstName || 'Admin'}</span>
              </div>
              <div className="user-dropdown">
                <button onClick={handleLogout} className="dropdown-item logout">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>

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

export default AdminNavbar;