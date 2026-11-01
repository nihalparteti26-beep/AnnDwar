import React from 'react';
import { X, CheckCircle2, ShieldCheck, FileText, Download, ExternalLink } from 'lucide-react';
import { Language, FarmerDocument } from '../types';

interface DocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  documents: FarmerDocument[];
}

export const DocumentsModal: React.FC<DocumentsModalProps> = ({
  isOpen,
  onClose,
  lang,
  documents,
}) => {
  if (!isOpen) return null;
  const isHi = lang === 'hi';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-[#d0ded5] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#1b4d3e] text-white p-4 sm:p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#88f0bc]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {isHi ? 'डिजिटल दस्तावेज सत्यापन (4/4)' : 'Digital Document Verification (4/4)'}
              </h3>
              <p className="text-xs text-[#b7ded0]">
                {isHi
                  ? 'पोर्टल द्वारा सभी आवश्यक अभिलेख ई-केवाईसी द्वारा सत्यापित हैं।'
                  : 'All statutory records verified via e-KYC & Land Revenue records.'}
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

        {/* Content list (Exact match to Screenshot 1) */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-[#f9faf9] border border-[#dbe6df] rounded-xl p-3.5 hover:border-[#a8d3b8] transition-colors flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#eef7f2] border border-[#cbe3d4] flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4 text-[#1b7e45]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#143425]">
                      {isHi ? doc.titleHi : doc.titleEn}
                    </span>
                    {doc.docNumber && (
                      <span className="text-[10px] font-mono bg-[#edf4f0] text-[#3b5d4b] px-1.5 py-0.2 rounded border border-[#d2dfd6]">
                        {doc.docNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#4f705f] mt-0.5 font-medium">
                    {isHi ? doc.subtitleHi : doc.subtitleEn}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-[#e3f7ec] text-[#147437] border border-[#a8e3c1] text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                <CheckCircle2 className="w-3 h-3 text-[#1b7e45]" />
                <span>{isHi ? doc.statusTextHi : doc.statusTextEn}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f6faf7] border-t border-[#e3ece6] flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs text-[#527563]">
            {isHi ? 'ई-उपार्जन 2025-26 पोर्टल से प्रमाणित' : 'Certified by e-Procurement Portal'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="bg-[#1b4d3e] hover:bg-[#153f33] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              {isHi ? 'पूर्ण' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
