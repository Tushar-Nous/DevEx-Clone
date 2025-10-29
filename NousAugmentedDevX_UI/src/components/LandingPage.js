import React, { useRef } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../config/msalConfig';
import { LogIn, Shield, Zap, CheckCircle, ArrowRight, Code, Database, Cloud, Brain, Rocket } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import NousLogo from '../utils/Nous-Infosystems-Logo-Vector.jpg';

const LandingPage = () => {
  const { instance } = useMsal();
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const benefitsRef = useRef(null);
  const ctaRef = useRef(null);

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch(() => {
      // Login failed - user will see MSAL's own error handling
    });
  };

  // Parallax transforms
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  const features = [
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'Enterprise-grade security with Microsoft Azure AD integration',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Brain,
      title: 'AI-Powered Intelligence',
      description: 'Advanced AI algorithms for intelligent development insights',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance with real-time processing capabilities',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Code,
      title: 'DevOps Integration',
      description: 'Seamless integration with your existing development workflow',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Database,
      title: 'Data Management',
      description: 'Comprehensive data governance and management solutions',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: Cloud,
      title: 'Cloud Native',
      description: 'Built for the cloud with scalable architecture',
      color: 'from-cyan-500 to-cyan-600'
    }
  ];

  const benefits = [
    'AI-Powered SDLC Portal',
    'Automated Guidelines Generation',
    'DevOps Integration',
    'Real-time Collaboration',
    'Enterprise Security',
    'Cloud-Native Architecture'
  ];

  // Floating particles component
  const FloatingParticles = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-indigo-600/20" />
        <FloatingParticles />
        
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-gradient-to-r from-slate-800/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <motion.div 
              className="flex items-center space-x-6"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Professional Circular Logo */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                {/* Outer Glow Ring */}
                <motion.div
                  className="absolute inset-0 w-28 h-28 rounded-full border-2 border-purple-400/30"
                  animate={{
                    rotate: 360,
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                    opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                  }}
                />
                
                {/* Inner Glow Ring */}
                <motion.div
                  className="absolute inset-1 w-26 h-26 rounded-full border border-blue-400/20"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                
                {/* Logo Container */}
                <motion.div
                  className="relative w-28 h-28 rounded-full bg-white shadow-2xl flex items-center justify-center overflow-hidden"
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.img 
                src={NousLogo} 
                alt="Nous Infosystems Logo" 
                    className="w-24 h-24 object-contain p-3"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </motion.div>
              
              {/* Brand Text */}
              <div className="flex flex-col">
                <motion.h1 
                  className="text-3xl font-bold text-white mb-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
              Nous AI-Augmented DevEx Platform
                </motion.h1>
                <motion.p 
                  className="text-lg text-blue-200 font-medium"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  Modernizing Leveraging Intelligence
                </motion.p>
            </div>
            </motion.div>
            
            {/* Enhanced CTA Button */}
            <motion.button
              onClick={handleLogin}
              className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl backdrop-blur-sm overflow-hidden"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              
              <LogIn className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" />
              <span className="relative z-10">Sign In with Microsoft</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="relative z-10">
        <motion.section 
          ref={heroRef}
          style={{ y, opacity, scale }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center relative"
        >
          {/* Enhanced Background Elements */}
          <div className="absolute inset-0 -z-10">
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-20"
          >
            {/* Professional Hero Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.3, type: "spring", stiffness: 200 }}
              className="inline-block mb-12"
            >
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                {/* Outer Glow Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-orange-500/30 rounded-full blur-2xl"
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                
                {/* Blue-Themed Logo Container */}
                <motion.div
                  className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full p-6 shadow-2xl border-2 border-blue-400/30"
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Geometric Star/Cross Logo */}
                  <motion.div
                    className="relative w-20 h-20 flex items-center justify-center"
                    animate={{
                      rotate: [0, 2, -2, 0],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="w-full h-full text-white drop-shadow-lg"
                    >
                      {/* Central Square */}
                      <rect
                        x="10"
                        y="10"
                        width="4"
                        height="4"
                        fill="currentColor"
                      />
                      
                      {/* Top Diamond */}
                      <path
                        d="M12 4L14 6L12 8L10 6L12 4Z"
                        fill="currentColor"
                      />
                      
                      {/* Right Diamond */}
                      <path
                        d="M20 12L18 14L16 12L18 10L20 12Z"
                        fill="currentColor"
                      />
                      
                      {/* Bottom Diamond */}
                      <path
                        d="M12 20L10 18L12 16L14 18L12 20Z"
                        fill="currentColor"
                      />
                      
                      {/* Left Diamond */}
                      <path
                        d="M4 12L6 10L8 12L6 14L4 12Z"
                        fill="currentColor"
                      />
                      
                      {/* Connecting Lines */}
                      <line
                        x1="12"
                        y1="8"
                        x2="12"
                        y2="10"
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                      <line
                        x1="14"
                        y1="10"
                        x2="18"
                        y2="12"
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                      <line
                        x1="12"
                        y1="14"
                        x2="12"
                        y2="16"
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                      <line
                        x1="10"
                        y1="10"
                        x2="6"
                        y2="12"
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                    </svg>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
            
            {/* Enhanced Title */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.h2 
                className="text-7xl md:text-9xl font-black mb-6 leading-tight"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
              >
                <motion.span 
                  className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent block"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{ backgroundSize: "200% 200%" }}
                >
                  AI SDLC
                </motion.span>
                <motion.span 
                  className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent block"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{ backgroundSize: "200% 200%" }}
                >
                  Orchestrator Portal
                </motion.span>
              </motion.h2>
            </motion.div>
            
            {/* Enhanced Description */}
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <p className="text-2xl text-blue-100 mb-6 max-w-5xl mx-auto leading-relaxed font-medium">
            Streamline your software development lifecycle with AI-powered guidelines generation, 
            automated DevOps integration, and intelligent project management tools.
          </p>
              <motion.div
                className="flex justify-center items-center space-x-8 text-blue-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }}>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">AI-Powered</span>
                </motion.div>
                <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }}>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">DevOps Integration</span>
                </motion.div>
                <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }}>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Enterprise Security</span>
                </motion.div>
              </motion.div>
            </motion.div>
            
            {/* Enhanced CTA Button */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <motion.button
                onClick={handleLogin}
                className="group relative inline-flex items-center px-10 py-5 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white font-bold rounded-2xl hover:from-blue-600 hover:via-purple-700 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl text-xl backdrop-blur-sm overflow-hidden"
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
                  y: -2
                }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ 
                  backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" }
                }}
                style={{ backgroundSize: "200% 200%" }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <Rocket className="w-7 h-7 mr-4 group-hover:rotate-12 transition-transform duration-300" />
              Get Started with Microsoft SSO
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
              </motion.button>
              
              <motion.button
                className="group inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-xl text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/30 hover:border-white/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mr-2">Learn More</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Benefits Section */}
        <motion.section 
          ref={benefitsRef}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        >
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-4xl font-bold text-white mb-8">
              Why Choose Our Platform?
            </h3>
              <div className="space-y-6">
              {benefits.map((benefit, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-center space-x-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 10 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0" />
                    </motion.div>
                    <span className="text-xl text-blue-100 font-medium">{benefit}</span>
                  </motion.div>
              ))}
            </div>
            </motion.div>
            
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20"
                whileHover={{ scale: 1.02, rotateY: 5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"
                  />
                  <div className="text-center relative z-10">
                    <motion.div 
                      className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
                      animate={{ 
                        boxShadow: [
                          "0 0 20px rgba(59, 130, 246, 0.5)",
                          "0 0 40px rgba(147, 51, 234, 0.5)",
                          "0 0 20px rgba(59, 130, 246, 0.5)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Brain className="w-10 h-10 text-white" />
                    </motion.div>
                    <p className="text-blue-100 font-medium text-lg">AI-Powered Dashboard</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section 
          ref={featuresRef}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        >
          <motion.h3 
            className="text-4xl font-bold text-center text-white mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Powerful Features
          </motion.h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-105"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 5,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
                }}
              >
                <motion.div 
                  className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>
                <h4 className="text-xl font-bold text-white mb-4 group-hover:text-blue-200 transition-colors duration-300">
                  {feature.title}
                </h4>
                <p className="text-blue-100 leading-relaxed group-hover:text-blue-200 transition-colors duration-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section 
          ref={ctaRef}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        >
          <motion.div 
            className="text-center bg-white/10 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ backgroundSize: "200% 200%" }}
            />
            <div className="relative z-10">
              <motion.h3 
                className="text-4xl font-bold text-white mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
            Ready to Transform Your Development Process?
              </motion.h3>
              <motion.p 
                className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
            Join thousands of developers who trust our AI-powered SDLC portal to streamline their workflow and boost productivity.
              </motion.p>
              <motion.button
            onClick={handleLogin}
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl text-lg backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                whileTap={{ scale: 0.95 }}
              >
                <LogIn className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-200" />
            Sign In with Microsoft
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </motion.button>
        </div>
          </motion.div>
        </motion.section>
      </main>

      {/* Footer */}
      <motion.footer 
        className="bg-gradient-to-r from-slate-800/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-xl border-t border-white/10 mt-20"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-blue-100">
            <motion.div 
              className="flex items-center justify-center space-x-4 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              {/* Professional Footer Logo */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Outer Glow Ring */}
                <motion.div
                  className="absolute inset-0 w-16 h-16 rounded-full border border-purple-400/20"
                  animate={{
                    rotate: 360,
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                    opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                  }}
                />
                
                {/* Logo Container */}
                <motion.div
                  className="relative w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center overflow-hidden"
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.img 
                src={NousLogo} 
                alt="Nous Infosystems Logo" 
                    className="w-12 h-12 object-contain p-1"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </motion.div>
              <span className="font-bold text-white text-2xl">Nous Infosystems</span>
            </motion.div>
            <motion.p 
              className="text-lg text-blue-200 mb-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              &copy; 2025 Nous Infosystems. All rights reserved.
            </motion.p>
            <motion.p 
              className="text-sm text-blue-300 font-medium"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Powered by Microsoft Azure & AI
            </motion.p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default LandingPage;
