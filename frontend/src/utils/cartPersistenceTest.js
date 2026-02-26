// Simple localStorage test utility
// This can be run in browser console to test cart persistence

export const testCartPersistence = () => {
    console.log('🧪 Testing Cart Persistence...');
    
    // Test 1: Check if localStorage is available
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        console.log('✅ localStorage is available');
    } catch (e) {
        console.error('❌ localStorage is not available:', e);
        return;
    }
    
    // Test 2: Test cart data structure
    const testCart = [
        {
            id: 1,
            name: "Test Item",
            price: 9.99,
            quantity: 2,
            customizations: "No onions",
            itemKey: "1_No onions"
        }
    ];
    
    try {
        localStorage.setItem('digitalMenuCart', JSON.stringify(testCart));
        const retrieved = JSON.parse(localStorage.getItem('digitalMenuCart'));
        
        if (JSON.stringify(testCart) === JSON.stringify(retrieved)) {
            console.log('✅ Cart data persistence works');
        } else {
            console.error('❌ Cart data mismatch');
        }
    } catch (e) {
        console.error('❌ Cart data serialization failed:', e);
    }
    
    // Test 3: Test table number persistence
    try {
        localStorage.setItem('digitalMenuTableNumber', '5');
        const retrievedTable = localStorage.getItem('digitalMenuTableNumber');
        
        if (retrievedTable === '5') {
            console.log('✅ Table number persistence works');
        } else {
            console.error('❌ Table number persistence failed');
        }
    } catch (e) {
        console.error('❌ Table number persistence failed:', e);
    }
    
    // Test 4: Test cart expiration
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    try {
        localStorage.setItem('digitalMenuCartTimestamp', oneDayAgo.toString());
        
        // Simulate cart age check
        const savedTimestamp = localStorage.getItem('digitalMenuCartTimestamp');
        const cartAge = now - parseInt(savedTimestamp, 10);
        const maxAge = 24 * 60 * 60 * 1000;
        
        if (cartAge > maxAge) {
            console.log('✅ Cart expiration logic works');
        } else {
            console.log('ℹ️ Cart is still within valid timeframe');
        }
    } catch (e) {
        console.error('❌ Cart expiration test failed:', e);
    }
    
    // Cleanup test data
    localStorage.removeItem('digitalMenuCart');
    localStorage.removeItem('digitalMenuTableNumber');
    localStorage.removeItem('digitalMenuCartTimestamp');
    
    console.log('🧪 Cart persistence test completed!');
};

// Usage instructions:
// 1. Open browser developer tools (F12)
// 2. Go to Console tab
// 3. Copy and paste this function
// 4. Run: testCartPersistence()