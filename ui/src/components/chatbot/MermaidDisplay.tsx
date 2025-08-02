'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Copy, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

const MermaidDisplay = ({ diagrams }: { diagrams: string }) => {
  const mermaidRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  console.log(diagrams, "-------------------------" );

  useEffect(() => {
    const loadMermaid = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Dynamically import mermaid
        const mermaid = (await import('mermaid')).default
        
        // Initialize mermaid with configuration
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'inherit',
        })

        if (mermaidRef.current) {
          // Clear previous content
          mermaidRef.current.innerHTML = ''
          
          // Generate unique ID for the diagram
          const id = `mermaid-${Date.now()}`
          
          // Render the diagram
          const { svg } = await mermaid.render(id, diagrams)
          mermaidRef.current.innerHTML = svg
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err)
        setError('Failed to render diagram')
      } finally {
        setIsLoading(false)
      }
    }

    if (diagrams) {
      loadMermaid()
    }
  }, [diagrams])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(diagrams)
    } catch (err) {
      console.error('Failed to copy diagram code:', err)
    }
  }

  const handleDownload = () => {
    const svg = mermaidRef.current?.querySelector('svg')
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const blob = new Blob([svgData], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'diagram.svg'
      link.click()
      URL.revokeObjectURL(url)
    }
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