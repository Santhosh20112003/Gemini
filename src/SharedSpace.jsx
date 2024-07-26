import React, { useState, useEffect, useRef } from "react";
import { TbBrandWhatsapp } from "react-icons/tb";
import { TbCopy } from "react-icons/tb";
import Game from "./Game";
import showdown from "showdown";
import "./chat.css";
import * as Tooltip from "@radix-ui/react-tooltip";
import toast, { Toaster } from "react-hot-toast";
import { ParseDate } from "./common/links";
import "./avoid.css";
import { Link } from "react-router-dom";

const converter = new showdown.Converter();

const SharedSpace = () => {
  const [conversation, setConversation] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const recentChats = JSON.parse(localStorage.getItem("recentChats")) || [];
    setConversation(recentChats);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const x = screenWidth / 2 - 400 / 2;
    const y = screenHeight / 2 - 400 / 2;
    window.open(shareUrl, "", `width=400,height=400,left=${x},top=${y}`);
    toast.success("Response Shared via Whatsapp!", {
      position: "top-center",
      icon: "✅",
    });
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-500 flex flex-col items-center justify-end text-white p-5"
    >
      <div className="w-full md:w-[70%] chat-cont overflow-y-auto max-h-[80vh]">
        {conversation.length === 0 ? (
          <div className="flex items-center mb-10 justify-center gap-5 flex-col">
            <Game className="rounded-md bg-gray-300 shadow-sm" />
            <p className="md:text-3xl text-xl text-white font-bold">
              Hello I'm Jarvis, How can I help you today?
            </p>
          </div>
        ) : (
          conversation.map((msg, index) => (
            <div
              key={index}
              className={`text-gray-600 my-5 chat space-y-3`}
            >
              {msg.user ? (
                <div className="bg-gray-100 p-4 rounded-xl ms-5 md:ms-10">
                  <div className="flex items-center justify-between pb-2">
                    <strong>You: </strong>
                    {msg.timestamp && (
                      <p className="text-sm px-[6px] py-[6px] bg-gray-500 text-white rounded-lg w-fit leading-none">
                        {ParseDate(msg.timestamp)}
                      </p>
                    )}
                  </div>
                  {msg.user}
                  <br />
                </div>
              ) : null}
              <p className="bg-gray-100 p-4 me-5 md:me-10 rounded-xl">
                <div className="message-container">
                  <div className="flex items-center justify-between ">
                    <span className="inline-flex items-center justify-center gap-2">
                      <img
                        src="https://ik.imagekit.io/vituepzjm/Jarvis.png"
                        alt="jarvis"
                        className="w-6 h-6 rounded-full p-1 bg-[#0d2551]"
                      />
                      <strong className="text-lg">Jarvis AI</strong>
                    </span>
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
                              Share Response To Whatsapp
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
            </div>
          ))
        )}
      </div>
      <div className="w-full flex items-center justify-center ">
        <span className="flex items-center justify-center gap-3 p-3 pt-5">
          <p className="bg-white rounded-full px-5 py-2 border-2 border-white shadow-md text-blue-600 font-semibold">
            Shared conversation
          </p>
        </span>
      </div>
      <Toaster />
    </div>
  );
};

export default SharedSpace;