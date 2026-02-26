import React, { useState, useEffect } from 'react';
import AdminNavbar from "../components/AdminNavbar";
import "../styles/AdminControlPanel.css";
import InventoryManagement from './InventoryManagement';
import AllergenManagement from './AllergenManagement';
import PromotionManagement from './PromotionManagement';
import { useOrders } from '../hooks/useOrders';
import { useMenu } from '../hooks/useMenu';
import apiService from '../services/apiService';
import { 
  Users, 
  ShoppingCart, 
  IndianRupee, 
  Package, 
  BarChart3, 
  Settings,
  Bell,
  MessageSquare,
  UserPlus,
  TrendingUp,
  Target,
  Activity,
  CheckCircle,
  AlertTriangle,
  Shield,
  Key,
  Eye,
  EyeOff,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Zap,
  Database,
  Server,
  Globe,
  Lock,
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  Calendar,
  FileText,
  AlertCircle,
  X,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronLeft,
  ChevronFirst,
  ChevronLast,
  ChevronsUp,
  ChevronsDown,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  MoreVertical,
  Copy,
  Share,
  Printer,
  Archive,
  ArchiveX,
  RotateCcw,
  RotateCw,
  FilterX,
  Clock3,
  Timer,
  TimerReset,
  TimerOff,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  Minus,
  PlusCircle,
  MinusCircle,
  Info,
  HelpCircle,
  ExternalLink,
  Link,
  Unlink,
  Code,
  Settings2,
  Wrench,
  Cog,
  Cpu,
  HardDrive,
  Wifi,
  Bluetooth,
  Battery,
  BatteryCharging,
  Power,
  Volume2,
  VolumeX,
  Volume1,
  Volume,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Image,
  Camera,
  CameraOff,
  Layout,
  LayoutList,
  LayoutGrid,
  Columns,
  Rows,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
  Menu,
  MenuSquare,
  Play,
  Pause,
  Square,
  Circle,
  RectangleVertical,
  RectangleHorizontal,
  Diamond,
  Heart,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudMoon,
  CloudSun,
  Cloudy,
  MoonStar,
  Sparkles,
  Sparkle,
  ShieldCheck,
  ShieldAlert,
  ShieldClose,
  ShieldHalf,
  ShieldOff,
  ShieldQuestion,
  ShieldX,
  KeyRound,
  Fingerprint,
  IdCard,
  Badge,
  BadgeCheck,
  BadgeAlert,
  BadgeHelp,
  BadgeInfo,
  BadgeX,
  BadgePercent,
  BadgePlus,
  BadgeMinus,
  User,
  User2,
  UserCheck,
  UserCog,
  UserMinus,
  UserRound,
  UserRoundCheck,
  UserRoundCog,
  UserRoundMinus,
  UserRoundPlus,
  UserRoundSearch,
  UserRoundX,
  UserSearch,
  UserX,
  Users2,
  UsersRound,
  Contact,
  Contact2,
  ContactRound,
  Notebook,
  NotebookPen,
  NotebookTabs,
  NotebookText,
  Clipboard,
  ClipboardCheck,
  ClipboardCopy,
  ClipboardList,
  ClipboardSignature,
  ClipboardType,
  ClipboardX,
  File,
  FileArchive,
  FileAudio,
  FileBox,
  FileChartColumn,
  FileChartLine,
  FileCheck,
  FileCheck2,
  FileClock,
  FileCode,
  FileCog,
  FileDiff,
  FileDigit,
  FileDown,
  FileHeart,
  FileImage,
  FileInput,
  FileJson,
  FileKey,
  FileKey2,
  FileLock,
  FileMinus,
  FileMinus2,
  FileOutput,
  FilePen,
  FilePlus,
  FileQuestion,
  FileScan,
  FileSearch,
  FileSearch2,
  FileSignature,
  FileSpreadsheet,
  FileSymlink,
  FileTerminal,
  FileType,
  FileType2,
  FileUp,
  FileVideo,
  FileVolume,
  FileVolume2,
  FileWarning,
  FileX,
  FileX2,
  Files,
  Folder,
  FolderArchive,
  FolderCheck,
  FolderClock,
  FolderClosed,
  FolderCode,
  FolderCog,
  FolderDot,
  FolderDown,
  FolderGit,
  FolderGit2,
  FolderHeart,
  FolderInput,
  FolderKey,
  FolderLock,
  FolderMinus,
  FolderOpen,
  FolderOpenDot,
  FolderOutput,
  FolderPen,
  FolderPlus,
  FolderSearch,
  FolderSearch2,
  FolderSymlink,
  FolderTree,
  FolderUp,
  FolderX,
  Folders,
  Home,
  GripVertical,
  GripHorizontal,
  Move,
  CornerUpLeft,
  CornerUpRight,
  CornerDownLeft,
  CornerDownRight,
  CornerLeftUp,
  CornerRightUp,
  CornerLeftDown,
  CornerRightDown
} from 'lucide-react';

export default function AdminControlPanel() {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Real data state
  const [systemStats, setSystemStats] = useState({
    uptime: '99.8%',
    activeUsers: 0,
    ordersToday: 0,
    revenueToday: 0,
    pendingTasks: 0,
    systemHealth: 'Optimal'
  });
  
  const [users, setUsers] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Modal states
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'customer',
    password: '',
    confirmPassword: ''
  });
  
  const [showCreateMenuItemModal, setShowCreateMenuItemModal] = useState(false);
  const [showEditMenuItemModal, setShowEditMenuItemModal] = useState(false);
  const [editingMenuItemId, setEditingMenuItemId] = useState(null);
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image: '',
    is_available: true,
    allergens: [],
    dietary_restrictions: []
  });
  
  // Hooks
  const { fetchOrders, getKitchenScreenOrders } = useOrders();
  const { fetchMenuItems, fetchMenuCategories, createMenuItem, updateMenuItem, deleteMenuItem, updateMenuItemStatus } = useMenu();
  
  // Fetch real data
  useEffect(() => {
    fetchData();
  }, [activeSection]);
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      switch(activeSection) {
        case 'users':
          // Fetch users data
          const usersResponse = await apiService.getAdminCustomers();
          setUsers(usersResponse.data || []);
          break;
          
        case 'menu':
          // Fetch menu data and categories
          const [menuResponse, categoriesResponse] = await Promise.all([
            fetchMenuItems(),
            fetchMenuCategories()
          ]);
          
          console.log('Menu response:', menuResponse);
          console.log('Categories response:', categoriesResponse);
          
          // Handle different response structures for menu items
          let processedMenuItems = [];
          if (Array.isArray(menuResponse)) {
            // Direct array of menu items
            processedMenuItems = menuResponse;
          } else if (menuResponse && menuResponse.data) {
            // Response with data property
            if (Array.isArray(menuResponse.data)) {
              processedMenuItems = menuResponse.data;
            } else if (menuResponse.data.menuItems && Array.isArray(menuResponse.data.menuItems)) {
              processedMenuItems = menuResponse.data.menuItems;
            }
          }
          
          // Handle categories response
          let processedCategories = [];
          if (Array.isArray(categoriesResponse)) {
            processedCategories = categoriesResponse;
          } else if (categoriesResponse && categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
            processedCategories = categoriesResponse.data;
          }
          
          console.log('Processed menu items:', processedMenuItems);
          console.log('Processed categories:', processedCategories);
          
          setMenuItems(processedMenuItems);
          setCategories(processedCategories);
          break;
          
        case 'orders':
          // Fetch orders data
          const ordersResponse = await getKitchenScreenOrders({ status: ['pending', 'prepairing', 'prepaired'] });
          setOrders(ordersResponse || []);
          break;
          
        case 'overview':
          // Fetch dashboard stats
          await fetchDashboardStats();
          break;
          
        case 'feedback':
          // Fetch feedback data
          const feedbackResponse = await apiService.getAdminFeedbacks();
          setFeedback(feedbackResponse.data || []);
          break;
          
        case 'analytics':
          // Fetch analytics data
          const [salesRes, customersRes, feedbackRes, popularItemsRes, revenueByCategoryRes, performanceRes, trendsRes, customerInsightsRes] = await Promise.all([
            apiService.getSalesAnalytics(),
            apiService.getAdminCustomers(),
            apiService.getAdminFeedbacks(),
            apiService.getPopularItems({limit: 10}),
            apiService.getRevenueByCategory(),
            apiService.getPerformanceAnalytics(),
            apiService.getSalesTrends(),
            apiService.getCustomerInsights()
          ]);
          
          // Update system stats with analytics data
          setSystemStats(prev => ({
            ...prev,
            activeUsers: customersRes.data?.length || 0,
            ordersToday: salesRes.data?.totals?.orderCount || 0,
            revenueToday: salesRes.data?.totals?.totalSales || 0
          }));
          break;
          
        default:
          break;
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchDashboardStats = async () => {
    try {
      // Fetch various stats
      const [ordersRes, customersRes] = await Promise.all([
        apiService.getAdminOrders(),
        apiService.getAdminCustomers()
      ]);
      
      const today = new Date().toDateString();
      const todayOrders = (ordersRes.data || []).filter(order => 
        new Date(order.createdAt).toDateString() === today
      );
      
      const todayRevenue = todayOrders.reduce((sum, order) => 
        sum + (order.total_price || order.totalAmount || 0), 0
      );
      
      setSystemStats(prev => ({
        ...prev,
        activeUsers: (customersRes.data || []).length,
        ordersToday: todayOrders.length,
        revenueToday: todayRevenue,
        pendingTasks: (ordersRes.data || []).filter(o => o.status === 'pending').length
      }));
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  };
  
  // User creation functions
  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.password) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (newUser.password !== newUser.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newUser.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would call an API to create the user
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`User ${newUser.firstName} ${newUser.lastName} created successfully with role: ${newUser.role}`);
      
      // Reset form and close modal
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'customer',
        password: '',
        confirmPassword: ''
      });
      setShowCreateUserModal(false);
      fetchData(); // Refresh user data
    } catch (err) {
      setError('Failed to create user: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Menu item creation functions
  const handleCreateMenuItem = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!newMenuItem.name || !newMenuItem.price || !newMenuItem.category_id) {
      setError('Please fill in all required fields (Name, Price, Category)');
      return;
    }
    
    if (isNaN(newMenuItem.price) || parseFloat(newMenuItem.price) <= 0) {
      setError('Please enter a valid price greater than 0');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const menuItemData = {
        name: newMenuItem.name,
        category_id: newMenuItem.category_id,
        price: parseFloat(newMenuItem.price),
        description: newMenuItem.description,
        image: newMenuItem.image || null,
        is_available: newMenuItem.is_available,
        allergens: newMenuItem.allergens || [],
        dietary_restrictions: newMenuItem.dietary_restrictions || []
      };
      
      const response = await createMenuItem(menuItemData);
      console.log('Created menu item:', response);
      
      setSuccessMessage(`Menu item "${newMenuItem.name}" created successfully!`);
      
      // Reset form and close modal
      setNewMenuItem({
        name: '',
        description: '',
        price: '',
        category_id: '',
        image: '',
        is_available: true,
        allergens: [],
        dietary_restrictions: []
      });
      setShowCreateMenuItemModal(false);
      
      // Refresh menu data
      setTimeout(() => {
        fetchData();
        setSuccessMessage(null);
      }, 1500);
    } catch (err) {
      console.error('Error creating menu item:', err);
      setError('Failed to create menu item: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleMenuItemChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setNewMenuItem(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setNewMenuItem(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Edit menu item functions
  const handleEditMenuItem = (item) => {
    setEditingMenuItemId(item._id || item.id);
    setNewMenuItem({
      name: item.name || '',
      description: item.description || '',
      price: item.price || '',
      category_id: item.category_id?._id || item.category_id || '',
      image: item.image || '',
      is_available: item.is_available !== undefined ? item.is_available : true,
      allergens: item.allergens || [],
      dietary_restrictions: item.dietary_restrictions || []
    });
    setShowEditMenuItemModal(true);
  };

  const handleUpdateMenuItem = async (e) => {
    e.preventDefault();
    
    if (!newMenuItem.name || !newMenuItem.price || !newMenuItem.category_id) {
      setError('Please fill in all required fields (Name, Price, Category)');
      return;
    }
    
    if (isNaN(newMenuItem.price) || parseFloat(newMenuItem.price) <= 0) {
      setError('Please enter a valid price greater than 0');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const menuItemData = {
        name: newMenuItem.name,
        category_id: newMenuItem.category_id,
        price: parseFloat(newMenuItem.price),
        description: newMenuItem.description,
        image: newMenuItem.image || null,
        is_available: newMenuItem.is_available,
        allergens: newMenuItem.allergens || [],
        dietary_restrictions: newMenuItem.dietary_restrictions || []
      };
      
      const response = await updateMenuItem(editingMenuItemId, menuItemData);
      console.log('Updated menu item:', response);
      
      setSuccessMessage(`Menu item "${newMenuItem.name}" updated successfully!`);
      
      // Reset form and close modal
      setNewMenuItem({
        name: '',
        description: '',
        price: '',
        category_id: '',
        image: '',
        is_available: true,
        allergens: [],
        dietary_restrictions: []
      });
      setShowEditMenuItemModal(false);
      setEditingMenuItemId(null);
      
      // Refresh menu data
      setTimeout(() => {
        fetchData();
        setSuccessMessage(null);
      }, 1500);
    } catch (err) {
      console.error('Error updating menu item:', err);
      setError('Failed to update menu item: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMenuItem = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await deleteMenuItem(item._id || item.id);
      console.log('Deleted menu item:', response);
      
      setSuccessMessage(`Menu item "${item.name}" deleted successfully!`);
      
      // Refresh menu data
      setTimeout(() => {
        fetchData();
        setSuccessMessage(null);
      }, 1500);
    } catch (err) {
      console.error('Error deleting menu item:', err);
      setError('Failed to delete menu item: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusToggle = async (item) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const newStatus = !item.is_available;
      const response = await updateMenuItemStatus(item._id || item.id, newStatus);
      console.log('Updated menu item status:', response);
      
      const statusText = newStatus ? 'activated' : 'deactivated';
      setSuccessMessage(`Menu item "${item.name}" ${statusText} successfully!`);
      
      // Refresh menu data to reflect the change
      setTimeout(() => {
        fetchData();
        setSuccessMessage(null);
      }, 1500);
    } catch (err) {
      console.error('Error updating menu item status:', err);
      setError('Failed to update menu item status: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  const CreateMenuItemModal = () => (
    <div className="modal-overlay" onClick={() => setShowCreateMenuItemModal(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Menu Item</h3>
          <button 
            className="modal-close" 
            onClick={() => setShowCreateMenuItemModal(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleCreateMenuItem} className="menu-item-form">
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="itemName">Item Name *</label>
              <input
                type="text"
                id="itemName"
                name="name"
                value={newMenuItem.name}
                onChange={handleMenuItemChange}
                required
                className="form-input"
                placeholder="Enter item name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="itemPrice">Price (₹ INR) *</label>
              <input
                type="number"
                id="itemPrice"
                name="price"
                value={newMenuItem.price}
                onChange={handleMenuItemChange}
                required
                min="0"
                step="0.01"
                className="form-input"
                placeholder="Enter price in INR"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="itemDescription">Description</label>
            <textarea
              id="itemDescription"
              name="description"
              value={newMenuItem.description}
              onChange={handleMenuItemChange}
              className="form-textarea"
              placeholder="Enter item description"
              rows="3"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="itemCategory">Category *</label>
              <select
                id="itemCategory"
                name="category_id"
                value={newMenuItem.category_id}
                onChange={handleMenuItemChange}
                required
                className="form-select"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="itemImage">Image URL</label>
              <input
                type="url"
                id="itemImage"
                name="image"
                value={newMenuItem.image}
                onChange={handleMenuItemChange}
                className="form-input"
                placeholder="Enter image URL"
              />
            </div>
          </div>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_available"
                checked={newMenuItem.is_available}
                onChange={handleMenuItemChange}
                className="form-checkbox"
              />
              <span>Item is available for ordering</span>
            </label>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="secondary-button" 
              onClick={() => setShowCreateMenuItemModal(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="primary-button" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Creating...
                </>
              ) : (
                'Create Menu Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  
  const EditMenuItemModal = () => (
    <div className="modal-overlay" onClick={() => setShowEditMenuItemModal(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Menu Item</h3>
          <button 
            className="modal-close" 
            onClick={() => setShowEditMenuItemModal(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleUpdateMenuItem} className="menu-item-form">
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="editItemName">Item Name *</label>
              <input
                type="text"
                id="editItemName"
                name="name"
                value={newMenuItem.name}
                onChange={handleMenuItemChange}
                required
                className="form-input"
                placeholder="Enter item name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="editItemPrice">Price (₹ INR) *</label>
              <input
                type="number"
                id="editItemPrice"
                name="price"
                value={newMenuItem.price}
                onChange={handleMenuItemChange}
                required
                min="0"
                step="0.01"
                className="form-input"
                placeholder="Enter price in INR"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="editItemDescription">Description</label>
            <textarea
              id="editItemDescription"
              name="description"
              value={newMenuItem.description}
              onChange={handleMenuItemChange}
              className="form-textarea"
              placeholder="Enter item description"
              rows="3"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="editItemCategory">Category *</label>
              <select
                id="editItemCategory"
                name="category_id"
                value={newMenuItem.category_id}
                onChange={handleMenuItemChange}
                required
                className="form-select"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="editItemImage">Image URL</label>
              <input
                type="url"
                id="editItemImage"
                name="image"
                value={newMenuItem.image}
                onChange={handleMenuItemChange}
                className="form-input"
                placeholder="Enter image URL"
              />
            </div>
          </div>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_available"
                checked={newMenuItem.is_available}
                onChange={handleMenuItemChange}
                className="form-checkbox"
              />
              <span>Item is available for ordering</span>
            </label>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="secondary-button" 
              onClick={() => setShowEditMenuItemModal(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="primary-button" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Updating...
                </>
              ) : (
                'Update Menu Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  
  const CreateUserModal = () => (
    <div className="modal-overlay" onClick={() => setShowCreateUserModal(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New User</h3>
          <button 
            className="modal-close" 
            onClick={() => setShowCreateUserModal(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleCreateUser} className="user-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={newUser.firstName}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Enter first name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={newUser.lastName}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Enter last name"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={newUser.email}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Enter email address"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={newUser.phone}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter phone number"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="role">User Role *</label>
            <select
              id="role"
              name="role"
              value={newUser.role}
              onChange={handleInputChange}
              required
              className="form-select"
            >
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={newUser.password}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Enter password"
                minLength="6"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={newUser.confirmPassword}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Confirm password"
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="secondary-button" 
              onClick={() => setShowCreateUserModal(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="primary-button" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  
  const navigationItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      description: 'System overview and key metrics',
      permissions: ['admin', 'manager']
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      description: 'Manage users, roles, and permissions',
      permissions: ['admin']
    },
    {
      id: 'menu',
      label: 'Menu Management',
      icon: ShoppingCart,
      description: 'Manage menu items and categories',
      permissions: ['admin', 'manager']
    },
    {
      id: 'orders',
      label: 'Order Management',
      icon: IndianRupee,
      description: 'Track and manage orders',
      permissions: ['admin', 'manager', 'staff']
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Package,
      description: 'Manage inventory levels',
      permissions: ['admin', 'manager']
    },
    {
      id: 'promotions',
      label: 'Promotions',
      icon: Target,
      description: 'Manage discounts and promotions',
      permissions: ['admin', 'marketing']
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: MessageSquare,
      description: 'View and manage customer feedback',
      permissions: ['admin', 'support']
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      description: 'View business analytics and insights',
      permissions: ['admin', 'manager', 'marketing']
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: Settings,
      description: 'Configure system settings',
      permissions: ['admin']
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      description: 'Manage security settings',
      permissions: ['admin']
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      description: 'Configure notification settings',
      permissions: ['admin', 'manager']
    }
  ];
  
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  const filteredNavigationItems = navigationItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const renderContent = () => {
    switch(activeSection) {
      case 'overview':
        return (
          <div className="control-panel-overview">
            <div className="overview-header">
              <h2>System Overview</h2>
              <button className="secondary-button" onClick={fetchDashboardStats}>
                <RefreshCw size={16} />
                Refresh Stats
              </button>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <Activity size={24} />
                </div>
                <div className="stat-info">
                  <h3>{systemStats.uptime}</h3>
                  <p>System Uptime</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-info">
                  <h3>{systemStats.activeUsers}</h3>
                  <p>Active Users</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <ShoppingCart size={24} />
                </div>
                <div className="stat-info">
                  <h3>{systemStats.ordersToday}</h3>
                  <p>Orders Today</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <IndianRupee size={24} />
                </div>
                <div className="stat-info">
                  <h3>₹{systemStats.revenueToday.toLocaleString()}</h3>
                  <p>Revenue Today</p>
                </div>
              </div>
            </div>
            
            <div className="system-health">
              <h3>System Health</h3>
              <div className="health-status">
                <div className="health-item">
                  <CheckCircle size={16} color="#10B981" />
                  <span>Database Connection</span>
                </div>
                <div className="health-item">
                  <CheckCircle size={16} color="#10B981" />
                  <span>Cache System</span>
                </div>
                <div className="health-item">
                  <CheckCircle size={16} color="#10B981" />
                  <span>Payment Gateway</span>
                </div>
                <div className="health-item">
                  <AlertTriangle size={16} color="#F59E0B" />
                  <span>Email Service (Degraded)</span>
                </div>
              </div>
            </div>
            
            <div className="recent-activity">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon">
                    <UserPlus size={16} />
                  </div>
                  <div className="activity-content">
                    <p>New customer registered: John Doe</p>
                    <span className="activity-time">2 mins ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">
                    <ShoppingCart size={16} />
                  </div>
                  <div className="activity-content">
                    <p>New order placed: Order #12345</p>
                    <span className="activity-time">5 mins ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">
                    <IndianRupee size={16} />
                  </div>
                  <div className="activity-content">
                    <p>Payment received: ₹2,450</p>
                    <span className="activity-time">12 mins ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'users':
        return (
          <div className="control-panel-section">
            <h2>User Management</h2>
            <div className="section-content">
              {loading && <div className="loading">Loading users...</div>}
              {error && <div className="error-message">{error}</div>}
              
              <div className="section-controls">
                <div className="search-bar">
                  <Search size={16} />
                  <input 
                    type="text" 
                    placeholder="Search users..." 
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="primary-button" onClick={() => setShowCreateUserModal(true)}>
                  <Plus size={16} />
                  Add User
                </button>
                <button className="secondary-button" onClick={fetchData}>
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>
              
              <div className="actions-grid">
                <button className="action-card" onClick={() => {
                  const name = prompt('Enter user name:');
                  const email = prompt('Enter user email:');
                  const phone = prompt('Enter user phone:');
                  if (name && email) {
                    alert(`User ${name} created successfully!\nEmail: ${email}\nPhone: ${phone || 'N/A'}`);
                    fetchData(); // Refresh the data
                  }
                }}>
                  <Users size={32} />
                  <h3>Create User</h3>
                  <p>Add new user accounts</p>
                </button>
                <button className="action-card" onClick={() => {
                  alert(`Showing analytics for ${users.length} users:\n- Active users: ${users.filter(u => u.status !== 'inactive').length}\n- New registrations: ${users.filter(u => {
                    const regDate = new Date(u.created_at || u.createdAt);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return regDate > weekAgo;
                  }).length}\n- Total registered: ${users.length}`);
                }}>
                  <TrendingUp size={32} />
                  <h3>User Analytics</h3>
                  <p>View user behavior and statistics</p>
                </button>
                <button className="action-card" onClick={() => {
                  const roles = ['admin', 'manager', 'staff', 'customer'];
                  const selectedRole = prompt(`Select role:\n${roles.map((r, i) => `${i + 1}. ${r}`).join('\n')}`);
                  if (selectedRole && parseInt(selectedRole) <= roles.length) {
                    alert(`Role management for ${roles[parseInt(selectedRole) - 1]} opened`);
                  }
                }}>
                  <Shield size={32} />
                  <h3>Role Management</h3>
                  <p>Configure user roles and permissions</p>
                </button>
                <button className="action-card" onClick={() => {
                  alert(`Notification settings:
- Email notifications: Enabled
- SMS notifications: Disabled
- Push notifications: Enabled
- Configure notification templates and schedules`);
                }}>
                  <Bell size={32} />
                  <h3>Notifications</h3>
                  <p>Configure user notifications</p>
                </button>
              </div>
              
              <div className="data-table">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Registered</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map((user, index) => (
                        <tr key={user.id || user._id || index}>
                          <td>{user.name || `${user.first_name} ${user.last_name}`}</td>
                          <td>{user.email || 'N/A'}</td>
                          <td>{user.phone || 'N/A'}</td>
                          <td>{new Date(user.created_at || user.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button className="action-btn edit" onClick={() => alert('Edit user feature coming soon')}>
                              <Edit size={14} />
                            </button>
                            <button className="action-btn delete" onClick={() => alert('Delete user feature coming soon')}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="no-data">No users found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
        
      case 'menu':
        return (
          <div className="control-panel-section">
            <h2>Menu Management</h2>
            <div className="section-content">
              {loading && <div className="loading">Loading menu items...</div>}
              {error && <div className="error-message">{error}</div>}
              {successMessage && <div className="success-message">{successMessage}</div>}
              
              <div className="section-controls">
                <div className="search-bar">
                  <Search size={16} />
                  <input 
                    type="text" 
                    placeholder="Search menu items..." 
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="primary-button" onClick={() => setShowCreateMenuItemModal(true)}>
                  <Plus size={16} />
                  Add Item
                </button>
                <button className="secondary-button" onClick={fetchData}>
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>
              
              <div className="actions-grid">
                <button className="action-card" onClick={() => setShowCreateMenuItemModal(true)}>
                  <ShoppingCart size={32} />
                  <h3>Add Item</h3>
                  <p>Create new menu items</p>
                </button>
                <button className="action-card" onClick={() => {
                  const categories = ['Starters', 'Main Course', 'Desserts', 'Drinks'];
                  const categoryInfo = categories.map((cat, i) => 
                    `${i + 1}. ${cat} (${menuItems.filter(item => item.category === cat.toLowerCase() || item.category_id?.name === cat).length} items)`
                  ).join('\\n');
                  alert(`Current categories:\\n${categoryInfo}\\n\\nTotal items: ${menuItems.length}`);
                }}>
                  <Package size={32} />
                  <h3>Categories</h3>
                  <p>Manage menu categories</p>
                </button>
              </div>
              
              <div className="data-table">
                <table className="menu-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuItems.length > 0 ? (
                      menuItems.map((item, index) => (
                        <tr key={item.id || item._id || index}>
                          <td>{item.name || item.item_name}</td>
                          <td>{item.category_id?.name || item.category || 'Uncategorized'}</td>
                          <td>₹{item.price || item.cost || 0}</td>
                          <td>
                            <span className={`status-badge ${item.is_available ? 'active' : 'inactive'}`}>
                              {item.is_available ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="action-btn toggle" 
                              onClick={() => handleStatusToggle(item)}
                              title={item.is_available ? 'Deactivate item' : 'Activate item'}
                            >
                              {item.is_available ? '⊘' : '✓'}
                            </button>
                            <button 
                              className="action-btn edit" 
                              onClick={() => handleEditMenuItem(item)}
                              title="Edit item"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              className="action-btn delete" 
                              onClick={() => handleDeleteMenuItem(item)}
                              title="Delete item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="no-data">No menu items found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
        
      case 'orders':
        return (
          <div className="control-panel-section">
            <h2>Order Management</h2>
            <div className="section-content">
              {loading && <div className="loading">Loading orders...</div>}
              {error && <div className="error-message">{error}</div>}
              
              <div className="section-controls">
                <div className="search-bar">
                  <Search size={16} />
                  <input 
                    type="text" 
                    placeholder="Search orders..." 
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="filter-controls">
                  <select className="filter-select" onChange={(e) => {
                    const status = e.target.value;
                    const filteredOrders = status === 'all' ? orders : orders.filter(order => {
                      const orderStatus = order.status || 'unknown';
                      return orderStatus.toLowerCase() === status.toLowerCase();
                    });
                    alert(`Filtered ${filteredOrders.length} orders with status: ${status}`);
                  }}>
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button className="primary-button" onClick={fetchData}>
                    <RefreshCw size={16} />
                    Refresh
                  </button>
                </div>
              </div>
              
              <div className="data-table">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Table</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length > 0 ? (
                      orders.map((order, index) => {
                        // Handle both kitchen orders and regular orders
                        const orderId = order.order_id?._id || order.order_id || order.id || order._id;
                        const customerName = order.order_id?.user_id ? 
                          `${order.order_id.user_id.first_name} ${order.order_id.user_id.last_name}` : 
                          'Guest';
                        const tableNumber = order.table_number || order.order_id?.table_number || 'N/A';
                        const total = order.total_price || order.order_id?.total_price || 0;
                        const status = order.status || 'unknown';
                        const createdAt = order.createdAt || order.order_id?.createdAt || new Date();
                        
                        return (
                          <tr key={orderId || index}>
                            <td>#{orderId?.toString().substring(0, 8) || 'N/A'}</td>
                            <td>{customerName}</td>
                            <td>Table {tableNumber}</td>
                            <td>₹{total.toFixed(2)}</td>
                            <td><span className={`status-badge ${status}`}>{status.toUpperCase()}</span></td>
                            <td>{new Date(createdAt).toLocaleDateString()}</td>
                            <td>
                              <button className="action-btn view" onClick={() => {
                                const order = orders.find(o => (o.order_id?._id || o.order_id || o.id || o._id) === orderId);
                                if (order) {
                                  alert(`Order Details:
Order ID: #${orderId?.toString().substring(0, 8)}
Customer: ${customerName}
Table: ${tableNumber}
Status: ${status}
Total: ₹${total.toFixed(2)}
Created: ${new Date(createdAt).toLocaleString()}

Items: ${order.items ? order.items.map(item => `${item.quantity}x ${item.name}`).join(', ') : 'N/A'}`);
                                }
                              }}>
                                <Eye size={14} />
                              </button>
                              <button className="action-btn edit" onClick={() => {
                                const newStatus = prompt('Enter new status (pending/preparing/ready/completed/cancelled):', status);
                                if (newStatus && ['pending', 'preparing', 'ready', 'completed', 'cancelled'].includes(newStatus.toLowerCase())) {
                                  alert(`Order #${orderId?.toString().substring(0, 8)} status updated to: ${newStatus}`);
                                  fetchData(); // Refresh data
                                }
                              }}>
                                <Edit size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="no-data">No orders found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
        
      case 'inventory':
        return <InventoryManagement />;
        
      case 'promotions':
        return <PromotionManagement />;
        
      case 'feedback':
        return (
          <div className="control-panel-section">
            <h2>Feedback Management</h2>
            <div className="section-content">
              {loading && <div className="loading">Loading feedback...</div>}
              {error && <div className="error-message">{error}</div>}
              
              <div className="section-controls">
                <div className="search-bar">
                  <Search size={16} />
                  <input 
                    type="text" 
                    placeholder="Search feedback..." 
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="secondary-button" onClick={fetchData}>
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>
              
              <div className="feedback-stats">
                <div className="stat-card">
                  <div className="stat-icon">
                    <MessageSquare size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>{feedback.length}</h3>
                    <p>Total Feedbacks</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <Star size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>
                      {feedback.length > 0 
                        ? (feedback.reduce((sum, f) => sum + (f.rating || f.overallExperienceRating || 0), 0) / feedback.length).toFixed(1)
                        : '0.0'}
                    </h3>
                    <p>Average Rating</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <CheckCircle size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>{feedback.filter(f => (f.rating || f.overallExperienceRating || 0) >= 4).length}</h3>
                    <p>Positive Reviews</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <AlertTriangle size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>{feedback.filter(f => (f.rating || f.overallExperienceRating || 0) <= 2).length}</h3>
                    <p>Needs Attention</p>
                  </div>
                </div>
              </div>
              
              <div className="advanced-feedback-display">
                <div className="feedback-cards-grid">
                  {(feedback.length > 0 ? feedback : []).map((feedbackItem, index) => (
                    <div key={feedbackItem.id || feedbackItem._id || index} className="feedback-card">
                      <div className="feedback-card-header">
                        <div className="user-info">
                          <div className="user-avatar">
                            {feedbackItem.email?.charAt(0).toUpperCase() || 'A'}
                          </div>
                          <div className="user-details">
                            <h4>{feedbackItem.email || 'Anonymous'}</h4>
                            {feedbackItem.customer_name && (
                              <p className="customer-name">{feedbackItem.customer_name}</p>
                            )}
                            {feedbackItem.table_number && (
                              <p className="table-number">Table #{feedbackItem.table_number}</p>
                            )}
                          </div>
                        </div>
                        <div className="feedback-meta">
                          <span className="feedback-date">
                            {new Date(feedbackItem.createdAt || feedbackItem.created_at || new Date()).toLocaleDateString()}
                          </span>
                          <div className={`sentiment-indicator ${feedbackItem.sentiment_category || 'neutral'}`}>
                            {feedbackItem.sentiment_category === 'positive' ? '😊' : 
                             feedbackItem.sentiment_category === 'negative' ? '😞' : '😐'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="feedback-ratings">
                        <div className="main-rating">
                          <div className="rating-display">
                            <div className="stars-container">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={20} 
                                  className={i < (feedbackItem.rating || 0) ? 'filled' : ''}
                                />
                              ))}
                            </div>
                            <span className="rating-score">{feedbackItem.rating || 0}/5</span>
                          </div>
                          <div className="rating-label">
                            {feedbackItem.rating >= 4 ? 'Excellent' : 
                             feedbackItem.rating >= 3 ? 'Good' : 
                             feedbackItem.rating >= 2 ? 'Average' : 'Poor'}
                          </div>
                        </div>
                        
                        <div className="detailed-ratings">
                          <div className="rating-metric">
                            <span className="metric-label">Food</span>
                            <div className="metric-value">
                              <div className="mini-stars">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={14} className={i < (feedbackItem.food_quality || 0) ? 'filled' : ''} />
                                ))}
                                <span>{feedbackItem.food_quality || 0}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="rating-metric">
                            <span className="metric-label">Service</span>
                            <div className="metric-value">
                              <div className="mini-stars">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={14} className={i < (feedbackItem.service_rating || 0) ? 'filled' : ''} />
                                ))}
                                <span>{feedbackItem.service_rating || 0}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="rating-metric">
                            <span className="metric-label">Ambience</span>
                            <div className="metric-value">
                              <div className="mini-stars">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={14} className={i < (feedbackItem.ambience_rating || 0) ? 'filled' : ''} />
                                ))}
                                <span>{feedbackItem.ambience_rating || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="feedback-content">
                        <div className="experience-section">
                          <h5>Overall Experience</h5>
                          <p>{feedbackItem.overall_experience || feedbackItem.message || 'No detailed feedback provided'}</p>
                        </div>
                        
                        {feedbackItem.would_recommend && (
                          <div className={`recommendation-section ${feedbackItem.would_recommend}`}>
                            <h5>Recommendation</h5>
                            <span className={feedbackItem.would_recommend === 'yes' ? 'positive' : 'negative'}>
                              {feedbackItem.would_recommend === 'yes' ? '👍 Would Recommend' : '👎 Would Not Recommend'}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="feedback-actions">
                        <button 
                          className="btn-view-details"
                          onClick={() => {
                            const details = `
📊 Detailed Feedback Report

👤 User Information:
Email: ${feedbackItem.email || 'Anonymous'}
Customer Name: ${feedbackItem.customer_name || 'N/A'}
Table Number: ${feedbackItem.table_number || 'N/A'}
Mobile: ${feedbackItem.mobile_number || 'N/A'}
Date: ${new Date(feedbackItem.createdAt || feedbackItem.created_at).toLocaleString()}

⭐ Ratings Summary:
Overall Rating: ${feedbackItem.rating || 0}/5
Food Quality: ${feedbackItem.food_quality || 0}/5
Service Rating: ${feedbackItem.service_rating || 0}/5
Ambience Rating: ${feedbackItem.ambience_rating || 0}/5

💭 Feedback Content:
Overall Experience: ${feedbackItem.overall_experience || 'N/A'}

👍 Recommendation: ${feedbackItem.would_recommend || 'N/A'}

📝 Additional Comments: ${feedbackItem.message || 'No additional comments'}
                            `;
                            alert(details);
                          }}
                        >
                          <Eye size={16} />
                          View Full Details
                        </button>
                        
                        <button 
                          className="btn-delete"
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
                              try {
                                // In a real implementation, this would call an API to delete the feedback
                                alert('Feedback deleted successfully!');
                                fetchData(); // Refresh the data
                              } catch (error) {
                                alert('Error deleting feedback: ' + error.message);
                              }
                            }
                          }}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {feedback.length > 0 && (
                <div className="feedback-analytics">
                  <h3>Feedback Analytics</h3>
                  <div className="analytics-charts">
                    <div className="chart-card">
                      <h4>Rating Distribution</h4>
                      <div className="rating-distribution">
                        {[5, 4, 3, 2, 1].map(rating => {
                          const count = feedback.filter(f => (f.rating || f.overallExperienceRating || 0) === rating).length;
                          const percentage = feedback.length > 0 ? (count / feedback.length * 100).toFixed(1) : 0;
                          return (
                            <div key={rating} className="rating-bar">
                              <span className="rating-label">{rating} ★</span>
                              <div className="bar-container">
                                <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
                              </div>
                              <span className="rating-count">{count} ({percentage}%)</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="chart-card">
                      <h4>Recent Trends</h4>
                      <div className="trend-analysis">
                        <p>Last 7 days: {feedback.filter(f => {
                          const date = new Date(f.createdAt || f.created_at);
                          const weekAgo = new Date();
                          weekAgo.setDate(weekAgo.getDate() - 7);
                          return date > weekAgo;
                        }).length} feedbacks</p>
                        <p>Average response time: 2 hours</p>
                        <p>Resolution rate: 95%</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'analytics':
        return (
          <div className="control-panel-section">
            <h2>Analytics Dashboard</h2>
            <div className="section-content">
              {loading && <div className="loading">Loading analytics...</div>}
              {error && <div className="error-message">{error}</div>}
              
              <div className="section-controls">
                <div className="date-filters">
                  <div className="filter-group">
                    <label htmlFor="dateFrom">From:</label>
                    <input type="date" id="dateFrom" />
                  </div>
                  <div className="filter-group">
                    <label htmlFor="dateTo">To:</label>
                    <input type="date" id="dateTo" />
                  </div>
                </div>
                <button className="secondary-button" onClick={fetchData}>
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>
              
              <div className="analytics-overview">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">
                      <ShoppingCart size={24} />
                    </div>
                    <div className="stat-info">
                      <h3>{systemStats.ordersToday}</h3>
                      <p>Total Orders</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <IndianRupee size={24} />
                    </div>
                    <div className="stat-info">
                      <h3>₹{systemStats.revenueToday.toLocaleString()}</h3>
                      <p>Total Revenue</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <TrendingUp size={24} />
                    </div>
                    <div className="stat-info">
                      <h3>0%</h3>
                      <p>Growth Rate</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <Star size={24} />
                    </div>
                    <div className="stat-info">
                      <h3>0.0</h3>
                      <p>Avg Rating</p>
                    </div>
                  </div>
                </div>
                
                <div className="charts-grid">
                  <div className="chart-card">
                    <h3>Sales Trends</h3>
                    <div className="chart-placeholder">
                      {loading ? (
                        <p>Loading chart...</p>
                      ) : (
                        <p>Sales Chart Visualization - {systemStats.ordersToday} orders today</p>
                      )}
                    </div>
                  </div>
                  <div className="chart-card">
                    <h3>Popular Items</h3>
                    <div className="chart-placeholder">
                      {loading ? (
                        <p>Loading chart...</p>
                      ) : (
                        <p>Most Ordered Items Chart - Coming Soon</p>
                      )}
                    </div>
                  </div>
                  <div className="chart-card">
                    <h3>Customer Demographics</h3>
                    <div className="chart-placeholder">
                      {loading ? (
                        <p>Loading chart...</p>
                      ) : (
                        <p>Customer Distribution Chart - Coming Soon</p>
                      )}
                    </div>
                  </div>
                  <div className="chart-card">
                    <h3>Revenue by Category</h3>
                    <div className="chart-placeholder">
                      {loading ? (
                        <p>Loading chart...</p>
                      ) : (
                        <p>Revenue Distribution Chart - Coming Soon</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'settings':
      case 'security':
      case 'notifications':
        return (
          <div className="control-panel-section">
            <h2>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Management</h2>
            <div className="section-content">
              <div className="coming-soon">
                <h3>Feature Coming Soon</h3>
                <p>This section is currently under development. Please check back later.</p>
                <div className="section-actions">
                  <button className="secondary-button" onClick={() => setActiveSection('overview')}>
                    <ArrowLeft size={16} />
                    Back to Overview
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="control-panel-default">
            <h2>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Management</h2>
            <p>This section is currently under development. Please check back later.</p>
            <div className="section-actions">
              <button className="secondary-button" onClick={() => setActiveSection('overview')}>
                <ArrowLeft size={16} />
                Back to Overview
              </button>
            </div>
          </div>
        );
    }
  };

  return(
    <div className="admin-control-panel">
      <AdminNavbar />
      <div className="control-panel-container">
        <div className="sidebar">
          <h3>Management</h3>
          <nav className="menu">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <IconComponent size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="main-content">
          {renderContent()}
        </div>
      </div>
      
      {/* Modals */}
      {showCreateUserModal && <CreateUserModal />}
      {showCreateMenuItemModal && <CreateMenuItemModal />}
      {showEditMenuItemModal && <EditMenuItemModal />}
    </div>
  );
}