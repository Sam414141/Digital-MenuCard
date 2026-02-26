// Simple test to verify menu loading
const testMenuLoading = async () => {
  try {
    console.log('Testing menu loading...');
    
    // Import apiService dynamically for this test
    const apiService = await import('../services/apiService');
    
    // Test using apiService
    const data = await apiService.default.getMenu();
    
    console.log('Menu API Response:', data);
    
    if (data.status === 'success') {
      console.log('✅ Menu loading test PASSED');
      console.log('Number of menu items:', data.data.length);
    } else {
      console.log('❌ Menu loading test FAILED');
      console.log('Error:', data.message);
    }
  } catch (error) {
    console.error('❌ Menu loading test FAILED with exception:', error);
  }
};

export default testMenuLoading;