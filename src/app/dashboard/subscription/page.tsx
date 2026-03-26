/* src/app/dashboard/subscription/page.tsx */
"use client";

import { useState } from "react";
import { PaymentModal } from "@/components/subscription/PaymentModal";
import { PricingCard } from "@/components/subscription/PricingCard";

export default function SubscriptionPage() {
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<{ name: string; id: string; amount: number } | null>(null);

    const handleSubscribe = (tier: string) => {
        if (tier === 'Free') {
            localStorage.setItem('subscription_tier', 'free');
            return;
        }
        const plans: Record<string, { name: string; id: string; amount: number }> = {
            'Pro': { name: 'Obsidian Pro', id: 'pro', amount: 29 },
            'Enterprise': { name: 'Obsidian Enterprise', id: 'enterprise', amount: 99 },
        };
        setSelectedPlan(plans[tier]);
        setPaymentModalOpen(true);
    };

    return (
        <div className="max-w-6xl mx-auto py-20 px-8 relative">
            {/* Subtle glow background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-400/5 blur-[120px] pointer-events-none" />

            <div className="text-center mb-20 relative z-10">
                <span className="text-[10px] uppercase tracking-[0.4em] text-cyan-400 font-black mb-4 block">Pricing Strategy</span>
                <h1 className="text-6xl font-bold text-white mb-6 tracking-tighter">
                    Scale your flow with <span className="text-cyan-400">Precision</span>
                </h1>
                <p className="text-[#4B5563] max-w-2xl mx-auto text-lg leading-relaxed font-medium">
                    Choose the architectural foundation that matches your computational needs. From solo creators to global enterprises.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative z-10">
                <PricingCard
                    tier="Free"
                    price="$0"
                    features={["1 Active Project", "Basic AI Templates", "Community Support"]}
                    unavailable={["Custom Domain Integration", "API Access (Tier 1)"]}
                    buttonText="Get Started"
                    onSelect={() => handleSubscribe('Free')}
                />

                <PricingCard
                    tier="Pro"
                    price="$29"
                    isPopular
                    features={["Unlimited Projects", "Advanced Neural Logic", "Custom Domain Integration", "API Access (Tier 1)", "Priority 24/7 Support"]}
                    buttonText="Subscribe Now"
                    onSelect={() => handleSubscribe('Pro')}
                />

                <PricingCard
                    tier="Enterprise"
                    price="Custom"
                    features={["White-label Solutions", "Dedicated Cluster Node", "SLA & On-prem Support", "SSO & IAM Integration", "Infinite Computational Credits"]}
                    buttonText="Contact Sales"
                    onSelect={() => handleSubscribe('Enterprise')}
                />
            </div>

            {selectedPlan && (
                <PaymentModal
                    isOpen={paymentModalOpen}
                    onClose={() => { setPaymentModalOpen(false); setSelectedPlan(null); }}
                    planName={selectedPlan.name}
                    amount={selectedPlan.amount}
                    planId={selectedPlan.id}
                />
            )}
        </div>
    );
}