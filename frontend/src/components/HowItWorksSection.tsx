import React from 'react';

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: "01",
      title: "Upload Your Research",
      description: "Simply drag and drop your research paper PDF. Our system accepts papers in multiple formats and automatically extracts the content for analysis.",
      image: "https://blog.researcher.life/wp-content/uploads/2025/06/pexels-yankrukov-8199595-1.jpg",
      gradient: "from-blue-500 to-blue-700",
      bgColor: "bg-blue-50"
    },
    {
      number: "02",
      title: "AI Analysis Engine",
      description: "Our advanced AI performs comprehensive analysis including novelty search, plagiarism detection, factual verification, and citation quality checks simultaneously.",
      image: "https://cdn.getmidnight.com/50062ddd13358c02dea31c6e82a524c5/2023/09/AdobeStock_600314909.jpeg",
      gradient: "from-blue-500 to-blue-700",
      bgColor: "bg-blue-50"
    },
    {
      number: "03",
      title: "Professional Review Report",
      description: "Receive a detailed, structured review report that matches professional peer review standards, complete with actionable feedback and improvement suggestions.",
      image: "https://doctorprojects.com/wp-content/uploads/2024/07/Report-Writing-Skills.webp",
      gradient: "from-blue-500 to-blue-700",
      bgColor: "bg-blue-50"
    }
  ];

  return (
    <section id="how-it-works" className="py-5 bg-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-100 rounded-full opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="uppercase text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            How It Works in
            <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent"> 3 Simple Steps</span>
          </h2>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto">
            Experience the future of academic peer review with our streamlined, AI-powered process
          </p>
        </div>

        <div className="space-y-20">
          {steps.map((step, index) => (
            <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20`}>
              {/* Content Side */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center text-white font-bold text-xl`}>
                    {step.number}
                  </div>
                  <div className={`h-1 w-20 bg-gradient-to-r ${step.gradient} rounded-full`}></div>
                </div>

                <h3 className="text-3xl font-bold text-gray-900">
                  {step.title}
                </h3>

                <p className="text-xl text-gray-600 leading-relaxed">
                  {step.description}
                </p>

                {/* Progress indicators */}
                <div className="flex space-x-3 pt-4">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === index 
                          ? `w-12 bg-gradient-to-r ${step.gradient}` 
                          : i < index 
                            ? 'w-8 bg-gray-400' 
                            : 'w-4 bg-gray-200'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Visual Side */}
              <div className="flex-1">
                <div className={`${step.bgColor} p-8 rounded-3xl`}>
                  <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-80 object-cover transform hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline connector - visible on larger screens */}
        <div className="hidden lg:block absolute left-1/2 top-1/3 bottom-1/3 w-px bg-gradient-to-b from-indigo-200 via-blue-900 to-emerald-200 transform -translate-x-1/2"></div>
        <footer className="w-full mt-20 border-b-2 border-line border-gray-200">
        </footer>
      </div>
    </section>
  );
};

export default HowItWorksSection;