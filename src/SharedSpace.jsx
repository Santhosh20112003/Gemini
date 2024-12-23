import React, { useState, useEffect, useRef } from "react";
import { TbBrandWhatsapp, TbCopy, TbShare } from "react-icons/tb";
import CryptoJS from "crypto-js";
import showdown from "showdown";
import { FaGear } from "react-icons/fa6";
import "./chat.css";
import * as Tooltip from "@radix-ui/react-tooltip";
import toast, { Toaster } from "react-hot-toast";
import { ParseDate } from "./common/links";
import "./avoid.css";
import { Link, useParams } from "react-router-dom";
import supabase from "./database";

const converter = new showdown.Converter();

const SharedSpace = () => {
  const [conversation, setConversation] = useState([]);
  const [loading, setloading] = useState(false);
  const messagesEndRef = useRef(null);
  let { encchats } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setloading(true);
        const { data, error } = await supabase
          .from("jarvis")
          .select("value")
          .eq("key", encchats);

        if (error) {
          setConversation([]);
        } else {
          if (data.length === 0) {
            setConversation([]);
          } else {
            const decryptedString = CryptoJS.AES.decrypt(
              atob(data[0].value),
              "HELLO"
            ).toString(CryptoJS.enc.Utf8);
            const decryptedArray = JSON.parse(decryptedString);
            setConversation(JSON.parse(decryptedArray));
          }
        }
      } catch (err) {
        setConversation([]);
      } finally {
        setloading(false);
      }
    };

    fetchData();
  }, [encchats]);

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

  const handleShareResponse = (data) => {
    console.log(data)
    if (navigator.share) {
      navigator.share({
        text: `${data.bot}`,
      }).catch(err => console.error(err));
    } else {
      toast.error("Sharing not supported on this device!", {
        position: "top-center",
        icon: "❌",
      });
    }
  };

  const renderChat = () => {
    if (loading) {
      return (
        <div className="w-full flex-col gap-5 h-[70vh] overflow-hidden flex items-center justify-center">
          <FaGear className="animate-spin text-5xl text-white" />
          <span className="text-xl text-center break-words">
            Your chats are on their way! <br /> Hang on Still
          </span>
        </div>
      );
    }
    if (conversation.length === 0) {
      return (
        <div className="flex items-center mb-10 justify-center gap-5 flex-col">
          <img
            src="https://ik.imagekit.io/vituepzjm/404%20Error%20Page%20not%20Found%20with%20people%20connecting%20a%20plug-pana.svg?updatedAt=1721978685835"
            alt="Page Not Found"
            className="w-96 h-96"
          />
          <p className="md:text-3xl text-xl text-center leading-[20px] text-white font-bold">
            Hmmm, I'm not seeing the chat. <br /> Let's try something else!
          </p>
        </div>
      );
    } else {
      return conversation.map((msg, index) => (
        <div key={index} className={`text-gray-600 my-5 chat space-y-3`}>
          {msg.user && (
            <div className="bg-gray-100 p-4 rounded-xl md:ms-10">
              <div className="flex items-center justify-between pb-2">
                <strong className="line-clamp-1 me-12" >{encchats}</strong>
                {msg.timestamp && (
                  <p className="text-[10px] min-w-12 px-[6px] py-[6px] bg-gray-500 text-white rounded-lg w-fit leading-none">
                    {ParseDate(msg.timestamp)}
                  </p>
                )}
              </div>
              {msg.user}
              <br />
            </div>
          )}
          <p className="bg-gray-100 p-4 md:me-10 rounded-xl">
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
                          onClick={() => handleShareResponse(msg)}
                          className="action-button share-button"
                        >
                          <TbShare />
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
      ));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-500 flex flex-col items-center justify-end text-white p-5">
      <div className="w-full md:w-[70%] chat-cont overflow-y-auto max-h-[80vh]">
        {renderChat()}
        <div ref={messagesEndRef} />
      </div>
      <div className="w-full flex items-center justify-center ">
        <span className="flex items-center justify-center gap-3 p-3 pt-5">
          <Link
            to={"/v2"}
            className="bg-gradient-to-br from-gray-600 to-gray-800 rounded-full px-5 py-2 shadow-xl text-white active:scale-95 transition-all font-semibold"
          >
            Try Jarvis AI &nbsp;{" "}
            <i className="fa-solid fa-arrow-up-right-from-square"></i>
          </Link>
        </span>
      </div>
      <Toaster />
    </div>
  );
};

export default SharedSpace;
