import { Link } from 'react-router-dom';

export const PublicBigLogoFooter = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-4 flex-wrap">
              <img
                src="/ForexSaarthi Logo Transparent.png"
                alt="ForexSaarthi"
                className="h-16 w-auto object-contain"
              />
              <span className="hidden sm:block h-8 w-px bg-slate-700" />
              <a
                href="https://rkitsoftware-saarthiinsights.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center opacity-90 hover:opacity-100 transition-opacity"
                aria-label="Open Saarthi Insights"
              >
                <img
                  src="/logo.png"
                  alt="Saarthi Insights"
                  className="h-14 w-auto object-contain"
                />
              </a>
            </div>

            <p className="mt-5 text-slate-400 text-sm leading-relaxed max-w-md">
              Smart forex and trade management for growing global businesses. Built for teams that value speed, compliance, and clarity.
            </p>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-white text-sm font-semibold tracking-wide uppercase">Quick Links</h3>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <Link to="/home" className="text-slate-400 hover:text-white transition-colors">Home</Link>
              <Link to="/about" className="text-slate-400 hover:text-white transition-colors">About</Link>
              <Link to="/contact" className="text-slate-400 hover:text-white transition-colors">Contact</Link>
              <span className="text-slate-500">Privacy</span>
            </div>
          </div>

          <div className="lg:col-span-4 lg:justify-self-end w-full">
            <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-900/40">
              <div className="px-4 py-3 border-b border-slate-700">
                <p className="text-sm font-medium text-slate-200">Our Location</p>
              </div>
              <iframe
                title="ForexSaarthi Location Map"
                src="https://maps.google.com/maps?q=Rajkot%2C%20Gujarat&z=12&output=embed"
                className="w-full h-48"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-slate-400 text-sm">© 2026 All rights reserved.</p>
          <p className="text-slate-400 text-sm">Made by Nisharg Soni</p>
        </div>
      </div>
    </footer>
  );
};