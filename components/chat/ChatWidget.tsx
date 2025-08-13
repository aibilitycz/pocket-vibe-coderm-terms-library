'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatWidgetProps {
  webhookUrl?: string
}

export default function ChatWidget({ 
  webhookUrl = process.env.NEXT_PUBLIC_CHAT_WEBHOOK_URL || "https://aimee-v3.app.n8n.cloud/webhook/4091fa09-fb9a-4039-9411-7104d213f601/chat" 
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && iframeRef.current && !iframeRef.current.contains(event.target as Node)) {
        const chatButton = document.getElementById('chat-button')
        if (chatButton && !chatButton.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          id="chat-button"
          onClick={toggleChat}
          className={`
            w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 
            ${isOpen ? 'bg-gray-700 hover:bg-gray-800' : 'bg-gray-900 hover:bg-gray-700'}
            flex items-center justify-center
          `}
          aria-label={isOpen ? 'Zavřít chat' : 'Otevřít chat'}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <MessageCircle className="w-6 h-6 text-white" />
          )}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30" onClick={toggleChat} />
      )}

      {/* Chat Popup - Responsive */}
      {isOpen && (
        <div className="fixed z-40 bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden
                        md:bottom-24 md:right-6 md:w-96 md:h-[600px]
                        max-md:inset-x-4 max-md:bottom-4 max-md:top-20">
          {/* Header */}
          <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-semibold">AI Asistent</h3>
            </div>
            <Button
              onClick={toggleChat}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-gray-700 p-1 h-auto"
              aria-label="Zavřít chat"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Chat Content */}
          <div className="relative w-full h-[calc(100%-64px)]">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-3">
                  <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-gray-900 rounded-full mx-auto"></div>
                  <p className="text-gray-600 text-sm">Načítám chat...</p>
                </div>
              </div>
            )}
            
            <iframe
              ref={iframeRef}
              src={webhookUrl}
              className="w-full h-full border-0"
              title="AI Chat Assistant"
              onLoad={handleIframeLoad}
              allow="microphone; camera; geolocation"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
          </div>
        </div>
      )}
    </>
  )
}