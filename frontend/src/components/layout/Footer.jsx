import { Link } from "react-router-dom";
import { Leaf, Mail, MapPin, Phone } from "lucide-react";
const FOOTER_LINKS = {
  Platform: [{
    label: "About",
    href: "/#about"
  }, {
    label: "Features",
    href: "/#features"
  }, {
    label: "How It Works",
    href: "/#how-it-works"
  }, {
    label: "AI Features",
    href: "/#ai-features"
  }],
  Company: [{
    label: "Contact",
    href: "/#contact"
  }, {
    label: "FAQs",
    href: "/#faqs"
  }],
  "Get Started": [{
    label: "Farmer Login",
    href: "/login"
  }, {
    label: "Create Account",
    href: "/register"
  }]
};
export function Footer() {
  return <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
                <Leaf className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">FarmConnect</span>
            </Link>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              AI-powered farm-to-community &amp; restaurant platform connecting farmers directly with
              buyers.
            </p>
            <div className="mt-4 space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" /> hello@farmconnect.ai
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" /> +91 98765 00000
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> Pune, Maharashtra, India
              </div>
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([heading, links]) => <div key={heading}>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{heading}</h4>
              <ul className="mt-3 space-y-2">
                {links.map(link => <li key={link.label}>
                    <a href={link.href} className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">
                      {link.label}
                    </a>
                  </li>)}
              </ul>
            </div>)}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs text-slate-400 sm:flex-row dark:border-slate-800">
          <p>&copy; {new Date().getFullYear()} FarmConnect. Final-year engineering project.</p>
          <p>Built with Spring Boot, React &amp; FastAPI.</p>
        </div>
      </div>
    </footer>;
}