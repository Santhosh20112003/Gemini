import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Jarvis1 from './Jarvis1';
import Jarvis2 from './Jarvis2';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="" element={<Navigate to="v2" />} />
        <Route path="v1" element={<Jarvis1 />} />
        <Route path="v2" element={<Jarvis2 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;