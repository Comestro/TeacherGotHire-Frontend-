import { Link } from "react-router-dom";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-slate-300 font-outfit">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <img
                src="/logo-portal.png"
                alt="PTP Institute"
                className="h-10 w-auto object-contain brightness-0 invert opacity-90"
              />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              India's premier platform connecting qualified educators with top institutions. Bridging the gap between talent and opportunity.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-widest uppercase mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Home", to: "/" },
                { label: "Find Tutors", to: "/get-preferred-teacher" },
                { label: "For Teachers", to: "/signup/teacher" },
                { label: "For Recruiters", to: "/signup/recruiter" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-widest uppercase mb-5">
              Legal
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Terms of Use", to: "/" },
                { label: "Privacy Policy", to: "/" },
                { label: "Accessibility", to: "/" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-widest uppercase mb-5">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <FiMail className="w-4 h-4 text-slate-500 shrink-0" />
                info@ptpinstitute.com
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <FiPhone className="w-4 h-4 text-slate-500 shrink-0" />
                +91 98765 43210
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <FiMapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                Bihar, India
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} PTP Institute. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">
            Teacher & Recruiter Portal
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;