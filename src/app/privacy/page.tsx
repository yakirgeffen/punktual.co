import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Punktual',
  description: 'How Punktual handles your data and protects your privacy',
};

export default function PrivacyPage() {
  const effectiveDate = "June 1, 2025";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600 mb-2">
            How we handle your data and protect your privacy
          </p>
          <p className="text-sm text-gray-500">
            Effective Date: {effectiveDate}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8 space-y-8">
            
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Punktual is a web-based tool that helps you create calendar buttons for events. This privacy policy explains 
                what information we collect and how we use it.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Account Information</h3>
                  <p className="text-gray-700 leading-relaxed">
                    When you create an account, we collect your email address and name. If you sign up with Google, 
                    we also receive your Google profile information.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Event Data</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We store the calendar events you create, including titles, descriptions, dates, times, and locations.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Usage Data</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We track how many events you create to enforce plan limits. We may also collect basic analytics 
                    about how our service is used.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Technical Data</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We automatically collect standard web information like IP addresses and browser information for 
                    security and performance purposes.
                  </p>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
              <div className="space-y-2">
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>Provide the calendar button creation service</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>Manage your account and authenticate access</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>Enforce usage limits and plan restrictions</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>Improve our service and maintain security</span>
                </p>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We use secure, encrypted connections and access controls to protect your data. Only you can access 
                your account and events. We work with trusted service providers to store and process your information securely.
              </p>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Sharing</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not sell your personal information. We only share data:
              </p>
              <div className="space-y-2">
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>With service providers who help us operate Punktual</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>When required by law or to protect our rights</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>If we transfer our business (you will be notified)</span>
                </p>
              </div>
            </section>

            {/* Your Choices */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Choices</h2>
              <div className="space-y-2">
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>Access and edit your account information</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>Delete events you have created</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>Stop using our service at any time</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>Contact us about your data or to delete your account</span>
                </p>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We keep your data while your account is active. If you want to delete your account and data, 
                contact us. Event drafts stored in your browser are automatically deleted after 24 hours.
              </p>
            </section>

            {/* Children */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our service is not for children under 16. If you believe we have collected information from someone 
                under 16, please contact us so we can delete it.
              </p>
            </section>

            {/* Changes */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Policy Changes</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this policy. If we make significant changes, we will notify you via email or our website.
              </p>
            </section>

            {/* Contact */}
            <section className="border-t border-gray-200 pt-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                Questions about this privacy policy? Email us at{' '}
                <a href="mailto:hello@punktual.co" className="text-emerald-600 hover:text-emerald-700 underline">
                  hello@punktual.co
                </a>
              </p>
            </section>

            {/* Footer */}
            <section className="border-t border-gray-200 pt-6 text-center">
              <p className="text-sm text-gray-500">
                This privacy policy is effective as of {effectiveDate}
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}