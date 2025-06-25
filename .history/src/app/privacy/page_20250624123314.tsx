import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Punktual',
  description: 'How Punktual handles your data and protects your privacy',
};

export default function PrivacyPage() {
  const effectiveDate = "December 1, 2024";
  const lastUpdated = "December 1, 2024";

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
            Effective Date: {effectiveDate} | Last Updated: {lastUpdated}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8 space-y-8">
            
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Punktual is a web-based tool that helps you create calendar buttons for events. This privacy policy explains 
                what information we collect, how we use it, and your rights regarding your data.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Information We Collect</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Account Information</h3>
                  <p className="text-gray-700 leading-relaxed">
                    When you create an account, we collect your email address and name. If you sign up with Google, 
                    we also receive your Google profile picture. This information is stored securely in our database.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Events You Create</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We store the calendar events you create, including event titles, descriptions, dates, times, and locations. 
                    This allows you to view and edit your events later.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Usage Information</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We track how many calendar buttons you create each month to enforce the 5-event limit for free accounts.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Draft Storage</h3>
                  <p className="text-gray-700 leading-relaxed">
                    To preserve your work, we temporarily store event drafts in your browser`&rsquo;`s local storage for up to 24 hours. 
                    This data stays on your device and is automatically deleted.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Technical Information</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We automatically collect standard web information like IP addresses and browser types for security and performance purposes.
                  </p>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
              <div className="space-y-2">
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Provide the calendar button creation service</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Allow you to sign in and manage your account</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Track your monthly usage (5 events for free accounts)</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Store your events so you can access them later</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Maintain security and prevent abuse</span>
                </p>
              </div>
            </section>

            {/* Data Storage and Security */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Storage and Security</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Where Your Data is Stored</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Your account and event data is stored using Supabase, a secure database platform. All data is encrypted 
                    and protected with industry-standard security measures.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Who Can Access Your Data</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Only you can access your events and account information. We use Row Level Security to ensure your data 
                    is completely isolated from other users.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication</h3>
                  <p className="text-gray-700 leading-relaxed">
                    User authentication is handled securely through Supabase. If you use email/password, your password is 
                    securely hashed. If you use Google sign-in, authentication is handled by Google.
                  </p>
                </div>
              </div>
            </section>

            {/* Third Parties */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Supabase</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We use Supabase to store your account and event data. Supabase provides enterprise-grade security 
                    and is GDPR compliant.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Google (Optional)</h3>
                  <p className="text-gray-700 leading-relaxed">
                    If you choose to sign in with Google, we receive basic profile information according to Google`&rsquo;`s privacy policies. 
                    We may also use basic analytics to understand how our service is used.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar Services</h3>
                  <p className="text-gray-700 leading-relaxed">
                    When someone clicks your calendar button, the event information is sent directly to their chosen calendar 
                    (Google Calendar, Apple Calendar, Outlook, etc.). We don`&rsquo;`t track or store this interaction.
                  </p>
                </div>
              </div>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Sharing</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not sell or share your personal information with third parties, except in these limited situations:
              </p>
              <div className="space-y-2">
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>With service providers like Supabase who help us operate the service</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>When required by law or to protect our rights and safety</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>If we were to sell or transfer our business (users would be notified)</span>
                </p>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">You can:</p>
              <div className="space-y-2">
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>View and edit your account information and events</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Delete your account and all associated data at any time</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Export your event data</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Contact us with questions about your data</span>
                </p>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How Long We Keep Your Data</h2>
              <div className="space-y-2">
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Account and event data: Kept while your account is active</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>When you delete your account: All your data is permanently removed</span>
                </p>
                <p className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Local storage drafts: Automatically deleted after 24 hours</span>
                </p>
              </div>
            </section>

            {/* Children */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children`&rsquo;`s Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our service is not intended for children under 13. We do not knowingly collect information from children under 13. 
                If you believe we have collected information from a child under 13, please contact us so we can delete it.
              </p>
            </section>

            {/* Changes */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this privacy policy from time to time. If we make significant changes, we will notify users 
                via email or a prominent notice on our website.
              </p>
            </section>

            {/* Contact */}
            <section className="border-t border-gray-200 pt-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Questions?</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about this privacy policy or how we handle your data, please contact us through 
                our website or the contact information provided in our footer.
              </p>
            </section>

            {/* Footer */}
            <section className="border-t border-gray-200 pt-6 text-center">
              <p className="text-sm text-gray-500">
                This privacy policy is effective as of {effectiveDate} and applies to all users of Punktual.co
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}