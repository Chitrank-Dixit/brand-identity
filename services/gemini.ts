import { GoogleGenAI } from "@google/genai";
import { VideoAspectRatio, VideoResolution } from "../types";

// Helper to check for API Key in Veo context
const ensureApiKeySelected = async (): Promise<void> => {
  const win = window as any;
  if (win.aistudio) {
    const hasKey = await win.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await win.aistudio.openSelectKey();
      // We assume success or the user cancels, in which case the next call will likely fail or we rely on UI retry
      // Adding a small delay to ensure state propagation if needed, though usually await is enough
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
};

export const generateLogoImage = async (prompt: string, style: string): Promise<string> => {
  // Image generation typically doesn't enforce the strict user-select-key flow like Veo, 
  // but it's good practice if running in the same environment.
  // However, standard env var usage applies for simpler calls unless forced.
  
  // Create client
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const enhancedPrompt = `Design a professional, high-quality logo. Concept: ${prompt}. Style: ${style}. Ensure a clean background, suitable for vectorization logic (though this is raster). High contrast, distinct shapes.`;

  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: enhancedPrompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: '1:1', // Logos are usually square
    },
  });

  if (!response.generatedImages?.[0]?.image?.imageBytes) {
    throw new Error("No image data returned from Gemini.");
  }

  return response.generatedImages[0].image.imageBytes;
};

export const animateLogoVideo = async (
  imageBase64: string, 
  prompt: string,
  aspectRatio: VideoAspectRatio = '16:9'
): Promise<string> => {
  
  // 1. Ensure Key Selection for Veo
  await ensureApiKeySelected();

  // 2. Create fresh client with the (potentially newly selected) key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 3. Start Video Generation
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt || "Cinematic camera movement, bringing the logo to life",
    image: {
      imageBytes: imageBase64,
      mimeType: 'image/jpeg',
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p', // Fast preview supports 720p usually, but docs say 720p or 1080p.
      aspectRatio: aspectRatio,
    }
  });

  // 4. Poll for completion
  // Initial wait
  await new Promise(resolve => setTimeout(resolve, 5000));

  while (!operation.done) {
    // Polling interval
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
    console.log("Video generation status:", operation.metadata);
  }

  // 5. Retrieve Video URL
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

  if (!downloadLink) {
    throw new Error("Video generation completed but no URI was returned.");
  }

  // 6. Fetch the actual video bytes/blob to display
  // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
  const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  
  if (!videoResponse.ok) {
    throw new Error(`Failed to download video: ${videoResponse.statusText}`);
  }

  const videoBlob = await videoResponse.blob();
  return URL.createObjectURL(videoBlob);
};