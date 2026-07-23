import { motion } from "framer-motion";
import { Sprout, ShoppingBasket, Truck, Brain, BarChart3, BellRing } from "lucide-react";
const FEATURES = [{
  icon: Sprout,
  title: "Farmer Storefront",
  description: "Farmers list fresh produce with photos, harvest dates, quantity and fair pricing in minutes."
}, {
  icon: ShoppingBasket,
  title: "Community & Bulk Orders",
  description: "Apartment communities order weekly baskets; restaurants place scheduled bulk orders."
}, {
  icon: Truck,
  title: "Smart Delivery",
  description: "Optimized pickup and delivery routes connect farms to your doorstep, fast and fresh."
}, {
  icon: Brain,
  title: "AI-Powered Insights",
  description: "Demand forecasts, crop recommendations and price predictions guide every decision."
}, {
  icon: BarChart3,
  title: "Real-Time Analytics",
  description: "Farmers track revenue, top products and demand trends on a beautiful live dashboard."
}, {
  icon: BellRing,
  title: "Instant Notifications",
  description: "Order updates, payment confirmations and weather alerts delivered the moment they happen."
}];
export function Features() {
  return <section id="features" className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
          Platform Features
        </span>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Everything a modern farm-to-table marketplace needs
        </h2>
        <p className="mt-4 text-slate-600 dark:text-slate-300">
          One platform for listings, orders, logistics, and AI-driven decisions — built for farmers,
          apartment communities and restaurants alike.
        </p>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => <motion.div key={feature.title} initial={{
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
        delay: i % 3 * 0.1
      }} className="group rounded-2xl border border-slate-200/70 bg-white p-6 shadow-soft transition-shadow hover:shadow-soft-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-500/10 dark:text-brand-400">
              <feature.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{feature.description}</p>
          </motion.div>)}
      </div>
    </section>;
}