import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer id="footer" className="bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-x-16 gap-y-8 mb-4">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-100 bg-clip-text text-transparent mb-4">
              PeerReviewAI
            </div>
            <p className="text-gray-300 text-lg leading-relaxed max-w-md">
              Revolutionizing academic peer review with artificial intelligence. 
              Accelerate your research publication process with professional-grade AI analysis.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-start-3">
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-3">
              {['About Us', 'Features', 'How It Works'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contact</h3>
            <div className="space-y-3 text-gray-400"> 
                <p>
                    <a 
                        href="https://www.linkedin.com/in/bhavesh-bhakta/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors duration-200"
                    >
                        LinkedIn
                    </a>
                </p>
                <p>
                    <a 
                        href="https://github.com/BhaveshBhakta" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors duration-200"
                    >
                        GitHub
                    </a>
                </p>

                <p>Support available 24/7</p>
                <p>Response time: &lt; 2 hours</p>
              </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;