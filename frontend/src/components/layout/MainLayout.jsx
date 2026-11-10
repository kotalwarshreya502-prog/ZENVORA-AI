import React from 'react';
import Footer from './Footer';
import Navbar from './Navbar';

export const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F6FA] text-brand-navy font-sans antialiased selection:bg-brand-violet/20 selection:text-brand-violet">
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
