import { Navbar } from '../components/ui/Navbar';
import { Target, Eye, TrendingUp, Users } from 'lucide-react';

export const About = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">About ForexSaarthi</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            Your trusted partner in navigating global trade and forex complexity
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-500/20 rounded-2xl mb-6">
                <Target className="w-8 h-8 text-blue-700 dark:text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                To empower businesses engaged in international trade with intelligent, compliant, and transparent forex management tools.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                We believe that managing foreign exchange exposure shouldn't be complicated or opaque. ForexSaarthi brings clarity, confidence, and control to every transaction.
              </p>
            </div>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-12 text-white">
              <blockquote className="text-xl leading-relaxed italic">
                "In a world of currency volatility, businesses need more than software—they need a strategic partner that understands compliance, risk, and execution."
              </blockquote>
              <p className="mt-6 font-medium text-gray-300">— ForexSaarthi Team</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 bg-white dark:bg-slate-800 rounded-2xl p-12 border border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-blue-700 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-lg text-gray-700 dark:text-gray-300">Global trade made transparent</p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-blue-700 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-lg text-gray-700 dark:text-gray-300">Compliance built into every workflow</p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-blue-700 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-lg text-gray-700 dark:text-gray-300">AI-powered insights for smarter decisions</p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-blue-700 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-lg text-gray-700 dark:text-gray-300">Trusted by finance teams worldwide</p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-500/20 rounded-2xl mb-6">
                <Eye className="w-8 h-8 text-blue-700 dark:text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Vision</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                To become the global standard for forex and trade management—where integrity, accuracy, and compliance are non-negotiable.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                We envision a future where every business, regardless of size, can trade internationally with confidence, backed by technology that never compromises on trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">The Problem We Solve</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              International trade exposes businesses to significant challenges
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Currency Volatility',
                description: 'Unpredictable exchange rate movements can erode margins overnight without proper hedging strategies.',
              },
              {
                title: 'Compliance Complexity',
                description: 'Regulatory requirements vary across jurisdictions, making audit preparation time-consuming and error-prone.',
              },
              {
                title: 'Manual Processes',
                description: 'Spreadsheet-based tracking leads to errors, missed opportunities, and lack of real-time visibility.',
              },
              {
                title: 'Limited Visibility',
                description: 'Without centralized systems, finance teams struggle to understand total exposure and risk positions.',
              },
            ].map((problem, index) => (
              <div
                key={index}
                className="p-6 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {problem.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Solution Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Solution</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Comprehensive platform designed for modern trade operations
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                icon: TrendingUp,
                title: 'Automated Exposure Tracking',
                description: 'Real-time visibility into forex positions across all currencies and contracts',
              },
              {
                icon: Target,
                title: 'Intelligent Risk Management',
                description: 'AI-powered recommendations for hedging strategies based on your risk profile',
              },
              {
                icon: Users,
                title: 'Audit-Ready Documentation',
                description: 'Regulatory-grade reporting that satisfies compliance requirements automatically',
              },
            ].map((solution, index) => (
              <div
                key={index}
                className="flex items-start space-x-6 p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md dark:hover:shadow-slate-900/50 transition-shadow duration-200"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <solution.icon className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {solution.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{solution.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Values</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Integrity',
                description: 'Every calculation, every report, every recommendation is built on absolute accuracy and transparency.',
              },
              {
                title: 'Compliance',
                description: 'Regulatory adherence is not optional—it\'s embedded in our DNA and every feature we build.',
              },
              {
                title: 'Trust',
                description: 'We earn trust by delivering consistent, reliable results that finance professionals can depend on.',
              },
            ].map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-700 dark:bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Experience the Difference?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join the businesses that trust ForexSaarthi for their international trade operations
          </p>
          <button className="px-8 py-4 text-lg font-medium text-slate-900 bg-white hover:bg-gray-100 rounded-lg transition-all duration-200 shadow-lg">
            Get in Touch
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2026 ForexSaarthi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
