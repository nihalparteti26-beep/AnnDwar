import React from 'react';
import { X, CreditCard, CheckCircle2, Download, ExternalLink, ArrowDownToLine } from 'lucide-react';
import { Language, PaymentRecord } from '../types';

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  payments: PaymentRecord[];
}

export const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  isOpen,
  onClose,
  lang,
  payments,
}) => {
  if (!isOpen) return null;
  const isHi = lang === 'hi';

  const totalReceived = payments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#d0ded5] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#1b4d3e] text-white p-4 sm:p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[#88f0bc]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {isHi ? 'पिछला भुगतान इतिहास (Previous Payment History)' : 'Previous Payment History'}
              </h3>
              <p className="text-xs text-[#b7ded0]">
                {isHi
                  ? 'सफल पूर्व अंतरण रिकॉर्ड्स | आधार लिंक्ड बैंक खाता'
                  : 'Direct Benefit Transfer (DBT) records linked to Aadhaar bank account'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Summary Card (Screenshot 2 banner) */}
        <div className="p-4 sm:px-6 bg-[#f2f8f4] border-b border-[#d8e8dd] flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-xs text-[#527764] font-medium block">
              {isHi ? 'सत्र 2024-25 कुल प्राप्त लाभ:' : 'Total Benefits Received in 2024-25:'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#113524]">
              ₹{payments.reduce((acc, p) => acc + p.totalAmount, 0).toLocaleString('en-IN')}.00
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#e3f7ec] text-[#147437] border border-[#a8e3c1] text-xs font-bold px-3 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1b7e45]" />
            <span>{isHi ? '100% DBT हस्तांतरित' : '100% DBT Transferred'}</span>
          </div>
        </div>

        {/* Records list */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5">
          {payments.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-[#d6e3dc] rounded-xl p-4 hover:border-[#1b7e45] shadow-xs transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-[#133726]">
                    {isHi ? p.cropNameHi : p.cropNameEn}
                  </h4>
                  <span className="text-[10px] font-bold bg-[#e3f7ec] text-[#147437] border border-[#a8e3c1] px-2 py-0.2 rounded-full">
                    {isHi ? 'क्रेडिट सफल' : 'Credit Successful'}
                  </span>
                </div>
                <div className="text-xs text-[#527161] mt-0.5">
                  <span>{p.date}</span> • <span>{isHi ? p.seasonHi : p.seasonEn}</span>
                </div>
                <div className="text-[11px] font-mono text-[#628172] mt-1">
                  <span>UTR: {p.utrNumber}</span> • <span>{p.mandiName}</span>
                </div>
              </div>

              <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                <span className="text-base font-extrabold text-[#113222]">
                  ₹{p.totalAmount.toLocaleString('en-IN')}
                </span>
                <button
                  onClick={() => alert(`पावती डाउनलोड: UTR ${p.utrNumber}`)}
                  className="flex items-center gap-1 text-[11px] text-[#1b7e45] hover:underline font-semibold bg-[#edf5f0] hover:bg-[#e1efe6] px-2.5 py-1 rounded-lg border border-[#c2ddcc] cursor-pointer"
                >
                  <ArrowDownToLine className="w-3 h-3" />
                  <span>{isHi ? 'पावती (PDF)' : 'Receipt'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f8faf8] border-t border-[#e3ece6] flex items-center justify-end">
          <button
            onClick={onClose}
            className="bg-[#1b4d3e] hover:bg-[#153f33] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            {isHi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
