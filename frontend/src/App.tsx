import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './components/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/new" element={<Home />} />
        <Route path="/game/:sessionId/round/:round" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
