import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Punktual',
  description: 'Terms and conditions for using Punktual',
};

export default function TermsPage() {
  const effectiveDate = "December 1, 2024";
  const lastUpdated = "December 1, 2024";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-600 mb-2">
            Terms and conditions for using Punktual
          </p>
          <p className="text-sm text-gray-500">
            Effective Date: {effectiveDate} | Last Updated: {lastUpdated}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8 space-y-8">
            
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Agreement</h2>
              <p className="text-gray-700 leading-relaxed">
                By using Punktual, you agree to these terms. If you don't agree, please don't use our service.
                Punktual is a tool for creating calendar buttons and links for events.
              </p>
            </section>

            {/* Service Description */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Service</h2>
              <p className="text-gray-700 leading-relaxed">
                Punktual helps you create calendar buttons and links that work with different calendar platforms. 
                We provide tools to generate code you can use on websites and in emails. We offer both free and paid plans.
              </p>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Account</h2>
              <div className="space-y-2">
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>You're responsible for keeping your account secure</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>You must provide accurate information when signing up</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>One person per account - no sharing accounts</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>You're responsible for all activity under your account</span>
                </p>
              </div>
            </section>

            {/* Acceptable Use */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptable Use</h2>
              <p className="text-gray-700 leading-relaxed mb-4">You may not use Punktual to:</p>
              <div className="space-y-2">
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>Create spam or send unsolicited emails</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>Promote illegal activities or violate laws</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>Attempt to hack, overload, or disrupt our service</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>Share harmful, offensive, or inappropriate content</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>Violate others' intellectual property rights</span>
                </p>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Our Content</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Punktual owns the website, software, and service. You can use our service according to these terms, 
                    but you can't copy, modify, or resell our platform.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your Content</h3>
                  <p className="text-gray-700 leading-relaxed">
                    You own the events and information you create. We only store and process it to provide our service. 
                    The calendar code we generate for you is yours to use freely.
                  </p>
                </div>
              </div>
            </section>

            {/* Payment Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Payment and Plans</h2>
              <div className="space-y-2">
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>Free plans have usage limits (5 events per month)</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>Paid plans are billed in advance</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>We may change pricing with 30 days notice</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>Refunds are handled case-by-case - contact us</span>
                </p>
              </div>
            </section>

            {/* Service Availability */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Availability</h2>
              <p className="text-gray-700 leading-relaxed">
                We try to keep Punktual running smoothly, but we can't guarantee 100% uptime. We may need to temporarily 
                shut down for maintenance or updates. We're not responsible if the service is temporarily unavailable.
              </p>
            </section>

            {/* Disclaimers */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Disclaimers</h2>
              <p className="text-gray-700 leading-relaxed">
                Punktual is provided "as is." We make no warranties about the service being error-free, secure, or 
                meeting your specific needs. You use our service at your own risk. We're not responsible for any 
                problems with calendar integrations or third-party services.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                Our liability to you is limited to the amount you've paid us in the last 12 months. We're not liable 
                for any indirect, incidental, or consequential damages, even if we knew they were possible.
              </p>
            </section>

            {/* Account Termination */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Account Termination</h2>
              <div className="space-y-2">
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>You can stop using Punktual and delete your account anytime</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>We can suspend or terminate accounts that violate these terms</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>Upon termination, you lose access to your account and data</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>Previously generated calendar code will continue to work</span>
                </p>
              </div>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to These Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update these terms from time to time. If we make significant changes, we'll notify you via 
                email or a notice on our website. Continuing to use Punktual after changes means you accept the new terms.
              </p>
            </section>

            {/* General */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">General</h2>
              <p className="text-gray-700 leading-relaxed">
                If any part of these terms is found unenforceable, the rest still applies. Our failure to enforce 
                any term doesn't waive our right to enforce it later. These terms are the complete agreement between us.
              </p>
            </section>

            {/* Contact */}
            <section className="border-t border-gray-200 pt-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Questions?</h2>
              <p className="text-gray-700 leading-relaxed">
                Questions about these terms? Contact us at{' '}
                <a href="mailto:hello@punktual.co" className="text-emerald-600 hover:text-emerald-700 underline">
                  hello@punktual.co
                </a>
              </p>
            </section>

            {/* Footer */}
            <section className="border-t border-gray-200 pt-6 text-center">
              <p className="text-sm text-gray-500">
                These terms are effective as of {effectiveDate}
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}