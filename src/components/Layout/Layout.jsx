// import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { AuthProvider } from '../hooks/useAuth';
import { Toaster } from 'react-hot-toast';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  title: 'EasyCal - Add to Calendar Button Generator',
  description: 'Generate "Add to Calendar" buttons for your website, email campaigns, and landing pages. Works with Google, Apple, Outlook, and more.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} font-sans min-h-screen bg-white`}>
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}