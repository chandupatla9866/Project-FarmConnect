import { motion } from "framer-motion";
import { Sprout, ShoppingCart, Brain, CheckCircle2, Truck, Wallet } from "lucide-react";
const STEPS = [{
  icon: Sprout,
  title: "Farmer lists produce",
  description: "Fresh fruits & vegetables uploaded with price, quantity and harvest date."
}, {
  icon: ShoppingCart,
  title: "Buyer places order",
  description: "Apartment communities and restaurants browse and order in a few taps."
}, {
  icon: Brain,
  title: "AI matches nearest farmer",
  description: "Smart matching finds the closest, best-fit farmer for every order."
}, {
  icon: CheckCircle2,
  title: "Farmer accepts",
  description: "Farmer confirms and prepares the order for pickup."
}, {
  icon: Truck,
  title: "Delivery partner collects & delivers",
  description: "Optimized routes get produce from farm to door, fast."
}, {
  icon: Wallet,
  title: "Payment transferred",
  description: "Farmer gets paid directly — no middlemen, no delays."
}];
export function HowItWorks() {
  return <section id="how-it-works" className="bg-slate-50 py-20 sm:py-28 dark:bg-slate-900/40">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
            How It Works
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            From farm to doorstep in six simple steps
          </h2>
        </div>

        <div className="relative mt-16">
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-slate-200 lg:block dark:bg-slate-800" />
          <div className="grid gap-6 lg:grid-cols-3">
            {STEPS.map((step, i) => <motion.div key={step.title} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true,
            margin: "-60px"
          }} transition={{
            duration: 0.4,
            delay: i % 3 * 0.12
          }} className="relative rounded-2xl border border-slate-200/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white shadow-soft">
                    {i + 1}
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <step.icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{step.description}</p>
              </motion.div>)}
          </div>
        </div>
      </div>
    </section>;
}