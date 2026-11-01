import React from 'react';
import { 
  Phone, 
  Globe, 
  Building2, 
  LayoutDashboard, 
  BarChart3, 
  Truck, 
  Database,
  LogOut,
  User,
  ShieldCheck,
  Radio,
  Sparkles
} from 'lucide-react';
import { Language, AuthUser } from '../types';
import { LanguageSelector } from './LanguageSelector';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  onLanguageChange?: (language: Language) => void;
  currentUser: AuthUser | null;
  currentView: string;
  onSelectView: (view: string) => void;
  onLogout: () => void;
  onOpenWhatsAppHelp?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  onLanguageChange,
  currentUser,
  currentView,
  onSelectView,
  onLogout,
  onOpenWhatsAppHelp,
}) => {
  const isHi = lang === 'hi';
  const role = currentUser?.role || 'farmer';

  return (
    <header className="bg-[#1b4d3e] text-white border-b border-[#143e31] sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Brand Logo & Contextual Role Badge */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm border border-[#c4dbcf] overflow-hidden flex-shrink-0">
            <img src="/logo.png" alt="अन्नद्वार" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                <span>AnnDwar</span>
                <span className="text-xs font-normal text-emerald-200/90 hidden sm:inline">- {isHi ? 'किसान से देश तक' : 'Kisan se Desh Tak'}</span>
              </h1>
              {role === 'farmer' && (
                <span className="text-[10px] font-bold bg-[#2a6b54] text-[#d4f3e3] px-2 py-0.5 rounded-full tracking-wider border border-[#3d856b]">
                  {isHi ? 'किसान पोर्टल' : 'Farmer Portal'}
                </span>
              )}
              {role === 'mandi_operator' && (
                <span className="text-[10px] font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full tracking-wider">
                  {isHi ? 'मंडी ऑपरेटर' : 'Operator Mode'}
                </span>
              )}
              {role === 'admin' && (
                <span className="text-[10px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full tracking-wider">
                  {isHi ? 'मुख्यालय' : 'Admin HQ'}
                </span>
              )}
            </div>
            <p className="text-[10.5px] text-[#b8d6c8] hidden sm:block leading-none mt-0.5 font-medium">
              {role === 'farmer' && (isHi ? 'AnnDwar - किसान से देश तक (ई-उपार्जन प्रणाली)' : 'AnnDwar - Kisan se Desh Tak')}
              {role === 'mandi_operator' && (isHi ? 'सांवेर उपार्जन केंद्र • यार्ड एवं तौलकांटा' : 'Sanwer Center • Yard & Weighbridge')}
              {role === 'admin' && (isHi ? 'राज्य खाद्य एवं नागरिक आपूर्ति उपार्जन कमान' : 'State Food & Civil Supplies Command')}
            </p>
          </div>
        </div>

        {/* Center: Dedicated Sub-Navigation ONLY for Admin role (Clean & uncrowded) */}
        {role === 'admin' && (
          <div className="hidden md:flex items-center gap-1.5 bg-[#143e31]/90 p-1 rounded-2xl border border-[#235846] shadow-inner">
            <button
              onClick={() => onSelectView('admin_centre')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentView === 'admin_centre'
                  ? 'bg-white text-[#1b4d3e] shadow-xs'
                  : 'text-[#d4ece0] hover:bg-[#1f4e3f]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{isHi ? 'कमांड सेंटर' : 'Command Centre'}</span>
            </button>

            <button
              onClick={() => onSelectView('logistics_godown')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentView === 'logistics_godown'
                  ? 'bg-white text-[#1b4d3e] shadow-xs'
                  : 'text-[#d4ece0] hover:bg-[#1f4e3f]'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-[#9ee7c5]" />
              <span>{isHi ? 'लॉजिस्टिक्स व गोदाम' : 'Logistics & Silos'}</span>
            </button>

            <button
              onClick={() => onSelectView('mongo_compass')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentView === 'mongo_compass'
                  ? 'bg-white text-[#1b4d3e] shadow-xs'
                  : 'text-[#d4ece0] hover:bg-[#1f4e3f]'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-[#9ee7c5]" />
              <span>{isHi ? 'सिस्टम डेटा (Compass)' : 'Database'}</span>
            </button>
          </div>
        )}

        {/* Center for Mandi Operator */}
        {role === 'mandi_operator' && (
          <div className="hidden md:flex items-center gap-2 bg-[#143e31]/80 px-3 py-1.5 rounded-xl border border-[#235846] text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span className="font-bold text-amber-200">
              {isHi ? 'गेट #02 वे-ब्रिज व लैब लाइव' : 'Gate #02 & Lab Live'}
            </span>
            <span className="text-[#a8d4c2] text-[11px]">• ऑपरेटर: {currentUser?.name || 'राजेश वर्मा'}</span>
          </div>
        )}

        {/* Center for Farmer */}
        {role === 'farmer' && (
          <div className="hidden lg:flex items-center gap-2 bg-[#143e31]/80 px-3 py-1.5 rounded-xl border border-[#235846] text-xs">
            <User className="w-3.5 h-3.5 text-[#88f0bc]" />
            <span className="font-bold text-white">{currentUser?.name || 'राम सिंह'}</span>
            <span className="text-[#a4d4bf] text-[11px] font-mono">({currentUser?.id || 'MP-88210'})</span>
            <span className="bg-[#245e4b] text-[#88f0bc] text-[10px] font-bold px-1.5 py-0.2 rounded">
              {isHi ? 'सत्यापित' : 'Verified'}
            </span>
          </div>
        )}

        {/* Right Section: WhatsApp Helper + Helpline + Lang + Logout */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* WhatsApp Helper Quick Button */}
          {onOpenWhatsAppHelp && (
            <button
              onClick={onOpenWhatsAppHelp}
              className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-full shadow-xs transition-all cursor-pointer"
              title={isHi ? 'व्हाट्सएप सहायक खोलें' : 'Open WhatsApp Assistant'}
            >
              <span>💬</span>
              <span className="hidden sm:inline">{isHi ? 'व्हाट्सएप' : 'WhatsApp'}</span>
            </button>
          )}

          {/* Toll Free Helpline */}
          <a
            href="tel:18001801551"
            className="hidden xl:flex items-center gap-1.5 bg-[#255e4c] hover:bg-[#2c6e59] text-[#e8f5ef] text-xs px-3 py-1.5 rounded-full border border-[#3b7d67] transition-all"
            title={isHi ? 'टोल-फ्री किसान हेल्पलाइन' : 'Toll-Free Helpline'}
          >
            <Phone className="w-3 h-3 text-[#91e0bd]" />
            <span className="font-semibold tracking-wide">1800-180-1551</span>
          </a>

          {/* Language Selector */}
          {onLanguageChange ? (
            <LanguageSelector value={lang} onChange={onLanguageChange} compact />
          ) : (
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1.5 bg-[#255e4c] hover:bg-[#2c6e59] text-white text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-full border border-[#3b7d67] transition-all cursor-pointer"
              title="भाषा बदलें / Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#91e0bd]" />
              <span>{isHi ? 'हिन्दी' : 'ENG'}</span>
            </button>
          )}

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 bg-red-900/30 hover:bg-red-800 text-red-200 hover:text-white text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-full border border-red-500/40 transition-all cursor-pointer"
            title={isHi ? 'लॉगआउट करें एवं भूमिका बदलें' : 'Logout & Switch Account'}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isHi ? 'लॉगआउट' : 'Logout'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-bar for Admin Views */}
      {role === 'admin' && (
        <div className="flex md:hidden items-center justify-around px-3 py-1.5 bg-[#143e31] border-t border-[#1a4d3f] text-xs">
          <button
            onClick={() => onSelectView('admin_centre')}
            className={`px-2 py-1 rounded cursor-pointer ${currentView === 'admin_centre' ? 'bg-white text-[#1b4d3e] font-bold' : 'text-[#c6e4d6]'}`}
          >
            📊 {isHi ? 'कमांड सेंटर' : 'HQ'}
          </button>
          <button
            onClick={() => onSelectView('logistics_godown')}
            className={`px-2 py-1 rounded cursor-pointer ${currentView === 'logistics_godown' ? 'bg-white text-[#1b4d3e] font-bold' : 'text-[#c6e4d6]'}`}
          >
            🚛 {isHi ? 'लॉजिस्टिक्स' : 'Logistics'}
          </button>
          <button
            onClick={() => onSelectView('mongo_compass')}
            className={`px-2 py-1 rounded cursor-pointer ${currentView === 'mongo_compass' ? 'bg-white text-[#1b4d3e] font-bold' : 'text-[#c6e4d6]'}`}
          >
            🍃 {isHi ? 'डेटा' : 'Data'}
          </button>
        </div>
      )}
    </header>
  );
};
