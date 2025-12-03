import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Booking, { IBooking } from '../models/Booking';
import Event from '../models/Event';
import User from '../models/User';
import QRCode from 'qrcode';

// Extend the Request type to include user property
interface AuthRequest extends Request {
  user?: any;
}

// Create booking for event package
export const createEventBooking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id as string;
    const { eventId, eventName, eventDate, guestCount, venueAddress, venueLat, venueLng, specialRequests } = req.body;

    console.log('Creating event booking with data:', {
      userId,
      eventId,
      eventName,
      eventDate,
      guestCount,
      venueAddress,
      venueLat,
      venueLng
    });

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get event details
    const event = await Event.findById(eventId).populate('createdBy', 'name email');
    console.log('Found event:', event);
    console.log('Event createdBy:', event?.createdBy);
    console.log('Event createdBy type:', typeof event?.createdBy);
    console.log('Event createdBy toString():', event?.createdBy?.toString());
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Create booking
    console.log('Creating booking with admin:', event.createdBy);
    console.log('Admin type:', typeof event.createdBy);
    const booking = new Booking({
      user: userId,
      event: eventId,
      admin: event.createdBy, // Admin who created the event
      eventName,
      eventDate: new Date(eventDate),
      guestCount: parseInt(guestCount) || 1,
      totalPrice: event.totalPrice || 0,
      status: 'pending',
      paymentStatus: 'pending',
      venueLocation: {
        address: venueAddress,
        coordinates: {
          lat: venueLat || 0,
          lng: venueLng || 0
        }
      },
      specialRequests,
      adminTrackingInfo: {
        status: 'NOT_STARTED',
        updates: [{
          status: 'CREATED',
          timestamp: new Date(),
          description: 'Booking created, waiting for admin confirmation'
        }]
      }
    });
    console.log('Booking object created:', booking);

    console.log('Saving booking with admin:', booking.admin);
    console.log('Booking:', booking);
    const savedBooking = await booking.save();

    // Populate booking details
    await savedBooking.populate(['user', 'event', 'admin']);

    console.log('Booking created successfully:', savedBooking._id);
    res.status(201).json(savedBooking);
  } catch (error: any) {
    console.error('Error creating event booking:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Accept booking (Admin)
export const acceptBooking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id as string;
    const { id } = req.params;

    console.log('Accept booking request:', { userId, bookingId: id });
    console.log('User ID type:', typeof userId);
    console.log('User object:', req.user);

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    console.log('Booking found:', {
      bookingId: booking._id,
      admin: booking.admin,
      adminType: typeof booking.admin,
      adminString: booking.admin?.toString(),
      userId,
      userIdString: userId.toString(),
      match: booking.admin?.toString() === userId.toString()
    });

    // Check if user is the admin for this booking
    // Convert both to strings for comparison
    const bookingAdminId = booking.admin?.toString();
    const currentUserId = userId.toString();
    
    if (bookingAdminId !== currentUserId) {
      console.error('Authorization failed:', {
        bookingAdmin: bookingAdminId,
        currentUser: currentUserId,
        message: 'User is not the admin for this booking'
      });
      return res.status(403).json({ 
        message: 'Not authorized to accept this booking',
        debug: {
          bookingAdmin: bookingAdminId,
          yourId: currentUserId
        }
      });
    }

    booking.status = 'confirmed';
    if (!booking.adminTrackingInfo) {
      booking.adminTrackingInfo = { updates: [] };
    }
    booking.adminTrackingInfo.status = 'NOT_STARTED';
    booking.adminTrackingInfo.updates.push({
      status: 'CONFIRMED',
      timestamp: new Date(),
      description: 'Booking confirmed by admin'
    });

    const updatedBooking = await booking.save();
    await updatedBooking.populate(['user', 'event', 'admin']);

    res.json(updatedBooking);
  } catch (error: any) {
    console.error('Error accepting booking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Start service (Admin) - Starts live tracking
export const startService = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id as string;
    const { id } = req.params;
    const { location } = req.body;

    console.log('Start service request:', { userId, bookingId: id, location });

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    console.log('Booking found for start service:', {
      bookingId: booking._id,
      admin: booking.admin,
      adminString: booking.admin?.toString(),
      userId,
      userIdString: userId.toString(),
      match: booking.admin?.toString() === userId.toString()
    });

    // Check if user is the admin for this booking
    const bookingAdminId = booking.admin?.toString();
    const currentUserId = userId.toString();
    
    if (bookingAdminId !== currentUserId) {
      console.error('Start service authorization failed:', {
        bookingAdmin: bookingAdminId,
        currentUser: currentUserId
      });
      return res.status(403).json({ 
        message: 'Not authorized',
        debug: {
          bookingAdmin: bookingAdminId,
          yourId: currentUserId
        }
      });
    }

    booking.status = 'in_progress';
    if (!booking.adminTrackingInfo) {
      booking.adminTrackingInfo = { updates: [] };
    }
    
    booking.adminTrackingInfo.status = 'EN_ROUTE';
    booking.adminTrackingInfo.currentLocation = {
      type: 'Point',
      coordinates: [location.lng, location.lat]
    };
    booking.adminTrackingInfo.updates.push({
      status: 'EN_ROUTE',
      timestamp: new Date(),
      description: 'Admin has started heading to your venue'
    });

    const updatedBooking = await booking.save();
    await updatedBooking.populate(['user', 'event', 'admin']);

    res.json(updatedBooking);
  } catch (error: any) {
    console.error('Error starting service:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Complete service (Admin) - Generates QR for payment
export const completeService = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id as string;
    const { id } = req.params;

    console.log('Complete service request:', { userId, bookingId: id });
    
    // Validate input
    if (!id) {
      console.error('Missing booking ID');
      return res.status(400).json({ message: 'Booking ID is required' });
    }
    
    if (!userId) {
      console.error('Missing user ID');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      console.error('Booking not found:', id);
      return res.status(404).json({ message: 'Booking not found' });
    }

    console.log('Booking found for complete service:', {
      bookingId: booking._id,
      admin: booking.admin,
      adminString: booking.admin?.toString(),
      userId,
      match: booking.admin?.toString() === userId.toString()
    });

    // Check if user is the admin for this booking
    const bookingAdminId = booking.admin?.toString();
    const currentUserId = userId.toString();
    
    if (bookingAdminId !== currentUserId) {
      console.error('Complete service authorization failed:', {
        bookingAdmin: bookingAdminId,
        currentUser: currentUserId
      });
      return res.status(403).json({ 
        message: 'Not authorized',
        debug: {
          bookingAdmin: bookingAdminId,
          yourId: currentUserId
        }
      });
    }

    // Generate QR code for payment
    const qrData = JSON.stringify({
      bookingId: booking._id,
      amount: booking.totalPrice || 0,
      timestamp: new Date().getTime()
    });

    console.log('Generating QR code with data:', qrData);
    const qrCodeImage = await QRCode.toDataURL(qrData);
    console.log('QR code generated successfully');

    booking.status = 'completed';
    booking.qrCode = qrCodeImage;  // Store the QR code image (base64)
    booking.qrData = qrData;       // Store the raw QR data (JSON string)
    if (!booking.adminTrackingInfo) {
      booking.adminTrackingInfo = { updates: [] };
    }
    booking.adminTrackingInfo.status = 'COMPLETED';
    booking.adminTrackingInfo.updates.push({
      status: 'COMPLETED',
      timestamp: new Date(),
      description: 'Service completed. Payment QR code generated.'
    });

    const updatedBooking = await booking.save();
    await updatedBooking.populate(['user', 'event', 'admin']);

    console.log('Booking saved with QR code:', {
      qrCode: updatedBooking.qrCode ? 'Generated' : 'Missing',
      qrData: updatedBooking.qrData ? 'Generated' : 'Missing'
    });

    res.json({
      message: 'Service completed and QR code generated',
      booking: updatedBooking,
      qrCode: qrCodeImage,
      qrData: qrData
    });
  } catch (error: any) {
    console.error('Error completing service:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Process payment (User scans QR)
export const processPayment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id as string;
    const { id } = req.params;
    const { qrData } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is the booking owner
    if (booking.user?.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Verify QR data
    try {
      const parsedData = JSON.parse(qrData);
      if (parsedData.bookingId !== (booking._id as any).toString()) {
        return res.status(400).json({ message: 'Invalid QR code' });
      }
    } catch (e) {
      return res.status(400).json({ message: 'Invalid QR data' });
    }

    // Process payment
    booking.paymentStatus = 'paid';
    if (!booking.adminTrackingInfo) {
      booking.adminTrackingInfo = { updates: [] };
    }
    booking.adminTrackingInfo.updates.push({
      status: 'PAID',
      timestamp: new Date(),
      description: 'Payment completed successfully'
    });

    const updatedBooking = await booking.save();
    await updatedBooking.populate(['user', 'event', 'admin']);

    res.json({
      message: 'Payment processed successfully',
      booking: updatedBooking
    });
  } catch (error: any) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get booking tracking info (User)
export const getBookingTracking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id as string;
    const { id } = req.params;

    console.log('Get tracking request:', { userId, bookingId: id });

    const booking = await Booking.findById(id).populate(['user', 'event', 'admin']);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    console.log('Booking found for tracking:', {
      bookingId: booking._id,
      user: booking.user,
      userId,
      userType: typeof booking.user
    });

    // Check if user is the booking owner
    // Handle both populated and non-populated user
    let bookingUserId = '';
    if (booking.user) {
      const userField = booking.user as any;
      if (typeof userField === 'object' && '_id' in userField) {
        // Populated user object
        bookingUserId = userField._id.toString();
      } else {
        // Raw ObjectId
        bookingUserId = userField.toString();
      }
    }

    const currentUserId = userId.toString();

    console.log('Authorization check:', {
      bookingUser: bookingUserId,
      currentUser: currentUserId,
      match: bookingUserId === currentUserId
    });

    if (bookingUserId !== currentUserId) {
      console.error('Tracking authorization failed:', {
        bookingUser: bookingUserId,
        currentUser: currentUserId
      });
      return res.status(403).json({ 
        message: 'Not authorized',
        debug: {
          bookingUser: bookingUserId,
          yourId: currentUserId
        }
      });
    }

    const populatedAdmin = booking.admin as any;

    res.json({
      bookingId: booking._id,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      qrCode: booking.qrCode,
      qrData: booking.qrData,
      adminTracking: booking.adminTrackingInfo,
      venueLocation: booking.venueLocation,
      event: booking.event,
      admin: {
        name: populatedAdmin?.name,
        email: populatedAdmin?.email,
        phoneNumber: populatedAdmin?.phoneNumber
      }
    });
  } catch (error: any) {
    console.error('Error getting booking tracking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};