import Link from 'next/link';

export default function CTA() {
  return (
    <section className="py-16 bg-gradient-to-r from-emerald-800 to-emerald-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <h2 className="text-3xl lg:text-4xl font-bold text-emerald-200 mb-4">
          Ready to become unforgettable?
        </h2>
        <p className="text-lg text-white mb-6 leading-relaxed">
          Join the marketers who&apos;ve decided to make forgetting impossible.
          <br />
          <span className="font-semibold text-white">Start free • 5 buttons included • No credit card required</span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/create"
            className="bg-white text-emerald-500 px-8 py-3 rounded-xl font-medium transition-colors shadow-md"
          >
            Create an event now!
          </Link>
        </div>
      </div>
    </section>
  );
}