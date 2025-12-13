# EWE - Complete Event Management Platform

EWE is a comprehensive event management platform that connects users with service providers for all their event planning needs. The platform features multi-role dashboards, AI-powered recommendations, QR-based secure payments, and real-time location tracking.

## Features

### User Features
- Browse and search for event services
- Personalized AI recommendations
- Book services with secure payments
- Real-time location tracking
- QR code-based payment verification
- Booking history and management

### Vendor Features
- Service listing and management
- Booking management dashboard
- Performance analytics
- AI-powered pricing suggestions
- Customer matchmaking
- Revenue tracking

### Admin Features
- Platform-wide analytics
- Vendor performance monitoring
- Service quality management
- Bundle creation and management
- Trending service identification
- Weak service alerts

## Technology Stack

### Frontend (smarteventx-v2)
- **Next.js 13** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React** for UI components
- Responsive design for all devices

### Backend (smarteventx-backend)
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **RESTful API** architecture
- Integration with AI services (OpenAI, AWS Personalize, Google Recommendations AI)

## Project Structure

```
ewe/
├── ewe-frontend/          # Frontend application
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service layer
│   │   └── types/           # TypeScript type definitions
│   └── public/              # Static assets
│
├── ewe-backend/     # Backend API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Authentication and validation
│   │   ├── models/          # Database models
│   │   ├── routes/          # API route definitions
│   │   ├── utils/           # Utility functions
│   │   └── server.ts        # Main server file
│   ├── .env                 # Environment variables
│   └── package.json         # Dependencies
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ewe
   ```

2. **Frontend Setup:**
   ```bash
   cd ewe-frontend
   npm install
   ```

3. **Backend Setup:**
   ```bash
   cd ../ewe-backend
   npm install
   ```

4. **Environment Configuration:**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

### Running the Application

1. **Start the Backend:**
   ```bash
   cd ewe-backend
   npm run dev
   ```

2. **Start the Frontend:**
   ```bash
   cd ../ewe-frontend
   npm run dev
   ```

3. **Access the Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Documentation

The backend provides a comprehensive RESTful API with the following main endpoints:

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `GET /api/services/vendor/:vendorId` - Get services by vendor
- `POST /api/services` - Create new service (Vendor)
- `PUT /api/services/:id` - Update service (Vendor)
- `DELETE /api/services/:id` - Delete service (Vendor)

### Bookings
- `POST /api/bookings` - Create booking (User)
- `GET /api/bookings/user` - Get user bookings (User)
- `GET /api/bookings/vendor` - Get vendor bookings (Vendor)
- `GET /api/bookings/:id` - Get booking by ID
- `PUT /api/bookings/:id/status` - Update booking status
- `PUT /api/bookings/:id/tracking` - Update tracking info (Vendor)
- `PUT /api/bookings/:id/release-payment` - Release payment (Admin)

### AI Recommendations
- `GET /api/ai/recommendations/personalized` - Personalized recommendations (User)
- `GET /api/ai/recommendations/history` - History-based recommendations (User)
- `GET /api/ai/recommendations/trending` - Trending services (Admin)
- `GET /api/ai/pricing/suggestions` - Price suggestions (Vendor)

### Admin Dashboard
- `GET /api/admin/stats` - Admin statistics
- `GET /api/admin/analytics` - Admin analytics
- `GET /api/admin/vendors/top` - Top vendors
- `GET /api/admin/bundles/suggestions` - Bundle suggestions
- `GET /api/admin/services/alerts` - Service alerts
- `GET /api/admin/services/trending` - Trending services

### Vendor Dashboard
- `GET /api/vendors/stats` - Vendor statistics
- `GET /api/vendors/bookings` - Vendor bookings
- `GET /api/vendors/services` - Vendor services
- `GET /api/vendors/performance` - Service performance
- `GET /api/vendors/pricing/suggestions` - Price suggestions
- `GET /api/vendors/matchmaking` - Vendor matchmaking

## AI Integration

EWE supports integration with leading AI services:

- **OpenAI GPT Models** for natural language processing and recommendations
- **AWS Personalize** for personalized user experiences
- **Google Recommendations AI** for scalable recommendation systems

For detailed AI integration instructions, see [AI_INTEGRATION.md](ewe-backend/AI_INTEGRATION.md)

## Deployment

### Frontend Deployment
The frontend can be deployed to any static hosting service:
```bash
cd ewe-frontend
npm run build
```

### Backend Deployment
The backend can be deployed to any Node.js hosting service:
```bash
cd ewe-backend
npm run build
npm start
```

## Testing

Run the AI integration tests:
```bash
cd ewe-backend
npm run test:ai
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on the GitHub repository or contact the development team.


Overview Flow

User books a service (existing flow).

Backend creates a Booking record → status = "pending".

Backend generates a QR code (linked to booking ID).

QR code is shown in user dashboard → “Awaiting vendor confirmation.”

Vendor scans QR upon arrival (using their dashboard camera).

Scan verifies booking → triggers payment process.

After payment success → booking status = "active" → live location tracking starts.

When service completes → vendor clicks “Complete” → status = "finished".