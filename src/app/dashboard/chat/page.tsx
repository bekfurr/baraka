"use client";

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/store/useLang';
import { t } from '@/lib/translations';
import { useSearchParams } from 'next/navigation';
import { Send, User as UserIcon } from 'lucide-react';

export default function ChatPage() {
  const { lang } = useLang();
  const dict = t[lang];
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('user');

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [targetUser, setTargetUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUsers();
  }, [targetUserId]);

  useEffect(() => {
    if (currentUser && targetUserId) {
      fetchMessages();
      
      // Subscribe to new messages
      const channel = supabase
        .channel('realtime messages')
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `receiver_id=eq.${currentUser.id}`
          }, payload => {
            if (payload.new.sender_id === targetUserId) {
              setMessages(prev => [...prev, payload.new]);
            }
        })
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `sender_id=eq.${currentUser.id}`
          }, payload => {
            if (payload.new.receiver_id === targetUserId) {
              setMessages(prev => [...prev, payload.new]);
            }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUser, targetUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchUsers = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setCurrentUser(session.user);
      
      if (targetUserId) {
        const { data } = await supabase.from('profiles').select('*').eq('id', targetUserId).single();
        setTargetUser(data);
      }
    }
    setLoading(false);
  };

  const fetchMessages = async () => {
    if (!currentUser || !targetUserId) return;
    
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${currentUser.id})`)
      .order('created_at', { ascending: true });
      
    if (data) setMessages(data);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !targetUserId) return;
    
    // Optimistic UI update could go here, but let's wait for realtime/insert
    const msgData = {
      sender_id: currentUser.id,
      receiver_id: targetUserId,
      content: newMessage.trim()
    };
    
    setNewMessage('');
    await supabase.from('messages').insert([msgData]);
  };

  if (loading) return <div className="text-white p-8">Loading...</div>;

  if (!targetUserId) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-gray-400">
        Select a user from Jobs or Profile to start chatting.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] glass-panel overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-black/20">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--secondary)] to-[var(--primary)] flex items-center justify-center text-white">
          <UserIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-white">{targetUser?.full_name || 'Loading...'}</h2>
          <p className="text-xs text-gray-400 capitalize">{targetUser?.role || ''}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">No messages yet. Say hi!</div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender_id === currentUser.id;
            return (
              <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                  isMe 
                    ? 'bg-gradient-to-r from-[var(--primary)] to-fuchsia-600 text-white rounded-tr-sm' 
                    : 'bg-white/10 text-white rounded-tl-sm border border-white/5'
                }`}>
                  <p>{msg.content}</p>
                  <span className="text-[10px] opacity-50 mt-1 block">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 border-t border-white/10 bg-black/20 flex gap-2">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={dict.typeMessage}
          className="flex-1 px-4 py-3 rounded-full bg-black/30 border border-white/10 focus:border-[var(--primary)] text-white outline-none"
        />
        <button 
          type="submit"
          disabled={!newMessage.trim()}
          className="p-3 rounded-full bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
