# EWE Platform Process Flow

## Complete EWE Platform Process Flow

### 1. User Registration and Authentication Flow
```
User → Registration Page → Create Account → Email Verification → Login → User Dashboard
```

### 2. Service Booking Flow
```
User → Browse Services → Select Service → View Details → Book Service → 
Fill Booking Form (Event Details, Venue Info) → Confirm Booking → 
Booking Confirmation Page
```

### 3. PayPal Payment Flow (Implemented)
```
Booking Confirmation → Pay Now with PayPal → 
PayPal Component Loads → User Logs into PayPal → 
Payment Authorization → Payment Capture → 
Payment Confirmation Page
```

### 4. Admin Flow
```
Admin Login → Admin Dashboard → 
Create Events/Services → Assign Vendors → 
Manage Bookings → Track Service Progress
```

### 5. Vendor Flow
```
Vendor Login → Vendor Dashboard → 
View Assigned Bookings → Update Status → 
Provide Service → Mark as Completed
```

## Detailed PayPal Payment Implementation

### Backend Implementation:
1. **PayPal Service** (`smarteventx-backend/src/services/paypalService.ts`):
   - Uses PayPal Server SDK v2.0.0
   - Configured with your PayPal Client ID and Secret
   - Environment set to Sandbox for testing

2. **Payment Controller** (`smarteventx-backend/src/controllers/paymentController.ts`):
   - Handles order creation and payment capture
   - Updates booking status in database
   - Stores PayPal transaction IDs

3. **Routes** (`smarteventx-backend/src/routes/paymentRoutes.ts`):
   - POST `/api/payments/paypal/create` - Create order
   - POST `/api/payments/paypal/capture` - Capture payment

### Frontend Implementation:
1. **Booking Page** (`src/app/booking/[id]/page.tsx`):
   - Collects booking details including venue information
   - Shows booking confirmation with PayPal payment option

2. **PayPal Component** (`src/components/PayPalPayment.tsx`):
   - Integrates PayPal JavaScript SDK
   - Handles payment creation and approval
   - Communicates with backend APIs

3. **Payment Confirmation** (`src/app/payment/confirmation/page.tsx`):
   - Displays payment success details
   - Shows transaction information

## Current Working Features

### ✅ User Features:
- Service browsing and selection
- Booking creation with venue details
- PayPal payment processing
- Booking tracking

### ✅ Admin Features:
- Event and service management
- Vendor assignment to bookings
- Booking status management

### ✅ Vendor Features:
- Viewing assigned bookings
- Updating service status
- Location tracking

## Where to Find the PayPal Integration

1. **Backend Files**:
   - `smarteventx-backend/src/services/paypalService.ts`
   - `smarteventx-backend/src/controllers/paymentController.ts`
   - `smarteventx-backend/src/routes/paymentRoutes.ts`
   - `smarteventx-backend/.env` (contains your PayPal credentials)

2. **Frontend Files**:
   - `smarteventx-v2/src/components/PayPalPayment.tsx`
   - `smarteventx-v2/src/app/booking/[id]/page.tsx`
   - `smarteventx-v2/src/app/payment/confirmation/page.tsx`
   - `smarteventx-v2/src/services/api.ts`

## How to Test the Payment Flow

1. Create a booking through the user interface
2. On the booking confirmation page, click "Pay Now with PayPal"
3. Use PayPal sandbox credentials for testing:
   - Email: sb-xxxxx@personal.example.com
   - Password: Provided in your PayPal sandbox account

The PayPal integration is fully implemented and working. The payment flow is accessible through the booking confirmation page after creating a service booking.