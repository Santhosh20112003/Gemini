import React, { useEffect, useRef } from "react";
import "./scrollbar.css";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

function Jarvis1() {

  useEffect(() => {
    localStorage.setItem("current_version","1.0");
    toast.remove();
    toast.success(
      "Unlike Jarvis 2.0, chats aren't saved locally. Keep in mind.",
      { 
        position:"top-right",
        duration: 3000,
        icon: "🥷",
      }
    );
  }, []);

  return (
    <div className="bg-gradient-to-b from-blue-400 to-blue-500">
      <div className="w-full h-[10vh] sticky top-0 flex items-center justify-center pt-6 pb-5 md:pb-3">
        <span className="flex items-center justify-center gap-3 p-1">
          <Link
            className={`bg-white rounded-full px-3 py-1 md:px-5 md:py-2 border-2 border-white shadow-md text-blue-500 font-semibold`}
            to={"/v1"}
          >
            Jarvis 1.0
          </Link>
          <Link
            className={` rounded-full px-3 py-1 md:px-5 md:py-2 border-2 border-transparent text-white font-semibold`}
            to={"/v2"}
          >
            Jarvis 2.0
          </Link>
        </span>
      </div>
      <iframe
        src="https://interfaces.zapier.com/embed/page/clm82fbnw473250ol9ocu5ap97?noBackground=true"
        className="w-full md:pt-12 h-[85vh]"
      ></iframe>
      <div className="max-h-[5vh] min-h-[5vh] h-[5vh] bg-blue-500"></div>
      <div className="md:w-[20%] md:h-32 md:fixed bottom-0 right-5 bg-gradient-to-b from-[#458bf7] to-blue-500"></div>
      <Toaster />
    </div>
  );
}

export default Jarvis1;
