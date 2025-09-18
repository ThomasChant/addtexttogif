export interface GifFrame {
  id: number;
  delay: number; // milliseconds
  imageData: ImageData;
  dataUrl: string;
}

export interface OverlayTemplate {
  id: string;
  name: string;
  description: string;
  fontFamily: string;
  fontSize: number;
  fontWeight?: number;
  color: string;
  backgroundColor: string;
  padding: number;
  borderRadius: number;
  shadow?: string;
}

export interface OverlayItem {
  id: string;
  text: string;
  start: number;
  end: number;
  x: number;
  y: number;
  templateId: string;
}

export interface RenderResult {
  blobUrl: string;
  fileName: string;
}
