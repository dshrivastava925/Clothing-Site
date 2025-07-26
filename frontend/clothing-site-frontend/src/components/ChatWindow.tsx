import React, { useEffect } from "react";
import { MessageList } from "./MessageList";
import { UserInput } from "./UserInput";
import { useChatStore } from "../store/chatStore";
import { sendMessage, fetchConversations, fetchMessages } from "../services/api";

const USER_ID = "demo-user"; // Replace with real user id logic

export const ChatWindow: React.FC = () => {
  const {
    messages,
    setMessages,
    loading,
    setLoading,
    conversations,
    setConversations,
    currentConversationId,
    setCurrentConversationId,
  } = useChatStore();

  // Load conversations on mount
  useEffect(() => {
    fetchConversations(USER_ID).then(setConversations);
  }, [setConversations]);

  // Load messages when currentConversationId changes
  useEffect(() => {
    if (currentConversationId) {
      fetchMessages(currentConversationId).then(setMessages);
    } else {
      setMessages([]);
    }
  }, [currentConversationId, setMessages]);

  const handleSend = async (msg: string) => {
    setLoading(true);
    try {
      const res = await sendMessage(USER_ID, msg, currentConversationId || undefined);
      setCurrentConversationId(res.conversation_id);
      const msgs = await fetchMessages(res.conversation_id);
      setMessages(msgs);
      // Refresh conversations list
      const convs = await fetchConversations(USER_ID);
      setConversations(convs);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (id: string) => {
    setCurrentConversationId(id);
  };

  return (
    <div style={{ display: "flex", height: "80vh", border: "1px solid #ccc" }}>
      {/* Conversation History Panel */}
      <div style={{ width: 220, borderRight: "1px solid #eee", padding: 8, overflowY: "auto" }}>
        <h4>History</h4>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {conversations.map((conv) => (
            <li
              key={conv._id}
              style={{
                padding: "6px 0",
                cursor: "pointer",
                fontWeight: conv._id === currentConversationId ? "bold" : "normal",
              }}
              onClick={() => handleSelectConversation(conv._id)}
            >
              {conv.title}
            </li>
          ))}
        </ul>
      </div>
      {/* Chat Panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <MessageList />
        <UserInput onSend={handleSend} />
        {loading && <div style={{ textAlign: "center", padding: 8 }}>Loading...</div>}
      </div>
    </div>
  );
};
