# MetaMask Issue Fix Instructions

## Problem
MetaMask popup appearing in a non-Web3 calendar application.

## Solutions

### 1. Clear Browser Cache
1. Open Chrome DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or go to Chrome Settings > Privacy and Security > Clear browsing data

### 2. Disable MetaMask Extension Temporarily
1. Go to Chrome Extensions (chrome://extensions/)
2. Find MetaMask extension
3. Toggle it off temporarily
4. Refresh your application
5. Re-enable MetaMask if needed

### 3. Check for Port Conflicts
1. Make sure no other Web3 applications are running on the same port
2. Try running the application on a different port:
   ```bash
   # In package.json, modify the dev script to use a different port
   "dev": "cross-env NODE_ENV=development PORT=3001 tsx server/index.ts"
   ```

### 4. Reset Browser Site Data
1. Go to Chrome Settings
2. Privacy and Security > Site Settings
3. Find your localhost site
4. Click "Delete data"

### 5. Use Incognito Mode
Test the application in an incognito window to see if the issue persists.

## Prevention
- Keep MetaMask extension updated
- Clear browser cache regularly when switching between different types of applications
- Use different browser profiles for Web3 and regular applications