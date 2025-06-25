'use client';

import { useState } from 'react';
import { Search, Mail } from 'lucide-react';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export function SearchableHelpCenter() {
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Additional FAQs for search functionality
  const searchableFaqs: FAQ[] = [
    {
      id: 'getting-started',
      category: 'Getting Started',
      question: 'How do I create my first calendar button?',
      answer: 'Creating a calendar button with Punktual is simple: 1) Sign up for a free account 2) Click "Create Event" 3) Fill in your event details 4) Choose calendar platforms 5) Customize button style 6) Copy and paste the code.'
    },
    {
      id: 'supported-platforms',
      category: 'Getting Started',
      question: 'Which calendar platforms does Punktual support?',
      answer: 'Punktual supports Google Calendar, Apple Calendar (iCal), Microsoft Outlook, Office 365, Outlook.com, and Yahoo Calendar.'
    },
    {
      id: 'free-limits',
      category: 'Getting Started',
      question: 'What are the limits for free accounts?',
      answer: 'Free accounts can create up to 5 calendar buttons per month. This limit resets on the 1st of each month.'
    },
    {
      id: 'embed-website',
      category: 'Website Integration',
      question: 'How do I add the calendar button to my website?',
      answer: 'Copy the generated HTML code and paste it into your website where you want the button to appear. Works with WordPress, Squarespace, Wix, and custom HTML sites.'
    },
    {
      id: 'email-integration',
      category: 'Email Marketing',
      question: 'Can I use calendar buttons in emails?',
      answer: 'Yes! Use Calendar Links for all email clients or Calendar Button HTML for most email clients. Calendar Links are recommended for newsletters.'
    },
    {
      id: 'button-not-working',
      category: 'Troubleshooting',
      question: 'My calendar button isn\'t working',
      answer: 'Check: 1) Complete HTML code copied 2) Code placed correctly 3) Test different browsers 4) Check for script conflicts 5) Verify event date is in future.'
    },
    {
      id: 'edit-events',
      category: 'Account Management',
      question: 'Can I edit or delete events?',
      answer: 'Yes! Edit events and regenerate code, delete unused events, or view your event history from your account dashboard.'
    },
    {
      id: 'upgrade-account',
      category: 'Billing',
      question: 'How do I upgrade my account?',
      answer: 'Go to account settings, click "Upgrade Plan", choose your plan, and complete payment. Paid plans include unlimited events and priority support.'
    },
    {
      id: 'reset-password',
      category: 'Account Management',
      question: 'How do I reset my password?',
      answer: 'Click "Forgot Password" on the login page, enter your email, and follow the reset instructions. Google sign-in users don\'t have passwords.'
    },
    {
      id: 'wordpress-integration',
      category: 'Website Integration',
      question: 'How do I add calendar buttons to WordPress?',
      answer: 'Copy the HTML code from Punktual and paste it into a Custom HTML block in your WordPress editor, or use the HTML widget in your sidebar.'
    },
    {
      id: 'mailchimp-integration',
      category: 'Email Marketing',
      question: 'How do I use calendar buttons with Mailchimp?',
      answer: 'Use the Calendar Links option and paste individual platform links into your Mailchimp email template as regular hyperlinks.'
    },
    {
      id: 'timezone-issues',
      category: 'Troubleshooting',
      question: 'Calendar shows wrong time zone',
      answer: 'Make sure to set the correct timezone when creating your event. The calendar button will automatically adjust to the user\'s local timezone.'
    }
  ];

  const filteredFaqs: FAQ[] = searchableFaqs.filter(faq => 
    searchTerm.length >= 2 && (
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <section className="mb-12">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Help Articles</h2>
        
        {/* Search Input */}
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
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
                      <div className="flex items-start justify-between">
                        <div>
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
                      </div>
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
  );
}