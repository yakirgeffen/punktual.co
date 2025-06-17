import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Punktual',
  description: 'How Punktual handles your data and privacy',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600">
            How we handle your data and protect your privacy
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-8 text-left">
          <p className="text-gray-600 mb-4">
            At Punktual, we take your privacy seriously. Our detailed privacy policy is being finalized 
            and will be available soon.
          </p>
          <p className="text-gray-600">
            Key points about our privacy practices:
          </p>
          <ul className="mt-4 text-gray-600 space-y-2">
            <li>• We only collect data necessary for providing our service</li>
            <li>• We never sell your personal information</li>
            <li>• All data is securely encrypted</li>
            <li>• You have full control over your data</li>
          </ul>
        </div>
      </div>
    </div>
  );
}