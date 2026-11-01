import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Truck, 
  CheckCircle2, 
  Camera, 
  QrCode, 
  Search, 
  RefreshCw, 
  Check, 
  Clock,
  ArrowRight,
  Scale,
  Building2,
  AlertCircle,
  FileCheck2,
  Sparkles,
  Users,
  Send,
  MessageSquare
} from 'lucide-react';
import { Language, MandiSlot } from '../types';
import { openRealWhatsApp } from '../utils/whatsapp';

interface MandiOperatorTerminalProps {
  lang: Language;
  activeSlot: MandiSlot | null;
  onOpenReceipt: () => void;
  onViewFarmerPortal?: () => void;
}

export const MandiOperatorTerminal: React.FC<MandiOperatorTerminalProps> = ({
  lang,
  activeSlot,
  onOpenReceipt,
  onViewFarmerPortal,
}) => {
  const isHi = lang === 'hi';

  const [searchToken, setSearchToken] = useState<string>('');
  const [filterTab, setFilterTab] = useState<string>('all');
  const [actionSuccess, setActionSuccess] = useState<string>('');
  const [lastWhatsAppAction, setLastWhatsAppAction] = useState<{ phone: string; message: string; farmerName: string } | null>(null);
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch registered farmers from live queue API
  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/queue/farmers');
      const data = await res.json();
      if (data.success && Array.isArray(data.farmers)) {
        setQueueItems(data.farmers);
        if (data.farmers.length > 0 && !searchToken) {
          setSearchToken(data.farmers[0].token);
        }
      }
    } catch (err) {
      console.error('Failed to fetch operator queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 3000);
    return () => clearInterval(interval);
  }, []);

  // Active farmer selected or topmost in queue
  const activeItem = (searchToken ? queueItems.find(it => it.token === searchToken || it.token.includes(searchToken.replace('#', ''))) : null) || queueItems[0];
  const farmerToken = activeItem?.token || (activeSlot?.tokenNumber ? `#${activeSlot.tokenNumber}` : '—');
  const farmerName = activeItem?.farmerName || activeSlot?.farmerName || 'कोई किसान प्रतीक्षारत नहीं';
  const farmerVehicle = activeItem?.vehicleNo || activeSlot?.vehicleNumber || '—';
  const farmerCrop = activeItem?.crop || (activeSlot ? `${activeSlot.cropName} (${activeSlot.quantityQuintal} Qt)` : '—');
  const farmerPhone = activeItem?.phone || '—';

  const handleAction = async (token: string, actionType: string, customScale: string = 'कांटा क्र. 02') => {
    try {
      const item = queueItems.find(it => it.token === token) || activeItem;
      const fName = item?.farmerName || 'किसान भाई';
      const fPhone = item?.phone || '9826199999';

      const res = await fetch('/api/queue/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, actionType, scale: customScale })
      });
      const data = await res.json();

      let msgText = '';
      if (actionType === 'call_scale') {
        msgText = `🚨 तत्काल धर्मकांटा बुलावा!\nनमस्ते ${fName} जी, आपके टोकन ${token} (वाहन: ${item?.vehicleNo || 'MP-09-GE-4102'}) को ${customScale} पर तौल हेतु बुलाया गया है। कृपया बिना विलंब अपना वाहन कांटे पर लाएं।\nउपार्जन केंद्र: ${item?.mandiName || 'सांवेर उपार्जन केंद्र'}`;
        setActionSuccess(`✓ टोकन ${token} (${fName}) को ${customScale} पर बुलाया गया! किसान (+91 ${fPhone}) को WhatsApp व SMS भेजा गया एवं किसान पोर्टल पर लाइव अलर्ट सक्रिय हुआ।`);
      } else if (actionType === 'gate_call' || actionType === 'gate_entry') {
        msgText = `🚪 गेट आगमन दर्ज!\nनमस्ते ${fName} जी, आपके टोकन ${token} का गेट आगमन दर्ज कर लिया गया है। कृपया वाहन को नमी व गुणवत्ता परीक्षण काउंटर पर ले जाएं।\nउपार्जन केंद्र: ${item?.mandiName || 'सांवेर उपार्जन केंद्र'}`;
        setActionSuccess(`✓ टोकन ${token} (${fName}) का गेट आगमन दर्ज हुआ! नमी परीक्षण काउंटर पर पहुंचने हेतु WhatsApp व SMS सूचना प्रेषित।`);
      } else if (actionType === 'record_weight') {
        msgText = `⚖️ वजन दर्ज!\nनमस्ते ${fName} जी, आपके टोकन ${token} का तौल वजन सफलतापूर्वक दर्ज हो गया है। ई-उपार्जन पावती तैयार हो रही है।\nउपार्जन केंद्र: ${item?.mandiName || 'सांवेर उपार्जन केंद्र'}`;
        setActionSuccess(`✓ टोकन ${token} (${fName}) का तौल वजन दर्ज हुआ! ई-पावती सृजन सूचना किसान को WhatsApp/SMS से प्रेषित।`);
      } else if (actionType === 'slip_recommend') {
        msgText = `📜 ई-पावती निर्गत!\nनमस्ते ${fName} जी, आपके टोकन ${token} की डिजिटल पावती जारी हो गई है। DBT बैंक अंतरण प्रक्रिया प्रारंभ हो चुकी है।\nउपार्जन केंद्र: ${item?.mandiName || 'सांवेर उपार्जन केंद्र'}`;
        setActionSuccess(`✓ टोकन ${token} (${fName}) की डिजिटल पावती निर्गत हुई! DBT बैंक भुगतान प्रक्रिया प्रारंभ।`);
      } else {
        msgText = `🌾 AnnDwar: टोकन ${token} की कार्यवाही अपडेट हुई।`;
        setActionSuccess(`✓ कार्यवाही सफल: टोकन ${token}`);
      }

      setLastWhatsAppAction({
        phone: fPhone,
        message: `🌾 AnnDwar - Kisan se Desh Tak 🌾\n${msgText}\nटोल-फ्री हेल्पलाइन: 1800-180-1551`,
        farmerName: fName
      });

      await fetchQueue();
    } catch (e) {
      console.error('Failed to trigger operator action:', e);
      setActionSuccess('कार्यवाही में त्रुटि हुई');
    }
    setTimeout(() => setActionSuccess(''), 6000);
  };

  const handleGateEntry = async () => {
    if (!activeItem) {
      setActionSuccess('कतार में कोई किसान नहीं है। कृपया पहले किसान पोर्टल से पंजीकरण करें।');
      setTimeout(() => setActionSuccess(''), 3500);
      return;
    }
    await handleAction(activeItem.token, 'gate_call');
  };

  const filteredQueue = queueItems.filter((item) => {
    if (filterTab === 'all') return true;
    if (filterTab === 'gate') return item.stageType === 'gate_wait';
    if (filterTab === 'quality') return item.stageType === 'quality';
    if (filterTab === 'scale') return item.stageType === 'weighment';
    if (filterTab === 'receipt') return item.stageType === 'ready' || item.stageType === 'unloading';
    return true;
  });

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Greeting & Center Info */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1b7e45] animate-pulse"></span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#143224] tracking-tight">
            {isHi ? 'मंडी ऑपरेटर टर्मिनल (सांवेर उपार्जन केंद्र)' : 'Mandi Operator Terminal (Sanwer Centre)'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold bg-[#fffae6] text-[#854d0e] border border-amber-300 px-2.5 py-1 rounded-xl">
            गेट #02 लाइव
          </span>
        </div>
      </div>

      {/* Action Toast / Live Banner with Real WhatsApp trigger */}
      {actionSuccess && (
        <div className="bg-[#edf9f2] border-2 border-[#a6e2bf] text-[#14532d] px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-fadeIn flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1b7e45] shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <div className="flex items-center gap-2">
            {lastWhatsAppAction && (
              <button
                onClick={() => openRealWhatsApp(lastWhatsAppAction.phone, lastWhatsAppAction.message)}
                className="bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11.5px] font-bold px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
                title="किसान के वास्तविक WhatsApp पर तुरंत संदेश भेजें"
              >
                <span>📲</span>
                <span>किसान को असली WhatsApp भेजें</span>
              </button>
            )}
            <button onClick={() => setActionSuccess('')} className="text-[#14532d] hover:text-black font-bold cursor-pointer">✕</button>
          </div>
        </div>
      )}

      {/* 3 Summary Stat Cards (Dynamic from real registrations) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stat 1: Total Slots */}
        <div className="bg-white rounded-2xl border border-[#d2dfd6] p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#637d70] block">
              {isHi ? 'पंजीकृत किसान (Live Registrations)' : 'Registered Farmers'}
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#143224] tracking-tight">
                {queueItems.length}
              </span>
              <span className="text-xs font-semibold text-[#3b6750]">
                {isHi ? 'किसान रिकॉर्ड' : 'Farmer Records'}
              </span>
            </div>
            <p className="text-[11px] text-[#2c8352] mt-1 font-medium">
              {queueItems.length > 0 ? (isHi ? '✓ सभी लाइव पंजीकृत' : 'Live registered') : (isHi ? 'प्रतीक्षारत' : 'Awaiting entry')}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#eef7f1] text-[#1b7e45] flex items-center justify-center border border-[#d5e8dc]">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 2: In-Yard Queued Vehicles */}
        <div className="bg-white rounded-2xl border border-[#d2dfd6] p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#637d70] block">
              {isHi ? 'परिसर/यार्ड में सक्रिय किसान' : 'Active in Mandi Yard'}
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#854d0e] tracking-tight">
                {queueItems.filter((it: any) => it.stageType !== 'ready').length}
              </span>
              <span className="text-xs font-semibold text-[#854d0e]">
                {isHi ? 'प्रक्रियाधीन' : 'In Process'}
              </span>
            </div>
            <p className="text-[11px] text-[#854d0e] mt-1 font-medium">
              {isHi ? 'सुचारू तौल व संचालन' : 'Smooth movement'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#fffbeb] text-[#b45309] flex items-center justify-center border border-[#fef3c7]">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 3: Completed Weighments */}
        <div className="bg-white rounded-2xl border border-[#d2dfd6] p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#637d70] block">
              {isHi ? 'तौल व पावती पूर्ण' : 'Weighment Completed'}
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#1b7e45] tracking-tight">
                {queueItems.filter((it: any) => it.stageType === 'ready').length}
              </span>
              <span className="text-xs font-semibold text-[#2c8352]">
                {isHi ? 'सफल' : 'Completed'}
              </span>
            </div>
            <p className="text-[11px] text-[#2c8352] mt-1 font-medium">
              {isHi ? 'DBT भुगतान पाइपलाइन सक्रिय' : 'DBT pipeline active'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#eef7f1] text-[#1b7e45] flex items-center justify-center border border-[#d5e8dc]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Gate Entry & Barcode Scanner Panel */}
      <div className="bg-white rounded-2xl border border-[#d2dfd6] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#143224]">
              {isHi ? 'गेट प्रवेश एवं किसान सत्यापन (Gate Entry Scanner)' : 'Gate Entry & Farmer Verification'}
            </h3>
            <p className="text-xs text-[#597867] mt-0.5">
              {isHi ? 'मोबाइल SMS/पर्ची का QR कोड स्कैन करें या टोकन नंबर खोजें' : 'Scan QR code or search token to approve entry'}
            </p>
          </div>
          <span className="text-[11px] font-semibold bg-[#eef7f1] text-[#1b7e45] px-2.5 py-1 rounded-lg border border-[#c4e3d1]">
            गेट लेन #01 चालू
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Scan Camera Box */}
          <div className="lg:col-span-4 border border-[#d2dfd6] rounded-xl p-4 bg-[#fbfdfb] flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full border border-[#d2dfd6] bg-white flex items-center justify-center mb-2.5 text-[#1b4d3e] shadow-xs">
              <Camera className="w-6 h-6" />
            </div>
            <button
              onClick={() => {
                if (queueItems.length > 0) {
                  const firstToken = queueItems[0].token;
                  setActionSuccess(`कैमरा स्कैनर: QR कोड स्कैन हुआ (${firstToken})!`);
                  setSearchToken(firstToken);
                } else {
                  setActionSuccess('कोई किसान पंजीकृत नहीं है। किसान पोर्टल से पंजीकरण करें।');
                }
                setTimeout(() => setActionSuccess(''), 3500);
              }}
              className="w-full py-2.5 px-3 bg-[#1b4d3e] hover:bg-[#143e31] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-[#88f0bc]" />
              <span>{isHi ? 'QR स्कैन करें (Scan QR)' : 'Scan Barcode / QR'}</span>
            </button>
            <p className="text-[10.5px] text-[#718b7c] mt-2">
              {isHi ? 'वाहन RFID टैग स्वतः स्कैन समर्थित' : 'RFID Sensor auto-detect enabled'}
            </p>
          </div>

          {/* Farmer Verification Box */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchToken}
                  onChange={(e) => setSearchToken(e.target.value)}
                  placeholder={queueItems[0]?.token || '#MP-88210'}
                  className="w-full border border-[#cfe0d5] rounded-xl pl-9 pr-3 py-2 text-xs font-bold font-mono text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#1b7e45]"
                />
              </div>
              <button
                onClick={() => {
                  const match = queueItems.find(it => it.token === searchToken || it.token.includes(searchToken.replace('#', '')));
                  if (match) {
                    setActionSuccess(`टोकन ${match.token} सत्यापित हुआ: ${match.farmerName} (${match.mandiName})`);
                  } else if (queueItems.length > 0) {
                    setActionSuccess(`टोकन ${queueItems[0].token} सक्रिय है: ${queueItems[0].farmerName}`);
                  } else {
                    setActionSuccess('कोई पंजीकृत किसान नहीं मिला।');
                  }
                  setTimeout(() => setActionSuccess(''), 3500);
                }}
                className="px-4 py-2 bg-[#1b4d3e] hover:bg-[#153e32] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <Check className="w-3.5 h-3.5 text-[#88f0bc]" />
                <span>{isHi ? 'सत्यापित करें' : 'Verify'}</span>
              </button>
            </div>

            {/* Farmer Info preview */}
            <div className="border border-[#cfe0d5] rounded-xl p-3.5 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#eef7f1] text-[#14532d] font-bold flex items-center justify-center text-sm border border-[#bce3cb]">
                  {farmerName ? farmerName.slice(0, 2) : 'MP'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#143224]">{farmerName}</span>
                    {activeItem && (
                      <span className="text-[10px] font-bold bg-[#e3f7ec] text-[#147437] border border-[#a8e3c1] px-1.5 py-0.2 rounded">
                        e-KYC पास
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#527060] mt-0.5 flex items-center flex-wrap gap-1.5">
                    {activeItem ? (
                      <>
                        <span>वाहन: <strong className="font-mono text-[#143224]">{farmerVehicle}</strong> | {farmerCrop} | 📱 +91 {farmerPhone}</span>
                        <button
                          onClick={() => {
                            const msg = `🌾 AnnDwar - Kisan se Desh Tak 🌾\nनमस्ते ${farmerName} जी, आपके टोकन ${farmerToken} (वाहन: ${farmerVehicle}) का उपार्जन केंद्र पर सत्यापन किया जा रहा है।`;
                            openRealWhatsApp(farmerPhone, msg);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#128C7E] bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 px-2 py-0.5 rounded cursor-pointer transition-colors"
                          title="असली WhatsApp पर संदेश भेजें"
                        >
                          <span>📲 WhatsApp खोलें</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 italic">वर्तमान में कोई किसान यार्ड गेट पर प्रतीक्षारत नहीं है</span>
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={handleGateEntry}
                disabled={!activeItem}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-xs ${
                  !activeItem
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : activeItem?.stageType !== 'gate_wait'
                    ? 'bg-[#14532d] cursor-pointer'
                    : 'bg-[#1b7e45] hover:bg-[#156337] cursor-pointer'
                }`}
              >
                <span>🚪</span>
                <span>
                  {activeItem && activeItem.stageType !== 'gate_wait'
                    ? (isHi ? '✓ गेट आगमन दर्ज (सम्पन्न)' : 'Gate Entry Recorded ✓')
                    : (isHi ? '🚪 गेट आगमन दर्ज करें (Reached Gate)' : 'Mark Gate Arrival (Reached Gate)')}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Yard Queue Table */}
      <div className="bg-white rounded-2xl border border-[#d2dfd6] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#edf3ef] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#143224]">
              {isHi ? 'सक्रिय कतार प्रबंधन (Real-Time Mandi Yard Queue)' : 'Active Yard Queue'}
            </h3>
            <p className="text-xs text-[#597867] mt-0.5">
              {isHi ? 'पंजीकृत किसानों की लाइव सूची एवं तौल कांटा नियंत्रण' : 'Real-time registered farmer queue & scale directive control'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#597867]">
            <span className="inline-flex items-center gap-1 text-[#2c8352]">
              <span className="w-2 h-2 rounded-full bg-[#1b7e45] animate-ping"></span>
              {isHi ? 'लाइव सिंक' : 'Live Sync'}
            </span>
            <button
              onClick={() => {
                fetchQueue();
                setActionSuccess('कतार डेटा रिफ्रेश हुआ!');
                setTimeout(() => setActionSuccess(''), 2000);
              }}
              className="p-1 hover:bg-[#f0f5f2] rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#2c8352]" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              filterTab === 'all'
                ? 'bg-[#1b4d3e] text-white shadow-xs'
                : 'bg-[#f0f5f2] text-[#3d5f4e] hover:bg-[#e4eee7]'
            }`}
          >
            {isHi ? `सभी किसान (${queueItems.length})` : `All Farmers (${queueItems.length})`}
          </button>
          <button
            onClick={() => setFilterTab('gate')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              filterTab === 'gate'
                ? 'bg-[#1b4d3e] text-white shadow-xs'
                : 'bg-[#f0f5f2] text-[#3d5f4e] hover:bg-[#e4eee7]'
            }`}
          >
            {isHi ? `गेट प्रतीक्षारत (${queueItems.filter((i: any) => i.stageType === 'gate_wait').length})` : `Gate Wait (${queueItems.filter((i: any) => i.stageType === 'gate_wait').length})`}
          </button>
          <button
            onClick={() => setFilterTab('quality')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              filterTab === 'quality'
                ? 'bg-[#b45309] text-white shadow-xs'
                : 'bg-[#fffbeb] text-[#b45309] border border-amber-200 hover:bg-amber-100'
            }`}
          >
            {isHi ? `गुणवत्ता लैब (${queueItems.filter((i: any) => i.stageType === 'quality').length})` : `Quality Lab (${queueItems.filter((i: any) => i.stageType === 'quality').length})`}
          </button>
          <button
            onClick={() => setFilterTab('scale')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              filterTab === 'scale'
                ? 'bg-[#1b4d3e] text-white shadow-xs'
                : 'bg-[#f0f5f2] text-[#3d5f4e] hover:bg-[#e4eee7]'
            }`}
          >
            {isHi ? `तौल कांटा (${queueItems.filter((i: any) => i.stageType === 'weighment').length})` : `Weighbridge (${queueItems.filter((i: any) => i.stageType === 'weighment').length})`}
          </button>
          <button
            onClick={() => setFilterTab('receipt')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              filterTab === 'receipt'
                ? 'bg-[#1b4d3e] text-white shadow-xs'
                : 'bg-[#f0f5f2] text-[#3d5f4e] hover:bg-[#e4eee7]'
            }`}
          >
            {isHi ? `पावती / पूर्ण (${queueItems.filter((i: any) => i.stageType === 'ready' || i.stageType === 'unloading').length})` : `Receipt/Ready (${queueItems.filter((i: any) => i.stageType === 'ready' || i.stageType === 'unloading').length})`}
          </button>
        </div>

        {/* Clean Queue Table */}
        <div className="overflow-x-auto border border-[#d2dfd6] rounded-xl">
          {filteredQueue.length === 0 ? (
            <div className="p-8 text-center bg-[#fafdfb] rounded-xl">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#eef7f1] text-[#1b7e45] flex items-center justify-center mb-3 border border-[#c4e3d1]">
                <Users className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-[#143224]">
                {isHi ? 'वर्तमान में कोई किसान प्रतीक्षारत नहीं है' : 'No Farmers Waiting in Queue'}
              </h4>
              <p className="text-xs text-[#527060] max-w-md mx-auto mt-1 leading-relaxed">
                {isHi
                  ? 'जैसे ही किसान पोर्टल से नया पंजीकरण या स्लॉट बुक होगा, यहाँ स्वचालित रूप से लाइव सूची में दर्ज हो जाएगा।'
                  : 'As soon as a farmer registers or books a slot via the portal, they will automatically appear here in the live operator queue.'}
              </p>
              {onViewFarmerPortal && (
                <button
                  onClick={onViewFarmerPortal}
                  className="mt-4 px-4 py-2 bg-[#1b4d3e] hover:bg-[#143e31] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>🌾 {isHi ? 'किसान पोर्टल पर जाएं (नया पंजीकरण करें)' : 'Go to Farmer Portal (New Registration)'}</span>
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-[#f8faf8] text-[#3d5f4e] font-bold border-b border-[#d2dfd6]">
                <tr>
                  <th className="p-3">टोकन #</th>
                  <th className="p-3">किसान नाम व मोबाइल</th>
                  <th className="p-3">वाहन सं.</th>
                  <th className="p-3">फसल / मात्रा</th>
                  <th className="p-3">आगमन समय</th>
                  <th className="p-3">वर्तमान चरण</th>
                  <th className="p-3 text-right">त्वरित कार्यवाही (SMS/WhatsApp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf3ef]">
                {filteredQueue.map((item, idx) => (
                  <tr
                    key={item.token}
                    onClick={() => setSearchToken(item.token)}
                    title={isHi ? 'इस किसान का विवरण देखने के लिए क्लिक करें' : 'Click to select farmer for verification'}
                    className={`hover:bg-[#eef8f2] transition-colors cursor-pointer ${
                      (searchToken && (item.token === searchToken || item.token.includes(searchToken.replace('#', '')))) || (!searchToken && idx === 0)
                        ? 'bg-[#eef8f2] border-l-4 border-l-[#1b7e45] shadow-2xs font-medium'
                        : ''
                    }`}
                  >
                    <td className="p-3 font-mono font-bold text-[#854d0e]">
                      {item.token}
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-[#143224] block">{item.farmerName}</span>
                      <span className="text-[10px] text-[#638472] font-mono block">ID: {item.farmerId} • 📱 {item.phone || '9826199999'}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-gray-800">
                      {item.vehicleNo}
                    </td>
                    <td className="p-3">
                      <span className="inline-block bg-[#f0f5f2] border border-[#d2dfd6] px-2 py-0.5 rounded text-[11px] font-semibold text-[#183525]">
                        {item.crop}
                      </span>
                    </td>
                    <td className="p-3 text-[#527060] font-medium">
                      {item.arrivalTime}
                    </td>
                    <td className="p-3">
                      {item.stageType === 'quality' && (
                        <span className="inline-flex items-center gap-1.5 bg-[#fffbeb] text-[#854d0e] font-bold px-2.5 py-1 rounded-full text-[11px] border border-amber-200">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          {item.stage}
                        </span>
                      )}
                      {item.stageType === 'gate_wait' && (
                        <span className="inline-block bg-[#f0f5f2] text-gray-600 font-medium px-2.5 py-1 rounded-full text-[11px]">
                          {item.stage}
                        </span>
                      )}
                      {item.stageType === 'weighment' && (
                        <span className="inline-flex items-center gap-1 bg-[#eaf5ef] text-[#14532d] font-bold px-2.5 py-1 rounded-full text-[11px] border border-[#a8dec0]">
                          {item.stage}
                        </span>
                      )}
                      {item.stageType === 'unloading' && (
                        <span className="inline-block bg-[#f0f5f2] text-gray-700 font-medium px-2.5 py-1 rounded-full text-[11px]">
                          {item.stage}
                        </span>
                      )}
                      {item.stageType === 'ready' && (
                        <span className="inline-flex items-center gap-1 bg-[#eff6ff] text-[#1e40af] font-bold px-2.5 py-1 rounded-full text-[11px]">
                          {item.stage}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end flex-wrap">
                        {item.actionType === 'call_scale' && (
                          <button
                            onClick={() => handleAction(item.token, 'call_scale', 'कांटा क्र. 02')}
                            className="px-3.5 py-1.5 bg-[#1b4d3e] hover:bg-[#143e31] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>📢</span>
                            <span>{item.actionLabel || 'कांटा #02 पर बुलाएं'}</span>
                          </button>
                        )}
                        {item.actionType === 'gate_call' && (
                          <button
                            onClick={() => handleAction(item.token, 'gate_call')}
                            className="px-3.5 py-1.5 bg-white border border-[#cfe0d5] hover:bg-[#f0f5f2] text-[#183525] text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1"
                          >
                            <span>🚪</span>
                            <span>{item.actionLabel || 'गेट आगमन दर्ज'}</span>
                          </button>
                        )}
                        {item.actionType === 'record_weight' && (
                          <button
                            onClick={() => handleAction(item.token, 'record_weight', 'कांटा क्र. 02')}
                            className="px-3.5 py-1.5 bg-[#1b7e45] hover:bg-[#156337] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-1"
                          >
                            <span>⚖️</span>
                            <span>{item.actionLabel || 'वजन रिकॉर्ड'}</span>
                          </button>
                        )}
                        {item.actionType === 'slip_recommend' && (
                          <button
                            onClick={() => handleAction(item.token, 'slip_recommend')}
                            className="px-3.5 py-1.5 bg-white border border-[#cfe0d5] hover:bg-[#f0f5f2] text-[#183525] text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1"
                          >
                            <span>📜</span>
                            <span>{item.actionLabel || 'पर्ची संस्तुति'}</span>
                          </button>
                        )}
                        {item.actionType === 'completed' && (
                          <button
                            onClick={onOpenReceipt}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-emerald-700 font-bold border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>पावती पर्ची</span>
                          </button>
                        )}

                        {/* Real WhatsApp Button for this Farmer */}
                        <button
                          onClick={() => {
                            const msg = `🌾 AnnDwar - Kisan se Desh Tak 🌾\nनमस्ते ${item.farmerName} जी, आपके टोकन ${item.token} (वाहन: ${item.vehicleNo}) की वर्तमान स्थिति: "${item.stage}"। उपार्जन केंद्र: ${item.mandiName}। कृपया समय पर उपस्थित रहें। - AnnDwar`;
                            openRealWhatsApp(item.phone, msg);
                          }}
                          className="px-2.5 py-1.5 bg-[#eaf7ee] hover:bg-[#d5f2dc] text-[#128C7E] border border-[#25D366]/60 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1"
                          title="किसान को वास्तविक WhatsApp संदेश भेजें"
                        >
                          <span>📲 WA</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
