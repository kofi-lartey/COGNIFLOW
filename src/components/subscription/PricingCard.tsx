/* src/components/subscription/PricingCard.tsx */
import { Check, X } from "lucide-react";

interface PricingCardProps {
    tier: string;
    price: string;
    features: string[];
    unavailable?: string[];
    isPopular?: boolean;
    buttonText: string;
    onSelect?: () => void;
}

export function PricingCard({
    tier,
    price,
    features,
    unavailable = [],
    isPopular = false,
    buttonText,
    onSelect
}: PricingCardProps) {
    return (
        <div className={`relative p-8 rounded-[24px] border transition-all duration-500 ${isPopular
            ? "bg-[#111421] border-cyan-400/50 shadow-[0_20px_40px_-10px_rgba(34,211,238,0.15)] scale-105 z-10"
            : "bg-[#0D101A] border-[#1E253A] hover:border-[#2E3750]"
            }`}>
            {isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-400 text-[#090B13] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-cyan-400/20">
                    Popular Choice
                </span>
            )}

            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">{tier}</h3>
            <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold text-white tracking-tighter">{price}</span>
                {price !== "Custom" && <span className="text-[#4B5563] text-sm font-bold uppercase tracking-widest ml-1">/mo</span>}
            </div>

            <ul className="space-y-4 mb-10 min-h-[220px]">
                {features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[13px] text-[#9CA3AF] leading-relaxed">
                        <Check className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                        <span>{f}</span>
                    </li>
                ))}
                {unavailable.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[13px] text-[#374151]">
                        <X className="w-4 h-4 mt-0.5 shrink-0" />
                        <span className="line-through">{f}</span>
                    </li>
                ))}
            </ul>

            <button
                onClick={onSelect}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.15em] text-[11px] transition-all active:scale-[0.98] ${isPopular
                    ? "bg-cyan-400 text-[#090B13] hover:brightness-110 shadow-lg shadow-cyan-400/30"
                    : "bg-[#161B2E] text-white border border-[#1E253A] hover:bg-white/5"
                    }`}
            >
                {buttonText}
            </button>
        </div>
    );
}