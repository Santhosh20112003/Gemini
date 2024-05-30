import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Jarvis1 from './Jarvis1';
import Jarvis2 from './Jarvis2';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="" index element={<Navigate to="/version2.0" />} />
        <Route path="/version1.0" element={<Jarvis1 />} />
        <Route path="/version2.0" element={<Jarvis2 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;