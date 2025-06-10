'use client';
// src/components/Layout/Layout.jsx
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}