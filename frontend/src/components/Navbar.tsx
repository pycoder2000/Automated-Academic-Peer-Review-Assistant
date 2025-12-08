import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { auth } from '../utils/auth';

interface NavbarProps {
  onNavigate: (section: string) => void;
  currentPage: 'landing' | 'review' | 'login' | 'profile';
  setCurrentPage: (page: 'landing' | 'review' | 'login' | 'profile') => void;
  onLogin: () => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage, setCurrentPage, onLogin, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<ReturnType<typeof auth.getCurrentUser>>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setCurrentUser(auth.getCurrentUser());
  }, [currentPage]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
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
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => handleNavClick('hero')}
              className="text-2xl font-bold bg-gradient-to-r from-gray-950 to-gray-950 bg-clip-text text-transparent"
            >
              ReviewMatch AI
            </button>

            <div className="flex items-center gap-4">
              {currentUser ? (
                <div className="relative profile-dropdown">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    {currentUser.image ? (
                      <img
                        src={currentUser.image}
                        alt={currentUser.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      auth.getInitials(currentUser.name)
                    )}
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setCurrentPage('profile');
                            setIsProfileDropdownOpen(false);
                            setIsMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => {
                            onLogout();
                            setIsProfileDropdownOpen(false);
                            setIsMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
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
              <div className="pt-6 border-t border-gray-200 space-y-3">
                {!currentUser ? (
                  <button
                    onClick={() => {
                      setCurrentPage('login');
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-3xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                  >
                    Login / Register
                  </button>
                ) : null}
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