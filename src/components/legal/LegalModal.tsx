import React, { useState } from 'react';
import { X, ShieldCheck, FileText, AlertTriangle, Lock } from 'lucide-react';

export type LegalDocType = 'terms' | 'privacy' | 'disclaimer';

interface LegalModalProps {
  isOpen: boolean;
  initialTab?: LegalDocType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  initialTab = 'terms',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<LegalDocType>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-[#ACC8E5] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#112A46] text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#FDFD96]" />
            <h2 className="text-sm sm:text-base font-bold">
              Legal &amp; Privacy / कानूनी एवं गोपनीयता नियम
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 bg-stone-50 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-3 px-2 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'terms'
                ? 'border-[#112A46] text-[#112A46] bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText size={14} />
            <span>Terms of Use / नियम</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-3 px-2 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-[#112A46] text-[#112A46] bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Lock size={14} />
            <span>Privacy Policy / गोपनीयता</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('disclaimer')}
            className={`flex-1 py-3 px-2 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'disclaimer'
                ? 'border-[#112A46] text-[#112A46] bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <AlertTriangle size={14} />
            <span>Disclaimer / अस्वीकरण</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs leading-relaxed text-stone-800">
          {/* TERMS OF USE */}
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <h3 className="font-bold text-[#112A46] text-sm">
                  Terms of Use / उपयोग के नियम
                </h3>
                <p className="text-stone-600 font-medium">
                  Please read our simple, plain language terms governing the MealBridge platform.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h4 className="font-bold text-[#112A46] mb-1">1. Technology Platform Only / सिर्फ तकनीक प्लेटफॉर्म</h4>
                  <p>
                    MealBridge is a free technology platform that connects surplus food donors with registered NGOs. MealBridge does NOT cook, store, transport, or serve food.
                  </p>
                  <p className="text-stone-600 mt-1 font-hindi">
                    मीलब्रिज एक नि:शुल्क तकनीक प्लेटफॉर्म है जो अतिरिक्त खाना देने वालों और एनजीओ को जोड़ता है। मीलब्रिज खुद खाना नहीं पकाता, रखता, ले जाता या परोसता है।
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h4 className="font-bold text-[#112A46] mb-1">2. Donor Freshness Confirmation / खाने की ताज़गी की पुष्टि</h4>
                  <p>
                    The donor confirms that all donated food is fresh, hygienic, and completely safe for human consumption.
                  </p>
                  <p className="text-stone-600 mt-1 font-hindi">
                    खाना देने वाला पुष्टि करता है कि खाना पूरी तरह ताजा, स्वच्छ और खाने के योग्य है।
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h4 className="font-bold text-[#112A46] mb-1">3. NGO Pickup Inspection / एनजीओ द्वारा जांच</h4>
                  <p>
                    The receiving NGO must inspect food quality at the time of pickup and retains full right to reject unsafe, expired, or spoiled food.
                  </p>
                  <p className="text-stone-600 mt-1 font-hindi">
                    एनजीओ पिकअप के समय खाने की जांच करता है और खराब या असुरक्षित भोजन को अस्वीकार कर सकता है।
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h4 className="font-bold text-[#112A46] mb-1">4. FSSAI Guidelines &amp; Community Rules / FSSAI नियम</h4>
                  <p>
                    Both donors and NGOs must adhere to applicable FSSAI food safety and hygiene guidelines. MealBridge reserves the right to remove or suspend any user account violating these rules.
                  </p>
                  <p className="text-stone-600 mt-1 font-hindi">
                    दोनों पक्षों को FSSAI के खाद्य सुरक्षा नियमों का पालन करना होगा। नियमों का उल्लंघन करने पर खाता हटाया जा सकता है।
                  </p>
                </div>

                <div className="p-3 bg-[#FAF9DE] rounded-xl border border-[#D9D975]">
                  <h4 className="font-bold text-[#112A46] mb-1">5. Completely Free Service / पूरी तरह मुफ़्त</h4>
                  <p>
                    MealBridge is 100% free of charge for donors and NGOs. No user should ask for or accept payment for donated food.
                  </p>
                  <p className="text-stone-600 mt-1 font-hindi">
                    मीलब्रिज की सेवा पूरी तरह मुफ़्त है। दान किए गए खाने के लिए कोई पैसा नहीं लिया जा सकता।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <h3 className="font-bold text-emerald-900 text-sm">
                  Privacy Policy / गोपनीयता नीति
                </h3>
                <p className="text-emerald-700 font-medium">
                  We value your trust and protect your personal information.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h4 className="font-bold text-[#112A46] mb-1">1. What We Collect / हम क्या जानकारी लेते हैं</h4>
                  <p>
                    Name, phone number, pickup address, GPS location pin, and delivery proof photos.
                  </p>
                  <p className="text-stone-600 mt-1">
                    नाम, फोन नंबर, पता, मैप लोकेशन और डिलीवरी की तस्वीरें।
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h4 className="font-bold text-[#112A46] mb-1">2. Why We Collect It / जानकारी क्यों ली जाती है</h4>
                  <p>
                    Strictly to connect a donor and an NGO for donation pickup and delivery coordination.
                  </p>
                  <p className="text-stone-600 mt-1">
                    केवल खाना देने वाले और एनजीओ को जोड़ने और भोजन पहुंचाने के लिए।
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h4 className="font-bold text-[#112A46] mb-1">3. Who Sees Your Information / कौन देख सकता है</h4>
                  <p>
                    Your full address and contact phone are visible ONLY to the NGO that accepts your donation AFTER acceptance. The donor sees the NGO&apos;s name and phone number after acceptance.
                  </p>
                  <p className="text-stone-600 mt-1">
                    आपका पूरा पता और फोन नंबर केवल वही एनजीओ देख सकता है जो आपकी दान स्वीकार करता है। दान स्वीकार होने के बाद ही यह दिखता है।
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h4 className="font-bold text-[#112A46] mb-1">4. How to Delete Your Data / डेटा कैसे हटाएं</h4>
                  <p>
                    You can permanently delete your account and all stored personal data at any time directly from your Profile/Account page or by emailing us.
                  </p>
                  <p className="text-stone-600 mt-1">
                    आप अपने अकाउंट/प्रोफाइल पेज से &quot;मेरा अकाउंट और डेटा हटाएं&quot; बटन दबाकर या हमें ईमेल करके अपना डेटा कभी भी हटा सकते हैं।
                  </p>
                </div>

                <div className="p-3 bg-[#ACC8E5]/20 rounded-xl border border-[#ACC8E5]">
                  <h4 className="font-bold text-[#112A46] mb-1">5. Contact Support / संपर्क करें</h4>
                  <p className="font-mono text-[#112A46] font-bold">
                    Email: support@mealbridge.org
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* DISCLAIMER */}
          {activeTab === 'disclaimer' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <h3 className="font-bold text-amber-900 text-sm">
                  Disclaimer / अस्वीकरण
                </h3>
                <p className="text-amber-800 font-medium">
                  Important notice regarding food handling and platform role.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <p>
                    MealBridge acts as an independent connection platform between surplus food donors and recipient welfare organizations. MealBridge is not liable for food preparation standards, storage, transport conditions, or consumption outcomes. Donors and NGOs are urged to maintain proper hygiene and follow FSSAI safety norms at all times.
                  </p>
                  <p className="text-stone-600 mt-2 font-hindi">
                    मीलब्रिज केवल दानदाता और एनजीओ के बीच संपर्क माध्यम है। भोजन की तैयारी, रख-रखाव या परिवहन के परिणामों के लिए मीलब्रिज जिम्मेदार नहीं होगा। सभी उपयोगकर्ताओं से FSSAI सुरक्षा नियमों का पालन करने की अपेक्षा की जाती है।
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#112A46] hover:bg-[#0c1e33] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Close / बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};
