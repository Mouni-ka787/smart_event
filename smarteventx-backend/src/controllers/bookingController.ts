import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Booking, { IBooking } from '../models/Booking';
import Service from '../models/Service';
import User from '../models/User';
import mongoose from 'mongoose';
import QRCode from 'qrcode';

// Extend the Request type to include user property
interface AuthRequest extends Request {
  user?: any;
}

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private/User/Admin
export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { serviceId, eventName, eventDate, guestCount, specialRequests, userId, venueAddress, venueLat, venueLng } = req.body;
    console.log('createBooking called with body:', req.body);
    console.log('Authenticated user on request:', req.user);
    
    // Get service details
    const service = await Service.findById(serviceId).populate('vendor', '_id');
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Determine the user for the booking
    // If admin is creating booking for a user, use the provided userId
    // Otherwise, use the requesting user's ID
    const bookingUserId = req.user?.role === 'admin' && userId ? userId : req.user?._id;
    
    // Calculate total price (simplified)
    let totalPrice = 0;
    if (service.priceType === 'per_person') {
      totalPrice = service.price * guestCount;
    } else {
      totalPrice = service.price;
    }
    
    // Generate QR code (simplified - in real app, use a QR code library)
    const qrCode = `QR-${uuidv4().substring(0, 8).toUpperCase()}`;
    
    // Create booking
    const booking = new Booking({
      user: bookingUserId,
      service: serviceId,
      vendor: service.vendor,
      eventName,
      eventDate,
      guestCount,
      specialRequests,
      totalPrice,
      qrCode,
      venueLocation: {
        address: venueAddress,
        coordinates: {
          lat: venueLat,
          lng: venueLng
        }
      }
    });
    
    const createdBooking = await booking.save();
    
    // Populate references
    await createdBooking.populate('user', 'name email');
    await createdBooking.populate('service', 'name price');
    await createdBooking.populate('vendor', 'name');
    
    res.status(201).json(createdBooking);
  } catch (error: any) {
    console.error('Error in createBooking:', error);
    res.status(400).json({ message: error.message || 'Failed to create booking' });
  }
};

// @desc    Get all bookings for a user (includes both legacy and event bookings)
// @route   GET /api/bookings/user
// @access  Private/User
export const getUserBookings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    console.log('Fetching user bookings for userId:', userId);
    console.log('UserId type:', typeof userId);
    
    // Find all bookings for this user (both legacy and event bookings)
    const bookings = await Booking.find({ user: userId })
      .populate('service', 'name category')
      .populate('vendor', 'name')
      .populate('event', 'name category')
      .populate('admin', 'name email phoneNumber')
      .sort({ createdAt: -1 });
    
    console.log('Found user bookings:', bookings);
    console.log('User booking count:', bookings.length);
    
    res.json({ bookings });
  } catch (error: any) {
    console.error('Error getting user bookings:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings for a vendor
// @route   GET /api/bookings/vendor
// @access  Private/Vendor
export const getVendorBookings = async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await Booking.find({ vendor: req.user?._id })
      .populate('user', 'name email')
      .populate('service', 'name category')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('service', 'name category description price priceType')
      .populate('vendor', 'name');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is authorized to view this booking
    const userId = req.user?._id.toString();
    
    // Get user ID - handle both populated and non-populated cases
    let bookingUserId = '';
    if (booking.user) {
      if (typeof booking.user === 'object' && '_id' in booking.user) {
        // Populated user object
        bookingUserId = (booking.user as any)._id.toString();
      } else {
        // Raw ObjectId
        bookingUserId = (booking.user as unknown as mongoose.Types.ObjectId).toString();
      }
    }
    
    // Get vendor ID - handle both populated and non-populated cases
    let bookingVendorId = '';
    if (booking.vendor) {
      if (typeof booking.vendor === 'object' && '_id' in booking.vendor) {
        // Populated vendor object
        bookingVendorId = (booking.vendor as any)._id.toString();
      } else {
        // Raw ObjectId or string
        bookingVendorId = (booking.vendor as unknown as mongoose.Types.ObjectId | string).toString();
      }
    }
    
    if (
      bookingUserId !== userId &&
      bookingVendorId !== userId &&
      req.user?.role !== 'admin'
    ) {
      return res.status(401).json({ message: 'Not authorized to view this booking' });
    }
    
    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Add status update to tracking info
    if (!booking.vendorTrackingInfo) {
      booking.vendorTrackingInfo = {
        updates: []
      };
    }
    
    booking.vendorTrackingInfo.updates.push({
      status,
      timestamp: new Date(),
      description: `Booking status updated to ${status}`
    });
    
    booking.status = status;
    
    const updatedBooking = await booking.save();
    
    // Populate references
    await updatedBooking.populate('user', 'name email');
    await updatedBooking.populate('service', 'name price');
    await updatedBooking.populate('vendor', 'name');
    
    res.json(updatedBooking);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update booking tracking info
// @route   PUT /api/bookings/:id/tracking
// @access  Private/Vendor
export const updateBookingTracking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { currentLocation, estimatedArrival } = req.body;
    
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is authorized to update this booking
    const currentUserId = req.user?._id.toString();
    let bookingVendorId = '';
    
    // Handle both ObjectId and string vendor IDs
    if (booking.vendor) {
      if (typeof booking.vendor === 'string') {
        bookingVendorId = booking.vendor;
      } else {
        bookingVendorId = (booking.vendor as any).toString();
      }
    }
    
    if (currentUserId !== bookingVendorId) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }
    
    // Initialize vendorTrackingInfo if it doesn't exist
    if (!booking.vendorTrackingInfo) {
      booking.vendorTrackingInfo = {
        updates: []
      };
    }
    
    // Update tracking info
    if (currentLocation) {
      booking.vendorTrackingInfo.currentLocation = currentLocation;
    }
    
    if (estimatedArrival) {
      booking.vendorTrackingInfo.estimatedArrival = estimatedArrival;
    }
    
    // Add update to history
    booking.vendorTrackingInfo.updates.push({
      status: 'location_update',
      timestamp: new Date(),
      description: 'Location updated'
    });
    
    await booking.save();
    
    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark booking as completed and generate QR code
// @route   PUT /api/bookings/:id/complete
// @access  Private/Vendor
export const completeBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is authorized to update this booking
    const currentUserId = req.user?._id.toString();
    let bookingVendorId = '';
    
    // Handle both ObjectId and string vendor IDs
    if (booking.vendor) {
      if (typeof booking.vendor === 'string') {
        bookingVendorId = booking.vendor;
      } else {
        bookingVendorId = (booking.vendor as any).toString();
      }
    }
    
    if (currentUserId !== bookingVendorId) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }
    
    // Initialize vendorTrackingInfo if it doesn't exist
    if (!booking.vendorTrackingInfo) {
      booking.vendorTrackingInfo = {
        updates: []
      };
    }
    
    // Update status and tracking info
    booking.status = 'completed';
    booking.vendorTrackingInfo.updates.push({
      status: 'completed',
      timestamp: new Date(),
      description: 'Service completed'
    });
    
    // Generate QR code
    const qrData = {
      bookingId: booking._id,
      amount: booking.totalPrice || 0,
      timestamp: Date.now()
    };
    
    const qrDataString = JSON.stringify(qrData);
    // @ts-ignore
    const qrCodeImage = await QRCode.toDataURL(qrDataString);
    
    booking.qrCode = qrCodeImage;
    booking.qrData = qrDataString;
    
    await booking.save();
    
    res.json({
      message: 'Booking completed and QR code generated',
      booking,
      qrCode: qrCodeImage,
      qrData: qrDataString
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update tracking information
// @route   PUT /api/bookings/:id/tracking
// @access  Private/Vendor
export const updateTrackingInfo = async (req: AuthRequest, res: Response) => {
  try {
    const { currentLocation, estimatedArrival, statusUpdate } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is the vendor
    // Get vendor ID - handle both populated and non-populated cases
    let bookingVendorId = '';
    if (booking.vendor) {
      if (typeof booking.vendor === 'object' && '_id' in booking.vendor) {
        // Populated vendor object
        bookingVendorId = (booking.vendor as any)._id.toString();
      } else {
        // Raw ObjectId or string
        bookingVendorId = (booking.vendor as any).toString();
      }
    }
    
    if (bookingVendorId !== req.user?._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    if (!booking.vendorTrackingInfo) {
      booking.vendorTrackingInfo = {
        updates: []
      };
    }
    
    // Update location if provided
    if (currentLocation) {
      booking.vendorTrackingInfo.currentLocation = currentLocation;
    }
    
    // Update estimated arrival if provided
    if (estimatedArrival) {
      booking.vendorTrackingInfo.estimatedArrival = estimatedArrival;
    }
    
    // Add status update if provided
    if (statusUpdate) {
      booking.vendorTrackingInfo.updates.push({
        status: statusUpdate.status,
        timestamp: new Date(),
        description: statusUpdate.description
      });
    }
    
    const updatedBooking = await booking.save();
    
    res.json(updatedBooking);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Release payment (scan QR code)
// @route   PUT /api/bookings/:id/release-payment
// @access  Private/Admin
export const releasePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { qrCode } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Verify QR code
    if (booking.qrCode !== qrCode) {
      return res.status(400).json({ message: 'Invalid QR code' });
    }
    
    // Update payment status
    booking.paymentStatus = 'released';
    booking.status = 'completed';
    
    // Add status update to tracking info
    if (!booking.vendorTrackingInfo) {
      booking.vendorTrackingInfo = {
        updates: []
      };
    }
    
    booking.vendorTrackingInfo.updates.push({
      status: 'completed',
      timestamp: new Date(),
      description: 'Payment released and service completed'
    });
    
    const updatedBooking = await booking.save();
    
    res.json({
      message: 'Payment released successfully',
      booking: updatedBooking
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get admin tracking for booking (USER VIEW)
// @route   GET /api/bookings/:id/admin-tracking
// @access  Private/User
export const getAdminTracking = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('admin', 'name email phoneNumber')
      .populate('event', 'name');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Verify user owns this booking
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!booking.user || (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json({
      adminTrackingInfo: booking.adminTrackingInfo || {
        status: 'NOT_STARTED',
        updates: []
      },
      admin: booking.admin,
      venueLocation: booking.venueLocation
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's bookings with tracking
// @route   GET /api/bookings/user/trackable
// @access  Private/User
export const getUserTrackableBookings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const bookings = await Booking.find({
      user: req.user._id,
      status: { $in: ['confirmed', 'in_progress'] }
    })
    .populate('admin', 'name email phoneNumber')
    .populate('event', 'name category')
    .sort({ eventDate: 1 });
    
    res.json(bookings);
  } catch (error: any) {
    console.error('Error in getUserTrackableBookings:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Process payment for a booking
// @route   POST /api/bookings/:id/process-payment
// @access  Private/User
export const processPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { qrData } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.qrData !== qrData) {
      return res.status(400).json({ message: 'Invalid QR data' });
    }

    booking.paymentStatus = 'paid';
    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};