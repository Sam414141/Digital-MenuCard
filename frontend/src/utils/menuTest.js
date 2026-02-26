// Test utility for menu functionality

// Sample menu data that matches the backend response
export const sampleMenuData = [
  {
    id: 1,
    category_id: 1,
    name: "Garlic Bread",
    description: "Freshly baked bread with garlic butter",
    price: "5.99",
    image: "/images/garlic-bread.jpg",
    is_available: true,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  },
  {
    id: 2,
    category_id: 1,
    name: "Spring Rolls",
    description: "Crispy vegetable spring rolls",
    price: "7.99",
    image: "/images/spring-rolls.jpg",
    is_available: true,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  },
  {
    id: 3,
    category_id: 2,
    name: "Grilled Salmon",
    description: "Fresh salmon with herbs and lemon",
    price: "18.99",
    image: "/images/salmon.jpg",
    is_available: true,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  }
];

// Test the processMenuItemsResponse function
export const testProcessMenuItemsResponse = (processMenuItemsResponse) => {
  console.log("Testing processMenuItemsResponse function...");
  
  try {
    const result = processMenuItemsResponse(sampleMenuData);
    console.log("Processed menu data:", result);
    
    // Check if the result has the expected structure
    if (Array.isArray(result) && result.length > 0) {
      console.log("✓ Function returned an array");
      
      const firstCategory = result[0];
      if (firstCategory.category && Array.isArray(firstCategory.items)) {
        console.log("✓ Categories have correct structure");
        console.log("Test passed!");
        return true;
      } else {
        console.error("✗ Categories do not have correct structure");
        return false;
      }
    } else {
      console.error("✗ Function did not return an array or returned empty array");
      return false;
    }
  } catch (error) {
    console.error("✗ Function threw an error:", error);
    return false;
  }
};

// Test the getFilteredMenuItems function
export const testGetFilteredMenuItems = (getFilteredMenuItems, menuItems) => {
  console.log("Testing getFilteredMenuItems function...");
  
  try {
    // Set some test data
    const originalMenuItems = menuItems;
    
    // Test with no filters
    const result = getFilteredMenuItems();
    console.log("Filtered menu data:", result);
    
    // Check if the result has the expected structure
    if (Array.isArray(result) && result.length > 0) {
      console.log("✓ Function returned an array");
      
      const firstCategory = result[0];
      if (firstCategory.category && Array.isArray(firstCategory.items)) {
        console.log("✓ Categories have correct structure");
        console.log("Test passed!");
        return true;
      } else {
        console.error("✗ Categories do not have correct structure");
        return false;
      }
    } else {
      console.error("✗ Function did not return an array or returned empty array");
      return false;
    }
  } catch (error) {
    console.error("✗ Function threw an error:", error);
    return false;
  }
};