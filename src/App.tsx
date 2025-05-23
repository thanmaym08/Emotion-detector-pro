import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AnalyticsPage from './pages/Analytics';
import HomePage from './pages/Home';

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>
    </div>
  );
};

export default App;
