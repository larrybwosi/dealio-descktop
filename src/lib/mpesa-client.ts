import { Message } from 'ably';
import api from './axios';
import { ably } from './ably';

interface InitiateMpesaPaymentParams {
  phoneNumber: string;
  amount: number;
  orderId: string;
}

interface MpesaResponse {
  success: boolean;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  customerMessage?: string;
  message?: string;
}

/**
 * Subscribes to an Ably channel to listen for M-Pesa payment status updates.
 * @param checkoutRequestId The unique ID for the checkout request to listen for.
 * @param callbacks Object with onSuccess and onFailed callback functions.
 * @returns A function to unsubscribe and clean up the listener.
 */
export function subscribeToAbly(
  checkoutRequestId: string,
  callbacks: {
    onSuccess?: () => void;
    onFailed?: (message: string) => void;
  }
) {
  // Get the Ably channel for M-Pesa payments
  const channel = ably.channels.get('mpesa-payments');

  // Define the subscription callback
  const subscriptionCallback = (message: Message) => {
    const data = message.data; // The data payload from the server

    // Check if the message is for the current transaction
    if (data.checkoutRequestId === checkoutRequestId) {
      if (data.status === 'SUCCESS' && callbacks.onSuccess) {
        callbacks.onSuccess();
      } else if (data.status === 'FAILED' && callbacks.onFailed) {
        // Use the customer message or the more technical response description as a fallback
        callbacks.onFailed(data.customerMessage || data.responseDescription);
      }
    }
  };

  // Subscribe to the 'payment-status' event
  channel.subscribe('payment-status', subscriptionCallback);

  // Return a cleanup function to be called when the component unmounts
  return () => {
    channel.unsubscribe('payment-status', subscriptionCallback);
  };
}

/**
 * Initiates an M-Pesa STK push payment request to your backend.
 * This function does not change as it only communicates with your API.
 */
export async function initiateMpesaPayment({
  phoneNumber,
  amount,
  orderId,
}: InitiateMpesaPaymentParams): Promise<MpesaResponse> {
  try {
    const response = await api.post('/api/mpesa/initiate', {
        phoneNumber,
        amount,
        saleNumber: orderId,
    });

    const data = await response.data;
 
    if (!response.data) {
      throw new Error(data.message || 'Failed to initiate payment');
    }

    return data;
  } catch (error) {
    console.error('Error initiating M-Pesa payment:', error);
    throw error;
  }
}
