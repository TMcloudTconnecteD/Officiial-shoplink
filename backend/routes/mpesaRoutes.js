import express from 'express';
import { 
  initiatePayment,
  handleCallback,
  queryPaymentStatus
} from '../controllers/mpesaController.js';
import { processPaymentFlow } from '../controllers/paymentFlowController.js';
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

// New route to process payment flow with tax deduction and payout
router.post('/process-payment-flow', authenticate, processPaymentFlow);

export default router;
