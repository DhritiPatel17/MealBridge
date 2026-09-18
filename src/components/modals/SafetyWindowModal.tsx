import React, { useState } from 'react';
import { X, Sparkles, Check, Thermometer } from 'lucide-react';

interface SafetyWindowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (windowStr: string, ambientTemp: string) => void;
}

export const SafetyWindowModal: React.FC<SafetyWindowModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [ambientTemp, setAmbientTemp] = useState<string>('26°C');
  const [windowTime, setWindowTime] = useState<string>('11:30 PM Tonight (~3.5 hrs window)');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-900 font-extrabold text-sm">
            <Sparkles size={18} className="text-sky-600" />
            <span>AI Freshness Calibration</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-stone-600">
          Calibrate microbial safety window according to ambient city climate and food category.
        </p>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-stone-500 uppercase">
              Ambient Temperature
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['22°C (Cool)', '26°C (Room)', '32°C (Humid)'].map((temp) => (
                <button
                  key={temp}
                  type="button"
                  onClick={() => setAmbientTemp(temp.split(' ')[0])}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    ambientTemp === temp.split(' ')[0]
                      ? 'bg-[#132238] text-white'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {temp}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-stone-500 uppercase">
              Target Distribution Cutoff
            </label>
            <input
              type="text"
              value={windowTime}
              onChange={(e) => setWindowTime(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            onSave(windowTime, ambientTemp);
            onClose();
          }}
          className="w-full bg-[#132238] text-white font-extrabold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
        >
          <Check size={16} />
          <span>Apply Calibration</span>
        </button>
      </div>
    </div>
  );
};
