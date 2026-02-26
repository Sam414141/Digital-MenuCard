// Simple test to verify API integration
const testAPIConnection = async () => {
  try {
    console.log('Testing API connection...');
    
    // Test direct API call using the environment variable
    const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001`;
    console.log('Using API URL:', apiUrl);
    
    const response = await fetch(`${apiUrl}/api/menu`);
    const data = await response.json();
    
    console.log('API Response:', data);
    
    if (data.status === 'success') {
      console.log('✅ API connection test PASSED');
      console.log('Number of menu items:', data.data.length);
      return true;
    } else {
      console.log('❌ API connection test FAILED');
      console.log('Error:', data.error || data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ API connection test FAILED with exception');
    console.log('Error:', error.message);
    return false;
  }
};

// Run the test
testAPIConnection();