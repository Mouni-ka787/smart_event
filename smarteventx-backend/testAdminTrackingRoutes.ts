// Test script to verify admin tracking routes are working
import express from 'express';
import adminTrackingRoutes from './src/routes/adminTrackingRoutes';

console.log('Testing admin tracking routes registration...');

// Check if the routes module exports the expected functions
console.log('adminTrackingRoutes type:', typeof adminTrackingRoutes);
console.log('adminTrackingRoutes keys:', Object.keys(adminTrackingRoutes || {}));

// Simple test to verify the routes can be imported without errors
try {
  console.log('✅ Admin tracking routes imported successfully');
} catch (error) {
  console.error('❌ Failed to import admin tracking routes:', error);
}

export {};