import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Punktual',
  description: 'Terms and conditions for using Punktual',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-600">
            Terms and conditions for using Punktual
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-8 text-left">
          <p className="text-gray-600 mb-4">
            Our complete terms of service are being finalized and will be published soon.
          </p>
          <p className="text-gray-600">
            In the meantime, please use Punktual responsibly and in accordance with 
            generally accepted online practices.
          </p>
        </div>
      </div>
    </div>
  );
}