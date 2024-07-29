import React, { useState, useEffect, useRef } from "react";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import "./modalscrollbar.css";
import { BiCopy } from "react-icons/bi";
import { BiSolidCopy } from "react-icons/bi";
import { AiOutlineImport } from "react-icons/ai";
import { AiOutlineExport } from "react-icons/ai";
import CryptoJS from "crypto-js";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { TbBrandWhatsapp } from "react-icons/tb";
import { TbWorldShare } from "react-icons/tb";
import { IoArrowUpCircle } from "react-icons/io5";
import { TbCopy } from "react-icons/tb";
import { FaGear } from "react-icons/fa6";
import Game from "./Game";
import { FaXTwitter } from "react-icons/fa6";
import showdown from "showdown";
import "./chat.css";
import { FaBars } from "react-icons/fa6";
import * as Tooltip from "@radix-ui/react-tooltip";
import toast, { Toaster } from "react-hot-toast";
import { ParseDate } from "./common/links";
import { json, Link } from "react-router-dom";
import "./avoid.css";
import supabase from "./database";
import * as Dialog from "@radix-ui/react-dialog";

const converter = new showdown.Converter();
const API_KEY = "AIzaSyAYQ7lif2N0XNiF27sEbZxbAfh5t6n8Aq0";
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

const Jarvis2 = () => {
  const [conversation, setConversation] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [enc, setenc] = useState("");
  const [code, setcode] = useState("");
  const [prevChat, setprevChat] = useState("");
  const [uploadCode, setUploadCode] = useState("");
  const [importloading, setImportLoading] = useState(false);
  const [isGenerating, setGenerating] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [isCopied, setCopied] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const recentChats = JSON.parse(localStorage.getItem("recentChats")) || [];
    setConversation(recentChats);
  }, []);

  useEffect(() => {
    localStorage.setItem("current_version", "2.0");
    toast.remove();
    // toast.success("Chats are stored locally with the last 5 chats preserved.", {
    //   position: "top-right",
    //   duration: 3000,
    //   icon: "🥷",
    // });
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
          `Unable to process request due to potentially harmful content!`,
          {
            position: "top-center",
            icon: "❌",
          }
        );
        throw new Error("Response blocked due to potentially harmful content");
      }

      const text = await response.text();

      const newMessage = { user: message, bot: text, timestamp: new Date() };
      setConversation((prev) => [...prev, newMessage]);
      saveRecentChats([...conversation, newMessage]);
      setenc("");
      setcode("");
    } catch (error) {
      console.error(error.message);
      toast.error(`Unable to process your request! `, {
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

  async function encrypt() {
    setLinkLoading(true);
    try {
      const jsonString = JSON.stringify(localStorage.getItem("recentChats"));
      if (prevChat != jsonString) {
        if (conversation.length != 0) {
          setprevChat(jsonString);
          const encryptedString = CryptoJS.AES.encrypt(
            jsonString,
            "HELLO"
          ).toString();
          const bstring = btoa(encryptedString);
          const key = btoa(new Date().toString());
          const { error: inserterror } = await supabase.from("jarvis").insert({
            key: key,
            value: bstring,
          });
          if (inserterror) {
            toast.error("Unable to Generate Link try later", {
              position: "top-right",
              icon: "❌",
            });
          } else {
            setenc(`${window.origin}/v2/share/${key}`);
          }
        } else {
          toast.remove();
          toast.error("No Chats Are Found in Your Space", {
            position: "top-right",
            icon: "🥷",
          });
        }
      }
    } catch (err) {
      console.log(err);
      toast.error("Unable to Generate Link try later", {
        position: "top-right",
        icon: "❌",
      });
    } finally {
      setLinkLoading(false);
    }
  }

  async function generateCode() {
    setGenerating(true);
    try {
      const jsonString = JSON.stringify(localStorage.getItem("recentChats"));
      if (prevChat != jsonString) {
        if (conversation.length != 0) {
          setprevChat(jsonString);
          const encryptedString = CryptoJS.AES.encrypt(
            jsonString,
            "HELLO"
          ).toString();
          const bstring = btoa(encryptedString);
          const key = btoa(new Date().toString());
          const { error: inserterror } = await supabase.from("jarvis").insert({
            key: key,
            value: bstring,
          });
          if (inserterror) {
            toast.error("Unable to Generate Link try later", {
              position: "top-right",
              icon: "❌",
            });
          } else {
            setcode(key);
          }
        } else {
          toast.remove();
          toast.error("No Chats Are Found in Your Space", {
            position: "top-right",
            icon: "🥷",
          });
        }
      }
    } catch (err) {
      console.log(err);
      toast.error("Unable to Generate Link try later", {
        position: "top-right",
        icon: "❌",
      });
    } finally {
      setGenerating(false);
    }
  }

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

  const handleUploadCode = async (e) => {
    e.preventDefault();

    if (uploadCode.length > 1) {
      const ok = window.confirm(
        "Do you want to import new chats? (Older chats will be deleted)"
      );

      if (ok) {
        try {
          setImportLoading(true);

          const { data, error } = await supabase
            .from("jarvis")
            .select("value")
            .eq("key", uploadCode);

          if (error || !data || data.length === 0) {
            toast.error("Unable to fetch export chats. Please try again.");
            return;
          }

          const decryptedString = CryptoJS.AES.decrypt(
            atob(data[0].value),
            "HELLO"
          ).toString(CryptoJS.enc.Utf8);

          const decryptedArray = JSON.parse(decryptedString);
          const final = JSON.parse(decryptedArray);
          // setConversation(final);
          saveRecentChats(final);
          window.location.reload();
        } catch (err) {
          toast.error("Unable to fetch export chats. Please try again.");
        } finally {
          setImportLoading(false);
          
        }
      }
    } else {
      toast.success("Enter Code to import Chats", {
        position: "top-center",
        icon: "✏️",
      });
    }
  };

  const share = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Jarvis AI Chat",
          url: enc,
        })
        .then(() => {
          console.log("ok");
        })
        .catch((err) => {
          console.error(err);
          alert(err);
        });
    } else {
      console.log("Doesnt support");
    }
  };

  const shareCode = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Chat Session Code",
          text: `*Jarvis AI Export Chat Code* ${code}`,
        })
        .then(() => {
          console.log("ok");
        })
        .catch((err) => {
          console.error(err);
          alert(err);
        });
    } else {
      console.log("Doesnt support");
    }
  };

  const copyCode = (text) => {
    try {
      setCopied(false);

      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
      } else {
        console.log("Doesnt support");
      }

      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (err) {
      toast.error("Unable to copy the text try manually", {
        position: "top-center",
        icon: "❌",
      });
      console.log(err);
    } finally {
      setCopied(true);
    }
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
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-500 flex flex-col items-center justify-end text-white p-3 sm:p-5">
      <div className="w-full bg-opacity-10 backdrop-blur-md sm:backdrop-blur-sm md:backdrop-blur-none bg-blue-500 md:bg-transparent top-0 fixed z-[100] px-5 sm:pb-2 md:pb-5 flex items-center justify-between">
        <span className="">
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button>
                <FaBars className="sm:text-2xl" />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="bg-blackA6 z-[1000] data-[state=open]:left-0 left-[-50%] fixed inset-0" />
              <Dialog.Content className="z-[10000] h-screen data-[state=open]:animate-slideDrawer fixed top-0 left-0 w-[75%] flex flex-col justify-between max-w-[450px]  bg-white p-6 focus:outline-none">
                <span className="">
                  <Dialog.Title className="text-mauve12 inline-flex items-center gap-3 m-0 text-[17px] font-medium">
                    <img
                      src="https://ik.imagekit.io/vituepzjm/Jarvis.png"
                      alt="jarvis"
                      className="w-8 h-8 rounded-full p-1 bg-[#0d2551]"
                    />
                    <p className="text-xl">Jarvis AI</p>
                  </Dialog.Title>

                  <div className="mt-5 md:mt-10 flex flex-col  gap-5">
                    <AlertDialog.Root>
                      <AlertDialog.Trigger asChild>
                        <button className="bg-gray-200 rounded-lg text-base transition-all active:scale-95 px-3 py-3 inline-flex items-center justify-center gap-3">
                          Export Chat <AiOutlineExport />
                        </button>
                      </AlertDialog.Trigger>
                      <AlertDialog.Portal>
                        <AlertDialog.Overlay className="bg-blackA6 z-[10000] data-[state=open]:animate-overlayShow fixed inset-0" />
                        <AlertDialog.Content className="z-[100000] data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[550px] translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
                          <AlertDialog.Title className="text-mauve12 m-0 text-[17px] font-medium">
                            Create Your Export Chat Code
                          </AlertDialog.Title>
                          {code.length > 1 ? (
                            <span className="w-full">
                              <span className="flex mt-5 items-start gap-5 justify-center">
                                <p className="text-[15px] scrollbar overflow-x-auto h-[20px]">
                                  {code}
                                </p>
                                <button
                                  onClick={() => copyCode(code)}
                                  className=" transition-colors mt-1 group rounded-full flex items-center justify-center"
                                >
                                  {isCopied ? (
                                    <BiSolidCopy className="active:scale-95 transition-all text-gray-600 text-xl" />
                                  ) : (
                                    <BiCopy className="active:scale-95 transition-all text-gray-600 text-xl" />
                                  )}
                                </button>
                              </span>
                              <span class="flex items-center justify-center mt-5 gap-5">
                                <button
                                  onClick={() => {
                                    shareCode();
                                  }}
                                  className="px-5 py-3 transition-colors group rounded-full bg-gray-200 flex items-center justify-center"
                                >
                                  Share &nbsp;{" "}
                                  <i className="fas fa-share-nodes active:scale-95 transition-all text-gray-600 text-2xl"></i>
                                </button>
                              </span>
                            </span>
                          ) : (
                            <div className="">
                              <span className="flex items-center md:bg-gray-100 rounded-full flex-wrap justify-center gap-3 md:gap-5 py-5 md:py-4 mt-5">
                                <p className="text-xl hidden md:block break-all">
                                  **** **** **** ****
                                </p>
                                <button
                                  onClick={() => generateCode()}
                                  className="px-3 py-2 rounded-full text-sm bg-gray-500 disabled:animate-pulse text-white"
                                  disabled={isGenerating}
                                >
                                  Generate Code
                                </button>
                              </span>
                            </div>
                          )}

                          <AlertDialog.Cancel asChild>
                            <button
                              className="text-gray-400 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-none focus:outline-none"
                              aria-label="Close"
                            >
                              <i className="fas fa-xmark"></i>
                            </button>
                          </AlertDialog.Cancel>
                        </AlertDialog.Content>
                      </AlertDialog.Portal>
                    </AlertDialog.Root>

                    <AlertDialog.Root>
                      <AlertDialog.Trigger asChild>
                        <button className="bg-gray-200 rounded-lg text-base transition-all active:scale-95 px-3 py-3 inline-flex items-center justify-center gap-3">
                          Import Chat <AiOutlineImport />
                        </button>
                      </AlertDialog.Trigger>
                      <AlertDialog.Portal>
                        <AlertDialog.Overlay className="bg-blackA6 z-[10000] data-[state=open]:animate-overlayShow fixed inset-0" />
                        <AlertDialog.Content className="z-[100000] data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[550px] translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
                          <AlertDialog.Title className="text-mauve12 m-0 text-[17px] font-medium">
                            Import Your Chats Here ⬇️
                          </AlertDialog.Title>

                          <form
                            onSubmit={(e) => handleUploadCode(e)}
                            className="mt-5 flex items-center justify-center gap-3"
                          >
                            <input
                              autoFocus
                              type="text"
                              placeholder="Enter Your Exported Code"
                              onChange={(e) => {
                                setUploadCode(e.target.value);
                              }}
                              className="px-3 py-2 w-full focus:outline-none rounded-full bg-gray-100 shadow "
                            />
                            <button
                              type="submit"
                              disabled={importloading}
                              className="px-5 py-2 bg-blue-400 disabled:animate-pulse text-white rounded-full"
                            >
                              Import
                            </button>
                          </form>

                          <AlertDialog.Cancel asChild>
                            <button
                              className="text-gray-400 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-none focus:outline-none"
                              aria-label="Close"
                            >
                              <i className="fas fa-xmark"></i>
                            </button>
                          </AlertDialog.Cancel>
                        </AlertDialog.Content>
                      </AlertDialog.Portal>
                    </AlertDialog.Root>
                  </div>
                </span>

                <Link
                  to={"https://santechh.online"}
                  target="_blank"
                  className=" flex w-full max-w-[420px] items-center text-white bg-[#5ca1f9] border-2 border-[#5ca1f9] justify-center rounded-lg gap-5 px-2 py-2"
                >
                  <img
                    src="https://ik.imagekit.io/vituepzjm/Santech/Untitled%20design%20(14).png"
                    alt="jarvis"
                    className="h-10 rounded-md"
                  />
                  <p className="capitalize">Powered by Santech</p>
                </Link>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </span>
        <span className="flex items-center justify-center gap-3 px-2 py-3  sm:p-3 sm:pt-5 ">
          <Link
            className={` rounded-full px-3 py-1 md:px-5 md:py-2 border-2 text-sm sm:text-base border-transparent text-white font-semibold`}
            to={"/v1"}
          >
            Jarvis 1.0
          </Link>
          <Link
            className={`bg-white rounded-full px-3 py-1 md:px-5 md:py-2 text-sm sm:text-base border-2 border-white shadow-md text-blue-500 font-semibold`}
            to={"/v2"}
          >
            Jarvis 2.0
          </Link>
        </span>
        <AlertDialog.Root>
          <AlertDialog.Trigger asChild>
            <button className=" md:p-1.5 active:scale-95 sm:mt-2 transition-all">
              <TbWorldShare className="sm:text-[2rem] text-blue-500 text-[1.5rem] rounded-full bg-white p-1" />
            </button>
          </AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className="bg-blackA6 z-[100] data-[state=open]:animate-overlayShow fixed inset-0" />
            <AlertDialog.Content className="z-[1000] data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[550px] translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
              <AlertDialog.Title className="text-mauve12 m-0 text-[17px] font-medium">
                Create a public page to share Chats
              </AlertDialog.Title>
              {enc.length > 1 ? (
                <span className="w-full">
                  <span className="flex mt-5 items-start gap-3 justify-center">
                    <p className="text-[15px] scrollbar overflow-x-auto h-[20px]">
                      {enc}
                    </p>
                  </span>
                  <span class="flex items-center flex-wrap justify-center mt-5 gap-5">
                    <Link
                      to={`https://www.linkedin.com/shareArticle?mini=true&url=${enc}`}
                      target="_blank"
                      className="px-3.5 py-3  transition-colors group rounded-full bg-gray-200 flex items-center justify-center"
                    >
                      <i className="fab active:scale-95 transition-all text-gray-700 fa-linkedin-in text-2xl"></i>
                    </Link>
                    <Link
                      to={`whatsapp://send?text=${enc}`}
                      target="_blank"
                      className="px-3.5 py-3  transition-colors group rounded-full bg-gray-200 flex items-center justify-center"
                    >
                      <i className="fab fa-whatsapp active:scale-95 transition-all text-gray-700 text-2xl"></i>
                    </Link>
                    <Link
                      to={`http://www.twitter.com/share?url=${enc}`}
                      target="_blank"
                      className="px-3.5 py-3  transition-colors group rounded-full bg-gray-200 flex items-center justify-center"
                    >
                      <FaXTwitter className="text-2xl active:scale-95 transition-all text-gray-700" />
                    </Link>
                    <Link
                      to={`mailto:?body=Check out this Jarvis Chat ${enc}`}
                      target="_blank"
                      className="px-3.5 py-3 transition-colors hidden group rounded-full bg-gray-200 md:flex items-center justify-center"
                    >
                      <i className="fas fa-envelope active:scale-95 transition-all text-gray-700 text-2xl"></i>
                    </Link>

                    <button
                      onClick={() => {
                        share();
                      }}
                      className="px-3.5 py-3 transition-colors group rounded-full bg-gray-200 flex items-center justify-center"
                    >
                      <i className="fas fa-share-nodes active:scale-95 transition-all text-gray-700 text-2xl"></i>
                    </button>
                  </span>
                </span>
              ) : (
                <div className="">
                  <span className="flex items-center bg-gray-100 rounded-full flex-wrap justify-evenly gap-3 py-5 md:py-4 mt-5 md:gap-5">
                    <p className="text-base hidden md:block break-all">{`${window.origin}/v2/share/*****`}</p>
                    <button
                      onClick={() => encrypt()}
                      className="px-3 py-2 rounded-full text-sm bg-gray-500 disabled:animate-pulse text-white"
                      disabled={linkLoading}
                    >
                      Generate
                    </button>
                  </span>
                </div>
              )}

              <AlertDialog.Cancel asChild>
                <button
                  className="text-gray-400 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-none focus:outline-none"
                  aria-label="Close"
                >
                  <i className="fas fa-xmark"></i>
                </button>
              </AlertDialog.Cancel>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </div>
      <div className="w-full md:w-[70%] chat-cont overflow-y-auto max-h-[85vh]  sm:max-h-[76vh]">
        {conversation.length === 0 ? (
          <div className="flex items-center mb-10 justify-center gap-5 flex-col">
            <Game className="rounded-md bg-gray-300 shadow-sm" />
            <p className="md:text-3xl text-xl text-white font-bold">
              Hello I'm Jarvis, How can I help you today?
            </p>
          </div>
        ) : (
          conversation.map((msg, index) => (
            <div key={index} className={` text-gray-600 my-5 chat space-y-3`}>
              {msg.user ? (
                <div className="bg-gray-100 p-4 rounded-xl md:ms-10">
                  <div className="flex items-center justify-between pb-2">
                    <strong>You: </strong>
                    {msg.timestamp && (
                      <p className="text-[10px] px-[6px] py-[6px]  bg-gray-500 text-white rounded-lg w-fit leading-none">
                        {ParseDate(msg.timestamp)}
                      </p>
                    )}
                  </div>
                  {msg.user}
                  <br />
                </div>
              ) : null}
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
        className="w-full md:w-3/4 lg:w-1/2 max-h-[50px] sm:max-h-[60px] md:max-h-[60px]  flex mt-2 items-center justify-between p-2 rounded-full bg-white space-x-2"
      >
        <input
          value={prompt}
          autoFocus
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt here..."
          className="p-2 rounded-sm hover:outline-none bg-transparent focus:outline-none hover:ring-0 w-full text-black"
        />
        <button
          type="submit"
          className="focus:outline-none font-bold p-1 text-4xl rounded-full"
          title="send"
          disabled={loading}
        >
          {loading ? (
            <FaGear className="animate-spin p-[0.5rem] text-gray-400" />
          ) : (
            <IoArrowUpCircle
              className={` ${
                prompt.length < 1 ? "text-gray-300" : "text-blue-500 rotate-90"
              } transition-all duration-100 ease-linear`}
            />
          )}
        </button>
      </form>
      <p className=""></p>
      <Toaster className="z-[1000000000]" />
    </div>
  );
};

export default Jarvis2;
