/* src/app/dashboard/history/page.tsx */
import { Download, FileText, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

// Transaction data should be fetched from API/database
// Placeholder for future dynamic data
const transactions: Array<{
  id: string;
  date: string;
  plan: string;
  amount: string;
  status: string;
}> = [];

export default function PaymentHistoryPage() {
    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Payment History</h1>
                    <p className="text-[#9CA3AF] text-sm">Review your past transactions and download invoices for tax purposes.</p>
                </div>
                <button className="flex items-center gap-2 bg-[#161B2E] border border-[#1E253A] text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all">
                    <Download className="w-4 h-4 text-cyan-400" /> Download All Statements
                </button>
            </div>

            {/* Modern Dark Table Container */}
            <div className="bg-[#0D101A] border border-[#1E253A] rounded-2xl overflow-hidden shadow-2xl">
              {transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#161B2E]/50 text-[10px] uppercase tracking-[0.2em] text-[#9CA3AF] border-b border-[#1E253A]">
                        <th className="px-8 py-5 font-bold">Invoice ID</th>
                        <th className="px-8 py-5 font-bold">Date</th>
                        <th className="px-8 py-5 font-bold">Plan</th>
                        <th className="px-8 py-5 font-bold">Amount</th>
                        <th className="px-8 py-5 font-bold">Status</th>
                        <th className="px-8 py-5 text-right font-bold">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E253A]">
                      {transactions.map((t) => (
                        <tr key={t.id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="px-8 py-6 text-xs font-mono text-[#9CA3AF]">{t.id}</td>
                          <td className="px-8 py-6 text-sm text-white font-medium">{t.date}</td>
                          <td className="px-8 py-6 text-sm text-cyan-400 font-semibold">{t.plan}</td>
                          <td className="px-8 py-6 text-sm text-white">{t.amount}</td>
                          <td className="px-8 py-6">
                            <StatusBadge status={t.status} />
                          </td>
                          <td className="px-8 py-6 text-right">
                            {t.status === 'Failed' ? (
                              <button className="text-xs font-bold text-red-400 hover:underline uppercase tracking-tight">
                                Retry Payment
                              </button>
                            ) : (
                              <button className="p-2 bg-white/5 rounded-lg border border-transparent group-hover:border-white/10 group-hover:text-cyan-400 transition-all">
                                <FileText className="w-5 h-5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                    <AlertCircle className="w-8 h-8 text-slate-600" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">No payment history</h3>
                  <p className="text-slate-500 text-sm max-w-md">
                    Your payment transactions will appear here once you make a purchase.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Support Prompt */}
            <div className="mt-12 p-8 bg-[#161B2E] border border-[#1E253A] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-white font-bold mb-1">Need help with a payment?</h3>
                    <p className="text-sm text-[#9CA3AF]">Our support team is available 24/7 for billing inquiries.</p>
                </div>
                <button className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-sm font-bold hover:bg-white/10 transition-all">
                    Contact Billing Support
                </button>
            </div>
        </div>
    );
}

// Sub-component for Status Styling
function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, any> = {
        Successful: { bg: "bg-green-500/10", text: "text-green-400", icon: <CheckCircle2 className="w-3 h-3" /> },
        Failed: { bg: "bg-red-500/10", text: "text-red-400", icon: <XCircle className="w-3 h-3" /> },
        Pending: { bg: "bg-yellow-500/10", text: "text-yellow-400", icon: <Clock className="w-3 h-3" /> },
    };

    const current = styles[status] || styles.Pending;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${current.bg} ${current.text}`}>
            {current.icon}
            {status}
        </span>
    );
}