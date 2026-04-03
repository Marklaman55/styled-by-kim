import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Calendar, 
  Clock, 
  User as UserIcon, 
  Phone, 
  Mail, 
  CheckCircle, 
  Star, 
  Menu, 
  X, 
  ChevronRight, 
  Instagram, 
  Facebook, 
  MapPin,
  LayoutDashboard,
  LogOut,
  QrCode,
  Scan,
  Search,
  History,
  Plus,
  Trash2,
  Edit,
  Upload,
  Download,
  Image as ImageIcon,
  Tag,
  MessageSquare,
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Filter,
  Settings,
  Database,
  Shield,
  Key
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { format, addDays, isSameDay } from 'date-fns';
import { SERVICES as STATIC_SERVICES, TIME_SLOTS, Service, PLACEHOLDER_IMAGE } from './constants';
import { cn, formatKenyanNumber } from './lib/utils';

// --- CUSTOM HOOKS ---
const useServices = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    try {
      const res = await axios.get('/api/services');
      setServices(res.data.length > 0 ? res.data : STATIC_SERVICES);
    } catch (err) {
      setServices(STATIC_SERVICES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return { services, loading, fetchServices };
};

// --- COMPONENTS ---

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, loading = false }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
      >
        <h3 className="text-xl sm:text-2xl font-serif font-bold mb-4">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        <div className="flex gap-4">
          <button onClick={onCancel} className="btn-secondary flex-1 py-2 text-sm">Cancel</button>
          <button 
            onClick={onConfirm} 
            disabled={loading}
            className="btn-primary flex-1 py-2 text-sm bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600 flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Confirm'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-brand-pink-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-serif font-bold text-brand-accent">katiani.Styles</span>
            <div className="w-2 h-2 rounded-full bg-brand-gold" />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {!isAdmin ? (
              <>
                <Link to="/" className="text-gray-600 hover:text-brand-accent transition-colors">Home</Link>
                <Link to="/services" className="text-gray-600 hover:text-brand-accent transition-colors">Services</Link>
                <Link to="/my-bookings" className="text-gray-600 hover:text-brand-accent transition-colors flex items-center gap-1">
                  <History size={16} /> My Bookings
                </Link>
                <Link to="/book" className="btn-primary py-2 text-sm">Book Now</Link>
              </>
            ) : (
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Admin Control Panel</span>
            )}
          </div>

          {!isAdmin && (
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-600">
              {isOpen ? <X /> : <Menu />}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && !isAdmin && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-brand-pink-dark overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              <Link to="/" onClick={() => setIsOpen(false)} className="block text-lg text-gray-600">Home</Link>
              <Link to="/services" onClick={() => setIsOpen(false)} className="block text-lg text-gray-600">Services</Link>
              <Link to="/book" onClick={() => setIsOpen(false)} className="block btn-primary text-center">Book Now</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-brand-pink pt-16 pb-8 border-t border-brand-pink-dark">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-3xl font-serif font-bold text-brand-accent mb-4">katiani.Styles</h2>
          <p className="text-gray-600 max-w-md mb-6">
            Elevating your natural beauty with premium lash extensions. Experience luxury, comfort, and perfection in every set.
          </p>
          <div className="flex space-x-4">
            <a href="https://www.tiktok.com/@katianistyles?_r=1&_t=ZS-950bWqb1bwj" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-accent shadow-sm hover:bg-brand-accent hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" width="20" height="20">
                <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.32h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/katiani.styles/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-accent shadow-sm hover:bg-brand-accent hover:text-white transition-all">
              <Instagram size={20} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-accent shadow-sm hover:bg-brand-accent hover:text-white transition-all">
              <Facebook size={20} />
            </a>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 mb-4">Quick Links</h3>
          <ul className="space-y-2 text-gray-600">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/book">Book Appointment</Link></li>
            <li><Link to="/admin/login">Admin Portal</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 mb-4">Contact</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center space-x-2"><MapPin size={16} /> <span>Nairobi | Waiyaki way | Uthuli Arcade B8</span></li>
            <li className="flex items-center space-x-2">
              <Phone size={16} /> 
              <a href="https://wa.me/254788605695" target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent transition-colors">
                +254 788 605 695 (WhatsApp)
              </a>
            </li>
            <li className="flex items-center space-x-2">
              <Phone size={16} /> 
              <a href="tel:+254704531783" className="hover:text-brand-accent transition-colors">
                +254 704 531 783 (Calls)
              </a>
            </li>
            <li className="flex items-center space-x-2"><Mail size={16} /> <span>hello@katianistyles.com</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-pink-dark pt-8 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} katiani.Styles. All rights reserved.
      </div>
    </div>
  </footer>
);

// --- PAGES ---

const Home = () => {
  const { services } = useServices();
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get('/api/reviews');
        setReviews(res.data);
      } catch (err) {
        console.error("Failed to fetch reviews");
      }
    };
    fetchReviews();
  }, []);

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=2000" 
            alt="Best Lash Extensions Nairobi - Katiani Styles Studio" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-pink/90 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            <span className="text-brand-accent font-medium tracking-widest uppercase mb-4 block">Professional Eyelash Technician in Kenya</span>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6 leading-tight">
              Expert Lash Extensions in Nairobi - <span className="text-brand-accent">Katiani Styles</span>
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              Experience the ultimate lash transformation with the best lash extensions in Nairobi. 
              Our expert eyelash technician in Kenya provides high-quality beauty services tailored to your unique look.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/book" className="btn-primary text-center flex items-center justify-center gap-2">
                Book Appointment
              </Link>
              <a 
                href="https://wa.me/254103491401" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-[#25D366] text-white px-8 py-4 rounded-full font-bold hover:bg-[#128C7E] transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Phone size={20} /> Book via WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-brand-pink/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">Why Choose Katiani Styles for Your Lashes?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We pride ourselves on being the top choice for beauty services in Nairobi.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-brand-pink-dark">
              <div className="w-16 h-16 bg-brand-pink rounded-full flex items-center justify-center mx-auto mb-6 text-brand-accent">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">High-Quality Materials</h3>
              <p className="text-gray-600">We use only premium, medical-grade adhesives and lightweight lashes for long-lasting results and maximum comfort.</p>
            </div>
            <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-brand-pink-dark">
              <div className="w-16 h-16 bg-brand-pink rounded-full flex items-center justify-center mx-auto mb-6 text-brand-accent">
                <Star size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Expert Artistry</h3>
              <p className="text-gray-600">Our certified eyelash technician in Kenya ensures every set is customized to enhance your natural eye shape perfectly.</p>
            </div>
            <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-brand-pink-dark">
              <div className="w-16 h-16 bg-brand-pink rounded-full flex items-center justify-center mx-auto mb-6 text-brand-accent">
                <MapPin size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Luxury Studio</h3>
              <p className="text-gray-600">Enjoy a relaxing, luxury studio experience in the heart of Nairobi. Your comfort is our top priority.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">Our Signature Lash Sets</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">From natural to dramatic, we offer the best lash extensions in Nairobi for every style.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.slice(0, 3).map((service, idx) => (
              <motion.div
                key={service.id || service._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card overflow-hidden group"
              >
                <div className="h-64 overflow-hidden">
                  <img 
                    src={service.images?.[0] || service.image || PLACEHOLDER_IMAGE} 
                    alt={`${service.name} - Lash Extensions Nairobi`} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-serif font-bold mb-2">{service.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-brand-accent">KES {service.price.toLocaleString()}</span>
                    <Link to="/book" className="text-brand-accent font-medium flex items-center">
                      Book Now <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/services" className="btn-secondary inline-block">View All Beauty Services Nairobi</Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-brand-pink/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">Client Love</h2>
            <p className="text-gray-600">Why we are the preferred eyelash technician in Kenya.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.length > 0 ? (
              reviews.map((t, idx) => (
                <motion.div 
                  key={t._id} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-8 rounded-3xl shadow-sm border border-brand-pink-dark"
                >
                  <div className="flex text-brand-gold mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < t.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-6">"{t.comment}"</p>
                  <p className="font-bold text-gray-900">- {t.bookingId?.name || 'Happy Client'}</p>
                </motion.div>
              ))
            ) : (
              [
                { name: "Sarah W.", text: "Best lash extensions Nairobi! The studio is so relaxing and my lashes look incredible.", rating: 5 },
                { name: "Jane M.", text: "I've tried many places, but Katiani Styles is on another level. The retention is amazing!", rating: 5 },
                { name: "Anita K.", text: "Professional, clean, and beautiful results. Highly recommend the Hybrid set.", rating: 5 }
              ].map((t, idx) => (
                <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-brand-pink-dark">
                  <div className="flex text-brand-gold mb-4">
                    {[...Array(t.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <p className="text-gray-700 italic mb-6">"{t.text}"</p>
                  <p className="font-bold text-gray-900">- {t.name}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const ServiceCard = ({ service, idx }: { service: any, idx: number, key?: any }) => {
  const images = service.images?.length > 0 ? service.images : [service.image || PLACEHOLDER_IMAGE];
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      className={cn(
        "flex flex-col md:flex-row gap-8 items-center glass-card p-6 md:p-10",
        idx % 2 !== 0 && "md:flex-row-reverse"
      )}
    >
      <div className="w-full md:w-1/2 h-80 rounded-2xl overflow-hidden relative group">
        <AnimatePresence mode="wait">
          <motion.img 
            key={currentImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            src={images[currentImage]} 
            alt={`${service.name} - Image ${currentImage + 1}`} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-brand-accent shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-brand-accent shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_: any, i: number) => (
                <div 
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    i === currentImage ? "bg-brand-accent w-4" : "bg-white/60"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="w-full md:w-1/2 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">{service.name}</h2>
            <p className="text-xs font-bold text-brand-accent uppercase tracking-widest mt-1">
              {service.category?.name || 'Signature Set'}
            </p>
          </div>
          <span className="bg-brand-pink text-brand-accent px-4 py-1 rounded-full text-sm font-bold">
            {service.duration}
          </span>
        </div>
        <p className="text-lg text-gray-600 leading-relaxed">{service.description}</p>
        <div className="text-3xl font-bold text-brand-accent">KES {service.price.toLocaleString()}</div>
        <Link to={`/book?service=${service.id || service._id}`} className="btn-primary inline-block">Book Now</Link>
      </div>
    </motion.div>
  );
};

const ServicesPage = () => {
  const { services } = useServices();
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/categories');
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => (s.category?._id || s.category) === selectedCategory);

  return (
    <div className="pt-32 pb-24 min-h-screen bg-brand-pink/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-bold text-gray-900 mb-4">Services & Pricing</h1>
          <p className="text-gray-600">Find the perfect set for your style and budget.</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <button 
            onClick={() => setSelectedCategory('all')}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-bold transition-all",
              selectedCategory === 'all' ? "bg-brand-accent text-white shadow-lg" : "bg-white text-gray-600 border border-gray-100"
            )}
          >
            All Services
          </button>
          {categories.map(cat => (
            <button 
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-bold transition-all",
                selectedCategory === cat._id ? "bg-brand-accent text-white shadow-lg" : "bg-white text-gray-600 border border-gray-100"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="space-y-12">
          {filteredServices.length === 0 ? (
            <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-500 italic">No services found in this category.</p>
            </div>
          ) : (
            filteredServices.map((service, idx) => (
              <ServiceCard key={service.id || service._id} service={service} idx={idx} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialService = queryParams.get('service') || '';
  const { services } = useServices();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: initialService,
    date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    time: '',
    paymentType: 'cash'
  });

  const [availability, setAvailability] = useState<{ count: number, bookedSlots: string[], isFull: boolean }>({
    count: 0,
    bookedSlots: [],
    isFull: false
  });

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (formData.date) {
      checkAvailability(formData.date);
    }
  }, [formData.date]);

  const checkAvailability = async (date: string) => {
    try {
      const res = await axios.get(`/api/bookings/availability?date=${date}`);
      setAvailability(res.data);
    } catch (err) {
      toast.error("Failed to check availability");
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.time) return toast.error("Please select a time slot");
    
    // Validate Kenyan phone number (exactly 9 digits)
    if (formData.phone.length !== 9) {
      toast.error("Please enter exactly 9 digits for your phone number");
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post('/api/bookings', formData);
      const booking = res.data;

      if (formData.paymentType === 'deposit') {
        const service = services.find(s => s.name === formData.service);
        const depositAmount = service ? Math.round(service.price * 0.5) : 1000;
        
        // Trigger STK Push
        const stkRes = await axios.post('/api/payments/stkpush', { 
          phone: '254' + formData.phone, 
          amount: depositAmount,
          bookingId: booking._id 
        });
        
        if (stkRes.data.ResponseCode === '0') {
          toast.success("STK Push triggered! Please check your phone and enter your M-Pesa PIN.");
          navigate(`/payment-status?checkoutID=${stkRes.data.CheckoutRequestID}`);
        } else {
          toast.error("Failed to trigger M-Pesa payment. Please try again.");
        }
      } else {
        toast.success("Booking successful! We've sent you a confirmation message on WhatsApp.");
        localStorage.setItem('lastBooking', JSON.stringify(booking));
        navigate('/success');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-brand-pink/20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="glass-card p-8 md:p-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Book Your Session</h1>
            <p className="text-gray-600">Secure your spot for a luxury lash experience.</p>
          </div>

          <form onSubmit={handleBooking} className="space-y-8">
            {/* Step 1: Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <UserIcon size={16} /> Full Name
                </label>
                <input 
                  required
                  type="text" 
                  className="input-field" 
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Phone size={16} /> Phone Number
                </label>
                <div className="flex items-center gap-0 border border-brand-pink-dark rounded-2xl bg-white focus-within:border-brand-accent transition-all overflow-hidden">
                  <span className="pl-4 pr-2 py-3 text-gray-500 font-bold border-r border-gray-100 bg-gray-50/50">
                    +254
                  </span>
                  <input 
                    required
                    type="tel" 
                    className="flex-1 px-4 py-3 outline-none text-gray-900 font-medium" 
                    placeholder="712 345 678"
                    value={formatKenyanNumber(formData.phone)}
                    onChange={e => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (val.startsWith('0')) val = val.slice(1);
                      if (val.startsWith('254')) val = val.slice(3);
                      if (val.length <= 9) setFormData({...formData, phone: val});
                    }}
                  />
                </div>
                {formData.phone.length > 0 && formData.phone.length < 9 && (
                  <p className="text-[10px] text-red-500 font-medium">Please enter exactly 9 digits</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Mail size={16} /> Email (Optional)
                </label>
                <input 
                  type="email" 
                  className="input-field" 
                  placeholder="jane@example.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <ChevronRight size={16} /> Service Type
                </label>
                <select 
                  required
                  className="input-field"
                  value={formData.service}
                  onChange={e => setFormData({...formData, service: e.target.value})}
                >
                  <option value="">Select a service</option>
                  {services.map(s => <option key={s.id || s._id} value={s.name}>{s.name} - KES {s.price}</option>)}
                </select>
              </div>
            </div>

            {/* Step 2: Date & Time */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Calendar size={16} /> Select Date
                </label>
                <input 
                  required
                  type="date" 
                  min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                  className="input-field"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Clock size={16} /> Available Slots
                  </label>
                  <div className="text-xs font-medium text-gray-500">
                    {availability.count}/20 slots filled
                  </div>
                </div>
                
                {/* Visual Availability Indicator */}
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div 
                    className={cn(
                      "h-full transition-all duration-500",
                      availability.count >= 18 ? "bg-red-500" : 
                      availability.count >= 10 ? "bg-brand-accent" : 
                      "bg-green-500"
                    )}
                    style={{ width: `${(availability.count / 20) * 100}%` }}
                  />
                </div>

                {availability.isFull ? (
                  <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-center font-bold">
                    Day Fully Booked (20/20)
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {TIME_SLOTS.map(slot => {
                      const isBooked = availability.bookedSlots.includes(slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setFormData({...formData, time: slot})}
                          className={cn(
                            "py-3 rounded-xl text-sm font-medium transition-all border",
                            isBooked ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" :
                            formData.time === slot ? "bg-brand-accent text-white border-brand-accent shadow-md" :
                            "bg-white text-gray-700 border-brand-pink-dark hover:border-brand-accent"
                          )}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Payment */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-700">Payment Option</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, paymentType: 'deposit'})}
                  className={cn(
                    "p-4 rounded-2xl border text-left transition-all relative",
                    formData.paymentType === 'deposit' ? "border-brand-accent bg-brand-pink/50 ring-2 ring-brand-accent" : "border-brand-pink-dark bg-white"
                  )}
                >
                  <div className="font-bold text-gray-900">Pay Deposit</div>
                  <div className="text-xs text-gray-600 mt-1">Priority booking via M-Pesa STK Push.</div>
                  <div className="mt-2 text-[10px] font-bold text-brand-accent bg-white px-2 py-0.5 rounded-full inline-block border border-brand-accent/20">
                    50% deposit for faster services
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, paymentType: 'cash'})}
                  className={cn(
                    "p-4 rounded-2xl border text-left transition-all",
                    formData.paymentType === 'cash' ? "border-brand-accent bg-brand-pink/50 ring-2 ring-brand-accent" : "border-brand-pink-dark bg-white"
                  )}
                >
                  <div className="font-bold text-gray-900">Pay Cash at Studio</div>
                  <div className="text-xs text-gray-600 mt-1">Pending status. Subject to availability.</div>
                </button>
              </div>
            </div>

            <button 
              disabled={loading || availability.isFull}
              className="w-full btn-primary py-4 text-lg font-bold disabled:opacity-50"
            >
              {loading ? "Processing..." : "Confirm Booking"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const SuccessPage = () => {
  const [booking, setBooking] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewed, setReviewed] = useState(false);
  const { services } = useServices();

  useEffect(() => {
    const last = localStorage.getItem('lastBooking');
    if (last) setBooking(JSON.parse(last));
  }, []);

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return toast.error("Please select a rating");
    try {
      await axios.post('/api/reviews', { bookingId: booking._id, rating, comment });
      toast.success("Thank you for your review!");
      setReviewed(true);
    } catch (err) {
      toast.error("Failed to save review");
    }
  };

  if (!booking) return <div className="pt-32 text-center">No booking found.</div>;

  const serviceInfo = services.find(s => s.name === booking.service);

  return (
    <div className="pt-32 pb-24 min-h-screen bg-brand-pink/20">
      <div className="max-w-2xl mx-auto px-4 space-y-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-10 text-center"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-8">We've sent a confirmation to your phone.</p>
          
          <div className="bg-white/50 p-6 rounded-3xl border border-white/50 mb-8 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Service:</span>
              <span className="font-bold text-gray-900">{booking.service}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Duration:</span>
              <span className="font-bold text-gray-900">{serviceInfo?.duration || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Phone:</span>
              <span className="font-bold text-gray-900">+254 {formatKenyanNumber(booking.phone)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Date & Time:</span>
              <span className="font-bold text-gray-900">{booking.date} at {booking.time}</span>
            </div>
          </div>
          
          {serviceInfo && (
            <div className="mb-8 rounded-2xl overflow-hidden h-64 w-full max-w-md mx-auto shadow-xl relative group">
              <img 
                src={serviceInfo.images?.[0] || serviceInfo.image} 
                alt={serviceInfo.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            </div>
          )}

          <div className="bg-white p-6 rounded-2xl border border-brand-pink-dark inline-block mb-8">
            <QRCodeSVG value={JSON.stringify({ id: booking._id, name: booking.name })} size={150} />
            <p className="text-xs text-gray-500 mt-4 font-mono">ID: {booking._id.slice(-8)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left max-w-sm mx-auto bg-brand-pink/30 p-4 rounded-2xl">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Service</p>
              <p className="font-medium">{booking.service}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Date & Time</p>
              <p className="font-medium">{booking.date} @ {booking.time}</p>
            </div>
          </div>
        </motion.div>

        {!reviewed && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-10"
          >
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 text-center">Leave a Review</h2>
            <form onSubmit={handleReview} className="space-y-6">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={cn(
                      "transition-all",
                      rating >= star ? "text-brand-gold scale-110" : "text-gray-300"
                    )}
                  >
                    <Star size={32} fill={rating >= star ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
              <textarea 
                className="input-field min-h-[100px]" 
                placeholder="Tell us about your experience..."
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
              <button className="w-full btn-primary">Submit Review</button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const PaymentStatus = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const checkoutID = new URLSearchParams(location.search).get('checkoutID');
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [transaction, setTransaction] = useState<any>(null);
  const [attempts, setAttempts] = useState(0);
  const [adminWhatsApp, setAdminWhatsApp] = useState('254788605695');
  const maxAttempts = 20; // 60 seconds (20 * 3s)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get('/api/config/public');
        setAdminWhatsApp(res.data.adminWhatsApp);
      } catch (err) {
        console.error("Failed to fetch public config");
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    if (!checkoutID) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`/api/payments/status/${checkoutID}`);
        if (res.data.Status !== 'pending') {
          setStatus(res.data.Status);
          setTransaction(res.data);
          clearInterval(interval);
          if (res.data.Status === 'success') {
            toast.success("Payment confirmed!");
          } else {
            toast.error(`Payment failed: ${res.data.ResultDesc || 'Unknown error'}`);
          }
        } else {
          setAttempts(prev => {
            if (prev + 1 >= maxAttempts) {
              clearInterval(interval);
              setStatus('failed');
              setTransaction({ ResultDesc: 'Payment confirmation timed out. Please check your M-Pesa or contact us.' });
              return prev + 1;
            }
            return prev + 1;
          });
        }
      } catch (err) {
        console.error("Status check failed", err);
        // Don't stop polling on network error, just log it
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [checkoutID]);

  if (status === 'success') {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-brand-pink/20 flex items-center justify-center px-4">
        <div className="max-w-md w-full glass-card p-6 sm:p-10 text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-2">Payment Confirmed!</h1>
          <p className="text-gray-600 mb-6">Your deposit has been received. Transaction ID: {transaction?.MpesaReceiptNumber}</p>
          <button onClick={() => navigate('/success')} className="btn-primary w-full min-h-[44px]">View Booking Details</button>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-brand-pink/20 flex items-center justify-center px-4">
        <div className="max-w-md w-full glass-card p-6 sm:p-10 text-center">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <X size={40} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-600 mb-6">{transaction?.ResultDesc || "Something went wrong with your payment."}</p>
          <div className="space-y-4">
            <button onClick={() => window.location.reload()} className="btn-primary w-full min-h-[44px]">Retry Payment</button>
            <a 
              href={`https://wa.me/${adminWhatsApp.replace(/\D/g, '')}?text=Hi, my payment for booking ${checkoutID} failed. Please help.`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-secondary w-full min-h-[44px] flex items-center justify-center gap-2"
            >
              <MessageSquare size={18} /> Contact Admin on WhatsApp
            </a>
            <button onClick={() => navigate('/book')} className="btn-secondary w-full min-h-[44px]">Back to Booking</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-brand-pink/20 flex items-center justify-center px-4">
      <div className="max-w-md w-full glass-card p-6 sm:p-10 text-center">
        <div className="w-20 h-20 bg-brand-pink text-brand-accent rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Clock size={40} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-2">Verifying Payment</h1>
        <p className="text-gray-600 mb-4 font-bold text-brand-accent">Check your phone and enter M-Pesa PIN</p>
        <p className="text-sm text-gray-500 mb-6">Waiting for confirmation from M-Pesa. This may take up to a minute.</p>
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-gray-400">Attempt {attempts + 1} of {maxAttempts}</p>
        </div>
      </div>
    </div>
  );
};

const MyBookings = () => {
  const [phone, setPhone] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchMyBookings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate Kenyan phone number (exactly 9 digits)
    if (phone.length !== 9) {
      toast.error("Please enter exactly 9 digits for your phone number");
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.get(`/api/bookings/my-bookings?phone=254${phone}`);
      setBookings(res.data);
      setSearched(true);
    } catch (err) {
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-brand-pink/20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="glass-card p-8 md:p-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">My Bookings</h1>
            <p className="text-gray-600">Enter your phone number to view your appointment history at katiani.Styles</p>
          </div>

          <form onSubmit={fetchMyBookings} className="flex flex-col sm:flex-row gap-4 mb-12">
            <div className="flex-grow flex items-center gap-0 border border-gray-200 rounded-2xl bg-white focus-within:border-brand-accent transition-all overflow-hidden">
              <span className="pl-4 pr-2 py-3 text-gray-500 font-bold border-r border-gray-100 bg-gray-50/50">
                +254
              </span>
              <input 
                required
                type="tel" 
                className="flex-1 px-4 py-3 outline-none text-gray-900 font-medium" 
                placeholder="712 345 678"
                value={formatKenyanNumber(phone)}
                onChange={e => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (val.startsWith('0')) val = val.slice(1);
                  if (val.startsWith('254')) val = val.slice(3);
                  if (val.length <= 9) setPhone(val);
                }}
              />
            </div>
            <button className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap py-3 px-8">
              <Search size={20} /> Find Bookings
            </button>
          </form>

          {searched && (
            <div className="space-y-6">
              {bookings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-brand-pink-dark">
                  <p className="text-gray-500">No bookings found for this phone number.</p>
                </div>
              ) : (
                bookings.map((b, idx) => (
                  <motion.div 
                    key={b._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white p-6 rounded-3xl border border-brand-pink-dark flex flex-col md:flex-row justify-between items-center gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-brand-pink flex items-center justify-center text-brand-accent">
                        <Calendar size={32} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{b.service}</h3>
                        <p className="text-sm text-gray-500">{b.date} at {b.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                        b.status === 'confirmed' ? "bg-green-100 text-green-700" :
                        b.status === 'pending' ? "bg-orange-100 text-orange-700" :
                        b.status === 'completed' ? "bg-purple-100 text-purple-700" :
                        "bg-red-100 text-red-700"
                      )}>
                        {b.status}
                      </span>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase font-bold">Payment</p>
                        <p className="text-sm font-medium capitalize">{b.paymentType}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: forgot, 2: reset
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('adminToken', res.data.token);
      toast.success("Welcome back, Admin!");
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error("Invalid credentials");
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/forgot-password', { email: forgotEmail });
      toast.success("Reset code sent to your email");
      setStep(2);
    } catch (err) {
      toast.error("Failed to send reset code");
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/reset-password', { email: forgotEmail, code: resetCode, newPassword });
      toast.success("Password reset successful");
      setShowForgot(false);
      setStep(1);
    } catch (err) {
      toast.error("Failed to reset password");
    }
  };

  if (showForgot) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-brand-pink/20 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <div className="glass-card p-10">
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8 text-center">
              {step === 1 ? "Forgot Password" : "Reset Password"}
            </h1>
            {step === 1 ? (
              <form onSubmit={handleForgot} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Email Address</label>
                  <input 
                    required
                    type="email" 
                    className="input-field" 
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                  />
                </div>
                <button className="w-full btn-primary py-4">Send Reset Code</button>
                <button type="button" onClick={() => setShowForgot(false)} className="w-full text-sm text-gray-500 hover:text-brand-accent">Back to Login</button>
              </form>
            ) : (
              <form onSubmit={handleReset} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Reset Code</label>
                  <input 
                    required
                    className="input-field" 
                    value={resetCode}
                    onChange={e => setResetCode(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">New Password</label>
                  <input 
                    required
                    type="password"
                    className="input-field" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </div>
                <button className="w-full btn-primary py-4">Reset Password</button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-brand-pink/20 flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="glass-card p-10">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Email Address</label>
              <input 
                required
                type="email" 
                className="input-field" 
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Password</label>
              <input 
                required
                type="password" 
                className="input-field" 
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button className="w-full btn-primary py-4">Login</button>
            <button type="button" onClick={() => setShowForgot(true)} className="w-full text-sm text-gray-500 hover:text-brand-accent">Forgot Password?</button>
          </form>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [whatsappQr, setWhatsappQr] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
    fetchWhatsappStatus();
    const interval = setInterval(() => {
      fetchBookings();
      fetchWhatsappStatus();
    }, 30000); // Refresh data every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchWhatsappStatus = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await axios.get('/api/admin/whatsapp/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWhatsappStatus(res.data.status);
      setWhatsappQr(res.data.qr);
    } catch (err) {
      console.error("Failed to fetch WhatsApp status");
    }
  };

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    loading: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    loading: false
  });

  const confirmAction = (title: string, message: string, onConfirm: () => Promise<void>) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      loading: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        try {
          await onConfirm();
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {}, loading: false });
        } catch (err) {
          setConfirmModal(prev => ({ ...prev, loading: false }));
        }
      }
    });
  };

  const fetchBookings = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return navigate('/admin/login');
    try {
      const res = await axios.get('/api/admin/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (err) {
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    if (status === 'cancelled' && !confirm("Are you sure you want to cancel this booking?")) return;
    const token = localStorage.getItem('adminToken');
    try {
      await axios.patch(`/api/admin/bookings/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    today: bookings.filter(b => b.date === format(new Date(), 'yyyy-MM-dd')).length
  };

  // Chart Data: Bookings per time range
  const chartData = useMemo(() => {
    if (timeRange === 'weekly') {
      const last7Days = [...Array(7)].map((_, i) => {
        const d = addDays(new Date(), -i);
        return format(d, 'EEE');
      }).reverse();
      
      return last7Days.map(day => {
        const count = bookings.filter(b => format(new Date(b.date), 'EEE') === day).length;
        return { name: day, count };
      });
    } else if (timeRange === 'monthly') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.map(month => {
        const count = bookings.filter(b => format(new Date(b.date), 'MMM') === month).length;
        return { name: month, count };
      });
    } else {
      const years = [...new Set(bookings.map(b => format(new Date(b.date), 'yyyy')))].sort();
      return years.map(year => {
        const count = bookings.filter(b => format(new Date(b.date), 'yyyy') === year).length;
        return { name: year, count };
      });
    }
  }, [bookings, timeRange]);

  // Chart Data: Revenue per service
  const { services } = useServices();
  const serviceRevenue = useMemo(() => {
    return bookings.reduce((acc: any[], b) => {
      if (b.status === 'cancelled') return acc;
      const service = services.find(s => s.name === b.service);
      const price = service?.price || 0;
      const existing = acc.find(d => d.name === b.service);
      if (existing) existing.value += price;
      else acc.push({ name: b.service, value: price });
      return acc;
    }, []);
  }, [bookings, services]);

  const COLORS = ['#f06292', '#d4af37', '#f8bbd0', '#fce4ec', '#8884d8'];

  const filteredBookings = bookings.filter(b => b.date === filterDate);

  const deleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking record?")) return;
    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`/api/admin/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Booking deleted");
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete booking");
    }
  };

  const [activeTab, setActiveTab] = useState('Dashboard');

  return (
    <div className="flex min-h-screen bg-gray-50 pt-20">
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-brand-accent text-white rounded-full shadow-lg md:hidden"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: sidebarOpen ? 280 : 80,
          x: mobileMenuOpen ? 0 : (window.innerWidth < 768 ? -280 : 0)
        }}
        className={cn(
          "fixed left-0 top-20 bottom-0 bg-white border-r border-gray-100 z-40 overflow-hidden transition-transform md:translate-x-0",
          !mobileMenuOpen && "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-4 flex flex-col h-full">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-50 rounded-xl self-end mb-8 text-gray-400"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <nav className="space-y-2 flex-grow overflow-y-auto">
            {[
              { label: 'Dashboard', icon: LayoutDashboard },
              { label: 'Categories', icon: Tag },
              { label: 'Services', icon: ImageIcon },
              { label: 'Bookings', icon: Calendar },
              { label: 'Clients', icon: UserIcon },
              { label: 'Reviews', icon: Star },
              { label: 'System Config', icon: Settings },
            ].map((item, i) => (
              <button 
                key={i}
                onClick={() => { setActiveTab(item.label); setMobileMenuOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-2xl transition-all",
                  activeTab === item.label ? "bg-brand-pink text-brand-accent" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                <item.icon size={24} className="shrink-0" />
                {(sidebarOpen || mobileMenuOpen) && <span className="font-medium truncate">{item.label}</span>}
              </button>
            ))}
          </nav>

          {sidebarOpen && (
            <div className="p-6 bg-brand-pink/30 rounded-3xl text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  whatsappStatus === 'connected' ? "bg-green-500" : "bg-red-500"
                )} />
                <span className={cn(
                  "text-[10px] font-bold uppercase",
                  whatsappStatus === 'connected' ? "text-green-600" : "text-red-600"
                )}>
                  {whatsappStatus === 'connected' ? 'WhatsApp Active' : 'WhatsApp Inactive'}
                </span>
              </div>
              <div className="py-4">
                <CheckCircle className={cn("mx-auto mb-2", whatsappStatus === 'connected' ? "text-green-500" : "text-gray-300")} size={32} />
                <p className="text-xs text-gray-600">WhatsApp Notifications</p>
              </div>
            </div>
          )}

          <button 
            onClick={() => { localStorage.removeItem('adminToken'); navigate('/admin/login'); }}
            className="mt-auto flex items-center gap-4 p-4 text-red-500 hover:bg-red-50 rounded-2xl transition-all"
          >
            <LogOut size={24} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={cn(
        "flex-grow transition-all duration-300 px-3 sm:px-4 md:px-8 py-4 w-full overflow-x-hidden",
        sidebarOpen ? "md:ml-[280px]" : "md:ml-[80px]",
        mobileMenuOpen && "blur-sm md:blur-none"
      )}>
        <div className="max-w-7xl mx-auto text-base">
          {activeTab === 'Dashboard' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-600">Manage your studio bookings and clients.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                  {['weekly', 'monthly', 'yearly'].map((range) => (
                    <button 
                      key={range}
                      onClick={() => setTimeRange(range as any)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all shrink-0",
                        timeRange === range ? "bg-brand-accent text-white" : "bg-white text-gray-500 border border-gray-100"
                      )}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {[
                  { label: 'Total', value: stats.total, icon: LayoutDashboard, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
                  { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
                  { label: 'Completed', value: stats.completed, icon: Star, color: 'text-purple-600', bg: 'bg-purple-50' },
                  { label: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, icon: X, color: 'text-red-600', bg: 'bg-red-50' },
                  { label: 'Today', value: stats.today, icon: Calendar, color: 'text-brand-accent', bg: 'bg-brand-pink/30' },
                ].map((s, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className={cn("p-2 rounded-xl mb-2", s.bg)}>
                      <s.icon className={s.color} size={20} />
                    </div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold truncate w-full">{s.label}</p>
                    <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-4 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold mb-6">Booking Trends</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                        <Tooltip 
                          contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                          cursor={{fill: '#fdf2f8'}}
                        />
                        <Bar dataKey="count" fill="#D4AF37" radius={[4, 4, 0, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold mb-6">Today's Schedule</h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {bookings.filter(b => b.date === format(new Date(), 'yyyy-MM-dd')).length > 0 ? (
                      bookings
                        .filter(b => b.date === format(new Date(), 'yyyy-MM-dd'))
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((b, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="text-center min-w-[50px]">
                              <p className="text-[10px] font-bold text-brand-accent">{b.time}</p>
                            </div>
                            <div className="flex-grow min-w-0">
                              <p className="font-bold text-gray-900 text-sm truncate">{b.name}</p>
                              <p className="text-[10px] text-gray-500 truncate">{b.service}</p>
                            </div>
                            <div className={cn(
                              "w-2 h-2 rounded-full shrink-0",
                              b.status === 'confirmed' ? "bg-green-500" : "bg-orange-500"
                            )} />
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-gray-400 text-sm italic">No bookings for today</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bookings Table */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl font-bold">Bookings for {filterDate}</h2>
                  <input 
                    type="date" 
                    className="input-field py-2 w-full sm:w-auto" 
                    value={filterDate}
                    onChange={e => setFilterDate(e.target.value)}
                  />
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                      <tr>
                        <th className="px-6 py-4">Client</th>
                        <th className="px-6 py-4">Service</th>
                        <th className="px-6 py-4">Time</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Payment</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No bookings for this date.</td>
                        </tr>
                      ) : (
                        filteredBookings.map(b => (
                          <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-gray-900">{b.name}</div>
                              <div className="text-xs text-gray-500">{b.phone}</div>
                            </td>
                            <td className="px-6 py-4 text-sm">{b.service}</td>
                            <td className="px-6 py-4 text-sm font-medium">{b.time}</td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-xs font-bold",
                                b.status === 'confirmed' ? "bg-blue-100 text-blue-700" :
                                b.status === 'pending' ? "bg-amber-100 text-amber-700" :
                                b.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                                "bg-rose-100 text-rose-700"
                              )}>
                                {b.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm capitalize">{b.paymentType}</td>
                             <td className="px-6 py-4">
                               <div className="flex gap-2">
                                 {b.status !== 'completed' && b.status !== 'cancelled' && (
                                   <button 
                                     onClick={() => updateStatus(b._id, 'completed')}
                                     className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                     title="Mark Completed"
                                   >
                                     <CheckCircle size={18} />
                                   </button>
                                 )}
                                 {b.status !== 'cancelled' && b.status !== 'completed' && (
                                   <button 
                                     onClick={() => updateStatus(b._id, 'cancelled')}
                                     className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                     title="Cancel"
                                   >
                                     <X size={18} />
                                   </button>
                                 )}
                                 {(b.status === 'cancelled' || b.status === 'completed') && (
                                   <button 
                                     onClick={() => deleteBooking(b._id)}
                                     className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                     title="Delete Record"
                                   >
                                     <Trash2 size={18} />
                                   </button>
                                 )}
                               </div>
                             </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Categories' && <CategoryManagement confirmAction={confirmAction} />}
          {activeTab === 'Services' && <ServiceManagement confirmAction={confirmAction} />}
          {activeTab === 'Clients' && <ClientManagement confirmAction={confirmAction} />}
          {activeTab === 'Reviews' && <ReviewManagement confirmAction={confirmAction} />}
          {activeTab === 'System Config' && <SystemConfigTab />}
          {activeTab === 'Bookings' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold">All Bookings</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                    <tr>
                      <th className="px-6 py-4">Client</th>
                      <th className="px-6 py-4">Service</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Time</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.map(b => (
                      <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{b.name}</div>
                          <div className="text-xs text-gray-500">{b.phone}</div>
                        </td>
                        <td className="px-6 py-4 text-sm">{b.service}</td>
                        <td className="px-6 py-4 text-sm">{b.date}</td>
                        <td className="px-6 py-4 text-sm font-medium">{b.time}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold",
                            b.status === 'confirmed' ? "bg-green-100 text-green-700" :
                            b.status === 'pending' ? "bg-orange-100 text-orange-700" :
                            b.status === 'completed' ? "bg-purple-100 text-purple-700" :
                            "bg-red-100 text-red-700"
                          )}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {b.status !== 'completed' && b.status !== 'cancelled' && (
                              <button onClick={() => updateStatus(b._id, 'completed')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Mark Completed"><CheckCircle size={18} /></button>
                            )}
                            {b.status !== 'cancelled' && b.status !== 'completed' && (
                              <button onClick={() => updateStatus(b._id, 'cancelled')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Cancel"><X size={18} /></button>
                            )}
                            {(b.status === 'cancelled' || b.status === 'completed') && (
                              <button onClick={() => deleteBooking(b._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete Record"><Trash2 size={18} /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        loading={confirmModal.loading}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {}, loading: false })}
      />
    </div>
  );
};

const ClientManagement = ({ confirmAction }: { confirmAction: any }) => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [reviewSortOrder, setReviewSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingClient, setEditingClient] = useState<any>(null);
  const [clientFormData, setClientFormData] = useState({ name: '', email: '' });
  const [whatsappModal, setWhatsappModal] = useState<{ isOpen: boolean, client: any }>({ isOpen: false, client: null });
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);

  const fetchClients = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await axios.get('/api/admin/clients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(res.data);
    } catch (err) {
      toast.error("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    confirmAction(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? A notification will be sent to the client.',
      async () => {
        const token = localStorage.getItem('adminToken');
        try {
          await axios.patch(`/api/admin/bookings/${bookingId}`, { status: 'cancelled' }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success("Booking cancelled and client notified");
          fetchClients();
          // Update selected client view
          if (selectedClient) {
            setSelectedClient((prev: any) => ({
              ...prev,
              bookings: prev.bookings.map((b: any) => b._id === bookingId ? { ...b, status: 'cancelled' } : b)
            }));
          }
        } catch (err) {
          toast.error("Failed to cancel booking");
          throw err;
        }
      }
    );
  };

  const handleCompleteBooking = async (bookingId: string) => {
    const token = localStorage.getItem('adminToken');
    try {
      await axios.patch(`/api/admin/bookings/${bookingId}`, { status: 'completed' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Booking marked as completed");
      fetchClients();
      if (selectedClient) {
        setSelectedClient((prev: any) => ({
          ...prev,
          bookings: prev.bookings.map((b: any) => b._id === bookingId ? { ...b, status: 'completed' } : b)
        }));
      }
    } catch (err) {
      toast.error("Failed to update booking");
    }
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    try {
      await axios.patch(`/api/admin/clients/${editingClient.phone}`, clientFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Client information updated");
      setEditingClient(null);
      fetchClients();
      if (selectedClient && selectedClient.phone === editingClient.phone) {
        setSelectedClient((prev: any) => ({ ...prev, ...clientFormData }));
      }
    } catch (err) {
      toast.error("Failed to update client");
    }
  };

  const handleDeleteClient = async (phone: string) => {
    confirmAction(
      'Delete Client',
      'Are you sure you want to delete this client and all their booking history? This action cannot be undone.',
      async () => {
        const token = localStorage.getItem('adminToken');
        try {
          await axios.delete(`/api/admin/clients/${phone}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success("Client deleted successfully");
          fetchClients();
          setSelectedClient(null);
        } catch (err) {
          toast.error("Failed to delete client");
          throw err;
        }
      }
    );
  };

  const handleSendWhatsapp = async () => {
    if (!whatsappMessage.trim()) return;
    setSendingWhatsapp(true);
    const token = localStorage.getItem('adminToken');
    try {
      await axios.post('/api/admin/whatsapp/send', {
        phone: whatsappModal.client.phone,
        message: whatsappMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("WhatsApp message sent successfully");
      setWhatsappModal({ isOpen: false, client: null });
      setWhatsappMessage('');
    } catch (err) {
      toast.error("Failed to send WhatsApp message");
    } finally {
      setSendingWhatsapp(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Booking Count', 'Total Spent (KES)', 'Last Booking'];
    const rows = filteredClients.map(c => [
      c.name,
      c.phone,
      c.email || 'N/A',
      c.bookingCount,
      c.totalSpent || 0,
      c.lastBooking
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `katiani_clients_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.phone.includes(searchTerm) || 
                         (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filter === 'all') return matchesSearch;
    if (filter === 'frequent') return matchesSearch && c.bookingCount > 2;
    return matchesSearch;
  });

  if (selectedClient) {
    const sortedBookings = [...selectedClient.bookings].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return (
      <div className="space-y-8">
        <button onClick={() => setSelectedClient(null)} className="flex items-center gap-2 text-gray-500 hover:text-brand-accent transition-colors">
          <ArrowLeft size={20} /> Back to Directory
        </button>

        <div className="glass-card p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-brand-pink flex items-center justify-center text-brand-accent font-bold text-3xl">
                {selectedClient.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-serif font-bold text-gray-900">{selectedClient.name}</h2>
                  <button 
                    onClick={() => { setEditingClient(selectedClient); setClientFormData({ name: selectedClient.name, email: selectedClient.email || '' }); }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Client Info"
                  >
                    <Edit size={18} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="flex items-center gap-2 text-gray-500 text-sm"><Phone size={14} /> {selectedClient.phone}</div>
                  {selectedClient.email && <div className="flex items-center gap-2 text-gray-500 text-sm"><Mail size={14} /> {selectedClient.email}</div>}
                </div>
                <button 
                  onClick={() => setWhatsappModal({ isOpen: true, client: selectedClient })}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all text-sm font-medium"
                >
                  <MessageSquare size={16} />
                  Send WhatsApp Message
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-brand-pink/30 px-6 py-4 rounded-2xl text-center flex-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Total Bookings</p>
                <p className="text-2xl font-bold text-brand-accent">{selectedClient.bookingCount}</p>
              </div>
              <div className="bg-brand-pink/30 px-6 py-4 rounded-2xl text-center flex-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Total Spent</p>
                <p className="text-2xl font-bold text-brand-accent">KSh {selectedClient.totalSpent?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-brand-pink/30 px-6 py-4 rounded-2xl text-center flex-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Avg Value</p>
                <p className="text-2xl font-bold text-brand-accent">KSh {Math.round((selectedClient.totalSpent || 0) / (selectedClient.bookingCount || 1)).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Booking History</h3>
              <button 
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-accent"
              >
                Sort by Date {sortOrder === 'desc' ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedBookings.map((b: any) => (
                    <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium">{b.service}</td>
                      <td className="px-6 py-4 text-sm">{b.date}</td>
                      <td className="px-6 py-4 text-sm">{b.time}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold",
                          b.status === 'confirmed' ? "bg-green-100 text-green-700" :
                          b.status === 'pending' ? "bg-orange-100 text-orange-700" :
                          b.status === 'completed' ? "bg-purple-100 text-purple-700" :
                          "bg-red-100 text-red-700"
                        )}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {b.status !== 'cancelled' && b.status !== 'completed' && (
                            <>
                              <button 
                                onClick={() => handleCompleteBooking(b._id)}
                                className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors"
                                title="Mark as Completed"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button 
                                onClick={() => handleCancelBooking(b._id)}
                                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                title="Cancel Booking"
                              >
                                <X size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="space-y-6 pt-8 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Client Reviews</h3>
              <button 
                onClick={() => setReviewSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-accent"
              >
                Sort by Date {reviewSortOrder === 'desc' ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedClient.bookings
                .filter((b: any) => b.review)
                .sort((a: any, b: any) => {
                  const dateA = new Date(a.review.createdAt).getTime();
                  const dateB = new Date(b.review.createdAt).getTime();
                  return reviewSortOrder === 'desc' ? dateB - dateA : dateA - dateB;
                })
                .map((b: any) => (
                  <div key={b.review._id} className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className={i < b.review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 italic mb-4 text-sm">"{b.review.comment}"</p>
                    <div className="flex justify-between items-center text-[10px] text-gray-400">
                      <span>Service: {b.service}</span>
                      <span>{format(new Date(b.review.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                ))}
              {selectedClient.bookings.filter((b: any) => b.review).length === 0 && (
                <div className="col-span-full text-center py-10 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <p className="text-gray-500 text-sm">No reviews submitted by this client yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* WhatsApp Modal */}
        {whatsappModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl sm:text-2xl font-serif font-bold">Send WhatsApp</h3>
                <button onClick={() => setWhatsappModal({ isOpen: false, client: null })} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">Sending to: <span className="font-bold">{whatsappModal.client.name} ({whatsappModal.client.phone})</span></p>
              <textarea 
                className="input-field min-h-[150px] mb-6 text-sm"
                placeholder="Type your message here..."
                value={whatsappMessage}
                onChange={(e) => setWhatsappMessage(e.target.value)}
              />
              <div className="flex gap-4">
                <button 
                  onClick={() => setWhatsappModal({ isOpen: false, client: null })}
                  className="btn-secondary flex-1 py-2 text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSendWhatsapp}
                  disabled={sendingWhatsapp || !whatsappMessage.trim()}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-2 text-sm"
                >
                  {sendingWhatsapp ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <MessageSquare size={18} />
                      Send Now
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-serif font-bold">Client Directory</h2>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              className="input-field pl-10" 
              placeholder="Search clients..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="input-field w-auto"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="all">All Clients</option>
            <option value="frequent">Frequent Clients</option>
          </select>
          <button 
            onClick={exportToCSV}
            className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {editingClient && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif font-bold">Edit Client Info</h3>
              <button onClick={() => setEditingClient(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateClient} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Full Name</label>
                <input 
                  required
                  className="input-field"
                  value={clientFormData.name}
                  onChange={e => setClientFormData({ ...clientFormData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Email</label>
                <input 
                  type="email"
                  className="input-field"
                  value={clientFormData.email}
                  onChange={e => setClientFormData({ ...clientFormData, email: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setEditingClient(null)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Update Client</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(client => (
          <motion.div 
            key={client._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            onClick={() => setSelectedClient(client)}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-brand-pink flex items-center justify-center text-brand-accent font-bold text-xl">
                {client.name[0]}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{client.name}</h3>
                <p className="text-xs text-gray-500">{client.phone}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Bookings</span>
                <span className="font-bold text-brand-accent">{client.bookingCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Last Visit</span>
                <span className="font-medium">{client.lastBooking}</span>
              </div>
              <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                <span className="text-xs font-bold text-brand-accent uppercase">View Details</span>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteClient(client.phone); }}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Client"
                  >
                    <Trash2 size={16} />
                  </button>
                  <ArrowRight size={14} className="text-brand-accent" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const ServiceManagement = ({ confirmAction }: { confirmAction: any }) => {
  const { services, fetchServices } = useServices();
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    images: [] as (string | File)[]
  });

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data);
    } catch (err) {
      toast.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const MAX_SIZE = 20 * 1024 * 1024; // 20MB

    Array.from(files).forEach((file: File) => {
      if (file.size > MAX_SIZE) {
        toast.error(`Image ${file.name} is too large. Max size is 20MB.`);
        return;
      }
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, file]
      }));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      return toast.error("Please enter a valid positive price");
    }
    if (!formData.duration.trim()) {
      return toast.error("Please enter a duration");
    }

    const token = localStorage.getItem('adminToken');
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('price', formData.price);
    submitData.append('duration', formData.duration);
    submitData.append('category', formData.category);

    const existingImages = formData.images.filter(img => typeof img === 'string');
    const newImageFiles = formData.images.filter(img => typeof img !== 'string') as File[];

    submitData.append('existingImages', JSON.stringify(existingImages));
    newImageFiles.forEach(file => {
      submitData.append('images', file);
    });

    try {
      if (editingService) {
        await axios.patch(`/api/admin/services/${editingService._id}`, submitData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success("Service updated");
      } else {
        await axios.post('/api/admin/services', submitData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success("Service added");
      }
      setShowForm(false);
      setEditingService(null);
      setFormData({ name: '', description: '', price: '', duration: '', category: '', images: [] });
      fetchServices();
    } catch (err) {
      toast.error("Failed to save service");
    }
  };

  const handleDelete = async (id: string) => {
    confirmAction(
      'Delete Service',
      'Are you sure you want to delete this service?',
      async () => {
        const token = localStorage.getItem('adminToken');
        try {
          await axios.delete(`/api/admin/services/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success("Service deleted");
          fetchServices();
        } catch (err) {
          toast.error("Failed to delete service");
          throw err;
        }
      }
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif font-bold">Manage Services</h2>
        <button 
          onClick={() => { setShowForm(true); setEditingService(null); setFormData({ name: '', description: '', price: '', duration: '', images: [] }); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> Add Service
        </button>
      </div>

      {showForm && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">{editingService ? "Edit Service" : "New Service"}</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Service Name</label>
                <input 
                  required
                  className="input-field"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Duration (e.g., 2 hours)</label>
                <input 
                  required
                  className="input-field"
                  value={formData.duration}
                  onChange={e => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Category</label>
                <select 
                  className="input-field"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">No Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Price (KES)</label>
                <input 
                  required
                  type="number"
                  className="input-field"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Images</label>
                <div className="flex gap-4 items-center">
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 p-4 rounded-2xl flex items-center gap-2 text-gray-600 transition-colors">
                    <Upload size={20} />
                    <span>Upload Images</span>
                    <input type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" />
                  </label>
                  <p className="text-xs text-gray-400">{formData.images.length} images selected</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Description</label>
              <textarea 
                required
                className="input-field min-h-[100px]"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            
            {formData.images.length > 0 && (
              <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                {formData.images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img 
                      src={typeof img === 'string' ? img : URL.createObjectURL(img)} 
                      className="w-full h-full object-cover" 
                    />
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                      className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Save Service</button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service._id || service.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group">
            <div className="h-48 relative overflow-hidden">
              <img 
                src={service.images?.[0] || service.image || PLACEHOLDER_IMAGE} 
                className="w-full h-full object-cover transition-transform group-hover:scale-105" 
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => { 
                    setEditingService(service); 
                    setFormData({ 
                      name: service.name, 
                      description: service.description, 
                      price: service.price.toString(), 
                      duration: service.duration, 
                      category: service.category?._id || service.category || '',
                      images: service.images || [] 
                    }); 
                    setShowForm(true); 
                  }}
                  className="p-2 bg-white/90 hover:bg-white rounded-xl text-blue-600 shadow-sm transition-colors"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(service._id)}
                  className="p-2 bg-white/90 hover:bg-white rounded-xl text-red-600 shadow-sm transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-xl">{service.name}</h3>
                <span className="text-[10px] font-bold bg-brand-accent/10 text-brand-accent px-2 py-1 rounded-full uppercase tracking-wider">
                  {service.category?.name || 'General'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{service.duration}</span>
                <span className="font-bold text-brand-accent">KES {service.price.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SystemConfigTab = () => {
  const [config, setConfig] = useState<any>({
    whatsappToken: '',
    whatsappPhoneNumberId: '',
    adminWhatsApp: '',
    mongoURI: '',
    mpesaConsumerKey: '',
    mpesaConsumerSecret: '',
    mpesaShortcode: '',
    mpesaPasskey: '',
    mpesaCallbackURL: '',
    cloudinaryCloudName: '',
    cloudinaryApiKey: '',
    cloudinaryApiSecret: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingMpesa, setTestingMpesa] = useState(false);
  const [testPhone, setTestPhone] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await axios.get('/api/admin/config', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConfig(res.data);
    } catch (err) {
      toast.error("Failed to fetch system configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('adminToken');
    try {
      await axios.post('/api/admin/config', config, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Configuration saved successfully");
      fetchConfig();
    } catch (err) {
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleTestMpesa = async () => {
    if (!testPhone || testPhone.length < 9) {
      toast.error("Enter a valid phone number to test");
      return;
    }
    setTestingMpesa(true);
    try {
      const res = await axios.post('/api/payments/stkpush', {
        phone: testPhone,
        amount: 1, // Test with 1 KES
        bookingId: "test-" + Math.random().toString(36).substring(7), // Dummy ID
        shortCode: config.mpesaShortcode,
        passkey: config.mpesaPasskey,
        consumerKey: config.mpesaConsumerKey,
        consumerSecret: config.mpesaConsumerSecret,
        callbackUrl: config.mpesaCallbackURL
      });
      if (res.data.success) {
        toast.success("STK Push triggered! Check your phone.");
      } else {
        toast.error(res.data.message || "STK Push failed");
      }
    } catch (err: any) {
      console.error("M-Pesa Test Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || err.response?.data?.error || "M-Pesa request failed");
    } finally {
      setTestingMpesa(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-gray-900">System Configuration</h2>
        <p className="text-gray-600">Manage WhatsApp Cloud API, M-Pesa, and Database credentials securely.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* WhatsApp Cloud API Section */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
              <Phone size={24} />
            </div>
            <h3 className="text-xl font-bold">WhatsApp Cloud API</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Access Token</label>
              <input 
                type="password"
                value={config.whatsappToken}
                onChange={(e) => setConfig({...config, whatsappToken: e.target.value})}
                placeholder="EAAB..."
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-brand-accent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number ID</label>
              <input 
                type="text"
                value={config.whatsappPhoneNumberId}
                onChange={(e) => setConfig({...config, whatsappPhoneNumberId: e.target.value})}
                placeholder="1234567890..."
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-brand-accent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Admin WhatsApp Number</label>
              <div className="flex items-center gap-0 border border-gray-200 rounded-2xl bg-white focus-within:border-brand-accent transition-all overflow-hidden">
                <span className="pl-4 pr-2 py-3 text-gray-500 font-bold border-r border-gray-100 bg-gray-50/50">
                  +254
                </span>
                <input 
                  type="tel"
                  value={formatKenyanNumber(config.adminWhatsApp)}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.startsWith('0')) val = val.slice(1);
                    if (val.startsWith('254')) val = val.slice(3);
                    if (val.length <= 9) setConfig({...config, adminWhatsApp: val});
                  }}
                  placeholder="712 345 678"
                  className="flex-1 px-4 py-3 outline-none text-gray-900 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* M-Pesa Section */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-50 rounded-2xl text-green-600">
              <QrCode size={24} />
            </div>
            <h3 className="text-xl font-bold">M-Pesa Daraja 3.0</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Consumer Key</label>
              <input 
                type="password"
                value={config.mpesaConsumerKey}
                onChange={(e) => setConfig({...config, mpesaConsumerKey: e.target.value})}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-brand-accent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Consumer Secret</label>
              <input 
                type="password"
                value={config.mpesaConsumerSecret}
                onChange={(e) => setConfig({...config, mpesaConsumerSecret: e.target.value})}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-brand-accent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Shortcode</label>
              <input 
                type="text"
                value={config.mpesaShortcode}
                onChange={(e) => setConfig({...config, mpesaShortcode: e.target.value})}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-brand-accent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Passkey</label>
              <input 
                type="password"
                value={config.mpesaPasskey}
                onChange={(e) => setConfig({...config, mpesaPasskey: e.target.value})}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-brand-accent outline-none transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Callback URL (Must be HTTPS)</label>
              <input 
                type="text"
                value={config.mpesaCallbackURL}
                onChange={(e) => setConfig({...config, mpesaCallbackURL: e.target.value})}
                placeholder="https://your-domain.run.app/api/mpesa/callback"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-brand-accent outline-none transition-all"
              />
              <p className="mt-2 text-xs text-gray-500 italic">Leave empty to use the default system callback URL.</p>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-100">
            <h4 className="font-bold text-gray-800 mb-4">Test M-Pesa STK Push</h4>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 flex items-center gap-0 border border-gray-200 rounded-2xl bg-white focus-within:border-brand-accent transition-all overflow-hidden">
                <span className="pl-4 pr-2 py-3 text-gray-500 font-bold border-r border-gray-100 bg-gray-50/50">
                  +254
                </span>
                <input 
                  type="tel"
                  value={formatKenyanNumber(testPhone)}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.startsWith('0')) val = val.slice(1);
                    if (val.startsWith('254')) val = val.slice(3);
                    if (val.length <= 9) setTestPhone(val);
                  }}
                  placeholder="712 345 678"
                  className="flex-1 px-4 py-3 outline-none text-gray-900 font-medium"
                />
              </div>
              <button 
                type="button"
                onClick={handleTestMpesa}
                disabled={testingMpesa}
                className="px-8 py-3 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {testingMpesa ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <QrCode size={20} />}
                Test STK Push
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500 italic">This will use the credentials entered above (even if not saved yet) to trigger a 1 KES STK push.</p>
          </div>
        </div>

        {/* Cloudinary Section */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
              <ImageIcon size={24} />
            </div>
            <h3 className="text-xl font-bold">Cloudinary Storage</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Cloud Name</label>
              <input 
                type="text"
                value={config.cloudinaryCloudName}
                onChange={(e) => setConfig({...config, cloudinaryCloudName: e.target.value})}
                placeholder="d..."
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-brand-accent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">API Key</label>
              <input 
                type="password"
                value={config.cloudinaryApiKey}
                onChange={(e) => setConfig({...config, cloudinaryApiKey: e.target.value})}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-brand-accent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">API Secret</label>
              <input 
                type="password"
                value={config.cloudinaryApiSecret}
                onChange={(e) => setConfig({...config, cloudinaryApiSecret: e.target.value})}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-brand-accent outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Database Section */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
              <Database size={24} />
            </div>
            <h3 className="text-xl font-bold">Database</h3>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">MongoDB URI</label>
            <input 
              type="password"
              value={config.mongoURI}
              onChange={(e) => setConfig({...config, mongoURI: e.target.value})}
              placeholder="mongodb+srv://..."
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-brand-accent outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit"
            disabled={saving}
            className="bg-brand-accent text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-brand-pink-dark/20 hover:scale-105 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};

const CategoryManagement = ({ confirmAction }: { confirmAction: any }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data);
    } catch (err) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    try {
      if (editingCategory) {
        await axios.patch(`/api/admin/categories/${editingCategory._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Category updated");
      } else {
        await axios.post('/api/admin/categories', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Category created");
      }
      setShowForm(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
      fetchCategories();
    } catch (err) {
      toast.error("Failed to save category");
    }
  };

  const handleDelete = async (id: string) => {
    confirmAction(
      'Delete Category',
      'Are you sure you want to delete this category? This will only work if no services are using it.',
      async () => {
        const token = localStorage.getItem('adminToken');
        try {
          await axios.delete(`/api/admin/categories/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success("Category deleted");
          fetchCategories();
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Failed to delete category");
          throw err;
        }
      }
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif font-bold">Manage Categories</h2>
        <button 
          onClick={() => { setShowForm(true); setEditingCategory(null); setFormData({ name: '', description: '' }); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> Add Category
        </button>
      </div>

      {showForm && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          <h3 className="text-xl font-bold mb-6">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Category Name</label>
                <input 
                  required
                  className="input-field"
                  placeholder="e.g., Classic Sets"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Description</label>
                <input 
                  className="input-field"
                  placeholder="Short description..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Save Category</button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div key={cat._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900">{cat.name}</h3>
              <p className="text-xs text-gray-500">{cat.description || 'No description'}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => { setEditingCategory(cat); setFormData({ name: cat.name, description: cat.description || '' }); setShowForm(true); }}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit size={18} />
              </button>
              <button 
                onClick={() => handleDelete(cat._id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-500">No categories found. Add your first category to organize your services.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ReviewManagement = ({ confirmAction }: { confirmAction: any }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await axios.get('/api/admin/reviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(res.data);
    } catch (err) {
      toast.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem('adminToken');
    try {
      await axios.patch(`/api/admin/reviews/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Review ${status}`);
      fetchReviews();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const deleteReview = async (id: string) => {
    confirmAction(
      'Delete Review',
      'Are you sure you want to delete this review?',
      async () => {
        const token = localStorage.getItem('adminToken');
        try {
          await axios.delete(`/api/admin/reviews/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success("Review deleted");
          fetchReviews();
        } catch (err) {
          toast.error("Failed to delete review");
          throw err;
        }
      }
    );
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif font-bold text-gray-900">Reviews Management</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div key={review._id} className="glass-card p-6 relative group">
            <div className="absolute top-4 right-4 flex gap-2">
              <button 
                onClick={() => deleteReview(review._id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg md:opacity-0 md:group-hover:opacity-100 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="mb-4">
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                review.status === 'approved' ? "bg-green-100 text-green-600" : 
                review.status === 'rejected' ? "bg-red-100 text-red-600" : 
                "bg-yellow-100 text-yellow-600"
              )}>
                {review.status}
              </span>
            </div>

            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={16} 
                  className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
                />
              ))}
            </div>
            <p className="text-gray-700 italic mb-4">"{review.comment}"</p>
            
            <div className="flex gap-2 mb-4">
              {review.status !== 'approved' && (
                <button 
                  onClick={() => updateStatus(review._id, 'approved')}
                  className="flex-1 py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-all"
                >
                  Approve
                </button>
              )}
              {review.status !== 'rejected' && (
                <button 
                  onClick={() => updateStatus(review._id, 'rejected')}
                  className="flex-1 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-all"
                >
                  Reject
                </button>
              )}
            </div>

            <div className="flex justify-between items-center text-xs text-gray-400">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-gray-600">{review.bookingId?.name || 'Unknown Client'}</span>
                <span className="truncate max-w-[150px]">Service: {review.bookingId?.service || 'N/A'}</span>
              </div>
              <span>{format(new Date(review.createdAt), 'MMM d, yyyy')}</span>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-500">No reviews found yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/book" element={<BookingPage />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/payment-status" element={<PaymentStatus />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-center" richColors />
      </div>
    </Router>
  );
}
