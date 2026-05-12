# Student Chat Widget

## Overview
A floating AI chat widget has been added to the student dashboard (`/booking`) that allows students to ask questions about rooms, payments, and hostel policies using natural language.

## Features

### ✅ Floating Chat Bubble
- **Position**: Bottom-right corner of the screen
- **Appearance**: Blue bubble with chat icon and "Chat with AI" text
- **Interaction**: Click to open the chat panel

### ✅ Chat Panel
- **Header**: "Hostel AI Assistant" with online status indicator
- **Messages**: Conversation bubbles with proper alignment
  - **Student messages**: Right-aligned (blue background)
  - **AI responses**: Left-aligned (white background)
- **Input**: Textarea with send button

### ✅ Typing Indicator
- **Animation**: Three animated dots while AI is processing
- **Position**: Appears in message area during AI responses

### ✅ Chat History
- **Persistence**: Messages saved in sessionStorage during the session
- **Restoration**: Chat history restored when reopening the widget
- **Clearing**: History cleared when closing the chat completely

### ✅ Controls
- **Minimize**: Reduces to floating bubble (preserves history)
- **Close**: Closes panel and clears chat history
- **Send**: Enter key or click send button

## Usage

### Starting a Conversation
1. Visit `/booking` on the student dashboard
2. Click the floating chat bubble in the bottom-right corner
3. Type your question in the input field
4. Press Enter or click the send button

### Example Questions
- "Show me 3-seater rooms under 5000"
- "What 2-seater rooms are available?"
- "Find the cheapest rooms"
- "Show rooms between 3000 and 8000"
- "Available 4-seater rooms sorted by price"

### Chat Controls
- **Minimize**: Click the minimize button (─) to close panel but keep history
- **Close**: Click the X button to close panel and clear history
- **Outside Click**: Clicking outside the chat panel minimizes it

## Technical Implementation

### Files Modified/Created
- `rooms.html`: Added chat widget HTML structure
- `style.css`: Added comprehensive chat widget styles
- `chat-widget.js`: New JavaScript file with chat functionality

### Integration
- **AI Endpoint**: Uses existing `/booking/api/ai/room-query` endpoint
- **Rate Limiting**: Respects 10 requests per minute per IP
- **Error Handling**: Graceful fallback messages for API failures

### Responsive Design
- **Mobile**: Adjusted width and positioning for small screens
- **Tablet**: Optimized layout for medium screens
- **Desktop**: Full 380px width panel

### Browser Compatibility
- **Modern Browsers**: Full feature support
- **Session Storage**: Used for chat history persistence
- **CSS Animations**: Smooth transitions and typing indicator

## Setup Requirements

### Environment Variables
- `ANTHROPIC_API_KEY`: Required for AI functionality
- Set this environment variable to enable AI responses

### Dependencies
- All dependencies are already included in `package.json`
- No additional installations required

## Troubleshooting

### Chat Widget Not Visible
- Check browser console for JavaScript errors
- Verify `chat-widget.js` is loading correctly
- Ensure CSS styles are applied

### AI Not Responding
- Verify `ANTHROPIC_API_KEY` environment variable is set
- Check server logs for API key errors
- Verify rate limiting hasn't been exceeded

### Chat History Not Persisting
- Check if sessionStorage is enabled in browser
- Verify no privacy extensions are blocking storage
- Check browser developer tools for storage errors

## Styling Customization

### Colors
- **Primary Blue**: `#1d4ed8` (buttons, student messages)
- **Background**: `#f8fafc` (message area)
- **White**: `#ffffff` (AI messages, panel)

### Animations
- **Message Slide-in**: 0.3s ease animation
- **Typing Dots**: 1.4s infinite animation
- **Panel Transitions**: 0.3s ease scale/opacity

### Responsive Breakpoints
- **Mobile**: `max-width: 480px`
- **Panel Width**: 380px (desktop), calc(100vw - 40px) (mobile)
- **Panel Height**: 500px (desktop), 450px (mobile)
