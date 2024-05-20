import React, { useState, useEffect } from "react";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { FaSpinner } from "react-icons/fa";
import showdown from 'showdown';
import "./chat.css";

const converter = new showdown.Converter();
const API_KEY = "AIzaSyDeBKc55K7B4fIroENBhjlNxTYX5fAecKM";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
  systemInstruction:
    "Hello! I'm Jarvis, an AI model developed by Santhosh Technologies. I can assist you in all ways as a mentor, friend, tutor, and a teacher. For more details about Santhosh Technologies and its products, refer to the link http://santhosh-technologies.netlify.app/",
});
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

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
      const chatSession = model.startChat({
        generationConfig,
        safetySettings,
        history: [
          { role: "user", parts: [{ text: "hello" }] },
          {
            role: "model",
            parts: [
              {
                text: "Hello! 👋 What can I do for you today? 😊 I'm ready to help in any way I can, whether you need a friend to chat with, a mentor to guide you, or a teacher to explain something.",
              },
            ],
          },
          { role: "user", parts: [{ text: "what is your name" }] },
          {
            role: "model",
            parts: [
              {
                text: "You can call me Jarvis! 😊 I'm an AI model, so I don't have a physical name like a person. But \"Jarvis\" is my code name, and it's what I respond to! What's your name? 😄",
              },
            ],
          },
        ],
      });
  
      const result = await chatSession.sendMessage(message);
      const response = await result.response;
  
      if (response.status === 'blocked') {
        throw new Error('Response blocked due to potentially harmful content');
      }
  
      const text = await response.text();
  
      const newMessage = { user: message, bot: text };
      setConversation((prev) => [...prev, newMessage]);
      saveRecentChats([...conversation, newMessage]);
    } catch (error) {
      console.error(error.message);
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
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-500 flex flex-col items-center justify-end text-white p-5">
      <h1 className="text-3xl md:text-5xl my-5 font-bold">Jarvis AI</h1>
      <div className="w-full md:w-[70%]">
        {conversation.length === 0 ? (
          <div className="flex items-center justify-center gap-5 flex-col mb-12">
            <img
              className="rounded-md"
              src="https://source.unsplash.com/random/250x250/?digital"
              alt="Empty"
            />
            <p className="text-xl md:text-3xl font-bold">
              How can I help you today?
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5 mb-5 overflow-y-auto max-h-[70vh]">
            {conversation.map((msg, index) => (
              <div
                key={index}
                className={`bg-gray-100 text-gray-500  chat p-4 rounded-xl ${
                  msg.user ? "items-start" : "items-end"
                }`}
              >
                {msg.user ? (
                  <p>
                    <strong>You: </strong>
                    {msg.user}
                  </p>
                ) : null}
                <p>
                  <strong>Jarvis AI: </strong>
                  <div className="no-tailwindcss" dangerouslySetInnerHTML={{ __html: converter.makeHtml(msg.bot) }}></div>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <form
        onSubmit={handleFormSubmit}
        className="w-full md:w-3/4 lg:w-1/2 flex items-center justify-between p-3 mb-10 rounded-full bg-white space-x-2"
      >
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt here..."
          className="p-2 rounded-sm hover:outline-none bg-transparent focus:outline-none hover:ring-0 w-full text-black"
        />
        <button
          type="submit"
          className="text-blue-500 focus:outline-none font-bold py-2 px-3 rounded-full"
          disabled={loading}
        >
          {loading ? <FaSpinner className="animate-spin" /> : "Send"}
        </button>
      </form>
    </div>
  );
};

export default ChatApp;