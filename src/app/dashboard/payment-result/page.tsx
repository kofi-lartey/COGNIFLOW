/* src/app/dashboard/payment-result/page.tsx */
'use client';
import { useEffect } from 'react';
import { CheckCircle2, XCircle, ArrowRight, RefreshCcw, LayoutDashboard, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function PaymentResultPage() {
    const searchParams = useSearchParams();
    const status = searchParams.get('status');
    const plan = searchParams.get('plan') || 'Obsidian Prime';
    const reference = searchParams.get('ref') || '';
    const isSuccess = status === 'success';
    const isFailed = status === 'failed' || status === 'cancelled';

    // Update subscription status on successful payment
    useEffect(() => {
        if (isSuccess) {
            localStorage.setItem('subscription_tier', plan.toLowerCase().replace(' ', '-'));
            localStorage.setItem('subscription_status', 'active');
            localStorage.setItem('payment_completed', 'true');
        }
    }, [isSuccess, plan]);

    return (
        <div className="min-h-screen bg-[#090B13] p-4 md:p-8 flex items-center justify-center">
            <div className="w-full max-w-md bg-[#0D101A] border border-[#1E253A] rounded-2xl p-6 shadow-2xl">
                
                {/* Status Icon */}
                <div className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center ${isSuccess ? "bg-cyan-400/10" : isFailed ? "bg-red-500/10" : "bg-yellow-500/10"}`}>
                    {isSuccess ? (
                        <CheckCircle2 className="w-8 h-8 text-cyan-400" />
                    ) : isFailed ? (
                        <XCircle className="w-8 h-8 text-red-500" />
                    ) : (
                        <RefreshCcw className="w-8 h-8 text-yellow-500" />
                    )}
                </div>

                <h1 className="text-2xl font-bold text-white text-center mb-2">
                    {isSuccess ? "Payment Successful" : isFailed ? "Payment Failed" : "Payment Cancelled"}
                </h1>

                <p className="text-[#9CA3AF] text-sm text-center mb-6 leading-relaxed">
                    {isSuccess
                        ? `Your ${plan} workspace is ready. Your transaction was processed securely.`
                        : isFailed
                        ? "We couldn't process your transaction. Please try again or contact support."
                        : "You cancelled the payment. You can try again whenever you're ready."}
                </p>

                {/* Transaction Details */}
                {(isSuccess || isFailed) && (
                    <div className="bg-[#090B13] rounded-xl p-4 mb-6 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-[#4B5563]">Plan</span>
                            <span className="text-white">{plan}</span>
                        </div>
                        {reference && (
                            <div className="flex justify-between text-sm">
                                <span className="text-[#4B5563]">Reference</span>
                                <span className="text-white font-mono text-xs">{reference.slice(0, 15)}...</span>
                            </div>
                        )}
                        {isSuccess && (
                            <div className="flex justify-between text-sm">
                                <span className="text-[#4B5563]">Status</span>
                                <span className="text-cyan-400">Active</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Link
                        href={isSuccess ? "/dashboard" : "/dashboard/subscription"}
                        className={`w-full py-3 rounded-xl font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all hover:brightness-110 ${isSuccess ? "bg-cyan-400 text-[#090B13]" : "bg-red-500 text-white"
                            }`}
                    >
                        {isSuccess ? (
                            <><LayoutDashboard className="w-4 h-4" /> Go to Dashboard</>
                        ) : (
                            <><RefreshCcw className="w-4 h-4" /> Try Again</>
                        )}
                    </Link>

                    {!isSuccess && (
                        <Link
                            href="/onboarding"
                            className="w-full py-3 rounded-xl font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 border border-[#1E253A] text-white hover:bg-white/5 transition-all"
                        >
                            <ArrowRight className="w-4 h-4" /> Back to Plans
                        </Link>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-white/5 flex justify-center items-center gap-4 text-[10px] text-[#4B5563] uppercase font-bold">
                    <div className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-cyan-400" /> Secure
                    </div>
                    <span>TXN-{Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
                </div>
            </div>
        </div>
    );
}