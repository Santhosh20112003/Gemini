import React, { useState, useEffect, useRef } from "react";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { TbBrandWhatsapp } from "react-icons/tb";
import { TbCopy } from "react-icons/tb";
import { FaSpinner } from "react-icons/fa";
import showdown from "showdown";
import "./chat.css";
import * as Tooltip from "@radix-ui/react-tooltip";
import toast, { Toaster } from "react-hot-toast";
import { ParseDate } from "./common/links";

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
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const recentChats = JSON.parse(localStorage.getItem("recentChats")) || [];
    setConversation(recentChats);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const saveRecentChats = (chats) => {
    const recentChats = chats.slice(-MAX_RECENT_CHATS);
    localStorage.setItem("recentChats", JSON.stringify(recentChats));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

      if (response.status === "blocked") {
        toast.error(
          "Unable to process request due to potentially harmful content!",
          {
            position: "top-center",
            icon: "❌",
          }
        );
        throw new Error("Response blocked due to potentially harmful content");
      }

      const text = await response.text();

      const newMessage = { user: message, bot: text, timestamp: new Date().toLocaleString() };
      setConversation((prev) => [...prev, newMessage]);
      saveRecentChats([...conversation, newMessage]);
    } catch (error) {
      console.error(error.message);
      toast.error("Unable to process your request!", {
        position: "top-center",
        icon: "❌",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResponse = (response) => {
    navigator.clipboard.writeText(response);
    toast.success("Response copied to clipboard!", {
      position: "top-center",
      icon: "✅",
    });
  };

  const handleShareResponse = (response) => {
    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      response
    )}`;
    window.open(shareUrl, "_blank");
    toast.success("Response Shared via Whatsapp!", {
      position: "top-center",
      icon: "✅",
    });
    console.log(`Shared Response: ${response}`);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.success("Please enter a prompt!", {
        position: "top-center",
        icon: "✏️",
      });
      return;
    }
    handleChatSubmission(prompt);
    setPrompt("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-500 flex flex-col items-center justify-end text-white p-5">
      <div className="w-full md:w-[70%] my-6 chat-cont overflow-y-auto max-h-[75vh]">
        {conversation.length === 0 ? (
          <div className="flex items-center mb-10 justify-center gap-5 flex-col">
            <img
              className="rounded-md bg-gray-300 shadow-sm"
              src="https://source.unsplash.com/random/250x250/?digital image"
              alt="Empty"
            />
            <p className="md:text-3xl text-xl text-white font-bold">
              I'm Jarvis, How can I help you today?
            </p>
          </div>
        ) : (
          conversation.map((msg, index) => (
            <div
              key={index}
              className={`bg-gray-100 text-gray-500 my-6  chat p-4 rounded-xl ${
                msg.user ? "items-start" : "items-end"
              }`}
            >
              {msg.user ? (
                <div>
                  <div className="flex items-center justify-between">
                  <strong>You: </strong>
                 {msg.timestramp && <p className="text-sm px-[6px] pb-1 pt-[6px] bg-gray-500 text-white rounded-lg w-fit leading-none">{ParseDate(msg?.timestamp)}</p>}
                </div>
                {msg.user}
                <br />
                </div>
              ) : null}
              <p>
                <div className="message-container">
                  <div className="flex items-center justify-between ">
                    <strong>Jarvis AI: </strong>
                    <div className="message-actions flex items-center justify-end gap-3 p-3">
                      <Tooltip.Provider>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <button
                              onClick={() => handleCopyResponse(msg.bot)}
                              className="action-button copy-button"
                            >
                              <TbCopy />
                            </button>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content
                              className="data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade text-gray-500 select-none rounded-[4px] bg-white px-[15px] py-[10px] text-[15px] leading-none shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity]"
                              sideOffset={10}
                            >
                              Copy Response
                              <Tooltip.Arrow className="fill-white" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      </Tooltip.Provider>
                      <Tooltip.Provider>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <button
                              onClick={() => handleShareResponse(msg.bot)}
                              className="action-button share-button"
                            >
                              <TbBrandWhatsapp />
                            </button>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content
                              className="data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade text-gray-500 select-none rounded-[4px] bg-white px-[15px] py-[10px] text-[15px] leading-none shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity]"
                              sideOffset={10}
                            >
                              Shate Response To Whatsapp
                              <Tooltip.Arrow className="fill-white" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      </Tooltip.Provider>
                    </div>
                  </div>
                  <div
                    className="message-content"
                    dangerouslySetInnerHTML={{
                      __html: converter.makeHtml(msg.bot),
                    }}
                  />
                </div>
              </p>
              <div
                ref={index === conversation.length - 1 ? messagesEndRef : null}
              ></div>
            </div>
          ))
        )}
      </div>
      <form
        onSubmit={handleFormSubmit}
        className="w-full md:w-3/4 lg:w-1/2 flex items-center mb-4 justify-between p-3 rounded-full bg-white space-x-2"
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
      <Toaster />
    </div>
  );
};

export default ChatApp;
