import Link from 'next/link';

export default function CTA() {
  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
          Ready to stop losing attendees?
        </h2>
        <p className="text-lg text-blue-100 mb-6 leading-relaxed">
          Join hundreds of marketers who've already made forgetting impossible.
          <br />
          <span className="font-semibold">Start free • 5 buttons included • No credit card required</span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/create"
            className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-lg transform hover:scale-105"
          >
            Create Your First Button
          </Link>
          <Link
            href="/contact"
            className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors"
          >
            Talk to Founder
          </Link>
        </div>
      </div>
    </section>
  );
}