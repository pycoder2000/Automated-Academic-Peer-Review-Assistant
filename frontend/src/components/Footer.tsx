import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer id="footer" className="bg-gray-900 text-white py-8">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-3 gap-x-12 gap-y-8 mb-4">
                    {/* Student Information */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white">Student Information</h3>
                        <div className="space-y-3 text-gray-400">
                            <p className="font-semibold text-white">Parth Desai</p>
                            <p>ID: 923658772</p>
                            <p>Department of Data Science & AI</p>
                            <p>San Francisco State University</p>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
                        <ul className="space-y-3">
                            {['Home', 'Features', 'How It Works'].map((link) => (
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
                                    href="https://www.linkedin.com/in/desaiparth2000/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition-colors duration-200"
                                >
                                    LinkedIn
                                </a>
                            </p>
                            <p>
                                <a
                                    href="https://github.com/pycoder2000"
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