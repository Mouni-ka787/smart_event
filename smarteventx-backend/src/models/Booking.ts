import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  user?: mongoose.Types.ObjectId | string;
  event?: mongoose.Types.ObjectId | string;
  admin?: mongoose.Types.ObjectId | string;
  service?: mongoose.Types.ObjectId | string;
  vendor?: mongoose.Types.ObjectId | string;
  serviceId?: string;
  serviceName?: string;
  eventName?: string;
  eventDate?: Date;
  guestCount?: number;
  specialRequests?: string;
  totalPrice?: number;
  status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus?: 'pending' | 'paid' | 'released' | 'refunded';
  qrCode?: string;
  qrData?: string;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  venueLocation?: {
    address?: string;
    coordinates?: { lat: number; lng: number } | any;
  };
  adminTrackingInfo?: any;
  vendorTrackingInfo?: any;
  debugMarker?: string;
}

const bookingSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  event: { type: Schema.Types.ObjectId, ref: 'Event' },
  admin: { type: Schema.Types.ObjectId, ref: 'User' },
  service: { type: Schema.Types.ObjectId, ref: 'Service' },
  vendor: { type: Schema.Types.ObjectId, ref: 'User' }, // Changed from 'Vendor' to 'User'
  serviceId: { type: String },
  serviceName: { type: String },
  eventName: { type: String },
  eventDate: { type: Date },
  guestCount: { type: Number, default: 1 },
  specialRequests: { type: String },
  totalPrice: { type: Number, default: 0 },
  status: { type: String, enum: ['pending','confirmed','in_progress','completed','cancelled','refunded'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending','paid','released','refunded'], default: 'pending' },
  qrCode: { type: String },
  qrData: { type: String },
  paypalOrderId: { type: String },
  paypalCaptureId: { type: String },
  venueLocation: {
    address: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  adminTrackingInfo: { type: Schema.Types.Mixed },
  vendorTrackingInfo: { type: Schema.Types.Mixed },
  debugMarker: { type: String, index: true }
}, { timestamps: true });

export default mongoose.model<IBooking>('Booking', bookingSchema);