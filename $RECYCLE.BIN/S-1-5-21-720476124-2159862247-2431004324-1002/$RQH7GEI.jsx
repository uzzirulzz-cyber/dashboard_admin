import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StorefrontApp from './App';
import AdminApp from './admin/AdminApp';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/*" element={<StorefrontApp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
