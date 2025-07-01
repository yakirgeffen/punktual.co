import type { Metadata } from 'next';
import Script from 'next/script';
import { Nunito } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import TrafficTracker from '@/components/TrafficTracker';
import CookieConsent from '@/components/CookieConsent';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700'],
});

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
      <body className={`${nunito.variable} font-sans min-h-screen bg-white`}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-MQD8GRBC4V"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-MQD8GRBC4V');
          `}
        </Script>
        
        <AuthProvider>
          <TrafficTracker />
          <Navbar />
          {children}
          <Footer />
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
