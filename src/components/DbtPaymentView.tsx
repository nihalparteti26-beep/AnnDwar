import React, { useState, useEffect } from 'react';
import { 
  Landmark, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  CreditCard, 
  FileText, 
  Calculator,
  Building2,
  Check,
  CheckCircle,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  Printer,
  X,
  ArrowRight,
  Bell,
  Search,
  ChevronDown,
  PhoneCall,
  Sparkles,
  ExternalLink,
  QrCode,
  Play,
  Pause,
  FastForward,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, FarmerProfile } from '../types';

interface DbtPaymentViewProps {
  lang: Language;
  farmer: FarmerProfile | null;
  onNavigateToBooking?: () => void;
  activeTab?: 'status' | 'history' | 'calculator' | 'support';
  onTabChange?: (tab: 'status' | 'history' | 'calculator' | 'support') => void;
}

export const DbtPaymentView: React.FC<DbtPaymentViewProps> = ({ 
  lang, 
  farmer,
  onNavigateToBooking,
  activeTab: controlledActiveTab,
  onTabChange
}) => {
  const isHi = lang === 'hi';
  const [internalActiveTab, setInternalActiveTab] = useState<'status' | 'history' | 'calculator' | 'support'>('status');
  const activeTab = controlledActiveTab ?? internalActiveTab;
  const setActiveTab = (tab: 'status' | 'history' | 'calculator' | 'support') => {
    setInternalActiveTab(tab);
    onTabChange?.(tab);
  };
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAdviceModalOpen, setIsAdviceModalOpen] = useState(false);
  const [isGrievanceModalOpen, setIsGrievanceModalOpen] = useState(false);
  const [grievanceSubmitted, setGrievanceSubmitted] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [npciChecking, setNpciChecking] = useState(false);
  const [npciVerified, setNpciVerified] = useState(true);

  // SMS / Notification toggles
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsAppAlerts, setWhatsAppAlerts] = useState(true);

  // Filter for history
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [historySearch, setHistorySearch] = useState('');

  // Calculator state
  const cropRates: Record<string, { nameHi: string; nameEn: string; msp: number; bonus: number; unit: string }> = {
    wheat_sharbati: {
      nameHi: 'शरबती गेहूँ (Sharbati Wheat)',
      nameEn: 'Sharbati Wheat',
      msp: 2275,
      bonus: 125,
      unit: 'क्विंटल',
    },
    wheat_lokwan: {
      nameHi: 'लोकवन गेहूँ (Lokwan Wheat)',
      nameEn: 'Lokwan Wheat',
      msp: 2275,
      bonus: 125,
      unit: 'क्विंटल',
    },
    gram: {
      nameHi: 'चना देशी (Desi Gram)',
      nameEn: 'Gram / Chana',
      msp: 5440,
      bonus: 0,
      unit: 'क्विंटल',
    },
    mustard: {
      nameHi: 'सरसों / राई (Mustard)',
      nameEn: 'Mustard Seed',
      msp: 5650,
      bonus: 0,
      unit: 'क्विंटल',
    },
    paddy: {
      nameHi: 'धान (Paddy Common)',
      nameEn: 'Paddy Common',
      msp: 2300,
      bonus: 100,
      unit: 'क्विंटल',
    },
  };

  const [calcCrop, setCalcCrop] = useState('wheat_sharbati');
  const [calcQuantity, setCalcQuantity] = useState<number>(45);

  const selectedCropData = cropRates[calcCrop] || cropRates['wheat_sharbati'];
  const calcMspTotal = selectedCropData.msp * calcQuantity;
  const calcBonusTotal = selectedCropData.bonus * calcQuantity;
  const calcGrossTotal = calcMspTotal + calcBonusTotal;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  const handleCheckNpci = () => {
    setNpciChecking(true);
    setTimeout(() => {
      setNpciChecking(false);
      setNpciVerified(true);
    }, 1000);
  };

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
    setIsAdviceModalOpen(true);
  };

  // Dynamic payment calculation based on actual registered farmer crop & quantity
  const registeredCrop = farmer?.registeredCrop || 'गेहूँ (शरबती)';
  const registeredQty = farmer?.registeredQuantityLimit || 45;

  let unitMsp = 2275;
  let unitBonus = 175;
  let cropDisplayName = registeredCrop;

  if (registeredCrop.includes('चना') || registeredCrop.toLowerCase().includes('gram')) {
    unitMsp = 5440;
    unitBonus = 0;
  } else if (registeredCrop.includes('सरसों') || registeredCrop.toLowerCase().includes('mustard')) {
    unitMsp = 5650;
    unitBonus = 0;
  } else if (registeredCrop.includes('धान') || registeredCrop.toLowerCase().includes('paddy')) {
    unitMsp = 2300;
    unitBonus = 100;
  } else {
    // Default wheat
    unitMsp = 2275;
    unitBonus = 175;
  }

  const effectiveRate = unitMsp + unitBonus;
  const centralMspTotal = unitMsp * registeredQty;
  const stateBonusTotal = unitBonus * registeredQty;
  const grossTotal = centralMspTotal + stateBonusTotal;

  const getAmountInWords = (num: number, isHiMode: boolean) => {
    if (isHiMode) {
      if (num === 108000) return 'एक लाख आठ हज़ार रुपये केवल';
      if (num === 117000) return 'एक लाख सत्रह हज़ार रुपये केवल';
      if (num === 244800) return 'दो लाख चवालीस हज़ार आठ सौ रुपये केवल';
      return `${num.toLocaleString('en-IN')} रुपये केवल`;
    } else {
      return `${num.toLocaleString('en-IN')} Rupees Only`;
    }
  };

  // Real-Time Dynamic Stage Engine & Live Sync with Admin Approval
  const [currentDbtStage, setCurrentDbtStage] = useState<number>(
    farmer?.dbtPaymentStatus === 'credit_successful' ? 6 : 5
  );
  const [liveDbtStatus, setLiveDbtStatus] = useState<string>(farmer?.dbtPaymentStatus || 'in_progress');
  const [liveUtr, setLiveUtr] = useState<string | undefined>(farmer?.dbtUtrNumber);

  // Poll live DBT status from backend
  useEffect(() => {
    const fetchDbt = async () => {
      try {
        const [pRes, sRes] = await Promise.all([
          fetch('/api/farmer/profile'),
          fetch('/api/stages')
        ]);
        const pData = await pRes.json();
        const sData = await sRes.json();

        if (pData?.dbtPaymentStatus) {
          setLiveDbtStatus(pData.dbtPaymentStatus);
          if (pData.dbtPaymentStatus === 'credit_successful') {
            setCurrentDbtStage(6);
            if (pData.dbtUtrNumber) setLiveUtr(pData.dbtUtrNumber);
          }
        }
        if (Array.isArray(sData)) {
          const st7 = sData.find((s: any) => s.step === 7);
          if (st7?.status === 'completed') {
            setCurrentDbtStage(6);
            setLiveDbtStatus('credit_successful');
          }
        }
      } catch (e) {
        console.error('Failed to poll live DBT state:', e);
      }
    };
    fetchDbt();
    const interval = setInterval(fetchDbt, 3500);
    return () => clearInterval(interval);
  }, []);

  // Stepper lifecycle items (Dynamically computed based on currentDbtStage and farmer consignment)
  const stageDefs = [
    {
      step: 1,
      title: isHi ? '1. तौल प्रमाणीकरण' : '1. Weighment Auth',
      subDone: `${registeredQty}.00 Qtl - पूर्ण`,
      subActive: isHi ? 'इलेक्ट्रॉनिक कांटा सक्रिय' : 'Scale Active',
      subPending: isHi ? 'कांटा प्रतीक्षा' : 'Scale Pending',
      timeDone: 'आज, 10:15 AM',
      timeActive: isHi ? 'अभी लाइव' : 'Live Now',
      timePending: isHi ? 'लंबित' : 'Pending',
      trigger: isHi ? 'इलेक्ट्रॉनिक धर्मकांटा ग्रॉस-टेयर वजन दर्ज होने पर' : 'Electronic scale gross/tare weight log',
    },
    {
      step: 2,
      title: isHi ? '2. गुणवत्ता अनुमोदन' : '2. Quality Clearance',
      subDone: 'FAQ Grade - 11.2% नमी',
      subActive: isHi ? 'डिजिटल नमी जांच जारी' : 'Lab Testing Moisture',
      subPending: isHi ? 'नमी स्लॉट प्रतीक्षारत' : 'Lab Awaited',
      timeDone: 'आज, 11:30 AM',
      timeActive: isHi ? 'अभी लाइव' : 'Live Now',
      timePending: isHi ? 'लंबित' : 'Pending',
      trigger: isHi ? 'मंडी गुणवत्ता परीक्षक द्वारा नमी <12% प्रमाणित करने पर' : 'Moisture meter <12% FAQ pass',
    },
    {
      step: 3,
      title: isHi ? '3. गोदाम पावती' : '3. Godown Receipt',
      subDone: 'मुंशी ई-हस्ताक्षरित',
      subActive: isHi ? 'अनलोडिंग व मुंशी जांच' : 'Unloading & Munshi Check',
      subPending: isHi ? 'गोदाम आवंटन शेष' : 'Godown Awaited',
      timeDone: 'आज, 01:45 PM',
      timeActive: isHi ? 'अभी लाइव' : 'Live Now',
      timePending: isHi ? 'लंबित' : 'Pending',
      trigger: isHi ? 'गोदाम मुंशी द्वारा ई-सील मिलान व डिजिटल रसीद जारी करने पर' : 'Warehouse Munshi W/R acceptance & sign',
    },
    {
      step: 4,
      title: isHi ? '4. उपार्जन बिल' : '4. Procurement Bill',
      subDone: '#BIL-2025-8821',
      subActive: isHi ? 'ई-उपार्जन बिल जनरेशन' : 'Bill Generating',
      subPending: isHi ? 'बिल संस्तुति शेष' : 'Bill Pending',
      timeDone: 'आज, 03:10 PM',
      timeActive: isHi ? 'अभी लाइव' : 'Live Now',
      timePending: isHi ? 'लंबित' : 'Pending',
      trigger: isHi ? 'ई-उपार्जन पोर्टल द्वारा औपचारिक भुगतान बिल (#BIL) सृजन पर' : 'e-Uparjan portal invoice generation',
    },
    {
      step: 5,
      title: isHi ? '5. PFMS / ट्रेजरी क्लीयरेंस' : '5. PFMS Treasury',
      subDone: isHi ? 'ट्रेजरी DSC हस्ताक्षरित' : 'Treasury DSC Signed',
      subActive: isHi ? 'प्रशासक स्वीकृति प्रक्रियाधीन' : 'Admin Approval Processing',
      subPending: isHi ? 'ट्रेजरी बैच प्रतीक्षारत' : 'Treasury Awaited',
      timeDone: 'आज, 04:20 PM',
      timeActive: isHi ? 'ट्रेजरी फाइल प्रेषित' : 'Treasury Sent',
      timePending: isHi ? 'लंबित' : 'Pending',
      trigger: isHi ? 'जिला कोषालय अधिकारी द्वारा DSC डिजिटल टोकन से भुगतान फाइल PFMS को भेजने पर' : 'District Treasury DSC digital sign to PFMS',
    },
    {
      step: 6,
      title: isHi ? '6. बैंक खाता क्रेडिट' : '6. Bank Credit',
      subDone: isHi ? `₹${grossTotal.toLocaleString('en-IN')} जमा ✓` : `₹${grossTotal.toLocaleString('en-IN')} Credited ✓`,
      subActive: isHi ? 'NPCI पेमेंट गेटवे क्रेडिट' : 'NPCI Credit Processing',
      subPending: isHi ? 'आगामी (स्वीकृति उपरांत)' : 'Upcoming (Post Approval)',
      timeDone: isHi ? 'सफलतापूर्वक जमा' : 'Credited Successfully',
      timeActive: isHi ? 'क्रेडिट जारी...' : 'Crediting...',
      timePending: 'स्वीकृति पश्चात',
      trigger: isHi ? 'NPCI आधार पेमेंट ब्रिज (APB) द्वारा किसान के बैंक खाते में सीधा अंतरण' : 'NPCI Aadhaar Payment Bridge fund transfer',
    },
  ];

  const steps = stageDefs.map((def) => {
    const isDone = def.step < currentDbtStage || (def.step === 6 && currentDbtStage === 6);
    const isActive = def.step === currentDbtStage && currentDbtStage !== 6;
    return {
      step: def.step,
      title: def.title,
      sub1: isDone ? def.subDone : isActive ? def.subActive : def.subPending,
      sub2: isDone ? def.timeDone : isActive ? def.timeActive : def.timePending,
      trigger: def.trigger,
      status: isDone ? 'completed' : isActive ? 'in_progress' : 'upcoming',
    };
  });

  // Multi-season historical records
  const paymentHistoryRecords = [
    {
      id: 'DBT-2025-001',
      season: 'rabi_2025',
      seasonLabelHi: 'रबी 2024-25',
      seasonLabelEn: 'Rabi 2024-25',
      cropHi: 'शरबती गेहूँ (FAQ)',
      cropEn: 'Sharbati Wheat (FAQ)',
      lotNo: '#WEIGH-8821-B',
      quantity: '45.00 Qtl',
      rate: '₹2,400/Qtl (MSP ₹2,275 + बोनस ₹125)',
      amount: '₹1,08,000.00',
      bank: 'SBI •••• 4812',
      ifsc: 'SBIN0001248',
      pfmsId: 'PFMS/2025/MP/WHT-9941829',
      utr: 'UTR लंबित (In Transit)',
      date: '26 Oct 2025',
      status: 'processing',
      statusLabelHi: 'PFMS गतिशील',
      statusLabelEn: 'PFMS In-Transit',
    },
    {
      id: 'DBT-2024-089',
      season: 'kharif_2024',
      seasonLabelHi: 'खरीफ 2024',
      seasonLabelEn: 'Kharif 2024',
      cropHi: 'सोयाबीन पीला (Yellow)',
      cropEn: 'Soyabean (Yellow)',
      lotNo: '#WEIGH-4102-A',
      quantity: '38.00 Qtl',
      rate: '₹4,892/Qtl (MSP ₹4,892)',
      amount: '₹1,85,896.00',
      bank: 'SBI •••• 4812',
      ifsc: 'SBIN0001248',
      pfmsId: 'PFMS/2024/MP/SOY-7731201',
      utr: 'SBIN88219412091',
      date: '14 Nov 2024',
      status: 'credited',
      statusLabelHi: 'सफलतापूर्वक जमा',
      statusLabelEn: 'Credited to Bank',
    },
    {
      id: 'DBT-2024-042',
      season: 'rabi_2024',
      seasonLabelHi: 'रबी 2023-24',
      seasonLabelEn: 'Rabi 2023-24',
      cropHi: 'चना देशी (Gram)',
      cropEn: 'Desi Gram',
      lotNo: '#WEIGH-2291-C',
      quantity: '25.00 Qtl',
      rate: '₹5,440/Qtl (MSP ₹5,440)',
      amount: '₹1,36,000.00',
      bank: 'SBI •••• 4812',
      ifsc: 'SBIN0001248',
      pfmsId: 'PFMS/2024/MP/GRM-5521990',
      utr: 'SBIN77218900142',
      date: '18 Apr 2024',
      status: 'credited',
      statusLabelHi: 'सफलतापूर्वक जमा',
      statusLabelEn: 'Credited to Bank',
    },
    {
      id: 'DBT-2023-112',
      season: 'past',
      seasonLabelHi: 'खरीफ 2023',
      seasonLabelEn: 'Kharif 2023',
      cropHi: 'धान (Paddy Common)',
      cropEn: 'Paddy Common',
      lotNo: '#WEIGH-1108-D',
      quantity: '40.00 Qtl',
      rate: '₹2,183/Qtl (MSP ₹2,183)',
      amount: '₹87,320.00',
      bank: 'SBI •••• 4812',
      ifsc: 'SBIN0001248',
      pfmsId: 'PFMS/2023/MP/PDY-3310928',
      utr: 'SBIN55198002341',
      date: '28 Dec 2023',
      status: 'credited',
      statusLabelHi: 'सफलतापूर्वक जमा',
      statusLabelEn: 'Credited to Bank',
    },
  ];

  const filteredHistory = paymentHistoryRecords.filter((rec) => {
    const matchSeason = seasonFilter === 'all' || rec.season === seasonFilter;
    const matchSearch = 
      rec.cropHi.toLowerCase().includes(historySearch.toLowerCase()) ||
      rec.cropEn.toLowerCase().includes(historySearch.toLowerCase()) ||
      rec.lotNo.toLowerCase().includes(historySearch.toLowerCase()) ||
      rec.utr.toLowerCase().includes(historySearch.toLowerCase());
    return matchSeason && matchSearch;
  });

  return (
    <div className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-6xl space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#2e5c46] font-semibold mb-0.5">
            <Building2 className="w-4 h-4 text-[#1b7e45]" />
            <span>
              {isHi 
                ? 'प्रत्यक्ष लाभ अंतरण (Direct Benefit Transfer) • रबी विपणन सत्र 2025' 
                : 'Direct Benefit Transfer (DBT) • Rabi Marketing Season 2025'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f3d2e] tracking-tight">
            {isHi ? 'प्रत्यक्ष लाभ अंतरण (DBT) भुगतान स्थिति' : 'DBT Payment Status & Payout Tracker'}
          </h2>
          <p className="text-xs text-[#476e58] mt-0.5">
            {isHi 
              ? 'PFMS ट्रेजरी, NPCI आधार सीडिंग एवं बैंक क्रेडिट का पारदर्शी लाइव लेखा' 
              : 'Real-time monitoring of PFMS Treasury clearance, NPCI seeding & bank credit'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#c5ddd0] text-[#1b4d3e] text-xs font-bold hover:bg-[#edf5f0] transition-colors shadow-xs cursor-pointer"
            title={isHi ? 'आधिकारिक भुगतान एडवाइस रसीद देखें व डाउनलोड करें' : 'View & Download DBT Advice Voucher'}
          >
            <Download className="w-3.5 h-3.5 text-[#1b7e45]" />
            <span>{downloadSuccess ? (isHi ? 'रसीद खुल गई ✓' : 'Advice Opened ✓') : (isHi ? 'DBT एडवाइस रसीद' : 'DBT Advice Slip')}</span>
          </button>

          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f3d2e] text-white text-xs font-bold hover:bg-black transition-colors shadow-xs cursor-pointer"
            title={isHi ? 'PFMS व बैंक सर्वर से स्थिति रिफ्रेश करें' : 'Refresh from PFMS & Bank gateway'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isHi ? 'स्थिति रिफ्रेश करें' : 'Refresh Status'}</span>
          </button>
        </div>
      </div>

      {/* Primary Feature Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('status')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'status'
              ? 'bg-[#1b4d3e] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>{isHi ? '1. लाइव स्थिति व संगणना' : '1. Live Status & Pipeline'}</span>
          <span className="bg-amber-400 text-amber-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
            {isHi ? 'चरण 5/6' : 'Step 5/6'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-[#1b4d3e] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{isHi ? '2. भुगतान इतिहास व पासबुक' : '2. Payment History & Passbook'}</span>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-black">
            4 {isHi ? 'रिकॉर्ड' : 'Lots'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'calculator'
              ? 'bg-[#1b4d3e] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>{isHi ? '3. 🧮 डीबीटी अनुमानक (कैलकुलेटर)' : '3. 🧮 DBT Payout Calculator'}</span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'support'
              ? 'bg-[#1b4d3e] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{isHi ? '4. NPCI सीडिंग व सहायता निवारण' : '4. NPCI Seeding & Support'}</span>
        </button>
      </div>

      {/* TAB 1: LIVE STATUS & PIPELINE */}
      {activeTab === 'status' && (
        <div className="space-y-6">
          {/* Top 2 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1: आज का कुल देय भुगतान */}
            <div className="bg-white border-l-4 border-l-[#1b5e20] border-t border-r border-b border-gray-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 block">
                    {isHi ? 'आज का कुल देय भुगतान (Total Due Today)' : 'Total Due Payment Today'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                    liveDbtStatus === 'credit_successful' || currentDbtStage === 6
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {liveDbtStatus === 'credit_successful' || currentDbtStage === 6 ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span>{isHi ? `खाते में जमा पूर्ण ✓` : `Credited to Bank ✓`}</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 animate-pulse" />
                        <span>{isHi ? 'प्रक्रियाधीन (ट्रेजरी क्लियरेंस)' : 'In Progress (Treasury Clearance)'}</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="my-2 flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-[#0f3d2e] tracking-tight">
                    ₹{grossTotal.toLocaleString('en-IN')}
                  </span>
                  <span className="text-lg font-bold text-gray-500">.00</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium mt-1">
                  <span className="text-amber-700">🌾</span>
                  <span>{isHi ? `${registeredQty} क्विंटल ${cropDisplayName} @ ₹${effectiveRate.toLocaleString('en-IN')}/क्विंटल` : `${registeredQty} Qtl ${cropDisplayName} @ ₹${effectiveRate.toLocaleString('en-IN')}/Qtl`}</span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <div>
                  {isHi ? 'उपार्जन पर्ची:' : 'Procurement Slip:'}{' '}
                  <span className="font-mono font-bold text-gray-800">#WEIGH-8821-B</span>
                </div>
                <button
                  onClick={() => setIsAdviceModalOpen(true)}
                  className="text-[#1b5e20] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isHi ? 'एडवाइस रसीद देखें' : 'View Advice'}</span>
                </button>
              </div>
            </div>

            {/* Card 2: सत्यापित बैंक खाता */}
            <div className="bg-white border-l-4 border-l-emerald-600 border-t border-r border-b border-gray-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-gray-500">
                    {isHi ? 'सत्यापित बैंक खाता (Linked Bank)' : 'Verified Bank Account (Aadhaar Seeded)'}
                  </span>
                  <button
                    onClick={handleCheckNpci}
                    className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#e8f5e9] text-[#1b5e20] px-2.5 py-0.5 rounded-full border border-emerald-300 hover:bg-[#d8efdb] transition-colors cursor-pointer"
                    title={isHi ? 'NPCI सर्वर से आधार सीडिंग जांचें' : 'Re-verify NPCI Status'}
                  >
                    <ShieldCheck className={`w-3 h-3 ${npciChecking ? 'animate-spin' : ''}`} />
                    <span>{npciChecking ? (isHi ? 'जांच जारी...' : 'Checking...') : 'DBT Active (NPCI)'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2.5 mt-1">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#1b5e20] flex items-center justify-center font-bold shadow-2xs">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      {farmer?.bankAccount ? `${farmer.bankName || 'SBI'} •••• ${farmer.bankAccount.slice(-4)}` : 'SBI •••• 4812'}
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      {farmer?.bankName || 'भारतीय स्टेट बैंक'}, शाखा: {farmer?.village || 'सांवेर'} (IFSC: {farmer?.ifscCode || 'SBIN0001248'})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-gray-600 mt-3 bg-[#f6faf7] p-2 rounded-lg border border-[#e2eee5]">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>{isHi ? 'आधार बायोमेट्रिक व NPCI मैप्ड (DBT Seeding Verified)' : 'Aadhaar Biometric & NPCI Mapped (DBT Active)'}</span>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>
                  {isHi ? 'खाताधारक:' : 'A/C Holder:'}{' '}
                  <strong className="text-gray-800">{farmer?.nameHi || 'रामप्रसाद पाटीदार'}</strong>
                </span>
                <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {isHi ? 'प्राथमिक DBT खाता' : 'Primary DBT A/C'}
                </span>
              </div>
            </div>
          </div>

          {/* Stepper Section: DBT भुगतान चरण एवं लाइव स्थिति */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {isHi ? 'DBT भुगतान चरण एवं लाइव स्थिति' : 'DBT Payment Lifecycle Tracker'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isHi ? 'प्रत्येक चरण का डिजिटल हस्ताक्षर व ई-सत्यापन' : 'Step-by-step digitally signed verification trail'}
                </p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border ${
                liveDbtStatus === 'credit_successful' || currentDbtStage === 6
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                  : 'text-amber-900 bg-amber-50 border-amber-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${liveDbtStatus === 'credit_successful' || currentDbtStage === 6 ? 'bg-emerald-600' : 'bg-amber-600 animate-ping'}`}></span>
                <span>
                  {liveDbtStatus === 'credit_successful' || currentDbtStage === 6 
                    ? (isHi ? `चरण 6/6: बैंक खाते में जमा पूर्ण ✓ (UTR: ${liveUtr || farmer?.dbtUtrNumber || 'SBIN882194821'})` : `Step 6/6: Credited to Bank ✓ (UTR: ${liveUtr || farmer?.dbtUtrNumber || 'SBIN882194821'})`) 
                    : (isHi ? `चरण 5/6: प्रशासक स्वीकृति प्रक्रियाधीन` : `Step 5/6: Admin Approval Processing`)}
                </span>
              </span>
            </div>

            {/* 6 Horizontal Connected Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {steps.map((s) => {
                const isDone = s.status === 'completed';
                const isActive = s.status === 'in_progress';
                return (
                  <div
                    key={s.step}
                    className={`relative rounded-xl p-3.5 flex flex-col justify-between transition-all min-h-[140px] ${
                      isActive
                        ? 'bg-[#fffaf0] border-2 border-[#b45309] shadow-sm'
                        : isDone
                        ? 'bg-[#f4f7f4] border border-gray-200'
                        : 'bg-[#f9fafb] border border-gray-200 opacity-60'
                    }`}
                  >
                    {/* Status Icon */}
                    <div className="mb-2 flex justify-center">
                      {isDone ? (
                        <div className="w-8 h-8 rounded-full bg-[#1b5e20] text-white flex items-center justify-center shadow-xs">
                          <Check className="w-4 h-4" strokeWidth={3} />
                        </div>
                      ) : isActive ? (
                        <div className="w-8 h-8 rounded-full bg-[#9a3412] text-white flex items-center justify-center shadow-xs animate-pulse">
                          <RefreshCw className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center">
                          <CreditCard className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <div className="text-center my-1">
                      <h5 className="text-[12px] font-bold text-gray-900 leading-tight">
                        {s.title}
                      </h5>
                      <p
                        className={`text-[11px] font-semibold mt-1 ${
                          isActive ? 'text-[#b45309]' : isDone ? 'text-gray-700' : 'text-gray-400'
                        }`}
                      >
                        {s.sub1}
                      </p>
                    </div>

                    {/* Footer details */}
                    <div className="text-center pt-2 mt-auto border-t border-black/5 text-[10px] text-gray-500 font-medium">
                      {s.sub2}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Payment Breakdown Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {isHi ? 'विस्तृत मूल्य एवं भुगतान गणना (Payment Breakdown)' : 'Detailed Value & MSP Breakdown'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isHi ? 'सरकारी दिशा-निर्देशानुसार पारदर्शी संगणना' : 'Transparent calculation as per official MSP gazette'}
                </p>
              </div>
              <Calculator className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-2.5 text-xs text-gray-700 font-medium">
              {/* Row 1 */}
              <div className="flex items-center justify-between py-1">
                <span>
                  {isHi 
                    ? `केंद्रीय न्यूनतम समर्थन मूल्य (₹${unitMsp.toLocaleString('en-IN')} प्रति क्विंटल × ${registeredQty}.00 क्विंटल)` 
                    : `Central MSP Share (₹${unitMsp.toLocaleString('en-IN')} per Qtl × ${registeredQty}.00 Qtl)`}
                </span>
                <span className="font-mono font-bold text-gray-900">₹{centralMspTotal.toLocaleString('en-IN')}.00</span>
              </div>

              {/* Row 2 */}
              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-1.5">
                  <span>{isHi ? `मध्य प्रदेश राज्य बोनस (₹${unitBonus} प्रति क्विंटल)` : `MP State Procurement Bonus (₹${unitBonus}/Qtl)`}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                    MP Govt
                  </span>
                </span>
                <span className="font-mono font-bold text-emerald-800">+ ₹{stateBonusTotal.toLocaleString('en-IN')}.00</span>
              </div>

              {/* Row 3 - Gross Subtotal */}
              <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg font-bold text-gray-900">
                <span>{isHi ? 'सकल उपार्जन राशि (Gross Procurement Amount)' : 'Gross Procurement Subtotal'}</span>
                <span className="font-mono text-sm">₹{grossTotal.toLocaleString('en-IN')}.00</span>
              </div>

              {/* Row 4 */}
              <div className="flex items-center justify-between py-1 text-gray-500">
                <span>{isHi ? 'मंडी शुल्क एवं हम्माली प्रभार (शासन द्वारा वहनीय)' : 'Mandi Fees & Labour Handling (Covered by State)'}</span>
                <span className="font-mono font-bold text-emerald-700">₹0.00 (शून्य शुल्क)</span>
              </div>

              {/* Row 5 */}
              <div className="flex items-center justify-between py-1 text-gray-500">
                <span>{isHi ? 'गुणवत्ता कटौती / रिफ्रैक्शन (FAQ Grade)' : 'Quality Refraction / Moisture Cut (FAQ Grade)'}</span>
                <span className="font-mono font-bold text-gray-800">₹0.00</span>
              </div>

              {/* Final Net Amount Card */}
              <div className="bg-[#f0fdf4] border border-emerald-200 rounded-xl p-4 mt-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-gray-600 block">
                      {isHi ? 'कुल शुद्ध अंतरण राशि (Net DBT Credit)' : 'Net Amount to be Credited via DBT'}
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-[#1b5e20] font-mono">
                      ₹{grossTotal.toLocaleString('en-IN')}.00
                    </span>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-1">
                    <span className="text-xs text-gray-600 font-medium bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs">
                      {getAmountInWords(grossTotal, isHi)}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      ✓ {isHi ? 'सीधे किसान के बैंक खाते में DBT द्वारा' : 'Direct credit to farmer bank account via PFMS'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENT HISTORY & PASSBOOK */}
      {activeTab === 'history' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', labelHi: 'सभी सत्र (All)', labelEn: 'All Seasons' },
                { id: 'rabi_2025', labelHi: 'रबी 2024-25', labelEn: 'Rabi 2024-25' },
                { id: 'kharif_2024', labelHi: 'खरीफ 2024', labelEn: 'Kharif 2024' },
                { id: 'rabi_2024', labelHi: 'रबी 2023-24', labelEn: 'Rabi 2023-24' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSeasonFilter(filter.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    seasonFilter === filter.id
                      ? 'bg-[#1b4d3e] text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isHi ? filter.labelHi : filter.labelEn}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder={isHi ? 'फसल, लॉट क्र. या UTR खोजें...' : 'Search crop, Lot No, UTR...'}
                className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs w-full sm:w-56 focus:outline-none focus:ring-1 focus:ring-[#1b4d3e]"
              />
            </div>
          </div>

          {/* Historical Records Table */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  {isHi ? 'किसान उपार्जन एवं DBT पासबुक (Procurement Passbook)' : 'Farmer DBT Procurement Passbook'}
                </h3>
                <p className="text-xs text-gray-500">
                  {isHi ? 'पिछले उपार्जन सत्रों के भुगतान व बैंक प्रमाणन' : 'Disbursement history and PFMS reference numbers'}
                </p>
              </div>
              <div className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                {isHi ? `कुल ${filteredHistory.length} रिकॉर्ड` : `Total ${filteredHistory.length} Records`}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8faf8] text-gray-600 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">{isHi ? 'सत्र व तिथि' : 'Season & Date'}</th>
                    <th className="p-3.5">{isHi ? 'फसल व लॉट क्र.' : 'Crop & Lot No.'}</th>
                    <th className="p-3.5">{isHi ? 'मात्रा व दर' : 'Quantity & Rate'}</th>
                    <th className="p-3.5">{isHi ? 'अंतरित राशि' : 'Transferred Amount'}</th>
                    <th className="p-3.5">{isHi ? 'PFMS / बैंक UTR' : 'PFMS / UTR'}</th>
                    <th className="p-3.5">{isHi ? 'स्थिति' : 'Status'}</th>
                    <th className="p-3.5 text-right">{isHi ? 'कार्रवाई' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {filteredHistory.map((rec) => {
                    const isCredited = rec.status === 'credited';
                    return (
                      <tr key={rec.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-gray-900">
                            {isHi ? rec.seasonLabelHi : rec.seasonLabelEn}
                          </div>
                          <div className="text-[11px] text-gray-500">{rec.date}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-[#143425]">
                            {isHi ? rec.cropHi : rec.cropEn}
                          </div>
                          <div className="font-mono text-[11px] text-gray-500">{rec.lotNo}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-gray-900">{rec.quantity}</div>
                          <div className="text-[11px] text-gray-500">{rec.rate}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-mono font-black text-sm text-[#1b5e20]">
                            {rec.amount}
                          </div>
                          <div className="text-[10px] text-gray-500">{rec.bank}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-mono font-bold text-gray-800 text-[11px]">{rec.utr}</div>
                          <div className="font-mono text-[10px] text-gray-400">{rec.pfmsId}</div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              isCredited
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                            }`}
                          >
                            {isCredited ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            <span>{isHi ? rec.statusLabelHi : rec.statusLabelEn}</span>
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setIsAdviceModalOpen(true)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-[#eaf3ed] hover:text-[#1b4d3e] text-gray-700 font-bold text-[11px] transition-colors cursor-pointer"
                            title={isHi ? 'ई-पावती देखें' : 'View Receipt'}
                          >
                            <FileText className="w-3 h-3" />
                            <span>{isHi ? 'पावती' : 'Receipt'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DBT CALCULATOR & ESTIMATOR */}
      {activeTab === 'calculator' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#1b7e45]" />
                <span>{isHi ? 'स्मार्ट डीबीटी भुगतान अनुमानक (DBT Payout Estimator)' : 'Smart DBT Payout Estimator'}</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {isHi 
                  ? 'फसल चुनें और अपनी उपज (क्विंटल) डालकर आगामी बैंक भुगतान की अग्रिम गणना करें' 
                  : 'Select crop and enter estimated quintals to calculate anticipated bank payout'}
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              MSP 2024-25 दरें
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Column */}
            <div className="space-y-4 bg-gray-50/80 p-5 rounded-2xl border border-gray-200/80">
              {/* Crop Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  {isHi ? 'फसल का प्रकार चुनें (Select Crop):' : 'Select Crop Type:'}
                </label>
                <select
                  value={calcCrop}
                  onChange={(e) => setCalcCrop(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:ring-2 focus:ring-[#1b4d3e] focus:outline-none cursor-pointer"
                >
                  {Object.entries(cropRates).map(([key, data]) => (
                    <option key={key} value={key}>
                      {isHi ? data.nameHi : data.nameEn} — ₹{data.msp + data.bonus}/Qtl
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    {isHi ? 'उपज मात्रा (क्विंटल में):' : 'Yield Quantity (in Quintals):'}
                  </label>
                  <span className="text-xs font-extrabold text-[#1b5e20] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {calcQuantity} {isHi ? 'क्विंटल' : 'Quintals'}
                  </span>
                </div>

                <input
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={calcQuantity}
                  onChange={(e) => setCalcQuantity(Number(e.target.value))}
                  className="w-full accent-[#1b5e20] cursor-pointer"
                />

                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {[10, 25, 45, 60, 80, 100].map((q) => (
                    <button
                      key={q}
                      onClick={() => setCalcQuantity(q)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        calcQuantity === q
                          ? 'bg-[#1b4d3e] text-white border-[#1b4d3e]'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {q} Qtl
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Rate Tag */}
              <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-1 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>{isHi ? 'केंद्रीय न्यूनतम समर्थन मूल्य (MSP):' : 'Central MSP:'}</span>
                  <span className="font-bold text-gray-900">₹{selectedCropData.msp}/क्विंटल</span>
                </div>
                {selectedCropData.bonus > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>{isHi ? 'मध्य प्रदेश राज्य बोनस:' : 'MP State Bonus:'}</span>
                    <span className="font-bold">+₹{selectedCropData.bonus}/क्विंटल</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-100">
                  <span>{isHi ? 'कुल प्रभावी उपार्जन दर:' : 'Total Effective Rate:'}</span>
                  <span className="text-[#1b5e20]">₹{selectedCropData.msp + selectedCropData.bonus}/क्विंटल</span>
                </div>
              </div>
            </div>

            {/* Calculated Output Column */}
            <div className="bg-[#f0fdf4] border border-emerald-200 p-5 rounded-2xl flex flex-col justify-between shadow-xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {isHi ? 'अनुमानित कुल DBT बैंक क्रेडिट' : 'Estimated Net Bank Transfer'}
                  </span>
                  <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    100% Direct DBT
                  </span>
                </div>

                <div className="text-3xl sm:text-4xl font-black text-[#1b5e20] font-mono tracking-tight">
                  ₹{calcGrossTotal.toLocaleString('en-IN')}.00
                </div>

                <div className="space-y-2 pt-3 border-t border-emerald-200/80 text-xs text-gray-700 font-medium">
                  <div className="flex justify-between">
                    <span>{isHi ? 'केंद्रीय MSP अंश:' : 'Central MSP Share:'}</span>
                    <span className="font-mono font-bold text-gray-900">₹{calcMspTotal.toLocaleString('en-IN')}.00</span>
                  </div>
                  {calcBonusTotal > 0 && (
                    <div className="flex justify-between text-emerald-800">
                      <span>{isHi ? 'म.प्र. शासन बोनस अंश:' : 'MP State Bonus Share:'}</span>
                      <span className="font-mono font-bold">+₹{calcBonusTotal.toLocaleString('en-IN')}.00</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>{isHi ? 'हम्माली व मंडी शुल्क कटौती:' : 'Deductions / Labour Charges:'}</span>
                    <span className="font-mono font-bold text-emerald-700">₹0.00 (शून्य)</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 mt-4 border-t border-emerald-200">
                {onNavigateToBooking ? (
                  <button
                    onClick={onNavigateToBooking}
                    className="w-full bg-[#1b4d3e] hover:bg-[#12362b] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>{isHi ? 'इस मात्रा के लिए स्लॉट बुक करें' : 'Book Mandi Slot for this Quantity'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="text-center text-[11px] text-[#2d6148] font-semibold">
                    {isHi ? '✓ यह राशि तौल उपरांत 48 घंटे में सीधे बैंक खाते में जमा होगी' : '✓ Direct credit within 48 hours post-weighment'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NPCI SEEDING & GRIEVANCE SUPPORT */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Box: Aadhaar DBT Seeding Status */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {isHi ? 'NPCI आधार सीडिंग प्रमाणन' : 'NPCI Aadhaar Seeding Verification'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {isHi ? 'नेशनल पेमेंट्स कॉरपोरेशन ऑफ इंडिया मैपिंग स्थिति' : 'National Payments Corporation of India (APB) Mapping'}
                  </p>
                </div>
              </div>

              <div className="bg-[#f4faf6] p-4 rounded-xl border border-emerald-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{isHi ? 'सीडिंग स्थिति:' : 'Seeding Status:'}</span>
                  <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-700" />
                    {isHi ? 'सक्रिय (DBT Enabled)' : 'Active (DBT Enabled)'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{isHi ? 'प्राथमिक बैंक:' : 'Primary Bank:'}</span>
                  <span className="font-bold text-gray-900">State Bank of India (SBI)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{isHi ? 'खाता संख्या (मास्क्ड):' : 'Account No (Masked):'}</span>
                  <span className="font-mono font-bold text-gray-900">•••• •••• 4812</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{isHi ? 'बायोमेट्रिक प्रमाणीकरण:' : 'Biometric Auth:'}</span>
                  <span className="font-bold text-emerald-800">{isHi ? 'सत्यापित (Verified)' : 'Verified'}</span>
                </div>
              </div>

              {/* Notification Toggles */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-gray-800">
                  {isHi ? 'डीबीटी सूचना प्राथमिकताएं (Alert Settings):' : 'DBT Notification Preferences:'}
                </h4>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-2 text-xs">
                    <Bell className="w-4 h-4 text-emerald-700" />
                    <div>
                      <span className="font-bold text-gray-800 block">
                        {isHi ? 'एसएमएस अलर्ट (+91 98260 ••••)' : 'SMS Alerts (+91 98260 ••••)'}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {isHi ? 'ट्रेजरी स्वीकृति व बैंक क्रेडिट का तत्काल संदेश' : 'Instant SMS on Treasury approval & credit'}
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="accent-[#1b5e20] w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-emerald-700 font-bold">💬</span>
                    <div>
                      <span className="font-bold text-gray-800 block">
                        {isHi ? 'व्हाट्सएप डिजिटल पावती' : 'WhatsApp Digital Advice'}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {isHi ? 'भुगतान होने पर पीडीएफ रसीद व्हाट्सएप पर पाएं' : 'Receive PDF receipt on WhatsApp'}
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={whatsAppAlerts}
                    onChange={(e) => setWhatsAppAlerts(e.target.checked)}
                    className="accent-[#1b5e20] w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Right Box: Grievance / Delay Redressal */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      {isHi ? 'भुगतान सहायता एवं शिकायत निवारण' : 'Payment Helpdesk & Grievance'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {isHi ? 'विलंब, खाता परिवर्तन या त्रुटि समाधान' : 'Resolve payment delay or bank detail issues'}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed mt-2">
                  {isHi 
                    ? 'यदि उपार्जन के 48 घंटे उपरांत भी राशि आपके खाते में अंतरित नहीं हुई है, तो आप सीधे उपार्जन समिति को ऑनलाइन शिकायत दर्ज कर सकते हैं।' 
                    : 'If payment is not credited within 48 hours of weighment, lodge an online inquiry or update bank verification.'}
                </p>

                <div className="mt-4 p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-amber-700" />
                    <span>{isHi ? 'टोल-फ्री हेल्पलाइन नंबर:' : 'Toll-Free Helplines:'}</span>
                  </div>
                  <div className="text-[11px] space-y-0.5">
                    <div>• CM Helpline: <strong className="font-mono">181</strong> (मध्य प्रदेश शासन)</div>
                    <div>• PFMS Helpdesk: <strong className="font-mono">1800-118-111</strong></div>
                    <div>• किसान उपार्जन सहायता: <strong className="font-mono">1800-180-1551</strong></div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={() => setIsGrievanceModalOpen(true)}
                  className="w-full bg-[#854d0e] hover:bg-[#713f0a] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{isHi ? 'ऑनलाइन शिकायत / पुनः प्रयास दर्ज करें' : 'Raise Payment Inquiry / Ticket'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL GOVERNMENT DBT ADVICE VOUCHER MODAL */}
      {isAdviceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-300 space-y-5 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#1b4d3e] text-white flex items-center justify-center font-bold">
                  🌾
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm sm:text-base">
                    {isHi ? 'मध्य प्रदेश शासन — प्रत्यक्ष लाभ अंतरण (DBT) एडवाइस' : 'Govt of Madhya Pradesh — DBT Payment Advice'}
                  </h3>
                  <p className="text-[10.5px] text-gray-500">
                    खाद्य, नागरिक आपूर्ति एवं उपभोक्ता संरक्षण विभाग (e-Uparjan Portal)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAdviceModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Voucher Content (Authentic Govt Document Format) */}
            <div className="border-2 border-dashed border-[#1b4d3e]/40 p-5 rounded-xl bg-[#fafcfa] space-y-4 text-xs text-gray-800">
              {/* Voucher Top Details */}
              <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                <div>
                  <div className="font-mono text-[11px] text-gray-500">
                    {isHi ? 'भुगतान सलाह क्रमांक:' : 'Advice No:'} <strong className="text-gray-900">#ADV-MP25-WHT-88210</strong>
                  </div>
                  <div className="font-mono text-[11px] text-gray-500 mt-0.5">
                    {isHi ? 'उपार्जन पर्ची संदर्भ:' : 'Weighment Ref:'} <strong className="text-gray-900">#WEIGH-8821-B</strong>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {isHi ? 'उपार्जन केंद्र:' : 'Centre:'} <strong>सांवेर उपार्जन केंद्र (Indore)</strong>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300 inline-block">
                    ✓ PFMS अनुमोदित
                  </span>
                  <div className="font-mono text-[11px] text-gray-500 mt-1">
                    26 Oct 2025, 03:10 PM
                  </div>
                </div>
              </div>

              {/* Farmer and Bank Details Grid */}
              <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-gray-200">
                <div>
                  <span className="text-[10px] text-gray-500 block">{isHi ? 'किसान का नाम' : 'Farmer Name'}</span>
                  <strong className="text-gray-900">{farmer?.nameHi || 'रामप्रसाद पाटीदार'}</strong>
                  <div className="text-[10px] text-gray-500 font-mono">ID: {farmer?.id || 'MP-88210'} | समग्र: {farmer?.samagraId || '108821941'}</div>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">{isHi ? 'सत्यापित बैंक खाता' : 'Bank Account'}</span>
                  <strong className="text-gray-900">{farmer?.bankName || 'State Bank of India'}</strong>
                  <div className="text-[10px] text-gray-500 font-mono">A/C: {farmer?.bankAccount ? `•••• ${farmer.bankAccount.slice(-4)}` : '•••• 4812'} (IFSC: {farmer?.ifscCode || 'SBIN0001248'})</div>
                </div>
              </div>

              {/* Crop & Quantity */}
              <div className="grid grid-cols-3 gap-2 text-center bg-white p-2.5 rounded-lg border border-gray-200">
                <div>
                  <span className="text-[10px] text-gray-500 block">{isHi ? 'उपार्जित फसल' : 'Crop'}</span>
                  <span className="font-bold text-gray-900">{cropDisplayName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">{isHi ? 'स्वीकृत वजन' : 'Weight'}</span>
                  <span className="font-bold text-gray-900">{registeredQty}.00 क्विंटल</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">{isHi ? 'कुल दर (MSP+बोनस)' : 'Rate'}</span>
                  <span className="font-bold text-gray-900">₹{effectiveRate.toLocaleString('en-IN')} / Qtl</span>
                </div>
              </div>

              {/* Total Payout */}
              <div className="bg-[#eef7f2] border border-[#a3d9bc] p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-600 block">कुल अंतरित राशि (Net Amount)</span>
                  <span className="text-2xl font-black text-[#1b5e20] font-mono">
                    ₹{grossTotal.toLocaleString('en-IN')}.00
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-[10.5px] font-bold text-gray-700">
                    {getAmountInWords(grossTotal, isHi)}
                  </div>
                  <div className="text-[9.5px] text-emerald-800">
                    Direct Credit to Bank A/C ending {farmer?.bankAccount ? farmer.bankAccount.slice(-4) : '4812'}
                  </div>
                </div>
              </div>

              {/* Official Seal and Signatures */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 text-[10px] text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 border border-gray-300 rounded-lg p-1 bg-white flex items-center justify-center">
                    <QrCode className="w-10 h-10 text-gray-700" />
                  </div>
                  <div>
                    <span className="font-mono text-[9px] block">VERIFY: anndwar.mp.gov.in/v/8821</span>
                    <span className="text-[#1b5e20] font-bold">✓ डिजिटल हस्ताक्षरित</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-gray-800">जिला खाद्य एवं आपूर्ति नियंत्रक</div>
                  <div>इंदौर संभाग, मध्य प्रदेश शासन</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsAdviceModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer"
              >
                {isHi ? 'बंद करें' : 'Close'}
              </button>

              <button
                onClick={() => {
                  window.print();
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1b4d3e] text-white text-xs font-bold hover:bg-[#12362b] transition-colors shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isHi ? 'प्रिंट / पीडीएफ डाउनलोड' : 'Print / Download PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GRIEVANCE / DISPUTE REDRESSAL MODAL */}
      {isGrievanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-300 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span>{isHi ? 'भुगतान सहायता एवं शिकायत फॉर्म' : 'Payment Assistance & Grievance Form'}</span>
              </div>
              <button
                onClick={() => {
                  setIsGrievanceModalOpen(false);
                  setGrievanceSubmitted(false);
                }}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {grievanceSubmitted ? (
              <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xs">
                  <Check className="w-6 h-6" strokeWidth={3} />
                </div>
                <h4 className="font-bold text-emerald-950 text-sm">
                  {isHi ? 'शिकायत सफलतापूर्वक दर्ज हो गई है!' : 'Grievance Registered Successfully!'}
                </h4>
                <p className="text-xs text-emerald-800">
                  {isHi 
                    ? 'शिकायत संदर्भ क्रमांक: #GRV-2025-9921। जिला आपूर्ति अधिकारी को त्वरित समीक्षा हेतु भेज दिया गया है। 24 घंटे में आपको एसएमएस प्राप्त होगा।' 
                    : 'Ticket Ref: #GRV-2025-9921 forwarded to District Officer. SMS confirmation sent.'}
                </p>
                <button
                  onClick={() => {
                    setIsGrievanceModalOpen(false);
                    setGrievanceSubmitted(false);
                  }}
                  className="mt-2 px-4 py-2 bg-[#1b4d3e] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {isHi ? 'ठीक है' : 'Okay'}
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setGrievanceSubmitted(true);
                }}
                className="space-y-3.5 text-xs text-gray-700"
              >
                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {isHi ? 'समस्या का प्रकार चुनें:' : 'Select Issue Category:'}
                  </label>
                  <select className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 font-medium focus:ring-2 focus:ring-[#1b4d3e] focus:outline-none">
                    <option>{isHi ? '48 घंटे बाद भी राशि क्रेडिट नहीं हुई (Payment Delay)' : 'Payment not credited after 48h'}</option>
                    <option>{isHi ? 'बैंक खाता / IFSC अद्यतन अनुरोध (Update Bank IFSC)' : 'Update Bank Account / IFSC'}</option>
                    <option>{isHi ? 'NPCI आधार सीडिंग विफलता (Aadhaar Seeding Issue)' : 'NPCI Aadhaar Mapping issue'}</option>
                    <option>{isHi ? 'राशि में भिन्नता / बोनस कटौती (Amount Discrepancy)' : 'Amount Discrepancy'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {isHi ? 'संबद्ध उपार्जन पर्ची:' : 'Associated Weighment Slip:'}
                  </label>
                  <input
                    type="text"
                    defaultValue="#WEIGH-8821-B (शरबती गेहूँ - 45 Qtl)"
                    disabled
                    className="w-full bg-gray-100 border border-gray-200 rounded-xl p-2 font-mono text-gray-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {isHi ? 'विवरण या टिप्पणी दर्ज करें:' : 'Details or Remarks:'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={isHi ? 'कृपया समस्या का संक्षिप्त विवरण लिखें...' : 'Describe your issue briefly...'}
                    required
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 font-medium focus:ring-2 focus:ring-[#1b4d3e] focus:outline-none"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsGrievanceModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 cursor-pointer"
                  >
                    {isHi ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#1b4d3e] text-white font-bold hover:bg-black cursor-pointer shadow-xs"
                  >
                    {isHi ? 'शिकायत जमा करें' : 'Submit Ticket'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
