import React from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Hide navbar/footer on admin pages — they have their own sidebar layout
const Shell = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className={`${isAdmin ? '' : 'min-h-screen flex flex-col'} font-sans bg-cream text-gray-800`}>
      {!isAdmin && <Navbar />}
      <main className={isAdmin ? '' : 'flex-grow'}>
        <AppRoutes />
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Shell />
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'bg-white text-gray-800 shadow-premium',
              success: { iconTheme: { primary: '#4ade80', secondary: '#fff' } }
            }}
          />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
