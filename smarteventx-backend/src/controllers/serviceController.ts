import { Request, Response } from 'express';
import Service, { IService } from '../models/Service';
import User from '../models/User';

// @desc    Get all services
// @route   GET /api/services
// @access  Public (but filter based on user role)
export const getServices = async (req: Request, res: Response) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;
    
    const category = req.query.category as string;
    const search = req.query.search as string;
    
    // Build filter object
    const filter: any = { isActive: true };
    
    if (category) {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' }}
      ];
    }
    
    // For all users (including vendors), show all active services
    // No need to filter by vendor since vendors should see admin services
    
    const count = await Service.countDocuments(filter);
    const services = await Service.find(filter)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .populate('vendor', 'name rating reviewCount');
    
    res.json({
      services,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = async (req: Request, res: Response) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('vendor', 'name rating reviewCount');
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json(service);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new service
// @route   POST /api/services
// @access  Private/Vendor
export const createService = async (req: Request, res: Response) => {
  try {
    const { name, description, category, price, priceType, images, location } = req.body;
    
    const service = new Service({
      name,
      description,
      category,
      price,
      priceType,
      vendor: req.user?._id,
      images,
      location
    });
    
    const createdService = await service.save();
    res.status(201).json(createdService);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Vendor
export const updateService = async (req: Request, res: Response) => {
  try {
    const { name, description, category, price, priceType, images, isActive, location } = req.body;
    
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Allow vendors to edit admin services or their own services
    const isAdminService = service.vendor === undefined || service.vendor === null; // Admin services have no vendor
    const isOwnService = service.vendor && service.vendor.toString() === req.user?._id.toString();
    
    // Check if user is authorized to update the service
    if (!isAdminService && !isOwnService) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    service.name = name || service.name;
    service.description = description || service.description;
    service.category = category || service.category;
    service.price = price || service.price;
    service.priceType = priceType || service.priceType;
    service.images = images || service.images;
    service.isActive = isActive !== undefined ? isActive : service.isActive;
    service.location = location || service.location;
    
    // If it's an admin service being edited by a vendor, assign the vendor to it
    if (isAdminService) {
      service.vendor = req.user?._id;
    }
    
    const updatedService = await service.save();
    res.json(updatedService);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Vendor
export const deleteService = async (req: Request, res: Response) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Allow deletion of admin services or own services
    const isAdminService = service.vendor === undefined || service.vendor === null; // Admin services have no vendor
    const isOwnService = service.vendor && service.vendor.toString() === req.user?._id.toString();
    
    // Check if user is authorized to delete the service
    if (!isAdminService && !isOwnService) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service removed' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get services by vendor
// @route   GET /api/services/vendor/:vendorId
// @access  Public
export const getServicesByVendor = async (req: Request, res: Response) => {
  try {
    const services = await Service.find({ 
      vendor: req.params.vendorId,
      isActive: true 
    }).populate('vendor', 'name rating reviewCount');
    
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};