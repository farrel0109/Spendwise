"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { 
  ArrowRight, 
  BarChart3, 
  Shield, 
  Zap,
  TrendingUp,
  Trophy,
  Wallet,
  ChevronRight
} from "lucide-react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function Home() {
  const { isSignedIn } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <div className="min-h-screen bg-[#030712] text-white antialiased">
      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-lg font-semibold tracking-tight">SpendWise</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</Link>
          </div>

          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <Link 
                href="/dashboard" 
                className="px-4 py-2 bg-white text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">
                  Log in
                </Link>
                <Link 
                  href="/sign-up" 
                  className="px-4 py-2 bg-white text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="min-h-screen flex items-center justify-center px-6 pt-20 relative overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            
            {/* Headline */}
            <motion.h1 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]"
            >
              Track expenses.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                Build wealth.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto"
            >
              SpendWise helps you take control of your finances with smart tracking, 
              gamified goals, and insights that actually make sense.
            </motion.p>

            {/* CTA */}
            <motion.div 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link 
                href="/sign-up"
                className="group px-6 py-3 bg-white text-zinc-900 font-medium rounded-lg hover:bg-zinc-200 transition-all flex items-center gap-2"
              >
                Start for free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="#features"
                className="px-6 py-3 text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
              >
                See how it works
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-zinc-600 rounded-full flex justify-center pt-2">
            <motion.div 
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-zinc-400 rounded-full"
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Everything you need
            </h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              Simple tools to help you understand and improve your spending habits.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: BarChart3,
                title: "Smart Dashboard",
                description: "Track income, expenses, and balance at a glance with beautiful charts.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Trophy,
                title: "Gamified Goals",
                description: "Earn XP and unlock badges for hitting your financial milestones.",
                color: "from-violet-500 to-purple-500"
              },
              {
                icon: Shield,
                title: "Bank-Grade Security",
                description: "Your data is encrypted and protected with enterprise-level security.",
                color: "from-emerald-500 to-green-500"
              }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-zinc-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 border-y border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10K+", label: "Active Users" },
              { value: "$2M+", label: "Tracked" },
              { value: "4.9", label: "App Rating" },
              { value: "99.9%", label: "Uptime" }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-zinc-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Simple pricing
            </h2>
            <p className="text-zinc-400 text-lg">
              Start free. Upgrade when you need more.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl"
            >
              <div className="text-sm text-zinc-500 mb-2">Free</div>
              <div className="text-4xl font-bold mb-6">$0</div>
              <ul className="space-y-4 mb-8">
                {["Basic expense tracking", "3 accounts", "Monthly reports"].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-zinc-400">
                    <Zap className="w-4 h-4 text-zinc-600" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link 
                href="/sign-up"
                className="block w-full py-3 text-center bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium transition-colors"
              >
                Get started
              </Link>
            </motion.div>

            {/* Pro */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-8 bg-gradient-to-b from-violet-900/20 to-zinc-900/50 border border-violet-500/30 rounded-2xl relative"
            >
              <div className="absolute -top-3 left-6 px-3 py-1 bg-violet-500 text-xs font-medium rounded-full">
                Popular
              </div>
              <div className="text-sm text-zinc-500 mb-2">Pro</div>
              <div className="text-4xl font-bold mb-6">$9<span className="text-lg text-zinc-500">/mo</span></div>
              <ul className="space-y-4 mb-8">
                {["Unlimited accounts", "Advanced analytics", "Export data", "Priority support"].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-zinc-300">
                    <Zap className="w-4 h-4 text-violet-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link 
                href="/sign-up"
                className="block w-full py-3 text-center bg-violet-600 hover:bg-violet-500 rounded-lg font-medium transition-colors"
              >
                Start free trial
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center p-16 bg-gradient-to-br from-violet-900/30 via-zinc-900 to-zinc-900 border border-zinc-800 rounded-3xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Ready to take control?
            </h2>
            <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of users who are already building better financial habits.
            </p>
            <Link 
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-zinc-900 font-medium rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Get started for free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-semibold">SpendWise</span>
          </div>
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} SpendWise. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Twitter</Link>
            <Link href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">GitHub</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}