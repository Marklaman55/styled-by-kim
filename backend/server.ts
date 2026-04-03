import 'dotenv/config';
import express from 'express';
import path from 'path';
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
  const PORT = process.env.PORT || 10000;

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

  // API Routes
  app.get('/api/test/mpesa', async (req, res) => {
    try {
      const token = await getMpesaAccessToken();
      res.json({ success: true, token });
    } catch (err: any) {
      res.json({ success: false, error: err.message });
    }
  });

  app.get('/api/test-whatsapp', async (req, res) => {
    try {
      const config = await SystemConfig.findOne();
      const testPhone = config?.adminWhatsApp || process.env.ADMIN_WHATSAPP;
      if (!testPhone) {
        return res.status(400).json({ success: false, error: 'ADMIN_WHATSAPP not set' });
      }
      const message = 'Test message from Katiani Styles backend via WhatsApp Cloud API!';
      await sendWhatsApp(testPhone, message);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/send-booking', async (req, res) => {
    const { name, phone, service, date, time, paymentType } = req.body;
    if (!name || !phone || !service || !date) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const bookingTime = time || "Not specified";
    try {
      const message = `Hello ${name}, your booking for ${service} on ${date} at ${bookingTime} is received! We will confirm shortly.`;
      await sendWhatsApp(phone, message);
      if (paymentType === 'deposit') {
        await sendWhatsApp(
          phone,
          `Hello ${name}, your booking for ${service} on ${date} at ${bookingTime} is pending payment. Please complete payment to confirm.`
        );
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
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
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      await sendEmail(email, 'Password Reset Code', `Your password reset code is: ${resetCode}`);
      res.json({ message: 'Reset code sent to your email' });
    } catch (err) {
      res.status(500).json({ message: 'Error processing request' });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    const { email, code, newPassword } = req.body;
    try {
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

  app.post('/api/payments/stkpush', async (req, res) => {
    const { phone, amount, bookingId, shortCode: pShortCode, passkey: pPasskey, consumerKey: pConsumerKey, consumerSecret: pConsumerSecret, callbackUrl: pCallbackUrl } = req.body;
    let formattedPhone;
    try {
      formattedPhone = normalizePhone(phone);
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
    try {
      const config = await SystemConfig.findOne();
      const shortCode = pShortCode || decrypt(config?.mpesaShortcode) || process.env.MPESA_SHORTCODE;
      const passkey = pPasskey || decrypt(config?.mpesaPasskey) || process.env.MPESA_PASSKEY;
      const consumerKey = pConsumerKey || decrypt(config?.mpesaConsumerKey) || process.env.MPESA_CONSUMER_KEY;
      const consumerSecret = pConsumerSecret || decrypt(config?.mpesaConsumerSecret) || process.env.MPESA_CONSUMER_SECRET;
      const token = await getMpesaAccessToken(consumerKey, consumerSecret);
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
      const callbackURL = pCallbackUrl || decrypt(config?.mpesaCallbackURL) || process.env.MPESA_CALLBACK_URL || `${process.env.BACKEND_URL}/api/mpesa/callback`;
      if (!callbackURL || !callbackURL.startsWith("https://")) {
        throw new Error("M-Pesa requires a valid HTTPS callback URL");
      }
      if (!shortCode || !passkey) {
        throw new Error('Missing M-Pesa shortcode or passkey');
      }
      const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
      const payableAmount = Math.ceil(Number(amount) * 0.5);
      const stkResponse = await axios.post(
        'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        {
          BusinessShortCode: shortCode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: payableAmount,
          PartyA: formattedPhone,
          PartyB: shortCode,
          PhoneNumber: formattedPhone,
          CallBackURL: callbackURL,
          AccountReference: "Katiana Styles",
          TransactionDesc: "Booking Payment"
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 20000
        }
      );
      if (stkResponse.data.errorCode) {
        throw new Error(stkResponse.data.errorMessage);
      }
      await MpesaTransaction.create({
        MerchantRequestID: stkResponse.data.MerchantRequestID,
        CheckoutRequestID: stkResponse.data.CheckoutRequestID,
        Amount: payableAmount,
        PhoneNumber: formattedPhone,
        BookingId: bookingId
      });
      res.json({ success: true, message: "STK Push sent", data: stkResponse.data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'M-Pesa request failed', error: error.response?.data || error.message });
    }
  });

  app.get('/api/mpesa/callback', (req, res) => {
    res.send("M-Pesa callback endpoint is live");
  });

  app.post('/api/mpesa/callback', async (req, res) => {
    const { Body } = req.body;
    if (!Body || !Body.stkCallback) {
      return res.status(200).json({ message: "Invalid callback body, but acknowledged" });
    }
    const { stkCallback } = Body;
    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;
    res.status(200).json({ message: "Callback received" });
    try {
      const transaction = await MpesaTransaction.findOne({ CheckoutRequestID });
      if (!transaction) return;
      transaction.ResultCode = ResultCode;
      transaction.ResultDesc = ResultDesc;
      if (ResultCode === 0) {
        transaction.Status = 'success';
        const metadata = CallbackMetadata.Item;
        transaction.Amount = metadata.find((i: any) => i.Name === 'Amount')?.Value;
        transaction.MpesaReceiptNumber = metadata.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
        transaction.TransactionDate = metadata.find((i: any) => i.Name === 'TransactionDate')?.Value;
        if (transaction.BookingId) {
          const booking = await Booking.findByIdAndUpdate(transaction.BookingId, { status: 'confirmed' }, { returnDocument: 'after' });
          if (booking) {
            const serviceData = await Service.findOne({ name: booking.service });
            const duration = serviceData?.duration || 'N/A';
            await sendWhatsApp(booking.phone, `✅ Payment received! Your booking for ${booking.service} (${duration}) on ${booking.date} at ${booking.time} is now CONFIRMED. Transaction ID: ${transaction.MpesaReceiptNumber}`);
            const config = await SystemConfig.findOne();
            const adminPhone = decrypt(config?.adminWhatsApp) || process.env.ADMIN_WHATSAPP;
            if (adminPhone) {
              await sendWhatsApp(adminPhone, `💰 Payment received from ${booking.name}\nService: ${booking.service}\nDuration: ${duration}\nAmount: ${transaction.Amount}`);
            }
            await sendEmail(booking.email, 'Booking Confirmed', `Your payment was successful for ${booking.service} (${duration}). Transaction ID: ${transaction.MpesaReceiptNumber}`);
          }
        }
      } else {
        transaction.Status = 'failed';
        if (transaction.BookingId) {
          await Booking.findByIdAndUpdate(transaction.BookingId, { status: 'pending' });
          const booking = await Booking.findById(transaction.BookingId);
          if (booking) {
            await sendWhatsApp(booking.phone, `Your M-Pesa payment for ${booking.service} failed: ${ResultDesc}. Please try again or contact us.`);
          }
        }
      }
      await transaction.save();
    } catch (error) {
      console.error('Callback processing error:', error);
    }
  });

  app.get('/api/payments/status/:checkoutRequestID', async (req, res) => {
    try {
      const transaction = await MpesaTransaction.findOne({ CheckoutRequestID: req.params.checkoutRequestID });
      if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: 'Error checking status' });
    }
  });

  app.get('/api/bookings/availability', async (req, res) => {
    const { date } = req.query;
    try {
      const bookings = await Booking.find({ date });
      res.json({ count: bookings.length, bookedSlots: bookings.map(b => b.time), isFull: bookings.length >= 20 });
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
    const { name, phone, email, service, date, time, paymentType } = req.body;
    if (!name || !phone || !service || !date || !time) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    let formattedPhone;
    try {
      formattedPhone = normalizePhone(phone);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
    try {
      const duplicate = await Booking.findOne({ phone: formattedPhone, service, date, time, status: { $ne: 'cancelled' } });
      if (duplicate) return res.status(409).json({ message: "Duplicate booking detected." });
      const dailyCount = await Booking.countDocuments({ date });
      if (dailyCount >= 20) return res.status(400).json({ message: 'Day fully booked' });
      const status = paymentType === 'deposit' ? 'pending' : 'confirmed';
      const booking = new Booking({ name, phone: formattedPhone, email, service, date, time, paymentType, status });
      await booking.save();
      const serviceData = await Service.findOne({ name: service });
      const duration = serviceData?.duration || 'N/A';
      if (paymentType === 'cash') {
        await sendWhatsApp(formattedPhone, `Hello ${name}, your booking for ${service} (${duration}) on ${date} at ${time} has been received!`);
      }
      const config = await SystemConfig.findOne();
      const adminWhatsApp = decrypt(config?.adminWhatsApp) || process.env.ADMIN_WHATSAPP;
      if (adminWhatsApp) {
        await sendWhatsApp(adminWhatsApp, `📥 New Booking!\nName: ${name}\nService: ${service}\nDate: ${date}\nTime: ${time}`);
      }
      res.status(201).json(booking);
    } catch (err) {
      res.status(500).json({ message: 'Error creating booking' });
    }
  });

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

  app.patch('/api/admin/bookings/:id', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
      jwt.verify(token, JWT_SECRET);
      const { status } = req.body;
      const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after' });
      if (status === 'cancelled') {
        const message = `Hello ${booking.name}, your booking for ${booking.service} on ${booking.date} at ${booking.time} has been cancelled.`;
        await sendWhatsApp(booking.phone, message);
      } else if (status === 'confirmed') {
        const message = `Hello ${booking.name}, your booking for ${booking.service} on ${booking.date} at ${booking.time} is now CONFIRMED.`;
        await sendWhatsApp(booking.phone, message);
      }
      res.json(booking);
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  app.delete('/api/admin/bookings/:id', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
      jwt.verify(token, JWT_SECRET);
      await Booking.findByIdAndDelete(req.params.id);
      res.json({ message: 'Booking deleted successfully' });
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  app.get('/api/admin/config', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
      jwt.verify(token, JWT_SECRET);
      const config = await SystemConfig.findOne();
      if (!config) return res.json({});
      const maskValue = (val: string) => {
        if (!val) return '';
        const decrypted = decrypt(val);
        return '****' + decrypted.slice(-4);
      };
      res.json({
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
      });
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
      res.json({ message: 'Config saved successfully' });
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  app.get('/api/services', async (req, res) => {
    try {
      const services = await Service.find().populate('category').sort({ name: 1 });
      res.json(services);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching services' });
    }
  });

  app.post('/api/admin/services', upload.array('images', 5), async (req: any, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
      jwt.verify(token, JWT_SECRET);
      const { name, description, price, duration, category } = req.body;
      const imageUrls = (req.files as any[])?.map(file => file.path) || [];
      const service = new Service({ name, description, price: Number(price), duration, category: category === '' ? null : category, images: imageUrls });
      await service.save();
      res.status(201).json(service);
    } catch (err) {
      res.status(401).json({ message: 'Invalid token or error creating service' });
    }
  });

  app.get('/api/admin/clients', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
      jwt.verify(token, JWT_SECRET);
      const clients = await Booking.aggregate([
        { $group: { _id: "$phone", name: { $first: "$name" }, email: { $first: "$email" }, phone: { $first: "$phone" }, bookingCount: { $sum: 1 }, lastBooking: { $max: "$date" } } },
        { $sort: { lastBooking: -1 } }
      ]);
      res.json(clients);
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  const bootstrapAdmin = async () => {
    const adminEmail = 'admin@katianistyles.com';
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({ email: adminEmail, password: hashedPassword });
      console.log('Admin user bootstrapped');
    }
  };
  bootstrapAdmin();

  const PORT_NUM = Number(PORT) || 10000;
  app.listen(PORT_NUM, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT_NUM}`);
  });
}

startServer();
