import React from 'react';
import { X, Download, ShieldCheck, Printer, CheckCircle2 } from 'lucide-react';

interface TaxReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaxReceiptModal: React.FC<TaxReceiptModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-900 font-extrabold text-sm">
            <ShieldCheck size={18} className="text-emerald-600" />
            <span>FSSAI &amp; 80G Tax Certificate</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Certificate Card */}
        <div className="border-2 border-dashed border-stone-300 rounded-2xl p-4 bg-stone-50 space-y-3 font-mono text-xs text-stone-800">
          <div className="text-center border-b border-stone-200 pb-2">
            <div className="font-extrabold text-stone-900 tracking-wider">
              MEALBRIDGE FOUNDATION
            </div>
            <div className="text-[10px] text-stone-500">
              Reg. Section 12A &amp; 80G of Income Tax Act 1961
            </div>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-stone-500">Certificate No:</span>
              <span className="font-bold">MB-80G-2026-9402</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Donor Entity:</span>
              <span className="font-bold">Royal Palace Banquet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Rescued Portions:</span>
              <span className="font-bold">85 Standard Meals</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Valuation:</span>
              <span className="font-bold">₹7,650 (In-Kind Food)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Recipient Hub:</span>
              <span className="font-bold">Roti Bank Chapter #4</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-700 font-sans font-bold text-[10px] pt-1">
            <CheckCircle2 size={13} />
            <span>Geotagged Chain-of-Custody Verified</span>
          </div>
        </div>

        <button
          onClick={() => {
            alert('80G Certificate downloaded successfully to your device.');
            onClose();
          }}
          className="w-full bg-[#132238] text-white font-extrabold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-[#1c304d]"
        >
          <Download size={15} />
          <span>Save PDF Certificate</span>
        </button>
      </div>
    </div>
  );
};
