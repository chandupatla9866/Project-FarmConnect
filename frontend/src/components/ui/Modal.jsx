import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg"
}) {
  return createPortal(<AnimatePresence>
      {open && <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{
        opacity: 0,
        scale: 0.96,
        y: 12
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: 0.96,
        y: 12
      }} transition={{
        duration: 0.18
      }} className={`relative z-10 w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-glass dark:bg-slate-900`}>
            <div className="mb-4 flex items-center justify-between">
              {title && <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>}
              <button onClick={onClose} className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>}
    </AnimatePresence>, document.body);
}