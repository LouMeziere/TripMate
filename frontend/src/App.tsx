import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import CreateTrip from './components/CreateTrip/CreateTrip';
import Chat from './components/Chat/Chat';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create-trip" element={<CreateTrip />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:tripId" element={<Chat />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
