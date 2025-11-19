import React, { useState } from 'react';
import { Button } from './Button';
import { VideoAspectRatio } from '../types';
import { Clapperboard, LayoutTemplate } from 'lucide-react';

interface VideoAnimatorProps {
  imageBase64: string;
  onAnimate: (prompt: string, aspectRatio: VideoAspectRatio) => void;
  isGenerating: boolean;
  onBack: () => void;
}

export const VideoAnimator: React.FC<VideoAnimatorProps> = ({ 
  imageBase64, 
  onAnimate, 
  isGenerating, 
  onBack 
}) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>('16:9');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnimate(prompt, aspectRatio);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Image Preview */}
        <div className="space-y-4">
          <div className="relative group rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
            <img 
              src={`data:image/jpeg;base64,${imageBase64}`} 
              alt="Generated Logo" 
              className="w-full aspect-square object-contain p-4"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
              <p className="text-white font-medium">Your Base Design</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onBack} className="w-full">
            ← Create New Design
          </Button>
        </div>

        {/* Right Column: Animation Controls */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">Bring it to Life</h2>
            <p className="text-slate-400">
              Use Veo to animate your logo into a stunning video intro.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <div className="space-y-2">
              <label htmlFor="anim-prompt" className="block text-sm font-medium text-slate-300">
                How should it move?
              </label>
              <textarea
                id="anim-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Cinematic 360 degree rotation with glowing particle effects..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all min-h-[100px] resize-none"
                required
              />
            </div>

            <div className="space-y-3">
               <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4" />
                Video Format
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setAspectRatio('16:9')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                    aspectRatio === '16:9'
                      ? 'bg-brand-600/20 border-brand-500 text-brand-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="w-8 h-5 border-2 border-current rounded-sm" />
                  <span className="text-sm font-medium">Landscape (16:9)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio('9:16')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                    aspectRatio === '9:16'
                      ? 'bg-brand-600/20 border-brand-500 text-brand-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                  }`}
                >
                   <div className="w-5 h-8 border-2 border-current rounded-sm" />
                  <span className="text-sm font-medium">Portrait (9:16)</span>
                </button>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={!prompt.trim() || isGenerating} 
                isLoading={isGenerating}
                className="w-full text-lg h-14"
                icon={<Clapperboard className="w-5 h-5" />}
              >
                {isGenerating ? 'Generating Video (takes a moment)...' : 'Generate Animation'}
              </Button>
              <p className="text-xs text-center text-slate-500 mt-3">
                Powered by Veo 3.1 Fast. Requires API Key selection.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};