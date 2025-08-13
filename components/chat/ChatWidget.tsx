'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import './chat-widget.css'

interface ChatWidgetProps {
  webhookUrl?: string
}

export default function ChatWidget({ 
  webhookUrl = process.env.NEXT_PUBLIC_CHAT_WEBHOOK_URL || "https://aimee-v3.app.n8n.cloud/webhook/4091fa09-fb9a-4039-9411-7104d213f601/chat" 
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
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
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            },
            initialMessages: [
              {
                text: 'Ahoj! 👋 Jsem AI asistent. Jak vám můžu pomoci?',
                sender: 'bot'
              }
            ],
            target: chatContainerRef.current!,
            mode: 'window',
            chatSessionKey: 'chat-session-' + Date.now(),
            showWelcomeScreen: true,
            showWindowCloseButton: false,
            defaultHeight: 500,
            defaultWidth: '100%',
            theme: {
              '--chat--color-primary': '#000000',
              '--chat--color-primary-shade-50': '#ffffff',
              '--chat--color-primary-shade-100': '#f8fafc',
              '--chat--color-secondary': '#64748b',
              '--chat--color-white': '#ffffff',
              '--chat--color-light-gray': '#f8fafc',
              '--chat--color-medium-gray': '#64748b',
              '--chat--color-dark-gray': '#1e293b',
              '--chat--border-radius': '6px',
              '--chat--font-family': 'ui-sans-serif, system-ui, sans-serif',
              '--chat--spacing': '16px',
              '--chat--message-bot-background': '#f8fafc',
              '--chat--message-user-background': '#000000',
              '--chat--message-user-color': '#ffffff',
              '--chat--message-bot-color': '#1e293b',
              '--chat--input-background': '#ffffff',
              '--chat--input-border-color': '#e2e8f0',
              '--chat--input-border-focus-color': '#000000',
              '--chat--button-primary-background': '#000000',
              '--chat--button-primary-color': '#ffffff',
              '--chat--button-primary-border': '#000000',
              '--chat--header-background': '#000000',
              '--chat--header-color': '#ffffff',
              '--chat--border-color': '#e2e8f0'
            }
          })
          
          setIsLoaded(true)
        } catch (error) {
          console.error('Failed to load n8n chat:', error)
          setHasError(true)
          setErrorMessage('Nepodařilo se načíst chat. Zkuste to prosím později.')
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
            {!isLoaded && !hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-3">
                  <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-gray-900 rounded-full mx-auto"></div>
                  <p className="text-gray-600 text-sm">Načítám chat...</p>
                </div>
              </div>
            )}

            {hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-4 p-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <X className="w-8 h-8 text-red-500" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">Chyba připojení</p>
                    <p className="text-gray-600 text-sm mt-1">{errorMessage}</p>
                  </div>
                  <Button 
                    onClick={() => {
                      setHasError(false)
                      setErrorMessage('')
                      setIsLoaded(false)
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Zkusit znovu
                  </Button>
                </div>
              </div>
            )}
            
            <div 
              ref={chatContainerRef}
              className="w-full h-full chat-widget-container"
              style={{ minHeight: '400px' }}
            />
          </div>
        </div>
      )}
    </>
  )
}