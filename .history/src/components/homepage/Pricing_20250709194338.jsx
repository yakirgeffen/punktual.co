import { Check } from 'lucide-react';
import Link from 'next/link';

export default function Pricing() {
  const freeFeatures = [
    "5 calendar buttons per month",
    "All calendar platforms",
    "Basic customization",
    "Copy-paste HTML code",
    "Community support"
  ];

  const proFeatures = [
    "Unlimited calendar buttons",
    "Custom branding & styling",
    "Click analytics & insights",
    "Priority email support",
    "Advanced customization",
  ];

  return (
    <section id="pricing" className="py-16 bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Simple pricing</h2>
          <p className="text-lg text-gray-600">Start free, upgrade when you're ready to scale</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 relative">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
              <p className="text-gray-600">Perfect for getting started</p>
            </div>
            
            <ul className="space-y-3 mb-6">
              {freeFeatures.map((feature, i) => (
                <li key={i} className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Link
              href="/create"
              className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-center block"
            >
              Start Free Today
            </Link>
          </div>
          
          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-400 rounded-2xl p-6 relative text-white transform shadow-xl">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-xs font-bold">
                Most Popular
              </span>
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-2">$15</div>
              <p className="text-emerald-100">Everything you need to scale</p>
            </div>
            
            <ul className="space-y-3 mb-6">
              {proFeatures.map((feature, i) => (
                <li key={i} className="flex items-center">
                  <Check className="h-4 w-4 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Link
              href="/create"
              className="w-full bg-white text-emerald-500 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-center block"
            >
              Start 14-Day Free Trial
            </Link>
          </div>
        </div>
        
      </div>
    </section>
  );
}