export interface Window {
  aistudio?: {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  };
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  REVIEW_IMAGE = 'REVIEW_IMAGE',
  GENERATING_VIDEO = 'GENERATING_VIDEO',
  REVIEW_VIDEO = 'REVIEW_VIDEO',
}

export interface GeneratedContent {
  imageBase64: string | null;
  videoUrl: string | null;
  imagePrompt: string;
  videoPrompt: string;
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '3:4' | '4:3';
export type VideoAspectRatio = '16:9' | '9:16';
export type VideoResolution = '720p' | '1080p';
