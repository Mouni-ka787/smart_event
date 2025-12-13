# Vendor Account Setup Guide

This document explains how to properly set up vendor accounts in the EWE system.

## Issue Description

When vendors register for an account, they may encounter errors when accessing their dashboard because their account hasn't been properly initialized with at least one service.

## Solution Implemented

We've implemented a two-part solution:

1. **Automatic Initialization**: When a vendor first accesses their dashboard, the system automatically creates a sample service for them if they don't have any services yet.

2. **Bulk Initialization Script**: A script is available to initialize all existing vendor accounts that don't have services.

## How It Works

### Automatic Initialization

When a vendor logs into their dashboard for the first time:
1. The frontend calls the `/api/vendors/init` endpoint
2. The backend checks if the vendor has any services
3. If no services exist, a sample service is created automatically
4. The vendor can then access their dashboard without errors

### Manual Initialization

For existing vendors who may still have issues:

1. Run the initialization script:
   ```bash
   cd smarteventx-backend
   npm run init:vendors
   ```

2. This will scan all vendor accounts and create a sample service for any vendor that doesn't have services yet.

## Troubleshooting

If a vendor still encounters issues:

1. Ensure they are logged in with a vendor account (check their role in the database)
2. Verify they have at least one service associated with their account
3. Have them log out and log back in to refresh their session
4. If problems persist, contact support

## Sample Service Details

The automatically created sample service has the following details:
- Name: "Sample Service"
- Description: "This is a sample service to get you started. Please update with your actual service details."
- Category: "Other"
- Price: $100
- Price Type: "per_event"
- Status: Active

Vendors should update this service with their actual service information.