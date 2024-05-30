import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import Jarvis1 from './Jarvis1';
import Jarvis2 from './Jarvis2';

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const currentVersion = localStorage.getItem("current_version");
    if (currentVersion === "2.0") {
      navigate('/version2.0');
    } else {
      navigate('/version1.0');
    }
  }, [navigate]);

  return null; 
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="" element={<Home />} />
        <Route path="/version1.0" element={<Jarvis1 />} />
        <Route path="/version2.0" element={<Jarvis2 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;