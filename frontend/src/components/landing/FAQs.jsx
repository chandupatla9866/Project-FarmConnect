import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
const FAQS = [{
  question: "How does FarmConnect make money if it isn't buying or selling produce?",
  answer: "FarmConnect is a technology platform, not a trader. We connect farmers and buyers directly and manage listings, orders, logistics and payments — farmers and buyers transact directly through the platform."
}, {
  question: "How do farmers get paid?",
  answer: "Once an order is delivered, payment is transferred to the farmer through the platform, tracked transparently in their earnings dashboard."
}, {
  question: "Can restaurants place recurring bulk orders?",
  answer: "Yes. Restaurants can set up scheduled and bulk orders, and review monthly purchase reports from their dashboard."
}, {
  question: "How accurate are the AI predictions?",
  answer: "Our models combine historical order data, seasonality and regional trends to guide decisions. They're designed as a helpful signal, not a guarantee — farmers always make the final call."
}, {
  question: "Is my data secure?",
  answer: "Yes. Authentication uses industry-standard OAuth2 and JWT, and role-based access ensures each user only sees what's relevant to them."
}];
export function FAQs() {
  const [openIndex, setOpenIndex] = useState(0);
  return <section id="faqs" className="bg-slate-50 py-20 sm:py-28 dark:bg-slate-900/40">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
            FAQs
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Frequently asked questions
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {FAQS.map((faq, i) => {
          const isOpen = openIndex === i;
          return <div key={faq.question} className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
                <button onClick={() => setOpenIndex(isOpen ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{faq.question}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && <motion.div initial={{
                height: 0,
                opacity: 0
              }} animate={{
                height: "auto",
                opacity: 1
              }} exit={{
                height: 0,
                opacity: 0
              }} transition={{
                duration: 0.2
              }} className="overflow-hidden">
                      <p className="px-5 pb-4 text-sm text-slate-500 dark:text-slate-400">{faq.answer}</p>
                    </motion.div>}
                </AnimatePresence>
              </div>;
        })}
        </div>
      </div>
    </section>;
}