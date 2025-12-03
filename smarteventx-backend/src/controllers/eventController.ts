import { Request, Response } from 'express';
import Event, { IEvent } from '../models/Event';
import Service, { IService } from '../models/Service';
import User, { IUser } from '../models/User';
import mongoose from 'mongoose';

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Admin or Vendor
export const createEvent = async (req: Request, res: Response) => {
  try {
    console.log('=== CREATE EVENT DEBUG INFO ===');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    console.log('User:', req.user);
    console.log('Content-Type header:', req.headers['content-type']);
    console.log('Has body:', !!req.body);
    console.log('Body type:', typeof req.body);
    console.log('==============================');
    
    // Check if body exists
    if (!req.body) {
      return res.status(400).json({ message: 'Request body is missing' });
    }
    
    // If body is empty object
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Request body is empty' });
    }
    
    const { name, description, category, location, phoneNumber, email, photos, services } = req.body;
    
    // Validate required fields
    if (!name || !description || !category) {
      return res.status(400).json({ message: 'Name, description, and category are required' });
    }
    
    // Calculate total price
    let totalPrice = 0;
    const serviceDetails: any[] = [];
    
    // Validate services and calculate total price
    if (services && Array.isArray(services)) {
      for (const serviceItem of services) {
        // If it's a vendor service
        if (serviceItem.isVendorService && serviceItem.service) {
          const service: any = await Service.findById(serviceItem.service).populate('vendor');
          if (!service) {
            return res.status(404).json({ message: `Service with ID ${serviceItem.service} not found` });
          }
          
          const vendor: any = service.vendor;
          if (!vendor) {
            return res.status(404).json({ message: `Vendor for service ${serviceItem.service} not found` });
          }
          
          const serviceTotal = service.price * (serviceItem.quantity || 1);
          totalPrice += serviceTotal;
          
          serviceDetails.push({
            service: service._id,
            vendor: vendor._id,
            name: service.name,
            price: service.price,
            quantity: serviceItem.quantity || 1,
            vendorName: vendor.name,
            vendorEmail: vendor.email,
            vendorPhone: vendor.phoneNumber,
            vendorAddress: vendor.address,
            isVendorService: true
          });
        } else {
          // Custom service (not from vendor)
          const serviceTotal = parseFloat(serviceItem.price) * (serviceItem.quantity || 1);
          totalPrice += serviceTotal;
          
          serviceDetails.push({
            service: null,
            name: serviceItem.name,
            price: parseFloat(serviceItem.price),
            quantity: serviceItem.quantity || 1,
            isVendorService: false
          });
        }
      }
    }
    
    const event = new Event({
      name,
      description,
      category,
      location: {
        type: 'Point',
        coordinates: location?.coordinates || [0, 0],
        address: location?.address || ''
      },
      phoneNumber,
      email,
      photos: photos || [],
      services: serviceDetails,
      totalPrice,
      createdBy: new mongoose.Types.ObjectId(req.user?._id)
    });
    
    const createdEvent = await event.save();
    
    // Populate the event with service and vendor details
    const populatedEvent = await Event.findById(createdEvent._id)
      .populate('createdBy', 'name')
      .populate('services.service', 'name category')
      .populate('services.vendor', 'name email phoneNumber address');
    
    res.status(201).json(populatedEvent);
  } catch (error: any) {
    console.error('Error creating event:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getEvents = async (req: Request, res: Response) => {
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
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const count = await Event.countDocuments(filter);
    const events = await Event.find(filter)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .populate('createdBy', 'name')
      .populate('services.service', 'name category')
      .populate('services.vendor', 'name email phoneNumber address')
      .sort({ createdAt: -1 });
    
    res.json({
      events,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get admin-created events
// @route   GET /api/events/admin
// @access  Private/Admin
export const getAdminEvents = async (req: Request, res: Response) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;
    
    // Build filter object for admin-created events
    const filter: any = { 
      isActive: true,
      createdBy: req.user?._id // Events created by the current admin
    };
    
    const count = await Event.countDocuments(filter);
    const events = await Event.find(filter)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .populate('createdBy', 'name')
      .populate('services.service', 'name category')
      .populate('services.vendor', 'name email phoneNumber address')
      .sort({ createdAt: -1 });
    
    res.json({
      events,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public
export const getEventById = async (req: Request, res: Response) => {
  try {
    console.log('Backend - Fetching event with ID:', req.params.id);
    
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('services.service', 'name category')
      .populate('services.vendor', 'name email phoneNumber address');
    
    console.log('Backend - Found event:', event);
    
    if (!event) {
      console.log('Backend - Event not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error: any) {
    console.error('Backend - Error fetching event:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin or Event Creator
export const updateEvent = async (req: Request, res: Response) => {
  try {
    console.log('Update request body:', req.body);
    console.log('Update request headers:', req.headers);
    
    // Check if body exists
    if (!req.body) {
      return res.status(400).json({ message: 'Request body is missing' });
    }
    
    const { name, description, category, location, phoneNumber, email, photos, services, isActive } = req.body;
    
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is admin or the creator of the event
    if (req.user?.role !== 'admin' && req.user?._id.toString() !== event.createdBy.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Calculate total price if services are updated
    let totalPrice = event.totalPrice;
    if (services && Array.isArray(services)) {
      totalPrice = 0;
      const serviceDetails: any[] = [];
      
      // Validate services and calculate total price
      for (const serviceItem of services) {
        // If it's a vendor service
        if (serviceItem.isVendorService && serviceItem.service) {
          const service: any = await Service.findById(serviceItem.service).populate('vendor');
          if (!service) {
            return res.status(404).json({ message: `Service with ID ${serviceItem.service} not found` });
          }
          
          const vendor: any = service.vendor;
          if (!vendor) {
            return res.status(404).json({ message: `Vendor for service ${serviceItem.service} not found` });
          }
          
          const serviceTotal = service.price * (serviceItem.quantity || 1);
          totalPrice += serviceTotal;
          
          serviceDetails.push({
            service: service._id,
            vendor: vendor._id,
            name: service.name,
            price: service.price,
            quantity: serviceItem.quantity || 1,
            vendorName: vendor.name,
            vendorEmail: vendor.email,
            vendorPhone: vendor.phoneNumber,
            vendorAddress: vendor.address,
            isVendorService: true
          });
        } else {
          // Custom service (not from vendor)
          const serviceTotal = parseFloat(serviceItem.price) * (serviceItem.quantity || 1);
          totalPrice += serviceTotal;
          
          serviceDetails.push({
            service: null,
            name: serviceItem.name,
            price: parseFloat(serviceItem.price),
            quantity: serviceItem.quantity || 1,
            isVendorService: false
          });
        }
      }
      
      event.services = serviceDetails;
    }
    
    event.name = name || event.name;
    event.description = description || event.description;
    event.category = category || event.category;
    event.location = location ? {
      type: 'Point',
      coordinates: location.coordinates || event.location.coordinates,
      address: location.address || event.location.address
    } : event.location;
    event.phoneNumber = phoneNumber || event.phoneNumber;
    event.email = email || event.email;
    event.photos = photos || event.photos;
    event.totalPrice = totalPrice;
    event.isActive = isActive !== undefined ? isActive : event.isActive;
    
    const updatedEvent = await event.save();
    
    // Populate the event with service and vendor details
    const populatedEvent = await Event.findById(updatedEvent._id)
      .populate('createdBy', 'name')
      .populate('services.service', 'name category')
      .populate('services.vendor', 'name email phoneNumber address');
    
    res.json(populatedEvent);
  } catch (error: any) {
    console.error('Error updating event:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin or Event Creator
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is admin or the creator of the event
    if (req.user?.role !== 'admin' && req.user?._id.toString() !== event.createdBy.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event removed' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};