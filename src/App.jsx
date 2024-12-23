import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import Jarvis1 from './Jarvis1';
import SharedSpace from './SharedSpace';
import Jarvis2 from './Jarvis2';
import Game from "./Game";
import toast, { Toaster } from 'react-hot-toast';

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const currentVersion = localStorage.getItem("current_version");
    if (currentVersion === "1.0") {
      navigate('/v1');
    } else {
      navigate('/v2');
    }
  }, [navigate]);

  return null;
}

function App() {

  useEffect(() => {
    toast.remove();
    toast.success(
      "Chats are stored locally with the last 5 chats preserved.",
      {
        position: "top-right",
        duration: 3000,
        icon: "🥷",
      }
    );
  }, []);

  return (
    <div className="">
      <BrowserRouter>
        <Routes>
          <Route path="" element={<Home />} />
          <Route path="/v1" element={<Jarvis1 />} />
          <Route path="/v2" element={<Jarvis2 />} />
          <Route path="/v2/share/:encchats" element={<SharedSpace />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </BrowserRouter>
      <Toaster className="z-[1000000000]" />
    </div>
  );
}

export default App;