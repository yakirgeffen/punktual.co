import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - Punktual',
  description: 'Get in touch with the Punktual team',
};

export default function ContactPage() {
  return (
    <div className="min-h-auto bg-zinc-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 mb-8">
            Have questions? We would love to hear from you.
          </p>
          <div className="bg-white rounded-lg shadow p-8">
            <p className="text-gray-600 mb-4">
              Contact form coming soon! For now, reach out to us at:
            </p>
            <p className="text-lg font-medium text-emerald-600">
              hello@punktual.co
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}