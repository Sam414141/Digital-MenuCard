/**
 * Migration Guide for API URL Updates
 * 
 * This file contains guidance for updating components from localhost to dynamic IP usage.
 * 
 * BEFORE (using localhost):
 * const response = await axios.get('http://localhost:3001/api/endpoint');
 * 
 * AFTER (using dynamic IP):
 * 1. Import the hook:
 *    import useApiUrl from '../hooks/useApiUrl';
 * 
 * 2. Use the hook in your component:
 *    const { buildUrl } = useApiUrl();
 * 
 * 3. Replace axios calls:
 *    const response = await axios.get(buildUrl('/api/endpoint'));
 * 
 * FILES UPDATED:
 * ✅ UserProfile.jsx - Updated to use dynamic IP
 * ✅ AllergenWarning.jsx - Updated to use dynamic IP
 * ✅ ApiService.js - Updated to use dynamic IP from localStorage
 * ✅ api.js - Updated to use IP context as fallback
 * ✅ IpContext.jsx - Updated to default to 10.91.183.176
 * 
 * REMAINING FILES TO UPDATE:
 * - InventoryManagement.jsx (8 axios calls)
 * - PromotionManagement.jsx (5 axios calls) 
 * - AllergenManagement.jsx (5 axios calls)
 * - InventoryAnalytics.jsx (1 axios call)
 * - InventoryDashboard.jsx (2 axios calls)
 * - PromotionValidator.jsx (2 axios calls)
 * 
 * PRIORITY ORDER FOR UPDATES:
 * 1. Core user-facing components (Menu, Cart, Auth) - ✅ Already use ApiService
 * 2. Admin components that are frequently used
 * 3. Utility components
 */