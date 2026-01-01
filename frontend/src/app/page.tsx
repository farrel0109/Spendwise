import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Logo & Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-6 shadow-2xl shadow-purple-500/25">
            <span className="text-white font-bold text-3xl">S</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Spend<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Wise</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-md mx-auto">
            Track your expenses, manage your finances, and gain powerful insights
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {[
            { icon: "💰", title: "Track Expenses", desc: "Log income & expenses with categories" },
            { icon: "📊", title: "Visual Insights", desc: "Beautiful charts to understand spending" },
            { icon: "🔒", title: "Secure", desc: "Your data is private and protected" },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 text-center"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/sign-in"
            className="px-8 py-4 rounded-xl font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25 text-center"
          >
            Get Started Free
          </Link>
          <Link
            href="/sign-up"
            className="px-8 py-4 rounded-xl font-medium text-white border border-slate-600 hover:bg-slate-800/50 transition-all text-center"
          >
            Create Account
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-16 text-slate-500 text-sm">
          Built with Next.js, Clerk, and Supabase
        </p>
      </div>
    </div>
  );
}
