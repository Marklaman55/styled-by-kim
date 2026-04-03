import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import moment from 'moment';
import nodemailer from 'nodemailer';
import cron from 'node-cron';
import { sendWhatsAppMessage } from './src/services/whatsappCloudService.js';

import { upload, configureCloudinary } from './src/config/cloudinary.js';
import { connectDB } from './src/config/db.js';
import { User, Booking, Review, Service, SystemConfig, MpesaTransaction, Category } from './src/models.js';
import { encrypt, decrypt } from './src/utils/crypto.js';

const __dirname = path.resolve();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Connect to Database first
  await connectDB();

  // Ensure SystemConfig exists
  const existingConfig = await SystemConfig.findOne();
  if (existingConfig) {
    configureCloudinary({
      cloud_name: decrypt(existingConfig.cloudinaryCloudName),
      api_key: decrypt(existingConfig.cloudinaryApiKey),
      api_secret: decrypt(existingConfig.cloudinaryApiSecret)
    });
  } else {
    const backendUrl = process.env.BACKEND_URL || '';
    const mpesaCallback = backendUrl ? `${backendUrl}/api/mpesa/callback` : (process.env.MPESA_CALLBACK_URL || '');
    
    await SystemConfig.create({
      whatsappToken: encrypt(process.env.WHATSAPP_TOKEN || ''),
      whatsappPhoneNumberId: encrypt(process.env.WHATSAPP_PHONE_NUMBER_ID || ''),
      adminWhatsApp: process.env.ADMIN_WHATSAPP || '',
      mongoURI: encrypt(process.env.MONGODB_URI || ''),
      mpesaConsumerKey: encrypt(process.env.MPESA_CONSUMER_KEY || ''),
      mpesaConsumerSecret: encrypt(process.env.MPESA_CONSUMER_SECRET || ''),
      mpesaShortcode: process.env.MPESA_SHORTCODE || '',
      mpesaPasskey: encrypt(process.env.MPESA_PASSKEY || ''),
      mpesaCallbackURL: encrypt(mpesaCallback),
      cloudinaryCloudName: encrypt(process.env.CLOUDINARY_CLOUD_NAME || ''),
      cloudinaryApiKey: encrypt(process.env.CLOUDINARY_API_KEY || ''),
      cloudinaryApiSecret: encrypt(process.env.CLOUDINARY_API_SECRET || '')
    });
    console.log('Default SystemConfig created');
  }

  // Validate WhatsApp Variables
  if (!process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    console.warn('WARNING: WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID is missing. WhatsApp notifications will fail.');
  }

  // Debug Logging
  console.log("WHATSAPP TOKEN:", process.env.WHATSAPP_TOKEN ? "Loaded" : "Missing");
  console.log("PHONE ID:", process.env.WHATSAPP_PHONE_NUMBER_ID);

  const normalizePhone = (phone: string) => {
    let p = phone.replace(/\D/g, '');
    if (p.startsWith('254')) return p;
    if (p.startsWith('0')) return '254' + p.slice(1);
    if (p.length === 9) return '254' + p;
    throw new Error('Invalid phone number format. Use 07XXXXXXXX or 01XXXXXXXX');
  };

  const sendWhatsApp = async (to: string, message: string) => {
    let formatted;
    try {
      formatted = normalizePhone(to);
    } catch (e) {
      formatted = to; // Fallback if normalization fails for some reason
    }
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        console.log(`📲 Sending WhatsApp Cloud to: ${formatted} (Attempt ${attempt + 1})`);
        
        await axios.post(
          `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
          {
            messaging_product: "whatsapp",
            to: formatted,
            type: "text",
            text: { body: message }
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
              "Content-Type": "application/json"
            }
          }
        );
        console.log(`✅ WhatsApp sent successfully to ${formatted}`);
        return;
      } catch (err: any) {
        attempt++;
        console.error(`❌ WhatsApp attempt ${attempt} failed for ${formatted}:`, err.response?.data || err.message);
        if (attempt < maxRetries) {
          console.log(`⏳ Retrying in 2 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.error(`🚫 All ${maxRetries} WhatsApp attempts failed for ${formatted}`);
        }
      }
    }
  };

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Health Check
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'alive', time: new Date() });
  });

  // Anti-Sleep System (Self-Ping)
  const backendUrl = process.env.BACKEND_URL;
  if (backendUrl) {
    console.log(`🚀 Keep-alive cron started for: ${backendUrl}`);
    cron.schedule('*/5 * * * *', async () => {
      try {
        await axios.get(`${backendUrl}/api/health`);
        console.log(`💓 Keep-alive ping successful: ${new Date().toISOString()}`);
      } catch (err: any) {
        console.error(`💔 Keep-alive ping failed: ${err.message}`);
      }
    });
  } else {
    console.warn('⚠️ BACKEND_URL not set. Keep-alive cron disabled.');
  }

  // Global Request Logging (Debugging)
  app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`, req.body);
    next();
  });

  const JWT_SECRET = process.env.JWT_SECRET || 'katiani-styles-secret-key';

  // --- EMAIL HELPER ---
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const sendEmail = async (to: string, subject: string, text: string) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`MOCK EMAIL to ${to}: ${subject} - ${text}`);
      return;
    }
    try {
      await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
    } catch (err) {
      console.error('Email send failed:', err);
    }
  };

  // --- M-PESA HELPERS ---
  const getMpesaAccessToken = async (providedConsumerKey?: string, providedConsumerSecret?: string) => {
    try {
      console.log("🔐 Requesting M-Pesa Access Token...");

      const config = await SystemConfig.findOne();
      const consumerKey = providedConsumerKey || decrypt(config?.mpesaConsumerKey) || process.env.MPESA_CONSUMER_KEY;
      const consumerSecret = providedConsumerSecret || decrypt(config?.mpesaConsumerSecret) || process.env.MPESA_CONSUMER_SECRET;

      console.log("🔐 Using Consumer Key:", consumerKey ? "YES" : "NO");
      console.log("🔐 Using Consumer Secret:", consumerSecret ? "YES" : "NO");

      if (!consumerKey || !consumerSecret) {
        throw new Error('Missing M-Pesa consumer credentials');
      }

      const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

      const response = await axios.get(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`
          },
          timeout: 15000
        }
      );

      console.log("✅ M-Pesa Token Received");
      return response.data.access_token;

    } catch (error: any) {
      console.error("❌ TOKEN ERROR FULL:", error.response?.data || error.message);
      throw new Error("Failed to get M-Pesa access token");
    }
  };

  // Network Debug Test Route
  app.get('/api/test/mpesa', async (req, res) => {
    try {
      const token = await getMpesaAccessToken();
      res.json({ success: true, token });
    } catch (err: any) {
      res.json({ success: false, error: err.message });
    }
  });

  // --- API ROUTES ---

  // Test Route
  app.get('/api/test-whatsapp', async (req, res) => {
    console.log('[GET] /api/test-whatsapp triggered');
    try {
      const config = await SystemConfig.findOne();
      const testPhone = config?.adminWhatsApp || process.env.ADMIN_WHATSAPP;
      if (!testPhone) {
        return res.status(400).json({ success: false, error: 'ADMIN_WHATSAPP not set' });
      }
      const message = 'Test message from Katiani Styles backend via WhatsApp Cloud API!';
      console.log('Triggering WhatsApp for:', testPhone);
      await sendWhatsApp(testPhone, message);
      console.log('[WhatsApp Cloud] Test message sent successfully');
      res.json({ success: true });
    } catch (error: any) {
      console.error('WhatsApp Cloud Error:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Booking Route
  app.post('/api/send-booking', async (req, res) => {
    console.log('[POST] /api/send-booking triggered');
    const { name, phone, service, date, time, paymentType } = req.body;

    if (!name || !phone || !service || !date) {
      console.warn('[Booking] Missing required fields');
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const bookingTime = time || "Not specified";

    try {
      const message = `Hello ${name}, your booking for ${service} on ${date} at ${bookingTime} is received! We will confirm shortly.`;
      console.log('Triggering WhatsApp for:', phone);
      await sendWhatsApp(phone, message);
      
      // Send message even before payment if it's a deposit
      if (paymentType === 'deposit') {
        await sendWhatsApp(
          phone,
          `Hello ${name}, your booking for ${service} on ${date} at ${bookingTime} is pending payment. Please complete payment to confirm.`
        );
      }

      console.log(`[WhatsApp Cloud] Booking confirmation sent to ${phone}`);
      res.json({ success: true });
    } catch (error: any) {
      console.error('WhatsApp Cloud Error:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Auth
  app.post('/api/auth/login', async (req, res) => {
    console.log('[POST] /api/auth/login triggered');
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
      res.json({ token });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User not found' });

      // In a real app, generate a token and send a link
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      // Store this code temporarily (e.g., in memory or DB)
      // For demo, we'll just log it
      console.log(`Password reset code for ${email}: ${resetCode}`);
      await sendEmail(email, 'Password Reset Code', `Your password reset code is: ${resetCode}`);
      
      res.json({ message: 'Reset code sent to your email' });
    } catch (err) {
      res.status(500).json({ message: 'Error processing request' });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    const { email, code, newPassword } = req.body;
    try {
      // In a real app, verify the code
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User not found' });

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.json({ message: 'Password reset successful' });
    } catch (err) {
      res.status(500).json({ message: 'Error resetting password' });
    }
  });

  // Public Config (for contact info)
  app.get('/api/config/public', async (req, res) => {
    try {
      const config = await SystemConfig.findOne();
      res.json({
        adminWhatsApp: config?.adminWhatsApp || process.env.ADMIN_WHATSAPP || '254788605695'
      });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching contact info' });
    }
  });

  // M-Pesa STK Push
  app.post('/api/payments/stkpush', async (req, res) => {
    console.log("🔥 STK REQUEST RECEIVED:", req.body);
    const { phone, amount, bookingId, shortCode: pShortCode, passkey: pPasskey, consumerKey: pConsumerKey, consumerSecret: pConsumerSecret, callbackUrl: pCallbackUrl } = req.body;
    
    let formattedPhone;
    try {
      formattedPhone = normalizePhone(phone);
      console.log("📱 FORMATTED PHONE:", formattedPhone);
    } catch (err: any) {
      console.error("❌ INVALID PHONE NUMBER:", phone);
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    try {
      const config = await SystemConfig.findOne();
      
      // PRIORITY ORDER: 1. Frontend 2. DB 3. Env
      const shortCode = pShortCode || decrypt(config?.mpesaShortcode) || process.env.MPESA_SHORTCODE;
      const passkey = pPasskey || decrypt(config?.mpesaPasskey) || process.env.MPESA_PASSKEY;
      const consumerKey = pConsumerKey || decrypt(config?.mpesaConsumerKey) || process.env.MPESA_CONSUMER_KEY;
      const consumerSecret = pConsumerSecret || decrypt(config?.mpesaConsumerSecret) || process.env.MPESA_CONSUMER_SECRET;

      const token = await getMpesaAccessToken(consumerKey, consumerSecret);
      console.log("✅ M-PESA ACCESS TOKEN:", token ? "Obtained" : "Failed");

      const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, '')
        .slice(0, 14);

      const callbackURL =
        pCallbackUrl ||
        decrypt(config?.mpesaCallbackURL) ||
        process.env.MPESA_CALLBACK_URL ||
        `${process.env.BACKEND_URL}/api/mpesa/callback`;

      console.log("📌 STK DEBUG START");
      console.log("Raw Phone:", phone);
      console.log("Formatted Phone:", formattedPhone);
      console.log("Amount:", amount);
      console.log("Callback:", callbackURL);
      console.log("ShortCode:", shortCode);
      console.log("Passkey Loaded:", !!passkey);

      if (!callbackURL || !callbackURL.startsWith("https://")) {
        console.error("❌ INVALID CALLBACK URL:", callbackURL);
        throw new Error("M-Pesa requires a valid HTTPS callback URL");
      }
      
      if (!shortCode || !passkey) {
        throw new Error('Missing M-Pesa shortcode or passkey');
      }

      const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
      
      // PRESERVE 50% DEDUCTION LOGIC
      const payableAmount = Math.ceil(Number(amount) * 0.5);
      const stkAmount = payableAmount;

      console.log("📲 SENDING STK PUSH TO SAFARICOM...");
      const stkResponse = await axios.post(
        'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        {
          BusinessShortCode: shortCode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: stkAmount,
          PartyA: formattedPhone,
          PartyB: shortCode,
          PhoneNumber: formattedPhone,
          CallBackURL: callbackURL,
          AccountReference: "Katiana Styles",
          TransactionDesc: "Booking Payment"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 20000
        }
      );

      if (stkResponse.data.errorCode) {
        console.error("M-PESA API ERROR:", stkResponse.data);
        throw new Error(stkResponse.data.errorMessage);
      }

      console.log("🔥 STK RESPONSE:", stkResponse.data);

      // Save transaction
      await MpesaTransaction.create({
        MerchantRequestID: stkResponse.data.MerchantRequestID,
        CheckoutRequestID: stkResponse.data.CheckoutRequestID,
        Amount: stkAmount,
        PhoneNumber: formattedPhone,
        BookingId: bookingId
      });

      res.json({
        success: true,
        message: "STK Push sent",
        data: stkResponse.data
      });
    } catch (error: any) {
      console.error("❌ M-PESA ERROR:", error.response?.data || error.message);
      res.status(500).json({ 
        success: false,
        message: 'M-Pesa request failed',
        error: error.response?.data || error.message
      });
    }
  });

  // M-Pesa Callback
  app.get('/api/mpesa/callback', (req, res) => {
    res.send("M-Pesa callback endpoint is live");
  });

  app.post('/api/mpesa/callback', async (req, res) => {
    console.log("🔥 M-PESA CALLBACK RECEIVED:");
    console.log(JSON.stringify(req.body, null, 2));

    const { Body } = req.body;
    if (!Body || !Body.stkCallback) {
      console.warn('Invalid M-Pesa callback body');
      return res.status(200).json({ message: "Invalid callback body, but acknowledged" });
    }
    const { stkCallback } = Body;
    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    // Return 200 OK immediately to Safaricom
    res.status(200).json({ message: "Callback received" });

    try {
      const transaction = await MpesaTransaction.findOne({ CheckoutRequestID });
      if (!transaction) {
        console.error(`Transaction not found for CheckoutRequestID: ${CheckoutRequestID}`);
        return;
      }

      transaction.ResultCode = ResultCode;
      transaction.ResultDesc = ResultDesc;

      if (ResultCode === 0) {
        // Success
        transaction.Status = 'success';
        const metadata = CallbackMetadata.Item;
        transaction.Amount = metadata.find((i: any) => i.Name === 'Amount')?.Value;
        transaction.MpesaReceiptNumber = metadata.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
        transaction.TransactionDate = metadata.find((i: any) => i.Name === 'TransactionDate')?.Value;

        // Update Booking Status
        if (transaction.BookingId) {
          const booking = await Booking.findByIdAndUpdate(transaction.BookingId, { status: 'confirmed' }, { returnDocument: 'after' });
          if (booking) {
            const serviceData = await Service.findOne({ name: booking.service });
            const duration = serviceData?.duration || 'N/A';

            // 🔥 FORCE SEND CONFIRMATION TO CLIENT
            await sendWhatsApp(
              booking.phone,
              `✅ Payment received! Your booking for ${booking.service} (${duration}) on ${booking.date} at ${booking.time} is now CONFIRMED. Transaction ID: ${transaction.MpesaReceiptNumber}`
            );
            
            // 🔔 ALSO NOTIFY ADMIN
            const config = await SystemConfig.findOne();
            const adminPhone = decrypt(config?.adminWhatsApp) || process.env.ADMIN_WHATSAPP;
            if (adminPhone) {
              await sendWhatsApp(
                adminPhone,
                `💰 Payment received from ${booking.name}\nService: ${booking.service}\nDuration: ${duration}\nAmount: ${transaction.Amount}`
              );
            }

            await sendEmail(booking.email, 'Booking Confirmed', `Your payment was successful for ${booking.service} (${duration}). Transaction ID: ${transaction.MpesaReceiptNumber}`);
            console.log(`Booking ${booking._id} confirmed via M-Pesa`);
          }
        }
      } else {
        // Failed
        transaction.Status = 'failed';
        if (transaction.BookingId) {
          await Booking.findByIdAndUpdate(transaction.BookingId, { status: 'pending' }); // Keep as pending or mark as failed? User said "Mark booking as failed" in prompt 6
          const booking = await Booking.findById(transaction.BookingId);
          if (booking) {
            await sendWhatsApp(booking.phone, `Your M-Pesa payment for ${booking.service} failed: ${ResultDesc}. Please try again or contact us.`);
            
            const config = await SystemConfig.findOne();
            const adminPhone = decrypt(config?.adminWhatsApp) || process.env.ADMIN_WHATSAPP;
            if (adminPhone) {
              await sendWhatsApp(adminPhone, `ALERT: M-Pesa payment failed for client ${booking.name} (${booking.phone}). Error: ${ResultDesc}`);
            }
          }
        }
      }

      await transaction.save();
    } catch (error) {
      console.error('Callback processing error:', error);
    }
  });

  // Check Payment Status
  app.get('/api/payments/status/:checkoutRequestID', async (req, res) => {
    try {
      const transaction = await MpesaTransaction.findOne({ CheckoutRequestID: req.params.checkoutRequestID });
      if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: 'Error checking status' });
    }
  });

  // Bookings
  app.get('/api/bookings/availability', async (req, res) => {
    const { date } = req.query;
    try {
      const bookings = await Booking.find({ date });
      const count = bookings.length;
      const bookedSlots = bookings.map(b => b.time);
      res.json({ count, bookedSlots, isFull: count >= 20 });
    } catch (err) {
      res.status(500).json({ message: 'Error checking availability' });
    }
  });

  app.get('/api/bookings/my-bookings', async (req, res) => {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ message: 'Phone number required' });
    try {
      const formattedPhone = normalizePhone(phone as string);
      const bookings = await Booking.find({ phone: formattedPhone }).sort({ date: -1 });
      res.json(bookings);
    } catch (err: any) {
      res.status(400).json({ message: err.message || 'Error fetching your bookings' });
    }
  });

  app.post('/api/bookings', async (req, res) => {
    console.log('[POST] /api/bookings triggered');
    const { name, phone, email, service, date, time, paymentType } = req.body;
    
    // Validate required fields
    if (!name || !phone || !service || !date || !time) {
      return res.status(400).json({ message: 'Missing required fields: name, phone, service, date, and time are required.' });
    }

    let formattedPhone;
    try {
      formattedPhone = normalizePhone(phone);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }

    if (!formattedPhone.match(/^254[17]\d{8}$/)) {
      return res.status(400).json({ message: "Enter a valid Kenyan phone number (07XXXXXXXX or 01XXXXXXXX)" });
    }

    try {
      // Check for duplicate booking (phone, service, date, time)
      const duplicate = await Booking.findOne({ 
        phone: formattedPhone, 
        service, 
        date, 
        time, 
        status: { $ne: 'cancelled' } 
      });
      
      if (duplicate) {
        return res.status(409).json({ message: "Duplicate booking detected. You already have a booking for this service at this time." });
      }

      // Check if client already has a booking on this day
      const existingOnDay = await Booking.findOne({ phone: formattedPhone, date, status: { $ne: 'cancelled' } });
      if (existingOnDay) {
        return res.status(400).json({ message: 'You already have a booking scheduled for this day. Please choose another date or contact us to modify your appointment.' });
      }

      // Check daily limit
      const dailyCount = await Booking.countDocuments({ date });
      if (dailyCount >= 20) return res.status(400).json({ message: 'Day fully booked' });

      // Check slot
      const existing = await Booking.findOne({ date, time });
      if (existing) return res.status(400).json({ message: 'Time slot already taken' });

      const status = paymentType === 'deposit' ? 'pending' : 'confirmed';
      const booking = new Booking({ name, phone: formattedPhone, email, service, date, time, paymentType, status });
      await booking.save();

      const serviceData = await Service.findOne({ name: service });
      const duration = serviceData?.duration || 'N/A';

      const config = await SystemConfig.findOne();
      const adminWhatsApp = decrypt(config?.adminWhatsApp) || process.env.ADMIN_WHATSAPP;

      // Debug Logging
      console.log("Customer phone:", phone);
      console.log("Admin phone:", adminWhatsApp);

      // Send to customer (Only if NOT deposit/full payment - those are handled by callback)
      if (paymentType === 'cash') {
        console.log('Triggering WhatsApp for:', formattedPhone);
        await sendWhatsApp(formattedPhone, 
          `Hello ${name}, your booking for ${service} (${duration}) on ${date} at ${time} has been received! We look forward to seeing you.`
        );
      } else {
        console.log(`[Booking] Skipping initial WhatsApp for ${paymentType} booking. Waiting for payment callback.`);
      }

      // Send to admin
      if (adminWhatsApp) {
        console.log('Triggering WhatsApp for:', adminWhatsApp);
        await sendWhatsApp(adminWhatsApp, 
          `📥 New Booking!
Name: ${name}
Service: ${service}
Duration: ${duration}
Date: ${date}
Time: ${time}
Payment: ${paymentType}`
        );
      }

      // Mock Email Confirmation
      if (email) {
        console.log(`Email Confirmation Sent to: ${email}`);
        console.log(`Subject: Booking Confirmed - ${service}`);
        console.log(`Details: ${date} at ${time}. Duration: ${duration}. Status: ${status}`);
      }

      res.status(201).json(booking);
    } catch (err) {
      res.status(500).json({ message: 'Error creating booking' });
    }
  });

  // Admin: Get all bookings
  app.get('/api/admin/bookings', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
      jwt.verify(token, JWT_SECRET);
      const bookings = await Booking.find().sort({ date: -1, time: 1 });
      res.json(bookings);
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  // Admin: Update status
  app.patch('/api/admin/bookings/:id', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
      jwt.verify(token, JWT_SECRET);
      const { status } = req.body;
      const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after' });
      
      if (status === 'cancelled') {
        const message = `Hello ${booking.name}, your booking for ${booking.service} on ${booking.date} at ${booking.time} has been cancelled. If this was a mistake, please contact us.`;
        
        // Notifications
        console.log('Triggering WhatsApp for:', booking.phone);
        await sendWhatsApp(booking.phone, message);
        if (booking.email) {
          await sendEmail(booking.email, 'Booking Cancelled', message);
        }
        console.log(`Cancellation notification sent to ${booking.name}`);
      } else if (status === 'confirmed') {
        const message = `Hello ${booking.name}, your booking for ${booking.service} on ${booking.date} at ${booking.time} is now CONFIRMED. See you then!`;
        console.log('Triggering WhatsApp for:', booking.phone);
        await sendWhatsApp(booking.phone, message);
      }

      res.json(booking);
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  // Admin: Delete booking
  app.delete('/api/admin/bookings/:id', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
      jwt.verify(token, JWT_SECRET);
      const booking = await Booking.findById(req.params.id);
      if (!booking) return res.status(404).json({ message: 'Booking not found' });
      
      if (booking.status !== 'cancelled' && booking.status !== 'completed') {
        return res.status(400).json({ message: 'Only cancelled or completed bookings can be deleted' });
      }

      await Booking.findByIdAndDelete(req.params.id);
      res.json({ message: 'Booking deleted successfully' });
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  // Admin: Send WhatsApp Message
  app.post('/api/admin/whatsapp/send', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
      jwt.verify(token, JWT_SECRET);
      const { phone, message } = req.body;
      if (!phone || !message) return res.status(400).json({ message: 'Phone and message required' });

      await sendWhatsApp(phone, message);
      res.json({ message: 'WhatsApp message sent' });
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  // Admin: Config Management
  const maskValue = (val: string) => {
    if (!val) return '';
    const decrypted = decrypt(val);
    if (decrypted.length <= 4) return '****';
    return '****' + decrypted.slice(-4);
  };

  app.get('/api/admin/config', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
      jwt.verify(token, JWT_SECRET);
      const config = await SystemConfig.findOne();
      if (!config) return res.json({});

      const maskedConfig = {
        whatsappToken: maskValue(config.whatsappToken),
        whatsappPhoneNumberId: maskValue(config.whatsappPhoneNumberId),
        adminWhatsApp: maskValue(config.adminWhatsApp),
        mongoURI: maskValue(config.mongoURI),
        mpesaConsumerKey: maskValue(config.mpesaConsumerKey),
        mpesaConsumerSecret: maskValue(config.mpesaConsumerSecret),
        mpesaShortcode: maskValue(config.mpesaShortcode),
        mpesaPasskey: maskValue(config.mpesaPasskey),
        mpesaCallbackURL: maskValue(config.mpesaCallbackURL),
        cloudinaryCloudName: maskValue(config.cloudinaryCloudName),
        cloudinaryApiKey: maskValue(config.cloudinaryApiKey),
        cloudinaryApiSecret: maskValue(config.cloudinaryApiSecret),
      };
      res.json(maskedConfig);
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  app.post('/api/admin/config', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
      jwt.verify(token, JWT_SECRET);
      const data = req.body;
      const encryptedData: any = {};
      
      // Only encrypt if value is not masked (meaning it's a new value)
      Object.keys(data).forEach(key => {
        if (data[key] && !data[key].startsWith('****')) {
          encryptedData[key] = encrypt(data[key]);
        }
      });

      let config = await SystemConfig.findOne();
      if (config) {
        Object.assign(config, encryptedData);
        config.updatedAt = new Date();
        await config.save();
      } else {
        config = new SystemConfig(encryptedData);
        await config.save();
      }

      // Re-configure Cloudinary if updated
      if (encryptedData.cloudinaryCloudName || encryptedData.cloudinaryApiKey || encryptedData.cloudinaryApiSecret) {
        configureCloudinary({
          cloud_name: decrypt(config.cloudinaryCloudName),
          api_key: decrypt(config.cloudinaryApiKey),
          api_secret: decrypt(config.cloudinaryApiSecret)
        });
      }

      res.json({ message: 'Config saved successfully' });
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  app.put('/api/admin/config', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
      jwt.verify(token, JWT_SECRET);
      const data = req.body;
      const encryptedData: any = {};
      
      Object.keys(data).forEach(key => {
        if (data[key] && !data[key].startsWith('****')) {
          encryptedData[key] = encrypt(data[key]);
        }
      });

      const config = await SystemConfig.findOneAndUpdate({}, encryptedData, { new: true, upsert: true });
      res.json({ message: 'Config updated successfully' });
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  // Admin: WhatsApp Status (Removed QR logic)
  app.get('/api/admin/whatsapp/status', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
      jwt.verify(token, JWT_SECRET);
      res.json({ status: 'connected', qr: null, provider: 'whatsapp-cloud' });
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  // WhatsApp Cloud Webhook / Notification Route
  app.post('/api/notifications/whatsapp', async (req, res) => {
    const { to, message } = req.body;
    try {
      await sendWhatsApp(to, message);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to send WhatsApp message' });
    }
  });

  // Bootstrap Admin
  const bootstrapAdmin = async () => {
    const adminEmail = 'admin@katianistyles.com';
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({ email: adminEmail, password: hashedPassword });
      console.log('Admin user bootstrapped: admin@katianistyles.com / admin123');
    }
  };
  bootstrapAdmin();

  // Reviews
  app.post('/api/reviews', async (req, res) => {
    const { bookingId, rating, comment } = req.body;
    try {
      const review = new Review({ bookingId, rating, comment });
      await review.save();

      // Notify Admin
      const config = await SystemConfig.findOne();
      const adminPhone = decrypt(config?.adminWhatsApp) || process.env.ADMIN_WHATSAPP;
      if (adminPhone) {
        const booking = await Booking.findById(bookingId);
        const clientName = booking ? booking.name : 'Unknown Client';
        await sendWhatsApp(
          adminPhone,
          `⭐ New Review Received!\nClient: ${clientName}\nRating: ${rating}/5\nComment: ${comment || 'No comment'}`
        );
      }

      res.status(201).json(review);
    } catch (err) {
      res.status(500).json({ message: 'Error saving review' });
    }
  });

  app.get('/api/reviews', async (req, res) => {
    try {
      const reviews = await Review.find({ status: 'approved' }).populate('bookingId').sort({ createdAt: -1 }).limit(10);
      res.json(reviews);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching reviews' });
    }
  });

  // Admin: Reviews Management
  app.get('/api/admin/reviews', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
      jwt.verify(token, JWT_SECRET);
      const reviews = await Review.find().populate('bookingId').sort({ createdAt: -1 });
      res.json(reviews);
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  app.patch('/api/admin/reviews/:id', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
      jwt.verify(token, JWT_SECRET);
      const { status } = req.body;
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
      res.json(review);
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  app.delete('/api/admin/reviews/:id', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
      jwt.verify(token, JWT_SECRET);
      await Review.findByIdAndDelete(req.params.id);
      res.json({ message: 'Review deleted' });
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  // Follow-up System (Ask for reviews)
  setInterval(async () => {
    try {
      // Find completed bookings from 24-48 hours ago that haven't been reviewed
      const followUpThreshold = moment().subtract(24, 'hours').toDate();
      const followUpLimit = moment().subtract(48, 'hours').toDate();

      const completedBookings = await Booking.find({
        status: 'completed',
        updatedAt: { $lte: followUpThreshold, $gte: followUpLimit }
      });

      for (const booking of completedBookings) {
        // Check if review already exists
        const existingReview = await Review.findOne({ bookingId: booking._id });
        if (!existingReview) {
          const message = `Hello ${booking.name}, thank you for choosing Katiani Styles! We'd love to hear about your experience with your ${booking.service} session. Please leave us a review here: ${process.env.BASE_URL || 'http://localhost:3000'}/success?id=${booking._id}`;
          await sendWhatsApp(booking.phone, message);
          console.log(`Follow-up sent to ${booking.name}`);
        }
      }
    } catch (err) {
      console.error('Follow-up system error:', err);
    }
  }, 12 * 60 * 60 * 1000); // Run every 12 hours

  // Categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await Category.find().sort({ name: 1 });
      res.json(categories);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching categories' });
    }
  });

  app.post('/api/admin/categories', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
      jwt.verify(token, JWT_SECRET);
      const { name, description } = req.body;
      const category = new Category({ name, description });
      await category.save();
      res.status(201).json(category);
    } catch (err) {
      res.status(500).json({ message: 'Error creating category' });
    }
  });

  app.patch('/api/admin/categories/:id', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
      jwt.verify(token, JWT_SECRET);
      const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(category);
    } catch (err) {
      res.status(500).json({ message: 'Error updating category' });
    }
  });

  app.delete('/api/admin/categories/:id', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
      jwt.verify(token, JWT_SECRET);
      // Check if any services use this category
      const servicesCount = await Service.countDocuments({ category: req.params.id });
      if (servicesCount > 0) {
        return res.status(400).json({ message: 'Cannot delete category that is in use by services' });
      }
      await Category.findByIdAndDelete(req.params.id);
      res.json({ message: 'Category deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting category' });
    }
  });

  // Services
  app.get('/api/services', async (req, res) => {
    try {
      const services = await Service.find().populate('category').sort({ name: 1 });
      res.json(services);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching services' });
    }
  });

  // Admin: Services CRUD
  app.post('/api/admin/services', upload.array('images', 5), async (req: any, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
      jwt.verify(token, JWT_SECRET);
      const { name, description, price, duration, category } = req.body;
      const imageUrls = (req.files as any[])?.map(file => file.path) || [];
      
      const service = new Service({ 
        name, 
        description, 
        price: Number(price), 
        duration, 
        category: category === '' ? null : category,
        images: imageUrls 
      });
      await service.save();
      res.status(201).json(service);
    } catch (err) {
      res.status(401).json({ message: 'Invalid token or error creating service' });
    }
  });

  app.patch('/api/admin/services/:id', upload.array('images', 5), async (req: any, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
      jwt.verify(token, JWT_SECRET);
      const { name, description, price, duration, category, existingImages } = req.body;
      
      let parsedExistingImages = [];
      try {
        parsedExistingImages = JSON.parse(existingImages || '[]');
        if (!Array.isArray(parsedExistingImages)) {
          parsedExistingImages = [];
        }
      } catch (e) {
        parsedExistingImages = [];
      }

      const newImages = (req.files as any[])?.map(file => file.path) || [];
      const images = [...parsedExistingImages, ...newImages];

      const updateData = {
        name,
        description,
        price: Number(price),
        duration,
        category: category === '' ? null : category,
        images
      };
      
      const service = await Service.findByIdAndUpdate(req.params.id, updateData, { returnDocument: 'after' });
      res.json(service);
    } catch (err) {
      res.status(401).json({ message: 'Invalid token or error updating service' });
    }
  });

  app.delete('/api/admin/services/:id', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
      jwt.verify(token, JWT_SECRET);
      await Service.findByIdAndDelete(req.params.id);
      res.json({ message: 'Service deleted' });
    } catch (err) {
      res.status(401).json({ message: 'Invalid token or error deleting service' });
    }
  });

  // Admin: Clients
  app.get('/api/admin/clients', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
      jwt.verify(token, JWT_SECRET);
      // Group bookings by phone to get unique clients
      const clients = await Booking.aggregate([
        {
          $lookup: {
            from: "services",
            localField: "service",
            foreignField: "name",
            as: "serviceDetails"
          }
        },
        {
          $addFields: {
            price: { $ifNull: [{ $arrayElemAt: ["$serviceDetails.price", 0] }, 0] }
          }
        },
        {
          $lookup: {
            from: "reviews",
            localField: "_id",
            foreignField: "bookingId",
            as: "review"
          }
        },
        {
          $addFields: {
            review: { $arrayElemAt: ["$review", 0] }
          }
        },
        {
          $group: {
            _id: "$phone",
            name: { $first: "$name" },
            email: { $first: "$email" },
            phone: { $first: "$phone" },
            bookingCount: { $sum: 1 },
            totalSpent: { $sum: "$price" },
            lastBooking: { $max: "$date" },
            bookings: { $push: "$$ROOT" }
          }
        },
        { $sort: { lastBooking: -1 } }
      ]);
      res.json(clients);
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  app.delete('/api/admin/clients/:phone', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
      jwt.verify(token, JWT_SECRET);
      await Booking.deleteMany({ phone: req.params.phone });
      res.json({ message: 'Client and their booking history deleted' });
    } catch (err) {
      res.status(401).json({ message: 'Invalid token or error deleting client' });
    }
  });

  app.patch('/api/admin/clients/:phone', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
      jwt.verify(token, JWT_SECRET);
      const { name, email } = req.body;
      await Booking.updateMany({ phone: req.params.phone }, { name, email });
      res.json({ message: 'Client information updated across all bookings' });
    } catch (err) {
      res.status(401).json({ message: 'Invalid token or error updating client' });
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
