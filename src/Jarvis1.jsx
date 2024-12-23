import React, { useState, useEffect, useRef } from "react";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import "./modalscrollbar.css";
import { v4 as uuidv4 } from "uuid";
import { TbShare } from "react-icons/tb";
import { IoArrowUpCircle, IoCloseSharp } from "react-icons/io5";
import { TbCopy } from "react-icons/tb";
import { FaGear } from "react-icons/fa6";
import Game from "./Game";
import showdown from "showdown";
import "./chat.css";
import * as Tooltip from "@radix-ui/react-tooltip";
import toast, { Toaster } from "react-hot-toast";
import { ParseDate } from "./common/links";
import { Link } from "react-router-dom";
import "./avoid.css";
import { MdDownload } from "react-icons/md";
import * as Dialog from "@radix-ui/react-dialog";
import { LuImagePlus } from "react-icons/lu";
import { FiX } from "react-icons/fi";
import { RiCameraAiLine } from "react-icons/ri";

const converter = new showdown.Converter();
const API_KEY = "AIzaSyCGINQXMwTVCkXIFEnOylIaNAerKKaoOiM";
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
  systemInstruction:
    "Hello! I'm Jarvis, an AI model developed by Santhosh Technologies. I can assist you in all ways as a mentor, friend, tutor, and a teacher. For more details about Santhosh Technologies and its products, refer to the link http://santhosh-technologies.netlify.app/",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const safetySettings = [{ category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE, }, { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE, }, { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE, }, { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE, },];

const MAX_RECENT_CHATS = 5;

const Jarvis1 = () => {
  const [conversation, setConversation] = useState([]);
  const [image, setImage] = useState('');
  const [imageInlineData, setImageInlineData] = useState('');
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const fileInputRef2 = useRef(null);

  useEffect(() => {
    localStorage.setItem("current_version", "1.0");
  }, []);

  useEffect(() => {
    const recentChats = JSON.parse(localStorage.getItem("recentbetaChats")) || [];
    setConversation(recentChats);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const saveRecentChats = (chats) => {
    const recentChats = chats.slice(-MAX_RECENT_CHATS);
    localStorage.setItem("recentbetaChats", JSON.stringify(recentChats));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleChatSubmission = async (message) => {
    setLoading(true);
    try {
      // console.log(image, imageInlineData)
      const result = await model.generateContent([
        prompt, imageInlineData ?? null
      ]);
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

      const newMessage = { user: message, bot: text, timestamp: new Date(), image: image };
      setConversation((prev) => [...prev, newMessage]);
      saveRecentChats([...conversation, newMessage]);
      setPrompt("");
      setImage('');
      setImageInlineData('');
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

  function handleImgUpload(event) {
    const files = event.target.files;

    if (files.length === 0) {
      toast.error('No file selected.');
      return;
    }

    if (files.length > 1) {
      toast.error('Please upload only one image.');
      event.target.value = '';
      return;
    }

    const file = files[0];

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file.');
      event.target.value = '';
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size must be less than 2MB.');
      event.target.value = '';
      return;
    }

    getBase64(file).then((result) => {
      setImage(result);
    }).catch(e => console.log(e))

    fileToGenerativePart(file).then((image) => {
      setImageInlineData(image);
    });

  }

  const getBase64 = (file) => new Promise(function (resolve, reject) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject('Error: ', error);
  })

  async function fileToGenerativePart(file) {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    });

    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  }

  function decodeBase64ToImage(base64String) {
    return `data:image/jpeg; base64,${base64String}`;
  }

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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.success("Please enter a prompt!", {
        position: "top-center",
        icon: "✏️",
      });
      return;
    }
    // if (image == "") {
    //   toast.success("Please upoad a image!", {
    //     position: "top-center",
    //     icon: "✏️",
    //   });
    //   return;
    // }
    handleChatSubmission(prompt);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-500 flex flex-col items-center justify-end text-white p-3 sm:pb-3 sm:pt-0 sm:px-3">
      <div className="w-full bg-opacity-10 bg-blue-500 md:bg-transparent top-0 fixed z-[100] px-5 sm:pb-2 md:pb-5 flex items-center justify-center">
        <span className="flex items-center justify-center gap-3 px-2 py-3 sm:p-3 sm:pt-3 ">
          <Link
            className={`bg-white rounded-full px-3 py-1 md:px-5 md:py-2 text-sm sm:text-base border-2 border-white shadow-md text-blue-500 font-semibold`}
            to={"/v1"}
          >
            Jarvis Beta
          </Link>
          <Link
            className={` rounded-full px-3 py-1 md:px-5 md:py-2 border-2 text-sm sm:text-base border-transparent text-white font-semibold`}
            to={"/v2"}
          >
            Jarvis
          </Link>

        </span>
      </div>
      <div className="w-full relative md:w-[75%] chat-cont1 overflow-y-auto max-h-[80vh] sm:max-h-[78vh] mt-2 mb-[4.5rem]">
        {conversation.length === 0 ? (
          <div className="flex items-center mb-10 justify-center gap-5 flex-col">
            <Game className="rounded-md bg-gray-300" />
            <p className="md:text-3xl text-xl text-white font-bold">
              Hello I'm Jarvis, How can I help you today?
            </p>
          </div>
        ) : (
          <div className="chat-cont2 px-2">
            {conversation.map((msg, index) => (
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
                    {msg?.image && <Dialog.Root>
                      <Dialog.Trigger asChild>
                        <img src={msg.image} alt="Uploaded Data" className="cursor-pointer object-cover object-center brightness-90 bg-blackA2 overflow-hidden rounded-lg w-full my-2 h-full max-w-96 max-h-24 transition-opacity duration-300 opacity-100" />
                      </Dialog.Trigger>
                      <Dialog.Portal>
                        <Dialog.Overlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0 z-[100000]" />
                        <Dialog.Content className="z-[100000000] data-[state=open]:animate-contentShow fixed rounded-md top-[50%] left-[50%] md:w-fit w-[90vw] max-h-[80vh] md:max-h-none  translate-x-[-50%] p-5 translate-y-[-50%]  bg-white focus:outline-none">
                          <div className="w-full flex items-center gap-6 mb-2 justify-between">
                            <Dialog.Title className="text-gray-500 line-clamp-1 text-sm font-medium">
                              {uuidv4() + '.png'}
                            </Dialog.Title>
                            <div className="flex items-center gap-2">
                              <a title="download" href={msg.image} download={uuidv4()} className='active:scale-90 text-gray-500 transition-all' >
                                <MdDownload />
                              </a>
                              <Dialog.Close asChild>
                                <button className='focus:outline-none active:scale-90 transition-all' >
                                  <IoCloseSharp className='text-gray-500 text-lg' />
                                </button>
                              </Dialog.Close>
                            </div>
                          </div>
                          <img
                            src={msg.image}
                            alt="uploaded-img"
                            className="w-full h-auto max-h-[50vh]  rounded-lg bg-gray-50   object-contain"
                          />
                        </Dialog.Content>
                      </Dialog.Portal>
                    </Dialog.Root>}
                    {msg.user}
                    <br />
                  </div>
                ) : null}
                <div className="bg-gray-100  p-4 md:me-10 rounded-xl">
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
                                Shate AI Response
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
                </div>
                <div
                  ref={index === conversation.length - 1 ? messagesEndRef : null}
                ></div>
              </div>
            ))}
          </div>
        )}
        <div className="p-3 fixed bottom-3 mb-2 shadow-md left-1/2 max-w-[700px] w-[90%] md:w-full -translate-x-1/2 bg-white text-black rounded-xl">
          {image && (
            <div className="relative inline-block mb-2">
              <img
                src={image}
                alt="Preview"
                className="h-16 brightness-[0.8] bg-blackA2 max-w-24 w-auto object-cover rounded-md"
              />
              <button
                onClick={() => { setImageInlineData(""); setImage("") }}
                className="absolute -top-1.5 border-2 border-white -right-1.5 bg-red-500 text-white rounded-full p-0.5"
                aria-label="Remove image"
              >
                <FiX className="text-xs" />
              </button>
            </div>
          )}
          <form onSubmit={handleFormSubmit} className="flex sm:w-auto gap-2">
            <input
              type="text"
              value={prompt}
              autoFocus
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 rounded-lg sm:pe-4 py-1 w-[110px] sm:w-auto text-sm focus:outline-none"
              placeholder="Ask me anything with a image.."
            />
            <input
              type="file"
              ref={fileInputRef2}
              onChange={handleImgUpload}
              accept="image/*"
              capture="camera"
              className="hidden"
            />
            {(!loading && !image) && <button type="button" onClick={() => fileInputRef2.current.click()} className="px-1.5 md:hidden ms-3 py-1 bg-blue-500 text-white rounded-lg">
              <RiCameraAiLine className="text-lg" />
            </button>}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImgUpload}
              accept="image/*"
              className="hidden"
            />
            {(!loading && !image) && <button type="button" onClick={() => fileInputRef.current.click()} className="px-1.5  py-1 bg-blue-500 text-white rounded-lg">
              <LuImagePlus className="text-lg" />
            </button>}
            <button type="submit" disabled={loading} className={`disabled:bg-transparent rounded-lg`}>
              {loading ? <FaGear className="animate-spin text-2xl text-gray-400" /> : <IoArrowUpCircle className={` ${prompt.length < 1 ? "text-gray-300" : "text-blue-500 rotate-90"
                } transition-all text-3xl duration-100 ease-linear`} />}
            </button>
          </form>
        </div>
      </div>

      <p className=""></p>

    </div>
  );
};

export default Jarvis1;

