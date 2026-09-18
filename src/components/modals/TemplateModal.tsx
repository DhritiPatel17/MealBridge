import React from 'react';
import { X, Sparkles, Check, UtensilsCrossed } from 'lucide-react';
import { FoodCategory, PerishabilityState, PackagingFormat } from '../../types';

interface TemplateOption {
  title: string;
  category: FoodCategory;
  categoryName: string;
  perishability: PerishabilityState;
  servings: number;
  packaging: PackagingFormat;
  cookedAt: string;
  safeUntil: string;
  instructions: string;
  photoUrl: string;
  photoFilename: string;
}

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TemplateOption) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  const templates: TemplateOption[] = [
    {
      title: 'Grand Banquet Wedding Feast (Rice, Dal, Rotis)',
      category: 'pure-veg',
      categoryName: 'Pure Veg / शाकाहारी',
      perishability: 'cooked',
      servings: 85,
      packaging: 'containers',
      cookedAt: '6:45 PM (Today)',
      safeUntil: '11:30 PM Tonight (~3.5 hrs window)',
      instructions: 'Keep upright, 3 large stainless steel catering tubs. Loading bay accessible via Back Gate #2. Bring a trolley.',
      photoUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      photoFilename: 'dal_rice_batch4.jpg',
    },
    {
      title: 'Corporate Tech Park Canteen Dinner (Mixed Thali)',
      category: 'mixed',
      categoryName: 'Mixed / मिश्रित',
      perishability: 'cooked',
      servings: 120,
      packaging: 'containers',
      cookedAt: '7:00 PM (Today)',
      safeUntil: '12:00 AM Midnight (~4 hrs window)',
      instructions: 'Docking station behind Cafeteria Tower B. Security will issue visitor slip directly.',
      photoUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
      photoFilename: 'techpark_dinner_buffet.jpg',
    },
    {
      title: 'Artisan Bakery Daily Loaves & Puffs',
      category: 'pure-veg',
      categoryName: 'Pure Veg / शाकाहारी',
      perishability: 'bakery',
      servings: 60,
      packaging: 'containers',
      cookedAt: '4:00 PM (Today)',
      safeUntil: 'Tomorrow 10:00 AM (~16 hrs window)',
      instructions: 'Packed in 4 ventilated crates. Clean and ready for direct breakfast distribution.',
      photoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      photoFilename: 'bakery_fresh_loaves.jpg',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-900 font-extrabold text-sm">
            <Sparkles size={18} className="text-amber-500" />
            <span>Fast Dispatch Templates</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-stone-500">
          Auto-fill food parameters with pre-calibrated FSSAI freshness windows.
        </p>

        <div className="space-y-2.5">
          {templates.map((tpl, i) => (
            <button
              key={i}
              onClick={() => {
                onSelectTemplate(tpl);
                onClose();
              }}
              className="w-full bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-2xl p-3.5 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <h4 className="font-extrabold text-xs text-stone-900 group-hover:text-sky-900">
                  {tpl.title}
                </h4>
                <span className="bg-stone-200/80 text-stone-700 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2">
                  {tpl.servings} pax
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-1">
                <span>{tpl.categoryName}</span>
                <span>•</span>
                <span>Cooked: {tpl.cookedAt}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
