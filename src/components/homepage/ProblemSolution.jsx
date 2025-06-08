import { ArrowRight } from 'lucide-react';

export default function ProblemSolution() {
  const comparisons = [
    {
      problem: { icon: "❌", title: "Google only", desc: "iPhone users left out" },
      solution: { icon: "🌍", title: "Every platform", desc: "Google, Apple, Outlook, Office 365, Yahoo" }
    },
    {
      problem: { icon: "📋", title: "Copy-paste hell", desc: "\"Please add June 15th...\"" },
      solution: { icon: "⚡", title: "One-click add", desc: "Click → appears in calendar" }
    },
    {
      problem: { icon: "👨‍💻", title: "Need developer", desc: "Code required for buttons" },
      solution: { icon: "📄", title: "Copy & paste", desc: "No coding whatsoever" }
    },
    {
      problem: { icon: "🎨", title: "Ugly styling", desc: "Looks like 2005" },
      solution: { icon: "✨", title: "Brand matching", desc: "Professional & custom" }
    }
  ];

  return (
    <section id="problem" className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Why calendar buttons <span className="text-red-500">suck</span> (and how we fixed it)
          </h2>
          <p className="text-lg text-gray-600">Most solutions are broken by design. We built something that actually works.</p>
        </div>
        
        {/* Horizontal comparison grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {comparisons.map((item, i) => (
            <div key={i} className="space-y-4">
              {/* Problem */}
              <div className="bg-red-50 border-2 border-red-200 p-4 rounded-xl">
                <div className="text-center">
                  <div className="text-2xl mb-2">{item.problem.icon}</div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{item.problem.title}</h3>
                  <p className="text-gray-600 text-xs">{item.problem.desc}</p>
                </div>
              </div>
              
              {/* Arrow */}
              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              
              {/* Solution */}
              <div className="bg-green-50 border-2 border-green-200 p-4 rounded-xl">
                <div className="text-center">
                  <div className="text-2xl mb-2">{item.solution.icon}</div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{item.solution.title}</h3>
                  <p className="text-gray-600 text-xs">{item.solution.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}