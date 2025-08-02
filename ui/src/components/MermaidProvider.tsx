'use client'

import { useEffect } from 'react'
import Script from 'next/script'

export default function MermaidProvider() {
  useEffect(() => {
    // Initialize mermaid once it's loaded
    const initializeMermaid = () => {
      if (typeof window !== 'undefined' && (window as any).mermaid) {
        // Detect if dark mode is active
        const isDark = document.documentElement.classList.contains('dark');
        
        (window as any).mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'default',
          securityLevel: 'sandbox',
          fontFamily: 'inherit',
          // Use minimal theme configuration to avoid color parsing errors
          themeVariables: isDark ? {
            primaryColor: '#3b82f6',
            primaryTextColor: '#ffffff',
            background: '#1f2937',
            secondaryColor: '#374151',
            lineColor: '#6b7280',
            textColor: '#ffffff'
          } : {
            primaryColor: '#3b82f6',
            primaryTextColor: '#ffffff',
            background: '#ffffff',
            secondaryColor: '#f3f4f6',
            lineColor: '#d1d5db',
            textColor: '#1f2937'
          }
        });
      }
    };

    // Check if mermaid is already loaded
    if (typeof window !== 'undefined' && (window as any).mermaid) {
      // Add a small delay to ensure styles are computed
      const timeout = setTimeout(initializeMermaid, 100);
      return () => clearTimeout(timeout);
    } else {
      // Wait for mermaid to load
      const checkMermaid = setInterval(() => {
        if (typeof window !== 'undefined' && (window as any).mermaid) {
          // Add a small delay to ensure styles are computed
          setTimeout(initializeMermaid, 100);
          clearInterval(checkMermaid);
        }
      }, 100);

      // Clean up interval on unmount
      return () => clearInterval(checkMermaid);
    }
  }, []);

  return (
    <Script
      src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"
      strategy="beforeInteractive"
    />
  );
}