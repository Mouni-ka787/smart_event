import { Request, Response } from 'express';
import VendorAssignment from '../models/VendorAssignment';
import { calculateETA, calculateDistanceHaversine } from '../utils/locationUtils';

// @desc    Get vendor's assignments
// @route   GET /api/vendors/my-assignments
// @access  Private/Vendor
export const getVendorAssignments = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Access denied. Vendor access required.' });
    }

    const assignments = await VendorAssignment.find({ 
      vendor: req.user._id,
      status: { $in: ['PENDING', 'ACCEPTED', 'EN_ROUTE'] }
    })
    .populate('booking', 'eventName eventDate')
    .populate('admin', 'name email phoneNumber')
    .populate('service', 'name category')
    .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (error: any) {
    console.error('Error in getVendorAssignments:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vendor accepts assignment
// @route   PUT /api/vendors/assignments/:assignmentId/accept
// @access  Private/Vendor
export const acceptAssignment = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Access denied. Vendor access required.' });
    }

    const { assignmentId } = req.params;

    const assignment = await VendorAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Verify vendor owns this assignment
    if (assignment.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    assignment.status = 'ACCEPTED';
    
    if (!assignment.trackingInfo) {
      assignment.trackingInfo = { updates: [] };
    }

    assignment.trackingInfo.updates.push({
      status: 'ACCEPTED',
      timestamp: new Date(),
      description: 'Vendor accepted the assignment'
    });

    await assignment.save();

    res.json({
      message: 'Assignment accepted successfully',
      assignment
    });
  } catch (error: any) {
    console.error('Error in acceptAssignment:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vendor starts delivery
// @route   POST /api/vendors/assignments/:assignmentId/start-delivery
// @access  Private/Vendor
export const startVendorDelivery = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Access denied. Vendor access required.' });
    }

    const { assignmentId } = req.params;
    const { startLocation } = req.body;

    if (!startLocation || !startLocation.lat || !startLocation.lng) {
      return res.status(400).json({ message: 'Start location is required' });
    }

    const assignment = await VendorAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Verify vendor owns this assignment
    if (assignment.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    assignment.status = 'EN_ROUTE';

    if (!assignment.trackingInfo) {
      assignment.trackingInfo = { updates: [] };
    }

    assignment.trackingInfo.currentLocation = {
      type: 'Point',
      coordinates: [startLocation.lng, startLocation.lat]
    };

    assignment.trackingInfo.updates.push({
      status: 'EN_ROUTE',
      timestamp: new Date(),
      description: 'Vendor started traveling to delivery location'
    });

    await assignment.save();

    // Emit WebSocket event for admin
    const io = req.app.get('io');
    if (io) {
      io.to(`vendor:${assignmentId}`).emit('vendor:status:update', {
        assignmentId,
        status: 'EN_ROUTE'
      });
    }

    res.json({
      message: 'Delivery started successfully',
      tracking: assignment.trackingInfo
    });
  } catch (error: any) {
    console.error('Error in startVendorDelivery:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vendor updates location
// @route   POST /api/vendors/assignments/:assignmentId/location
// @access  Private/Vendor
export const updateVendorLocation = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Access denied. Vendor access required.' });
    }

    const { assignmentId } = req.params;
    const { lat, lng, speed, bearing } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const assignment = await VendorAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Verify vendor owns this assignment
    if (assignment.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!assignment.trackingInfo) {
      assignment.trackingInfo = { updates: [] };
    }

    // Update location
    assignment.trackingInfo.currentLocation = {
      type: 'Point',
      coordinates: [lng, lat]
    };

    // Calculate ETA
    if (assignment.deliveryLocation?.coordinates) {
      const vendorCoords = { lat, lng };
      const deliveryCoords = assignment.deliveryLocation.coordinates;
      
      const etaSeconds = await calculateETA(vendorCoords, deliveryCoords, speed);
      
      assignment.trackingInfo.estimatedArrival = new Date(Date.now() + etaSeconds * 1000);
    }

    // Add update to history
    assignment.trackingInfo.updates.push({
      status: 'location_update',
      timestamp: new Date(),
      description: `Vendor location updated to ${lat}, ${lng}`
    });

    await assignment.save();

    // Emit WebSocket event for admin
    const io = req.app.get('io');
    if (io) {
      io.to(`vendor:${assignmentId}`).emit('vendor:location:update', {
        assignmentId,
        lat,
        lng,
        speed,
        bearing,
        etaSeconds: assignment.trackingInfo.estimatedArrival 
          ? Math.floor((assignment.trackingInfo.estimatedArrival.getTime() - Date.now()) / 1000)
          : null
      });
    }

    res.json({
      message: 'Location updated successfully',
      data: {
        lat,
        lng,
        etaSeconds: assignment.trackingInfo.estimatedArrival 
          ? Math.floor((assignment.trackingInfo.estimatedArrival.getTime() - Date.now()) / 1000)
          : null
      }
    });
  } catch (error: any) {
    console.error('Error in updateVendorLocation:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vendor marks arrival
// @route   POST /api/vendors/assignments/:assignmentId/mark-arrived
// @access  Private/Vendor
export const markVendorArrived = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Access denied. Vendor access required.' });
    }

    const { assignmentId } = req.params;

    const assignment = await VendorAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Verify vendor owns this assignment
    if (assignment.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    assignment.status = 'ARRIVED';

    if (!assignment.trackingInfo) {
      assignment.trackingInfo = { updates: [] };
    }

    assignment.trackingInfo.updates.push({
      status: 'ARRIVED',
      timestamp: new Date(),
      description: 'Vendor arrived at delivery location'
    });

    await assignment.save();

    // Emit WebSocket event
    const io = req.app.get('io');
    if (io) {
      io.to(`vendor:${assignmentId}`).emit('vendor:status:update', {
        assignmentId,
        status: 'ARRIVED'
      });
    }

    res.json({
      message: 'Marked as arrived successfully',
      status: 'ARRIVED'
    });
  } catch (error: any) {
    console.error('Error in markVendorArrived:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vendor completes delivery
// @route   POST /api/vendors/assignments/:assignmentId/complete
// @access  Private/Vendor
export const completeVendorDelivery = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Access denied. Vendor access required.' });
    }

    const { assignmentId } = req.params;

    const assignment = await VendorAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Verify vendor owns this assignment
    if (assignment.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    assignment.status = 'COMPLETED';

    if (!assignment.trackingInfo) {
      assignment.trackingInfo = { updates: [] };
    }

    assignment.trackingInfo.updates.push({
      status: 'COMPLETED',
      timestamp: new Date(),
      description: 'Vendor completed delivery'
    });

    await assignment.save();

    // Emit WebSocket event
    const io = req.app.get('io');
    if (io) {
      io.to(`vendor:${assignmentId}`).emit('vendor:status:update', {
        assignmentId,
        status: 'COMPLETED'
      });
    }

    res.json({
      message: 'Delivery completed successfully',
      status: 'COMPLETED'
    });
  } catch (error: any) {
    console.error('Error in completeVendorDelivery:', error);
    res.status(500).json({ message: error.message });
  }
};
