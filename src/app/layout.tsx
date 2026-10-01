import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import TrafficTracker from '@/components/TrafficTracker';
import CookieConsent from '@/components/CookieConsent';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700'],
});

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://www.punktual.co/#organization',
  name: 'Punktual',
  url: 'https://www.punktual.co/',
  logo: 'https://www.punktual.co/PUNKTUAL-logo.png',
  description: 'Punktual provides customizable Add to Calendar buttons for marketers, event organizers, and businesses.',
};

export const metadata: Metadata = {
  title: 'Punktual - Add to Calendar Button Generator',
  description: 'Generate "Add to Calendar" buttons for your website, email campaigns, and landing pages. Works with Google, Apple, Outlook, and more.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          id="punktual-organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema).replace(/</g, '\\u003c'),
          }}
        />
      </head>
      <body className={`${nunito.variable} font-sans min-h-screen bg-white`}>
        <AuthProvider>
          <TrafficTracker />
          <Navbar />
          {children}
          <Footer />
          <CookieConsent />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#333',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
