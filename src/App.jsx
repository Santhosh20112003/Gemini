import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FaSpinner } from 'react-icons/fa'; 

const API_KEY = "AIzaSyAa_SXygpJyB5XUVPbEuUcrDJLyg1YgsTo";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const MAX_RECENT_CHATS = 5;

const ChatApp = () => {
  const [conversation, setConversation] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const recentChats = JSON.parse(localStorage.getItem("recentChats")) || [];
    setConversation(recentChats);
  }, []);

  const saveRecentChats = (chats) => {
    const recentChats = chats.slice(-MAX_RECENT_CHATS);
    localStorage.setItem("recentChats", JSON.stringify(recentChats));
  };

  const handleChatSubmission = async (message) => {
    setLoading(true);

    try {
      const result = await model.generateContent(message);
      const response = await result.response;
      const text = await response.text();

      const newMessage = { user: message, bot: text };
      const updatedConversation = [...conversation, newMessage];
      setConversation(updatedConversation);
      saveRecentChats(updatedConversation);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    handleChatSubmission(prompt);
    setPrompt("");
  };

  return (
    <div className="App w-full min-h-screen flex flex-col items-center justify-end bg-gradient-to-b from-blue-400 to-blue-500 text-white p-5">
      {conversation.length === 0 ? (
        <div className="flex items-center mb-12 justify-center gap-5 flex-col">
          <img className="rounded-md" src="https://ik.imagekit.io/vituepzjm/maskable_icon_x192.png?updatedAt=1713176875195" alt="Empty" />
          <p className="md:text-3xl text-xl text-white font-bold">How can I help you today?</p>
        </div>
      ) : (
        <div className="px-5 md:mx-20 flex flex-col gap-5 mb-5 overflow-y-auto max-h-[75vh] w-full md:w-[70%]">
          {conversation.map((msg, index) => (
            <div key={index} className="flex flex-col items-start gap-3 bg-gray-100 text-gray-500 p-4 rounded-xl">
              <div>{msg.user && <p><strong className="text-gray-700">You:&nbsp;</strong> {msg.user}</p>}</div>
              <div><strong className="text-gray-700">Jarvis AI:&nbsp;</strong>{msg.bot}</div>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleFormSubmit} className="flex flex-row items-center justify-between p-3 mb-10 rounded-full bg-white md:space-y-0 md:space-x-2 w-full md:w-3/4 lg:w-1/2">
        <input
          value={prompt}
          autoFocus
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt here.."
          className="p-2 rounded-sm hover:outline-none bg-transparent focus:outline-none hover:ring-0 w-auto md:w-full text-black"
        />
        <button type="submit" className="text-blue-500  hidden md:block  focus:outline-none font-bold py-2 px-3 rounded-full" disabled={loading}>
          {loading ? <FaSpinner className="animate-spin" /> : "Send"} 
        </button>
      </form>
    </div>
  );
};

export default ChatApp;