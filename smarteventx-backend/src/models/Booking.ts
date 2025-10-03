import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
  vendor: mongoose.Types.ObjectId;
  eventName: string;
  eventDate: Date;
  guestCount: number;
  specialRequests?: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'released' | 'refunded';
  qrCode?: string;
  trackingInfo?: {
    currentLocation?: {
      type: 'Point';
      coordinates: [number, number];
    };
    estimatedArrival?: Date;
    updates: {
      status: string;
      timestamp: Date;
      description: string;
    }[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  vendor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventName: {
    type: String,
    required: true,
    trim: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  guestCount: {
    type: Number,
    required: true,
    min: 1
  },
  specialRequests: {
    type: String
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'released', 'refunded'],
    default: 'pending'
  },
  qrCode: {
    type: String
  },
  trackingInfo: {
    currentLocation: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number],
        index: '2dsphere'
      }
    },
    estimatedArrival: {
      type: Date
    },
    updates: [{
      status: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      description: String
    }]
  }
}, {
  timestamps: true
});

export default mongoose.model<IBooking>('Booking', BookingSchema);