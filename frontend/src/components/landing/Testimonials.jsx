import { motion } from "framer-motion";
import { Star } from "lucide-react";
const TESTIMONIALS = [{
  quote: "Since joining FarmConnect, I sell directly to three apartment communities. My profits are up nearly 35% and I get paid the same week.",
  name: "Ramesh Patil",
  role: "Organic Farmer, Pune",
  avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
}, {
  quote: "The AI demand predictions helped me plan my planting for the whole season. I wasted far less produce this year.",
  name: "Lakshmi Devi",
  role: "Farmer, Leafy Greens",
  avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
}, {
  quote: "Our residents love the weekly vegetable basket — it's fresher and cheaper than the local market, and delivery is always on time.",
  name: "Green Meadows Apartments",
  role: "Apartment Community, Pune",
  avatar: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=150&q=80"
}, {
  quote: "Bulk ordering and scheduled deliveries make sourcing produce for our kitchen effortless. Quality has been consistently excellent.",
  name: "Spice Route Restaurant",
  role: "Restaurant Partner, Pune",
  avatar: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=150&q=80"
}];
export function Testimonials() {
  return <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
          Testimonials
        </span>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Loved by farmers and buyers alike
        </h2>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2">
        {TESTIMONIALS.map((t, i) => <motion.div key={t.name} initial={{
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
        delay: i % 2 * 0.1
      }} className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="flex gap-1 text-sunrise-500">
              {Array.from({
            length: 5
          }).map((_, idx) => <Star key={idx} className="h-4 w-4 fill-current" />)}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">&ldquo;{t.quote}&rdquo;</p>
            <div className="mt-5 flex items-center gap-3">
              <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
              </div>
            </div>
          </motion.div>)}
      </div>
    </section>;
}