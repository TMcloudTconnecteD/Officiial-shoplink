import express from 'express';
import { 
  initiatePayment,
  handleCallback,
  queryPaymentStatus
} from '../controllers/mpesaController.js';
import { authenticate } from '../middlewares/authMiddlewares.js';

const router = express.Router();

// Initiate STK push payment
router.post('/initiate', authenticate, async (req, res) => {
  try {
    const { phoneNumber, amount, orderId } = req.body;

    if (!phoneNumber || !amount || !orderId) {
      return res.status(400).json({ 
        success: false,
        message: 'Phone number, amount, and order ID are required' 
      });
    }

    // Format phone number to 254 format
    const formattedPhone = phoneNumber.startsWith('0')
      ? `254${phoneNumber.slice(1)}`
      : phoneNumber.replace('+', '');
    // Guard: ensure order exists and is not already paid, and amount matches
    try {
      const Order = (await import('../models/orderModel.js')).default;
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      if (order.isPaid) {
        return res.status(400).json({ success: false, message: 'Order already paid' });
      }
      // Optional: ensure requested amount matches order totalPrice to avoid wrong charges
      // Allow small rounding differences (e.g., 0.01) to prevent false mismatches
      const requested = Number(amount);
      const expected = Number(order.totalPrice);
      if (Number.isFinite(requested) && Number.isFinite(expected)) {
        const diff = Math.abs(requested - expected);
        if (diff > 0.05) { // tolerate small discrepancies
          console.debug(`Payment amount mismatch: requested=${requested}, expected=${expected}, diff=${diff}`);
          return res.status(400).json({ success: false, message: 'Payment amount does not match order total' });
        }
      } else {
        console.debug('Invalid numeric values for amount or order.totalPrice', { amount, orderTotal: order.totalPrice });
        return res.status(400).json({ success: false, message: 'Invalid payment amount' });
      }
    } catch (e) {
      console.warn('Order guard check failed:', e.message);
      return res.status(500).json({ success: false, message: 'Failed to verify order before payment' });
    }

    const result = await initiatePayment(formattedPhone, amount, orderId);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// M-Pesa callback URL
router.post('/callback', async (req, res) => {
  try {
    const result = await handleCallback(req.body);
    
    if (result.success) {
      // Here you would typically update your database with the payment details
      console.log('Payment successful:', result.data);
      res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
    } else {
      console.log('Payment failed:', result.error);
      res.status(200).json({ ResultCode: 1, ResultDesc: result.error });
    }
  } catch (error) {
    console.error('Callback processing error:', error);
    res.status(200).json({ ResultCode: 1, ResultDesc: 'Error processing callback' });
  }
});

// Query payment status
router.get('/status/:checkoutRequestId', authenticate, async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;
    const result = await queryPaymentStatus(checkoutRequestId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Status query error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

export default router;
