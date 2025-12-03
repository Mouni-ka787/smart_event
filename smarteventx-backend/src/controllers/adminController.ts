import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import Service, { IService } from '../models/Service';
import Booking from '../models/Booking';
import EventModel, { IEvent } from '../models/Event';
import VendorAssignment from '../models/VendorAssignment';
import { 
  getTopPerformingVendors, 
  getBundleSuggestions, 
  getWeakServiceAlerts,
  getTrendingServices
} from '../utils/aiRecommendations';
import mongoose from 'mongoose';

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    // Get counts for various entities
    const userCount = await User.countDocuments({ role: 'user' });
    const vendorCount = await User.countDocuments({ role: 'vendor' });
    const serviceCount = await Service.countDocuments();
    const bookingCount = await Booking.countDocuments();
    
    // Get recent bookings
    const recentBookings = await Booking.find()
      .populate('user', 'name')
      .populate('service', 'name')
      .populate('vendor', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get total revenue (simplified)
    const bookings = await Booking.find({ paymentStatus: 'released' });
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    
    // Get pending payments
    const pendingPayments = await Booking.countDocuments({ paymentStatus: 'pending' });
    
    res.json({
      stats: {
        users: userCount,
        vendors: vendorCount,
        services: serviceCount,
        bookings: bookingCount,
        revenue: totalRevenue,
        pendingPayments
      },
      recentBookings
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get admin analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAdminAnalytics = async (req: Request, res: Response) => {
  try {
    // Get service analytics
    const serviceAnalytics = await getTrendingServices();
    
    // Get booking trends for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const bookingTrends = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    res.json({
      serviceAnalytics,
      bookingTrends
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get top performing vendors
// @route   GET /api/admin/vendors/top
// @access  Private/Admin
export const getTopVendors = async (req: Request, res: Response) => {
  try {
    const topVendors = await getTopPerformingVendors(5);
    
    // Get vendor details - handle both string IDs and ObjectId
    const vendorIds = topVendors.map(vendor => vendor.vendorId);
    // Filter out invalid IDs and convert valid string IDs to ObjectId
    const validObjectIds = vendorIds.filter(id => 
      mongoose.Types.ObjectId.isValid(id)
    ).map(id => new mongoose.Types.ObjectId(id));
    
    let vendorDetails: IUser[] = [];
    if (validObjectIds.length > 0) {
      vendorDetails = await User.find({ 
        _id: { $in: validObjectIds } 
      });
    }
    
    // Combine performance data with vendor details
    const vendorsWithDetails = topVendors.map(vendor => {
      const details = vendorDetails.find(detail => {
        const detailId = typeof detail._id === 'object' && detail._id !== null ? detail._id.toString() : String(detail._id);
        return detailId === vendor.vendorId;
      });
      return {
        ...vendor,
        ...details
      };
    });
    
    res.json(vendorsWithDetails);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bundle suggestions
// @route   GET /api/admin/bundles/suggestions
// @access  Private/Admin
export const getBundleSuggestionsAPI = async (req: Request, res: Response) => {
  try {
    // Get booking trends for the last 30 days to pass to getBundleSuggestions
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const bookingTrends = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    const suggestions = await getBundleSuggestions(bookingTrends);
    res.json(suggestions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get weak service alerts
// @route   GET /api/admin/services/alerts
// @access  Private/Admin
export const getWeakServiceAlertsAPI = async (req: Request, res: Response) => {
  try {
    const alerts = await getWeakServiceAlerts();
    res.json(alerts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create event
// @route   POST /api/admin/events
// @access  Private/Admin
export const createEvent = async (req: Request, res: Response) => {
  try {
    const { name, description, category, services } = req.body;
    
    // Validate required fields
    if (!name || !description || !category || !services || !Array.isArray(services)) {
      return res.status(400).json({ message: 'Name, description, category, and services array are required' });
    }
    
    // Validate services array
    for (const service of services) {
      if (service.isVendorService && !service.serviceId) {
        return res.status(400).json({ message: 'Service ID is required for vendor services' });
      }
      if (!service.isVendorService && (!service.name || !service.price)) {
        return res.status(400).json({ message: 'Name and price are required for admin services' });
      }
    }
    
    // Create services first
    const createdServices = [];
    for (const service of services) {
      if (service.isVendorService) {
        // Use existing vendor service
        createdServices.push(service.serviceId);
      } else {
        // Create new admin service
        const newService = new Service({
          name: service.name,
          description: service.description || '',
          category: service.category || category,
          price: service.price,
          priceType: service.priceType || 'per_event',
          isActive: true
        });
        await newService.save();
        createdServices.push(newService._id);
      }
    }
    
    // Create event
    const event = new EventModel({
      name,
      description,
      category,
      services: createdServices.map(serviceId => ({ service: serviceId })),
      createdBy: req.user?._id
    });
    
    await event.save();
    
    // Populate event with service details
    const populatedEvent = await EventModel.findById(event._id)
      .populate('services.service', 'name category price')
      .populate('createdBy', 'name');
    
    res.status(201).json(populatedEvent);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all events for admin dashboard
// @route   GET /api/admin/events
// @access  Private/Admin
export const getAllEventsForAdmin = async (req: Request, res: Response) => {
  try {
    const events = await EventModel.find()
      .populate('createdBy', 'name')
      .populate('services.service', 'name category')
      .populate('services.vendor', 'name email phoneNumber address')
      .sort({ createdAt: -1 });
    
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get admin's bookings (bookings where admin is assigned)
// @route   GET /api/admin/bookings
// @access  Private/Admin
export const getAdminBookings = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?._id as string;
    console.log('Fetching admin bookings for adminId:', adminId);
    console.log('AdminId type:', typeof adminId);
    const { status } = req.query;
    
    const query: any = { admin: adminId };
    console.log('Query object:', query);
    if (status) {
      query.status = status;
    }
    
    const bookings = await Booking.find(query)
      .populate('user', 'name email phoneNumber')
      .populate('event', 'name category')
      .sort({ createdAt: -1 });
    
    console.log('Found bookings:', bookings);
    console.log('Booking count:', bookings.length);
    
    res.json(bookings);
  } catch (error: any) {
    console.error('Error fetching admin bookings:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign vendor to service
// @route   POST /api/admin/services/:serviceId/assign-vendor
// @access  Private/Admin
export const assignVendorToService = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin access required.' });
    }

    const { serviceId } = req.params;
    const { vendorId, eventName, eventDate, guestCount, venueAddress, venueLat, venueLng } = req.body;

    // Validate required fields
    if (!vendorId || !eventName || !eventDate || !guestCount || !venueAddress || venueLat === undefined || venueLng === undefined) {
      return res.status(400).json({ 
        message: 'Vendor ID, event name, event date, guest count, venue address, latitude, and longitude are required' 
      });
    }

    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Create a booking for this service
    const booking = new Booking({
      user: req.user._id, // Admin is the user in this case
      service: serviceId,
      eventName,
      eventDate: new Date(eventDate),
      guestCount,
      venueLocation: {
        address: venueAddress,
        coordinates: {
          lat: venueLat,
          lng: venueLng
        }
      },
      totalPrice: service.price,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await booking.save();

    // Create vendor assignment
    const assignment = new VendorAssignment({
      booking: booking._id,
      admin: req.user._id,
      vendor: vendorId,
      service: serviceId,
      deliveryLocation: {
        address: venueAddress,
        coordinates: {
          lat: venueLat,
          lng: venueLng
        }
      },
      status: 'PENDING',
      trackingInfo: {
        updates: [{
          status: 'ASSIGNED',
          timestamp: new Date(),
          description: 'Vendor assigned to service booking'
        }]
      }
    });

    await assignment.save();

    // Populate the assignment
    const populatedAssignment = await VendorAssignment.findById(assignment._id)
      .populate('vendor', 'name email phoneNumber')
      .populate('service', 'name category');

    res.status(201).json({
      message: 'Vendor assigned successfully and booking created',
      booking,
      assignment: populatedAssignment
    });
  } catch (error: any) {
    console.error('Error in assignVendorToService:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all vendor assignments for admin dashboard
// @route   GET /api/admin/vendor-assignments
// @access  Private/Admin
export const getAllVendorAssignments = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin access required.' });
    }

    // Get all vendor assignments with populated data
    const assignments = await VendorAssignment.find()
      .populate('booking', 'eventName eventDate venueLocation')
      .populate('vendor', 'name email phoneNumber')
      .populate('service', 'name category')
      .populate('admin', 'name')
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (error: any) {
    console.error('Error in getAllVendorAssignments:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all services for admin dashboard
// @route   GET /api/admin/services
// @access  Private/Admin
export const getAllServicesForAdmin = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin access required.' });
    }

    // Get all services with vendor details
    const services = await Service.find()
      .populate('vendor', 'name email phoneNumber address');

    res.json(services);
  } catch (error: any) {
    console.error('Error in getAllServicesForAdmin:', error);
    res.status(500).json({ message: error.message });
  }
};
