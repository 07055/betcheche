import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import './ChatPanel.css';

const MOCK_MESSAGES = [
    { user: 'Alex***', text: '🚀 2x baby!', color: '#e11d48' },
    { user: 'Sara***', text: 'CASHOUT at 3.45x 💰', color: '#f58420' },
    { user: 'Mike***', text: 'almost had 10x 😭', color: '#6366f1' },
    { user: 'Brian***', text: 'Lets gooo!!! 🔥🔥', color: '#34c552' },
    { user: 'Lena***', text: 'who auto-cashed at 2x?', color: '#fbbf24' },
    { user: 'Omar***', text: '100x when 👀', color: '#e11d48' },
    { user: 'Grace***', text: 'Just won 5,000 KES omg', color: '#34c552' },
    { user: 'Hassan***', text: '1.01x crash NOOOO 😤', color: '#f87171' },
    { user: 'Kali***', text: 'auto cashout saved me 🙏', color: '#60a5fa' },
];

let messageIdCounter = MOCK_MESSAGES.length;

export default function ChatPanel({ isOpen, onClose }) {
    const user = useGameStore((s) => s.user);
    const [messages, setMessages] = useState(MOCK_MESSAGES.map((m, i) => ({ ...m, id: i })));
    const [input, setInput] = useState('');
    const listRef = useRef(null);

    // Simulate incoming messages
    useEffect(() => {
        const interval = setInterval(() => {
            const mock = MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)];
            setMessages(prev => [...prev.slice(-80), { ...mock, id: messageIdCounter++, ts: Date.now() }]);
        }, 3500 + Math.random() * 4000);
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll
    useEffect(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        setMessages(prev => [...prev.slice(-80), {
            id: messageIdCounter++,
            user: user?.username ?? 'You',
            text: input.trim(),
            color: '#e11d48',
            isMe: true,
        }]);
        setInput('');
    };

    const QUICK_EMOJIS = ['🚀', '🔥', '💰', '😭', '🎉', '👀'];

    return (
        <div className={`chat-panel ${isOpen ? 'open' : ''}`}>
            <div className="chat-header">
                <span>💬 Live Chat</span>
                <button onClick={onClose} className="chat-close">✕</button>
            </div>
            <div className="chat-messages" ref={listRef}>
                {messages.map(msg => (
                    <div key={msg.id} className={`chat-msg ${msg.isMe ? 'mine' : ''}`}>
                        <span className="chat-user" style={{ color: msg.color }}>{msg.user}</span>
                        <span className="chat-text">{msg.text}</span>
                    </div>
                ))}
            </div>
            <div className="emoji-bar">
                {QUICK_EMOJIS.map(e => (
                    <button key={e} onClick={() => setInput(i => i + e)} className="emoji-btn">{e}</button>
                ))}
            </div>
            <form className="chat-input-row" onSubmit={sendMessage}>
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type a message..."
                    maxLength={80}
                    className="chat-input"
                />
                <button type="submit" className="chat-send">Send</button>
            </form>
        </div>
    );
}
