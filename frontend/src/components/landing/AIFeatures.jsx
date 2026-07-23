import { motion } from "framer-motion";
import { TrendingUp, Sprout, DollarSign, ScanEye, CloudRain } from "lucide-react";
const AI_FEATURES = [{
  icon: TrendingUp,
  title: "Demand Prediction",
  example: "“Next week's tomato demand will increase by 28%.”",
  description: "Forecasts built from order history, seasonality, weather and festivals."
}, {
  icon: Sprout,
  title: "Crop Recommendation",
  example: "“Plant tomatoes instead of brinjal this season.”",
  description: "Suggests the most profitable crops for a farmer's soil, region and season."
}, {
  icon: DollarSign,
  title: "Price Prediction",
  example: "“Organic spinach: ₹18-22/kg predicted this week.”",
  description: "Predicts fair selling prices using market factors and demand signals."
}, {
  icon: ScanEye,
  title: "Disease Detection",
  example: "“Early blight detected — apply copper fungicide.”",
  description: "Upload a crop photo and get an instant diagnosis with treatment advice."
}, {
  icon: CloudRain,
  title: "Weather Alerts",
  example: "“Heavy rain expected in 48 hours — protect harvested stock.”",
  description: "Proactive alerts for rain, heat waves, storms and humidity spikes."
}];
export function AIFeatures() {
  return <section id="ai-features" className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
          AI Features
        </span>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Smarter farming, powered by AI
        </h2>
        <p className="mt-4 text-slate-600 dark:text-slate-300">
          Every farmer gets a personal AI co-pilot for demand, pricing, crop planning, plant health
          and weather.
        </p>
      </div>

      <div className="mt-16 grid gap-6 lg:grid-cols-5">
        {AI_FEATURES.map((feature, i) => <motion.div key={feature.title} initial={{
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
        delay: i * 0.08
      }} className="flex flex-col rounded-2xl border border-slate-200/70 bg-gradient-to-b from-white to-brand-50/40 p-5 shadow-soft dark:border-slate-800 dark:from-slate-900 dark:to-slate-900">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
              <feature.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
            <p className="mt-3 rounded-xl bg-white/80 p-3 text-xs italic text-brand-700 shadow-sm dark:bg-slate-800/80 dark:text-brand-400">
              {feature.example}
            </p>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{feature.description}</p>
          </motion.div>)}
      </div>
    </section>;
}