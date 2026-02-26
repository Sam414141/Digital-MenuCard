# Dynamic IP Address Management Guide

## Overview
This guide explains how the dynamic IP address management system works in the Digital Menu Card application. The system automatically detects and updates the network IP address to ensure all API calls use the correct server address, even when the network changes.

## How It Works

### 1. IP Context Provider
The `IpContextProvider` in `src/context/IpContext.jsx` manages the current IP address:

- **Initial IP Detection**: On app startup, it tries to detect the current IP in this priority order:
  1. localStorage (previously saved IP)
  2. Environment variables (`VITE_API_URL` or `VITE_SERVER_IP`)
  3. Auto-detection using WebRTC
  4. Fallback to default IP (`10.195.82.46`)

- **Auto-detection**: Uses WebRTC to discover the local network IP address
- **Persistence**: Saves the detected IP to localStorage for future sessions

### 2. IP Auto-detection
The `ipDetector.js` utility provides functions for IP detection:

- `getLocalIP()`: Uses WebRTC to discover the local network IP
- `autoDetectAndSetIP()`: Automatically detects and sets the IP in the context
- `refreshIP()`: Manual function to refresh the IP address

### 3. API URL Building
All API calls use dynamic URL building:

- `useApiUrl` hook provides the `buildUrl()` function
- `apiService.js` automatically updates the base URL on each request
- `api.js` configuration uses the dynamic base URL

## Implementation Details

### Using Dynamic IP in Components
```jsx
import useApiUrl from '../hooks/useApiUrl';
import axios from "axios";

const MyComponent = () => {
  const { buildUrl } = useApiUrl();
  
  const fetchData = () => {
    // Automatically uses the current IP
    axios.get(buildUrl('/api/my-endpoint'))
      .then(response => console.log(response.data));
  };
  
  return <div>My Component</div>;
};
```

### Manual IP Refresh
```jsx
import { useIpContext } from '../context/IpContext';

const RefreshButton = () => {
  const { refreshIP } = useIpContext();
  
  const handleRefresh = async () => {
    const newIP = await refreshIP();
    console.log('New IP:', newIP);
  };
  
  return <button onClick={handleRefresh}>Refresh IP</button>;
};
```

### Automatic IP Monitoring
```jsx
import useIPMonitor from '../hooks/useIPMonitor';

const MyComponent = () => {
  // Automatically monitor IP changes every 30 seconds
  useIPMonitor(30000);
  
  return <div>My Component</div>;
};
```

## Benefits

1. **Automatic Network Adaptation**: No manual IP configuration needed when network changes
2. **Persistent Settings**: Remembers the last used IP address
3. **Fallback Mechanism**: Uses default IP if auto-detection fails
4. **Real-time Updates**: Components automatically use the current IP
5. **Manual Override**: Users can manually refresh IP if needed

## Troubleshooting

### IP Not Updating
1. Check if the browser supports WebRTC
2. Verify network connectivity
3. Manually refresh IP using the refresh function
4. Check browser console for errors

### API Calls Failing
1. Verify the backend server is running on the detected IP
2. Check if the port (3000) is accessible
3. Ensure firewall settings allow connections
4. Try manually setting the IP in localStorage:

```javascript
localStorage.setItem("serverIp", "YOUR_CORRECT_IP");
```

## Testing IP Changes

To test the dynamic IP functionality:

1. Start the application on one network
2. Note the detected IP address
3. Change to a different network (WiFi to mobile hotspot, etc.)
4. Refresh the application or wait for automatic detection
5. Verify API calls use the new IP address

## Customization

### Changing Default IP
Update the fallback IP in:
- `src/context/IpContext.jsx`
- `src/utils/ipDetector.js`
- `src/config/api.js`

### Adjusting Detection Interval
Modify the interval in `useIPMonitor` hook:
```jsx
useIPMonitor(60000); // Check every minute instead of 30 seconds
```

## Security Considerations

- IP addresses are stored in localStorage (not secure for sensitive data)
- WebRTC-based detection works in all modern browsers
- No external services are called for IP detection (privacy-friendly)