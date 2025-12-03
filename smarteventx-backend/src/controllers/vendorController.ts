import { Request, Response } from 'express';
import Service from '../models/Service';
import Booking from '../models/Booking';
import User from '../models/User';
import EventModel from '../models/Event';
import { 
  getServicePerformanceSummary, 
  getPriceOptimizationSuggestions,
  getVendorMatchmakingSuggestions
} from '../utils/aiRecommendations';
import mongoose from 'mongoose';

// @desc    Get vendor dashboard statistics
// @route   GET /api/vendors/stats
// @access  Private/Vendor
export const getVendorStats = async (req: Request, res: Response) => {
  try {
    // Validate that the user is a vendor
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Access denied. Vendor access required.' });
    }
    
    const vendorId = req.user._id;
    console.log('Vendor ID from token:', vendorId);
    
    // Check if vendor exists in database
    const vendor = await User.findById(vendorId);
    console.log('Vendor found in database:', vendor);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor account not found. Please contact support.' });
    }
    
    // Get vendor's services count
    const serviceCount = await Service.countDocuments({ vendor: vendorId });
    
    // Get vendor's bookings count
    const bookingCount = await Booking.countDocuments({ vendor: vendorId });
    
    // Get vendor's revenue (simplified)
    const bookings = await Booking.find({ vendor: vendorId, paymentStatus: 'released' });
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    
    // Get vendor's rating (simplified) - using default values since User model doesn't have these properties
    const avgRating = 4.5;
    const reviewCount = 12;
    
    res.json({
      serviceCount,
      bookingCount,
      totalRevenue,
      avgRating,
      reviewCount
    });
  } catch (error: any) {
    console.error('Error in getVendorStats:', error);
    res.status(500).json({ message: 'Failed to load vendor stats: ' + error.message });
  }
};

// @desc    Get vendor's bookings
// @route   GET /api/vendors/bookings
// @access  Private/Vendor
export const getVendorBookings = async (req: Request, res: Response) => {
  try {
    // Validate that the user is a vendor
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Access denied. Vendor access required.' });
    }
    
    const vendorId = req.user._id;
    console.log('Vendor ID from token:', vendorId);
    
    // Check if vendor exists in database
    const vendor = await User.findById(vendorId);
    console.log('Vendor found in database:', vendor);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor account not found. Please contact support.' });
    }
    
    const { status, limit = 10 } = req.query;
    
    const filter: any = { vendor: vendorId };
    
    if (status) {
      filter.status = status;
    }
    
    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .populate('service', 'name category')
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    
    res.json(bookings);
  } catch (error: any) {
    console.error('Error in getVendorBookings:', error);
    res.status(500).json({ message: 'Failed to load vendor bookings: ' + error.message });
  }
};

// @desc    Get vendor's services with performance data
// @route   GET /api/vendors/services
// @access  Private/Vendor
export const getVendorServices = async (req: Request, res: Response) => {
  try {
    // Validate that the user is a vendor
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Access denied. Vendor access required.' });
    }
    
    const vendorId = req.user._id;
    console.log('Vendor ID from token:', vendorId);
    
    // Check if vendor exists in database
    const vendor = await User.findById(vendorId);
    console.log('Vendor found in database:', vendor);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor account not found. Please contact support.' });
    }
    
    const services = await Service.find({ vendor: vendorId })
      .populate('vendor', 'name');
    
    // Get performance summary for each service
    const servicesWithPerformance = await Promise.all(
      services.map(async (service) => {
        // Simplified performance data - in a real app, this would come from analytics
        const bookingCount = await Booking.countDocuments({ service: service._id });
        return {
          ...service.toObject(),
          performance: {
            bookingCount,
            // Rating would come from reviews in a real app
            rating: service.rating || 4.5
          }
        };
      })
    );
    
    res.json(servicesWithPerformance);
  } catch (error: any) {
    console.error('Error in getVendorServices:', error);
    res.status(500).json({ message: 'Failed to load vendor services: ' + error.message });
  }
};

// @desc    Get service performance summary
// @route   GET /api/vendors/performance
// @access  Private/Vendor
export const getServicePerformance = async (req: Request, res: Response) => {
  try {
    // Validate that the user is a vendor
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Access denied. Vendor access required.' });
    }
    
    const vendorId = req.user._id;
    console.log('Vendor ID from token:', vendorId);
    
    // Check if vendor exists in database
    const vendor = await User.findById(vendorId);
    console.log('Vendor found in database:', vendor);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor account not found. Please contact support.' });
    }
    
    const performanceSummary = await getServicePerformanceSummary(vendorId.toString());
    
    res.json(performanceSummary);
  } catch (error: any) {
    console.error('Error in getServicePerformance:', error);
    res.status(500).json({ message: 'Failed to load service performance: ' + error.message });
  }
};

// @desc    Get price optimization suggestions
// @route   GET /api/vendors/pricing/suggestions
// @access  Private/Vendor
export const getPriceOptimization = async (req: Request, res: Response) => {
  try {
    // Validate that the user is a vendor
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Access denied. Vendor access required.' });
    }
    
    const vendorId = req.user._id;
    console.log('Vendor ID from token:', vendorId);
    
    // Check if vendor exists in database
    const vendor = await User.findById(vendorId);
    console.log('Vendor found in database:', vendor);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor account not found. Please contact support.' });
    }
    
    const { category } = req.query;
    
    if (!category) {
      return res.status(400).json({ message: 'Service category is required' });
    }
    
    const suggestions = await getPriceOptimizationSuggestions(vendorId.toString(), category as string);
    
    res.json(suggestions);
  } catch (error: any) {
    console.error('Error in getPriceOptimization:', error);
    res.status(500).json({ message: 'Failed to load price optimization suggestions: ' + error.message });
  }
};

// @desc    Get vendor matchmaking suggestions
// @route   GET /api/vendors/matchmaking
// @access  Private/Vendor
export const getVendorMatchmaking = async (req: Request, res: Response) => {
  try {
    // Validate that the user is a vendor
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Access denied. Vendor access required.' });
    }
    
    const vendorId = req.user._id;
    console.log('Vendor ID from token:', vendorId);
    
    // Check if vendor exists in database
    const vendor = await User.findById(vendorId);
    console.log('Vendor found in database:', vendor);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor account not found. Please contact support.' });
    }
    
    // Use vendor's location for matchmaking (simplified)
    const location = {
      lat: 40.7128, // Default to NYC
      lng: -74.0060
    };
    
    const suggestions = await getVendorMatchmakingSuggestions(vendorId.toString(), location);
    
    res.json(suggestions);
  } catch (error: any) {
    console.error('Error in getVendorMatchmaking:', error);
    res.status(500).json({ message: 'Failed to load matchmaking suggestions: ' + error.message });
  }
};

// @desc    Get vendor by ID
// @route   GET /api/vendors/:id
// @access  Public
export const getVendorById = async (req: Request, res: Response) => {
  try {
    // Check if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      // If not a valid ObjectId, try to find by vendorId field (for mock data)
      const vendor = await User.findOne({ 
        role: 'vendor',
        vendorId: req.params.id 
      }).select('-password');
      
      if (vendor) {
        return res.json(vendor);
      }
      
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    // If it's a valid ObjectId, find by _id
    const vendor = await User.findById(req.params.id).select('-password');
    
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    res.json(vendor);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Initialize vendor account (create first service if none exists)
// @route   POST /api/vendors/init
// @access  Private/Vendor
export const initializeVendorAccount = async (req: Request, res: Response) => {
  try {
    // Validate that the user is a vendor
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Access denied. Vendor access required.' });
    }
    
    const vendorId = req.user._id;
    console.log('Vendor ID from token:', vendorId);
    
    // Check if vendor exists in database
    const vendor = await User.findById(vendorId);
    console.log('Vendor found in database:', vendor);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor account not found. Please contact support.' });
    }
    
    // Check if vendor has any services
    const serviceCount = await Service.countDocuments({ vendor: vendorId });
    
    // If no services exist, create a sample service
    if (serviceCount === 0) {
      const sampleService = new Service({
        name: 'Sample Service',
        description: 'This is a sample service to get you started. Please update with your actual service details.',
        category: 'Other',
        price: 100,
        priceType: 'per_event',
        vendor: vendorId,
        isActive: true
      });
      
      await sampleService.save();
      
      return res.json({
        message: 'Vendor account initialized successfully',
        service: sampleService
      });
    }
    
    res.json({
      message: 'Vendor account already initialized',
      serviceCount
    });
  } catch (error: any) {
    console.error('Error in initializeVendorAccount:', error);
    res.status(500).json({ message: 'Failed to initialize vendor account: ' + error.message });
  }
};

// @desc    Get all vendors (for admin use)
// @route   GET /api/vendors
// @access  Private/Admin
export const getAllVendors = async (req: Request, res: Response) => {
  try {
    // Validate that the user is an admin
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin access required.' });
    }
    
    // Get all vendors with basic information
    const vendors = await User.find({ role: 'vendor' }, 'name email phoneNumber address');
    
    res.json(vendors);
  } catch (error: any) {
    console.error('Error in getAllVendors:', error);
    res.status(500).json({ message: 'Failed to load vendors: ' + error.message });
  }
};

// @desc    Get events where vendor's services are included
// @route   GET /api/vendors/events
// @access  Private/Vendor
export const getVendorEvents = async (req: Request, res: Response) => {
  try {
    // Validate that the user is a vendor
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Access denied. Vendor access required.' });
    }
    
    const vendorId = req.user._id;
    console.log('Vendor ID from token:', vendorId);
    
    // Check if vendor exists in database
    const vendor = await User.findById(vendorId);
    console.log('Vendor found in database:', vendor);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor account not found. Please contact support.' });
    }
    
    // Find events where this vendor's services are included
    const events = await EventModel.find({ 
      'services.vendor': vendorId,
      isActive: true
    })
    .populate('createdBy', 'name')
    .populate('services.service', 'name category')
    .populate('services.vendor', 'name email phoneNumber address')
    .sort({ createdAt: -1 });
    
    res.json(events);
  } catch (error: any) {
    console.error('Error in getVendorEvents:', error);
    res.status(500).json({ message: 'Failed to load vendor events: ' + error.message });
  }
};
