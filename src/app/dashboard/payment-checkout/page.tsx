/* src/app/dashboard/payment-checkout/page.tsx */
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { usePaystackPayment } from 'react-paystack';
import { 
  Lock, CreditCard, Landmark, Smartphone, 
  ShieldCheck, ArrowLeft, CheckCircle, Loader2 
} from 'lucide-react';
import Link from 'next/link';

// =============================================================================
// Types
// =============================================================================

interface PlanInfo {
  tier: string;
  amount: number;
  currency: 'NGN' | 'GHS';
}

interface PaymentConfig {
  reference: string;
  email?: string;
  amount: number;
  currency: string;
  publicKey: string;
  metadata: {
    plan_name: string;
    custom_fields: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Retrieves the current user's email from localStorage
 */
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

/**
 * Converts USD amount to minor units (kobo for NGN, pesewas for GHS)
 */
function convertToMinorUnits(amountInDollars: number, currency: 'NGN' | 'GHS'): number {
  const exchangeRates: Record<string, number> = {
    'NGN': 1500,
    'GHS': 12,
  };
  return Math.round(amountInDollars * exchangeRates[currency] * 100);
}

/**
 * Generates a unique payment reference
 */
function generateReference(): string {
  return `CF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculates VAT and total amount
 */
function calculateAmounts(amount: number): { vat: number; total: number } {
  const vat = amount * 0.075;
  return { vat, total: amount + vat };
}

// =============================================================================
// Sub-Components
// =============================================================================

/** Header component with logo and back navigation */
function CheckoutHeader({ showPaystackStatus }: { showPaystackStatus: boolean }) {
  return (
    <div className="flex items-center gap-3 p-6 border-b border-[#1E253A]">
      <Link 
        href="/onboarding" 
        className="text-[#4B5563] hover:text-white transition-colors"
        aria-label="Back to onboarding"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>
      <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center">
        <Lock className="w-4 h-4 text-[#090B13]" />
      </div>
      <span className="text-lg font-bold text-white">CogniFlow</span>
      {showPaystackStatus && (
        <span className="ml-auto text-[10px] text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded flex items-center">
          <CheckCircle className="w-3 h-3 mr-1" /> Paystack Active
        </span>
      )}
    </div>
  );
}

/** Plan summary section showing selected plan details */
function PlanSummary({ plan, vatAmount, totalAmount }: { 
  plan: PlanInfo; 
  vatAmount: number; 
  totalAmount: number; 
}) {
  return (
    <div className="p-6 border-b border-[#1E253A]">
      <p className="text-[10px] uppercase tracking-widest text-[#4B5563] font-bold mb-2">
        Selected Plan
      </p>
      <h2 className="text-2xl font-bold text-white mb-4">{plan.tier}</h2>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[#9CA3AF]">Monthly Plan</span>
          <span className="text-white">${plan.amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#9CA3AF]">VAT (7.5%)</span>
          <span className="text-white">${vatAmount.toFixed(2)}</span>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-end">
        <span className="text-xs text-[#4B5563] uppercase font-bold">Total</span>
        <div className="text-right">
          <span className="text-xs text-[#4B5563] block">{plan.currency}</span>
          <span className="text-2xl font-bold text-cyan-400">${totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

/** Payment details section showing customer info */
function PaymentDetails({ 
  reference, 
  currency 
}: { 
  reference: string; 
  currency: string; 
}) {
  const email = getUserEmail();
  
  return (
    <div className="p-6">
      <p className="text-[10px] uppercase tracking-widest text-[#4B5563] font-bold mb-4">
        Payment Details
      </p>
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-[#9CA3AF]">Email</span>
          <span className="text-white text-sm truncate max-w-[200px]">{email}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#9CA3AF]">Reference</span>
          <span className="text-white font-mono text-xs">{reference.slice(0, 20)}...</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#9CA3AF]">Currency</span>
          <span className="text-white">{currency}</span>
        </div>
      </div>
    </div>
  );
}

/** Demo mode warning banner */
function DemoModeWarning() {
  return (
    <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
      <p className="text-yellow-500 text-xs">Demo mode: Payment will be simulated</p>
    </div>
  );
}

/** Payment method selection tabs */
function PaymentMethods({ selectedMethod, onSelect }: { 
  selectedMethod: string; 
  onSelect: (method: string) => void;
}) {
  const methods = [
    { id: 'card', icon: CreditCard, label: 'CARD' },
    { id: 'bank', icon: Landmark, label: 'BANK' },
    { id: 'mobile', icon: Smartphone, label: 'MOBILE' },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 mb-6">
      {methods.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-all ${
            selectedMethod === id
              ? 'border-cyan-400 bg-cyan-400/5 text-cyan-400'
              : 'border-[#1E253A] text-[#4B5563] hover:bg-white/5'
          }`}
        >
          <Icon className="w-4 h-4" />
          <span className="text-[10px] font-bold">{label}</span>
        </button>
      ))}
    </div>
  );
}

/** Pay button with loading state */
function PayButton({ 
  amount, 
  isProcessing, 
  onClick 
}: { 
  amount: number; 
  isProcessing: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isProcessing}
      className="w-full bg-cyan-400 text-[#090B13] py-3 rounded-xl font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
    >
      {isProcessing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <Lock className="w-3 h-3" /> 
          Pay ${amount.toFixed(2)}
        </>
      )}
    </button>
  );
}

/** Security badges footer */
function SecurityBadges() {
  return (
    <div className="mt-4 flex justify-center gap-4 text-[10px] text-[#4B5563] uppercase font-bold">
      <div className="flex items-center gap-1">
        <ShieldCheck className="w-3 h-3 text-cyan-400" /> PCI-DSS
      </div>
      <div className="flex items-center gap-1">
        <Lock className="w-3 h-3 text-cyan-400" /> SSL
      </div>
    </div>
  );
}

/** Loading state component */
function LoadingState() {
  return (
    <div className="min-h-screen bg-[#090B13] flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[#9CA3AF] text-sm">Loading payment...</p>
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function PaymentCheckoutPage() {
  const router = useRouter();
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('card');

  // Configuration
  const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';
  const isPaystackConfigured = !!paystackPublicKey;

  // Load plan from localStorage on mount
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('onboarding_completed');
    
    if (!onboardingCompleted) {
      router.push('/login');
      return;
    }

    const selectedPlan = localStorage.getItem('selected_plan');
    if (selectedPlan) {
      try {
        setPlanInfo(JSON.parse(selectedPlan));
      } catch {
        setPlanInfo({ tier: 'Obsidian Prime', amount: 49, currency: 'GHS' });
      }
    } else {
      setPlanInfo({ tier: 'Obsidian Prime', amount: 49, currency: 'GHS' });
    }

    setIsLoading(false);
  }, [router]);

  // Derived values
  const { vat: vatAmount, total: totalAmount } = useMemo(
    () => planInfo ? calculateAmounts(planInfo.amount) : { vat: 0, total: 0 },
    [planInfo]
  );

  const amountInMinorUnits = useMemo(
    () => planInfo ? convertToMinorUnits(totalAmount, planInfo.currency) : 0,
    [planInfo, totalAmount]
  );

  const reference = useMemo(() => generateReference(), []);

  // Paystack config
  const config: PaymentConfig = useMemo(() => ({
    reference,
    email: getUserEmail(),
    amount: amountInMinorUnits,
    currency: planInfo?.currency || 'GHS',
    publicKey: paystackPublicKey,
    metadata: {
      plan_name: planInfo?.tier || 'Obsidian Prime',
      custom_fields: [
        {
          display_name: 'Plan',
          variable_name: 'plan',
          value: planInfo?.tier || 'Obsidian Prime'
        }
      ]
    }
  }), [reference, amountInMinorUnits, planInfo, paystackPublicKey]);

  // Initialize Paystack
  const initializePayment = usePaystackPayment(config);

  // Payment handlers
  const handleSuccess = useCallback((response: { reference: string }) => {
    console.log('Payment successful:', response.reference);
    localStorage.setItem('payment_completed', 'true');
    localStorage.setItem('payment_reference', response.reference);
    localStorage.setItem('subscription_tier', planInfo?.tier.toLowerCase() || 'obsidian');
    localStorage.setItem('subscription_status', 'active');
    router.push(
      `/dashboard/payment-result?status=success&plan=${encodeURIComponent(planInfo?.tier || 'Obsidian Prime')}&ref=${response.reference}`
    );
  }, [router, planInfo]);

  const handleClose = useCallback(() => {
    setIsProcessing(false);
  }, []);

  const handlePayment = async () => {
    // Handle free tier - skip payment processing
    if (planInfo?.tier.toLowerCase() === 'free') {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('payment_completed', 'true');
      localStorage.setItem('payment_reference', reference);
      localStorage.setItem('subscription_tier', 'free');
      localStorage.setItem('subscription_status', 'active');
      router.push('/dashboard');
      return;
    }

    if (!isPaystackConfigured) {
      // Demo mode
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      localStorage.setItem('payment_completed', 'true');
      localStorage.setItem('payment_reference', reference);
      localStorage.setItem('subscription_tier', planInfo?.tier.toLowerCase() || 'obsidian');
      localStorage.setItem('subscription_status', 'active');
      router.push(
        `/dashboard/payment-result?status=success&plan=${encodeURIComponent(planInfo?.tier || 'Obsidian Prime')}&ref=${reference}`
      );
      return;
    }

    // Real Paystack payment
    setIsProcessing(true);
    try {
      await initializePayment({
        onSuccess: handleSuccess,
        onClose: handleClose,
      });
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      router.push(
        `/dashboard/payment-result?status=failed&plan=${encodeURIComponent(planInfo?.tier || 'Obsidian Prime')}`
      );
    }
  };

  // Loading state
  if (isLoading || !planInfo) {
    return <LoadingState />;
  }

  // Main render
  return (
    <div className="min-h-screen bg-[#090B13] p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-md bg-[#0D101A] border border-[#1E253A] rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <CheckoutHeader showPaystackStatus={isPaystackConfigured} />

        {/* Plan Summary */}
        <PlanSummary 
          plan={planInfo} 
          vatAmount={vatAmount} 
          totalAmount={totalAmount} 
        />

        {/* Payment Details */}
        <PaymentDetails 
          reference={reference} 
          currency={planInfo.currency} 
        />

        {/* Payment Form */}
        <div className="px-6 pb-6">
          {!isPaystackConfigured && <DemoModeWarning />}
          
          <PaymentMethods 
            selectedMethod={selectedMethod} 
            onSelect={setSelectedMethod} 
          />
          
          <PayButton 
            amount={totalAmount} 
            isProcessing={isProcessing} 
            onClick={handlePayment} 
          />
          
          <SecurityBadges />
        </div>

      </div>
    </div>
  );
}