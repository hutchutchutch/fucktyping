import { useState } from 'react';
import { MessageCircleIcon, SendIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(true); // Start with the chat open
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'ai' | 'user', content: string }[]>([
    { role: 'ai', content: 'Hi there! I can help you with creating voice forms or answering questions. How can I assist you today?' }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message to chat
    setChatHistory([...chatHistory, { role: 'user', content: message }]);
    
    // Simulate AI response
    setTimeout(() => {
      setChatHistory(prev => [...prev, { 
        role: 'ai', 
        content: 'Thanks for your message! I\'m a demo AI assistant. In a real application, I would respond to your query about forms and voice interactions.'
      }]);
    }, 500);
    
    setMessage('');
  };

  if (!isOpen) {
    return (
      <div className="p-4 border-t border-gray-200">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2 text-primary hover:text-primary-dark"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircleIcon className="h-5 w-5" />
          <span>AI Assistant</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 bg-gray-50">
      <div className="p-3 bg-primary text-white text-sm font-medium flex justify-between items-center">
        <span>AI Assistant</span>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white" onClick={() => setIsOpen(false)}>
          <span>×</span>
        </Button>
      </div>
      
      <div className="h-48 overflow-y-auto p-3 flex flex-col gap-2">
        {chatHistory.map((chat, index) => (
          <div 
            key={index} 
            className={`max-w-[85%] p-2 rounded-lg text-sm ${
              chat.role === 'ai' 
                ? 'bg-white border border-gray-200 self-start' 
                : 'bg-primary text-white self-end'
            }`}
          >
            {chat.content}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="text-sm"
        />
        <Button type="submit" size="sm" className="px-2">
          <SendIcon className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}