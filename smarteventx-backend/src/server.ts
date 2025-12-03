import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import serviceRoutes from './routes/serviceRoutes';
import eventRoutes from './routes/eventRoutes';
import eventBookingRoutes from './routes/eventBookingRoutes';
import serviceBookingRoutes from './routes/serviceBookingRoutes'; // Add this line
import bookingRoutes from './routes/bookingRoutes';
import vendorRoutes from './routes/vendorRoutes';
import adminRoutes from './routes/adminRoutes';
import aiRoutes from './routes/aiRoutes';
import locationRoutes from './routes/locationRoutes';
import paymentRoutes from './routes/paymentRoutes';

dotenv.config();

const app: express.Application = express();
const PORT: number = parseInt(process.env.PORT || '5000');

// Middleware
app.use(cors({
  origin: '*', // Allow requests from any origin for development
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); // Increase body size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// Add request logging
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Content-Type:', req.headers['content-type']);
  next();
});

// Database connection
mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/smarteventx')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Test endpoint
app.get('/test', (req: express.Request, res: express.Response) => {
  res.status(200).json({ message: 'Test endpoint working' });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/events', eventRoutes);
// Specific booking routes first, then general ones to avoid conflicts
app.use('/api/bookings/event', eventBookingRoutes);  // Event booking routes (with /event endpoint)
app.use('/api/bookings/service', serviceBookingRoutes); // Service booking routes (with /service endpoint)
app.use('/api/bookings', bookingRoutes);        // Legacy booking routes
app.use('/api/vendors', vendorRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint for quick connectivity tests
console.log('Registering health endpoint');
app.get('/health', (req: express.Request, res: express.Response) => {
  console.log(`${new Date().toISOString()} - /health requested from ${req.ip}`);
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});
console.log('Health endpoint registered');

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;