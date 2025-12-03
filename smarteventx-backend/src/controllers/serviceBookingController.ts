import { Request, Response } from 'express';
import Booking, { IBooking } from '../models/Booking';
import Service from '../models/Service';
import User from '../models/User';
import QRCode from 'qrcode';

// Extend the Request type to include user property
interface AuthRequest extends Request {
  user?: any;
}

// Create booking for service
export const createServiceBooking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id as string;
    const { serviceId, serviceName, eventDate, guestCount, venueAddress, venueLat, venueLng, specialRequests } = req.body;

    console.log('Creating service booking with data:', {
      userId,
      serviceId,
      serviceName,
      eventDate,
      guestCount,
      venueAddress,
      venueLat,
      venueLng
    });

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get service details
    const service = await Service.findById(serviceId).populate('vendor', 'name email');
    console.log('Found service:', service);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Calculate total price
    let totalPrice = 0;
    if (service.priceType === 'per_person') {
      totalPrice = service.price * (parseInt(guestCount) || 1);
    } else {
      totalPrice = service.price;
    }

    // Create booking
    const booking = new Booking({
      user: userId,
      service: serviceId,
      vendor: service.vendor,
      serviceName,
      eventDate: new Date(eventDate),
      guestCount: parseInt(guestCount) || 1,
      totalPrice,
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
      vendorTrackingInfo: {
        status: 'NOT_STARTED',
        updates: [{
          status: 'CREATED',
          timestamp: new Date(),
          description: 'Booking created, waiting for vendor confirmation'
        }]
      }
    });

    const savedBooking = await booking.save();

    // Populate booking details
    await savedBooking.populate(['user', 'service', 'vendor']);

    console.log('Service booking created successfully:', savedBooking._id);
    res.status(201).json(savedBooking);
  } catch (error: any) {
    console.error('Error creating service booking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Accept service booking (Vendor)
export const acceptServiceBooking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id as string;
    const { id } = req.params;

    console.log('Accept service booking request:', { userId, bookingId: id });

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is the vendor for this booking
    const bookingVendorId = booking.vendor?.toString();
    const currentUserId = userId.toString();
    
    if (bookingVendorId !== currentUserId) {
      return res.status(403).json({ 
        message: 'Not authorized to accept this booking',
        debug: {
          bookingVendor: bookingVendorId,
          yourId: currentUserId
        }
      });
    }

    booking.status = 'confirmed';
    if (!booking.vendorTrackingInfo) {
      booking.vendorTrackingInfo = { updates: [] };
    }
    booking.vendorTrackingInfo.status = 'NOT_STARTED';
    booking.vendorTrackingInfo.updates.push({
      status: 'CONFIRMED',
      timestamp: new Date(),
      description: 'Booking confirmed by vendor'
    });

    const updatedBooking = await booking.save();
    await updatedBooking.populate(['user', 'service', 'vendor']);

    res.json(updatedBooking);
  } catch (error: any) {
    console.error('Error accepting service booking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Start service tracking (Vendor)
export const startServiceTracking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id as string;
    const { id } = req.params;
    const { location } = req.body;

    console.log('Start service tracking request:', { userId, bookingId: id, location });

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is the vendor for this booking
    const bookingVendorId = booking.vendor?.toString();
    const currentUserId = userId.toString();
    
    if (bookingVendorId !== currentUserId) {
      return res.status(403).json({ 
        message: 'Not authorized',
        debug: {
          bookingVendor: bookingVendorId,
          yourId: currentUserId
        }
      });
    }

    booking.status = 'in_progress';
    if (!booking.vendorTrackingInfo) {
      booking.vendorTrackingInfo = { updates: [] };
    }
    
    booking.vendorTrackingInfo.status = 'EN_ROUTE';
    booking.vendorTrackingInfo.currentLocation = {
      type: 'Point',
      coordinates: [location.lng, location.lat]
    };
    booking.vendorTrackingInfo.updates.push({
      status: 'EN_ROUTE',
      timestamp: new Date(),
      description: 'Vendor has started heading to your venue'
    });

    const updatedBooking = await booking.save();
    await updatedBooking.populate(['user', 'service', 'vendor']);

    res.json(updatedBooking);
  } catch (error: any) {
    console.error('Error starting service tracking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Complete service and generate QR (Vendor)
export const completeServiceBooking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id as string;
    const { id } = req.params;

    console.log('Complete service booking request:', { userId, bookingId: id });

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is the vendor for this booking
    const bookingVendorId = booking.vendor?.toString();
    const currentUserId = userId.toString();
    
    if (bookingVendorId !== currentUserId) {
      return res.status(403).json({ 
        message: 'Not authorized',
        debug: {
          bookingVendor: bookingVendorId,
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

    const qrCodeImage = await QRCode.toDataURL(qrData);

    booking.status = 'completed';
    booking.qrCode = qrCodeImage;
    booking.qrData = qrData;
    
    if (!booking.vendorTrackingInfo) {
      booking.vendorTrackingInfo = { updates: [] };
    }
    booking.vendorTrackingInfo.status = 'COMPLETED';
    booking.vendorTrackingInfo.updates.push({
      status: 'COMPLETED',
      timestamp: new Date(),
      description: 'Service completed. Payment QR code generated.'
    });

    const updatedBooking = await booking.save();
    await updatedBooking.populate(['user', 'service', 'vendor']);

    res.json({
      message: 'Service completed and QR code generated',
      booking: updatedBooking,
      qrCode: qrCodeImage,
      qrData: qrData
    });
  } catch (error: any) {
    console.error('Error completing service booking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Process service payment (User scans QR)
export const processServicePayment = async (req: AuthRequest, res: Response) => {
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
    if (!booking.vendorTrackingInfo) {
      booking.vendorTrackingInfo = { updates: [] };
    }
    booking.vendorTrackingInfo.updates.push({
      status: 'PAID',
      timestamp: new Date(),
      description: 'Payment completed successfully'
    });

    const updatedBooking = await booking.save();
    await updatedBooking.populate(['user', 'service', 'vendor']);

    res.json({
      message: 'Payment processed successfully',
      booking: updatedBooking
    });
  } catch (error: any) {
    console.error('Error processing service payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};