const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const connectDB = async () => {
  try {
    console.log('MONGODB_URI from env:', process.env.MONGODB_URI);
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

// Define schemas for all collections

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  phone: String,
  role: { 
    type: String, 
    enum: ['customer', 'waiter', 'kitchen_staff', 'admin'], 
    default: 'customer' 
  },
  date_of_birth: Date,
  is_active: { type: Boolean, default: true },
  email_verified: { type: Boolean, default: false },
  last_login: Date
}, { timestamps: true });

// Category Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String
}, { timestamps: true });

// MenuItem Schema
const menuItemSchema = new mongoose.Schema({
  id: { type: Number, unique: true }, // Add numeric ID for backward compatibility
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  image: String,
  is_available: { type: Boolean, default: true },
  calories: Number,
  preparation_time: Number,
  allergens: [String],
  dietary_restrictions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DietaryRestriction' }]
}, { timestamps: true });

// DietaryRestriction Schema
const dietaryRestrictionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String
}, { timestamps: true });

// UserPreference Schema
const userPreferenceSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  preferred_spice_level: { type: String, default: 'medium' },
  preferred_cuisine_types: [String],
  notification_preferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true }
  },
  default_table_size: { type: Number, default: 2 },
  special_instructions: String
}, { timestamps: true });

// UserDietaryRestriction Schema (many-to-many relationship)
const userDietaryRestrictionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dietary_restriction_id: { type: mongoose.Schema.Types.ObjectId, ref: 'DietaryRestriction', required: true }
}, { timestamps: true });

// Order Schema
const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  waiter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  table_number: { type: Number, required: true },
  total_price: { type: Number, required: true },
  items: [{
    item_name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    customizations: String
  }],
  status: { 
    type: String, 
    enum: ['pending', 'prepairing', 'prepaired', 'completed', 'delivered', 'cancelled', 'served'],
    default: 'pending' 
  },
  preparation_time: Number,
  payment_method: { 
    type: String, 
    enum: ['razorpay'],
    default: 'razorpay'
  },
  payment_status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending' 
  },
  receipt_sent: { type: Boolean, default: false },
  split_bill: { type: Boolean, default: false },
  order_type: { 
    type: String, 
    enum: ['dine_in', 'takeaway', 'delivery'], 
    default: 'dine_in' 
  },
  special_instructions: String,
  razorpay_order_id: String,
  razorpay_payment_id: String
}, { timestamps: true });

// OrderItem Schema
const orderItemSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  item_name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  customizations: String,
  status: { 
    type: String, 
    enum: ['pending', 'prepairing', 'prepaired', 'completed', 'cancelled', 'served'], 
    default: 'pending' 
  }
}, { timestamps: true });

// KitchenOrder Schema
const kitchenOrderSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  waiter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  table_number: { type: Number, required: true },
  item_name: { type: String, required: true },
  quantity: { type: Number, required: true },
  customizations: String,
  status: { 
    type: String, 
    enum: ['pending', 'prepairing', 'prepaired', 'completed', 'cancelled', 'served'], 
    default: 'pending' 
  },
  priority_level: { type: Number, default: 3 }, // 1=high, 2=medium, 3=low
  preparation_time: Number
}, { timestamps: true });

// FavoriteItem Schema
const favoriteItemSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  menu_item_id: { type: String, required: true }, // Store as string since it's a reference to menu item name
  customizations: String
}, { timestamps: true });

// OrderHistory Schema
const orderHistorySchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, required: true },
  notes: String
}, { timestamps: true });

// Inventory Schema
const inventorySchema = new mongoose.Schema({
  ingredient_name: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  price: { type: Number, default: 0 }, // Add price field with default value of 0
  reorder_level: Number,
  supplier_info: String
}, { timestamps: true });

// Promotion Schema
const promotionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  discount_type: { 
    type: String, 
    enum: ['percentage', 'fixed_amount', 'buy_get'], 
    required: true 
  },
  discount_value: { type: Number, required: true },
  valid_from: { type: Date, required: true },
  valid_to: { type: Date, required: true },
  applicable_items: [String],
  minimum_order_value: Number,
  usage_limit: { type: Number, default: 1 },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Customer Schema
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: String,
  email: String
}, { timestamps: true });

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Add user_id field
  email: String,
  message: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  sentiment_score: Number,
  sentiment_category: { 
    type: String, 
    enum: ['positive', 'neutral', 'negative'] 
  },
  metadata: {
    tableNumber: String,
    customerName: String,
    mobileNumber: String,
    overallExperience: String,
    overallExperienceRating: Number,
    foodQuality: Number,
    serviceRating: Number,
    ambienceRating: Number,
    wouldRecommend: String
  }
}, { timestamps: true });

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  phone: String,
  subject: String
}, { timestamps: true });

// Export models
const User = mongoose.model('User', userSchema);
const Category = mongoose.model('Category', categorySchema);
const MenuItem = mongoose.model('MenuItem', menuItemSchema);
const DietaryRestriction = mongoose.model('DietaryRestriction', dietaryRestrictionSchema);
const UserPreference = mongoose.model('UserPreference', userPreferenceSchema);
const UserDietaryRestriction = mongoose.model('UserDietaryRestriction', userDietaryRestrictionSchema);
const Order = mongoose.model('Order', orderSchema);
const OrderItem = mongoose.model('OrderItem', orderItemSchema);
const KitchenOrder = mongoose.model('KitchenOrder', kitchenOrderSchema);
const FavoriteItem = mongoose.model('FavoriteItem', favoriteItemSchema);
const OrderHistory = mongoose.model('OrderHistory', orderHistorySchema);
const Inventory = mongoose.model('Inventory', inventorySchema);
const Promotion = mongoose.model('Promotion', promotionSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);
const Contact = mongoose.model('Contact', contactSchema);

module.exports = {
  connectDB,
  User,
  Category,
  MenuItem,
  DietaryRestriction,
  UserPreference,
  UserDietaryRestriction,
  Order,
  OrderItem,
  KitchenOrder,
  FavoriteItem,
  OrderHistory,
  Inventory,
  Promotion,
  Customer,
  Feedback,
  Contact
};