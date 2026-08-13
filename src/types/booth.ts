export interface Photo {
    id: string;
    blobUrl: string;
    capturedAt: number;
}

export interface PhotoSlot {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    radius: number;
    photoId?: string; // Links to Photo.id
}

export interface TextLayer {
    id: string;
    type: 'text';
    x: number;
    y: number;
    text: string;
    fontFamily: string;
    fontSize: number;
    color: string;
    rotation: number;
    opacity: number;
}

export interface StickerLayer {
    id: string;
    type: 'sticker';
    x: number;
    y: number;
    sticker: string; // emoji or sticker name
    scale: number;
    rotation: number;
    opacity: number;
}

export interface ImageLayer {
    id: string;
    type: 'image';
    x: number;
    y: number;
    src: string;       // blob URL from file upload
    width: number;     // display width on canvas
    height: number;    // display height on canvas
    rotation: number;
    opacity: number;
}

export type EditorLayer = TextLayer | StickerLayer | ImageLayer;

export interface FrameConfig {
    id: string;
    name: string;
    category: string;
    width: number;
    height: number;
    slots: PhotoSlot[];
    background: {
        type: 'solid' | 'gradient';
        value: string; // solid color or gradient definition
        value2?: string; // gradient secondary color
    };
    textColor?: string;
    borderRadius?: number;
}
