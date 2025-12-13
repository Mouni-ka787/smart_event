# 🗺️ Google Maps API Setup Guide

## 🚨 Current Issue
**Error**: `InvalidKeyMapError` - The Google Maps API key is not configured correctly.

## ✅ Solution: Set Up Google Maps API Key

### **Step 1: Create Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on project dropdown → "New Project"
3. Enter project name: `SmartEventX` (or your preferred name)
4. Click "Create"

### **Step 2: Enable Required APIs**

1. Go to **"APIs & Services"** → **"Library"**
2. Search and enable these APIs:

   ✅ **Maps JavaScript API** (Required)
   - Used for: Displaying maps in your app
   
   ✅ **Geocoding API** (Recommended)
   - Used for: Converting addresses to coordinates
   
   ✅ **Directions API** (Optional)
   - Used for: Route calculation and accurate ETA
   
   ✅ **Distance Matrix API** (Optional)
   - Used for: Calculating travel time and distance

### **Step 3: Create API Key**

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → **"API Key"**
3. Your API key will be displayed - **COPY IT!**
4. Click **"Edit API Key"** to configure restrictions

### **Step 4: Restrict API Key (Important for Security & Billing)**

#### **Application Restrictions:**
1. Select **"HTTP referrers (web sites)"**
2. Add these referrers:
   ```
   http://localhost:3000/*
   http://localhost:3001/*
   http://127.0.0.1:3000/*
   https://yourdomain.com/*  (add when you deploy)
   ```

#### **API Restrictions:**
1. Select **"Restrict key"**
2. Check only the APIs you enabled:
   - ✅ Maps JavaScript API
   - ✅ Geocoding API
   - ✅ Directions API (if enabled)
   - ✅ Distance Matrix API (if enabled)

3. Click **"Save"**

### **Step 5: Update Your Environment File**

1. Open: `smarteventx-v2/.env.local`
2. Replace the API key line:

```env
# Before:
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_GOOGLE_MAPS_API_KEY_HERE

# After (paste your actual key):
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyD...your_actual_key_here
```

3. **Save the file**

### **Step 6: Restart Your Development Server**

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd smarteventx-v2
npm run dev
```

### **Step 7: Verify It Works**

1. Open your browser: http://localhost:3000
2. Navigate to any page with a map
3. The map should load without errors
4. Check browser console - no `InvalidKeyMapError`

---

## 💰 Google Maps Pricing (Important!)

### **Free Tier:**
- $200 credit per month
- Up to **28,500 map loads/month** (free)
- Up to **40,000 Geocoding requests/month** (free)

### **What Counts as Usage:**
- Each time a user loads a page with a map = 1 map load
- Each location update = 1 Geocoding request (if using addresses)

### **Cost Control Tips:**
1. ✅ **Set Budget Alerts** in Google Cloud Console
2. ✅ **Restrict API key** to prevent unauthorized use
3. ✅ **Use caching** to reduce API calls
4. ✅ **Limit map loads** per user session

---

## 🛡️ Security Best Practices

### **DO:**
✅ Use `NEXT_PUBLIC_` prefix for client-side keys  
✅ Restrict API key to your domains only  
✅ Limit API key to specific APIs  
✅ Monitor usage in Google Cloud Console  
✅ Set up billing alerts  

### **DON'T:**
❌ Commit API keys to GitHub/Git  
❌ Share API keys publicly  
❌ Use unrestricted API keys  
❌ Expose server-side keys in client code  

---

## 🧪 Testing Your Setup

### **Test 1: Check Environment Variable**
```bash
# In your terminal (smarteventx-v2 directory)
echo $NEXT_PUBLIC_GOOGLE_MAPS_API_KEY  # Mac/Linux
echo %NEXT_PUBLIC_GOOGLE_MAPS_API_KEY%  # Windows CMD
$env:NEXT_PUBLIC_GOOGLE_MAPS_API_KEY  # Windows PowerShell
```

### **Test 2: Check in Browser Console**
```javascript
// Open browser console (F12)
console.log(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
// Should show your API key (not "undefined" or "YOUR_API_KEY")
```

### **Test 3: Load a Map Page**
Navigate to any page with `MapComponent` and verify:
- Map displays correctly
- No console errors
- Markers appear
- Info windows work

---

## 🐛 Troubleshooting

### **Issue: Map still shows error after adding API key**
**Solution:**
1. Restart Next.js dev server (Ctrl+C, then `npm run dev`)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Hard refresh page (Ctrl+Shift+R)

### **Issue: "RefererNotAllowedMapError"**
**Solution:**
- Add your current URL to API key restrictions
- Check that you're using the correct domain/port

### **Issue: "ApiTargetBlockedMapError"**
**Solution:**
- Ensure all required APIs are enabled in Google Cloud Console
- Wait 1-2 minutes after enabling APIs

### **Issue: Billing not enabled**
**Solution:**
- Go to Google Cloud Console → Billing
- Link a payment method (won't be charged if under free tier)

---

## 📊 Monitor Usage

### **Check API Usage:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **"APIs & Services"** → **"Dashboard"**
3. Click on each API to see usage graphs
4. Set up alerts if usage exceeds 80% of free tier

---

## 🔗 Useful Links

- [Google Maps Platform](https://developers.google.com/maps)
- [Pricing Calculator](https://mapsplatform.google.com/pricing/)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
- [Error Messages Reference](https://developers.google.com/maps/documentation/javascript/error-messages)

---

## ✅ Checklist

- [ ] Created Google Cloud project
- [ ] Enabled Maps JavaScript API
- [ ] Enabled Geocoding API (optional)
- [ ] Created API key
- [ ] Restricted API key (HTTP referrers)
- [ ] Restricted API key (API restrictions)
- [ ] Updated `.env.local` file
- [ ] Restarted dev server
- [ ] Verified map loads without errors
- [ ] Set up billing alerts (recommended)

---

**Need Help?** Check the error messages in your browser console for specific issues.
