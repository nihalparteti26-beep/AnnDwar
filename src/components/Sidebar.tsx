import React from 'react';
import { 
  User, 
  CheckCircle, 
  LayoutDashboard, 
  Clock, 
  Calendar, 
  ShieldCheck,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { Language, FarmerProfile } from '../types';

interface SidebarProps {
  lang: Language;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  farmer: FarmerProfile | null;
  onOpenDocuments: () => void;
  onOpenPayments?: () => void;
  activeDbtTab?: string;
  onSelectDbtTab?: (tab: 'status' | 'history' | 'calculator' | 'support') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  lang,
  currentTab,
  onSelectTab,
  farmer,
  onOpenDocuments,
  onOpenPayments,
}) => {
  const isHi = lang === 'hi';

  const menuItems = [
    {
      id: 'farmer_home',
      labelHi: 'मुख्य किसान पोर्टल',
      labelEn: 'Main Farmer Portal',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'crop_check',
      labelHi: '🌾 AI फसल पूर्व-जाँच',
      labelEn: 'AI Pre-Crop Check',
      icon: Sparkles,
      badge: 'AI',
      badgeColor: 'bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]',
    },
    {
      id: 'live_queue',
      labelHi: 'लाइव कतार ट्रैकर',
      labelEn: 'Live Queue Tracker',
      icon: Clock,
      badge: isHi ? 'लाइव' : 'LIVE',
      badgeColor: 'bg-[#e2f7eb] text-[#137333] border border-[#a4e2bd]',
    },
    {
      id: 'slot_booking',
      labelHi: 'मंडी स्लॉट बुकिंग',
      labelEn: 'Mandi Slot Booking',
      icon: Calendar,
      badge: null,
    },
    {
      id: 'payments',
      labelHi: 'DBT भुगतान एवं MSP',
      labelEn: 'DBT Payments & MSP',
      icon: CreditCard,
      badge: isHi ? 'खाता' : 'DBT',
      badgeColor: 'bg-[#fef3c7] text-[#92400e] border border-[#fde68a]',
    },
    {
      id: 'documents',
      labelHi: 'आवश्यक दस्तावेज',
      labelEn: 'Document Checklist',
      icon: ShieldCheck,
      badge: '4/4',
      badgeColor: 'bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9]',
      action: 'open_docs',
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#f8faf8] border-r border-[#e0e9e2] p-3 sm:p-4 flex flex-col gap-4">
      {/* Farmer Profile Card */}
      <div className="bg-white rounded-xl p-3 border border-[#d9e5dc] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#edf5ef] border border-[#b8d6c0] flex items-center justify-center text-[#1b4d3e]">
            <User className="w-4 h-4 text-[#1b4d3e]" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm text-[#183525]">
                {isHi ? (farmer?.nameHi || 'राम सिंह') : (farmer?.nameEn || 'Ram Singh')}
              </span>
              <CheckCircle className="w-3.5 h-3.5 text-[#1b7e45] fill-[#1b7e45]/20" />
            </div>
            <p className="text-[11px] text-[#5f7a6b] leading-tight font-mono">
              {farmer?.id ? `ID: ${farmer.id}` : (isHi ? 'सत्यापित किसान (पंजीकृत)' : 'Verified Farmer')}
            </p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-1.5" aria-label="Sidebar Menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.action === 'open_docs') {
                  onOpenDocuments();
                } else if (item.id === 'payments' && onOpenPayments) {
                  onOpenPayments();
                } else {
                  onSelectTab(item.id);
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                isActive
                  ? 'bg-[#1b4d3e] text-white shadow-xs font-semibold'
                  : 'text-[#2a4537] hover:bg-[#eaf1ec] hover:text-[#183525]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#a2ecc2]' : 'text-[#476e58]'}`} />
                <span>{isHi ? item.labelHi : item.labelEn}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-[#296853] text-[#d4f6e3]' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* AnnDwar Farmer Support Banner */}
      <div className="mt-auto bg-emerald-50/80 border border-emerald-200/70 rounded-xl p-3 text-xs text-emerald-900">
        <p className="font-bold flex items-center gap-1.5 text-emerald-800">
          <span>🌾 AnnDwar Sahayak</span>
        </p>
        <p className="text-[11px] text-emerald-700 mt-1 leading-relaxed">
          {isHi ? 'सहायता या स्लॉट जानकारी के लिए नीचे दिए व्हाट्सएप सहायक बटन का उपयोग करें।' : 'For instant assistance, use the WhatsApp Sahayak button below.'}
        </p>
      </div>
    </aside>
  );
};
