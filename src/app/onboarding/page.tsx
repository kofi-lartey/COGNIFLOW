/* src/app/onboarding/page.tsx */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, User, Building2, CreditCard, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { PricingCard } from '@/components/subscription/PricingCard';

interface OnboardingData {
  fullName?: string;
  bio?: string;
  organization?: string;
  workspaceName?: string;
  tier?: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({});

  // Load saved onboarding data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('onboarding_data');
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, []);

  // Save data to localStorage
  const saveData = (newData: Partial<OnboardingData>) => {
    const updated = { ...data, ...newData };
    setData(updated);
    localStorage.setItem('onboarding_data', JSON.stringify(updated));
  };

  const handleProfileSubmit = async () => {
    if (!data.fullName) return;
    setStep(2);
  };

  const handleWorkspaceSubmit = async () => {
    if (!data.workspaceName) return;
    setStep(3);
  };

  const handleTierSelect = async (tier: string) => {
    setLoading(true);
    saveData({ tier });

    try {
      // Get auth token from localStorage (set by mock auth)
      const mockUser = localStorage.getItem('cogniflow_mock_user');
      const token = mockUser ? JSON.parse(mockUser).id : null;

      // For all tiers, redirect to payment checkout
      // Free tier will have no charge, paid tiers will process payment
      localStorage.setItem('onboarding_completed', 'true');
      localStorage.removeItem('onboarding_data');
      
      // Store selected plan for checkout
      const planInfo = {
        tier,
        amount: tier === 'free' ? 0 : tier === 'pro' ? 29 : 99,
        currency: 'GHS' as const,
      };
      localStorage.setItem('selected_plan', JSON.stringify(planInfo));
      
      // Redirect to payment checkout
      router.push('/dashboard/payment-checkout');
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090B13] flex flex-col">
      {/* Navigation */}
      <nav className="w-full max-w-7xl p-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="text-cyan-400 w-6 h-6" />
          <span className="text-white font-bold text-xl">CogniFlow</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Step indicators */}
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex items-center gap-2 ${
                s <= step ? 'text-cyan-400' : 'text-[#4B5563]'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  s < step
                    ? 'bg-cyan-400 text-[#090B13]'
                    : s === step
                    ? 'bg-cyan-400/20 border border-cyan-400 text-cyan-400'
                    : 'bg-[#1F2937] border border-[#374151]'
                }`}
              >
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-0.5 ${s < step ? 'bg-cyan-400' : 'bg-[#374151]'}`} />
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Step Content */}
      <div className="flex-1 flex flex-col justify-center w-full max-w-4xl mx-auto px-6 pb-20">
        
        {/* Step 1: Profile */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 mb-6">
                <User className="w-8 h-8 text-cyan-400" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Tell us about yourself</h1>
              <p className="text-[#9CA3AF] text-lg">This helps us personalize your experience</p>
            </div>

            <div className="bg-[#0D101A] border border-[#1E253A] rounded-2xl p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={data.fullName || ''}
                  onChange={(e) => saveData({ fullName: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full h-14 px-4 bg-[#161B2E] border border-[#1E253A] rounded-xl text-white placeholder:text-[#6B7280] focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2 uppercase tracking-wider">
                  Organization (optional)
                </label>
                <input
                  type="text"
                  value={data.organization || ''}
                  onChange={(e) => saveData({ organization: e.target.value })}
                  placeholder="Your company or organization"
                  className="w-full h-14 px-4 bg-[#161B2E] border border-[#1E253A] rounded-xl text-white placeholder:text-[#6B7280] focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2 uppercase tracking-wider">
                  Bio (optional)
                </label>
                <textarea
                  value={data.bio || ''}
                  onChange={(e) => saveData({ bio: e.target.value })}
                  placeholder="Tell us a bit about yourself..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[#161B2E] border border-[#1E253A] rounded-xl text-white placeholder:text-[#6B7280] focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all resize-none"
                />
              </div>

              <button
                onClick={handleProfileSubmit}
                disabled={!data.fullName}
                className="w-full h-14 bg-cyan-400 text-[#090B13] rounded-xl font-bold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Workspace */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 mb-6">
                <Building2 className="w-8 h-8 text-cyan-400" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Create your workspace</h1>
              <p className="text-[#9CA3AF] text-lg">This is where your projects will live</p>
            </div>

            <div className="bg-[#0D101A] border border-[#1E253A] rounded-2xl p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2 uppercase tracking-wider">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={data.workspaceName || ''}
                  onChange={(e) => saveData({ workspaceName: e.target.value })}
                  placeholder="My Awesome Workspace"
                  className="w-full h-14 px-4 bg-[#161B2E] border border-[#1E253A] rounded-xl text-white placeholder:text-[#6B7280] focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 h-14 bg-[#161B2E] text-white border border-[#1E253A] rounded-xl font-bold hover:bg-[#1F2937] transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <button
                  onClick={handleWorkspaceSubmit}
                  disabled={!data.workspaceName}
                  className="flex-1 h-14 bg-cyan-400 text-[#090B13] rounded-xl font-bold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Subscription */}
        {step === 3 && (
          <div className="animate-fadeIn">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 mb-6">
                <CreditCard className="w-8 h-8 text-cyan-400" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Choose your plan</h1>
              <p className="text-[#9CA3AF] text-lg">Select the plan that best fits your needs</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <PricingCard
                tier="Free"
                price="$0"
                features={['1 Active Project', 'Basic AI Logic', '5GB Storage', 'Community Support']}
                unavailable={['Custom Domains', 'Priority Support', 'API Access']}
                buttonText="Get Started"
                onSelect={() => handleTierSelect('free')}
              />
              <PricingCard
                tier="Pro"
                price="$29"
                isPopular
                features={['Unlimited Projects', 'Advanced Neural Logic', '100GB Storage', 'API Access', 'Priority 24/7 Support']}
                buttonText="Choose Pro"
                onSelect={() => handleTierSelect('pro')}
              />
              <PricingCard
                tier="Enterprise"
                price="Custom"
                features={['White-label Solutions', 'Dedicated Node', 'Unlimited Storage', 'SSO Integration', 'Custom Contracts']}
                buttonText="Contact Sales"
                onSelect={() => handleTierSelect('enterprise')}
              />
            </div>

            <div className="text-center">
              <button
                onClick={() => setStep(2)}
                className="text-[#9CA3AF] hover:text-white transition-colors flex items-center gap-2 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" /> Back to workspace
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-[#090B13]/80 flex items-center justify-center z-50">
            <div className="bg-[#0D101A] border border-[#1E253A] p-8 rounded-2xl text-center">
              <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white font-medium">Processing your subscription...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}