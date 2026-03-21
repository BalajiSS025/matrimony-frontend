import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col font-sans bg-cream text-gray-800">
          <Navbar />
          <main className="flex-grow">
            <AppRoutes />
          </main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'bg-white text-gray-800 shadow-premium',
              success: {
                iconTheme: { primary: '#4ade80', secondary: '#fff' }
              }
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
