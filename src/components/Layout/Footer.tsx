import { Calendar } from 'lucide-react';
import Link from 'next/link';
import type { FC } from 'react';

const Footer: FC = () => {
  return (
    <footer className="bg-emerald-950 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center mb-4">
              <div className="bg-emerald-500 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-lg font-bold">Punktual</span>
            </Link>
            <p className="text-gray-200 leading-relaxed text-sm">
              Making calendar integration simple for marketers, event organizers, and businesses worldwide.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-white">Product</h4>
            <ul className="space-y-2 text-gray-200 text-sm">
              <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              {/* <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li> */}
              {/* <li><Link href="/api-info" className="hover:text-white transition-colors">API</Link></li> */}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-white">Support</h4>
            <ul className="space-y-2 text-gray-200 text-sm">
              <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              {/* <li><Link href="/status" className="hover:text-white transition-colors">Status Page</Link></li> */}
              <li><Link href="/support" className="hover:text-white transition-colors">Bug Reports</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-white">Company</h4>
            <ul className="space-y-2 text-gray-200 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-200 text-sm">
              © 2025 Punktual. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="https://x.com/Punktual_co"
                 target="_blank"
                 rel="noopener noreferrer" 
                className="text-gray-200 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                </svg>
              </a>
              <a href="https://www.facebook.com/Punktual.co/"
                 target="_blank"
                 rel="noopener noreferrer"
                className="text-gray-200 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"></path>
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/punktual-co/"
                 target="_blank"
                 rel="noopener noreferrer"
                className="text-gray-200 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11.25 20h-3v-10h3v10zm-1.5-11.268c-.967 0-1.75-.792-1.75-1.767s.783-1.766 1.75-1.766c.965 0 1.75.791 1.75 1.766 0 .976-.785 1.767-1.75 1.767zm13.25 11.268h-3v-5.604c0-1.337-.025-3.065-1.867-3.065-1.868 0-2.154 1.46-2.154 2.969v5.7h-3v-10h2.883v1.367h.041c.402-.761 1.386-1.563 2.852-1.563 3.051 0 3.614 2.008 3.614 4.621v5.575z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/punktual.co/"
                 target="_blank"
                 rel="noopener noreferrer"
                className="text-gray-200 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5" fill="white" viewBox="0 0 24 24">
                  <path d="M7.75 2A5.76 5.76 0 0 0 2 7.75v8.5A5.76 5.76 0 0 0 7.75 22h8.5A5.76 5.76 0 0 0 22 16.25v-8.5A5.76 5.76 0 0 0 16.25 2zm0 1.5h8.5A4.26 4.26 0 0 1 20.5 7.75v8.5a4.26 4.26 0 0 1-4.25 4.25h-8.5A4.26 4.26 0 0 1 3.5 16.25v-8.5A4.26 4.26 0 0 1 7.75 3.5zm8.75 2.25a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zM12 6.38A5.62 5.62 0 1 0 17.62 12 5.62 5.62 0 0 0 12 6.38zm0 1.5A4.12 4.12 0 1 1 7.88 12 4.12 4.12 0 0 1 12 7.88z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;