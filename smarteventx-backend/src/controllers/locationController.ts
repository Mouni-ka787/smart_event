import { Request, Response } from 'express';
import Booking from '../models/Booking';
import User from '../models/User';
import { calculateETASync, calculateDistanceSync } from '../utils/locationUtils';
import Service from '../models/Service';
import mongoose from 'mongoose';
import { IUser } from '../models/User';

// Define interfaces for our location tracking data
interface LocationUpdate {
  assignmentId: string;
  bookingId: string;
  vendorId: string;
  lat: number;
  lng: number;
  speed?: number;
  bearing?: number;
  ts: string; // ISO8601 timestamp
}

interface AssignmentStatus {
  assignmentId: string;
  status: 'PENDING' | 'ACCEPTED' | 'EN_ROUTE' | 'ARRIVED' | 'COMPLETED';
}

// @desc    Update vendor location
// @route   POST /api/vendors/:vendorId/location
// @access  Private/Vendor
export const updateVendorLocation = async (req: Request, res: Response) => {
  try {
    // Validate that the user is a vendor
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Access denied. Vendor access required.' });
    }
    
    const { vendorId } = req.params;
    const locationData: LocationUpdate = req.body;
    
    // Verify that the vendor is updating their own location
    if (req.user._id.toString() !== vendorId) {
      return res.status(403).json({ message: 'Access denied. You can only update your own location.' });
    }
    
    // Validate required fields
    if (!locationData.bookingId || !locationData.lat || !locationData.lng) {
      return res.status(400).json({ message: 'Missing required fields: bookingId, lat, lng' });
    }
    
    // Find the booking and populate service details
    const booking = await Booking.findById(locationData.bookingId).populate('service');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Verify that this booking belongs to the vendor
    if (!booking.vendor || (booking.vendor as any).toString() !== vendorId) {
      return res.status(403).json({ message: 'Access denied. This booking does not belong to you.' });
    }
    
    // Update the booking with the new location
    if (!booking.vendorTrackingInfo) {
      booking.vendorTrackingInfo = {
        updates: []
      };
    }
    
    // Update current location
    booking.vendorTrackingInfo.currentLocation = {
      type: 'Point',
      coordinates: [locationData.lng, locationData.lat]
    };
    
    // Add update to history
    booking.vendorTrackingInfo.updates.push({
      status: 'location_update',
      timestamp: new Date(locationData.ts),
      description: `Location updated to ${locationData.lat}, ${locationData.lng}`
    });
    
    // Calculate ETA if we have venue coordinates
    // For now, we'll use a default venue location since we don't have event data in bookings
    // In a real implementation, this would come from the event data
    if (booking.vendorTrackingInfo.currentLocation) {
      const vendorCoords = {
        lat: locationData.lat,
        lng: locationData.lng
      };
      
      // Default venue location (this should come from the event data in a real implementation)
      const venueCoords = {
        lat: 40.7128, // Default to New York City coordinates
        lng: -74.0060
      };
      
      // Calculate distance in meters
      const distance = calculateDistanceSync(vendorCoords, venueCoords);
      
      // Calculate ETA (simplified - in a real app, you would use Google Directions API)
      const etaSeconds = calculateETASync(vendorCoords, venueCoords, locationData.speed); // Default speed 10 m/s
      
      // Update ETA
      booking.vendorTrackingInfo.estimatedArrival = new Date(Date.now() + etaSeconds * 1000);
    }
    
    await booking.save();
    
    // Emit socket event (in a real app, you would use a WebSocket server)
    // For now, we'll just return the updated data
    res.json({
      message: 'Location updated successfully',
      data: {
        assignmentId: locationData.assignmentId,
        bookingId: locationData.bookingId,
        vendorId: locationData.vendorId,
        lat: locationData.lat,
        lng: locationData.lng,
        speed: locationData.speed,
        bearing: locationData.bearing,
        ts: locationData.ts,
        etaSeconds: booking.vendorTrackingInfo.estimatedArrival 
          ? Math.floor((booking.vendorTrackingInfo.estimatedArrival.getTime() - Date.now()) / 1000)
          : null
      }
    });
  } catch (error: any) {
    console.error('Error in updateVendorLocation:', error);
    res.status(500).json({ message: 'Failed to update vendor location: ' + error.message });
  }
};

// @desc    Update assignment status
// @route   PUT /api/bookings/:bookingId/status
// @access  Private/Vendor
export const updateAssignmentStatus = async (req: Request, res: Response) => {
  try {
    // Validate that the user is a vendor
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Access denied. Vendor access required.' });
    }
    
    const { bookingId } = req.params;
    const { status }: { status: string } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Verify that this booking belongs to the vendor
    const bookingVendorId = booking.vendor?.toString();
    if (!bookingVendorId || bookingVendorId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. This booking does not belong to you.' });
    }
    
    // Update status
    booking.status = status as any;
    
    // Add update to tracking history
    if (!booking.vendorTrackingInfo) {
      booking.vendorTrackingInfo = {
        updates: []
      };
    }
    
    booking.vendorTrackingInfo.updates.push({
      status: status,
      timestamp: new Date(),
      description: `Status updated to ${status}`
    });
    
    await booking.save();
    
    res.json({
      message: 'Assignment status updated successfully',
      data: {
        assignmentId: booking._id,
        status: booking.status
      }
    });
  } catch (error: any) {
    console.error('Error in updateAssignmentStatus:', error);
    res.status(500).json({ message: 'Failed to update assignment status: ' + error.message });
  }
};

// @desc    Get booking tracking info
// @route   GET /api/bookings/:bookingId/tracking
// @access  Private (User, Vendor, Admin)
export const getBookingTracking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    
    // Find the booking
    const booking = await Booking.findById(bookingId)
      .populate('user', 'name email')
      .populate('service', 'name')
      .populate('vendor', 'name email');
      
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check permissions - user can only see their own bookings
    // Vendor can see their own bookings
    // Admin can see all bookings
    if (req.user) {
      const isUser = req.user.role === 'user' && booking.user && booking.user.toString() === req.user._id.toString();
      const bookingVendorId = booking.vendor?.toString();
      const isVendor = req.user.role === 'vendor' && bookingVendorId && bookingVendorId === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';
      
      if (!isUser && !isVendor && !isAdmin) {
        return res.status(403).json({ message: 'Access denied. You do not have permission to view this booking.' });
      }
    } else {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    res.json({
      trackingInfo: booking.vendorTrackingInfo || {
        updates: []
      }
    });
  } catch (error: any) {
    console.error('Error in getBookingTracking:', error);
    res.status(500).json({ message: 'Failed to get booking tracking info: ' + error.message });
  }
};