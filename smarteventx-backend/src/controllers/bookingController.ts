import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Booking, { IBooking } from '../models/Booking';
import Service from '../models/Service';
import User from '../models/User';

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private/User
export const createBooking = async (req: Request, res: Response) => {
  try {
    const { serviceId, eventName, eventDate, guestCount, specialRequests } = req.body;
    
    // Get service details
    const service = await Service.findById(serviceId).populate('vendor', '_id');
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
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
      user: req.user?._id,
      service: serviceId,
      vendor: service.vendor,
      eventName,
      eventDate,
      guestCount,
      specialRequests,
      totalPrice,
      qrCode
    });
    
    const createdBooking = await booking.save();
    
    // Populate references
    await createdBooking.populate('user', 'name email');
    await createdBooking.populate('service', 'name price');
    await createdBooking.populate('vendor', 'name');
    
    res.status(201).json(createdBooking);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all bookings for a user
// @route   GET /api/bookings/user
// @access  Private/User
export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find({ user: req.user?._id })
      .populate('service', 'name category')
      .populate('vendor', 'name')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings for a vendor
// @route   GET /api/bookings/vendor
// @access  Private/Vendor
export const getVendorBookings = async (req: Request, res: Response) => {
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
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('service', 'name category description price priceType')
      .populate('vendor', 'name');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is authorized to view this booking
    if (
      booking.user._id.toString() !== req.user?._id.toString() &&
      booking.vendor._id.toString() !== req.user?._id.toString() &&
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
export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Add status update to tracking info
    if (!booking.trackingInfo) {
      booking.trackingInfo = {
        updates: []
      };
    }
    
    booking.trackingInfo.updates.push({
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

// @desc    Update tracking information
// @route   PUT /api/bookings/:id/tracking
// @access  Private/Vendor
export const updateTrackingInfo = async (req: Request, res: Response) => {
  try {
    const { currentLocation, estimatedArrival, statusUpdate } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is the vendor
    if (booking.vendor.toString() !== req.user?._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    if (!booking.trackingInfo) {
      booking.trackingInfo = {
        updates: []
      };
    }
    
    // Update location if provided
    if (currentLocation) {
      booking.trackingInfo.currentLocation = currentLocation;
    }
    
    // Update estimated arrival if provided
    if (estimatedArrival) {
      booking.trackingInfo.estimatedArrival = estimatedArrival;
    }
    
    // Add status update if provided
    if (statusUpdate) {
      booking.trackingInfo.updates.push({
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
export const releasePayment = async (req: Request, res: Response) => {
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
    if (!booking.trackingInfo) {
      booking.trackingInfo = {
        updates: []
      };
    }
    
    booking.trackingInfo.updates.push({
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