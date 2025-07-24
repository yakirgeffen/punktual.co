import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Punktual',
  description: 'Learn about Punktual and our mission to simplify calendar integration',
};

export default function AboutPage() {
  return (
    <div className="min-h-auto bg-zinc-50 py-12 ">
      <div className="max-w-3xl mx-auto px-4 lg:px-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Punktual</h1>
          <p className="text-xl text-gray-600 mb-8">
            Making calendar integration simple for everyone
          </p>
          <div className="bg-white rounded-lg shadow p-8 text-left">
            <p className="text-gray-600 text-center mb-4">  
              Ever noticed how often you have to remind people about events?
            </p>
            <p className="text-gray-600 text-center mb-4">
              So did we. That&apos;s why we built Punktual.co.
            </p>  
            <p className="text-gray-600 text-center mb-4">  
              We provide a seamless way to add events to any calendar platform, whether it’s Google, Apple, Outlook, or others.
              Our mission is to eliminate the hassle of manual event creation and coding skills required for dynamic buttons.
              With Punktual, you can create beautiful, custom-styled calendar buttons that work across all platforms with just a few clicks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}