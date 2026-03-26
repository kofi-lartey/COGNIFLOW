/* src/components/subscription/PaymentModal.tsx */
'use client';

import { useState, useCallback, useMemo } from 'react';
import { X, CreditCard, Landmark, Smartphone, Lock, Zap, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePaystackPayment } from 'react-paystack';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName?: string;
  amount?: number;
  planId?: string;
  currency?: 'NGN' | 'GHS';
}

// Get user email from auth context
function getUserEmail(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  
  const userJson = localStorage.getItem('sb-cogniflow-auth-token');
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      return user.email || undefined;
    } catch {
      return undefined;
    }
  }
  
  return undefined;
}

// Convert USD amount to minor units (kobo for NGN, pesewas for GHS)
function convertToMinorUnits(amountInDollars: number, currency: 'NGN' | 'GHS'): number {
  const exchangeRates: Record<string, number> = {
    'NGN': 1500, // 1 USD = 1500 NGN
    'GHS': 12,   // 1 USD = 12 GHS
  };
  
  const amountInLocalCurrency = amountInDollars * exchangeRates[currency];
  return Math.round(amountInLocalCurrency * 100);
}

export function PaymentModal({ 
  isOpen, 
  onClose, 
  planName = "Obsidian Prime", 
  amount = 49,
  planId = 'obsidian',
  currency = 'GHS'
}: PaymentModalProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate amounts with VAT (7.5%)
  const vatAmount = amount * 0.075;
  const totalAmount = amount + vatAmount;
  const amountInMinorUnits = convertToMinorUnits(totalAmount, currency);
  
  // Generate unique reference
  const reference = useMemo(() => 
    `CF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
  []);

  // Paystack configuration
  const config = useMemo(() => ({
    reference,
    email: getUserEmail(),
    amount: amountInMinorUnits,
    currency,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    metadata: {
      plan_name: planName,
      plan_id: planId,
      custom_fields: [
        {
          display_name: 'Plan',
          variable_name: 'plan',
          value: planName
        }
      ]
    }
  }), [reference, amountInMinorUnits, currency, planName, planId]);

  // Initialize Paystack payment hook
  const initializePayment = usePaystackPayment(config);

  // Handle successful payment
  const handleSuccess = useCallback((response: { reference: string }) => {
    console.log('Payment successful:', response.reference);
    // Store payment info
    localStorage.setItem('payment_completed', 'true');
    localStorage.setItem('payment_reference', response.reference);
    localStorage.setItem('subscription_tier', planId);
    localStorage.setItem('subscription_status', 'active');
    
    router.push(`/dashboard/payment-result?status=success&plan=${encodeURIComponent(planName)}&ref=${response.reference}`);
  }, [router, planName, planId]);

  // Handle cancelled/failed payment
  const handleClose = useCallback(() => {
    setIsProcessing(false);
    router.push(`/dashboard/payment-result?status=failed&plan=${encodeURIComponent(planName)}`);
  }, [router, planName]);

  // Trigger payment using Paystack
  const handlePayment = async () => {
    setIsProcessing(true);
    setPaymentError(null);
    
    try {
      await initializePayment({
        onSuccess: handleSuccess,
        onClose: handleClose,
      });
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('Payment initialization failed. Please try again.');
      setIsProcessing(false);
    }
  };

  // For demo mode - simulate payment without real Paystack
  const handleDemoPayment = async () => {
    setIsProcessing(true);
    setPaymentError(null);
    
    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Store payment info
    localStorage.setItem('payment_completed', 'true');
    localStorage.setItem('payment_reference', reference);
    localStorage.setItem('subscription_tier', planId);
    localStorage.setItem('subscription_status', 'active');
    
    // Redirect to success page
    router.push(`/dashboard/payment-result?status=success&plan=${encodeURIComponent(planName)}&ref=${reference}`);
  };

  // Check if Paystack key is configured
  const isPaystackConfigured = !!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  const handlePayClick = isPaystackConfigured ? handlePayment : handleDemoPayment;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#090B13]/90 backdrop-blur-md p-4">
      {/* Modal Container */}
      <div className="bg-[#0D101A] border border-[#1E253A] w-full max-w-[940px] rounded-[32px] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] flex flex-col md:flex-row min-h-[640px]">
        
        {/* Left Side: Receipt/Summary Panel */}
        <div className="w-full md:w-[42%] bg-[#111421] p-12 flex flex-col justify-between border-r border-[#1E253A]">
          <div>
            <div className="flex items-center gap-3 mb-16">
              <div className="w-10 h-10 bg-cyan-400 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                <Zap className="text-[#090B13] w-6 h-6" fill="currentColor" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tighter">CogniFlow</span>
            </div>

            <div className="space-y-1 mb-10">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#4B5563] font-black">Subscription</p>
              <h2 className="text-3xl font-bold text-white tracking-tight">{planName}</h2>
            </div>

            <div className="space-y-5">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#9CA3AF]">Monthly Plan</span>
                <span className="text-white font-medium">${amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#9CA3AF]">VAT (7.5%)</span>
                <span className="text-white font-medium">${vatAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="pt-8 border-t border-white/5 flex justify-between items-end">
              <span className="text-[13px] text-[#9CA3AF]">Total Amount</span>
              <div className="text-right">
                <span className="text-sm text-[#4B5563] font-medium">{currency}</span>
                <div className="text-4xl font-bold text-cyan-400 tracking-tight">
                  {(totalAmount).toFixed(2)}
                </div>
              </div>
            </div>
            {/* Paystack Mini Logo */}
            <div className="opacity-20 grayscale flex items-center gap-2">
              <div className="w-4 h-4 bg-white rounded-sm" />
              <span className="text-[10px] font-bold tracking-widest text-white uppercase">Paystack</span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Form Panel */}
        <div className="w-full md:w-[58%] p-12 relative bg-[#0D101A]">
          <button 
            onClick={onClose} 
            className="absolute top-8 right-8 text-[#4B5563] hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <header className="mb-10">
            <h3 className="text-xl font-bold text-white mb-1 tracking-tight">Select Payment Method</h3>
            <p className="text-xs text-[#4B5563]">Securely processed by Paystack</p>
          </header>

          {/* Method Tabs matching image */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <PaymentTab icon={<CreditCard className="w-5 h-5" />} label="CARD" active />
            <PaymentTab icon={<Landmark className="w-5 h-5" />} label="BANK" />
            <PaymentTab icon={<Smartphone className="w-5 h-5" />} label="MOBILE" />
          </div>

          <div className="space-y-6">
            {/* Payment Info */}
            <div className="bg-[#090B13] border border-[#1E253A] rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#4B5563] font-black mb-2">Payment Summary</p>
              <div className="flex justify-between text-sm">
                <span className="text-[#9CA3AF]">Email</span>
                <span className="text-white font-medium">{getUserEmail()}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-[#9CA3AF]">Reference</span>
                <span className="text-white font-mono text-xs">{reference}</span>
              </div>
              {!isPaystackConfigured && (
                <div className="mt-2 text-xs text-yellow-500 bg-yellow-500/10 p-2 rounded">
                  Demo mode: Payment will be simulated
                </div>
              )}
            </div>

            {paymentError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400 text-sm">{paymentError}</p>
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePayClick}
              disabled={isProcessing}
              className="w-full mt-4 bg-cyan-400 text-[#090B13] py-5 rounded-2xl font-black uppercase tracking-[0.1em] flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_20px_40px_-10px_rgba(34,211,238,0.3)] disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-[#090B13] border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Lock className="w-4 h-4" /> Securely Pay ${totalAmount.toFixed(2)}</>
              )}
            </button>
          </div>

          {/* Supported Networks */}
          <div className="pt-6">
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#4B5563] font-black mb-3">Supported Networks</p>
            <div className="flex gap-3">
              <NetworkIcon color="bg-[#FFCC00]" label="MTN" />
              <NetworkIcon color="bg-[#E60000]" label="Voda" />
              <NetworkIcon color="bg-[#000000]" label="AT" isAirtel />
            </div>
          </div>

          <p className="mt-6 text-[10px] text-[#4B5563] text-center px-8 leading-relaxed">
            Your payment information is encrypted and never stored on our servers. By clicking pay, you agree to the Terms of Service.
          </p>
        </div>
      </div>

      {/* Bottom Compliance Footer matching image */}
      <div className="fixed bottom-8 flex gap-8 text-[10px] uppercase tracking-[0.2em] text-[#4B5563] font-black">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3 h-3 text-cyan-400" /> PCI-DSS Compliant
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-3 h-3 text-cyan-400" /> 256-bit SSL
        </div>
      </div>
    </div>
  );
}

// Sub-components
function PaymentTab({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button className={`flex flex-col items-center gap-2 py-5 rounded-2xl border transition-all ${active
            ? "border-cyan-400 bg-cyan-400/5 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.1)]"
            : "border-[#1E253A] text-[#4B5563] hover:bg-white/5"
        }`}>
      {icon}
      <span className="text-[10px] font-black tracking-widest">{label}</span>
    </button>
  );
}

function NetworkIcon({ color, isAirtel }: { color: string; label: string; isAirtel?: boolean }) {
  return (
    <div className={`w-10 h-10 rounded-lg ${color} p-1 border border-white/10 flex items-center justify-center overflow-hidden grayscale hover:grayscale-0 transition-all cursor-help`}>
      <div className={`w-full h-full rounded ${isAirtel ? "bg-red-600" : "bg-white/20"}`} />
    </div>
  );
}