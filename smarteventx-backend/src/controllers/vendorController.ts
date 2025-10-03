import { Request, Response } from 'express';
import Service from '../models/Service';
import Booking from '../models/Booking';
import User from '../models/User';
import { 
  getServicePerformanceSummary, 
  getPriceOptimizationSuggestions,
  getVendorMatchmakingSuggestions
} from '../utils/aiRecommendations';

// @desc    Get vendor dashboard statistics
// @route   GET /api/vendors/stats
// @access  Private/Vendor
export const getVendorStats = async (req: Request, res: Response) => {
  try {
    const vendorId = req.user?._id.toString() || '';
    
    // Get vendor's services count
    const serviceCount = await Service.countDocuments({ vendor: vendorId });
    
    // Get vendor's bookings count
    const bookingCount = await Booking.countDocuments({ vendor: vendorId });
    
    // Get upcoming bookings (next 30 days)
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    const upcomingBookings = await Booking.countDocuments({
      vendor: vendorId,
      eventDate: { $gte: today, $lte: thirtyDaysFromNow }
    });
    
    // Get total earnings (released payments)
    const paidBookings = await Booking.find({ 
      vendor: vendorId, 
      paymentStatus: 'released' 
    });
    
    const totalEarnings = paidBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    
    // Get pending payments
    const pendingPayments = await Booking.countDocuments({ 
      vendor: vendorId, 
      paymentStatus: 'pending' 
    });
    
    res.json({
      stats: {
        serviceCount,
        totalBookings: bookingCount,
        upcomingBookings,
        totalEarnings,
        pendingPayments
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get vendor's bookings
// @route   GET /api/vendors/bookings
// @access  Private/Vendor
export const getVendorBookings = async (req: Request, res: Response) => {
  try {
    const { status, limit = 10 } = req.query;
    
    const filter: any = { vendor: req.user?._id };
    
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
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get vendor's services with performance data
// @route   GET /api/vendors/services
// @access  Private/Vendor
export const getVendorServices = async (req: Request, res: Response) => {
  try {
    const vendorId = req.user?._id.toString() || '';
    
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
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get service performance summary
// @route   GET /api/vendors/performance
// @access  Private/Vendor
export const getServicePerformance = async (req: Request, res: Response) => {
  try {
    const vendorId = req.user?._id.toString() || '';
    
    const performanceSummary = await getServicePerformanceSummary(vendorId);
    
    res.json(performanceSummary);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get price optimization suggestions
// @route   GET /api/vendors/pricing/suggestions
// @access  Private/Vendor
export const getPriceOptimization = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const vendorId = req.user?._id.toString() || '';
    
    if (!category) {
      return res.status(400).json({ message: 'Service category is required' });
    }
    
    const suggestions = await getPriceOptimizationSuggestions(vendorId, category as string);
    
    res.json(suggestions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get vendor matchmaking suggestions
// @route   GET /api/vendors/matchmaking
// @access  Private/Vendor
export const getVendorMatchmaking = async (req: Request, res: Response) => {
  try {
    const vendorId = req.user?._id.toString() || '';
    
    // Use vendor's location for matchmaking (simplified)
    const location = {
      lat: 40.7128, // Default to NYC
      lng: -74.0060
    };
    
    const suggestions = await getVendorMatchmakingSuggestions(vendorId, location);
    
    res.json(suggestions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get vendor by ID
// @route   GET /api/vendors/:id
// @access  Public
export const getVendorById = async (req: Request, res: Response) => {
  try {
    const vendor = await User.findById(req.params.id).select('-password');
    
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    res.json(vendor);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};