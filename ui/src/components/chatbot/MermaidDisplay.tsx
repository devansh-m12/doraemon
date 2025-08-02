'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Copy, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

const MermaidDisplay = ({ diagrams }: { diagrams: string }) => {
  const mermaidRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDownloadReady, setIsDownloadReady] = useState(false)
  const [uniqueId] = useState(() => `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
  
  useEffect(() => {
    const initializeMermaid = async () => {
      try {
        setIsLoading(true)
        setError(null)
        setIsDownloadReady(false)
        
        // Wait for mermaid to be available
        const checkMermaid = () => {
          return new Promise<void>((resolve) => {
            const check = () => {
              if (typeof window !== 'undefined' && (window as any).mermaid) {
                resolve()
              } else {
                setTimeout(check, 100)
              }
            }
            check()
          })
        }
        
        await checkMermaid()
        
        const mermaid = (window as any).mermaid
        
        // Mermaid is already initialized globally in layout.tsx
        // No need to initialize again
        
        if (mermaidRef.current) {
          // Clear any existing content
          mermaidRef.current.innerHTML = '';
          
          // Create the mermaid element
          const mermaidElement = document.createElement('div');
          mermaidElement.className = 'mermaid';
          mermaidElement.id = uniqueId;
          mermaidElement.textContent = diagrams;
          
          // Append to container
          mermaidRef.current.appendChild(mermaidElement);
          
          // Process the specific element
          await mermaid.run({
            querySelector: `#${uniqueId}`,
          });
          
          console.log('Mermaid rendered successfully, container:', mermaidRef.current.innerHTML);
          
          // Check if SVG was created and set download ready state
          const svgElement = mermaidRef.current.querySelector('svg');
          setIsDownloadReady(!!svgElement);
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err)
        setError('Failed to render diagram')
      } finally {
        setIsLoading(false)
      }
    }

    if (diagrams) {
      initializeMermaid()
    }
  }, [diagrams, uniqueId])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(diagrams)
    } catch (err) {
      console.error('Failed to copy diagram code:', err)
    }
  }

  const handleDownload = () => {
    // Wait a bit for Mermaid to fully render
    setTimeout(() => {
      // Try multiple selectors to find the SVG in order of preference
      let svgElement = null;
      
      // First, try to find SVG directly in the mermaid container
      if (mermaidRef.current) {
        svgElement = mermaidRef.current.querySelector('svg');
      }
      
      // If not found, try within the specific mermaid pre element
      if (!svgElement) {
        svgElement = mermaidRef.current?.querySelector(`#${uniqueId} svg`);
      }
      
      // If still not found, try a more general approach
      if (!svgElement) {
        svgElement = document.querySelector(`#${uniqueId} svg`);
      }
      
      // Last resort: find any SVG in the container
      if (!svgElement && mermaidRef.current) {
        const allSvgs = mermaidRef.current.querySelectorAll('svg');
        svgElement = allSvgs[allSvgs.length - 1]; // Get the last (most recent) SVG
      }
      
      console.log('SVG Element found:', !!svgElement, 'ID:', uniqueId);
      console.log('Container HTML:', mermaidRef.current?.innerHTML);
      
      if (svgElement) {
        try {
          // Clone the SVG to avoid modifying the original
          const svgClone = svgElement.cloneNode(true) as SVGElement;
          
          // Ensure the SVG has proper attributes for standalone use
          svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
          
          // Get dimensions from computed styles or bounding rect
          const rect = svgElement.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(svgElement);
          
          const width = svgClone.getAttribute('width') || 
                       computedStyle.width !== 'auto' ? computedStyle.width : 
                       rect.width.toString();
          const height = svgClone.getAttribute('height') || 
                        computedStyle.height !== 'auto' ? computedStyle.height : 
                        rect.height.toString();
          
          svgClone.setAttribute('width', width);
          svgClone.setAttribute('height', height);
          
          const svgData = new XMLSerializer().serializeToString(svgClone);
          const blob = new Blob([svgData], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'mermaid-diagram.svg';
          link.click();
          URL.revokeObjectURL(url);
        } catch (err) {
          console.error('Error downloading SVG:', err);
        }
      } else {
        console.error('No SVG element found in mermaid container');
        console.error('Available elements:', mermaidRef.current?.innerHTML);
      }
    }, 100); // Small delay to ensure rendering is complete
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
        <p className="text-destructive text-sm">{error}</p>
        <details className="mt-2">
          <summary className="text-xs text-muted-foreground cursor-pointer">Show diagram code</summary>
          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
            {diagrams}
          </pre>
        </details>
      </div>
    )
  }

  return (
    <div className="space-y-4">
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8 px-3 text-xs"
          >
            <Copy className="w-3 h-3 mr-1" />
            Copy Code
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!isDownloadReady}
            className="h-8 px-3 text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Download SVG
          </Button>
        </div>

        {/* Mermaid diagram */}
        <div className="border border-border/50 rounded-md p-4 bg-background">
          <div 
            ref={mermaidRef}
            className="mermaid-diagram text-center [&_svg]:max-w-full [&_svg]:h-auto"
          />
        </div>

        {/* Source code (collapsible) */}
        <details className="text-sm">
          <summary className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            View source code
          </summary>
          <pre className="mt-2 text-xs bg-muted p-3 rounded-md overflow-x-auto border">
            {diagrams}
          </pre>
        </details>
      </div>
  )
}

export default MermaidDisplay