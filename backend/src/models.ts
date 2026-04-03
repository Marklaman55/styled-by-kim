import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' }
});

const BookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  service: { type: String, required: true },
  date: { type: String, required: true }, // ISO string YYYY-MM-DD
  time: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  paymentType: { type: String, enum: ['deposit', 'cash'], required: true },
  qrCode: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const ReviewSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  images: [{ type: String }], // Array of Cloudinary URLs
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
export const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
export const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
export const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);

const SystemConfigSchema = new mongoose.Schema({
  whatsappToken: { type: String },
  whatsappPhoneNumberId: { type: String },
  adminWhatsApp: { type: String },
  mongoURI: { type: String },
  mpesaConsumerKey: { type: String },
  mpesaConsumerSecret: { type: String },
  mpesaShortcode: { type: String },
  mpesaPasskey: { type: String },
  mpesaCallbackURL: { type: String },
  cloudinaryCloudName: { type: String },
  cloudinaryApiKey: { type: String },
  cloudinaryApiSecret: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

export const SystemConfig = mongoose.models.SystemConfig || mongoose.model('SystemConfig', SystemConfigSchema);

const MpesaTransactionSchema = new mongoose.Schema({
  MerchantRequestID: String,
  CheckoutRequestID: { type: String, unique: true },
  ResultCode: Number,
  ResultDesc: String,
  Amount: Number,
  MpesaReceiptNumber: String,
  TransactionDate: String,
  PhoneNumber: String,
  Status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  BookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  createdAt: { type: Date, default: Date.now }
});

export const MpesaTransaction = mongoose.models.MpesaTransaction || mongoose.model('MpesaTransaction', MpesaTransactionSchema);
