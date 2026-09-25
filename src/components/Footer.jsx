import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";
import {
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Heart,
  ArrowUp,
} from "lucide-react";

const SocialIcon = ({ d }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d={d} />
  </svg>
);

const SOCIAL = [
  {
    label: "Facebook",
    href: "#",
    d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
  },
  {
    label: "Twitter / X",
    href: "#",
    d: "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z",
  },
  {
    label: "YouTube",
    href: "#",
    d: "M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z",
  },
  {
    label: "Instagram",
    href: "#",
    d: "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z",
  },
];

const PLATFORM_LINKS = [
  { name: "Home", path: "/" },
  { name: "Government Schemes", path: "/schemes" },
  { name: "Report a Complaint", path: "/complaints" },
  { name: "Development Projects", path: "/projects" },
  { name: "Track Complaint", path: "/track" },
];

const RESOURCES_LINKS = [
  { name: "Ward Directory", path: "/directory" },
  { name: "Announcements", path: "/announcements" },
  { name: "Community Activity", path: "/activity" },
  { name: "Development Gallery", path: "/gallery" },
  { name: "Admin Panel", path: "/admin/login" },
];

const BESCOM_CONTACTS = [
  { label: "Control Room", number: "1912" },
  { label: "Service Station", number: "9449844691" },
  { label: "EE - Siddaraju T", number: "O&M 1" },
  { label: "AEE C1 - Srinivas", number: "O&M 1" },
  { label: "AE - Bharathi", number: "O&M 1" },
  { label: "JE - Umashankar", number: "O&M 1" },
  { label: "JE - Manjula", number: "O&M 1" },
  { label: "AE - Parinita", number: "O&M 3" },
  { label: "JE - Guru Prasad", number: "O&M 3" },
  { label: "JE - Ashoka", number: "O&M 3" },
];

const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-400 overflow-hidden">
      {/* Decorative top border */}
      <div className="h-1 w-full bg-gradient-to-r from-primary via-orange-500 to-primary" />

      {/* Decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-[60px] rounded-full pointer-events-none" />

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* ── Brand Column (spans 2 on lg) ── */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                <img
                  src={logo}
                  alt="Bengaluru Civic Connect Logo"
                  className="h-7 w-auto object-contain brightness-0 invert"
                />
              </div>
              <div>
                <h3 className="text-white text-lg font-extrabold tracking-tight leading-tight">
                  Bengaluru Civic
                </h3>
                <p className="text-[11px] text-amber-400 font-bold uppercase tracking-[0.2em]">
                  BBMP WARDS
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              Empowering citizens through digital development, transparent
              governance, and direct participation in Bengaluru Municipal Wards.
              Bridge the gap between your ward and the government.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 pt-1">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 hover:-translate-y-0.5"
                >
                  <SocialIcon d={s.d} />
                </a>
              ))}
            </div>

            {/* Contact Info */}
            <div className="space-y-2.5 pt-2 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin size={15} className="text-amber-400 shrink-0 mt-0.5" />
                <span>BBMP Headquarters, NR Square, Bengaluru, Karnataka</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={15} className="text-amber-400 shrink-0" />
                <a
                  href="tel:+918022660000"
                  className="hover:text-white transition-colors"
                >
                  +91 80 2266 0000
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={15} className="text-amber-400 shrink-0" />
                <a
                  href="mailto:bbmp.wards@gmail.com"
                  className="hover:text-white transition-colors"
                >
                  bbmp.wards@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* ── Platform Links ── */}
          <div>
            <h4 className="text-white font-bold text-sm mb-5 uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-3">
              {PLATFORM_LINKS.map((l) => (
                <li key={l.path}>
                  <Link
                    to={l.path}
                    className="text-sm hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-primary transition-colors" />
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Resources Links ── */}
          <div>
            <h4 className="text-white font-bold text-sm mb-5 uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-3">
              {RESOURCES_LINKS.map((l) => (
                <li key={l.path}>
                  <Link
                    to={l.path}
                    className="text-sm hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-primary transition-colors" />
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── BESCOM & Official Contacts ── */}
          <div className="lg:col-span-2 text-xs">
            <h4 className="text-white font-bold text-sm mb-5 uppercase tracking-wider">
              BESCOM Contacts • BBMP Wards
            </h4>
            <div className="grid grid-cols-2 gap-2.5 bg-white/[0.02] p-3 rounded-xl border border-white/5">
              {BESCOM_CONTACTS.map((e) => (
                <div
                  key={e.label}
                  className="col-span-1 flex flex-col group p-2 hover:bg-white/5 rounded transition-colors"
                >
                  <span className="font-medium text-slate-500 group-hover:text-slate-300 transition-colors">
                    {e.label}
                  </span>
                  <a
                    href={`tel:${e.number.replace(/\s|\//g, "")}`}
                    className="font-bold text-orange-400 group-hover:text-orange-300 transition-colors mt-0.5"
                    onClick={(e) => {
                      if (Number.isNaN(Number(e.currentTarget.innerText)))
                        e.preventDefault();
                    }}
                  >
                    {e.number}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="border-t border-white/5 mt-14 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600 text-center sm:text-left">
              © {new Date().getFullYear()} Official Civic Platform · Bengaluru
              Municipal Wards · All rights reserved.
            </p>

            <div className="flex items-center gap-6">
              <span className="text-xs text-slate-600 flex items-center gap-1">
                Built with{" "}
                <Heart size={11} className="text-red-500 fill-red-500" /> for
                the citizens
              </span>

              {/* Back to top */}
              <button
                onClick={scrollToTop}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 hover:-translate-y-1"
                aria-label="Back to top"
              >
                <ArrowUp size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
