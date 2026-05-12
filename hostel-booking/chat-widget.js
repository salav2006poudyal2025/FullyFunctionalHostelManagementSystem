// chat-widget.js
// Floating AI Chat Widget for Student Dashboard

class ChatWidget {
  constructor() {
    this.chatHistory = [];
    this.isTyping = false;
    this.isOpen = false;
    
    this.initializeElements();
    this.bindEvents();
    this.loadChatHistory();
  }

  initializeElements() {
    // Chat widget elements
    this.chatWidget = document.getElementById('chatWidget');
    this.chatBubble = document.getElementById('chatBubble');
    this.chatPanel = document.getElementById('chatPanel');
    this.chatMessages = document.getElementById('chatMessages');
    this.chatInput = document.getElementById('chatInput');
    this.sendButton = document.getElementById('sendMessage');
    this.typingIndicator = document.getElementById('typingIndicator');
    this.closeButton = document.getElementById('closeChat');
    this.minimizeButton = document.getElementById('minimizeChat');
  }

  bindEvents() {
    // Chat bubble click to open/close
    this.chatBubble.addEventListener('click', () => this.toggleChat());

    // Send message events
    this.sendButton.addEventListener('click', () => this.sendMessage());
    this.chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize textarea
    this.chatInput.addEventListener('input', () => {
      this.autoResizeTextarea();
    });

    // Close/minimize buttons
    this.closeButton.addEventListener('click', () => this.closeChat());
    this.minimizeButton.addEventListener('click', () => this.minimizeChat());

    // Close chat when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isOpen && 
          !this.chatWidget.contains(e.target) && 
          !this.chatPanel.contains(e.target)) {
        this.minimizeChat();
      }
    });
  }

  toggleChat() {
    if (this.isOpen) {
      this.minimizeChat();
    } else {
      this.openChat();
    }
  }

  openChat() {
    this.chatPanel.classList.remove('chat-panel-hidden');
    this.chatBubble.style.display = 'none';
    this.isOpen = true;
    this.chatInput.focus();
  }

  closeChat() {
    this.chatPanel.classList.add('chat-panel-hidden');
    this.chatBubble.style.display = 'flex';
    this.isOpen = false;
    this.clearChatHistory();
  }

  minimizeChat() {
    this.chatPanel.classList.add('chat-panel-hidden');
    this.chatBubble.style.display = 'flex';
    this.isOpen = false;
  }

  autoResizeTextarea() {
    this.chatInput.style.height = 'auto';
    this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 100) + 'px';
  }

  async sendMessage() {
    const message = this.chatInput.value.trim();
    
    if (!message || this.isTyping) {
      return;
    }

    // Add student message to chat
    this.addMessage(message, 'student');
    this.chatInput.value = '';
    this.autoResizeTextarea();

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Send message to AI endpoint
      const response = await this.callAIEndpoint(message);
      
      // Hide typing indicator
      this.hideTypingIndicator();

      // Add AI response
      if (response.success) {
        this.addMessage(this.formatAIResponse(response), 'ai');
      } else {
        this.addMessage('Sorry, I encountered an error. Please try again.', 'ai');
      }
    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage('Sorry, I\'m having trouble connecting. Please try again later.', 'ai');
      console.error('Chat widget error:', error);
    }

    this.saveChatHistory();
  }

  async callAIEndpoint(message) {
    const response = await fetch('/booking/api/ai/room-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: message })
    });

    return await response.json();
  }

  formatAIResponse(response) {
    if (response.data && response.data.length > 0) {
      let formatted = `I found ${response.count} room${response.count > 1 ? 's' : ''} matching your query:\n\n`;
      
      response.data.forEach((room, index) => {
        formatted += `${index + 1}. **Room ${room.roomNumber}**\n`;
        formatted += `   • ${room.seaterType}-seater (₹${room.monthlyFee}/month)\n`;
        formatted += `   • ${room.seatsLeft} seat${room.seatsLeft !== 1 ? 's' : ''} available\n`;
        formatted += `   • Status: ${room.status}\n`;
        if (index < response.data.length - 1) formatted += '\n';
      });

      return formatted;
    } else {
      return "I couldn't find any rooms matching your criteria. Try asking about different room types, price ranges, or availability.";
    }
  }

  addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;
    
    messageDiv.appendChild(messageContent);
    this.chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    this.scrollToBottom();
    
    // Add to history
    this.chatHistory.push({
      content,
      sender,
      timestamp: new Date().toISOString()
    });
  }

  showTypingIndicator() {
    this.isTyping = true;
    this.typingIndicator.classList.remove('typing-indicator-hidden');
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    this.isTyping = false;
    this.typingIndicator.classList.add('typing-indicator-hidden');
  }

  scrollToBottom() {
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  saveChatHistory() {
    try {
      sessionStorage.setItem('chatHistory', JSON.stringify(this.chatHistory));
    } catch (error) {
      console.warn('Could not save chat history to sessionStorage:', error);
    }
  }

  loadChatHistory() {
    try {
      const saved = sessionStorage.getItem('chatHistory');
      if (saved) {
        this.chatHistory = JSON.parse(saved);
        this.rebuildChatMessages();
      }
    } catch (error) {
      console.warn('Could not load chat history from sessionStorage:', error);
    }
  }

  rebuildChatMessages() {
    // Clear existing messages except the welcome message
    const welcomeMessage = this.chatMessages.querySelector('.ai-message');
    this.chatMessages.innerHTML = '';
    
    // Add welcome message back
    if (welcomeMessage) {
      this.chatMessages.appendChild(welcomeMessage);
    }
    
    // Rebuild messages from history
    this.chatHistory.forEach(message => {
      this.addMessageToDOM(message.content, message.sender);
    });
    
    this.scrollToBottom();
  }

  addMessageToDOM(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;
    
    messageDiv.appendChild(messageContent);
    this.chatMessages.appendChild(messageDiv);
  }

  clearChatHistory() {
    this.chatHistory = [];
    try {
      sessionStorage.removeItem('chatHistory');
    } catch (error) {
      console.warn('Could not clear chat history from sessionStorage:', error);
    }
  }
}

// Initialize chat widget when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.chatWidget = new ChatWidget();
});

// Make chat widget available globally for debugging
window.ChatWidget = ChatWidget;
