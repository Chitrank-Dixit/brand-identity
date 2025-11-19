import React, { useState } from 'react';
import { Button } from './Button';
import { Sparkles, Wand2, Palette } from 'lucide-react';

interface LogoCreatorProps {
  onGenerate: (prompt: string, style: string) => void;
  isGenerating: boolean;
}

const STYLES = [
  "Minimalist Vector",
  "3D Glossy",
  "Abstract Geometric",
  "Vintage Badge",
  "Neon Cyberpunk",
  "Hand Drawn Sketch"
];

export const LogoCreator: React.FC<LogoCreatorProps> = ({ onGenerate, isGenerating }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt, selectedStyle);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-pink-400">
          Design Your Brand Identity
        </h2>
        <p className="text-slate-400 text-lg">
          Describe your vision, pick a style, and let Gemini create a unique logo for you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
        <div className="space-y-2">
          <label htmlFor="prompt" className="block text-sm font-medium text-slate-300">
            What should the logo depict?
          </label>
          <div className="relative">
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A majestic lion head made of circuit boards, blue and gold colors..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all min-h-[120px] resize-none"
              required
            />
            <Wand2 className="absolute top-4 right-4 text-slate-600 w-5 h-5" />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Choose a Style
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {STYLES.map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setSelectedStyle(style)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all border ${
                  selectedStyle === style
                    ? 'bg-brand-600/20 border-brand-500 text-brand-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <Button 
            type="submit" 
            disabled={!prompt.trim() || isGenerating} 
            isLoading={isGenerating}
            className="w-full text-lg h-14"
            icon={<Sparkles className="w-5 h-5" />}
          >
            {isGenerating ? 'Dreaming up Design...' : 'Generate Logo'}
          </Button>
        </div>
      </form>
    </div>
  );
};