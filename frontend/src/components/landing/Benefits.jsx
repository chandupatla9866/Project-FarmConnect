import { motion } from "framer-motion";
import { Check, Sprout, Building2 } from "lucide-react";
const FARMER_BENEFITS = ["Earn up to 30-40% more by selling direct to buyers", "No middlemen, no unfair price cuts", "AI-driven crop and price guidance", "Simple order management from any phone", "Transparent, on-time payments"];
const BUYER_BENEFITS = ["Fresher produce, harvested within days", "Fair, transparent pricing", "Weekly baskets & subscription options", "Bulk and scheduled ordering for restaurants", "Track every order in real time"];
export function Benefits() {
  return <section className="bg-slate-50 py-20 sm:py-28 dark:bg-slate-900/40">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
            Benefits
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Built for both sides of the marketplace
          </h2>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <motion.div initial={{
          opacity: 0,
          x: -24
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true,
          margin: "-60px"
        }} transition={{
          duration: 0.5
        }} className="rounded-3xl border border-brand-200 bg-white p-8 shadow-soft dark:border-brand-500/20 dark:bg-slate-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-soft">
              <Sprout className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">For Farmers</h3>
            <ul className="mt-5 space-y-3">
              {FARMER_BENEFITS.map(item => <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
                  {item}
                </li>)}
            </ul>
          </motion.div>

          <motion.div initial={{
          opacity: 0,
          x: 24
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true,
          margin: "-60px"
        }} transition={{
          duration: 0.5
        }} className="rounded-3xl border border-sunrise-200 bg-white p-8 shadow-soft dark:border-sunrise-500/20 dark:bg-slate-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sunrise-500 text-white shadow-soft">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">For Communities &amp; Restaurants</h3>
            <ul className="mt-5 space-y-3">
              {BUYER_BENEFITS.map(item => <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-sunrise-500" />
                  {item}
                </li>)}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>;
}