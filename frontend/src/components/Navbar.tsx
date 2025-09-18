import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onNavigate: (section: string) => void;
  currentPage: 'landing' | 'review';
  setCurrentPage: (page: 'landing' | 'review') => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage, setCurrentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (section: string) => {
    if (currentPage !== 'landing') {
      setCurrentPage('landing');
      setTimeout(() => onNavigate(section), 100);
    } else {
      onNavigate(section);
    }
    setIsMenuOpen(false);
  };

  const menuItems = [
    { label: 'Home', section: 'hero' },
    { label: 'Problem & Solution', section: 'problem' },
    { label: 'Key Features', section: 'features' },
    { label: 'How It Works', section: 'how-it-works' },
    { label: 'About', section: 'about' },
    { label: 'Contact', section: 'footer' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/30 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => handleNavClick('hero')}
              className="text-2xl font-bold bg-gradient-to-r from-gray-950 to-gray-950 bg-clip-text text-transparent"
            >
              PeerReviewAI
            </button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${
        isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        <div 
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
        <div className={`absolute right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-8 pt-20">
            <nav className="space-y-6">
              {menuItems.map((item) => (
                <button
                  key={item.section}
                  onClick={() => handleNavClick(item.section)}
                  className="block w-full text-left text-lg font-medium text-gray-800 hover:text-blue-700 transition-colors duration-200 py-2"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setCurrentPage('review');
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-3xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Perform Peer Review
                </button>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;