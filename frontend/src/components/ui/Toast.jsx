import { createContext, useCallback, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { clsx } from "clsx";
const ToastContext = createContext(undefined);
const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
};
const ICON_COLOR = {
  success: "text-emerald-500",
  error: "text-red-500",
  warning: "text-amber-500",
  info: "text-sky-500"
};
let idCounter = 0;
export function ToastProvider({
  children
}) {
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback(toast => {
    const id = ++idCounter;
    setToasts(prev => [...prev, {
      ...toast,
      id
    }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);
  const dismiss = id => setToasts(prev => prev.filter(t => t.id !== id));
  return <ToastContext.Provider value={{
    showToast
  }}>
      {children}
      {createPortal(<div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
          <AnimatePresence>
            {toasts.map(toast => {
          const Icon = ICONS[toast.variant];
          return <motion.div key={toast.id} initial={{
            opacity: 0,
            y: 12,
            scale: 0.95
          }} animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }} exit={{
            opacity: 0,
            x: 40
          }} className="pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-soft-lg dark:border-slate-700 dark:bg-slate-900">
                  <Icon className={clsx("mt-0.5 h-5 w-5 shrink-0", ICON_COLOR[toast.variant])} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{toast.title}</p>
                    {toast.description && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{toast.description}</p>}
                  </div>
                  <button onClick={() => dismiss(toast.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>;
        })}
          </AnimatePresence>
        </div>, document.body)}
    </ToastContext.Provider>;
}
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}