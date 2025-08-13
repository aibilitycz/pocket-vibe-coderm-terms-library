'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import './chat-widget.css'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface ChatWidgetProps {
  webhookUrl?: string
}

export default function ChatWidget({ 
  webhookUrl = process.env.NEXT_PUBLIC_CHAT_WEBHOOK_URL || "https://aimee-v3.app.n8n.cloud/webhook/4091fa09-fb9a-4039-9411-7104d213f601/chat" 
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Ahoj! Jsem tady, abych ti vysvětlil jakýkoliv tech termín z Vibe Coding Summer. Co tě zajímá? RAG? API? Něco jiného? Zeptej se na cokoliv!',
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      // Reset authentication when opening chat
      setIsAuthenticated(false)
      setUsername('')
      setPassword('')
      setLoginError('')
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setLoginError('')

    // Test authentication with a simple request
    try {
      const testResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Basic ' + btoa(username + ':' + password),
        },
        body: JSON.stringify({
          chatInput: '',
          sessionId: 'auth-test-' + Date.now()
        })
      })

      if (testResponse.ok) {
        setIsAuthenticated(true)
        setIsLoggingIn(false)
      } else {
        throw new Error('Neplatné přihlašovací údaje')
      }
    } catch (error) {
      console.error('Login error:', error)
      setLoginError('Neplatné uživatelské jméno nebo heslo')
      setIsLoggingIn(false)
    }
  }

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setHasError(false)

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Basic ' + btoa(username + ':' + password),
        },
        body: JSON.stringify({
          chatInput: text.trim(),
          sessionId: 'chat-session-' + Date.now(),
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Add bot response
      const responseText = data.output || data.message || data.response || 'Omlouvám se, nepodařilo se mi odpovědět.'
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Chat error:', error)
      setHasError(true)
      setErrorMessage('Nepodařilo se odeslat zprávu. Zkuste to prosím později.')
      
      // Add error message
      const errorBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Omlouvám se, momentálně mám technické potíže. Zkuste to prosím za chvíli.',
        sender: 'bot',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorBotMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const chatContainer = document.getElementById('chat-container')
      const chatButton = document.getElementById('chat-button')
      
      if (isOpen && chatContainer && !chatContainer.contains(event.target as Node)) {
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
        <div 
          id="chat-container"
          className="fixed z-40 bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden
                     md:bottom-24 md:right-6 md:w-96 md:h-[600px]
                     max-md:inset-x-4 max-md:bottom-4 max-md:top-20"
        >
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

          {/* Content Area */}
          <div className="flex flex-col h-[calc(100%-64px)]">
            {!isAuthenticated ? (
              /* Login Form */
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-sm space-y-4">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Přihlášení</h4>
                    <p className="text-sm text-gray-600">Pro pokračování se přihlaste do chatu</p>
                  </div>
                  
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        Uživatelské jméno
                      </label>
                      <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                        placeholder="Zadejte uživatelské jméno"
                        required
                        disabled={isLoggingIn}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Heslo
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                        placeholder="Zadejte heslo"
                        required
                        disabled={isLoggingIn}
                      />
                    </div>
                    
                    {loginError && (
                      <div className="text-red-600 text-sm bg-red-50 p-2 rounded-lg border border-red-200">
                        {loginError}
                      </div>
                    )}
                    
                    <Button
                      type="submit"
                      disabled={isLoggingIn || !username.trim() || !password.trim()}
                      className="w-full bg-gray-900 hover:bg-gray-700 text-white"
                    >
                      {isLoggingIn ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          <span>Přihlašuji...</span>
                        </div>
                      ) : (
                        'Přihlásit se'
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            ) : (
              /* Chat Messages Area */
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`
                          max-w-[80%] p-3 rounded-lg text-sm
                          ${message.sender === 'user' 
                            ? 'bg-gray-900 text-white' 
                            : 'bg-gray-100 text-gray-900'
                          }
                        `}
                      >
                        {message.sender === 'bot' ? (
                          <div className="space-y-2">
                            <ReactMarkdown 
                              components={{
                                p: ({children}) => <p className="mb-2">{children}</p>,
                                strong: ({children}) => <strong className="font-bold text-gray-900">{children}</strong>,
                                ol: ({children}) => <ol className="list-decimal list-inside space-y-1 ml-2">{children}</ol>,
                                ul: ({children}) => <ul className="list-disc list-inside space-y-1 ml-2">{children}</ul>,
                                li: ({children}) => <li className="mb-1">{children}</li>
                              }}
                            >
                              {message.text}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap">
                            {message.text}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 max-w-[80%] p-3 rounded-lg text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-900 rounded-full"></div>
                          <span>Píšu odpověď...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-200 p-4">
                  <form onSubmit={handleSubmit} className="flex space-x-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Napište svou zprávu..."
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      disabled={isLoading || !inputValue.trim()}
                      className="bg-gray-900 hover:bg-gray-700 p-2 h-auto"
                      aria-label="Odeslat zprávu"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}