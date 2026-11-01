import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  X, 
  Volume2, 
  VolumeX,
  Mic, 
  CheckCheck, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Tractor, 
  Banknote, 
  ExternalLink, 
  Sparkles,
  PhoneCall,
  RotateCcw,
  MessageSquare,
  Bell,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Language, MandiSlot, FarmerProfile } from '../types';
import { openRealWhatsApp, buildWhatsAppUrl } from '../utils/whatsapp';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  options?: Array<{ label: string; action: string; value?: string }>;
  slotDetails?: Partial<MandiSlot>;
}

interface NotificationItem {
  id: string;
  type: 'whatsapp' | 'sms';
  title: string;
  message: string;
  time: string;
  phone: string;
}

interface KisanWhatsAppBotProps {
  lang: Language;
  activeSlot: MandiSlot | null;
  farmer?: FarmerProfile | null;
  onSlotBooked?: (slot: MandiSlot) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
}

export const KisanWhatsAppBot: React.FC<KisanWhatsAppBotProps> = ({
  lang,
  activeSlot,
  farmer,
  onSlotBooked,
  isOpen,
  onClose,
  onOpen,
}) => {
  const isHi = lang === 'hi';
  const [activeTab, setActiveTab] = useState<'chat' | 'messages'>('chat');
  const [inputVal, setInputVal] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);

  // Booking conversation state
  const [bookingState, setBookingState] = useState<{
    crop: string;
    quintal: number;
    center: string;
    time: string;
    vehicle: string;
  }>({
    crop: 'गेहूँ (Sharbati Wheat)',
    quintal: 45,
    center: 'सांवेर मंडी केंद्र (गेट #02)',
    time: '11:00 AM – 12:30 PM',
    vehicle: 'MP-09-EA-4412',
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch recent notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/queue/notifications');
      const data = await res.json();
      if (data?.notifications && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      }
    } catch {
      if (notifications.length === 0) {
        setNotifications([
          {
            id: 'n1',
            type: 'whatsapp',
            title: '🌾 AnnDwar स्लॉट पुष्टि',
            message: 'नमस्ते राम सिंह जी! आपका सांवेर मंडी टोकन #' + (activeSlot?.tokenNumber || 'MP-2409') + ' कन्फर्म हो चुका है।',
            time: 'आज, 10:30 AM',
            phone: farmer?.phone || '9826199999',
          },
          {
            id: 'n2',
            type: 'sms',
            title: '💬 AnnDwar DBT क्रेडिट',
            message: 'बैंक खाता XX4821 में गेहूं उपार्जन राशि ₹1,09,125 DBT द्वारा सफलता पूर्वक प्रेषित कर दी गई है। UTR: RBI2025091104821',
            time: 'कल, 04:15 PM',
            phone: farmer?.phone || '9826199999',
          }
        ]);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const initialMessages: Message[] = [
    {
      id: 'm1',
      sender: 'bot',
      text: isHi
        ? '🌾 **राम-राम किसान भाई!** मैं आपका **AnnDwar व्हाट्सएप सहायक** हूँ।\nआप वेबसाइट की जगह यहीं चैट में ही सारा काम आसानी से कर सकते हैं:\n\nनीचे दिए विकल्पों में से चुनें या लिखकर भेजें:'
        : '🌾 **Welcome Farmer Brother!** I am your **AnnDwar WhatsApp Sahayak**.\nYou can complete all mandi operations directly here in chat:',
      time: 'अभी',
      options: [
        { label: '📅 नया मंडी स्लॉट बुक करें', action: 'book_slot' },
        { label: '⏱️ लाइव टोकन व कतार स्थिति देखें', action: 'check_queue' },
        { label: '💰 DBT भुगतान व MSP स्थिति', action: 'check_payment' },
        { label: '🌾 AI फसल पूर्व-जाँच व नमी मानक', action: 'check_crop' },
        { label: '🔄 स्लॉट री-शेड्यूल करें', action: 'reschedule_slot' },
        { label: '📩 प्राप्त WhatsApp व SMS संदेश देखें', action: 'view_messages' },
        { label: '📞 किसान हेल्पलाइन (1800-180-1551)', action: 'call_helpline' },
      ],
    },
  ];

  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, activeTab]);

  const speakText = (text: string) => {
    if (!speechEnabled) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*_#🌾✅⚠️⏱️💰📅📞🔄📩]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = isHi ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const addBotMessage = (text: string, options?: Message['options'], slotDetails?: Partial<MandiSlot>) => {
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'bot',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      options,
      slotDetails,
    };
    setMessages((prev) => [...prev, newMsg]);
    speakText(text);
  };

  const handleUserSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');

    setTimeout(() => {
      processCommand(text.toLowerCase());
    }, 350);
  };

  const handleOptionClick = (option: { label: string; action: string; value?: string }) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: option.label,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      if (option.action === 'book_slot') {
        startBookingFlow();
      } else if (option.action === 'select_crop') {
        setBookingState((prev) => ({ ...prev, crop: option.value || 'गेहूँ' }));
        addBotMessage(
          isHi
            ? '✅ चुनी गई फसल: **' + option.value + '**\nअब मंडी केंद्र चुनें:'
            : '✅ Selected crop: **' + option.value + '**\nNow choose Mandi Center:',
          [
            { label: '📍 सांवेर मंडी केंद्र (सांवेर)', action: 'select_center', value: 'सांवेर मंडी केंद्र' },
            { label: '📍 इंदौर अनाज मंडी (चोइथराम)', action: 'select_center', value: 'इंदौर अनाज मंडी' },
            { label: '📍 देवास उपार्जन केंद्र', action: 'select_center', value: 'देवास उपार्जन केंद्र' },
          ]
        );
      } else if (option.action === 'select_center') {
        setBookingState((prev) => ({ ...prev, center: option.value || 'सांवेर मंडी केंद्र' }));
        addBotMessage(
          isHi
            ? '📍 केंद्र चुना गया: **' + option.value + '**\nमंडी आगमन हेतु समय स्लॉट चुनें:'
            : '📍 Center: **' + option.value + '**\nSelect time slot:',
          [
            { label: '⏰ सुबह 09:00 – 10:30 AM', action: 'select_time', value: '09:00 AM – 10:30 AM' },
            { label: '⏰ दोपहर 11:00 AM – 12:30 PM (अनुशंसित)', action: 'select_time', value: '11:00 AM – 12:30 PM' },
            { label: '⏰ दोपहर 02:00 – 03:30 PM', action: 'select_time', value: '02:00 PM – 03:30 PM' },
          ]
        );
      } else if (option.action === 'select_time') {
        finalizeBooking(option.value || '11:00 AM – 12:30 PM');
      } else if (option.action === 'check_queue') {
        showQueueStatus();
      } else if (option.action === 'check_payment') {
        showPaymentStatus();
      } else if (option.action === 'check_crop') {
        showCropGuidance();
      } else if (option.action === 'reschedule_slot') {
        startRescheduleFlow();
      } else if (option.action === 'view_messages') {
        setActiveTab('messages');
      } else if (option.action === 'call_helpline') {
        window.open('tel:18001801551', '_self');
      }
    }, 400);
  };

  const startBookingFlow = () => {
    addBotMessage(
      isHi
        ? '🌾 **मंडी स्लॉट बुकिंग:** आप किस फसल का उपार्जन कराना चाहते हैं?'
        : '🌾 **Slot Booking:** Which crop would you like to procure?',
      [
        { label: '🌾 गेहूँ (Wheat)', action: 'select_crop', value: 'गेहूँ (Sharbati Wheat)' },
        { label: '🌱 चना (Gram / Chana)', action: 'select_crop', value: 'चना (Desi Chana)' },
        { label: '🌿 सोयाबीन (Soybean)', action: 'select_crop', value: 'सोयाबीन (Yellow Soybean)' },
        { label: '🌾 धान (Paddy)', action: 'select_crop', value: 'धान (Paddy)' },
      ]
    );
  };

  const finalizeBooking = (timeSlot: string) => {
    const newToken = 'MP-' + Math.floor(2000 + Math.random() * 8000);
    const dateStr = '28 मार्च 2025';

    const newSlot: MandiSlot = {
      id: 'slot_' + Date.now(),
      tokenNumber: newToken,
      farmerId: farmer?.id || 'MP-88210',
      farmerName: farmer?.nameHi || 'राम सिंह (Ram Singh)',
      date: dateStr,
      timeSlot: timeSlot,
      gateArrivalExpected: '11:00 AM',
      mandiCenterName: bookingState.center,
      gateNumber: 'गेट #02',
      laneNumber: 'लेन #01',
      cropName: bookingState.crop,
      cropGrade: 'Grade-A (FAQ)',
      quantityQuintal: bookingState.quintal,
      mspRatePerQuintal: 2425,
      totalEstimatedValue: bookingState.quintal * 2425,
      vehicleNumber: bookingState.vehicle,
      vehicleType: 'ट्रैक्टर ट्रॉली',
      status: 'confirmed',
      bookingTimestamp: new Date().toISOString(),
      qrCodeData: 'ANNDWAR|' + newToken + '|' + (farmer?.id || 'MP-88210') + '|' + dateStr + '|11:00 AM',
    };

    if (onSlotBooked) {
      onSlotBooked(newSlot);
    }

    const regPhone = farmer?.phone || '9826199999';

    addBotMessage(
      isHi
        ? '🎉 **बधाई हो! आपका मंडी स्लॉट सफलतापूर्वक बुक हो गया है!**\n\n🎫 **टोकन नंबर:** #' + newToken + '\n🌾 **फसल:** ' + bookingState.crop + ' (' + bookingState.quintal + ' क्विंटल)\n📍 **मंडी:** ' + bookingState.center + '\n⏰ **समय:** ' + timeSlot + '\n🚜 **वाहन:** ' + bookingState.vehicle + '\n\n📲 इसकी पुष्टि आपके पंजीकृत मोबाइल **+91 ' + regPhone + '** पर WhatsApp व SMS द्वारा भेज दी गई है।'
        : '🎉 **Success! Your Mandi Slot has been booked!**\n\n🎫 **Token:** #' + newToken + '\n🌾 **Crop:** ' + bookingState.crop + '\n📍 **Mandi:** ' + bookingState.center + '\n⏰ **Time:** ' + timeSlot + '\n\nConfirmation dispatched to registered mobile +91 ' + regPhone + '.',
      [
        { label: '⏱️ लाइव कतार देखें', action: 'check_queue' },
        { label: '📩 मेरे संदेश देखें', action: 'view_messages' },
      ],
      newSlot
    );
  };

  const showQueueStatus = () => {
    const token = activeSlot?.tokenNumber || 'MP-2409';
    const vehicle = activeSlot?.vehicleNumber || 'MP-09-GE-4102';
    const center = activeSlot?.mandiCenterName || 'सांवेर मंडी केंद्र';
    const gate = activeSlot?.gateNumber || 'गेट #02';

    addBotMessage(
      isHi
        ? '⏱️ **लाइव मंडी कतार स्थिति:**\n\n🎫 **आपका टोकन:** #' + token + '\n🚜 **पंजीकृत वाहन:** ' + vehicle + '\n📍 **मंडी केंद्र:** ' + center + ' (' + gate + ')\n🔢 **कतार में स्थान:** 14वां वाहन\n⏳ **अनुमानित प्रतीक्षा समय:** ~35 मिनट\n\n📢 **मंडी निर्देश:** कृपया गेट #02 के समीप लेन #01 में वाहन व्यवस्थित रखें। तौलकांटा #02 उपलब्ध होते ही टोकन बुलाया जाएगा।'
        : '⏱️ **Live Mandi Queue:**\n\n🎫 **Token:** #' + token + '\n🚜 **Vehicle:** ' + vehicle + '\n📍 **Mandi:** ' + center + '\n🔢 **Queue Position:** 14th Vehicle\n⏳ **Est. Wait:** ~35 mins'
    );
  };

  const showPaymentStatus = () => {
    addBotMessage(
      isHi
        ? '💰 **DBT भुगतान स्थिति (AnnDwar):**\n\n🌾 **फसल:** गेहूँ (Sharbati) - 45 क्विंटल\n🏷️ **सरकारी समर्थन मूल्य (MSP):** ₹2,425 / क्विंटल\n💵 **कुल उपार्जन राशि:** ₹1,09,125\n\n✅ **भुगतान स्थिति:** सफल (DBT Credit Completed)\n🏛️ **बैंक खाता:** State Bank of India (XX4821)\n🔖 **UTR सं.:** RBI2025091104821\n\nराशि सीधे आपके आधार लिंक्ड बैंक खाते में जमा हो चुकी है।'
        : '💰 **DBT Payment Status:**\n\n🌾 **Crop:** Wheat (45 Quintal)\n💵 **Total Amount:** ₹1,09,125\n✅ **Status:** Direct Bank Credit Complete (UTR: RBI2025091104821).'
    );
  };

  const showCropGuidance = () => {
    addBotMessage(
      isHi
        ? '🌾 **AnnDwar फसल गुणवत्ता मानक (MSP Guidelines):**\n\n1. **नमी (Moisture):** अधिकतम 12%। यदि नमी अधिक है तो 2-3 घंटे धूप में सुखाएं।\n2. **विजातीय तत्व (Dust/Chaff):** 0.75% से कम होना चाहिए। छलनी से छानकर लाएं।\n3. **टूटे/क्षतिग्रस्त दाने:** 2% से कम।\n\n💡 आप बायीं नेविगेशन में **"🌾 AI फसल पूर्व-जाँच"** पर जाकर अपने अनाज की फोटो अपलोड करके वास्तविक समय में विश्लेषण कर सकते हैं!'
        : '🌾 **MSP Grain Standards:**\n- Moisture: Max 12.0%\n- Foreign Matter: Max 0.75%\nUse the "AI Pre-Crop Check" in the left navigation to test real-time quality.'
    );
  };

  const startRescheduleFlow = () => {
    addBotMessage(
      isHi
        ? '🔄 **स्लॉट री-शेड्यूल:** अपनी सुविधा अनुसार नया दिन चुनें:'
        : '🔄 **Reschedule Slot:** Choose your preferred new date:',
      [
        { label: '📅 कल (29 मार्च 2025) - सुबह 11:00 AM', action: 'select_time', value: '11:00 AM – 12:30 PM' },
        { label: '📅 परसों (30 मार्च 2025) - दोपहर 02:00 PM', action: 'select_time', value: '02:00 PM – 03:30 PM' },
      ]
    );
  };

  const processCommand = (lower: string) => {
    if (lower.includes('token') || lower.includes('queue') || lower.includes('कतार') || lower.includes('टोकन') || lower.includes('line')) {
      showQueueStatus();
    } else if (lower.includes('book') || lower.includes('स्लॉट') || lower.includes('slot') || lower.includes('बुक')) {
      startBookingFlow();
    } else if (lower.includes('payment') || lower.includes('dbt') || lower.includes('पैसा') || lower.includes('भुगतान') || lower.includes('msp')) {
      showPaymentStatus();
    } else if (lower.includes('crop') || lower.includes('नमी') || lower.includes('quality') || lower.includes('गुणवत्ता') || lower.includes('moisture') || lower.includes('जांच')) {
      showCropGuidance();
    } else if (lower.includes('reschedule') || lower.includes('बदल') || lower.includes('तारीख')) {
      startRescheduleFlow();
    } else if (lower.includes('help') || lower.includes('phone') || lower.includes('call') || lower.includes('नंबर') || lower.includes('मदद')) {
      window.open('tel:18001801551', '_self');
    } else if (lower.includes('message') || lower.includes('sms') || lower.includes('whatsapp') || lower.includes('संदेश')) {
      setActiveTab('messages');
    } else {
      addBotMessage(
        isHi
          ? '🌾 मैं आपकी पूरी सहायता कर सकता हूँ! कृपया नीचे दिए गए विकल्पों में से एक चुनें:'
          : '🌾 I can assist you with all mandi operations! Please choose an option below:',
        initialMessages[0].options
      );
    }
  };

  // FLOATING LAUNCHER BUTTON (Bottom Right Corner)
  if (!isOpen) {
    return (
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 group">
        <div 
          onClick={onOpen || onClose} 
          className="hidden sm:flex items-center gap-2 bg-white text-[#14472c] text-xs font-bold py-2 px-3.5 rounded-2xl shadow-xl border border-[#a8e2be] cursor-pointer hover:bg-[#edf8f1] transition-all"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-ping"></span>
          <span>{isHi ? '💬 AnnDwar व्हाट्सएप सहायक' : 'WhatsApp Sahayak'}</span>
        </div>

        <button
          type="button"
          onClick={onOpen || onClose}
          className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-transform cursor-pointer border-2 border-white focus:outline-none"
          title={isHi ? 'AnnDwar व्हाट्सएप सहायक खोलें' : 'Open WhatsApp Assistant'}
        >
          <span className="text-3xl">💬</span>
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
            1
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-50 w-[95vw] sm:w-[420px] h-[620px] max-h-[92vh] bg-[#efeae2] rounded-3xl shadow-2xl border border-gray-300 flex flex-col overflow-hidden font-sans animate-fadeIn">
      {/* WhatsApp Header */}
      <div className="bg-[#008069] text-white px-4 py-3 flex items-center justify-between flex-shrink-0 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-0.5 border border-white/40 overflow-hidden flex-shrink-0 shadow-xs">
            <img src="/logo.png" alt="AnnDwar" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm leading-tight text-white">
                {isHi ? 'AnnDwar व्हाट्सएप सहायक' : 'AnnDwar WhatsApp'}
              </h3>
              <span className="text-[#88f0bc] text-xs font-bold" title="Official Verified">✓</span>
            </div>
            <p className="text-[11px] text-[#bbf7d0] flex items-center gap-1 leading-tight mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#88f0bc] animate-pulse"></span>
              <span>{isHi ? 'ऑनलाइन • 24x7 किसान सेवा' : 'Online • 24x7 Assistant'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setSpeechEnabled(!speechEnabled);
              if (isSpeaking) window.speechSynthesis?.cancel();
            }}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              speechEnabled ? 'text-white bg-white/20' : 'text-emerald-300 hover:bg-white/10'
            }`}
            title={speechEnabled ? 'आवाज़ बंद करें' : 'आवाज़ चालू करें'}
          >
            {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sub-Header Mode Tabs */}
      <div className="bg-[#00705b] px-3 py-1.5 flex items-center justify-between text-xs font-bold text-white border-t border-white/10">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-white text-[#008069] shadow-xs'
                : 'text-emerald-100 hover:bg-white/15'
            }`}
          >
            💬 {isHi ? 'सहायक चैट' : 'Chatbot'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('messages')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'messages'
                ? 'bg-white text-[#008069] shadow-xs'
                : 'text-emerald-100 hover:bg-white/15'
            }`}
          >
            <Bell className="w-3 h-3" />
            <span>{isHi ? 'संदेश व अलर्ट' : 'Alerts'}</span>
            <span className="bg-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full text-emerald-200 font-mono">
              {notifications.length}
            </span>
          </button>
        </div>

        <span className="text-[10.5px] text-emerald-200 font-mono">
          +91 {farmer?.phone || '9826199999'}
        </span>
      </div>

      {/* VIEW 1: CHATBOT VIEW */}
      {activeTab === 'chat' && (
        <>
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#efeae2]/90">
            <div className="bg-[#ffeecd] text-[#54656f] text-[10.5px] text-center p-2 rounded-xl shadow-2xs mx-2 border border-[#f0dfbc]">
              🔒 {isHi ? 'यह चैट AnnDwar आधिकारिक उपार्जन प्रणाली से सुरक्षित है।' : 'Messages are end-to-end encrypted with AnnDwar Official Portal.'}
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-xs text-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none'
                      : 'bg-white text-[#111b21] rounded-tl-none border border-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-500">
                    <span>{msg.time}</span>
                    {msg.sender === 'user' && (
                      <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                    )}
                  </div>
                </div>

                {msg.options && msg.options.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1.5 w-[85%]">
                    {msg.options.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleOptionClick(opt)}
                        className="bg-white hover:bg-[#e7f8ef] text-[#008069] border border-[#a8e2be] text-left text-xs font-bold p-2.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <span>{opt.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#008069] group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-2.5 bg-[#f0f2f5] border-t border-gray-300 flex items-center gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleUserSend(inputVal);
              }}
              placeholder={isHi ? 'यहाँ लिखें: टोकन, स्लॉट, डीबीटी, नमी...' : 'Type message: slot, token, dbt...'}
              className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2.5 text-xs text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#008069] shadow-inner"
            />

            <button
              type="button"
              onClick={() => handleUserSend(inputVal)}
              disabled={!inputVal.trim()}
              className="w-10 h-10 rounded-full bg-[#008069] hover:bg-[#006e5a] disabled:opacity-50 text-white flex items-center justify-center shadow-md cursor-pointer transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      {/* VIEW 2: MESSAGES & ALERTS VIEW */}
      {activeTab === 'messages' && (
        <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-[#f5f8f6]">
          <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-800">
                {isHi ? 'पंजीकृत मोबाइल नंबर:' : 'Registered Mobile:'}
              </p>
              <p className="text-sm font-mono font-black text-[#008069]">
                +91 {farmer?.phone || '9826199999'}
              </p>
            </div>
            <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
              ✓ {isHi ? 'सत्यापित' : 'Active'}
            </span>
          </div>

          <p className="text-[11px] font-bold text-gray-600 px-1 pt-1">
            {isHi ? 'हाल के WhatsApp व SMS अलर्ट:' : 'Recent WhatsApp & SMS Alerts:'}
          </p>

          {notifications.map((n) => (
            <div
              key={n.id}
              className="bg-white rounded-2xl p-3 border border-gray-200 shadow-xs flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  n.type === 'whatsapp'
                    ? 'bg-[#25D366]/20 text-[#075e54]'
                    : 'bg-sky-100 text-sky-800'
                }`}>
                  <span>{n.type === 'whatsapp' ? '💬 WhatsApp' : '📱 SMS'}</span>
                </span>
                <span className="text-[10px] text-gray-500">{n.time}</span>
              </div>

              <h4 className="font-bold text-xs text-gray-900">{n.title}</h4>
              <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">
                {n.message}
              </p>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between mt-1">
                <span className="text-[10px] text-gray-500 font-mono">
                  To: +91 {n.phone || farmer?.phone || '9826199999'}
                </span>

                <button
                  type="button"
                  onClick={() => openRealWhatsApp(n.phone || farmer?.phone || '9826199999', n.message)}
                  className="bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                >
                  <span>WhatsApp पर खोलें</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
