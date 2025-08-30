import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TripsProvider } from './contexts/TripsContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import CreateTrip from './components/CreateTrip/CreateTrip';
import TripDetails from './components/Dashboard/TripDetails';
import Chat from './components/Chat/Chat';
import './App.css';

function App() {
  // Global error handling for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Prevent the browser from showing the error in console
      event.preventDefault();
      
      // You could also show a user-friendly notification here
      // For now, just log it and prevent crash
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

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
