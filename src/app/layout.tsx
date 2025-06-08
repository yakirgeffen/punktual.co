import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'EasyCal - Add to Calendar Button Generator',
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
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}