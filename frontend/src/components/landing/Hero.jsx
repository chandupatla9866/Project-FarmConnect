import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, ShieldCheck, TrendingUp, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";
const STATS = [{
  label: "Farmers onboarded",
  value: "1,200+"
}, {
  label: "Avg. farmer profit increase",
  value: "32%"
}, {
  label: "Cities covered",
  value: "8"
}];
export function Hero() {
  return <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl dark:bg-brand-500/10" />
      <div className="pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full bg-sunrise-200/40 blur-3xl dark:bg-sunrise-500/10" />

      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 sm:pb-28 sm:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <motion.div initial={{
          opacity: 0,
          y: 24
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-400">
              <Leaf className="h-3.5 w-3.5" /> AI-Powered Agritech Platform
            </span>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
              Fresh produce, <span className="text-brand-600 dark:text-brand-400">straight from farm</span> to your community
            </h1>

            <p className="mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-300">
              FarmConnect connects farmers directly with apartment communities and restaurants —
              cutting out middlemen, so farmers earn more and buyers pay less for fresher food.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  See How It Works
                </Button>
              </a>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-slate-200 pt-8 dark:border-slate-800">
              {STATS.map(stat => <div key={stat.label}>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                </div>)}
            </div>
          </motion.div>

          <motion.div initial={{
          opacity: 0,
          scale: 0.94
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.6,
          delay: 0.15
        }} className="relative">
            <div className="glass-panel relative overflow-hidden rounded-3xl p-2">
              <img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80" alt="Fresh vegetables harvested from a farm" className="h-[420px] w-full rounded-2xl object-cover sm:h-[480px]" />
            </div>

            <motion.div initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: 0.5
          }} className="glass-panel absolute -left-6 top-8 hidden w-52 rounded-2xl p-4 sm:block">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-500/20">
                  <TrendingUp className="h-4 w-4 text-brand-700 dark:text-brand-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tomato demand</p>
                  <p className="text-sm font-bold text-brand-700 dark:text-brand-400">+28% next week</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{
            opacity: 0,
            x: 20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: 0.7
          }} className="glass-panel absolute -right-4 bottom-10 hidden w-56 rounded-2xl p-4 sm:block">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sunrise-100 dark:bg-sunrise-500/20">
                  <Truck className="h-4 w-4 text-sunrise-600 dark:text-sunrise-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Order FC-ORD-0231</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">Out for delivery</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{
            opacity: 0,
            y: 16
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.9
          }} className="glass-panel absolute -bottom-6 left-8 hidden items-center gap-2 rounded-full px-4 py-2 sm:flex">
              <ShieldCheck className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Verified organic farms
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>;
}