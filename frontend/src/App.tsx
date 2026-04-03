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

// Configure axios base URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

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

const Home = () => {
  const { services, loading } = useServices();
  const navigate = useNavigate();

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1583001931046-f99990207202?auto=format&fit=crop&q=80" 
            className="w-full h-full object-cover opacity-60"
            alt="Hero background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-pink/40 via-transparent to-white" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-accent/10 text-brand-accent font-bold text-xs uppercase tracking-widest mb-6 border border-brand-accent/20">
              Premium Lash Artistry in Nairobi
            </span>
            <h1 className="text-6xl md:text-8xl font-serif font-bold text-gray-900 mb-8 leading-tight">
              Elegance in <br />
              <span className="text-brand-accent italic">Every Blink</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">
              Experience the art of precision lash extensions. We specialize in creating custom looks that enhance your natural beauty and boost your confidence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/book" className="btn-primary px-10 py-4 text-lg w-full sm:w-auto shadow-xl shadow-brand-pink-dark/20">
                Book Appointment
              </Link>
              <Link to="/services" className="btn-secondary px-10 py-4 text-lg w-full sm:w-auto bg-white/50 backdrop-blur-sm">
                View Services
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-brand-accent"
        >
          <ChevronDown size={32} />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Happy Clients', value: '1,000+' },
            { label: 'Lash Styles', value: '12+' },
            { label: 'Years Experience', value: '5+' },
            { label: 'Rating', value: '4.9/5' }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-serif font-bold text-brand-accent mb-2">{stat.value}</div>
              <div className="text-sm text-gray-500 uppercase tracking-widest font-bold">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Services */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">Our Signature Styles</h2>
            <p className="text-gray-600">From natural classic sets to dramatic mega volume, discover the perfect style for your eyes.</p>
          </div>
          <Link to="/services" className="text-brand-accent font-bold flex items-center gap-2 hover:gap-3 transition-all">
            Explore All Services <ArrowRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-100 rounded-3xl animate-pulse" />
            ))
          ) : (
            services.slice(0, 3).map((service) => (
              <ServiceCard key={service._id || service.id} service={service} />
            ))
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-brand-pink/30 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80" 
                  className="w-full h-full object-cover"
                  alt="Lash application process"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-3xl shadow-xl max-w-xs hidden md:block border border-brand-pink-dark">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                    <Shield size={24} />
                  </div>
                  <div className="font-bold">Certified Professional</div>
                </div>
                <p className="text-sm text-gray-600">Our technicians are highly trained and use only premium, medical-grade products.</p>
              </div>
            </div>
            
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">The katiani Experience</h2>
              <div className="space-y-6">
                {[
                  { title: 'Custom Consultations', desc: 'Every eye shape is unique. We customize every set to complement your features.', icon: <UserIcon /> },
                  { title: 'Premium Products', desc: 'We use high-quality lashes and adhesives that are safe and long-lasting.', icon: <Star /> },
                  { title: 'Luxury Comfort', desc: 'Relax in our premium studio designed for your ultimate comfort and peace.', icon: <CheckCircle /> }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-brand-accent shadow-sm border border-brand-pink-dark">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/book" className="btn-primary inline-block px-10 py-4">Start Your Journey</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-serif font-bold mb-16">What Our Clients Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Sarah M.', text: 'The best lash experience I\'ve ever had! They look so natural and lasted for weeks.', rating: 5 },
            { name: 'Anita K.', text: 'Professional, clean, and the results are stunning. I get compliments every day!', rating: 5 },
            { name: 'Grace W.', text: 'Absolutely love my mega volume set. The studio is so cozy and relaxing.', rating: 5 }
          ].map((review, i) => (
            <div key={i} className="glass-card p-8 text-left">
              <div className="flex gap-1 mb-4 text-brand-gold">
                {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-gray-700 italic mb-6">"{review.text}"</p>
              <div className="font-bold text-gray-900">— {review.name}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const ServiceCard: React.FC<{ service: Service }> = ({ service }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100"
    >
      <div className="aspect-[4/5] relative overflow-hidden">
        <img 
          src={service.images?.[0] || service.image || PLACEHOLDER_IMAGE} 
          alt={service.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        
        <div className="absolute top-6 left-6">
          <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest border border-white/30">
            {service.category?.name || 'Signature'}
          </span>
        </div>

        <div className="absolute bottom-6 left-6 right-6 text-white">
          <h3 className="text-2xl font-serif font-bold mb-2">{service.name}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm opacity-90">
              <Clock size={14} />
              <span>{service.duration}</span>
            </div>
            <div className="text-xl font-bold text-brand-gold">
              KES {service.price.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
          {service.description}
        </p>
        <button 
          onClick={() => navigate(`/book?service=${service._id || service.id}`)}
          className="w-full py-3 rounded-2xl bg-brand-pink text-brand-accent font-bold text-sm hover:bg-brand-accent hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group/btn"
        >
          Book This Style
          <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

const ServicesPage = () => {
  const { services, loading } = useServices();
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/categories');
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories");
      }
    };
    fetchCategories();
  }, []);

  const filteredServices = activeCategory === 'all' 
    ? services 
    : services.filter(s => (s.category?._id || s.category) === activeCategory);

  return (
    <div className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6"
          >
            Our Service Menu
          </motion.h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our range of professional lash services. Each treatment is tailored to your unique eye shape and desired look.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button 
            onClick={() => setActiveCategory('all')}
            className={cn(
              "px-6 py-2.5 rounded-full text-sm font-bold transition-all",
              activeCategory === 'all' 
                ? "bg-brand-accent text-white shadow-lg shadow-brand-pink-dark/20" 
                : "bg-white text-gray-600 hover:bg-brand-pink border border-brand-pink-dark"
            )}
          >
            All Services
          </button>
          {categories.map(cat => (
            <button 
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-bold transition-all",
                activeCategory === cat._id 
                  ? "bg-brand-accent text-white shadow-lg shadow-brand-pink-dark/20" 
                  : "bg-white text-gray-600 hover:bg-brand-pink border border-brand-pink-dark"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="h-[500px] bg-gray-100 rounded-[2rem] animate-pulse" />
            ))
          ) : (
            filteredServices.map((service) => (
              <ServiceCard key={service._id || service.id} service={service} />
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

  const { services, loading: servicesLoading } = useServices();
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1));
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    serviceId: initialService,
    time: '',
    paymentType: 'deposit' as 'deposit' | 'cash'
  });

  useEffect(() => {
    if (formData.serviceId && selectedDate) {
      fetchAvailability();
    }
  }, [formData.serviceId, selectedDate]);

  const fetchAvailability = async () => {
    setLoadingSlots(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const res = await axios.get(`/api/bookings/availability?date=${dateStr}`);
      const bookedSlots = res.data.map((b: any) => b.time);
      setAvailableSlots(TIME_SLOTS.filter(slot => !bookedSlots.includes(slot)));
    } catch (err) {
      toast.error("Failed to load available times");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.time) return toast.error("Please select a time slot");
    
    // Validate phone
    if (formData.phone.length !== 9) {
      return toast.error("Please enter a valid 9-digit phone number");
    }

    setIsSubmitting(true);
    try {
      const bookingData = {
        ...formData,
        phone: '254' + formData.phone,
        date: format(selectedDate, 'yyyy-MM-dd')
      };

      const res = await axios.post('/api/bookings', bookingData);
      const booking = res.data;

      if (formData.paymentType === 'deposit') {
        // Trigger STK Push
        const paymentRes = await axios.post('/api/payments/stkpush', {
          phone: bookingData.phone,
          amount: booking.depositAmount,
          bookingId: booking._id
        });

        if (paymentRes.data.success) {
          toast.success("STK Push sent! Please check your phone.");
          navigate(`/payment-status?checkoutID=${paymentRes.data.CheckoutRequestID}`);
        } else {
          toast.error("Failed to trigger payment. Please try again.");
        }
      } else {
        localStorage.setItem('lastBooking', JSON.stringify(booking));
        navigate('/success');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-4 bg-brand-pink/20 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-8">
              <h1 className="text-3xl font-serif font-bold mb-8">Book Your Appointment</h1>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Full Name</label>
                    <input 
                      required
                      className="input-field"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Phone Number</label>
                    <div className="flex items-center gap-0 border border-gray-200 rounded-2xl bg-white focus-within:border-brand-accent transition-all overflow-hidden">
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
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-gray-700">Email Address</label>
                    <input 
                      required
                      type="email"
                      className="input-field"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-gray-700">Select Service</label>
                    <select 
                      required
                      className="input-field"
                      value={formData.serviceId}
                      onChange={e => setFormData({...formData, serviceId: e.target.value})}
                    >
                      <option value="">Choose a style...</option>
                      {services.map(s => (
                        <option key={s._id || s.id} value={s._id || s.id}>
                          {s.name} — KES {s.price.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-700 block">Select Date</label>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {[...Array(14)].map((_, i) => {
                      const date = addDays(new Date(), i + 1);
                      const isSelected = isSameDay(date, selectedDate);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedDate(date)}
                          className={cn(
                            "flex-shrink-0 w-20 py-4 rounded-2xl flex flex-col items-center transition-all border",
                            isSelected 
                              ? "bg-brand-accent text-white border-brand-accent shadow-lg shadow-brand-pink-dark/20" 
                              : "bg-white text-gray-600 border-gray-100 hover:border-brand-pink-dark"
                          )}
                        >
                          <span className="text-[10px] uppercase font-bold opacity-70">{format(date, 'EEE')}</span>
                          <span className="text-xl font-bold">{format(date, 'd')}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-700 block">Select Time</label>
                  {loadingSlots ? (
                    <div className="flex gap-4">
                      {[...Array(4)].map((_, i) => <div key={i} className="h-12 w-24 bg-gray-100 rounded-xl animate-pulse" />)}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {availableSlots.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setFormData({...formData, time: slot})}
                          className={cn(
                            "py-3 rounded-xl text-sm font-bold transition-all border",
                            formData.time === slot 
                              ? "bg-brand-accent text-white border-brand-accent" 
                              : "bg-white text-gray-600 border-gray-100 hover:border-brand-pink-dark"
                          )}
                        >
                          {slot}
                        </button>
                      ))}
                      {availableSlots.length === 0 && (
                        <p className="col-span-full text-sm text-red-500 italic">No slots available for this date.</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-700 block">Payment Method</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, paymentType: 'deposit'})}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all",
                        formData.paymentType === 'deposit' ? "border-brand-accent bg-brand-accent/5 ring-1 ring-brand-accent" : "border-gray-100 bg-white"
                      )}
                    >
                      <div className="font-bold mb-1">M-Pesa Deposit (50%)</div>
                      <div className="text-xs text-gray-500">Pay KES {((services.find(s => (s._id || s.id) === formData.serviceId)?.price || 0) * 0.5).toLocaleString()} now to secure slot.</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, paymentType: 'cash'})}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all",
                        formData.paymentType === 'cash' ? "border-brand-accent bg-brand-accent/5 ring-1 ring-brand-accent" : "border-gray-100 bg-white"
                      )}
                    >
                      <div className="font-bold mb-1">Pay at Studio</div>
                      <div className="text-xs text-gray-500">Pay full amount after your session.</div>
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || !formData.time}
                  className="btn-primary w-full py-4 text-lg shadow-xl shadow-brand-pink-dark/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Processing..." : "Confirm Booking"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Summary */}
          <div className="space-y-6">
            <div className="glass-card p-6 sticky top-32">
              <h3 className="text-xl font-serif font-bold mb-6">Booking Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="text-gray-500 text-sm">Service</div>
                  <div className="font-bold text-right">{services.find(s => (s._id || s.id) === formData.serviceId)?.name || 'Not selected'}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-gray-500 text-sm">Date</div>
                  <div className="font-bold">{format(selectedDate, 'MMM d, yyyy')}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-gray-500 text-sm">Time</div>
                  <div className="font-bold">{formData.time || 'Not selected'}</div>
                </div>
                <div className="pt-4 border-t border-brand-pink-dark">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-gray-500 text-sm">Total Price</div>
                    <div className="text-xl font-bold">KES {(services.find(s => (s._id || s.id) === formData.serviceId)?.price || 0).toLocaleString()}</div>
                  </div>
                  {formData.paymentType === 'deposit' && (
                    <div className="flex justify-between items-center text-brand-accent font-bold">
                      <div className="text-sm">Deposit Due Now</div>
                      <div>KES {((services.find(s => (s._id || s.id) === formData.serviceId)?.price || 0) * 0.5).toLocaleString()}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 p-4 bg-brand-pink/50 rounded-2xl border border-brand-pink-dark">
                <div className="flex gap-3 text-xs text-brand-accent leading-relaxed">
                  <Shield size={16} className="flex-shrink-0" />
                  <p>Your data is secure. We'll send a confirmation via WhatsApp once your booking is confirmed.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SuccessPage = () => {
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    const lastBooking = localStorage.getItem('lastBooking');
    if (lastBooking) {
      setBooking(JSON.parse(lastBooking));
    }
  }, []);

  return (
    <div className="pt-32 pb-20 px-4 min-h-screen flex items-center justify-center bg-brand-pink/20">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card p-12 max-w-2xl w-full text-center"
      >
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle size={48} />
        </div>
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-8 text-lg">
          Thank you for choosing katiani.Styles. We've sent a confirmation message to your WhatsApp.
        </p>

        {booking && (
          <div className="bg-white/50 rounded-3xl p-8 mb-8 text-left border border-brand-pink-dark">
            <h3 className="font-bold text-gray-900 mb-4 border-b border-brand-pink-dark pb-2">Appointment Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-gray-500">Service:</div>
              <div className="font-bold text-right">{booking.serviceName}</div>
              <div className="text-gray-500">Date:</div>
              <div className="font-bold text-right">{format(new Date(booking.date), 'MMMM d, yyyy')}</div>
              <div className="text-gray-500">Time:</div>
              <div className="font-bold text-right">{booking.time}</div>
              <div className="text-gray-500">Client:</div>
              <div className="font-bold text-right">{booking.name}</div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => navigate('/')} className="btn-secondary px-8 py-3">Back to Home</button>
          <button onClick={() => navigate('/my-bookings')} className="btn-primary px-8 py-3">View My Bookings</button>
        </div>
      </motion.div>
    </div>
  );
};

const PaymentStatus = () => {
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const checkoutID = new URLSearchParams(location.search).get('checkoutID');

  useEffect(() => {
    if (!checkoutID) {
      navigate('/');
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await axios.get(`/api/payments/status/${checkoutID}`);
        if (res.data.status === 'COMPLETED') {
          setStatus('success');
          setLoading(false);
          localStorage.setItem('lastBooking', JSON.stringify(res.data.booking));
        } else if (res.data.status === 'FAILED') {
          setStatus('failed');
          setLoading(false);
        }
      } catch (err) {
        console.error("Status check failed");
      }
    };

    const interval = setInterval(checkStatus, 3000);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (status === 'pending') setStatus('failed');
      setLoading(false);
    }, 60000); // 1 minute timeout

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [checkoutID, navigate, status]);

  return (
    <div className="pt-32 pb-20 px-4 min-h-screen flex items-center justify-center bg-brand-pink/20">
      <div className="glass-card p-12 max-w-md w-full text-center">
        {status === 'pending' && (
          <>
            <div className="w-20 h-20 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto mb-8" />
            <h2 className="text-2xl font-serif font-bold mb-4">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your M-Pesa transaction. Do not refresh this page.</p>
          </>
        )}

        {status === 'success' && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-4">Payment Successful!</h2>
            <p className="text-gray-600 mb-8">Your deposit has been received and your slot is secured.</p>
            <button onClick={() => navigate('/success')} className="btn-primary w-full py-3">Continue</button>
          </motion.div>
        )}

        {status === 'failed' && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <X size={40} />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-4">Payment Failed</h2>
            <p className="text-gray-600 mb-8">We couldn't verify your payment. If you've paid, please contact us with your transaction code.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => navigate('/book')} className="btn-primary w-full py-3">Try Again</button>
              <button onClick={() => navigate('/')} className="btn-secondary w-full py-3">Back to Home</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const MyBookings = () => {
  const [phone, setPhone] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 9) return toast.error("Enter a valid 9-digit phone number");
    
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
    <div className="pt-32 pb-20 px-4 min-h-screen bg-brand-pink/20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">My Bookings</h1>
          <p className="text-gray-600">Enter your phone number to view and manage your appointments.</p>
        </div>

        <div className="glass-card p-8 mb-12">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex items-center gap-0 border border-gray-200 rounded-2xl bg-white focus-within:border-brand-accent transition-all overflow-hidden">
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
            <button type="submit" disabled={loading} className="btn-primary px-10 py-3 flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search size={20} />}
              Find Bookings
            </button>
          </form>
        </div>

        {searched && (
          <div className="space-y-6">
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={booking._id} 
                  className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                  <div className="flex gap-6 items-center">
                    <div className="w-16 h-16 rounded-2xl bg-brand-pink flex flex-col items-center justify-center text-brand-accent">
                      <span className="text-[10px] font-bold uppercase">{format(new Date(booking.date), 'MMM')}</span>
                      <span className="text-xl font-bold">{format(new Date(booking.date), 'd')}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-900">{booking.serviceName}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><Clock size={14} /> {booking.time}</span>
                        <span className="flex items-center gap-1"><UserIcon size={14} /> {booking.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest",
                      booking.status === 'confirmed' ? "bg-green-100 text-green-600" : 
                      booking.status === 'cancelled' ? "bg-red-100 text-red-600" : 
                      "bg-yellow-100 text-yellow-600"
                    )}>
                      {booking.status}
                    </span>
                    <div className="text-sm font-bold text-brand-accent">
                      {booking.paymentStatus === 'paid' ? 'Deposit Paid' : 'Payment Pending'}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-500">No bookings found for this number.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('adminToken')) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('adminToken', res.data.token);
      toast.success("Login successful");
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-4 min-h-screen flex items-center justify-center bg-gray-50">
      <div className="glass-card p-10 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-accent/10 text-brand-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-serif font-bold">Admin Portal</h1>
          <p className="text-gray-500 text-sm">Sign in to manage your studio</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                required
                type="email"
                className="input-field pl-12"
                placeholder="admin@katianistyles.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Password</label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                required
                type="password"
                className="input-field pl-12"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-4 flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, loading: false });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const confirmAction = (title: string, message: string, action: () => Promise<void>) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      loading: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        try {
          await action();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          setConfirmModal(prev => ({ ...prev, loading: false }));
        }
      }
    });
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Bookings', icon: <Calendar size={20} /> },
    { name: 'Clients', icon: <UserIcon size={20} /> },
    { name: 'Services', icon: <Tag size={20} /> },
    { name: 'Categories', icon: <Filter size={20} /> },
    { name: 'Reviews', icon: <MessageSquare size={20} /> },
    { name: 'System Config', icon: <Settings size={20} /> },
  ];

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex pt-20">
      <ConfirmModal 
        {...confirmModal} 
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} 
      />

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-20 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-40 overflow-y-auto",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-4 flex flex-col h-full">
          <div className="space-y-2 flex-grow">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={cn(
                  "w-full flex items-center gap-4 p-3 rounded-xl transition-all",
                  activeTab === item.name 
                    ? "bg-brand-accent text-white shadow-lg shadow-brand-pink-dark/20" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span className="font-bold text-sm">{item.name}</span>}
              </button>
            ))}
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-all mt-auto"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-bold text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300 p-4 sm:p-8",
        sidebarOpen ? "ml-64" : "ml-20"
      )}>
        <div className="max-w-7xl mx-auto">
          {activeTab === 'Dashboard' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-serif font-bold text-gray-900">Overview</h2>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 md:hidden">
                  <Menu size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: <Calendar />, color: 'bg-blue-50 text-blue-600' },
                  { label: 'Total Revenue', value: `KES ${(stats?.totalRevenue || 0).toLocaleString()}`, icon: <Database />, color: 'bg-green-50 text-green-600' },
                  { label: 'Active Clients', value: stats?.totalClients || 0, icon: <UserIcon />, color: 'bg-purple-50 text-purple-600' },
                  { label: 'Avg Rating', value: stats?.avgRating?.toFixed(1) || '0.0', icon: <Star />, color: 'bg-yellow-50 text-yellow-600' }
                ].map((item, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", item.color)}>
                      {item.icon}
                    </div>
                    <div className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-1">{item.label}</div>
                    <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold mb-6">Recent Bookings</h3>
                  <div className="space-y-4">
                    {stats?.recentBookings?.map((booking: any) => (
                      <div key={booking._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-brand-pink flex items-center justify-center text-brand-accent font-bold">
                            {booking.name[0]}
                          </div>
                          <div>
                            <div className="font-bold text-sm">{booking.name}</div>
                            <div className="text-xs text-gray-500">{booking.serviceName}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-gray-900">{format(new Date(booking.date), 'MMM d')}</div>
                          <div className="text-[10px] text-gray-400 uppercase">{booking.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold mb-6">Revenue Overview</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats?.revenueByMonth || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="revenue" fill="#E91E63" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Bookings' && <BookingManagement confirmAction={confirmAction} />}
          {activeTab === 'Clients' && <ClientManagement confirmAction={confirmAction} />}
          {activeTab === 'Services' && <ServiceManagement confirmAction={confirmAction} />}
          {activeTab === 'Categories' && <CategoryManagement confirmAction={confirmAction} />}
          {activeTab === 'Reviews' && <ReviewManagement confirmAction={confirmAction} />}
          {activeTab === 'System Config' && <SystemConfigTab />}
        </div>
      </main>
    </div>
  );
};

const BookingManagement = ({ confirmAction }: { confirmAction: any }) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchBookings = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await axios.get('/api/admin/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (err) {
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id: string, status: string) => {
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

  const deleteBooking = async (id: string) => {
    confirmAction(
      'Delete Booking',
      'Are you sure you want to delete this booking record?',
      async () => {
        const token = localStorage.getItem('adminToken');
        try {
          await axios.delete(`/api/admin/bookings/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success("Booking deleted");
          fetchBookings();
        } catch (err) {
          toast.error("Failed to delete booking");
          throw err;
        }
      }
    );
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif font-bold text-gray-900">Bookings</h2>
        <div className="flex gap-2">
          {['all', 'pending', 'confirmed', 'cancelled'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                filter === f ? "bg-brand-accent text-white" : "bg-white text-gray-500 hover:bg-gray-100"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Client</th>
              <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Service</th>
              <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Date & Time</th>
              <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Payment</th>
              <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
              <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredBookings.map((booking) => (
              <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-6">
                  <div className="font-bold text-gray-900">{booking.name}</div>
                  <div className="text-xs text-gray-500">{booking.phone}</div>
                </td>
                <td className="p-6">
                  <div className="text-sm font-medium">{booking.serviceName}</div>
                </td>
                <td className="p-6">
                  <div className="text-sm font-bold">{format(new Date(booking.date), 'MMM d, yyyy')}</div>
                  <div className="text-xs text-gray-500">{booking.time}</div>
                </td>
                <td className="p-6">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                    booking.paymentStatus === 'paid' ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                  )}>
                    {booking.paymentStatus}
                  </span>
                </td>
                <td className="p-6">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                    booking.status === 'confirmed' ? "bg-blue-100 text-blue-600" : 
                    booking.status === 'cancelled' ? "bg-red-100 text-red-600" : 
                    "bg-yellow-100 text-yellow-600"
                  )}>
                    {booking.status}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <button 
                        onClick={() => updateStatus(booking._id, 'confirmed')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Confirm"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    {booking.status !== 'cancelled' && (
                      <button 
                        onClick={() => updateStatus(booking._id, 'cancelled')}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Cancel"
                      >
                        <X size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteBooking(booking._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredBookings.length === 0 && (
          <div className="p-20 text-center text-gray-500">No bookings found.</div>
        )}
      </div>
    </div>
  );
};

const ClientManagement = ({ confirmAction }: { confirmAction: any }) => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState<any>(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);

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

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    try {
      await axios.patch(`/api/admin/clients/${editingClient.phone}`, editingClient, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Client updated");
      setEditingClient(null);
      fetchClients();
    } catch (err) {
      toast.error("Failed to update client");
    }
  };

  const handleDeleteClient = async (phone: string) => {
    confirmAction(
      'Delete Client',
      'Are you sure you want to delete this client? This will remove their entire booking history.',
      async () => {
        const token = localStorage.getItem('adminToken');
        try {
          await axios.delete(`/api/admin/clients/${phone}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success("Client deleted");
          fetchClients();
        } catch (err) {
          toast.error("Failed to delete client");
          throw err;
        }
      }
    );
  };

  const sendWhatsApp = async () => {
    if (!whatsappMessage.trim()) return;
    const token = localStorage.getItem('adminToken');
    try {
      await axios.post('/api/admin/whatsapp/send', {
        to: selectedClient.phone,
        message: whatsappMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Message sent via WhatsApp");
      setShowWhatsAppModal(false);
      setWhatsappMessage('');
    } catch (err) {
      toast.error("Failed to send WhatsApp message");
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif font-bold text-gray-900">Clients</h2>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search clients..."
            className="input-field pl-12"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Client Name</th>
              <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Contact Info</th>
              <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Total Bookings</th>
              <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Total Spent</th>
              <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredClients.map((client) => (
              <tr key={client.phone} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-6">
                  <div className="font-bold text-gray-900">{client.name}</div>
                  <div className="text-xs text-gray-500">Joined {format(new Date(client.createdAt), 'MMM yyyy')}</div>
                </td>
                <td className="p-6">
                  <div className="text-sm">{client.phone}</div>
                  <div className="text-xs text-gray-500">{client.email}</div>
                </td>
                <td className="p-6">
                  <div className="text-sm font-bold">{client.totalBookings}</div>
                </td>
                <td className="p-6">
                  <div className="text-sm font-bold text-brand-accent">KES {client.totalSpent.toLocaleString()}</div>
                </td>
                <td className="p-6">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setSelectedClient(client); setShowWhatsAppModal(true); }}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="WhatsApp"
                    >
                      <Phone size={18} />
                    </button>
                    <button 
                      onClick={() => setEditingClient(client)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClient(client.phone)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Message {selectedClient?.name}</h3>
              <button onClick={() => setShowWhatsAppModal(false)}><X size={24} /></button>
            </div>
            <textarea 
              className="input-field min-h-[150px] mb-6"
              placeholder="Type your message here..."
              value={whatsappMessage}
              onChange={e => setWhatsappMessage(e.target.value)}
            />
            <button onClick={sendWhatsApp} className="btn-primary w-full py-4 flex items-center justify-center gap-2">
              <Phone size={20} /> Send via WhatsApp Cloud API
            </button>
          </motion.div>
        </div>
      )}

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Edit Client</h3>
              <button onClick={() => setEditingClient(null)}><X size={24} /></button>
            </div>
            <form onSubmit={handleUpdateClient} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Name</label>
                <input className="input-field" value={editingClient.name} onChange={e => setEditingClient({...editingClient, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Email</label>
                <input className="input-field" value={editingClient.email} onChange={e => setEditingClient({...editingClient, email: e.target.value})} />
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setEditingClient(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Save Changes</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const ServiceManagement = ({ confirmAction }: { confirmAction: any }) => {
  const { services, fetchServices } = useServices();
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
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
          onClick={() => { setShowForm(true); setEditingService(null); setFormData({ name: '', description: '', price: '', duration: '', category: '', images: [] }); }}
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
        toast.success("Category added");
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
      'Are you sure you want to delete this category?',
      async () => {
        const token = localStorage.getItem('adminToken');
        try {
          await axios.delete(`/api/admin/categories/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success("Category deleted");
          fetchCategories();
        } catch (err) {
          toast.error("Failed to delete category");
          throw err;
        }
      }
    );
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif font-bold">Categories</h2>
        <button 
          onClick={() => { setShowForm(true); setEditingCategory(null); setFormData({ name: '', description: '' }); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> Add Category
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">{editingCategory ? "Edit Category" : "New Category"}</h3>
            <button onClick={() => setShowForm(false)}><X size={24} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">Category Name</label>
              <input required className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Description</label>
              <textarea className="input-field" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
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
              <h3 className="font-bold text-lg">{cat.name}</h3>
              <p className="text-sm text-gray-500">{cat.description || 'No description'}</p>
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
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
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
      toast.error("Failed to update review");
    }
  };

  const handleDelete = async (id: string) => {
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
      <h2 className="text-3xl font-serif font-bold">Client Reviews</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map(review => (
          <div key={review._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-pink flex items-center justify-center text-brand-accent font-bold">
                    {review.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{review.name}</div>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />)}
                    </div>
                  </div>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                  review.status === 'approved' ? "bg-green-100 text-green-600" : 
                  review.status === 'rejected' ? "bg-red-100 text-red-600" : 
                  "bg-yellow-100 text-yellow-600"
                )}>
                  {review.status}
                </span>
              </div>
              <p className="text-gray-600 text-sm italic mb-4">"{review.comment}"</p>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-50">
              {review.status === 'pending' && (
                <>
                  <button onClick={() => updateStatus(review._id, 'approved')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"><CheckCircle size={18} /></button>
                  <button onClick={() => updateStatus(review._id, 'rejected')} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"><X size={18} /></button>
                </>
              )}
              <button onClick={() => handleDelete(review._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

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
