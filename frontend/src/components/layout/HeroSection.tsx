import { ChevronDown, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-hero-animated animate-gradient-pan" 
           style={{ backgroundSize: '200% 200%' }} />
      
      {/* Overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/10" />
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4" />
          AI-Powered Visual Intelligence
        </div>
        
        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Transform Text into
          <br />
          <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
            Visual Intelligence
          </span>
        </h1>
        
        {/* Subheading */}
        <p className="text-xl sm:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
          Upload documents or paste text to generate interactive visualizations powered by AI
        </p>
        
        {/* CTA Button */}
        <button
          onClick={onGetStarted}
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold text-lg hover:bg-white/90 hover:scale-105 hover:shadow-2xl transition-all duration-200 group"
        >
          Get Started
          <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
        </button>
        
        {/* Features */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-white/80">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-white">10+</div>
            <div className="text-sm">Visualization Types</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-white">AI</div>
            <div className="text-sm">Powered Analysis</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-white">Instant</div>
            <div className="text-sm">Insights & Summaries</div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center gap-2 text-white/70">
          <span className="text-xs uppercase tracking-wide">Scroll to upload</span>
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
