import React, { useState, useEffect, useContext } from "react";
import "../styles/Menu.css";
import Navbar from "../components/Navbar";
import { CartContext } from "../context/CartContext";
import Footer from "../components/Footer";
import { useSearchParams } from "react-router-dom";
import apiService from '../services/apiService';
import useFavorites from '../hooks/useFavorites';
import { useAuth } from "../context/AuthContext";
import CartRecoveryNotification from "../components/CartRecoveryNotification";
import CartAddedNotification from "../components/CartAddedNotification";
import AllergenWarning from "../components/AllergenWarning";
import { Heart } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const { user, isAuthenticated } = useAuth();
  const {
    isItemFavorited,
    toggleFavorite,
    getFavoriteByItem
  } = useFavorites();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuFilter, setMenuFilter] = useState("all");
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAllergenWarning, setShowAllergenWarning] = useState(false);
  const [pendingCartItem, setPendingCartItem] = useState(null);
  const [customizations, setCustomizations] = useState({
    spiceLevel: "",
    extraToppings: [],
    dietaryRestrictions: [],
    specialInstructions: ""
  });
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [selectedNutrition, setSelectedNutrition] = useState(null);
  const [cartAdded, setCartAdded] = useState({ itemName: '', show: false });
  
  // Menu filters
  const menuFilters = [
    { value: "all", label: "All Items" },
    { value: "Starters", label: "Starters" },
    { value: "Main Course", label: "Main Course" },
    { value: "Desserts", label: "Desserts" },
    { value: "Drinks", label: "Drinks" }
  ];

  // Customization options
  const spiceLevels = [
    { value: "", label: "Regular" },
    { value: "mild", label: "Mild" },
    { value: "medium", label: "Medium" },
    { value: "hot", label: "Hot" },
    { value: "extra-hot", label: "Extra Hot" },
    { value: "no-spice", label: "No Spice" }
  ];

  const extraToppings = [
    { value: "extra-cheese", label: "Extra Cheese (+₹1.50)" },
    { value: "extra-sauce", label: "Extra Sauce (+₹0.50)" },
    { value: "bacon", label: "Bacon (+₹2.00)" },
    { value: "mushrooms", label: "Mushrooms (+₹1.00)" },
    { value: "olives", label: "Olives (+₹1.00)" },
    { value: "avocado", label: "Avocado (+₹1.50)" }
  ];

  const dietaryRestrictions = [
    { value: "no-onion", label: "No Onion" },
    { value: "no-garlic", label: "No Garlic" },
    { value: "no-dairy", label: "No Dairy" },
    { value: "no-nuts", label: "No Nuts" },
    { value: "jain-food", label: "Jain Food (No Onion/Garlic/Potato)" }
  ];

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const response = await apiService.getMenuItems();
      
      // Process the response from the new API structure
      if (response && Array.isArray(response)) {
        const processedMenu = processMenuItemsResponse(response);
        setMenuItems(processedMenu);
        setError(null);
      } else if (response && response.status === 'success' && response.data && Array.isArray(response.data)) {
        const processedMenu = processMenuItemsResponse(response.data);
        setMenuItems(processedMenu);
        setError(null);
      } else if (response && response.status === 'success' && response.data && response.data.menuItems && Array.isArray(response.data.menuItems)) {
        const processedMenu = processMenuItemsResponse(response.data.menuItems);
        setMenuItems(processedMenu);
        setError(null);
      } else {
        console.warn('⚠️ Invalid menu structure, using fallback data');
        setMenuItems(getFallbackMenuData());
        setError(null);
      }
      
    } catch (err) {
      console.error("❌ Error fetching menu:", {
        message: err.message,
        response: err.originalError?.response?.data,
        status: err.status
      });
      
      // Provide more specific error messages
      let errorMessage = "Failed to load menu items. ";
      
      if (err.status === 500) {
        errorMessage += "Server error occurred. Please check the database connection.";
      } else if (err.message?.includes('timeout')) {
        errorMessage += "Request timeout. Please check your internet connection.";
      } else {
        errorMessage += "Please try again later.";
      }
      
      setError(errorMessage);
      
      // Set fallback menu data for development
      console.log('🔄 Using fallback menu data');
      setMenuItems(getFallbackMenuData());
      
    } finally {
      setLoading(false);
    }
  };

  // Process the flat array response into grouped categories
  const processMenuItemsResponse = (menuItemsArray) => {
    try {
      // Define category mapping based on actual category names
      // We'll rely on the category name from the populated data instead of hardcoded IDs
      
      // Ensure we're working with an array
      if (!Array.isArray(menuItemsArray)) {
        console.error('Invalid menu items array:', menuItemsArray);
        return [];
      }
      
      // Group items by category_id
      const groupedItems = menuItemsArray.reduce((acc, item) => {
        // Handle different response formats and use actual category names
        // The API returns category_name directly, and sometimes category as an object
        const categoryName = (item.category && item.category.name) || 
                           (item.category_name) || 
                           (item.category_id) || 
                           'Other';
        
        if (!acc[categoryName]) {
          acc[categoryName] = [];
        }
        
        // Transform the item to match expected structure
        acc[categoryName].push({
          id: item.id || item._id,
          name: item.name,
          description: item.description,
          price: parseFloat(item.price),
          image: item.image || '/images/default-menu-item.jpg',
          is_available: item.is_available !== undefined ? item.is_available : true,
          created_at: item.created_at,
          updated_at: item.updated_at
        });
        
        return acc;
      }, {});
      
      // Convert to expected menu structure
      return Object.keys(groupedItems).map(categoryName => ({
        category: categoryName,
        items: groupedItems[categoryName]
      }));
    } catch (error) {
      console.error('Error processing menu items:', error);
      return getFallbackMenuData();
    }
  };

  // Fallback menu data for development/testing - Complete menu with all items
  const getFallbackMenuData = () => {
    return [
      {
        category: "Starters",
        items: [
          {
            id: 1,
            name: "Garlic Bread",
            description: "Toasted bread with garlic butter",
            price: 5.99,
            image: "/images/garlic-bread.jpg",
            is_available: true
          },
          {
            id: 2,
            name: "Bruschetta",
            description: "Tomato, basil, and mozzarella on toasted bread",
            price: 7.99,
            image: "/images/bruschetta.jpg",
            is_available: true
          },
          {
            id: 9,
            name: "Stuffed Mushrooms",
            description: "Mushrooms stuffed with cheese and herbs",
            price: 8.99,
            image: "/images/stuffed-mushrooms.jpg",
            is_available: true
          },
          {
            id: 10,
            name: "Mozzarella Sticks",
            description: "Crispy fried mozzarella with marinara sauce",
            price: 6.99,
            image: "/images/mozzarella-sticks.jpg",
            is_available: true
          },
          {
            id: 11,
            name: "Chicken Wings",
            description: "Spicy glazed chicken wings",
            price: 9.99,
            image: "/images/chicken-wings.jpg",
            is_available: true
          },
          {
            id: 12,
            name: "Spring Rolls",
            description: "Crispy vegetable-filled rolls with dipping sauce",
            price: 7.49,
            image: "/images/spring-rolls.jpg",
            is_available: true
          },
          {
            id: 25,
            name: "Onion Rings",
            description: "Crispy fried onion rings with dipping sauce",
            price: 6.49,
            image: "/images/onion-rings.jpg",
            is_available: true
          },
          {
            id: 26,
            name: "Calamari",
            description: "Fried squid with garlic aioli",
            price: 9.99,
            image: "/images/calamari.jpg",
            is_available: true
          },
          {
            id: 27,
            name: "Prawn Cocktail",
            description: "Chilled prawns with cocktail sauce",
            price: 10.99,
            image: "/images/prawn-cocktail.jpg",
            is_available: true
          },
          {
            id: 28,
            name: "Caprese Salad",
            description: "Tomato, mozzarella, and basil with balsamic glaze",
            price: 8.49,
            image: "/images/caprese.jpg",
            is_available: true
          }
        ]
      },
      {
        category: "Main Course",
        items: [
          {
            id: 3,
            name: "Grilled Salmon",
            description: "Fresh salmon with lemon butter sauce",
            price: 15.99,
            image: "/images/salmon.jpg",
            is_available: true
          },
          {
            id: 4,
            name: "Chicken Alfredo",
            description: "Creamy pasta with grilled chicken",
            price: 12.99,
            image: "/images/chicken-alfredo.jpg",
            is_available: true
          },
          {
            id: 13,
            name: "Ribeye Steak",
            description: "Juicy grilled ribeye steak with garlic butter",
            price: 22.99,
            image: "/images/ribeye-steak.jpg",
            is_available: true
          },
          {
            id: 14,
            name: "Vegetable Stir-Fry",
            description: "Fresh vegetables stir-fried with soy sauce",
            price: 10.99,
            image: "/images/vegetable-stir-fry.jpg",
            is_available: true
          },
          {
            id: 15,
            name: "Lamb Chops",
            description: "Grilled lamb chops with rosemary sauce",
            price: 19.99,
            image: "/images/lamb-chops.jpg",
            is_available: true
          },
          {
            id: 16,
            name: "Spaghetti Carbonara",
            description: "Classic Italian pasta with bacon and parmesan",
            price: 13.49,
            image: "/images/Pasta_Carbonara.jpg",
            is_available: true
          },
          {
            id: 29,
            name: "BBQ Ribs",
            description: "Slow-cooked ribs with BBQ sauce",
            price: 21.99,
            image: "/images/bbq-ribs.jpg",
            is_available: true
          },
          {
            id: 30,
            name: "Seafood Paella",
            description: "Spanish rice with seafood and saffron",
            price: 18.99,
            image: "/images/seafood-paella.jpg",
            is_available: true
          },
          {
            id: 31,
            name: "Beef Stroganoff",
            description: "Beef in creamy mushroom sauce with pasta",
            price: 17.99,
            image: "/images/beef-stroganoff.jpg",
            is_available: true
          },
          {
            id: 32,
            name: "Chicken Tikka Masala",
            description: "Grilled chicken in creamy tomato curry",
            price: 14.99,
            image: "/images/chicken-tikka.jpg",
            is_available: true
          },
          {
            id: 41,
            name: "Beef Burger",
            description: "Juicy beef patty with lettuce, tomato, and special sauce",
            price: 12.99,
            image: "/images/Beef_burger.jpg",
            is_available: true
          },
          {
            id: 42,
            name: "Grilled Chicken",
            description: "Tender grilled chicken breast with herbs and spices",
            price: 13.99,
            image: "/images/Grilled_Chiken.jpg",
            is_available: true
          },
          {
            id: 43,
            name: "Margherita Pizza",
            description: "Classic pizza with tomato sauce, mozzarella, and fresh basil",
            price: 14.99,
            image: "/images/Margherita_Pizza.jpg",
            is_available: true
          }
        ]
      },
      
      {
        category: "Desserts",
        items: [
          {
            id: 5,
            name: "Chocolate Cake",
            description: "Rich chocolate cake with ganache",
            price: 6.99,
            image: "/images/chocolate-cake.jpg",
            is_available: true
          },
          {
            id: 6,
            name: "Cheesecake",
            description: "Classic New York-style cheesecake",
            price: 7.99,
            image: "/images/cheesecake.jpg",
            is_available: true
          },
          {
            id: 17,
            name: "Tiramisu",
            description: "Classic Italian coffee-flavored dessert",
            price: 8.49,
            image: "/images/tiramisu.jpg",
            is_available: true
          },
          {
            id: 18,
            name: "Apple Pie",
            description: "Warm apple pie with cinnamon",
            price: 6.49,
            image: "/images/apple-pie.jpg",
            is_available: true
          },
          {
            id: 19,
            name: "Ice Cream Sundae",
            description: "Vanilla ice cream with chocolate sauce",
            price: 5.99,
            image: "/images/ice-cream-sundae.jpg",
            is_available: true
          },
          {
            id: 20,
            name: "Brownie with Ice Cream",
            description: "Chocolate brownie served with vanilla ice cream",
            price: 7.99,
            image: "/images/brownie.jpg",
            is_available: true
          },
          {
            id: 33,
            name: "Panna Cotta",
            description: "Creamy Italian dessert with berry sauce",
            price: 7.49,
            image: "/images/panna-cotta.jpg",
            is_available: true
          },
          {
            id: 34,
            name: "Fruit Tart",
            description: "Pastry crust filled with custard and fresh fruit",
            price: 6.99,
            image: "/images/fruit-tart.jpg",
            is_available: true
          },
          {
            id: 35,
            name: "Lemon Meringue Pie",
            description: "Tangy lemon pie with fluffy meringue",
            price: 6.99,
            image: "/images/lemon-pie.jpg",
            is_available: true
          },
          {
            id: 36,
            name: "Macarons",
            description: "Assorted French macarons",
            price: 8.99,
            image: "/images/macarons.jpg",
            is_available: true
          }
        ]
      },
      {
        category: "Drinks",
        items: [
          {
            id: 7,
            name: "Iced Tea",
            description: "Refreshing iced tea with lemon",
            price: 2.99,
            image: "/images/iced-tea.jpg",
            is_available: true
          },
          {
            id: 8,
            name: "Cappuccino",
            description: "Espresso with steamed milk foam",
            price: 3.99,
            image: "/images/cappuccino.jpg",
            is_available: true
          },
          {
            id: 21,
            name: "Lemonade",
            description: "Freshly squeezed lemonade",
            price: 3.49,
            image: "/images/lemonade.jpg",
            is_available: true
          },
          {
            id: 22,
            name: "Mango Smoothie",
            description: "Blended mango smoothie with yogurt",
            price: 4.99,
            image: "/images/mango-smoothie.jpg",
            is_available: true
          },
          {
            id: 23,
            name: "Orange Juice",
            description: "Freshly squeezed orange juice",
            price: 3.99,
            image: "/images/orange-juice.jpg",
            is_available: true
          },
          {
            id: 24,
            name: "Hot Chocolate",
            description: "Rich and creamy hot chocolate",
            price: 4.49,
            image: "/images/hot-chocolate.jpg",
            is_available: true
          },
          {
            id: 37,
            name: "Espresso",
            description: "Strong and bold Italian coffee",
            price: 2.99,
            image: "/images/espresso.jpg",
            is_available: true
          },
          {
            id: 38,
            name: "Strawberry Shake",
            description: "Strawberry-flavored milkshake",
            price: 4.99,
            image: "/images/strawberry-shake.jpg",
            is_available: true
          },
          {
            id: 39,
            name: "Mojito",
            description: "Refreshing mint and lime cocktail",
            price: 5.99,
            image: "/images/mojito.jpg",
            is_available: true
          },
          {
            id: 40,
            name: "Pineapple Juice",
            description: "Freshly squeezed pineapple juice",
            price: 4.49,
            image: "/images/pineapple-juice.jpg",
            is_available: true
          }
        ]
      }
    ];
  };

  const [searchParams] = useSearchParams();
  const crt = useContext(CartContext);

  // Get table number from URL or localStorage
  const tableFromURL = searchParams.get("table");
  const [tableNumber, setTableNumber] = useState(
    tableFromURL || localStorage.getItem("tableNumber") || "Unknown"
  );

  useEffect(() => {
    if (tableFromURL) {
      localStorage.setItem("tableNumber", tableFromURL); // Store in localStorage
      setTableNumber(tableFromURL);
    }
    crt.setTableNumber(tableNumber); // Update Cart Context
  }, [tableFromURL]);
  // Filter and search menu items
  const getFilteredMenuItems = () => {
    if (!menuItems || menuItems.length === 0) return [];
    
    // If menu filter is 'all', return all categories with filtered items
    if (menuFilter === 'all') {
      return menuItems.map(category => {
        // Filter items based on search term only
        const filteredItems = category.items.filter(item => {
          return searchTerm === "" || 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            item.description.toLowerCase().includes(searchTerm.toLowerCase());
        });
        
        return {
          ...category,
          items: filteredItems
        };
      });
    }
    
    // If a specific category is selected, return only that category with filtered items
    const selectedCategory = menuItems.find(cat => cat.category === menuFilter);
    if (!selectedCategory) return [];
    
    const filteredItems = selectedCategory.items.filter(item => {
      return searchTerm === "" || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    return [{
      ...selectedCategory,
      items: filteredItems
    }];
  };

  // Handle adding/removing favorites
  const handleToggleFavorite = async (item) => {
    if (!isAuthenticated) {
      // Don't show error to user - silently return
      console.log('User not authenticated, skipping favorite toggle');
      return;
    }

    const customizationString = formatCustomizationString();
    const favorite = getFavoriteByItem(item.id, customizationString);
    const favoriteId = favorite ? favorite.favoriteId : null;

    try {
      const result = await toggleFavorite(item.id, customizationString, favoriteId);
      // Don't show any notifications to user - silently handle the operation
      if (!result || typeof result !== 'object') {
        console.error('Invalid result from toggleFavorite:', result);
        return;
      }
      if (!result.success) {
        console.error('Failed to toggle favorite:', result.error);
      } else {
        console.log(`${item.name} ${favoriteId ? 'removed from' : 'added to'} favorites`);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Don't show error to user - silently handle the error
    }
  };

  // Enhanced nutritional info for menu items
  const getNutritionalInfo = (itemName) => {
    const nutritionMap = {
      // Starters
      'Garlic Bread': { calories: 250, protein: 5, carbs: 30, fat: 12 },
      'Bruschetta': { calories: 180, protein: 6, carbs: 22, fat: 8 },
      'Grilled Salmon': { calories: 350, protein: 40, carbs: 0, fat: 18 },
      'Stuffed Mushrooms': { calories: 190, protein: 8, carbs: 12, fat: 14 },
      'Mozzarella Sticks': { calories: 320, protein: 16, carbs: 20, fat: 20 },
      'Chicken Wings': { calories: 280, protein: 25, carbs: 2, fat: 18 },
      'Spring Rolls': { calories: 150, protein: 4, carbs: 18, fat: 8 },
      'Onion Rings': { calories: 240, protein: 4, carbs: 28, fat: 12 },
      'Calamari': { calories: 200, protein: 18, carbs: 12, fat: 10 },
      'Prawn Cocktail': { calories: 120, protein: 20, carbs: 5, fat: 2 },
      'Caprese Salad': { calories: 170, protein: 12, carbs: 8, fat: 12 },
      
      // Main Course
      'Chicken Alfredo': { calories: 580, protein: 35, carbs: 45, fat: 28 },
      'Ribeye Steak': { calories: 680, protein: 55, carbs: 0, fat: 48 },
      'Vegetable Stir-Fry': { calories: 220, protein: 8, carbs: 25, fat: 10 },
      'Lamb Chops': { calories: 520, protein: 45, carbs: 2, fat: 35 },
      'Spaghetti Carbonara': { calories: 650, protein: 28, carbs: 55, fat: 35 },
      'BBQ Ribs': { calories: 750, protein: 50, carbs: 15, fat: 55 },
      'Seafood Paella': { calories: 420, protein: 32, carbs: 35, fat: 18 },
      'Beef Stroganoff': { calories: 580, protein: 38, carbs: 25, fat: 35 },
      'Chicken Tikka Masala': { calories: 480, protein: 35, carbs: 20, fat: 28 },
      
      // Desserts
      'Chocolate Cake': { calories: 450, protein: 6, carbs: 65, fat: 22 },
      'Cheesecake': { calories: 520, protein: 8, carbs: 45, fat: 35 },
      'Tiramisu': { calories: 380, protein: 7, carbs: 35, fat: 24 },
      'Apple Pie': { calories: 320, protein: 4, carbs: 50, fat: 12 },
      'Ice Cream Sundae': { calories: 280, protein: 5, carbs: 35, fat: 14 },
      'Brownie with Ice Cream': { calories: 480, protein: 6, carbs: 60, fat: 24 },
      'Panna Cotta': { calories: 220, protein: 4, carbs: 25, fat: 12 },
      'Fruit Tart': { calories: 260, protein: 4, carbs: 45, fat: 8 },
      'Lemon Meringue Pie': { calories: 290, protein: 4, carbs: 48, fat: 10 },
      'Macarons': { calories: 160, protein: 3, carbs: 25, fat: 6 },
      
      // Beverages
      'Iced Tea': { calories: 80, protein: 0, carbs: 20, fat: 0 },
      'Cappuccino': { calories: 120, protein: 6, carbs: 12, fat: 6 },
      'Lemonade': { calories: 110, protein: 0, carbs: 28, fat: 0 },
      'Mango Smoothie': { calories: 180, protein: 4, carbs: 38, fat: 2 },
      'Orange Juice': { calories: 140, protein: 2, carbs: 34, fat: 0 },
      'Hot Chocolate': { calories: 200, protein: 8, carbs: 25, fat: 8 },
      'Espresso': { calories: 5, protein: 0, carbs: 1, fat: 0 },
      'Strawberry Shake': { calories: 350, protein: 8, carbs: 48, fat: 14 },
      'Mojito': { calories: 150, protein: 0, carbs: 20, fat: 0 },
      'Pineapple Juice': { calories: 130, protein: 1, carbs: 32, fat: 0 }
    };
    
    return nutritionMap[itemName] || { calories: '~300', protein: '~10g', carbs: '~30g', fat: '~15g' };
  };

  // Handle customization modal
  const openCustomizationModal = (item) => {
    setSelectedItem(item);
    setCustomizations({
      spiceLevel: "",
      extraToppings: [],
      dietaryRestrictions: [],
      specialInstructions: ""
    });
    setShowCustomizationModal(true);
  };

  const handleCustomizationChange = (type, value) => {
    setCustomizations(prev => {
      if (type === 'extraToppings' || type === 'dietaryRestrictions') {
        const currentArray = prev[type];
        const newArray = currentArray.includes(value)
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value];
        return { ...prev, [type]: newArray };
      }
      return { ...prev, [type]: value };
    });
  };

  const calculateCustomizationPrice = () => {
    let extraCost = 0;
    customizations.extraToppings.forEach(topping => {
      switch(topping) {
        case 'extra-cheese': extraCost += 1.50; break;
        case 'extra-sauce': extraCost += 0.50; break;
        case 'bacon': extraCost += 2.00; break;
        case 'mushrooms': case 'olives': extraCost += 1.00; break;
        case 'avocado': extraCost += 1.50; break;
      }
    });
    return extraCost;
  };

  const formatCustomizationString = () => {
    const parts = [];
    if (customizations.spiceLevel) {
      parts.push(`Spice: ${spiceLevels.find(s => s.value === customizations.spiceLevel)?.label}`);
    }
    if (customizations.extraToppings.length > 0) {
      const toppings = customizations.extraToppings.map(t => 
        extraToppings.find(et => et.value === t)?.label.split(' (+')[0]
      ).join(', ');
      parts.push(`Extras: ${toppings}`);
    }
    if (customizations.dietaryRestrictions.length > 0) {
      const restrictions = customizations.dietaryRestrictions.map(r => 
        dietaryRestrictions.find(dr => dr.value === r)?.label
      ).join(', ');
      parts.push(`Restrictions: ${restrictions}`);
    }
    if (customizations.specialInstructions.trim()) {
      parts.push(`Notes: ${customizations.specialInstructions.trim()}`);
    }
    return parts.join(' | ');
  };

  const addItemToCart = () => {
    const customizationString = formatCustomizationString();
    const extraCost = calculateCustomizationPrice();
    const itemWithCustomization = {
      ...selectedItem,
      price: selectedItem.price + extraCost
    };
    
    // If user is authenticated, check for allergen conflicts
    if (isAuthenticated && user?.id) {
      setPendingCartItem({ item: itemWithCustomization, customization: customizationString });
      setShowCustomizationModal(false);
      setShowAllergenWarning(true);
    } else {
      // Add directly to cart if not authenticated
      try {
        crt.addToCart(itemWithCustomization, customizationString);
        setCartAdded({ 
          itemName: itemWithCustomization.name, 
          show: true 
        });
        setShowCustomizationModal(false);
        setSelectedItem(null);
      } catch (error) {
        console.error('Error adding item to cart:', error);
        // Silently handle the error - no user notification
      }
    }
  };

  const handleAllergenConfirm = () => {
    if (pendingCartItem) {
      try {
        crt.addToCart(pendingCartItem.item, pendingCartItem.customization);
        setCartAdded({ 
          itemName: pendingCartItem.item.name, 
          show: true 
        });
        setPendingCartItem(null);
      } catch (error) {
        console.error('Error adding item to cart after allergen confirmation:', error);
        // Silently handle the error - no user notification
        return; // Don't proceed if there's an error
      }
    }
    setShowAllergenWarning(false);
    setSelectedItem(null);
  };

  const handleAllergenCancel = () => {
    setPendingCartItem(null);
    setShowAllergenWarning(false);
    // Don't clear selectedItem so user can go back to customization
  };

  return (
    <>
      <CartRecoveryNotification />
      <CartAddedNotification
        itemName={cartAdded.itemName}
        isVisible={cartAdded.show}
        onClose={() => setCartAdded({ itemName: '', show: false })}
      />
      <ToastContainer />
      <Navbar />
      <div className="menu-page responsive-container">        {/* <h1 className="heading">Our Menu</h1> */}
        {/* Search and Filter Controls */}
        <div className="menu-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-container">
            <label htmlFor="menu-filter">Filter Menu:</label>
            <select
              id="menu-filter"
              value={menuFilter}
              onChange={(e) => setMenuFilter(e.target.value)}
              className="filter-select"
            >
              {menuFilters.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Loading and Error States */}
        {loading && <p className="loading-message">Loading menu items...</p>}
        {error && <p className="error-message">{error}</p>}
        
        {/* Menu Section */}
        {!loading && !error && getFilteredMenuItems().map((category) => (
          <div key={category.category}>
            <h2 className="Category-label">{category.category}</h2>
            <div className="menu-items">
              {category.items.length > 0 ? (
                category.items.map((item) => {
                  const nutrition = getNutritionalInfo(item.name);
                  return (
                    <div key={item.id} className="menu-item">
                      <div className="menu-item-header">
                        {isAuthenticated && (
                          <button 
                            className={`favorite-btn ${isItemFavorited(item.id) ? 'favorited' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(item);
                            }}
                            title={isItemFavorited(item.id) ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Heart 
                              size={24} 
                              fill={isItemFavorited(item.id) ? '#f39c12' : 'none'}
                              stroke={isItemFavorited(item.id) ? '#f39c12' : '#2c3e50'}
                            />
                          </button>
                        )}
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="menu-img" 
                          onError={(e) => {
                            e.target.src = '/images/default-menu-item.jpg'; // Fallback image
                          }}
                        />
                      </div>
                      <h3>{item.name}</h3>
                      <p className="price">₹{item.price}</p>
                      
                      {/* Nutritional Information */}
                      <div className="nutrition-info">
                        <button 
                          className="nutrition-button"
                          onClick={() => {
                            setSelectedNutrition(nutrition);
                            setSelectedItem(item);
                            setShowNutritionModal(true);
                          }}
                        >
                          Nutritional Info
                        </button>
                      </div>
                      
                      {/* Dietary Tags */}
                      <div className="dietary-tags">
                        {/* Helper function to get dietary tags for an item */}
                        {(() => {
                          const tags = [];
                          
                          // Vegetarian items
                          const vegetarianItems = [
                            'Garlic Bread', 'Bruschetta', 'Stuffed Mushrooms', 'Mozzarella Sticks', 
                            'Spring Rolls', 'Vegetable Stir-Fry', 'Spaghetti Carbonara', 'Caprese Salad',
                            'Chocolate Cake', 'Cheesecake', 'Tiramisu', 'Apple Pie', 'Ice Cream Sundae', 
                            'Brownie with Ice Cream', 'Panna Cotta', 'Fruit Tart', 'Lemon Meringue Pie', 
                            'Macarons', 'Iced Tea', 'Cappuccino', 'Lemonade', 'Mango Smoothie', 
                            'Orange Juice', 'Hot Chocolate', 'Espresso', 'Strawberry Shake', 'Pineapple Juice'
                          ];
                          
                          // Vegan items
                          const veganItems = [
                            'Spring Rolls', 'Vegetable Stir-Fry', 'Fruit Tart', 'Iced Tea', 
                            'Lemonade', 'Orange Juice', 'Espresso', 'Pineapple Juice'
                          ];
                          
                          // Gluten-free items
                          const glutenFreeItems = [
                            'Grilled Salmon', 'Ribeye Steak', 'Lamb Chops', 'BBQ Ribs', 'Seafood Paella',
                            'Chicken Tikka Masala', 'Vegetable Stir-Fry', 'Caprese Salad', 'Ice Cream Sundae',
                            'Iced Tea', 'Cappuccino', 'Lemonade', 'Mango Smoothie', 'Orange Juice', 
                            'Hot Chocolate', 'Espresso', 'Strawberry Shake', 'Pineapple Juice'
                          ];
                          
                          if (vegetarianItems.includes(item.name)) {
                            tags.push(<span key="veg" className="tag vegetarian">Vegetarian</span>);
                          }
                          
                          if (veganItems.includes(item.name)) {
                            tags.push(<span key="vegan" className="tag vegan">Vegan</span>);
                          }
                          
                          if (glutenFreeItems.includes(item.name)) {
                            tags.push(<span key="gf" className="tag gluten-free">Gluten-Free</span>);
                          }
                          
                          return tags;
                        })()}
                      </div>
                      
                      <button onClick={() => openCustomizationModal(item)}>Customize & Add</button>
                    </div>
                  );
                })
              ) : (
                <p className="no-results">No items match your filter criteria in this category.</p>
              )}
            </div>
          </div>
        ))}
        
        {/* No Results Message */}
        {!loading && !error && getFilteredMenuItems().length > 0 && 
         getFilteredMenuItems().every(category => category.items.length === 0) && (
          <p className="no-results">No menu items match your search or filter criteria.</p>
        )}

        {/* Customization Modal */}
        {showCustomizationModal && selectedItem && (
          <div className="customization-overlay">
            <div className="customization-modal">
              <div className="modal-header">
                <h2>Customize Your Order</h2>
                <button 
                  className="close-btn" 
                  onClick={() => setShowCustomizationModal(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-content">
                <div className="item-info">
                  <img 
                    src={selectedItem.image} 
                    alt={selectedItem.name} 
                    className="modal-item-img" 
                    onError={(e) => {
                      e.target.src = '/images/default-menu-item.jpg'; // Fallback image
                    }}
                  />
                  <div className="item-details">
                    <h3>{selectedItem.name}</h3>
                    <p>{selectedItem.description}</p>
                    <p className="base-price">Base Price: ₹{selectedItem.price.toFixed(2)}</p>
                  </div>
                </div>

                <div className="customization-options">
                  {/* Spice Level */}
                  <div className="option-group">
                    <label>Spice Level:</label>
                    <select 
                      value={customizations.spiceLevel} 
                      onChange={(e) => handleCustomizationChange('spiceLevel', e.target.value)}
                    >
                      {spiceLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Extra Toppings */}
                  <div className="option-group">
                    <label>Extra Toppings:</label>
                    <div className="checkbox-group">
                      {extraToppings.map(topping => (
                        <label key={topping.value} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={customizations.extraToppings.includes(topping.value)}
                            onChange={() => handleCustomizationChange('extraToppings', topping.value)}
                          />
                          {topping.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Dietary Restrictions */}
                  <div className="option-group">
                    <label>Dietary Restrictions:</label>
                    <div className="checkbox-group">
                      {dietaryRestrictions.map(restriction => (
                        <label key={restriction.value} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={customizations.dietaryRestrictions.includes(restriction.value)}
                            onChange={() => handleCustomizationChange('dietaryRestrictions', restriction.value)}
                          />
                          {restriction.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div className="option-group">
                    <label>Special Instructions:</label>
                    <textarea
                      placeholder="Any special requests or cooking instructions..."
                      value={customizations.specialInstructions}
                      onChange={(e) => handleCustomizationChange('specialInstructions', e.target.value)}
                      rows="3"
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <div className="price-summary">
                    <p>Base Price: ₹{selectedItem.price.toFixed(2)}</p>
                    {calculateCustomizationPrice() > 0 && (
                      <p>Extra Charges: +₹{calculateCustomizationPrice().toFixed(2)}</p>
                    )}
                    <p className="total-price">
                      Total: ₹{(selectedItem.price + calculateCustomizationPrice()).toFixed(2)}
                    </p>
                  </div>
                  <div className="modal-actions">
                    <button 
                      className="cancel-btn" 
                      onClick={() => setShowCustomizationModal(false)}
                    >
                      Cancel
                    </button>
                    <button className="add-to-cart-btn" onClick={addItemToCart}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Allergen Warning Modal */}
        <AllergenWarning
          items={pendingCartItem ? [pendingCartItem.item] : []}
          onConfirm={handleAllergenConfirm}
          onCancel={handleAllergenCancel}
          isVisible={showAllergenWarning}
        />
        
        {/* Nutrition Modal */}
        {showNutritionModal && selectedNutrition && (
          <div className="customization-overlay" onClick={() => setShowNutritionModal(false)}>
            <div className="customization-modal nutrition-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Nutritional Information</h2>
                <button 
                  className="close-btn" 
                  onClick={() => setShowNutritionModal(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-content">
                <div className="item-details">
                  <h3>{selectedItem?.name}</h3>
                  <p>{selectedItem?.description}</p>
                </div>
                <div className="nutrition-details-popup">
                  <div className="nutrition-row">
                    <span className="nutrition-label">Calories:</span>
                    <span className="nutrition-value">{selectedNutrition.calories}</span>
                  </div>
                  <div className="nutrition-row">
                    <span className="nutrition-label">Protein:</span>
                    <span className="nutrition-value">{selectedNutrition.protein}g</span>
                  </div>
                  <div className="nutrition-row">
                    <span className="nutrition-label">Carbs:</span>
                    <span className="nutrition-value">{selectedNutrition.carbs}g</span>
                  </div>
                  <div className="nutrition-row">
                    <span className="nutrition-label">Fat:</span>
                    <span className="nutrition-value">{selectedNutrition.fat}g</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer/>
    </>
  );
};

export default Menu;