# MongoDB Atlas Setup Guide

This guide will help you set up MongoDB Atlas for your EWE application, which is more reliable than using a local MongoDB instance.

## Step 1: Create a MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" and sign up for a free account
3. Verify your email address

## Step 2: Create a New Cluster

1. After logging in, click "Build a Cluster"
2. Select the **Free tier (M0)** option
3. Choose a cloud provider and region closest to you
4. Leave other settings as default
5. Click "Create Cluster" (this may take a few minutes)

## Step 3: Configure Database Access

1. In the left sidebar, click "Database Access" under the Security section
2. Click "Add New Database User"
3. Create a new user:
   - Username: `smarteventx_user`
   - Password: Create a strong password and save it somewhere secure
   - Set user privileges to "Read and write to any database"
4. Click "Add User"

## Step 4: Configure Network Access

1. In the left sidebar, click "Network Access" under the Security section
2. Click "Add IP Address"
3. For development, you can select "Allow Access from Anywhere" (0.0.0.0/0)
4. For production, add your specific IP address
5. Click "Confirm"

## Step 5: Get Your Connection String

1. Click "Clusters" in the left sidebar
2. Click "Connect" on your cluster
3. Select "Connect your application"
4. Copy the connection string

## Step 6: Update Your Environment Variables

1. Open the `.env` file in your backend directory:
   ```
   smarteventx-backend/.env
   ```

2. Replace the MONGODB_URI value with your Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://smarteventx_user:<password>@<cluster-url>/smarteventx?retryWrites=true&w=majority
   ```

3. Replace `<password>` with the password you created in Step 3
4. Replace `<cluster-url>` with your actual cluster URL from MongoDB Atlas

## Example Connection String

```
MONGODB_URI=mongodb+srv://smarteventx_user:mypassword123@cluster0.abc123.mongodb.net/smarteventx?retryWrites=true&w=majority
```

## Step 7: Restart Your Application

1. Stop your backend server if it's running
2. Start your backend server again:
   ```
   npm run dev
   ```

## Benefits of Using MongoDB Atlas

1. **Reliability**: No need to worry about local database issues
2. **Accessibility**: Access your database from anywhere
3. **Scalability**: Easily scale your database as your application grows
4. **Security**: Enterprise-grade security features
5. **Backup**: Automatic backups and recovery options

## Troubleshooting

If you encounter connection issues:

1. Double-check your connection string
2. Ensure your IP address is whitelisted in Network Access
3. Verify your database user credentials
4. Check that your firewall isn't blocking the connection

For more help, refer to the [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)