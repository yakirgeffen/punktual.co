import { Globe, Zap, Palette, Copy, Eye, TrendingUp } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: "All Platforms",
      desc: "Google, Apple, Outlook, Office 365, Yahoo",
      color: "bg-emerald-500"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "30 Seconds",
      desc: "From idea to working button",
      color: "bg-emerald-500"
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Brand Match",
      desc: "Custom colors and styling",
      color: "bg-emerald-500"
    },
    {
      icon: <Copy className="w-6 h-6" />,
      title: "Copy & Paste",
      desc: "No developers needed",
      color: "bg-emerald-500"
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Live Preview",
      desc: "See it before you use it",
      color: "bg-emerald-500"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Analytics",
      desc: "Track clicks and conversions",
      color: "bg-emerald-500"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything you need, nothing you don't.</h2>
          <p className="text-lg text-gray-600">Professional calendar integration made simple</p>
        </div>
        
        {/* Horizontal features strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="text-center group hover:scale-105 transition-transform">
              <div className={`${feature.color} w-14 h-14 rounded-xl flex items-center justify-center text-white mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-sm">{feature.title}</h3>
              <p className="text-gray-600 text-xs leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}