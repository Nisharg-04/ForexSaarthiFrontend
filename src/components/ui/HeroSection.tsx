import { ArrowRight, Play, Ship, Plane } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="relative mt-16 min-h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 pt-14 pb-12 md:pt-16 md:pb-16">
      <div className="absolute inset-0 bg-slate-950">
        <img
          src="/hero.png"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-top"
        />
      </div>
      <div className="absolute inset-0 bg-slate-900/30 dark:bg-slate-950/45" />

      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
        <div className="absolute left-[8%] top-[28%] animate-float rounded-full border border-white/20 bg-white/10 px-5 py-3 text-4xl font-bold text-emerald-200/90 shadow-lg backdrop-blur-[1px]">
          ₹
        </div>
        <div className="absolute right-[9%] top-[34%] animate-float-delayed rounded-full border border-white/20 bg-white/10 px-5 py-3 text-4xl font-bold text-cyan-200/90 shadow-lg backdrop-blur-[1px]">
          $
        </div>
        <div className="absolute left-[16%] bottom-[16%] animate-float-gentle rounded-full border border-white/20 bg-white/10 px-5 py-3 text-4xl font-bold text-blue-200/90 shadow-lg backdrop-blur-[1px]">
          €
        </div>
        <div className="absolute right-[15%] bottom-[20%] animate-float rounded-full border border-white/20 bg-white/10 px-5 py-3 text-4xl font-bold text-slate-200/90 shadow-lg backdrop-blur-[1px]">
          £
        </div>
        <div className="absolute left-[45%] bottom-[8%] animate-float-delayed rounded-full border border-white/20 bg-white/10 px-5 py-3 text-4xl font-bold text-teal-200/90 shadow-lg backdrop-blur-[1px]">
          ¥
        </div>

        <div className="absolute left-[6%] top-[14%] animate-float text-cyan-100/70">
          <Ship className="h-12 w-12" />
        </div>
        <div className="absolute right-[8%] top-[12%] animate-float-delayed text-blue-100/70">
          <Plane className="h-12 w-12" />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        <div className="hero-content-reveal w-full max-w-5xl rounded-2xl border border-white/20 bg-slate-900/38 px-5 py-8 shadow-2xl backdrop-blur-[2px] sm:px-8 sm:py-10 lg:py-14 dark:bg-slate-900/52">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
              Built for Import Export Teams
            </span>
          </div>

          <h1 className="text-5xl font-bold leading-[1.05] text-white sm:text-6xl lg:text-7xl xl:text-8xl">
            Trade Globally.
            <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-blue-300 to-emerald-300 bg-clip-text text-transparent">
              Settle Confidently.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-4xl text-base leading-relaxed text-slate-200/95 sm:text-lg lg:text-xl">
            Track contracts, shipments, forex exposure, and settlements in one place.
            ForexSaarthi gives importers and exporters clear visibility and faster decisions.
          </p>

          <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <button className="group inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-teal-500">
              Start Free Trial
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/15">
              <Play className="h-4 w-4" />
              Watch Platform Walkthrough
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;