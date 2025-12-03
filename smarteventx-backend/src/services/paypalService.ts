import { Client, Environment, OrdersController, CheckoutPaymentIntent } from '@paypal/paypal-server-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Create PayPal client
const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: process.env.PAYPAL_CLIENT_ID!,
    oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET!
  },
  environment: process.env.PAYPAL_ENVIRONMENT === 'live' 
    ? Environment.Production 
    : Environment.Sandbox
});

// Create orders controller
const ordersController = new OrdersController(client);

/**
 * Create a PayPal order
 * @param amount - The amount to charge
 * @param currency - The currency code (e.g., USD)
 * @param description - Description of the payment
 * @returns Promise with order details
 */
export const createPayPalOrder = async (
  amount: string, 
  currency: string, 
  description: string,
  bookingId: string
) => {
  try {
    const response = await ordersController.createOrder({
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            referenceId: bookingId,
            description: description,
            amount: {
              currencyCode: currency,
              value: amount
            }
          }
        ]
      },
      prefer: "return=representation"
    });

    return response.result;
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    throw error;
  }
};

/**
 * Capture a PayPal payment
 * @param orderId - The PayPal order ID
 * @returns Promise with capture details
 */
export const capturePayPalPayment = async (orderId: string) => {
  try {
    const response = await ordersController.captureOrder({
      id: orderId,
      prefer: "return=representation"
    });

    return response.result;
  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    throw error;
  }
};

/**
 * Get order details
 * @param orderId - The PayPal order ID
 * @returns Promise with order details
 */
export const getPayPalOrderDetails = async (orderId: string) => {
  try {
    const response = await ordersController.getOrder({
      id: orderId
    });

    return response.result;
  } catch (error) {
    console.error('Error getting PayPal order details:', error);
    throw error;
  }
};

export default {
  createPayPalOrder,
  capturePayPalPayment,
  getPayPalOrderDetails
};