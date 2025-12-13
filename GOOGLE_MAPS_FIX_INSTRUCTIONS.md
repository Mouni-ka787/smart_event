# Google Maps API RefererNotAllowedMapError Fix

## Problem
You're encountering the `RefererNotAllowedMapError` which means your Google Maps API key is not configured to allow requests from `http://localhost:3001`.

## Permanent Solution

### Step 1: Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Select the project that contains your API key

### Step 2: Configure API Key Restrictions
1. In the left sidebar, click "APIs & Services" → "Credentials"
2. Find your API key in the list (it should be named something like "Browser Key" or similar)
3. Click the pencil icon (edit) next to your API key

### Step 3: Add Authorized Referrers
1. Under "Application restrictions", select "HTTP referrers (websites)"
2. In the "Website restrictions" section, add the following URL:
   ```
   http://localhost:3001/*
   ```
3. Click "Done" to save your changes

### Step 4: Wait for Changes to Propagate
It may take up to 5 minutes for the changes to take effect across Google's servers.

## Verification

After completing the above steps:
1. Restart your development server
2. Refresh your application
3. The Google Maps error should no longer appear

## Alternative Solution (If You Don't Have Access to Google Cloud Console)

If you don't have access to the Google Cloud Console or the project:
1. Create your own Google Cloud project:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Click "Select a project" → "New Project"
   - Enter a project name and click "Create"
2. Enable the required APIs:
   - Click "APIs & Services" → "Library"
   - Search for and enable:
     - Maps JavaScript API
     - Geocoding API
3. Create a new API key:
   - Click "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the generated API key
4. Add the API key to your project:
   - Open `.env.local` in your project
   - Replace the existing `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` value with your new API key
5. Configure the API key restrictions as described in Steps 2-3 above

## Temporary Workaround

The application includes fallback mechanisms that will:
- Display a friendly error message instead of a broken map
- Continue to function normally even without Google Maps
- Not block other features of the application

However, for the full Google Maps experience, you must configure the API key properly as described above.

## Need Help?

If you're still having issues after following these steps:
1. Check that you're using the correct API key
2. Verify that you've added the exact referrer URL: `http://localhost:3001/*`
3. Ensure all required APIs are enabled in the Google Cloud Console
4. Check the browser console for any additional error messages