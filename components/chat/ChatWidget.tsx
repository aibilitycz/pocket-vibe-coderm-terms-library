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
  const [isLoaded, setIsLoaded] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  // Initialize n8n chat when opened
  useEffect(() => {
    if (isOpen && !isLoaded && chatContainerRef.current) {
      const loadChat = async () => {
        try {
          // Dynamically import the n8n chat
          const { createChat } = await import('@n8n/chat')
          
          // Create the chat instance
          createChat({
            webhookUrl: webhookUrl,
            webhookConfig: {
              method: 'POST'
            },
            target: chatContainerRef.current!,
            mode: 'window',
            chatSessionKey: 'chat-session-' + Date.now(),
            showWelcomeScreen: true,
            showWindowCloseButton: false,
            theme: {
              theme: {
                '--chat--color-primary': '#1f2937',
                '--chat--color-primary-shade-50': '#f9fafb',
                '--chat--color-primary-shade-100': '#f3f4f6',
                '--chat--color-secondary': '#6b7280',
                '--chat--color-white': '#ffffff',
                '--chat--color-light-gray': '#f3f4f6',
                '--chat--color-medium-gray': '#6b7280',
                '--chat--color-dark-gray': '#374151',
                '--chat--border-radius': '8px',
                '--chat--font-family': 'Inter, system-ui, sans-serif'
              }
            }
          })
          
          setIsLoaded(true)
        } catch (error) {
          console.error('Failed to load n8n chat:', error)
        }
      }
      
      loadChat()
    }
  }, [isOpen, isLoaded, webhookUrl])

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && chatContainerRef.current && !chatContainerRef.current.contains(event.target as Node)) {
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
            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-3">
                  <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-gray-900 rounded-full mx-auto"></div>
                  <p className="text-gray-600 text-sm">Načítám chat...</p>
                </div>
              </div>
            )}
            
            <div 
              ref={chatContainerRef}
              className="w-full h-full"
              style={{ minHeight: '400px' }}
            />
          </div>
        </div>
      )}
    </>
  )
}