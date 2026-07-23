import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const {
    showToast
  } = useToast();
  const handleSubmit = e => {
    e.preventDefault();
    showToast({
      variant: "success",
      title: "Message sent",
      description: "Thanks for reaching out — our team will get back to you shortly."
    });
    setName("");
    setEmail("");
    setMessage("");
  };
  return <section id="contact" className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      <div className="grid gap-12 lg:grid-cols-2">
        <motion.div initial={{
        opacity: 0,
        x: -20
      }} whileInView={{
        opacity: 1,
        x: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.5
      }}>
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
            Contact
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Let&apos;s talk
          </h2>
          <p className="mt-4 max-w-md text-slate-600 dark:text-slate-300">
            Whether you're a farmer, an apartment community, or a restaurant — we'd love to help you
            get started on FarmConnect.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <Mail className="h-4 w-4" />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-300">hello@farmconnect.ai</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <Phone className="h-4 w-4" />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-300">+91 98765 00000</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <MapPin className="h-4 w-4" />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-300">Pune, Maharashtra, India</span>
            </div>
          </div>
        </motion.div>

        <motion.form initial={{
        opacity: 0,
        x: 20
      }} whileInView={{
        opacity: 1,
        x: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.5
      }} onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <Input label="Name" required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          <Input label="Email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          <Textarea label="Message" required value={message} onChange={e => setMessage(e.target.value)} placeholder="How can we help?" />
          <Button type="submit" className="w-full">
            Send message <Send className="h-4 w-4" />
          </Button>
        </motion.form>
      </div>
    </section>;
}