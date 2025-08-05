import React, { useState, useEffect } from 'react';

const DealioSplashScreen = () => {
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [loadingStage, setLoadingStage] = useState('initializing');
  const [particlePositions, setParticlePositions] = useState([]);

  const stages = [
    {
      stage: 'initializing',
      text: 'Initializing Core Systems',
      detail: 'Starting application framework...',
      threshold: 15,
    },
    { stage: 'modules', text: 'Loading Essential Modules', detail: 'Inventory • Sales • Analytics', threshold: 35 },
    { stage: 'database', text: 'Connecting to Database', detail: 'Establishing secure connections...', threshold: 55 },
    {
      stage: 'services',
      text: 'Starting Background Services',
      detail: 'Payment processing • Cloud sync',
      threshold: 75,
    },
    { stage: 'finalizing', text: 'Finalizing Setup', detail: 'Optimizing performance...', threshold: 90 },
    { stage: 'ready', text: 'System Ready', detail: 'Welcome to Dealio POS', threshold: 100 },
  ];

  // Generate particle positions on mount
  useEffect(() => {
    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
    setParticlePositions(particles);
  }, []);

  useEffect(() => {
    // Staggered content reveal
    const timers = [setTimeout(() => setShowContent(true), 800)];

    // More sophisticated loading simulation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }

        // Realistic loading with occasional pauses
        let increment;
        if (prev < 20) increment = Math.random() * 6 + 1; // Slow start
        else if (prev < 40) increment = Math.random() * 10 + 2; // Faster
        else if (prev < 60) increment = Math.random() * 8 + 1; // Medium
        else if (prev < 85) increment = Math.random() * 5 + 0.5; // Slower
        else increment = Math.random() * 2 + 0.2; // Very slow finish

        return Math.min(prev + increment, 100);
      });
    }, 120);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(progressInterval);
    };
  }, []);

  useEffect(() => {
    const currentStage = stages.find(s => progress < s.threshold) || stages[stages.length - 1];
    setLoadingStage(currentStage.stage);
  }, [progress]);

  const getCurrentStage = () => {
    return stages.find(s => s.stage === loadingStage) || stages[0];
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-950 via-indigo-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Advanced Background Effects */}
      <div className="absolute inset-0">
        {/* Large gradient orbs */}
        <div className="absolute top-20 left-20 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/20 via-violet-500/15 to-indigo-500/20 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-gradient-to-r from-blue-500/20 via-cyan-500/15 to-purple-500/20 rounded-full blur-3xl animate-float-reverse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-indigo-500/25 to-purple-500/25 rounded-full blur-3xl animate-pulse-custom"></div>

        {/* Animated particles */}
        {particlePositions.map(particle => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-drift"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
              transform: `scale(${particle.size})`,
            }}
          />
        ))}
      </div>

      {/* Geometric grid overlay */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px),
              radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px, 60px 60px, 120px 120px, 120px 120px',
          }}
        />
      </div>

      {/* Main content grid */}
      <div className="h-full grid grid-cols-12 grid-rows-12 gap-8 p-12 relative z-10">
        {/* Top Status Bar */}
        <div className="col-span-12 row-span-1 flex items-center justify-between">
          <div
            className={`flex items-center space-x-4 transition-all duration-1000 delay-300 ${
              showContent ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-slate-400 text-sm font-mono">SYSTEM STATUS: ONLINE</span>
          </div>

          <div
            className={`flex items-center space-x-6 transition-all duration-1000 delay-500 ${
              showContent ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            <span className="text-slate-500 text-sm font-mono">v2.1.4</span>
            <div className="flex space-x-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-4 bg-gradient-to-t from-purple-600 to-purple-400 rounded-full ${
                    i <= Math.floor(progress / 25) ? 'opacity-100' : 'opacity-30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Main Logo Section */}
        <div className="col-span-6 row-span-8 flex items-center justify-center">
          <div
            className={`relative transition-all duration-2000 ease-out ${
              showContent ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-110 rotate-12'
            }`}
          >
            {/* Outer rotating elements */}
            <div className="absolute -inset-24">
              <div className="w-full h-full border border-dashed border-purple-400/20 rounded-full animate-spin-ultra-slow"></div>
            </div>
            <div className="absolute -inset-20">
              <div className="w-full h-full border border-dotted border-blue-400/20 rounded-full animate-spin-reverse-slow"></div>
            </div>

            {/* Main logo container */}
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-8 bg-gradient-to-r from-purple-500/30 via-violet-500/30 to-blue-500/30 rounded-3xl blur-2xl animate-pulse-glow"></div>

              {/* Logo background */}
              <div className="relative w-48 h-48 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-slate-700/50">
                {/* Inner gradient overlay */}
                <div className="absolute inset-2 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 rounded-2xl"></div>

                {/* Logo letter */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-8xl font-black bg-gradient-to-br from-white via-purple-200 to-blue-300 bg-clip-text text-transparent drop-shadow-2xl animate-text-glow">
                    D
                  </span>
                </div>

                {/* Corner accents */}
                <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-purple-400/50 rounded-tl-lg"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-blue-400/50 rounded-tr-lg"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-purple-400/50 rounded-bl-lg"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-blue-400/50 rounded-br-lg"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Info Panel */}
        <div className="col-span-6 row-span-8 flex flex-col justify-center space-y-12 pl-12">
          {/* Brand Section */}
          <div
            className={`space-y-6 transition-all duration-1500 delay-700 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div>
              <h1 className="text-8xl font-black tracking-tight leading-none">
                <span className="bg-gradient-to-r from-purple-300 via-violet-200 to-blue-300 bg-clip-text text-transparent">
                  DEALIO
                </span>
              </h1>
              <div className="flex items-center mt-4 space-x-6">
                <div className="h-px w-24 bg-gradient-to-r from-purple-400 to-transparent"></div>
                <p className="text-xl text-slate-300 tracking-[0.4em] uppercase font-light">Point of Sale System</p>
              </div>
            </div>

            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
              Next-generation retail management platform designed for modern businesses
            </p>
          </div>

          {/* Loading Status */}
          <div
            className={`space-y-8 transition-all duration-1500 delay-1000 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-white">{getCurrentStage().text}</h3>
                <span className="text-3xl font-mono text-slate-300 tabular-nums">{Math.round(progress)}%</span>
              </div>

              <p className="text-slate-400 text-base">{getCurrentStage().detail}</p>
            </div>

            {/* Advanced Progress Bar */}
            <div className="space-y-4">
              <div className="relative h-4 bg-slate-800/60 rounded-full overflow-hidden backdrop-blur-sm border border-slate-700/30">
                {/* Progress fill */}
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-violet-500 to-blue-500 rounded-full relative transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                >
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-fast"></div>
                  {/* Pulse overlay */}
                  <div className="absolute right-0 top-0 w-8 h-full bg-white/20 blur-sm animate-pulse"></div>
                </div>

                {/* Progress segments */}
                {stages.slice(0, -1).map((stage, index) => (
                  <div
                    key={stage.stage}
                    className="absolute top-0 w-px h-full bg-slate-600/50"
                    style={{ left: `${stage.threshold}%` }}
                  />
                ))}
              </div>

              {/* Stage indicators */}
              <div className="flex justify-between text-xs text-slate-500">
                {stages.slice(0, -1).map(stage => (
                  <span
                    key={stage.stage}
                    className={`transition-colors ${progress >= stage.threshold ? 'text-purple-400' : ''}`}
                  >
                    {stage.threshold}%
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Feature Showcase */}
        <div className="col-span-12 row-span-3 flex items-center justify-center">
          <div
            className={`grid grid-cols-5 gap-16 transition-all duration-2000 delay-1200 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {[
              {
                icon: '📊',
                label: 'Advanced Analytics',
                desc: 'Real-time insights',
                color: 'from-purple-600 to-purple-400',
              },
              {
                icon: '💳',
                label: 'Payment Processing',
                desc: 'Multi-gateway support',
                color: 'from-violet-600 to-violet-400',
              },
              { icon: '📦', label: 'Inventory Management', desc: 'Smart tracking', color: 'from-blue-600 to-blue-400' },
              {
                icon: '👥',
                label: 'Customer Relations',
                desc: 'CRM integration',
                color: 'from-indigo-600 to-indigo-400',
              },
              { icon: '☁️', label: 'Cloud Sync', desc: 'Seamless backup', color: 'from-cyan-600 to-cyan-400' },
            ].map((feature, index) => (
              <div
                key={feature.label}
                className="flex flex-col items-center space-y-4 group cursor-pointer"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div
                  className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300 border border-white/10 relative overflow-hidden`}
                >
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300 rounded-2xl"></div>
                  <span className="text-3xl relative z-10">{feature.icon}</span>
                </div>
                <div className="text-center">
                  <h4 className="text-white text-sm font-semibold mb-1">{feature.label}</h4>
                  <p className="text-slate-400 text-xs">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced corner decorations */}
      <div className="absolute top-12 left-12 w-32 h-32 border-l-2 border-t-2 border-gradient-to-br from-purple-400/30 to-transparent rounded-tl-2xl"></div>
      <div className="absolute top-12 right-12 w-32 h-32 border-r-2 border-t-2 border-gradient-to-bl from-blue-400/30 to-transparent rounded-tr-2xl"></div>
      <div className="absolute bottom-12 left-12 w-32 h-32 border-l-2 border-b-2 border-gradient-to-tr from-purple-400/30 to-transparent rounded-bl-2xl"></div>
      <div className="absolute bottom-12 right-12 w-32 h-32 border-r-2 border-b-2 border-gradient-to-tl from-blue-400/30 to-transparent rounded-br-2xl"></div>
    </div>
  );
};

// Enhanced animations and effects
const styles = `
  @keyframes spin-ultra-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes spin-reverse-slow {
    from { transform: rotate(360deg); }
    to { transform: rotate(0deg); }
  }
  
  @keyframes float-slow {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -30px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
  }
  
  @keyframes float-reverse {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-25px, 15px) scale(0.95); }
    66% { transform: translate(15px, -25px) scale(1.05); }
  }
  
  @keyframes pulse-custom {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.1); }
  }
  
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  }
  
  @keyframes shimmer-fast {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes text-glow {
    0%, 100% { text-shadow: 0 0 20px rgba(147, 51, 234, 0.3); }
    50% { text-shadow: 0 0 30px rgba(147, 51, 234, 0.6), 0 0 40px rgba(59, 130, 246, 0.3); }
  }
  
  @keyframes drift {
    0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
    25% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
    50% { transform: translateY(-10px) translateX(-15px); opacity: 0.6; }
    75% { transform: translateY(-30px) translateX(20px); opacity: 0.9; }
  }
  
  .animate-spin-ultra-slow {
    animation: spin-ultra-slow 20s linear infinite;
  }
  
  .animate-spin-reverse-slow {
    animation: spin-reverse-slow 15s linear infinite;
  }
  
  .animate-float-slow {
    animation: float-slow 20s ease-in-out infinite;
  }
  
  .animate-float-reverse {
    animation: float-reverse 25s ease-in-out infinite;
  }
  
  .animate-pulse-custom {
    animation: pulse-custom 4s ease-in-out infinite;
  }
  
  .animate-pulse-glow {
    animation: pulse-glow 3s ease-in-out infinite;
  }
  
  .animate-shimmer-fast {
    animation: shimmer-fast 1.5s ease-in-out infinite;
  }
  
  .animate-text-glow {
    animation: text-glow 4s ease-in-out infinite;
  }
  
  .animate-drift {
    animation: drift linear infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default DealioSplashScreen;
