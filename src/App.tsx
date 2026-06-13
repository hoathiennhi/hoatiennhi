/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { 
  Flame, ShieldCheck, Award, Heart, Check, HelpCircle, 
  ChevronDown, Star, MessageSquareCode, ShieldAlert,
  Sparkles, Layers, RefreshCw, Send, Lock, ShoppingCart, 
  ReceiptText, Sparkle, HeartHandshake, Eye, Copy, CheckCircle
} from 'lucide-react';
import { Order } from './types';
import { FAQ_LIST, REVIEWS_LIST, STYLE_OPTIONS, INITIAL_ORDERS } from './data';
import OrderNotification from './components/OrderNotification';
import AdminPanel from './components/AdminPanel';

// Import generated premium images
const kolImage = 'https://lh3.googleusercontent.com/d/1PPmJejwgtanV20ZTmALuGpPyyXkebMf8';
// @ts-ignore
import productSetImage from './assets/images/nipple_cover_set_1781373632395.jpg';

export default function App() {
  // DB Orders State - loaded from localStorage with initial fallback
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const savedOrders = localStorage.getItem('htn_orders');
      if (savedOrders) {
        return JSON.parse(savedOrders);
      }
    } catch (e) {
      console.error('Failed to parse orders from localStorage:', e);
    }
    return INITIAL_ORDERS;
  });

  // Sync to localstorage whenever orders update
  useEffect(() => {
    try {
      localStorage.setItem('htn_orders', JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to sync orders to localStorage:', e);
    }
  }, [orders]);

  // UI state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeFAQ, setActiveFAQ] = useState<string | null>('faq-1');
  const [selectedStyle, setSelectedStyle] = useState<'round' | 'blossom'>('round');
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [selectedFormStyle, setSelectedFormStyle] = useState<'round' | 'blossom'>('round');
  const [selectedCombo, setSelectedCombo] = useState('Combo Ngọc Nữ - 5 Hộp dán ngực (Hot Sale 45%) - 299.000đ');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANK_TRANSFER' | 'MOMO'>('COD');
  
  // Custom states for validation / success modal
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successModalData, setSuccessModalData] = useState<Order | null>(null);
  const [scarcityCount, setScarcityCount] = useState(16);
  const [copiedBankInfo, setCopiedBankInfo] = useState(false);

  // Decrement scarcity countdown over time to create real-time urgency
  useEffect(() => {
    const timer = setInterval(() => {
      setScarcityCount(prev => {
        if (prev <= 3) return 3; // Keep it at a low, thrilling number
        // 45% chance to decrease
        return Math.random() < 0.45 ? prev - 1 : prev;
      });
    }, 18000); // Check every 18 seconds
    return () => clearInterval(timer);
  }, []);

  // Update selected style dynamically in form when user clicks interactive section
  const handleSelectStyle = (id: 'round' | 'blossom') => {
    setSelectedStyle(id);
    setSelectedFormStyle(id);
  };

  // Database Handlers passed to Admin Panel
  const handleUpdateStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const handleDeleteOrder = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, isTrash: true } : o));
  };

  const handleRestoreOrder = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, isTrash: false } : o));
  };

  const handleHardDelete = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const handleEmptyTrash = () => {
    setOrders(prev => prev.filter(o => !o.isTrash));
  };

  const handleResetDatabase = () => {
    setOrders(INITIAL_ORDERS);
  };

  // Form Submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    
    if (!customerName.trim()) {
      errors.customerName = 'Vui lòng cung cấp Họ & Tên người nhận.';
    }
    if (!phoneNumber.trim()) {
      errors.phoneNumber = 'Vui lòng nhập Số điện thoại liên hệ.';
    } else if (!/^(0|84)\d{9,10}$/.test(phoneNumber.trim().replace(/\s/g, ''))) {
      errors.phoneNumber = 'Số điện thoại không hợp lệ (gồm 10-11 chữ số).';
    }
    if (!address.trim()) {
      errors.address = 'Vui lòng điền Địa chỉ nhận hàng chi tiết.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // Scroll to form errors
      const formElement = document.getElementById('checkout-form-section');
      formElement?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setFormErrors({});

    // Generate simulated Room order id
    const newOrderId = `HTN-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: newOrderId,
      customerName,
      phoneNumber,
      address,
      productCombo: selectedCombo,
      stylePreference: selectedFormStyle,
      note: comment,
      price: 299000,
      orderDate: new Date().toISOString(),
      status: 'Pending',
      isTrash: false,
      paymentMethod
    };

    // Store into Local Orders State (simulating SQL Room database)
    setOrders(prev => [newOrder, ...prev]);
    setSuccessModalData(newOrder);

    // Reset Form
    setCustomerName('');
    setPhoneNumber('');
    setAddress('');
    setComment('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBankInfo(true);
    setTimeout(() => setCopiedBankInfo(false), 2000);
  };

  const activeOrdersCount = orders.filter(o => !o.isTrash && o.status === 'Pending').length;

  return (
    <div className="font-sans text-stone-800 bg-[#FAF5F0] min-h-screen relative selection:bg-rosegold-light selection:text-burgundy">
      
      {/* 1. Flash Sale Promo Header Banner */}
      <div className="bg-[#722F37] text-[#EAD7C3] py-2.5 px-4 text-center font-sans tracking-wide text-xs font-semibold flex items-center justify-center gap-2 relative z-40 shadow-xs">
        <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse flex-shrink-0" />
        <span className="text-white">SIÊU SALE ĐỘC QUYỀN HÈ:</span> 
        <span className="bg-[#E91E63] text-white px-2 py-0.5 rounded-sm font-sans font-bold text-[10px] animate-bounce">GIẢM 45%</span>
        <span>+ MIỄN PHÍ GIAO HÀNG TOÀN QUỐC TOÀN BỘ ĐƠN HÀNG</span>
        <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse flex-shrink-0 hidden sm:inline" />
      </div>

      {/* 2. Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-rosegold-light/10 shadow-xs py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Brand title */}
          <a href="#" className="flex items-center gap-2 group">
            <img
              src="https://drive.google.com/uc?export=view&id=1AjGzZhfiXC9OkpN3EatM5CccNt_inTO_"
              alt="Logo Hoa Thiên Nhi"
              className="w-10 h-10 rounded-full object-cover shadow-md transition-transform duration-500 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-burgundy">
                Hoa Thiên Nhi
              </h1>
              <span className="text-[9px] text-[#B76E79] font-semibold tracking-widest block -mt-1 font-sans uppercase">Miếng dán ti</span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-stone-600">
            <a href="#kol-ambassador" className="hover:text-[#722F37] transition">ĐẠI SỨ</a>
            <a href="#benefits" className="hover:text-[#722F37] transition">4 CÔNG DỤNG</a>
            <a href="#selector" className="hover:text-[#722F37] transition">KIỂU DÁNG</a>
            <a href="#how-to-use" className="hover:text-[#722F37] transition">HƯỚNG DẪN</a>
            <a href="#reviews" className="hover:text-[#722F37] transition">KHÁCH HÀNG</a>
          </nav>

          {/* Checkout & Database actions */}
          <div className="flex items-center gap-3">
            <a 
              href="#checkout-section" 
              className="bg-[#722F37] hover:bg-[#4A1C1C] text-white font-sans font-bold text-xs px-4 py-2.5 rounded-full shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>SẮM NGAY</span>
            </a>

            {/* Admin Console Entry (Room SQL simulator) */}
            <button 
              onClick={() => setIsAdminOpen(true)}
              className="p-2.5 rounded-full border border-rosegold-light/30 bg-white hover:bg-rosegold-pale text-[#722F37] transition relative group cursor-pointer outline-none"
              title="Mở Quản trị đơn hàng SQLite (Room)"
            >
              <ReceiptText className="w-5 h-5" />
              {activeOrdersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold font-mono text-[9px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse border-2 border-white">
                  {activeOrdersCount}
                </span>
              )}
              <span className="absolute right-0 top-12 scale-0 group-hover:scale-100 transition-all bg-[#722F37] text-white text-[10px] py-1 px-2 rounded whitespace-nowrap shadow-md">
                Admin đơn hàng (Room DB)
              </span>
            </button>
          </div>

        </div>
      </header>

      {/* Hero / Ambassador Section */}
      <section id="kol-ambassador" className="py-12 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
        
        {/* KOL dynamic image box */}
        <div className="lg:col-span-5 relative">
          <div className="absolute -inset-4 bg-rosegold-pale/50 rounded-3xl -z-10" />
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-rosegold-light/20 glow-gold">
            <img 
              src={kolImage} 
              alt="Đại sứ thương hiệu Hoa Thiên Nhi" 
              className="w-full h-auto object-cover transform hover:scale-103 transition duration-700"
              referrerPolicy="no-referrer"
            />
            {/* Elegant overlay badge */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-rosegold-light/20 flex items-center justify-between shadow-lg">
              <div>
                <p className="text-[10px] text-[#B76E79] font-bold font-sans uppercase tracking-widest">ĐỘC QUYỀN ĐẠI SỨ</p>
                <h4 className="font-serif text-burgundy font-bold text-base mt-0.5">KOL Hoa Thiên Nhi</h4>
              </div>
              <div className="bg-[#722F37]/5 p-2 rounded-lg">
                <Award className="w-5 h-5 text-burgundy" />
              </div>
            </div>
          </div>

          {/* Floating badge */}
          <div className="absolute -top-4 -right-4 bg-amber-50 rounded-2xl border border-amber-200 p-3 shadow-lg flex items-center gap-2 animate-bounce-subtle">
            <div className="bg-amber-500 text-white p-1.5 rounded-xl">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[9px] text-amber-800 font-bold font-sans">CAM KẾT Y TẾ</p>
              <p className="text-[10px] text-[#722F37] font-semibold">Silicone 100% Lành Tính</p>
            </div>
          </div>
        </div>

        {/* Brand quote & Description */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rosegold-pale rounded-full text-rosegold font-semibold text-xs font-sans">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#722F37]" />
            <span className="font-bold tracking-wide uppercase text-xs">Slogan: Miếng Dán Ti Hoa Thiên Nhi</span>
          </div>
          
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-burgundy leading-tight">
            Nữ tính quyến rũ, tự tin tỏa sáng cùng <span className="text-rosegold italic font-normal">Hoa Thiên Nhi</span>
          </h2>

          {/* Testimonial Quote */}
          <div className="border-l-4 border-rosegold pl-4 py-1 italic text-stone-600 font-serif text-base sm:text-lg leading-relaxed bg-[#722F37]/2 p-4 rounded-r-xl">
            "Từ khi làm bạn với dán ti y tế Hoa Thiên Nhi, mình có thể tự tin khoe bờ vai trần quyến rũ dưới mọi loại cánh váy ôm sát hay lụa tơ sương mỏng manh nhất. Bám dính tinh khôi bất chấp mồ hôi đèn sân khấu, cảm giác nhẹ tênh quyến rũ như không mặc gì!"
            <span className="block font-sans not-italic font-bold text-xs text-burgundy mt-2">— Trích phát biểu từ Đại Sứ Hoa Thiên Nhi</span>
          </div>

          <p className="text-stone-500 text-sm leading-relaxed font-sans">
            Miếng dán ti silicone y tế Hoa Thiên Nhi đột phá công nghệ liên kết nhiệt nhiệt tự thân, bảo vệ bầu ngực nhạy cảm khỏi thâm sạm và mẩn ngứa một cách hoàn hảo nhất.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-6 text-stone-700 text-xs font-semibold font-sans">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" /> Bác sĩ da liễu khuyên dùng
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" /> Đạt chất lượng kiểm nghiệm Quatest
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" /> 100% Silicone cao cấp
            </span>
          </div>
        </div>

      </section>

      {/* 4 Priceless Claims / Benefits Area */}
      <section id="benefits" className="bg-white py-16 sm:py-24 border-y border-rosegold-light/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          
          {/* Section title */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[#B76E79] font-bold font-sans text-xs tracking-widest uppercase">ĐỘC QUYỀN ĐẮT GIÁ</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-burgundy">
              4 Công Dụng Đắt Giá Chỉ Có Ở Dán Ti Hoa Thiên Nhi
            </h2>
            <div className="w-12 h-0.5 bg-rosegold mx-auto mt-4" />
          </div>

          {/* Grid benefits layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Benefit 1 */}
            <div className="bg-[#FAF5F0] p-6 rounded-2xl border border-rosegold-light/10 hover:border-rosegold transition duration-300 space-y-4">
              <div className="w-12 h-12 bg-[#722F37] text-[#EAD7C3] rounded-xl flex items-center justify-center font-bold text-lg font-serif">
                01
              </div>
              <h3 className="font-serif text-lg font-bold text-burgundy">Mỏng nhẹ tàng hình 0.1mm</h3>
              <p className="text-stone-500 text-xs leading-relaxed font-sans">
                Độ dày vát viền ngoài mỏng tối đa chỉ 0.1mm giúp hoàn toàn ôm sát phẳng lì, giúp phái đẹp tự tin diện đầm ôm body dạ tiệc, áo dài hay váy lụa sương siêu mỏng mà không lo để lộ viền gồ ghề kém duyên.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-[#FAF5F0] p-6 rounded-2xl border border-rosegold-light/10 hover:border-rosegold transition duration-300 space-y-4">
              <div className="w-12 h-12 bg-[#722F37] text-[#EAD7C3] rounded-xl flex items-center justify-center font-bold text-lg font-serif">
                02
              </div>
              <h3 className="font-serif text-lg font-bold text-burgundy">Gel sinh học kháng nước</h3>
              <p className="text-stone-500 text-xs leading-relaxed font-sans">
                Chế tác từ gel liên kết y tế sinh học siêu dẻo dai giúp tăng cao độ kháng mồ hôi và nước. Thỏa sức vận động mạnh ngày hè, yoga phức tạp, đi bơi biển, tắm hồ bơi hay dự tiệc suốt 24 giờ mà không sợ tuột rớt.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-[#FAF5F0] p-6 rounded-2xl border border-rosegold-light/10 hover:border-rosegold transition duration-300 space-y-4">
              <div className="w-12 h-12 bg-[#722F37] text-[#EAD7C3] rounded-xl flex items-center justify-center font-bold text-lg font-serif">
                03
              </div>
              <h3 className="font-serif text-lg font-bold text-burgundy">Tái sử dụng tới 50 lần</h3>
              <p className="text-stone-500 text-xs leading-relaxed font-sans">
                Công nghệ keo silicon cao cấp mềm dai giúp sản phẩm có thể làm sạch siêu nhẹ vô cùng bền bỉ. Việc giặt nhẹ sau mỗi lần đeo sẽ giúp hồi phục lại lực keo tinh khiết, tiết kiệm tối đa chi phí mua sắm cho chị em.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="bg-[#FAF5F0] p-6 rounded-2xl border border-rosegold-light/10 hover:border-rosegold transition duration-300 space-y-4">
              <div className="w-12 h-12 bg-[#722F37] text-[#EAD7C3] rounded-xl flex items-center justify-center font-bold text-lg font-serif">
                04
              </div>
              <h3 className="font-serif text-lg font-bold text-burgundy">Bảo vệ quầng ti lành tính</h3>
              <p className="text-stone-500 text-xs leading-relaxed font-sans">
                Bảo vệ nhũ hoa mộc mạc khỏi thâm mụn, kích ứng mẩn ngứa nhạy cảm nhờ không phủ keo ở khu vực nhũ hoa trung tâm. Silicone dẻo y tế vô trùng, thoải mái nâng niu làn da quyến rũ nhạy cảm bậc nhất.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Style Interactive Selector Stage */}
      <section id="selector" className="py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Details / Text description */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[#B76E79] font-bold font-sans text-xs tracking-widest uppercase">TRÌNH CHỌN KIỂU DÁNG TƯƠNG TÁC</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-burgundy leading-tight">
              Lựa Chọn Kiểu Dáng Hoàn Hảo Cho Vòng Ngực Cực Kỳ Ăn Ý
            </h2>
            <p className="text-stone-500 text-sm leading-relaxed font-sans">
              Mỗi phụ nữ sở hữu một vóc dáng và gu trang phục nguyên bản. Hãy lựa chọn giữa dáng tròn tối giản hay dáng hoa mai ôm gọn thời trang để nâng tầm tự tin của bản thân nhé thương mến.
            </p>

            {/* Selector buttons */}
            <div className="grid grid-cols-2 gap-4">
              {STYLE_OPTIONS.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleSelectStyle(style.id)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all outline-none duration-300 ${
                    selectedStyle === style.id
                      ? 'border-[#722F37] bg-[#722F37]/5 shadow-sm'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <p className={`font-serif font-bold text-sm ${
                    selectedStyle === style.id ? 'text-[#722F37]' : 'text-stone-800'
                  }`}>
                    {style.vietnameseName}
                  </p>
                  <p className="text-[10px] text-stone-400 font-semibold uppercase mt-1">
                    {style.name}
                  </p>
                </button>
              ))}
            </div>

            {/* Current Style Detail box */}
            <div className="bg-white border border-rosegold-light/20 p-5 rounded-2xl glow-gold text-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-burgundy text-[#EAD7C3] font-mono text-[9px] font-bold">KHUYÊN DÙNG</span>
                <p className="font-serif text-burgundy font-bold">
                  {STYLE_OPTIONS.find(s => s.id === selectedStyle)?.tagline}
                </p>
              </div>
              <p className="text-stone-500 font-sans leading-relaxed">
                {STYLE_OPTIONS.find(s => s.id === selectedStyle)?.description}
              </p>
              <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
                {STYLE_OPTIONS.find(s => s.id === selectedStyle)?.pros.map((pro, index) => (
                  <p key={index} className="flex items-center gap-2 text-stone-700 font-medium font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-rosegold" /> {pro}
                  </p>
                ))}
              </div>
            </div>

            {/* Order combo auto trigger button */}
            <div className="pt-2">
              <a 
                href="#checkout-section"
                onClick={() => setSelectedFormStyle(selectedStyle)}
                className="inline-flex items-center gap-2 font-sans font-bold text-xs bg-[#722F37] hover:bg-burgundy-dark text-white rounded-full px-6 py-3 shadow-md border border-[#722F37] transition"
              >
                <span>CHỌN KIỂU ĐỒNG BỘ Đơn ĐẶT HÀNG</span>
                <Check className="w-4 h-4 text-emerald-400" />
              </a>
            </div>
          </div>

          {/* Interactive CSS & Vector Preview Canvas */}
          <div className="lg:col-span-6 bg-white p-8 rounded-2xl border border-rosegold-light/10 shadow-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
            <div className="absolute inset-0 bg-[radial-gradient(#F2E8DA_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />
            
            {/* Soft decorative ambient circles represent breast form */}
            <div className="relative w-64 h-64 bg-rosegold-pale/40 rounded-full flex items-center justify-center border border-rosegold-light/20 shadow-inner">
              
              {/* Conditional Style Shape representation using vector */}
              {selectedStyle === 'round' ? (
                // 3D round nipple cover layout representation
                <div 
                  className="w-48 h-48 rounded-full bg-gradient-to-br from-[#FAF5F0]/90 via-[#F2E8DA]/95 to-[#EAD7C3]/80 shadow-2xl flex items-center justify-center p-4 relative transition-all duration-700 hover:scale-105"
                  style={{
                    boxShadow: '0 20px 40px rgba(196, 142, 124, 0.25), inset 0 2px 10px rgba(255,255,255,0.9), inset 0 -4px 15px rgba(196, 142, 124, 0.4)'
                  }}
                >
                  {/* Subtle ultra-thin rim indicator */}
                  <div className="absolute inset-0 w-full h-full rounded-full border border-white/60 pointer-events-none" />
                  {/* Zero area indicator represent center breast shield */}
                  <div className="w-16 h-16 rounded-full bg-[#FAF5F0]/80 shadow-md border border-rosegold-light/20 flex items-center justify-center text-[10px] text-rosegold">
                    <Heart className="w-4 h-4 fill-rosegold-light/20 text-[#B76E79] animate-pulse" />
                  </div>
                  {/* Indicator lines */}
                  <div className="absolute -right-6 top-1/2 -translate-y-1/2 bg-[#722F37] text-[#FAF5F0] font-mono text-[9px] py-1 px-2.5 rounded font-bold uppercase shadow">Viền mỏng 0.1mm</div>
                </div>
              ) : (
                // 3D Blossom shaped nipple cover representation using customized CSS wings
                <div 
                  className="w-48 h-48 bg-gradient-to-br from-[#FAF5F0]/90 via-[#F2E8DA]/95 to-[#EAD7C3]/80 shadow-2xl flex items-center justify-center p-4 relative transition-all duration-700 hover:scale-105"
                  style={{
                    borderRadius: '25% 75% 25% 75% / 75% 25% 75% 25%',
                    transform: 'rotate(45deg)',
                    boxShadow: '0 20px 40px rgba(196, 142, 124, 0.25), inset 0 2px 10px rgba(255,255,255,0.9), inset 0 -4px 15px rgba(196, 142, 124, 0.4)'
                  }}
                >
                  {/* Internal non-rotating item inside the shape */}
                  <div className="-rotate-45 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-[#FAF5F0]/80 shadow-md border border-rosegold-light/20 flex items-center justify-center">
                      <Sparkles className="w-4.5 h-4.5 text-[#B76E79]" />
                    </div>
                  </div>
                  <div className="-rotate-45 absolute -right-4 top-10 bg-[#722F37] text-[#FAF5F0] font-mono text-[9px] py-1 px-2.5 rounded font-bold uppercase shadow">Bo viền cánh hoa</div>
                </div>
              )}

            </div>

            <p className="text-[11px] text-stone-400 text-center font-medium font-sans mt-8 bg-stone-50 py-1.5 px-4 rounded-full border border-stone-100 z-10 transition">
              *Ảnh mô tả lực dính và ôm Bo góc tự thân. Click nút kiểu dáng khác nhau để tương tác
            </p>
          </div>

        </div>
      </section>

      {/* Product care timeline helper */}
      <section id="how-to-use" className="bg-[#722F37]/2 border-y border-rosegold-light/10 py-16 sm:py-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <span className="text-[#B76E79] font-bold font-sans text-xs tracking-widest uppercase">HƯỚNG DẪN BẢO QUẢN</span>
            <h2 className="font-serif text-3xl font-bold text-burgundy">3 Bước Giặt Phơi Tái Sử Dụng Gọn Gàng</h2>
            <p className="text-stone-500 text-xs font-sans">Giúp dán ti của bạn cực kỳ bền bỉ bám sâu tới 50 lần</p>
            <div className="w-12 h-0.5 bg-rosegold mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 bg-rosegold-pale rounded-full text-[#B76E79] flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin-slow" />
              </div>
              <h3 className="font-serif text-base font-bold text-burgundy">Bước 1: Rửa mặt keo</h3>
              <p className="text-stone-500 text-xs font-sans leading-relaxed">
                Rửa bụi dính bằng nước ấm âm ấm hoặc xà phòng nhẹ dịu. Lưu ý xoa xoa da lòng ngón tay dẻo dai để trôi bụi bẩn, không dùng móng tay miết xước bề mặt gel silicone.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 bg-rosegold-pale rounded-full text-[#B76E79] flex items-center justify-center">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-base font-bold text-burgundy">Bước 2: Phơi khô gió</h3>
              <p className="text-stone-500 text-xs font-sans leading-relaxed">
                Úp phẳng để khô tự nhiên trong môi trường ráo mát, tránh ánh nắng trực tiếp hoặc hong hơi nhiệt nóng sấy tóc sẽ làm hủy liên kết protein cao phân tử của keo nhiệt.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 bg-[#722F37] text-[#EAD7C3] rounded-full flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-base font-bold text-burgundy">Bước 3: Dán màng cất khay</h3>
              <p className="text-stone-500 text-xs font-sans leading-relaxed">
                Sau khi ráo hẳn nước ẩm bên ngoài, lấy miếng màng nilon bảo vệ gốc dán trở lại lớp gel, bảo quản sạch sẽ trong khay đựng để dùng mượt mà cho lần kế tiếp.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Main Pricing & Scarcity Combo (with beautiful lay flat image) */}
      <section id="pricing-combo" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Product image layout */}
        <div className="lg:col-span-6 relative">
          <div className="absolute -inset-4 bg-rosegold-pale/50 rounded-3xl -z-10" />
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-rosegold-light/20 glow-gold">
            <img 
              src={productSetImage} 
              alt="Hộp Premium Hoa Thiên Nhi cùng Đại Sứ Thương Hiệu" 
              className="w-full h-auto object-cover transform hover:scale-103 transition duration-700"
              referrerPolicy="no-referrer"
            />
            {/* Scarcity indicator float banner info */}
            <div className="absolute top-4 left-4 bg-red-600 text-white font-sans text-xs font-bold uppercase rounded px-3 py-1 animate-pulse">
              bán chạy nhất tuần
            </div>
            {/* Beautiful overlay badge representing KOL Cafe look */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3 px-4 rounded-xl border border-[#FAF5F0] flex items-center justify-between shadow-lg">
              <div>
                <p className="text-[9px] text-[#B76E79] font-bold font-sans uppercase tracking-widest leading-none">ĐẠI SỨ SẢN PHẨM</p>
                <h4 className="font-serif text-burgundy font-bold text-sm mt-1">Nàng Thơ Hoa Thiên Nhi Đón Nắng Hè Rạng Rỡ</h4>
              </div>
              <div className="bg-[#722F37]/5 p-2 rounded-lg flex-shrink-0">
                <Sparkle className="w-4 h-4 text-[#722F37]" />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Offer details */}
        <div className="lg:col-span-6 space-y-6">
          <span className="text-[#B76E79] font-bold font-sans text-xs tracking-widest uppercase">GÓI PRE ORDER SIÊU ƯU ĐÃI</span>
          
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-burgundy leading-tight">
            Combo Hoàn Mỹ 5 Hộp Cho Mùa Hè Tự Do Vươn Vai Trắng Trẻo
          </h2>

          <div className="bg-white rounded-2xl p-6 border border-rosegold-light/30 shadow-lg space-y-5">
            
            {/* Header info */}
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                <span className="text-xs text-stone-400 font-sans">Bộ Phụ Kiện Thảm Đỏ Gồm 5 Hộp Đựng Cầm Tay (Tổng 20 chiếc)</span>
                <h4 className="font-serif text-lg font-bold text-stone-800">Combo Ngọc Nữ cao cấp</h4>
              </div>
              <div className="bg-[#722F37] text-white px-3 py-1 rounded text-xs font-bold font-sans">
                TIẾT KIỆM 45%
              </div>
            </div>

            {/* Price Box */}
            <div className="flex items-baseline gap-4 pt-1">
              <span className="font-serif text-3xl sm:text-4xl font-extrabold text-red-600">299.000đ</span>
              <span className="font-sans text-base text-stone-400 line-through">550.000đ</span>
              <span className="text-xs text-stone-400">(Miễn phí ship toàn quốc)</span>
            </div>

            {/* Realtime Scarcity Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-stone-700 font-medium">
                <span className="flex items-center gap-1.5 text-burgundy">
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" /> Chỉ còn {scarcityCount} bộ quà tặng cuối cùng!
                </span>
                <span className="text-stone-400 font-bold">{Math.round((scarcityCount / 20) * 100)}% lượng ưu đãi</span>
              </div>
              <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-red-500 to-[#722F37] h-full rounded-full transition-all duration-1000"
                  style={{ width: `${(scarcityCount / 20) * 100}%` }}
                />
              </div>
            </div>

            {/* List claims inside combo card */}
            <ul className="text-xs text-stone-600 space-y-3 pt-3 border-t border-stone-100 font-sans">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Tặng kèm <strong>Xà phòng giặt rửa dán ti chuyên dụng</strong> trị giá 45.000đ.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Hỗ trợ chia nhỏ combo mix dáng Tròn & Hoa Mai theo mong muốn.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Bảo hành hoàn trả bám dính 1 đổi 1 trong vòng 7 ngày nếu lỗi bám dính.</span>
              </li>
            </ul>

            <div className="pt-2">
              <a 
                href="#checkout-section"
                className="w-full bg-[#722F37] hover:bg-burgundy-dark text-white font-sans font-bold text-sm py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>CHỐT COMBO 299K - FREE SHIP NGAY</span>
              </a>
            </div>

          </div>

        </div>

      </section>

      {/* Checkout Registration Form Area */}
      <section id="checkout-section" className="scroll-mt-20 py-16 sm:py-24 bg-[#722F37]/5 border-y border-rosegold-light/20 relative">
        <div className="absolute inset-0 bg-[#FFFDFB] opacity-40 mix-blend-overlay pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-8 relative z-10">
          
          {/* Header of Form */}
          <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
            <span className="text-[#B76E79] font-bold font-sans text-xs tracking-widest uppercase">ĐĂNG KÝ HỎA TỐC</span>
            <h2 className="font-serif text-3xl font-bold text-burgundy">Điền Đơn Đặt Hàng Nhẹ Nhàng</h2>
            <p className="text-stone-500 text-xs font-sans">
              Bảo mật 100% dữ liệu. Đóng gói bảo mât, che tên, không in tên nhạy cảm bên ngoài vỏ hộp.
            </p>
            <div className="w-12 h-0.5 bg-rosegold mx-auto mt-4" />
          </div>

          {/* Form tag */}
          <form 
            id="checkout-form-section"
            onSubmit={handleFormSubmit}
            className="bg-white rounded-3xl p-6 sm:p-10 border border-rosegold-light/30 shadow-2xl space-y-6"
          >
            {/* Full Name input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-burgundy uppercase block font-sans">Họ và tên người nhận *</label>
              <input
                type="text"
                placeholder="Ví dụ: Nguyễn Minh Thư"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={`w-full bg-[#FAF5F0] border rounded-xl py-3 px-4 text-sm font-sans ${
                  formErrors.customerName ? 'border-red-500' : 'border-stone-200'
                }`}
              />
              {formErrors.customerName && (
                <p className="text-[10px] text-red-500 font-semibold">{formErrors.customerName}</p>
              )}
            </div>

            {/* SĐT + Combo options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-burgundy uppercase block font-sans">Số điện thoại *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 0912345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={`w-full bg-[#FAF5F0] border rounded-xl py-3 px-4 text-sm font-sans ${
                    formErrors.phoneNumber ? 'border-red-500' : 'border-stone-200'
                  }`}
                />
                {formErrors.phoneNumber && (
                  <p className="text-[10px] text-red-500 font-semibold">{formErrors.phoneNumber}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-burgundy uppercase block font-sans">Lựa chọn quà Combo</label>
                <select
                  value={selectedCombo}
                  onChange={(e) => setSelectedCombo(e.target.value)}
                  className="w-full bg-[#FAF5F0] border border-stone-200 rounded-xl py-3 px-4 text-sm text-stone-700 outline-none font-sans"
                >
                  <option value="Combo Ngọc Nữ - 5 Hộp dán ngực (Hot Sale 45%) - 299.000đ">Combo 5 Hộp đầy đủ - 299.000đ</option>
                  <option value="Combo Thử Nghiệm - 2 Hộp dán ngực (Ưu Đãi Hè) - 150.000đ">Combo 2 Hộp nhỏ gọn - 150.000đ</option>
                  <option value="Combo Luxury - 10 Hộp dán ngực (Bảo Hộ Nguyên Năm) - 550.000đ">Combo 10 Hộp gia đình - 550.000đ</option>
                </select>
              </div>

            </div>

            {/* In-Form Interactive Choice for Style preference */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-burgundy uppercase block font-sans">Kiểu dáng dán dính ưa thích trong gói Combo</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <label className={`cursor-pointer border rounded-2xl p-4 flex items-center justify-between transition-all duration-300 ${
                  selectedFormStyle === 'round' 
                    ? 'border-[#722F37] bg-[#722F37]/2' 
                    : 'border-stone-100 bg-[#FAF5F0]'
                }`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="formStylePref" 
                      checked={selectedFormStyle === 'round'}
                      onChange={() => setSelectedFormStyle('round')}
                      className="accent-[#722F37] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <p className="text-xs font-bold text-stone-800">Dáng Tròn tự nhiên</p>
                      <p className="text-[9px] text-stone-400">Diện đầm mỏng, áo thun</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-rosegold font-bold font-sans">Viền 0.1mm</span>
                </label>

                <label className={`cursor-pointer border rounded-2xl p-4 flex items-center justify-between transition-all duration-300 ${
                  selectedFormStyle === 'blossom' 
                    ? 'border-[#722F37] bg-[#722F37]/2' 
                    : 'border-stone-100 bg-[#FAF5F0]'
                }`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="formStylePref" 
                      checked={selectedFormStyle === 'blossom'}
                      onChange={() => setSelectedFormStyle('blossom')}
                      className="accent-[#722F37] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <p className="text-xs font-bold text-stone-800">Dáng Hoa Mai điệu đà</p>
                      <p className="text-[9px] text-stone-400">Không quãn mép, bơi lội tốt</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-rosegold font-bold font-sans">Kháng Quăn Viền</span>
                </label>

              </div>
            </div>

            {/* Delivery address details */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-burgundy uppercase block font-sans">Địa chỉ nhận hàng chi tiết *</label>
              <textarea
                rows={3}
                placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`w-full bg-[#FAF5F0] border rounded-xl py-3 px-4 text-sm font-sans ${
                  formErrors.address ? 'border-red-500' : 'border-stone-200'
                }`}
              />
              {formErrors.address && (
                <p className="text-[10px] text-red-500 font-semibold">{formErrors.address}</p>
              )}
            </div>

            {/* Note & delivery messages */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-burgundy uppercase block font-sans">Ghi chú vận chuyển (Nếu có)</label>
              <input
                type="text"
                placeholder="Ví dụ: Giao ngoài giờ hành chính, bọc che giấu tên kín đáo..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-[#FAF5F0] border border-stone-200 rounded-xl py-3 px-4 text-sm font-sans"
              />
            </div>

            {/* payment Method Toggle */}
            <div className="bg-[#FAF5F0] p-5 rounded-2xl border border-stone-100 space-y-3">
              <label className="text-xs font-bold text-burgundy uppercase block font-sans">Hình thức thanh toán</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`py-3 px-4 rounded-xl border text-xs font-semibold font-sans transition outline-none cursor-pointer flex items-center justify-center gap-2 ${
                    paymentMethod === 'COD'
                      ? 'border-[#722F37] bg-[#722F37] text-[#FAF5F0] shadow-md'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-600'
                  }`}
                >
                  <span>COD (Nhận mới trả tiền)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('BANK_TRANSFER')}
                  className={`py-3 px-4 rounded-xl border text-xs font-semibold font-sans transition outline-none cursor-pointer flex items-center justify-center gap-2 ${
                    paymentMethod === 'BANK_TRANSFER'
                      ? 'border-[#722F37] bg-[#722F37] text-[#FAF5F0] shadow-md'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-600'
                  }`}
                >
                  <span>Chuyển khoản Ngân hàng</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('MOMO')}
                  className={`py-3 px-4 rounded-xl border text-xs font-semibold font-sans transition outline-none cursor-pointer flex items-center justify-center gap-2 ${
                    paymentMethod === 'MOMO'
                      ? 'border-[#722F37] bg-[#722F37] text-[#FAF5F0] shadow-md'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-600'
                  }`}
                >
                  <span>Ví điện tử MoMo</span>
                </button>

              </div>
            </div>

            {/* Discreet packaging visual notice */}
            <div className="flex items-center gap-3 bg-[#B76E79]/5 p-4 rounded-2xl border border-[#B76E79]/20 text-xs text-stone-600">
              <Lock className="w-5 h-5 text-burgundy flex-shrink-0 animate-pulse" />
              <p className="font-sans leading-relaxed">
                <strong className="text-burgundy">HOA THIÊN NHI CAM KẾT:</strong> Đơn hàng đóng hộp đen/xi măng cứng cáp mờ bọc tuyệt mật, ghi nhãn gửi hàng là "Hàng phụ kiện may mặc". Tuyệt đối không làm hiển thị từ nhạy cảm giúp nàng thoải mái nhận ở mọi nơi.
              </p>
            </div>

            {/* Big Action Submit button */}
            <button
              type="submit"
              className="w-full bg-[#722F37] hover:bg-[#4A1C1C] text-white py-4.5 rounded-xl font-bold font-sans text-sm shadow-xl transition-all hover:-translate-y-0.5 duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4 text-rosegold-light" />
              <span>GỬI ĐĂNG KÝ ĐẶT MUA NGAY</span>
            </button>

          </form>

        </div>
      </section>

      {/* Testimonials Review Slider */}
      <section id="reviews" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          
          <div className="text-center mb-12 space-y-3">
            <span className="text-[#B76E79] font-bold font-sans text-xs tracking-widest uppercase">ĐÁNH GIÁ CHÂN THỰC</span>
            <h2 className="font-serif text-3xl font-bold text-burgundy">Trải Nghiệm Khách Hàng 5 Sao</h2>
            <div className="w-12 h-0.5 bg-rosegold mx-auto mt-4" />
          </div>

          <div className="bg-[#FAF5F0] border border-stone-200 p-6 sm:p-10 rounded-3xl relative glow-burgundy transition-all duration-500">
            {/* Quote design decor */}
            <div className="absolute top-6 left-6 text-[#EAD7C3]/40 font-serif text-7xl select-none leading-none">“</div>
            
            <div className="relative space-y-6">
              
              {/* Rating stars */}
              <div className="flex gap-1">
                {[...Array(REVIEWS_LIST[activeReviewIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-500 fill-amber-500" />
                ))}
              </div>

              {/* Review content statement */}
              <p className="font-serif text-stone-700 text-base leading-relaxed italic">
                "{REVIEWS_LIST[activeReviewIndex].content}"
              </p>

              {/* User avatar metadata */}
              <div className="flex items-center gap-4 pt-4 border-t border-stone-100">
                <img 
                  src={REVIEWS_LIST[activeReviewIndex].avatar} 
                  alt={REVIEWS_LIST[activeReviewIndex].author} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-rosegold"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-sans font-bold text-sm text-burgundy">{REVIEWS_LIST[activeReviewIndex].author}</h4>
                  <p className="text-[11px] text-stone-500">{REVIEWS_LIST[activeReviewIndex].role} • Mua <span className="text-rosegold font-semibold">{REVIEWS_LIST[activeReviewIndex].productStyle}</span></p>
                </div>
                <span className="ml-auto font-mono text-[9px] text-stone-400">{REVIEWS_LIST[activeReviewIndex].date}</span>
              </div>

            </div>

          </div>

          {/* Slider trigger indicators */}
          <div className="flex justify-center gap-2.5 mt-6">
            {REVIEWS_LIST.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveReviewIndex(index)}
                className={`h-2 rounded-full transition-all cursor-pointer outline-none ${
                  activeReviewIndex === index ? 'w-8 bg-[#722F37]' : 'w-2 bg-stone-300'
                }`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* Accordion FAQ Area */}
      <section id="faqs" className="py-20 bg-[#FAF5F0] border-t border-stone-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-8">
          
          <div className="text-center mb-12 space-y-3">
            <span className="text-[#B76E79] font-bold font-sans text-xs tracking-widest uppercase">FAQ - CÂU HỎI THƯỜNG GẶP</span>
            <h2 className="font-serif text-3xl font-bold text-burgundy">Hỏi Đáp Nhanh Nhạy Để Nàng An Tâm</h2>
            <div className="w-12 h-0.5 bg-rosegold mx-auto mt-4" />
          </div>

          <div className="space-y-4">
            {FAQ_LIST.map((faq) => {
              const isSelected = activeFAQ === faq.id;
              return (
                <div 
                  key={faq.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden transition duration-300 shadow-xs"
                >
                  <button
                    onClick={() => setActiveFAQ(isSelected ? null : faq.id)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 font-sans font-semibold text-sm text-burgundy outline-none cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-rosegold transition-transform duration-300 flex-shrink-0 ${
                      isSelected ? 'rotate-180' : 'rotate-0'
                    }`} />
                  </button>

                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    isSelected ? 'max-h-60' : 'max-h-0'
                  }`}>
                    <div className="p-5 border-t border-stone-50 text-xs text-stone-500 font-sans leading-relaxed bg-stone-50/50">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Footer Details */}
      <footer className="bg-burgundy text-[#FAF5F0] py-16 px-4 sm:px-8 border-t border-[#4A1C1C]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          <div className="md:col-span-4 space-y-4">
            <h3 className="font-serif text-2xl font-bold text-[#FAF5F0]">Hoa Thiên Nhi</h3>
            <p className="text-[#B76E79] text-xs font-semibold uppercase tracking-wider block -mt-2 font-sans">
              Slogan: Miếng Dán Ti Hoa Thiên Nhi
            </p>
            <p className="text-xs text-stone-400 font-sans leading-relaxed">
              Thương hiệu dán ti silicone y tế tàng hình cao cấp Việt Nam. Kiến tạo sự tự tin hoàn mỹ tuyệt vời nhất cho nét đẹp phụ nữ Việt.
            </p>
            <div className="text-[10px] text-[#B76E79] font-mono bg-[#4A1C1C] px-3.5 py-1.5 rounded-lg inline-block border border-rosegold-light/10">
              Hotline: 1900.8686 (Hỗ trợ 24/7)
            </div>
          </div>

          <div className="md:col-span-4 text-xs text-stone-300 font-sans space-y-2">
            <h4 className="font-sans font-bold text-white text-xs uppercase tracking-wide">Văn Phòng Đại Diện</h4>
            <p>CS1: 25 Hàng Khay, Quận Hoàn Kiếm, Thành phố Hà Nội.</p>
            <p>CS2: 368 Hai Bà Trưng, Phường Đa Kao, Quận 1, Tp. Hồ Chí Minh.</p>
            <p className="text-stone-400">Email phản hồi: lienhe@hoathiennhi.vn</p>
          </div>

          <div className="md:col-span-4 text-xs text-stone-300 font-sans space-y-4 md:text-right">
            <p className="font-bold text-white uppercase tracking-wide">Cam kết bảo mật & Chính sách</p>
            <div className="flex gap-4 md:justify-end text-stone-400">
              <a href="#how-to-use" className="hover:text-white transition">Hỗ trợ</a>
              <span>•</span>
              <a href="#faqs" className="hover:text-white transition">Bảo mật giao hàng</a>
              <span>•</span>
              <a href="#selector" className="hover:text-white transition">1 Đổi 1</a>
            </div>
            <p className="text-[10px] text-stone-500">© 2026 Hoa Thiên Nhi Store. Phát triển bền vững bởi AI Studio.</p>
          </div>

        </div>
      </footer>

      {/* Success checkout popup modal */}
      {successModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl relative border border-stone-200 overflow-hidden animate-scale-up">
            
            {/* Header Success block */}
            <div className="bg-[#722F37] text-[#FAF5F0] p-6 text-center space-y-2 relative">
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg border-4 border-white animate-bounce">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">Đăng Ký Thành Công!</h3>
              <p className="text-xs text-[#EAD7C3]">Cảm ơn bạn đã lựa chọn Hoa Thiên Nhi. Đơn hàng đã được lưu vào Room SQLite DB.</p>
            </div>

            {/* Receipt Summary body */}
            <div className="p-6 space-y-4 font-sans text-xs">
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex justify-between items-center">
                <div>
                  <p className="font-mono text-[10px] text-stone-400">MÃ SỐ ĐƠN HÀNG</p>
                  <p className="font-mono text-sm font-bold text-burgundy">{successModalData.id}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[10px] text-stone-400">THỜI GIAN ĐẶT</p>
                  <p className="text-xs font-semibold text-stone-700">
                    {new Date(successModalData.orderDate).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Order Info particulars */}
              <div className="space-y-2 text-stone-700">
                <p>🙋‍♀️ <strong className="text-burgundy">Quý khách nhận:</strong> {successModalData.customerName}</p>
                <p>📞 <strong className="text-burgundy">Số điện thoại:</strong> {successModalData.phoneNumber}</p>
                <p>📦 <strong className="text-burgundy">Tên sản phẩm:</strong> {successModalData.productCombo}</p>
                <p>✨ <strong className="text-burgundy">Phân loại dán:</strong> {successModalData.stylePreference === 'round' ? 'Dáng Tròn tự nhiên' : 'Dáng Hoa Mai điệu đà'}</p>
                <p>📍 <strong className="text-burgundy">Địa chỉ giao:</strong> {successModalData.address}</p>
                <p>💰 <strong className="text-burgundy">Thành tiền:</strong> <strong className="text-red-600 text-sm">299.000đ</strong> <span className="bg-stone-100 text-[#722F37] text-[10px] rounded px-1.5 py-0.5 ml-1 inline-block uppercase font-bold">{successModalData.paymentMethod}</span></p>
              </div>

              {/* Bank Transfer detail or COD messages */}
              {successModalData.paymentMethod === 'BANK_TRANSFER' ? (
                <div className="bg-[#722F37]/5 p-4 rounded-2xl border border-[#B76E79]/20 space-y-3">
                  <div className="flex items-center gap-1.5 text-burgundy font-bold">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    <span>Mẹo: Chuyển khoản ngay để được đóng hàng HỎA TỐC</span>
                  </div>
                  
                  {/* Bank info layout with Copy controls */}
                  <div className="grid grid-cols-2 gap-4 bg-white p-3.5 rounded-xl border border-stone-100 text-[11px] text-stone-600">
                    <div className="space-y-1">
                      <p className="text-stone-400 text-[9px] uppercase font-bold">Tài khoản thụ hưởng</p>
                      <p className="font-bold text-burgundy flex items-center gap-1">
                        19035678999 <Copy className="w-3 h-3 text-stone-400 cursor-pointer hover:text-[#722F37]" onClick={() => copyToClipboard('19035678999')} />
                      </p>
                      <p>Ngân hàng Techcombank (TCB)</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-stone-400 text-[9px] uppercase font-bold">Cú pháp chuyển khoản</p>
                      <p className="font-mono font-bold text-[#B76E79] flex items-center gap-1">
                        {successModalData.id} <Copy className="w-3 h-3 text-stone-400 cursor-pointer hover:text-burgundy" onClick={() => copyToClipboard(successModalData.id)} />
                      </p>
                      <p className="text-[10px] text-stone-500 select-none">Chủ TK: HOA THIEN NHI STORE</p>
                    </div>
                  </div>

                  {copiedBankInfo && (
                    <p className="text-[10px] text-emerald-600 font-semibold text-center select-none animate-pulse">✓ Đã sao chép vào bộ nhớ tạm!</p>
                  )}
                </div>
              ) : successModalData.paymentMethod === 'MOMO' ? (
                <div className="bg-[#E91E63]/5 p-4 rounded-2xl border border-[#E91E63]/20 space-y-2">
                  <p className="text-burgundy font-semibold flex items-center gap-1.5 text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-[#E91E63] animate-ping" />
                    <span>Vui lòng quét thanh toán hoặc chuyển ví MoMo: <strong>0987.654.321</strong></span>
                  </p>
                  <p className="text-[10.5px] text-stone-500 leading-relaxed">Nội dung ghi chú chuyển tiền đúng mã đơn: <strong className="text-[#722F37] font-mono">{successModalData.id}</strong> để hệ thống tự động lọc và đóng phát ngay nhen nàng.</p>
                </div>
              ) : (
                <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 text-[11px] text-stone-600">
                  <p className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Đã chọn hình thức COD (Nhận hàng rồi mới thanh toán)
                  </p>
                  <p className="mt-1 leading-relaxed">Hoa Thiên Nhi đang chuẩn bị che mờ tên sản phẩm, đóng kiện và giao phát đến đơn vị vận chuyển ViettelPost/Giao Hàng Nhanh.</p>
                </div>
              )}

              {/* Action buttons inside popup */}
              <div className="border-t border-stone-100 pt-4 flex gap-2 justify-end">
                <button
                  onClick={() => setIsAdminOpen(true)}
                  className="px-4 py-2 hover:bg-stone-100 rounded-xl font-semibold text-[#722F37] cursor-pointer transition flex items-center gap-1"
                >
                  <ReceiptText className="w-4 h-4" />
                  <span>Mở Room DB để xem đơn</span>
                </button>
                <button
                  onClick={() => setSuccessModalData(null)}
                  className="px-5 py-2 bg-[#722F37] hover:bg-burgundy-dark font-sans font-bold text-white rounded-xl shadow-md cursor-pointer transition"
                >
                  Tuyệt vời, đồng ý
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Floating social proof notifications */}
      <OrderNotification />

      {/* Slideover Admin Order Console */}
      <AdminPanel 
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        orders={orders}
        onUpdateStatus={handleUpdateStatus}
        onDeleteOrder={handleDeleteOrder}
        onRestoreOrder={handleRestoreOrder}
        onHardDelete={handleHardDelete}
        onEmptyTrash={handleEmptyTrash}
        onResetDatabase={handleResetDatabase}
      />

    </div>
  );
}
