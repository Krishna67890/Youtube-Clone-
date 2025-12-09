import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from './App';
import Watch from './Pages/Watch/Watch';

const AppWrapper: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/watch/:id" element={<Watch />} />
      <Route path="*" element={<App />} />
    </Routes>
  );
};

export default AppWrapper;