import React from 'react';
import { X, Check, Zap, Lock } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  if (!isOpen) return null;

  const features = [
    "Unlimited AI Generations",
    "Access to all 80+ Frameworks",
    "Custom Tone Calibration",
    "Multi-Platform Export (LinkedIn, X, IG, TG)",
    "Priority Support"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="bg-indigo-900 p-8 text-center text-white">
          <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-900/50">
            <Zap className="text-white h-6 w-6 fill-current" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Upgrade to Pro Factory</h2>
          <p className="text-indigo-200 text-sm">Unlock the full potential of your content engine.</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="space-y-4 mb-8">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5 mr-3">
                  <Check size={12} className="text-green-600" />
                </div>
                <span className="text-slate-600 text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center">
              <span className="text-4xl font-bold text-slate-900">$29</span>
              <span className="text-slate-500 ml-2">/ month</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Cancel anytime. Secure payment via Stripe.</p>
          </div>

          {/* Action Button */}
          <button
            onClick={onUpgrade}
            className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center group"
          >
            <span>Unlock Unlimited Access</span>
            <Lock size={16} className="ml-2 opacity-70 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
    </div>
  );
};
