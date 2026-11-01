import React, { useState, useEffect } from 'react';
import { X, Printer, Download, QrCode, CheckCircle, Shield, Building2 } from 'lucide-react';
import { Language, MandiSlot, FarmerProfile } from '../types';
import { generateQrDataUrl } from '../utils/qrGenerator';
import { openRealWhatsApp } from '../utils/whatsapp';

interface SlotReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  slot: MandiSlot | null;
  farmer: FarmerProfile | null;
}

export const SlotReceiptModal: React.FC<SlotReceiptModalProps> = ({
  isOpen,
  onClose,
  lang,
  slot,
  farmer,
}) => {
  if (!isOpen || !slot) return null;
  const isHi = lang === 'hi';
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (slot) {
      const qrData = slot.qrCodeData || `ANNDWAR|TOKEN:${slot.tokenNumber}|FARMER:${slot.farmerId}|CROP:${slot.cropName}|QTY:${slot.quantityQuintal}Q|MANDI:${slot.mandiCenterName}`;
      generateQrDataUrl(qrData).then((url) => setQrUrl(url));
    }
  }, [slot]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-[#cbdcd0] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] print:border-none print:shadow-none print:max-h-full">
        {/* Modal Toolbar (hidden in print) */}
        <div className="bg-[#1b4d3e] text-white p-3.5 px-5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#88f0bc]" />
            <span className="text-xs sm:text-sm font-bold">
              {isHi ? 'à¤ˆ-à¤Ÿà¥‹à¤•à¤¨ à¤ªà¥à¤°à¤µà¥‡à¤¶ à¤ªà¤¾à¤¸ (Official E-Receipt)' : 'Official E-Token Entry Pass'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isHi ? 'à¤ªà¥à¤°à¤¿à¤‚à¤Ÿ à¤•à¤°à¥‡à¤‚' : 'Print'}</span>
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Pass Body */}
        <div className="p-5 sm:p-7 overflow-y-auto print:p-0 space-y-4 text-[#143425]">
          {/* Government / Mandi Header */}
          <div className="text-center pb-3 border-b-2 border-[#1b4d3e]">
            <div className="flex items-center justify-center gap-2.5 mb-1">
              <div className="w-10 h-10 rounded-full bg-white p-0.5 border border-[#cfe0d5] flex items-center justify-center overflow-hidden shadow-2xs">
                <img src="/logo.png" alt="à¤…à¤¨à¥à¤¨à¤¦à¥à¤µà¤¾à¤°" className="w-full h-full object-contain" />
              </div>
              <div className="text-left">
                <h3 className="font-extrabold text-base text-[#113222] tracking-tight">
                  {isHi ? 'à¤…à¤¨à¥à¤¨à¤¦à¥à¤µà¤¾à¤°' : 'AnnDwar'}
                </h3>
                <p className="text-[11px] text-[#557766] font-semibold">
                  {isHi ? 'à¤•à¤¿à¤¸à¤¾à¤¨ à¤¸à¥‡ à¤¦à¥‡à¤¶ à¤¤à¤• â€¢ à¤‰à¤ªà¤¾à¤°à¥à¤œà¤¨ à¤—à¥‡à¤Ÿ à¤ªà¤¾à¤¸' : 'Kisan se Desh Tak â€¢ Procurement Gate Pass'}
                </p>
              </div>
            </div>
          </div>

          {/* Token & QR Section */}
          <div className="flex items-center justify-between bg-[#f8faf8] border border-[#d2dfd6] rounded-xl p-3.5">
            <div>
              <span className="text-[10px] text-[#618070] font-semibold uppercase block">
                {isHi ? 'à¤Ÿà¥‹à¤•à¤¨ à¤•à¥à¤°à¤®à¤¾à¤‚à¤• / TOKEN ID' : 'Token ID'}
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono text-[#113222] tracking-wider">
                {slot.tokenNumber}
              </div>
              <span className="text-[11px] text-[#1b7e45] font-bold mt-0.5 block">
                âœ“ à¤ˆ-à¤¸à¤¤à¥à¤¯à¤¾à¤ªà¤¿à¤¤ à¤à¤µà¤‚ à¤…à¤§à¤¿à¤•à¥ƒà¤¤ (Active Verified)
              </span>
            </div>

            <div className="text-center bg-white p-1.5 border border-[#cbdcd0] rounded-lg shadow-2xs flex flex-col items-center">
              {qrUrl ? (
                <img src={qrUrl} alt="Gate QR" className="w-20 h-20 object-contain" />
              ) : (
                <QrCode className="w-16 h-16 text-[#1b4d3e]" />
              )}
              <span className="text-[9px] font-mono font-bold text-[#618070] block mt-0.5">SCAN AT GATE</span>
            </div>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#f9fbf9] p-2.5 rounded-lg border border-[#e2eae4]">
              <span className="text-[10px] text-[#638072] block font-medium">à¤•à¤¿à¤¸à¤¾à¤¨ à¤•à¤¾ à¤¨à¤¾à¤®:</span>
              <span className="font-bold text-[#143425] text-sm">{farmer?.nameHi || 'à¤°à¤¾à¤® à¤¸à¤¿à¤‚à¤¹'}</span>
              <span className="text-[10px] text-[#557766] block mt-0.5">à¤†à¤§à¤¾à¤°: XXXX-XXXX-4192</span>
            </div>

            <div className="bg-[#f9fbf9] p-2.5 rounded-lg border border-[#e2eae4]">
              <span className="text-[10px] text-[#638072] block font-medium">à¤†à¤µà¤‚à¤Ÿà¤¿à¤¤ à¤¤à¤¿à¤¥à¤¿ à¤µ à¤¸à¤®à¤¯:</span>
              <span className="font-bold text-[#143425] text-sm">{slot.date}</span>
              <span className="text-[10.5px] text-[#1b7e45] font-bold block mt-0.5">{slot.timeSlot}</span>
            </div>

            <div className="bg-[#f9fbf9] p-2.5 rounded-lg border border-[#e2eae4]">
              <span className="text-[10px] text-[#638072] block font-medium">à¤‰à¤ªà¤¾à¤°à¥à¤œà¤¨ à¤•à¥‡à¤‚à¤¦à¥à¤° à¤µ à¤—à¥‡à¤Ÿ:</span>
              <span className="font-bold text-[#143425]">{slot.mandiCenterName}</span>
              <span className="text-[10px] text-[#557766] block mt-0.5">{slot.gateNumber}, {slot.laneNumber}</span>
            </div>

            <div className="bg-[#f9fbf9] p-2.5 rounded-lg border border-[#e2eae4]">
              <span className="text-[10px] text-[#638072] block font-medium">à¤«à¤¸à¤² à¤à¤µà¤‚ à¤µà¤¾à¤¹à¤¨:</span>
              <span className="font-bold text-[#143425]">{slot.cropName} ({slot.quantityQuintal} à¤•à¥à¤µà¤¿à¤‚à¤Ÿà¤²)</span>
              <span className="text-[10.5px] font-mono font-bold text-[#183929] block mt-0.5">{slot.vehicleNumber}</span>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-[#fbfcfb] border border-[#e0ece3] rounded-xl p-3 text-[11px] text-[#3c5e4d] space-y-1">
            <div className="font-bold text-[#183827] mb-1">
              à¤®à¤¹à¤¤à¥à¤µà¤ªà¥‚à¤°à¥à¤£ à¤¦à¤¿à¤¶à¤¾-à¤¨à¤¿à¤°à¥à¤¦à¥‡à¤¶ (Important Instructions):
            </div>
            <p>à¥§. à¤•à¥ƒà¤ªà¤¯à¤¾ à¤†à¤µà¤‚à¤Ÿà¤¿à¤¤ à¤¸à¤®à¤¯ à¤¸à¥‡ 15 à¤®à¤¿à¤¨à¤Ÿ à¤ªà¥‚à¤°à¥à¤µ (10:45 AM) à¤—à¥‡à¤Ÿ à¤ªà¤° à¤‰à¤ªà¤¸à¥à¤¥à¤¿à¤¤ à¤¹à¥‹à¤¨à¤¾ à¤¸à¥à¤¨à¤¿à¤¶à¥à¤šà¤¿à¤¤ à¤•à¤°à¥‡à¤‚à¥¤</p>
            <p>à¥¨. à¤«à¤¸à¤² à¤®à¥‡à¤‚ à¤¨à¤®à¥€ 12% à¤¸à¥‡ à¤•à¤® à¤¹à¥‹à¤¨à¥€ à¤šà¤¾à¤¹à¤¿à¤ (AI Pre-Check à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ à¤¸à¤¾à¤¥ à¤°à¤–à¥‡à¤‚)à¥¤</p>
            <p>à¥©. à¤µà¤¾à¤¹à¤¨ à¤ªà¤° à¤¤à¤¿à¤°à¤ªà¤¾à¤² à¤…à¤¨à¤¿à¤µà¤¾à¤°à¥à¤¯ à¤¹à¥ˆà¥¤ à¤¤à¥Œà¤² à¤‰à¤ªà¤°à¤¾à¤‚à¤¤ à¤•à¤‚à¤ªà¥à¤¯à¥‚à¤Ÿà¤° à¤°à¤¸à¥€à¤¦ à¤ªà¥à¤°à¤¾à¤ªà¥à¤¤ à¤•à¤°à¥‡à¤‚à¥¤</p>
            <p>à¥ª. à¤­à¥à¤—à¤¤à¤¾à¤¨ à¤¸à¥€à¤§à¥‡ à¤†à¤§à¤¾à¤° à¤²à¤¿à¤‚à¤•à¥à¤¡ à¤¬à¥ˆà¤‚à¤• à¤–à¤¾à¤¤à¥‡ (DBT) à¤®à¥‡à¤‚ 24-48 à¤˜à¤‚à¤Ÿà¥‹à¤‚ à¤®à¥‡à¤‚ à¤…à¤‚à¤¤à¤°à¤¿à¤¤ à¤¹à¥‹à¤—à¤¾à¥¤</p>
          </div>

          {/* Barcode line */}
          <div className="pt-2 text-center border-t border-[#e2eae4]">
            <div className="font-mono text-xl sm:text-2xl tracking-[0.25em] font-bold text-[#2a4d3b]">
              ||||| | |||| ||| |||||| |||| |||||
            </div>
            <span className="text-[9px] text-[#6b8b7a] block mt-0.5 font-bold tracking-wider">
              ANNDWAR TOKEN â€¢ KISAN SE DESH TAK â€¢ VERIFIED HASH #9821420
            </span>
          </div>
        </div>

        {/* Modal Footer (hidden in print) */}
        <div className="p-4 bg-[#f8faf8] border-t border-[#e3ece6] flex items-center justify-between print:hidden">
          <span className="text-xs text-[#527764]">
            {isHi ? 'à¤¹à¥‡à¤²à¥à¤ªà¤²à¤¾à¤‡à¤¨: 1800-180-1551' : 'Toll-Free: 1800-180-1551'}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                const receiptMsg = `ðŸŒ¾ AnnDwar - Kisan se Desh Tak ðŸŒ¾\n\nà¤¨à¤®à¤¸à¥à¤¤à¥‡ ${farmer?.nameHi || 'à¤•à¤¿à¤¸à¤¾à¤¨ à¤­à¤¾à¤ˆ'}, à¤†à¤ªà¤•à¤¾ à¤‰à¤ªà¤¾à¤°à¥à¤œà¤¨ à¤¸à¥à¤²à¥‰à¤Ÿ à¤¸à¤«à¤²à¤¤à¤¾ à¤ªà¥‚à¤°à¥à¤µà¤• à¤¬à¥à¤• à¤¹à¥à¤† à¤¹à¥ˆ!\n\nðŸ“‹ à¤Ÿà¥‹à¤•à¤¨ à¤¸à¤‚.: ${slot.tokenNumber}\nðŸ“ à¤‰à¤ªà¤¾à¤°à¥à¤œà¤¨ à¤•à¥‡à¤‚à¤¦à¥à¤°: ${slot.mandiCenterName}\nðŸšª à¤—à¥‡à¤Ÿ: ${slot.gateNumber} (${slot.laneNumber})\nðŸ“… à¤¤à¤¿à¤¥à¤¿ à¤µ à¤¸à¤®à¤¯: ${slot.date} (${slot.timeSlot})\nðŸŒ¾ à¤«à¤¸à¤²: ${slot.cropName} (${slot.quantityQuintal} à¤•à¥à¤µà¤¿à¤‚à¤Ÿà¤²)\nðŸšœ à¤µà¤¾à¤¹à¤¨: ${slot.vehicleNumber}\n\nà¤•à¥ƒà¤ªà¤¯à¤¾ 15 à¤®à¤¿à¤¨à¤Ÿ à¤ªà¥‚à¤°à¥à¤µ à¤ªà¤¹à¥à¤‚à¤šà¥‡à¤‚à¥¤ à¤Ÿà¥‹à¤²-à¤«à¥à¤°à¥€ à¤¹à¥‡à¤²à¥à¤ªà¤²à¤¾à¤‡à¤¨: 1800-180-1551à¥¤`;
                openRealWhatsApp(farmer?.phone || '9826199999', receiptMsg);
              }}
              className="bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title={isHi ? 'à¤µà¥à¤¹à¤¾à¤Ÿà¥à¤¸à¤à¤ª à¤ªà¤° à¤ªà¤¾à¤µà¤¤à¥€ à¤­à¥‡à¤œà¥‡à¤‚' : 'Send receipt via WhatsApp'}
            >
              <span>ðŸ“²</span>
              <span>{isHi ? 'à¤µà¥à¤¹à¤¾à¤Ÿà¥à¤¸à¤à¤ª à¤ªà¤° à¤­à¥‡à¤œà¥‡à¤‚' : 'Send via WhatsApp'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-[#1b4d3e] hover:bg-[#153f33] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isHi ? 'à¤¡à¤¾à¤‰à¤¨à¤²à¥‹à¤¡ / à¤ªà¥à¤°à¤¿à¤‚à¤Ÿ à¤ªà¤°à¥à¤šà¥€' : 'Print Receipt'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

