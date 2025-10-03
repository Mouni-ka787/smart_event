import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import Service, { IService } from '../models/Service';
import Booking from '../models/Booking';
import { 
  getTopPerformingVendors, 
  getBundleSuggestions, 
  getWeakServiceAlerts,
  getTrendingServices
} from '../utils/aiRecommendations';

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
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    
    // Get pending payments
    const pendingPayments = await Booking.countDocuments({ paymentStatus: 'pending' });
    
    res.json({
      stats: {
        totalBookings: bookingCount,
        totalRevenue,
        activeVendors: vendorCount,
        pendingPayments
      },
      recentBookings,
      userCount,
      serviceCount
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get admin analytics data
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAdminAnalytics = async (req: Request, res: Response) => {
  try {
    // Get service analytics by category
    const serviceAnalytics = await Service.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      }
    ]);
    
    // Get booking trends (simplified - last 30 days)
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
    
    // Get vendor details
    const vendorIds = topVendors.map(vendor => vendor.vendorId);
    const vendorDetails = await User.find({ _id: { $in: vendorIds } });
    
    // Combine performance data with vendor details
    const vendorsWithDetails = topVendors.map(vendor => {
      const details = vendorDetails.find(v => (v._id as unknown as string).toString() === vendor.vendorId);
      return {
        ...vendor,
        name: details?.name || 'Unknown Vendor',
        email: details?.email || 'N/A'
      };
    });
    
    res.json(vendorsWithDetails);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get AI-powered bundle suggestions
// @route   GET /api/admin/bundles/suggestions
// @access  Private/Admin
export const getBundleSuggestionsForAdmin = async (req: Request, res: Response) => {
  try {
    // Get booking trends for bundle analysis
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const bookingTrends = await Booking.find({
      createdAt: { $gte: thirtyDaysAgo }
    }).populate('service', 'category');
    
    const suggestions = await getBundleSuggestions(bookingTrends);
    res.json(suggestions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get weak service alerts
// @route   GET /api/admin/services/alerts
// @access  Private/Admin
export const getWeakServiceAlertsForAdmin = async (req: Request, res: Response) => {
  try {
    const alerts = await getWeakServiceAlerts();
    
    // Get service details for alerts
    const serviceIds = alerts.map(alert => alert.serviceId);
    const services = await Service.find({ _id: { $in: serviceIds } });
    
    // Combine alerts with service details
    const alertsDetails = alerts.map(alert => {
      const service = services.find(s => (s._id as unknown as string).toString() === alert.serviceId);
      return {
        ...alert,
        serviceName: service?.name || alert.serviceName,
        vendorId: service?.vendor || null
      };
    });
    
    res.json(alertsDetails);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get trending services
// @route   GET /api/admin/services/trending
// @access  Private/Admin
export const getTrendingServicesForAdmin = async (req: Request, res: Response) => {
  try {
    const trending = await getTrendingServices(10);
    res.json(trending);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};