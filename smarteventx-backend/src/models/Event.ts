import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  name: string;
  description: string;
  category: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  };
  phoneNumber: string;
  email: string;
  photos: string[];
  services: {
    service: mongoose.Types.ObjectId;
    vendor?: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity?: number;
    vendorName?: string;
    vendorEmail?: string;
    vendorPhone?: string;
    vendorAddress?: string;
    isVendorService: boolean;
  }[];
  totalPrice: number;
  createdBy: mongoose.Types.ObjectId; // Admin who created the event
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema = new Schema({
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
    enum: ['Wedding', 'Corporate', 'Birthday', 'Conference', 'Concert', 'Other']
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
  },
  phoneNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  photos: [{
    type: String
  }],
  services: [{
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: false
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      default: 1
    },
    vendorName: {
      type: String,
      required: false
    },
    vendorEmail: {
      type: String,
      required: false
    },
    vendorPhone: {
      type: String,
      required: false
    },
    vendorAddress: {
      type: String,
      required: false
    },
    isVendorService: {
      type: Boolean,
      default: false
    }
  }],
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IEvent>('Event', EventSchema);