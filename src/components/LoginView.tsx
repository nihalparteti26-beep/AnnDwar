import React, { useState } from 'react';
import { 
  User, 
  Building2, 
  ShieldCheck, 
  Lock, 
  Phone, 
  Globe, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Sparkles,
  UserPlus,
  LogIn,
  FileText,
  Truck,
  CreditCard,
  Scale,
  KeyRound,
  Check,
  MapPin
} from 'lucide-react';
import { Language, UserRole, AuthUser, FarmerProfile, MandiSlot } from '../types';
import { LanguageSelector } from './LanguageSelector';
import { transliterateToHindi } from '../utils/transliterateHindi';
import { openRealWhatsApp } from '../utils/whatsapp';

interface LoginViewProps {
  lang: Language;
  onToggleLang: () => void;
  onLanguageChange?: (language: Language) => void;
  onLoginSuccess: (user: AuthUser, extraData?: { farmer?: FarmerProfile; slot?: MandiSlot }) => void;
  onOpenWhatsAppHelp?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  lang,
  onToggleLang,
  onLanguageChange,
  onLoginSuccess,
  onOpenWhatsAppHelp,
}) => {
  const isHi = lang === 'hi';
  
  // Top-Level Role Selection: 'farmer' | 'mandi_operator' | 'admin'
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  
  // Mode for Farmer: 'register' (New Registration) or 'login' (Existing Login)
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  
  // Login State
  const [identifier, setIdentifier] = useState('MP-88210');
  const [password, setPassword] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);



  // New Registration Form State (Dynamic Data Collection)
  const [regFarmerId, setRegFarmerId] = useState('MP-88210');
  const [regNameEn, setRegNameEn] = useState('Ramesh Patel');
  const [regNameHi, setRegNameHi] = useState('रमेश पटेल');
  const [regPhone, setRegPhone] = useState('9826199999');
  const [regPin, setRegPin] = useState('1234');
  const [regAadhaar, setRegAadhaar] = useState('9821-4412-8890');
  const [regSamagra, setRegSamagra] = useState('48921008');
  const [regVillage, setRegVillage] = useState('धर्मराजपुरा, सांवेर');
  const [regDistrict, setRegDistrict] = useState('इन्दौर (मध्य प्रदेश)');
  const [regLandAcres, setRegLandAcres] = useState<number>(6.5);

  // Direct registration without OTP requirement
  const [activeSmsToast, setActiveSmsToast] = useState<string | null>(null);

  const [regCrop, setRegCrop] = useState('शरबती गेहूँ (ग्रेड-A)');
  const [regQuantity, setRegQuantity] = useState<number>(55);


  // Valid credential databases for simulation
  const validCredentials: Record<UserRole, {
    validIds: string[];
    validPins: string[];
    user: AuthUser;
  }> = {
    farmer: {
      validIds: ['MP-88210', '9826100001', 'ramsingh', 'kisan', '88210', '9826199999'],
      validPins: ['1234', 'kisan123', 'pass123'],
      user: {
        id: 'MP-88210',
        name: 'राम सिंह (Ram Singh)',
        role: 'farmer',
        phoneOrEmail: '9826100001',
        stationOrCenter: 'सांवेर उपार्जन केंद्र (गेट #02)',
      },
    },
    mandi_operator: {
      validIds: ['MND-OP-02', 'operator', 'operator@mandi.gov.in', 'mandi02'],
      validPins: ['mandi123', '1234', 'operator123'],
      user: {
        id: 'MND-OP-02',
        name: 'राजेश वर्मा (Rajesh Verma)',
        role: 'mandi_operator',
        phoneOrEmail: 'operator@mandi.gov.in',
        stationOrCenter: 'सांवेर उपार्जन केंद्र (गेट #02)',
      },
    },
    admin: {
      validIds: ['ADM-701', 'admin', 'admin@anndwar.gov.in', 'alok.ias'],
      validPins: ['admin123', '1234', 'secret123'],
      user: {
        id: 'ADM-701',
        name: 'डॉ. आलोक श्रीवास्तव (Dr. Alok Shrivastava, IAS)',
        role: 'admin',
        phoneOrEmail: 'admin@anndwar.gov.in',
        stationOrCenter: 'राज्य उपार्जन मुख्यालय, भोपाल',
      },
    },
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage('');
    if (role === 'farmer') {
      setIdentifier('MP-88210');
      setPassword('1234');
    } else if (role === 'mandi_operator') {
      setIdentifier('MND-OP-02');
      setPassword('mandi123');
    } else {
      setIdentifier('ADM-701');
      setPassword('admin123');
    }
  };

  // Phonetic English-to-Hindi Name input handler
  const handleEnglishNameChange = (val: string) => {
    setRegNameEn(val);
    const converted = transliterateToHindi(val);
    setRegNameHi(converted);
  };

  

  // Handle Existing Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (selectedRole === 'farmer') {
        const res = await fetch('/api/farmer/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, pin: password })
        });
        const data = await res.json();
        if (data.success && data.user) {
          onLoginSuccess(data.user, { farmer: data.farmer, slot: data.slot });
          setIsSubmitting(false);
          return;
        }
      }

      // Check standard credentials
      const cred = validCredentials[selectedRole];
      const trimmedId = identifier.trim().toLowerCase();
      const trimmedPin = password.trim();

      const isIdValid = cred.validIds.some((id) => id.toLowerCase() === trimmedId);
      const isPinValid = cred.validPins.includes(trimmedPin);

      if (isIdValid && isPinValid) {
        onLoginSuccess(cred.user);
      } else {
        setErrorMessage(
          isHi
            ? '❌ गलत क्रेडेंशियल्स! कृपया सही आईडी और पासवर्ड दर्ज करें।'
            : '❌ Incorrect credentials! Please check your ID and password.'
        );
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(isHi ? 'लॉगिन में त्रुटि हुई' : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle New Farmer Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    

    setIsSubmitting(true);

    try {
      const payload = {
        farmerId: regFarmerId,
        nameHi: regNameHi,
        nameEn: regNameEn || regNameHi,
        phone: regPhone,
        pin: regPin,
        aadhaar: regAadhaar,
        samagraId: regSamagra,
        village: regVillage,
        district: regDistrict,
        totalLandAcres: Number(regLandAcres) || 5,
        registeredCrop: regCrop,
        registeredQuantityLimit: Number(regQuantity) || 45
      };

      const response = await fetch('/api/farmer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success && data.user) {
        // Directly proceed to farmer dashboard immediately with registered details
        onLoginSuccess(data.user, { farmer: data.farmer, slot: data.slot });
      } else {
        setErrorMessage(data.error || (isHi ? 'पंजीकरण विफल रहा' : 'Registration failed'));
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      setErrorMessage(isHi ? 'सर्वर से संपर्क नहीं हो सका' : 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyDemo = (role: UserRole) => {
    handleRoleChange(role);
    if (role === 'farmer') {
      setAuthMode('login');
      setIdentifier('MP-88210');
      setPassword('1234');
    } else if (role === 'mandi_operator') {
      setIdentifier('MND-OP-02');
      setPassword('mandi123');
    } else {
      setIdentifier('ADM-701');
      setPassword('admin123');
    }
  };

  return (
    <div className="min-h-screen bg-radial from-[#e8f1ec] to-[#d6e5dc] flex flex-col justify-between selection:bg-[#1b7e45]/20">
      {/* Top Header */}
      <header className="bg-[#1b4d3e] text-white border-b border-[#143e31] sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm border border-[#c4dbcf] overflow-hidden flex-shrink-0">
              <img src="/logo.png" alt="अन्नद्वार" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white">
                  {isHi ? 'अन्नद्वार' : 'AnnDwar'}
                </h1>
                <span className="text-[10px] font-bold bg-[#2a6b54] text-[#d4f3e3] px-2 py-0.5 rounded tracking-wider border border-[#3d856b]">
                  {isHi ? 'किसान से देश तक' : 'Kisan se Desh Tak'}
                </span>
              </div>
              <p className="text-[10.5px] text-[#b8d6c8] leading-tight">
                {isHi ? 'AnnDwar - किसान से देश तक' : 'AnnDwar - Kisan se Desh Tak'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {onOpenWhatsAppHelp && (
              <button
                onClick={onOpenWhatsAppHelp}
                className="hidden sm:flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xs transition-all cursor-pointer"
                title={isHi ? 'व्हाट्सएप पर सहायता' : 'WhatsApp Assistance'}
              >
                <span>💬 {isHi ? 'व्हाट्सएप सहायता' : 'WhatsApp Help'}</span>
              </button>
            )}

            <a
              href="tel:18001801551"
              className="hidden md:flex items-center gap-1.5 bg-[#255e4c] hover:bg-[#2c6e59] text-[#e8f5ef] text-xs px-3 py-1.5 rounded-full border border-[#3b7d67] transition-all"
            >
              <Phone className="w-3 h-3 text-[#91e0bd]" />
              <span className="font-semibold tracking-wide">1800-180-1551</span>
            </a>

            {onLanguageChange ? (
              <LanguageSelector value={lang} onChange={onLanguageChange} compact />
            ) : (
              <button
                onClick={onToggleLang}
                className="flex items-center gap-1.5 bg-[#255e4c] hover:bg-[#2c6e59] text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-[#3b7d67] transition-all cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-[#91e0bd]" />
                <span>{isHi ? 'हिन्दी' : 'ENG'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className={`w-full transition-all duration-300 ${selectedRole === 'farmer' && authMode === 'register' ? 'max-w-3xl' : 'max-w-xl'}`}>
          <div className="bg-white rounded-3xl border border-[#d2dfd6] shadow-sm p-6 sm:p-8">
            {/* Header branding */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <div className="w-20 h-20 rounded-full bg-white p-1 shadow-sm border border-[#cfe0d5] flex items-center justify-center overflow-hidden">
                  <img src="/logo.png" alt="अन्नद्वार" className="w-full h-full object-contain" />
                </div>
              </div>
              <div className="inline-flex items-center gap-2 bg-[#edf7f1] text-[#14532d] text-xs font-bold px-3 py-1 rounded-full border border-[#bce3cb] mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#1b7e45]" />
                <span>AnnDwar - Kisan se Desh Tak</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#143224] tracking-tight">
                {selectedRole === 'farmer' ? (
                  authMode === 'register'
                    ? (isHi ? 'नया किसान पंजीकरण (Registration)' : 'New Farmer Registration')
                    : (isHi ? 'किसान लॉगिन (Farmer Login)' : 'Farmer Sign In')
                ) : selectedRole === 'mandi_operator' ? (
                  isHi ? 'मंडी यार्ड ऑपरेटर टर्मिनल (Mandi Operator)' : 'Mandi Operator Terminal'
                ) : (
                  isHi ? 'उपार्जन प्रशासक कमांड सेंटर (Admin HQ)' : 'Admin HQ Command Centre'
                )}
              </h2>
              <p className="text-xs sm:text-sm text-[#547362] mt-1">
                {selectedRole === 'farmer'
                  ? (isHi ? 'अपनी वास्तविक जानकारी दर्ज करें अथवा लॉगिन करें' : 'Enter your details to access your custom dashboard')
                  : selectedRole === 'mandi_operator'
                  ? (isHi ? 'गेट आगमन, RFID स्कैनिंग, नमी परीक्षण एवं तौल नियंत्रण कंसोल' : 'Gate arrival, moisture test & weighbridge operations console')
                  : (isHi ? 'राज्य स्तरीय उपार्जन निगरानी, साइलो स्टॉक एवं DBT भुगतान अनुमोदन' : 'Statewide procurement analytics, silo logistics & DBT payment approvals')}
              </p>
            </div>

            {/* Top 3 Distinct Role Selector Tabs (ALWAYS VISIBLE AS REQUESTED) */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#f0f5f2] rounded-2xl border border-[#dce8e0] mb-5">
              <button
                type="button"
                onClick={() => handleRoleChange('farmer')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === 'farmer'
                    ? 'bg-[#1b4d3e] text-white shadow-xs'
                    : 'text-[#506e5e] hover:text-[#183626]'
                }`}
              >
                <User className="w-4 h-4" />
                <span>{isHi ? 'किसान' : 'Farmer'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('mandi_operator')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === 'mandi_operator'
                    ? 'bg-[#b45309] text-white shadow-xs'
                    : 'text-[#506e5e] hover:text-[#183626]'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>{isHi ? 'मंडी ऑपरेटर' : 'Operator'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-[#1e40af] text-white shadow-xs'
                    : 'text-[#506e5e] hover:text-[#183626]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isHi ? 'प्रशासक' : 'Admin'}</span>
              </button>
            </div>

            {/* If Farmer is selected: Toggle between Registration and Login */}
            {selectedRole === 'farmer' && (
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#edf5f0] rounded-xl border border-[#d0e5d8] mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMessage('');
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-white text-[#1b4d3e] shadow-xs ring-1 ring-black/5'
                      : 'text-[#506e5e] hover:text-[#183626]'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isHi ? 'नया किसान पंजीकरण' : 'New Registration'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage('');
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-white text-[#1b4d3e] shadow-xs ring-1 ring-black/5'
                      : 'text-[#506e5e] hover:text-[#183626]'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{isHi ? 'पूर्व पंजीकृत लॉगिन' : 'Existing Login'}</span>
                </button>
              </div>
            )}

            {/* Error Message Alert */}
            {activeSmsToast && (
              <div className="mb-4 bg-sky-50 border-2 border-sky-300 text-sky-950 p-3 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-md animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📱</span>
                  <span>{activeSmsToast}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSmsToast(null)}
                  className="text-sky-700 hover:text-sky-900 p-1 cursor-pointer font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-start gap-2.5 shadow-2xs">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 leading-snug">{errorMessage}</div>
              </div>
            )}

            {/* =================================================================== */}
            {/* 1. NEW FARMER REGISTRATION FORM WITH PHONETIC HINDI & DEDICATED SLOT */}
            {/* =================================================================== */}
            {selectedRole === 'farmer' && authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                {/* 1. किसान पहचान, मोबाइल OTP व पिन */}
                <div className="bg-[#fafcfa] border border-[#dce8e0] rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#e5efe8] pb-2 text-xs font-bold text-[#1b4d3e]">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#1b7e45]" />
                      <span>{isHi ? '१. किसान पहचान, मोबाइल एवं सुरक्षा पिन' : '1. Farmer ID, Mobile & PIN'}</span>
                    </div>
                    <span className="text-[10px] bg-[#e3f7ec] text-[#147437] px-2 py-0.5 rounded-full border border-[#a6e2be]">
                      {isHi ? 'e-KYC प्रक्रिया' : 'e-KYC Mode'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Farmer ID */}
                    <div>
                      <label className="block text-xs font-bold text-[#143425] mb-1">
                        {isHi ? 'किसान पहचान आईडी (Farmer ID)' : 'Farmer ID'} *
                      </label>
                      <input
                        type="text"
                        required
                        value={regFarmerId}
                        onChange={(e) => setRegFarmerId(e.target.value)}
                        placeholder="उदा: MP-88210"
                        className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-[#cfe0d5] bg-white focus:outline-none focus:border-[#1b7e45]"
                      />
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-xs font-bold text-[#143425] mb-1">
                        {isHi ? 'पंजीकृत मोबाइल नंबर (10 अंक)' : 'Registered Mobile Number'} *
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="9826199999"
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-[#cfe0d5] bg-white focus:outline-none focus:border-[#1b7e45]"
                      />
                    </div>

                    {/* English Name Input (Auto transliterates to Hindi) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-[#143425]">
                          {isHi ? 'किसान का नाम (अंग्रेजी में टाइप करें)' : 'Full Name (Type in English)'} *
                        </label>
                        <span className="text-[10px] text-[#1b7e45] font-semibold">
                          🔤 {isHi ? 'स्वतः हिन्दी में छपेगा' : 'Auto Hindi'}
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        value={regNameEn}
                        onChange={(e) => handleEnglishNameChange(e.target.value)}
                        placeholder="Type in English (e.g. Ramesh Patel)"
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-[#cfe0d5] bg-white focus:outline-none focus:border-[#1b7e45]"
                      />
                    </div>

                    {/* Hindi Name Display (Live Preview & Editable) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-[#143425]">
                          {isHi ? 'हिन्दी में नाम (स्वतः दर्ज)' : 'Name in Hindi (Auto Transliterated)'} *
                        </label>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                          ✓ देवनागरी
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        value={regNameHi}
                        onChange={(e) => setRegNameHi(e.target.value)}
                        placeholder="उदा: रमेश पटेल"
                        className="w-full px-3 py-2 text-xs font-bold text-[#143e2c] rounded-xl border border-[#bce0ca] bg-[#f2faf5] focus:outline-none focus:border-[#1b7e45]"
                      />
                    </div>

                    {/* Aadhaar Number */}
                    <div>
                      <label className="block text-xs font-bold text-[#143425] mb-1">
                        {isHi ? 'आधार संख्या (12 अंक)' : 'Aadhaar Number'} *
                      </label>
                      <input
                        type="text"
                        required
                        value={regAadhaar}
                        onChange={(e) => setRegAadhaar(e.target.value)}
                        placeholder="9821-4412-8890"
                        className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-xl border border-[#cfe0d5] bg-white focus:outline-none focus:border-[#1b7e45]"
                      />
                    </div>

                    {/* Samagra Family ID */}
                    <div>
                      <label className="block text-xs font-bold text-[#143425] mb-1">
                        {isHi ? 'समग्र सदस्य आईडी (8 अंक)' : 'Samagra Member ID'} *
                      </label>
                      <input
                        type="text"
                        required
                        value={regSamagra}
                        onChange={(e) => setRegSamagra(e.target.value)}
                        placeholder="48921008"
                        className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-xl border border-[#cfe0d5] bg-white focus:outline-none focus:border-[#1b7e45]"
                      />
                    </div>

                    {/* Village */}
                    <div>
                      <label className="block text-xs font-bold text-[#143425] mb-1">
                        {isHi ? 'गांव / ग्राम का नाम' : 'Village Name'} *
                      </label>
                      <input
                        type="text"
                        required
                        value={regVillage}
                        onChange={(e) => setRegVillage(e.target.value)}
                        placeholder="उदा: धर्मराजपुरा, सांवेर"
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-[#cfe0d5] bg-white focus:outline-none focus:border-[#1b7e45]"
                      />
                    </div>

                    {/* State & District */}
                    <div>
                      <label className="block text-xs font-bold text-[#143425] mb-1">
                        {isHi ? 'राज्य एवं जिला' : 'State & District'} *
                      </label>
                      <input
                        type="text"
                        required
                        value={regDistrict}
                        onChange={(e) => setRegDistrict(e.target.value)}
                        placeholder="उदा: इन्दौर (मध्य प्रदेश)"
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-[#cfe0d5] bg-white focus:outline-none focus:border-[#1b7e45]"
                      />
                    </div>

                    {/* Set 4-Digit Security PIN */}
                    <div>
                      <label className="block text-xs font-bold text-[#143425] mb-1">
                        {isHi ? '4-अंकीय लॉगिन पिन सेट करें' : 'Set 4-Digit Security PIN'} *
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={regPin}
                        onChange={(e) => setRegPin(e.target.value)}
                        placeholder="1234"
                        className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-[#cfe0d5] bg-white focus:outline-none focus:border-[#1b7e45]"
                      />
                    </div>

                    {/* Total Agricultural Land */}
                    <div>
                      <label className="block text-xs font-bold text-[#143425] mb-1">
                        {isHi ? 'कुल कृषि भूमि (एकड़ में)' : 'Total Land (in Acres)'} *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={regLandAcres}
                        onChange={(e) => setRegLandAcres(Number(e.target.value))}
                        placeholder="6.5"
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-[#cfe0d5] bg-white focus:outline-none focus:border-[#1b7e45]"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Registration Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-[#1b4d3e] hover:bg-[#143b2f] text-white font-black text-sm rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>{isHi ? 'पंजीकरण एवं QR कोड सृजित हो रहा है...' : 'Generating QR & Registering...'}</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-[#88f0bc]" />
                      <span>{isHi ? 'पंजीकरण एवं स्लॉट पुष्टि करें (सीधे पोर्टल खोलें)' : 'Confirm Registration & Open Portal'}</span>
                      <ArrowRight className="w-4 h-4 text-[#88f0bc]" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* =================================================================== */}
            {/* 2. SIGN IN FORM (FOR FARMER LOGIN, MANDI OPERATOR, OR ADMIN)       */}
            {/* =================================================================== */}
            {(selectedRole !== 'farmer' || authMode === 'login') && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="p-3 rounded-xl bg-[#f9fbf9] border border-[#e2ede5] flex items-center justify-between text-xs mb-2">
                  <span className="text-[#597867] font-semibold">
                    {selectedRole === 'farmer' && (isHi ? '🌾 पंजीकृत किसान लॉगिन (ID या मोबाइल)' : '🌾 Registered Farmer Sign In')}
                    {selectedRole === 'mandi_operator' && (isHi ? '🏢 गेट ऑपरेटर टर्मिनल लॉगिन' : '🏢 Mandi Operator Terminal Sign In')}
                    {selectedRole === 'admin' && (isHi ? '🛡️ राज्य मुख्यालय कमांड सेंटर लॉगिन' : '🛡️ State HQ Command Centre Sign In')}
                  </span>
                  <button
                    type="button"
                    onClick={() => applyDemo(selectedRole)}
                    className="font-bold text-[#1b7e45] bg-[#e6f4ec] hover:bg-[#d6eedf] px-2 py-0.5 rounded text-[11px] cursor-pointer transition-all"
                  >
                    ⚡ {isHi ? 'त्वरित डेमो डेटा भरें' : 'Fill Demo'}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#143425] mb-1.5">
                    {selectedRole === 'farmer' && (isHi ? 'किसान आईडी अथवा पंजीकृत मोबाइल सं.' : 'Kisan ID or Registered Mobile')}
                    {selectedRole === 'mandi_operator' && (isHi ? 'ऑपरेटर यूज़र आईडी' : 'Operator User ID')}
                    {selectedRole === 'admin' && (isHi ? 'अधिकारी ईमेल अथवा आईडी' : 'Official Email or ID')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder={
                        selectedRole === 'farmer'
                          ? 'उदा: MP-88210 या 9826199999'
                          : selectedRole === 'mandi_operator'
                          ? 'उदा: MND-OP-02'
                          : 'उदा: ADM-701'
                      }
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#cfe0d5] text-sm font-semibold transition-all bg-white text-gray-900 focus:outline-none focus:border-[#1b7e45]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#143425]">
                      {selectedRole === 'farmer' ? (isHi ? '4-अंकीय सुरक्षा पिन' : '4-Digit Security PIN') : (isHi ? 'पासवर्ड' : 'Password')}
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder={selectedRole === 'farmer' ? '1234' : '••••••••'}
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#cfe0d5] text-sm font-semibold transition-all bg-white text-gray-900 focus:outline-none focus:border-[#1b7e45]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 font-black text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 text-white ${
                    selectedRole === 'farmer'
                      ? 'bg-[#1b4d3e] hover:bg-[#143b2f]'
                      : selectedRole === 'mandi_operator'
                      ? 'bg-[#b45309] hover:bg-[#92400e]'
                      : 'bg-[#1e40af] hover:bg-[#1e3a8a]'
                  }`}
                >
                  {isSubmitting ? (
                    <span>{isHi ? 'सत्यापन हो रहा है...' : 'Authenticating...'}</span>
                  ) : (
                    <>
                      <span>
                        {selectedRole === 'farmer'
                          ? (isHi ? 'किसान पोर्टल में प्रवेश करें' : 'Sign In to Farmer Portal')
                          : selectedRole === 'mandi_operator'
                          ? (isHi ? 'मंडी ऑपरेटर टर्मिनल खोलें' : 'Open Operator Terminal')
                          : (isHi ? 'प्रशासक कमांड सेंटर खोलें' : 'Open Admin Command Centre')}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
