/* src/components/subscription/PaymentCheckout.tsx */
'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { useRouter } from 'next/navigation';
import { Lock, CreditCard, Landmark, Smartphone, ShieldCheck } from 'lucide-react';

interface PaymentCheckoutProps {
  planName?: string;
  amount?: number;
  currency?: 'NGN' | 'GHS';
}

// Get user email from mock auth context
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

export default function PaymentCheckout({ 
  planName = "Obsidian Prime", 
  amount = 49,
  currency = 'GHS'
}: PaymentCheckoutProps) {
  const router = useRouter();
  const [method, setMethod] = useState('card');

  // Config from your image specs
  const planPrice = amount;
  const vat = amount * 0.075;
  const totalAmount = amount + vat;
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
      custom_fields: [
        {
          display_name: 'Plan',
          variable_name: 'plan',
          value: planName
        }
      ]
    }
  }), [reference, amountInMinorUnits, currency, planName]);

  // Initialize Paystack payment hook
  const initializePayment = usePaystackPayment(config);

  // Handle successful payment
  const onSuccess = useCallback((response: { reference: string }) => {
    console.log('Payment successful:', response.reference);
    // Store payment info
    localStorage.setItem('payment_completed', 'true');
    localStorage.setItem('payment_reference', response.reference);
    localStorage.setItem('subscription_tier', 'obsidian');
    localStorage.setItem('subscription_status', 'active');
    
    router.push(`/dashboard/payment-result?status=success&plan=${encodeURIComponent(planName)}&ref=${response.reference}`);
  }, [router, planName]);

  // Handle cancelled/failed payment
  const onClose = useCallback(() => {
    router.push(`/dashboard/payment-result?status=failed&plan=${encodeURIComponent(planName)}`);
  }, [router, planName]);

  // Trigger payment
  const handlePayment = async () => {
    try {
      await initializePayment({
        onSuccess,
        onClose,
      });
    } catch (error) {
      console.error('Payment error:', error);
      router.push(`/dashboard/payment-result?status=failed&plan=${encodeURIComponent(planName)}`);
    }
  };

  // Demo mode - simulate payment without real Paystack
  const handleDemoPayment = async () => {
    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Store payment info
    localStorage.setItem('payment_completed', 'true');
    localStorage.setItem('payment_reference', reference);
    localStorage.setItem('subscription_tier', 'obsidian');
    localStorage.setItem('subscription_status', 'active');
    
    router.push(`/dashboard/payment-result?status=success&plan=${encodeURIComponent(planName)}&ref=${reference}`);
  };

  // Check if Paystack key is configured
  const isPaystackConfigured = !!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  const handlePayClick = isPaystackConfigured ? handlePayment : handleDemoPayment;

  return (
    <div className="min-h-screen bg-[#090B13] flex items-center justify-center p-6">
      <div className="w-full max-w-[1000px] bg-[#0D101A] border border-[#1E253A] rounded-[32px] overflow-hidden flex shadow-2xl">

        {/* LEFT: Summary */}
        <div className="w-[42%] bg-[#111421] p-12 border-r border-[#1E253A]">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-9 h-9 bg-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-400/20">
              <Lock className="w-5 h-5 text-[#090B13]" strokeWidth={3} />
            </div>
            <span className="text-2xl font-black text-white uppercase tracking-tighter">CogniFlow</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-10 tracking-tight">{planName}</h2>
          <div className="space-y-6 text-[#9CA3AF]">
            <div className="flex justify-between"><span>Monthly Plan</span><span className="text-white">${planPrice.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>VAT (7.5%)</span><span className="text-white">${vat.toFixed(2)}</span></div>
          </div>
          <div className="mt-32 flex justify-between items-end border-t border-white/5 pt-8">
            <span className="text-[11px] text-[#4B5563] font-black uppercase tracking-widest">Total Amount</span>
            <div className="text-right">
              <span className="text-sm text-[#4B5563] font-medium">{currency}</span>
              <span className="text-5xl font-bold text-cyan-400 tracking-tighter block">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
          
          {/* Payment Info */}
          <div className="mt-8 pt-8 border-t border-white/5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#4B5563] font-black mb-2">Customer</p>
            <p className="text-white text-sm">{getUserEmail()}</p>
            <p className="text-[#4B5563] text-xs font-mono mt-1">Ref: {reference}</p>
            {!isPaystackConfigured && (
              <div className="mt-2 text-xs text-yellow-500 bg-yellow-500/10 p-2 rounded">
                Demo mode: Payment will be simulated
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Paystack Trigger */}
        <div className="flex-1 p-12">
          <h3 className="text-2xl font-bold text-white mb-2">Select Payment Method</h3>
          <p className="text-sm text-[#4B5563] mb-10">Securely processed by <span className="text-white font-bold">Paystack</span></p>

          <div className="grid grid-cols-3 gap-4 mb-10">
            <MethodTab active={method === 'card'} icon={CreditCard} label="CARD" onClick={() => setMethod('card')} />
            <MethodTab active={method === 'bank'} icon={Landmark} label="BANK" onClick={() => setMethod('bank')} />
            <MethodTab active={method === 'mobile'} icon={Smartphone} label="MOBILE" onClick={() => setMethod('mobile')} />
          </div>

          <button
            onClick={handlePayClick}
            className="w-full bg-cyan-400 text-[#090B13] py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[13px] flex items-center justify-center gap-3 hover:brightness-110 shadow-xl shadow-cyan-400/20 transition-all active:scale-95"
          >
            <Lock className="w-4 h-4" strokeWidth={3} /> Securely Pay ${totalAmount.toFixed(2)}
          </button>

          {/* Supported Networks */}
          <div className="mt-12 opacity-50 flex gap-4 grayscale brightness-200">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg" /> {/* MTN */}
            <div className="w-10 h-10 bg-red-600 rounded-lg" /> {/* Vodafone */}
            <div className="w-10 h-10 bg-[#1E253A] rounded-lg" /> {/* Others */}
          </div>
          
          {/* Security badges */}
          <div className="mt-8 flex gap-6 text-[10px] uppercase tracking-[0.2em] text-[#4B5563] font-black">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-cyan-400" /> PCI-DSS
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-3 h-3 text-cyan-400" /> SSL
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MethodTab({ active, icon: Icon, label, onClick }: { active: boolean; icon: React.ElementType; label: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center py-5 rounded-2xl border transition-all ${active ? "bg-cyan-400/5 border-cyan-400 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.1)]" : "bg-transparent border-[#1E253A] text-[#4B5563]"}`}
    >
      <Icon className="w-6 h-6 mb-2" />
      <span className="text-[10px] font-black tracking-widest">{label}</span>
    </button>
  );
}