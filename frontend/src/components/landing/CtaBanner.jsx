import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
export function CtaBanner() {
  return <section className="mx-auto max-w-7xl px-6 pb-20 sm:pb-28">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} whileInView={{
      opacity: 1,
      y: 0
    }} viewport={{
      once: true
    }} transition={{
      duration: 0.5
    }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-16 text-center shadow-glass sm:px-16">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-sunrise-400/20 blur-3xl" />
        <h2 className="relative text-3xl font-extrabold text-white sm:text-4xl">
          Ready to grow your farm business?
        </h2>
        <p className="relative mx-auto mt-3 max-w-xl text-brand-100">
          Join hundreds of farmers already earning more with FarmConnect.
        </p>
        <Link to="/register" className="relative mt-8 inline-block">
          <Button size="lg" variant="secondary">
            Create your free account <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </motion.div>
    </section>;
}