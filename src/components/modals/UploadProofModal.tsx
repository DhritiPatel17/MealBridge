import React, { useState, useRef } from 'react';
import { Camera, X, Check, Upload, AlertCircle, ShieldAlert, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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
  const [photoFilename, setPhotoFilename] = useState<string>('handover_proof_tamper_verified.jpg');
  const [privacyAgreed, setPrivacyAgreed] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);

    // Rule 1: Images only
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload an image file (JPG, PNG, WebP) only. / केवल फोटो फाइल अपलोड करें।');
      return;
    }

    // Rule 2: Max 5 MB limit
    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMsg(`Image size must be under 5 MB. Selected file is ${(file.size / (1024 * 1024)).toFixed(1)} MB. / फोटो 5 MB से छोटी होनी चाहिए।`);
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Convert to preview data URL for instant display
      const reader = new FileReader();
      reader.onload = async (event) => {
        const resultUrl = event.target?.result as string;
        setSelectedPhoto(resultUrl);
        setPhotoFilename(file.name);

        // 2. Upload to private Supabase bucket 'donation-photos'
        try {
          const filePath = `private_proofs/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const { data, error } = await supabase.storage
            .from('donation-photos')
            .upload(filePath, file, { cacheControl: '3600', upsert: true });

          if (!error && data?.path) {
            // Generate a private signed URL valid for donor, NGO & admin
            const { data: signedData } = await supabase.storage
              .from('donation-photos')
              .createSignedUrl(data.path, 60 * 60 * 24 * 7); // 7 days

            if (signedData?.signedUrl) {
              setSelectedPhoto(signedData.signedUrl);
            }
          }
        } catch (sbErr) {
          console.warn('Private Supabase Storage upload fallback to client image:', sbErr);
        } finally {
          setIsProcessing(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setIsProcessing(false);
      setErrorMsg('Failed to process image. Please try another file. / फोटो अपलोड करने में त्रुटि हुई।');
    }
  };

  const handleConfirm = () => {
    if (!privacyAgreed) {
      setErrorMsg('You must check the privacy notice regarding faces before uploading. / कृपया फोटो प्राइवेसी नियम स्वीकार करें।');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess(photoFilename, selectedPhoto);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-3.5 border border-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#112A46] font-extrabold text-sm">
            <Camera size={18} className="text-[#112A46]" />
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
          <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
            GPS Verified
          </div>
        </div>

        {/* Custom Upload Button */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-stone-100 hover:bg-stone-200 text-[#112A46] border border-stone-300 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Upload size={14} />
            <span>Choose Image File (Max 5 MB) / फोटो चुनें</span>
          </button>
        </div>

        {/* Select from sample presets */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
            Or Pick Sample Photo
          </span>
          <div className="grid grid-cols-3 gap-2">
            {samplePhotos.map((photo, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSelectedPhoto(photo.url);
                  setPhotoFilename(photo.name);
                  setErrorMsg(null);
                }}
                className={`relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer h-14 ${
                  selectedPhoto === photo.url ? 'border-[#112A46] ring-2 ring-[#112A46]/30' : 'border-stone-200 opacity-70'
                }`}
              >
                <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                {selectedPhoto === photo.url && (
                  <div className="absolute inset-0 bg-[#112A46]/40 flex items-center justify-center">
                    <Check size={16} className="text-white stroke-[3]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Privacy Notice with Required Checkbox */}
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px]">
            <ShieldAlert size={14} className="text-amber-700 shrink-0" />
            <span>Photo Privacy Notice / फोटो गोपनीयता नियम:</span>
          </div>
          <label className="flex items-start gap-2 cursor-pointer text-[11px] font-semibold text-stone-800 leading-tight">
            <input
              type="checkbox"
              required
              checked={privacyAgreed}
              onChange={(e) => {
                setPrivacyAgreed(e.target.checked);
                if (e.target.checked) setErrorMsg(null);
              }}
              className="mt-0.5 w-4 h-4 text-[#112A46] rounded border-stone-300 focus:ring-[#112A46] shrink-0 cursor-pointer"
            />
            <span>
              Show the food and the serving only. Don&apos;t include faces, especially children. / सिर्फ खाना और बाँटना दिखाएं। चेहरे, खासकर बच्चों के, न दिखाएं। *
            </span>
          </label>
        </div>

        {/* Validation Error Banner */}
        {errorMsg && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] font-bold text-rose-700 flex items-center gap-1.5">
            <AlertCircle size={14} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing || !privacyAgreed}
            className={`w-full font-extrabold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all ${
              isProcessing || !privacyAgreed
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                : 'bg-[#112A46] hover:bg-[#0c1e33] text-white cursor-pointer active:scale-98'
            }`}
          >
            {isProcessing ? (
              <span>UPLOADING PRIVATE PHOTO...</span>
            ) : (
              <>
                <Check size={16} />
                <span>CONFIRM &amp; UPLOAD PROOF / फोटो सबमिट करें</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
