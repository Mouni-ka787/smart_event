"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { bookingsAPI } from '@/services/api';

declare global {
  interface Window {
    paypal?: any;
  }
}

interface PayPalPaymentProps {
  token: string;
  bookingId: string;
  amount: number;
  onSuccess: (bookingId: string) => void;
  onCancel: () => void;
}

export default function PayPalPayment({ 
  token, 
  bookingId, 
  amount,
  onSuccess,
  onCancel
}: PayPalPaymentProps) {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  // Load PayPal SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=Ad9EfEmQmcQNylC92ZNa6yRB6BIIyKZjMyz62rgQgYvG2GvUMLOZdN5QVPRmuKE4QzD9N3oM_zftBxLU&currency=USD';
    script.async = true;
    
    script.onload = () => {
      if (window.paypal) {
        renderPayPalButtons();
      }
    };
    
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const renderPayPalButtons = () => {
    if (window.paypal && document.getElementById('paypal-button-container')) {
      window.paypal.Buttons({
        createOrder: async (data: any, actions: any) => {
          try {
            setLoading(true);
            setError(null);
            
            // Create order on our server
            const response = await bookingsAPI.createPayPalOrder(token, bookingId);
            setOrderId(response.orderId);
            return response.orderId;
          } catch (err: any) {
            setError(err.message || 'Failed to create PayPal order');
            throw err;
          } finally {
            setLoading(false);
          }
        },
        
        onApprove: async (data: any, actions: any) => {
          try {
            setLoading(true);
            setError(null);
            
            // Capture payment on our server
            const response = await bookingsAPI.capturePayPalPayment(token, data.orderID);
            
            // Call success callback
            onSuccess(bookingId);
          } catch (err: any) {
            setError(err.message || 'Failed to capture payment');
          } finally {
            setLoading(false);
          }
        },
        
        onError: (err: any) => {
          console.error('PayPal Checkout onError', err);
          setError('An error occurred during the payment process');
        },
        
        onCancel: () => {
          onCancel();
        }
      }).render('#paypal-button-container');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Pay with PayPal</h2>
      
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Payment Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-4">
        <p className="text-gray-600">Amount to pay:</p>
        <p className="text-2xl font-bold text-gray-900">${amount.toFixed(2)}</p>
      </div>
      
      <div id="paypal-button-container" className="mt-4"></div>
      
      {loading && (
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-500">
        <p>By proceeding with the payment, you agree to PayPal's terms and conditions.</p>
      </div>
    </div>
  );
}