import { Request, Response } from 'express';
import Booking from '../models/Booking';
import VendorAssignment from '../models/VendorAssignment';
import { calculateETA, calculateDistanceHaversine } from '../utils/locationUtils';
import { geocodeAddress } from '../services/googleMapsService';

// @desc    Get trackable bookings (bookings that need vendor assignments)
// @route   GET /api/admin/tracking/bookings
// @access  Private/Admin
export const getTrackableBookings = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin access required.' });
    }

    // Get bookings that don't have vendor assignments yet
    // These are bookings where status is confirmed but no vendor assignment exists
    const bookings = await Booking.find({
      status: 'confirmed',
      vendor: { $exists: false }
    })
    .populate('user', 'name')
    .populate('service', 'name')
    .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error: any) {
    console.error('Error in getTrackableBookings:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin assigns vendor to a booking
// @route   POST /api/admin/bookings/:bookingId/assign-vendor
// @access  Private/Admin
export const assignVendorToBooking = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin access required.' });
    }

    const { bookingId } = req.params;
    const { vendor, service, deliveryLocation } = req.body;

    // Validate required fields
    if (!vendor || !service || !deliveryLocation) {
      return res.status(400).json({ 
        message: 'Vendor, service, and delivery location are required' 
      });
    }

    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Create vendor assignment
    const assignment = new VendorAssignment({
      booking: bookingId,
      admin: req.user._id,
      vendor,
      service,
      deliveryLocation,
      status: 'PENDING',
      trackingInfo: {
        updates: [{
          status: 'ASSIGNED',
          timestamp: new Date(),
          description: 'Vendor assigned to booking'
        }]
      }
    });

    await assignment.save();

    // Populate the assignment
    const populatedAssignment = await VendorAssignment.findById(assignment._id)
      .populate('vendor', 'name email phoneNumber')
      .populate('service', 'name category');

    res.status(201).json({
      message: 'Vendor assigned successfully',
      assignment: populatedAssignment
    });
  } catch (error: any) {
    console.error('Error in assignVendorToBooking:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all vendor assignments for a booking
// @route   GET /api/admin/bookings/:bookingId/vendor-assignments
// @access  Private/Admin
export const getBookingVendorAssignments = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin access required.' });
    }

    const { bookingId } = req.params;

    const assignments = await VendorAssignment.find({ booking: bookingId })
      .populate('vendor', 'name email phoneNumber')
      .populate('service', 'name category price')
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (error: any) {
    console.error('Error in getBookingVendorAssignments:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get vendor assignment tracking
// @route   GET /api/admin/vendor-assignments/:assignmentId/tracking
// @access  Private/Admin
export const getVendorAssignmentTracking = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin access required.' });
    }

    const { assignmentId } = req.params;

    const assignment = await VendorAssignment.findById(assignmentId)
      .populate('vendor', 'name email phoneNumber')
      .populate('service', 'name');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json({
      trackingInfo: assignment.trackingInfo || { updates: [] }
    });
  } catch (error: any) {
    console.error('Error in getVendorAssignmentTracking:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin updates their own location (for users to see)
// @route   POST /api/admin/bookings/:bookingId/my-location
// @access  Private/Admin
export const updateAdminLocation = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin access required.' });
    }

    const { bookingId } = req.params;
    const { lat, lng, speed, bearing } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Initialize adminTrackingInfo if not exists
    if (!booking.adminTrackingInfo) {
      booking.adminTrackingInfo = {
        status: 'EN_ROUTE',
        updates: []
      };
    }

    // Update admin's current location
    booking.adminTrackingInfo.currentLocation = {
      type: 'Point',
      coordinates: [lng, lat]
    };

    // Calculate ETA if venue location exists
    if (booking.venueLocation?.coordinates) {
      const adminCoords = { lat, lng };
      const venueCoords = booking.venueLocation.coordinates;
      
      const etaSeconds = await calculateETA(adminCoords, venueCoords, speed);
      
      booking.adminTrackingInfo.estimatedArrival = new Date(Date.now() + etaSeconds * 1000);
    }

    // Add update to history
    booking.adminTrackingInfo.updates.push({
      status: 'location_update',
      timestamp: new Date(),
      description: `Admin location updated to ${lat}, ${lng}`
    });

    await booking.save();

    // Emit WebSocket event
    const io = req.app.get('io');
    if (io) {
      io.to(`booking:${bookingId}:admin`).emit('admin:location:update', {
        bookingId,
        lat,
        lng,
        speed,
        bearing,
        etaSeconds: booking.adminTrackingInfo.estimatedArrival 
          ? Math.floor((booking.adminTrackingInfo.estimatedArrival.getTime() - Date.now()) / 1000)
          : null
      });
    }

    res.json({
      message: 'Admin location updated successfully',
      data: {
        lat,
        lng,
        etaSeconds: booking.adminTrackingInfo.estimatedArrival 
          ? Math.floor((booking.adminTrackingInfo.estimatedArrival.getTime() - Date.now()) / 1000)
          : null
      }
    });
  } catch (error: any) {
    console.error('Error in updateAdminLocation:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin starts delivery/traveling to event
// @route   POST /api/admin/bookings/:bookingId/start-delivery
// @access  Private/Admin
export const startAdminDelivery = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin access required.' });
    }

    const { bookingId } = req.params;
    const { startLocation } = req.body;

    if (!startLocation || !startLocation.lat || !startLocation.lng) {
      return res.status(400).json({ message: 'Start location is required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update booking status
    booking.status = 'in_progress';

    // Initialize admin tracking
    booking.adminTrackingInfo = {
      status: 'EN_ROUTE',
      currentLocation: {
        type: 'Point',
        coordinates: [startLocation.lng, startLocation.lat]
      },
      updates: [{
        status: 'EN_ROUTE',
        timestamp: new Date(),
        description: 'Admin started traveling to event venue'
      }]
    };

    await booking.save();

    // Emit WebSocket event
    const io = req.app.get('io');
    if (io) {
      io.to(`booking:${bookingId}:admin`).emit('admin:status:update', {
        bookingId,
        status: 'EN_ROUTE'
      });
    }

    res.json({
      message: 'Delivery started successfully',
      tracking: booking.adminTrackingInfo
    });
  } catch (error: any) {
    console.error('Error in startAdminDelivery:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin marks arrival at venue
// @route   POST /api/admin/bookings/:bookingId/mark-arrived
// @access  Private/Admin
export const markAdminArrived = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin access required.' });
    }

    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (!booking.adminTrackingInfo) {
      booking.adminTrackingInfo = { status: 'ARRIVED', updates: [] };
    }

    booking.adminTrackingInfo.status = 'ARRIVED';
    booking.adminTrackingInfo.updates.push({
      status: 'ARRIVED',
      timestamp: new Date(),
      description: 'Admin arrived at event venue'
    });

    await booking.save();

    // Emit WebSocket event
    const io = req.app.get('io');
    if (io) {
      io.to(`booking:${bookingId}:admin`).emit('admin:status:update', {
        bookingId,
        status: 'ARRIVED'
      });
    }

    res.json({
      message: 'Marked as arrived successfully',
      status: 'ARRIVED'
    });
  } catch (error: any) {
    console.error('Error in markAdminArrived:', error);
    res.status(500).json({ message: error.message });
  }
};
