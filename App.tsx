import React, { useState, useCallback } from 'react';
import { LogoCreator } from './components/LogoCreator';
import { VideoAnimator } from './components/VideoAnimator';
import { AppState, GeneratedContent, VideoAspectRatio } from './types';
import { generateLogoImage, animateLogoVideo } from './services/gemini';
import { Button } from './components/Button';
import { Download, RotateCcw, Film, Layers } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [content, setContent] = useState<GeneratedContent>({
    imageBase64: null,
    videoUrl: null,
    imagePrompt: '',
    videoPrompt: ''
  });
  const [error, setError] = useState<string | null>(null);

  // Handler for Image Generation
  const handleGenerateLogo = useCallback(async (prompt: string, style: string) => {
    setError(null);
    setState(AppState.GENERATING_IMAGE);
    try {
      const imageBytes = await generateLogoImage(prompt, style);
      setContent(prev => ({ 
        ...prev, 
        imageBase64: imageBytes, 
        imagePrompt: prompt 
      }));
      setState(AppState.REVIEW_IMAGE);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate image. Please try again.");
      setState(AppState.IDLE);
    }
  }, []);

  // Handler for Video Generation
  const handleAnimateLogo = useCallback(async (prompt: string, aspectRatio: VideoAspectRatio) => {
    if (!content.imageBase64) return;
    
    setError(null);
    setState(AppState.GENERATING_VIDEO);
    try {
      const videoUrl = await animateLogoVideo(content.imageBase64, prompt, aspectRatio);
      setContent(prev => ({
        ...prev,
        videoUrl,
        videoPrompt: prompt
      }));
      setState(AppState.REVIEW_VIDEO);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate video. Ensure you have selected a valid API key.");
      setState(AppState.REVIEW_IMAGE); // Go back to image review on fail
    }
  }, [content.imageBase64]);

  // Reset flow
  const reset = () => {
    setState(AppState.IDLE);
    setContent({
      imageBase64: null,
      videoUrl: null,
      imagePrompt: '',
      videoPrompt: ''
    });
    setError(null);
  };

  const renderContent = () => {
    switch (state) {
      case AppState.IDLE:
      case AppState.GENERATING_IMAGE:
        return (
          <LogoCreator 
            onGenerate={handleGenerateLogo} 
            isGenerating={state === AppState.GENERATING_IMAGE} 
          />
        );

      case AppState.REVIEW_IMAGE:
        if (!content.imageBase64) return null;
        return (
           <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
             <div className="flex flex-col items-center text-center space-y-4">
                <h2 className="text-3xl font-bold text-white">Logo Generated!</h2>
                <p className="text-slate-400">It looks great. Now, would you like to animate it?</p>
             </div>
             
             <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="bg-slate-900 rounded-2xl p-2 border border-slate-800 shadow-2xl">
                  <img 
                    src={`data:image/jpeg;base64,${content.imageBase64}`} 
                    alt="Generated Result" 
                    className="w-full rounded-xl" 
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                    <p className="text-sm text-slate-500 uppercase tracking-wider font-bold mb-2">Prompt</p>
                    <p className="text-slate-300 italic">"{content.imagePrompt}"</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={() => setState(AppState.GENERATING_VIDEO)} // Actually we need to show the animation form first
                      // Quick fix: The VideoAnimator component handles the form. We just need to transition to a state that shows it.
                      // However, my VideoAnimator component currently expects to be rendered.
                      // Let's actually switch to a dedicated "SETUP_VIDEO" step or just reuse AppState.REVIEW_IMAGE and render a conditional component?
                      // Let's use the existing VideoAnimator component which handles the form input.
                    >
                      Placeholder
                    </Button>
                  </div>
                </div>
             </div>
           </div>
        );
        // Correction: I realized I need to pass the state to render VideoAnimator immediately after image gen if user chooses?
        // Actually, the `VideoAnimator` component I built combines the Review Image + Animation Form.
        // So `REVIEW_IMAGE` state is effectively handled by `VideoAnimator` logic if we look at the code structure I designed.
        // Let's simplify:
        return (
           <VideoAnimator
             imageBase64={content.imageBase64}
             onAnimate={handleAnimateLogo}
             isGenerating={false}
             onBack={reset}
           />
        );

      case AppState.GENERATING_VIDEO:
        return (
           <VideoAnimator
             imageBase64={content.imageBase64!}
             onAnimate={handleAnimateLogo}
             isGenerating={true}
             onBack={() => {}}
           />
        );

      case AppState.REVIEW_VIDEO:
        if (!content.videoUrl) return null;
        return (
          <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-pink-400">
                Your Masterpiece
              </h2>
              <p className="text-slate-400">Ready for the world.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-black relative group">
                   <video 
                     src={content.videoUrl} 
                     controls 
                     autoPlay 
                     loop 
                     className="w-full h-auto max-h-[600px] mx-auto"
                   />
                </div>
                <div className="flex gap-4">
                  <a 
                    href={content.videoUrl} 
                    download="logomotion-video.mp4"
                    className="flex-1"
                  >
                    <Button className="w-full" icon={<Download className="w-4 h-4" />}>
                      Download Video
                    </Button>
                  </a>
                   <a 
                    href={`data:image/jpeg;base64,${content.imageBase64}`} 
                    download="logomotion-logo.jpg"
                    className="flex-1"
                  >
                    <Button variant="secondary" className="w-full" icon={<Download className="w-4 h-4" />}>
                      Download Image
                    </Button>
                  </a>
                </div>
              </div>

              <div className="space-y-6">
                 <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
                    <div>
                      <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">Logo Prompt</h3>
                      <p className="text-slate-300 text-sm">{content.imagePrompt}</p>
                    </div>
                    <div className="w-full h-px bg-slate-800" />
                    <div>
                      <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">Animation Prompt</h3>
                      <p className="text-slate-300 text-sm">{content.videoPrompt}</p>
                    </div>
                 </div>

                 <Button variant="outline" onClick={reset} className="w-full" icon={<RotateCcw className="w-4 h-4" />}>
                   Start Over
                 </Button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-brand-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Layers className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">LogoMotion <span className="text-slate-500 font-normal">Studio</span></h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
               <span className="w-2 h-2 rounded-full bg-green-500"></span>
               Gemini Powered
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center justify-center text-center">
            {error}
          </div>
        )}
        
        <div className="transition-all duration-500 ease-in-out">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}