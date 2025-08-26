import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TripsProvider } from './contexts/TripsContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import CreateTrip from './components/CreateTrip/CreateTrip';
import TripDetails from './components/Dashboard/TripDetails';
import Chat from './components/Chat/Chat';
import './App.css';

function App() {
  return (
    <TripsProvider>
      <Router>
        <div className="App">
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-trip" element={<CreateTrip />} />
              <Route path="/trip/:tripId" element={<TripDetails />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/chat/:tripId" element={<Chat />} />
            </Routes>
          </Layout>
        </div>
      </Router>
    </TripsProvider>
  );
}

export default App;
