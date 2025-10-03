import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  name: string;
  description: string;
  category: string;
  price: number;
  priceType: 'per_person' | 'per_event' | 'hourly' | 'package';
  vendor: mongoose.Types.ObjectId;
  images: string[];
  rating?: number;
  reviewCount?: number;
  isActive: boolean;
  location?: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Food & Beverage', 'Photography', 'Decoration', 'Audio/Visual', 'Florals', 'Planning', 'Other']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  priceType: {
    type: String,
    required: true,
    enum: ['per_person', 'per_event', 'hourly', 'package']
  },
  vendor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    type: String
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    address: String
  }
}, {
  timestamps: true
});

export default mongoose.model<IService>('Service', ServiceSchema);