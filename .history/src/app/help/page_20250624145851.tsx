'use client';

import { useState } from 'react';
import { Search, Mail } from 'lucide-react';
import type { Metadata } from 'next';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState<string>('');

  // FAQ data for search functionality
  const faqs: FAQ[] = [
    {
      id: 'getting-started',
      category: 'Getting Started',
      question: 'How do I create my first calendar button?',
      answer: 'Creating a calendar button with Punktual is simple: 1) Sign up for a free account 2) Click "Create Event" 3) Fill in your event details (title, date, time, location) 4) Choose calendar platforms 5) Customize button style 6) Copy and paste the code. Your first 5 events per month are free!'
    },
    {
      id: 'supported-platforms',
      category: 'Getting Started',
      question: 'Which calendar platforms does Punktual support?',
      answer: 'Punktual supports Google Calendar, Apple Calendar (iCal), Microsoft Outlook, Office 365, Outlook.com, and Yahoo Calendar. Your calendar buttons will work seamlessly across all these platforms.'
    },
    {
      id: 'free-limits',
      category: 'Getting Started',
      question: 'What are the limits for free accounts?',
      answer: 'Free accounts can create up to 5 calendar buttons per month. This limit resets on the 1st of each month. Upgrade to a paid plan for unlimited events and additional features.'
    },
    {
      id: 'embed-website',
      category: 'Website Integration',
      question: 'How do I add the calendar button to my website?',
      answer: 'Copy the generated HTML code and paste it into your website where you want the button to appear. Works with WordPress, Squarespace, Wix, and any custom HTML site.'
    },
    {
      id: 'email-integration',
      category: 'Email Marketing',
      question: 'Can I use calendar buttons in emails?',
      answer: 'Yes! Use Calendar Links for all email clients or Calendar Button HTML for most email clients. Calendar Links are recommended for newsletters and marketing campaigns.'
    },
    {
      id: 'button-not-working',
      category: 'Troubleshooting',
      question: 'My calendar button isn\'t working. What should I check?',
      answer: 'Check: 1) Complete HTML code copied 2) Code placed correctly on page 3) Test different browsers 4) Check for script conflicts 5) Verify event date is in future. Contact support if issues persist.'
    },
    {
      id: 'edit-events',
      category: 'Account Management',
      question: 'Can I edit or delete events after creating them?',
      answer: 'Yes! Edit events and regenerate code, delete unused events, or view your event history from your account dashboard. Updated events require replacing the old code with new code.'
    },
    {
      id: 'upgrade-account',
      category: 'Billing',
      question: 'How do I upgrade my account?',
      answer: 'Go to account settings, click "Upgrade Plan", choose your plan, and complete payment. Paid plans include unlimited events, custom branding, analytics, and priority support.'
    },
    {
      id: 'reset-password',
      category: 'Account Management',
      question: 'How do I reset my password?',
      answer: 'Click "Forgot Password" on the login page, enter your email, and follow the reset instructions. Google sign-in users don\'t have passwords - just use "Sign in with Google".'
    },
    {
      id: 'wordpress-integration',
      category: 'Website Integration',
      question: 'How do I add calendar buttons to WordPress?',
      answer: 'Copy the HTML code from Punktual and paste it into a Custom HTML block in your WordPress editor, or use the HTML widget in your sidebar or footer.'
    },
    {
      id: 'mailchimp-integration',
      category: 'Email Marketing',
      question: 'How do I use calendar buttons with Mailchimp?',
      answer: 'Use the Calendar Links option and paste individual platform links into your Mailchimp email template as regular hyperlinks for maximum compatibility.'
    },
    {
      id: 'timezone-issues',
      category: 'Troubleshooting',
      question: 'Calendar shows wrong time zone',
      answer: 'Make sure to set the correct timezone when creating your event. The calendar button will automatically adjust to the user\'s local timezone when they click it.'
    }
  ];

  const filteredFaqs: FAQ[] = faqs.filter(faq => 
    searchTerm.length >= 2 && (
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Structured data for SEO
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I create my first calendar button?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Creating a calendar button with Punktual is simple: 1) Sign up for a free account 2) Click 'Create Event' 3) Fill in your event details (title, date, time, location) 4) Choose which calendar platforms to support 5) Customize the button style 6) Copy the generated code and paste it into your website or email. Your first 5 events per month are free!"
        }
      },
      {
        "@type": "Question", 
        "name": "Which calendar platforms does Punktual support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Punktual works with all major calendar platforms: Google Calendar, Apple Calendar (iCal), Microsoft Outlook, Office 365, Outlook.com, and Yahoo Calendar. Your calendar buttons will work seamlessly across all these platforms."
        }
      },
      {
        "@type": "Question",
        "name": "How do I add the calendar button to my website?",
        "acceptedAnswer": {
          "@type": "Answer", 
          "text": "After creating your event, you'll get HTML code that you can paste directly into your website: 1) Copy the generated HTML code 2) Paste it into your website's HTML where you want the button to appear 3) The button will automatically work - no additional setup needed! The code works with WordPress, Squarespace, Wix, and any website that allows custom HTML."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use calendar buttons in emails?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Punktual offers two options for emails: Calendar Links (individual links for each platform that work in all email clients) and Calendar Button (HTML button that works in most email clients). For email newsletters, we recommend using the 'Calendar Links' option for maximum compatibility."
        }
      }
    ]
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* SEO-Optimized Header */}
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Punktual Help Center
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Learn how to create calendar buttons, embed event codes, and manage your account
            </p>
            <p className="text-gray-600">
              Step-by-step guides for calendar integration, troubleshooting tips, and account management
            </p>
          </header>

          {/* Search Section */}
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Help Articles</h2>
              
              {/* Search Input */}
              <div className="relative max-w-lg">
                <Search className="absolute center-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Search Results */}
              {searchTerm.length >= 2 && (
                <div className="mt-6">
                  {filteredFaqs.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900">
                        Found {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''} for "{searchTerm}"
                      </h3>
                      <div className="space-y-3">
                        {filteredFaqs.map((faq: FAQ) => (
                          <div key={faq.id} className="border border-gray-200 rounded-lg p-4">
                            <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                              {faq.category}
                            </span>
                            <h4 className="font-medium text-gray-900 mt-1 mb-2">
                              {faq.question}
                            </h4>
                            <p className="text-gray-600 text-sm">
                              {faq.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 text-center py-8">
                      <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                      <p className="text-gray-600 mb-4">
                        We couldn't find any help articles matching "{searchTerm}"
                      </p>
                      <a
                        href="mailto:hello@punktual.co"
                        className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Contact Support
                      </a>
                    </div>
                  )}
                </div>
              )}

              {searchTerm.length > 0 && searchTerm.length < 2 && (
                <p className="text-gray-500 text-sm mt-4">
                  Type at least 2 characters to search help articles
                </p>
              )}
            </div>
          </section>

          {/* Quick Start Guide */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Start Guide</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Create Your Event</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Sign up and add your event details - title, date, time, and location.
                </p>
                <a href="/create" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
                  Start Creating →
                </a>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Customize & Generate</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Choose calendar platforms, customize button style, and generate your code.
                </p>
                <a href="/create" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
                  See Examples →
                </a>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Embed on Your Site</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Copy the HTML code and paste it into your website, email, or landing page.
                </p>
                <a href="mailto:hello@punktual.co" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
                  Need Help? →
                </a>
              </div>
            </div>
          </section>

          {/* Static FAQ Content for SEO */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">Frequently Asked Questions</h2>
            
            {/* Getting Started */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Getting Started with Calendar Buttons</h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">How do I create my first calendar button?</h4>
                  <div className="text-gray-700 space-y-2">
                    <p>Creating a calendar button with Punktual is simple:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>Sign up for a free account</li>
                      <li>Click "Create Event"</li>
                      <li>Fill in your event details (title, date, time, location)</li>
                      <li>Choose which calendar platforms to support</li>
                      <li>Customize the button style</li>
                      <li>Copy the generated code and paste it into your website or email</li>
                    </ol>
                    <p className="font-medium">Your first 5 events per month are free!</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">What are the limits for free accounts?</h4>
                  <p className="text-gray-700">
                    Free accounts can create up to 5 calendar buttons per month. This limit resets on the 1st of each month. 
                    If you need more events, you can upgrade to a paid plan for unlimited calendar buttons, plus additional 
                    features like custom styling and analytics.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Which calendar platforms does Punktual support?</h4>
                  <div className="text-gray-700">
                    <p className="mb-2">Punktual works with all major calendar platforms:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Google Calendar</li>
                      <li>Apple Calendar (iCal)</li>
                      <li>Microsoft Outlook</li>
                      <li>Office 365</li>
                      <li>Outlook.com</li>
                      <li>Yahoo Calendar</li>
                    </ul>
                    <p className="mt-2">Your calendar buttons will work seamlessly across all these platforms.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Website Integration */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Website Integration Guide</h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">How do I add the calendar button to my website?</h4>
                  <div className="text-gray-700 space-y-2">
                    <p>After creating your event, you'll get HTML code that you can paste directly into your website:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>Copy the generated HTML code</li>
                      <li>Paste it into your website's HTML where you want the button to appear</li>
                      <li>The button will automatically work - no additional setup needed!</li>
                    </ol>
                    <p>The code works with <strong>WordPress, Squarespace, Wix</strong>, and any website that allows custom HTML.</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Can I use calendar buttons in email campaigns?</h4>
                  <div className="text-gray-700 space-y-2">
                    <p>Yes! Punktual offers two options for emails:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li><strong>Calendar Links</strong>: Individual links for each platform (works in all email clients)</li>
                      <li><strong>Calendar Button</strong>: HTML button (works in most email clients)</li>
                    </ul>
                    <p>For email newsletters, we recommend using the "Calendar Links" option for maximum compatibility.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Troubleshooting */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Troubleshooting Common Issues</h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">My calendar button isn't working. What should I check?</h4>
                  <div className="text-gray-700 space-y-2">
                    <p>If your calendar button isn't working, try these troubleshooting steps:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li><strong>Check the code</strong>: Make sure you copied the complete HTML code</li>
                      <li><strong>Verify placement</strong>: Ensure the code is in the right place on your page</li>
                      <li><strong>Test different browsers</strong>: Try Chrome, Safari, Firefox</li>
                      <li><strong>Check for conflicts</strong>: Other scripts might interfere with the button</li>
                      <li><strong>Validate dates</strong>: Ensure your event date/time is in the future</li>
                    </ol>
                    <p>If it's still not working, <a href="mailto:hello@punktual.co" className="text-emerald-600 hover:text-emerald-700">contact our support team</a> with the specific error you're seeing.</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Can I edit or delete events after creating them?</h4>
                  <div className="text-gray-700 space-y-2">
                    <p>Yes! You can manage your events from your account dashboard:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li><strong>Edit Events</strong>: Update any event details and regenerate the code</li>
                      <li><strong>Delete Events</strong>: Remove events you no longer need</li>
                      <li><strong>View History</strong>: See all events you've created</li>
                    </ul>
                    <p><strong>Important</strong>: If you update an event, you'll need to replace the old code with the new code on your website.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Management */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Account & Billing</h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">How do I upgrade my account?</h4>
                  <div className="text-gray-700 space-y-2">
                    <p>To upgrade from free to paid plans:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>Go to your account settings</li>
                      <li>Click "Upgrade Plan"</li>
                      <li>Choose your preferred plan</li>
                      <li>Complete the payment process</li>
                    </ol>
                    <p>Paid plans include unlimited events, custom branding, click analytics, and priority support.</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">How do I reset my password?</h4>
                  <div className="text-gray-700 space-y-2">
                    <p>To reset your password:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>Go to the login page</li>
                      <li>Click "Forgot Password"</li>
                      <li>Enter your email address</li>
                      <li>Check your email for reset instructions</li>
                      <li>Follow the link to create a new password</li>
                    </ol>
                    <p>If you signed up with Google, you don't have a password - just use "Sign in with Google".</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="mt-12 bg-emerald-50 rounded-lg p-8 text-center border border-emerald-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Still need help?</h2>
            <p className="text-gray-600 mb-4">
              Can't find what you're looking for? Our support team responds within 24 hours.
            </p>
            <a
              href="mailto:hello@punktual.co"
              className="inline-flex items-center px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support Team
            </a>
          </section>

        </div>
      </div>
    </>
  );
}