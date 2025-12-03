import mongoose, { Document, Schema } from 'mongoose';

export interface IVendorAssignment extends Document {
  booking: mongoose.Types.ObjectId;
  admin: mongoose.Types.ObjectId;
  vendor: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
  status: 'PENDING' | 'ACCEPTED' | 'EN_ROUTE' | 'ARRIVED' | 'COMPLETED' | 'CANCELLED';
  
  // Where vendor needs to deliver (event venue)
  deliveryLocation: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  
  // Vendor's current tracking info (only admin sees this)
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

const VendorAssignmentSchema: Schema = new Schema({
  booking: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING'
  },
  deliveryLocation: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    }
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

export default mongoose.model<IVendorAssignment>('VendorAssignment', VendorAssignmentSchema);
