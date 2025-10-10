// // src/app/GtmHead.tsx

// 'use client';
// import { useEffect } from 'react';

// export default function GtmHead() {
//   useEffect(() => {
//     // inject GTM loader once
//     if (document.getElementById('gtm-loader')) return;
//     const s = document.createElement('script');
//     s.id = 'gtm-loader';
//     s.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
// new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
// j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
// 'https://www.googletagmanager.com/gtm.js?id=GTM-PHX4NPHM'+dl;f.parentNode.insertBefore(j,f);
// })(window,document,'script','dataLayer','GTM-PHX4NPHM');`;
//     document.head.appendChild(s);
//   }, []);
//   return null;
// }
