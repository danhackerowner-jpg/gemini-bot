import { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [historyList, setHistoryList] = useState([]);

  // Load saved history from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("chatHistoryList") || "[]");
    setHistoryList(saved);
    if (saved.length > 0) {
      setMessages(saved[saved.length - 1].messages);
    }
  }, []);

  // Save whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      const newHistoryList = [...historyList];
      if (newHistoryList.length === 0) {
        newHistoryList.push({ id: Date.now(), messages });
      } else {
        newHistoryList[newHistoryList.length - 1].messages = messages;
      }
      setHistoryList(newHistoryList);
      localStorage.setItem("chatHistoryList", JSON.stringify(newHistoryList));
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    try {
      const res = await axios.post("/api/gemini", { history: newMessages });
      const botMessage = { role: "bot", text: res.data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "❌ Error fetching response." }
      ]);
    }
  };

  const newConversation = () => {
    const newChat = { id: Date.now(), messages: [] };
    const newHistory = [...historyList, newChat];
    setHistoryList(newHistory);
    setMessages([]);
    localStorage.setItem("chatHistoryList", JSON.stringify(newHistory));
  };

  const loadConversation = (id) => {
    const conv = historyList.find((h) => h.id === id);
    if (conv) setMessages(conv.messages);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar / Menu */}
      <div className="w-64 bg-gray-800 p-4 flex flex-col">
        <h2 className="text-lg font-bold mb-4">History</h2>
        <button
          onClick={newConversation}
          className="mb-4 bg-blue-500 px-3 py-2 rounded hover:bg-blue-600"
        >
          + New Chat
        </button>
        <div className="flex-1 overflow-y-auto">
          {historyList.map((h) => (
            <div
              key={h.id}
              onClick={() => loadConversation(h.id)}
              className="p-2 mb-2 rounded bg-gray-700 hover:bg-gray-600 cursor-pointer text-sm"
            >
              Chat {new Date(h.id).toLocaleTimeString()}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col p-4">
        <h1 className="text-2xl font-bold mb-4">Gemini Chat</h1>
        <div className="flex-1 overflow-y-auto bg-gray-800 rounded-lg p-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-2 my-2 rounded-lg max-w-[80%] ${
                msg.role === "user"
                  ? "bg-blue-600 ml-auto text-right"
                  : "bg-gray-700 mr-auto text-left"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>
        <div className="flex mt-4">
          <input
            className="flex-1 p-2 rounded-l-lg text-black"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 px-4 py-2 rounded-r-lg hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
          }
        
