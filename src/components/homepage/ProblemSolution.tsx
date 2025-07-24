import React from "react";
import Link from 'next/link';
import { ArrowRight, ArrowDown } from "lucide-react";

export default function ProblemSolution() {
  const rows = [
    {
      problem: { icon: "❌", title: "Google only", desc: "Other platforms miss out" },
      solution: { icon: "🌍", title: "Every platform", desc: "Google, Apple, Outlook, Yahoo" },
    },
    {
      problem: { icon: "📋", title: "Manual event creation", desc: "And who has time for that?" },
      solution: { icon: "⚡", title: "One-click add", desc: "Just like that, it's saved to calendar" },
    },
    {
      problem: { icon: "👨‍💻", title: "Coding skills needed", desc: "To integrate dynamic buttons" },
      solution: { icon: "📄", title: "Paste & go", desc: "One snippet, no code" },
    },
    {
      problem: { icon: "🎨", title: "Generic styling", desc: "That does nothing for your brand" },
      solution: { icon: "✨", title: "Custom design", desc: "Your button, your brand" },
    },
  ];

  return (
    <section id="problem" className="py-6 bg-gradient-to-br from-emerald-950 to-emerald-800">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-center text-2xl font-bold mb-2 text-gray-100">
          Before Punktual vs After Punktual
        </h2>
        <h5 className="text-center text-lg text-gray-300 mb-8">
          One little button makes all the difference
        </h5>
        <div className="space-y-4">
          {rows.map((r, i) => (
            <div
              key={i}
              className="flex flex-col md:flex-row md:items-center md:justify-between md:space-x-6"
            >
              {/* problem */}
              <div className="flex justify-left space-x-2 bg-red-100 border border-red-200 p-4 rounded-xl flex-1">
                <span className="text-xl">{r.problem.icon}</span>
                <div>
                  <div className="text-base font-semibold">{r.problem.title}</div>
                  <div className="text-sm text-gray-700">{r.problem.desc}</div>
                </div>
              </div>

              {/* arrow */}
              <div className="flex justify-center items-center my-1 md:my-0">
                <ArrowDown className="w-4 h-4 text-gray-400 md:hidden" />
                <ArrowRight className="hidden md:block w-4 h-4 text-zinc-100" />
              </div>

              {/* solution */}
              <div className="flex items-start space-x-2 bg-emerald-100 border border-emerald-300 p-4 rounded-xl flex-1">
                <span className="text-xl">{r.solution.icon}</span>
                <div>
                  <div className="text-base font-semibold">{r.solution.title}</div>
                  <div className="text-sm text-gray-700">{r.solution.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link 
            href="/create"
            className="
              inline-flex items-center px-5 py-2 text-sm font-semibold rounded-lg
              bg-emerald-500 text-white 
              border-2 border-transparent 
              hover:bg-emerald-400
              transition-colors duration-200"
          >
            Create your first event 
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}