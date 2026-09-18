import React, { useState } from 'react';
import { Camera, X, Check, Upload, Image as ImageIcon } from 'lucide-react';

interface UploadProofModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSuccess: (filename: string, photoUrl: string) => void;
}

export const UploadProofModal: React.FC<UploadProofModalProps> = ({
  isOpen,
  title,
  onClose,
  onSuccess,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const samplePhotos = [
    {
      name: 'catering_tubs_sealed.jpg',
      url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      label: 'Sealed Containers',
    },
    {
      name: 'rice_daal_handover.jpg',
      url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
      label: 'Batch Verification',
    },
    {
      name: 'rotis_aluminum_packs.jpg',
      url: 'https://images.unsplash.com/photo-1617692855027-33b14f061079?auto=format&fit=crop&w=800&q=80',
      label: 'Fresh Hot Trays',
    },
  ];

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess('handover_proof_tamper_verified.jpg', selectedPhoto);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-900 font-extrabold text-sm">
            <Camera size={18} className="text-stone-800" />
            <span>{title}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Selected Preview */}
        <div className="relative rounded-2xl overflow-hidden border border-stone-200 h-44 bg-stone-100">
          <img
            src={selectedPhoto}
            alt="Preview"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
            GPS: 19.0760° N, 72.8777° E
          </div>
        </div>

        {/* Select from presets or camera */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            Select Photo or Snap
          </span>
          <div className="grid grid-cols-3 gap-2">
            {samplePhotos.map((photo, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedPhoto(photo.url)}
                className={`relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer h-16 ${
                  selectedPhoto === photo.url ? 'border-[#132238] ring-2 ring-[#132238]/30' : 'border-stone-200 opacity-70'
                }`}
              >
                <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                {selectedPhoto === photo.url && (
                  <div className="absolute inset-0 bg-[#132238]/40 flex items-center justify-center">
                    <Check size={16} className="text-white stroke-[3]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-1">
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="w-full bg-[#132238] hover:bg-[#1a2d48] text-white font-extrabold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98"
          >
            {isProcessing ? (
              <span>VERIFYING TIMESTAMP &amp; AI INSPECTION...</span>
            ) : (
              <>
                <Check size={16} />
                <span>CONFIRM &amp; UPLOAD PROOF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
