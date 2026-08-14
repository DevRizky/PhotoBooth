import { create } from 'zustand';
import type { Photo, FrameConfig, EditorLayer } from '../types/booth';

export const PRESET_FRAMES: FrameConfig[] = [
    {
        id: 'classic-4',
        name: 'Classic Four Strip',
        category: 'classic',
        width: 600,
        height: 1800,
        background: { type: 'solid', value: '#f6f1e7' }, // paper color
        textColor: '#221e1a',
        borderRadius: 4,
        slots: [
            { id: 'slot-1', x: 40, y: 40, width: 520, height: 390, rotation: 0, radius: 2 },
            { id: 'slot-2', x: 40, y: 470, width: 520, height: 390, rotation: 0, radius: 2 },
            { id: 'slot-3', x: 40, y: 900, width: 520, height: 390, rotation: 0, radius: 2 },
            { id: 'slot-4', x: 40, y: 1330, width: 520, height: 390, rotation: 0, radius: 2 }
        ]
    },
    {
        id: 'square-grid',
        name: 'Retro 2x2 Grid',
        category: 'retro',
        width: 1200,
        height: 1200,
        background: { type: 'solid', value: '#18171c' }, // dark color
        textColor: '#f6f1e7',
        borderRadius: 8,
        slots: [
            { id: 'slot-1', x: 60, y: 60, width: 510, height: 510, rotation: 0, radius: 8 },
            { id: 'slot-2', x: 630, y: 60, width: 510, height: 510, rotation: 0, radius: 8 },
            { id: 'slot-3', x: 60, y: 630, width: 510, height: 510, rotation: 0, radius: 8 },
            { id: 'slot-4', x: 630, y: 630, width: 510, height: 510, rotation: 0, radius: 8 }
        ]
    },
    {
        id: 'polaroid-single',
        name: 'Vintage Polaroid',
        category: 'polaroid',
        width: 800,
        height: 1000,
        background: { type: 'solid', value: '#fcfbf9' }, // polaroid white
        textColor: '#221e1a',
        borderRadius: 0,
        slots: [
            { id: 'slot-1', x: 60, y: 60, width: 680, height: 740, rotation: 0, radius: 0 }
        ]
    },
    {
        id: 'vintage-dual',
        name: 'Vintage Dual Layout',
        category: 'vintage',
        width: 800,
        height: 1200,
        background: { type: 'solid', value: '#e2b98a' }, // vintage wood
        textColor: '#221e1a',
        borderRadius: 12,
        slots: [
            { id: 'slot-1', x: 60, y: 80, width: 680, height: 480, rotation: 2, radius: 6 },
            { id: 'slot-2', x: 60, y: 620, width: 680, height: 480, rotation: -2, radius: 6 }
        ]
    }
];

export const STRIP_TEMPLATES = [
    { id: 'paper', name: 'Paper Classic', src: '/templates/paper.png' },
    { id: 'ink', name: 'Ink Dark', src: '/templates/ink.png' },
    { id: 'vintage', name: 'Vintage Wood', src: '/templates/vintage.png' },
    { id: 'pastel', name: 'Pastel Sweet', src: '/templates/pastel.png' },
    { id: 'sky', name: 'Daylight Sky', src: '/templates/sky.png' },
    { id: 'sage', name: 'Green Day', src: '/templates/sage.png' }
];

export type ScreenType = 'home' | 'setup' | 'camera' | 'review' | 'editor' | 'result';

interface HistoryState {
    layers: EditorLayer[];
    backgroundValue: string;
    backgroundValue2?: string;
    backgroundType: 'solid' | 'gradient';
    appliedFilter: string;
}

interface BoothState {
    // Navigation
    screen: ScreenType;
    setScreen: (screen: ScreenType) => void;

    // Config
    photoCount: number;
    countdownDuration: number;
    mirrorCamera: boolean;
    selectedCameraId: string;
    soundEnabled: boolean;
    setConfig: (config: Partial<Pick<BoothState, 'photoCount' | 'countdownDuration' | 'mirrorCamera' | 'selectedCameraId' | 'soundEnabled'>>) => void;

    // Photos state
    photos: Photo[];
    capturingIndex: number;
    setPhotos: (photos: Photo[]) => void;
    addPhoto: (photo: Photo) => void;
    retakeSinglePhoto: (index: number, photo: Photo) => void;
    setCapturingIndex: (index: number) => void;

    // Frame state
    selectedFrameId: string;
    setSelectedFrameId: (id: string) => void;
    customFrameColor: string;
    setCustomFrameColor: (color: string) => void;

    // Editor state
    layers: EditorLayer[];
    selectedLayerId: string | null;
    appliedFilter: string;
    selectedTemplateId: string | null;
    setSelectedTemplateId: (id: string | null) => void;
    setAppliedFilter: (filter: string) => void;
    addTextLayer: (text?: string) => void;
    addStickerLayer: (emoji: string) => void;
    addImageLayer: (src: string, width: number, height: number) => void;
    updateLayer: (id: string, updates: Partial<EditorLayer>) => void;
    deleteLayer: (id: string) => void;
    setSelectedLayerId: (id: string | null) => void;

    // Background customizer
    backgroundType: 'solid' | 'gradient';
    backgroundValue: string;
    backgroundValue2: string;
    setBackground: (type: 'solid' | 'gradient', val1: string, val2?: string) => void;

    // Undo/Redo
    history: HistoryState[];
    historyIndex: number;
    saveHistory: () => void;
    undo: () => void;
    redo: () => void;

    // Reset
    resetSession: () => void;
}

export const useBoothStore = create<BoothState>((set, get) => ({
    screen: 'home',
    setScreen: (screen) => set({ screen }),

    photoCount: 4,
    countdownDuration: 3,
    mirrorCamera: true,
    selectedCameraId: '',
    soundEnabled: true,
    setConfig: (config) => set(config),

    photos: [],
    capturingIndex: 0,
    setPhotos: (photos) => set({ photos }),
    addPhoto: (photo) => set((state) => {
        const nextPhotos = [...state.photos, photo];
        return { photos: nextPhotos };
    }),
    retakeSinglePhoto: (index, photo) => set((state) => {
        const nextPhotos = [...state.photos];
        // Release old object URL
        if (nextPhotos[index]) {
            URL.revokeObjectURL(nextPhotos[index].blobUrl);
        }
        nextPhotos[index] = photo;
        return { photos: nextPhotos };
    }),
    setCapturingIndex: (capturingIndex) => set({ capturingIndex }),

    selectedFrameId: 'classic-4',
    setSelectedFrameId: (selectedFrameId) => {
        const frame = PRESET_FRAMES.find(f => f.id === selectedFrameId);
        if (frame) {
            set({
                selectedFrameId,
                backgroundType: frame.background.type,
                backgroundValue: frame.background.value,
                backgroundValue2: frame.background.value2 || '',
                // Auto adjust photoCount to fit slots in the frame
                photoCount: frame.slots.length
            });
        } else {
            set({ selectedFrameId });
        }
    },
    customFrameColor: '#f6f1e7',
    setCustomFrameColor: (customFrameColor) => set({ customFrameColor, backgroundValue: customFrameColor, backgroundType: 'solid' }),

    layers: [],
    selectedLayerId: null,
    appliedFilter: 'original',
    selectedTemplateId: null,
    setSelectedTemplateId: (selectedTemplateId) => set({ selectedTemplateId }),

    setAppliedFilter: (appliedFilter) => {
        set({ appliedFilter });
        get().saveHistory();
    },

    backgroundType: 'solid',
    backgroundValue: '#f6f1e7',
    backgroundValue2: '',
    setBackground: (type, val1, val2) => {
        set({ backgroundType: type, backgroundValue: val1, backgroundValue2: val2 || '' });
        get().saveHistory();
    },

    addTextLayer: (text = 'Klik dua kali untuk edit') => {
        const newLayer: EditorLayer = {
            id: `text-${Date.now()}`,
            type: 'text',
            x: 100,
            y: 100,
            text,
            fontFamily: 'Space Grotesk',
            fontSize: 28,
            color: '#221e1a',
            rotation: 0,
            opacity: 1
        };
        set((state) => ({
            layers: [...state.layers, newLayer],
            selectedLayerId: newLayer.id
        }));
        get().saveHistory();
    },

    addStickerLayer: (emoji) => {
        const newLayer: EditorLayer = {
            id: `sticker-${Date.now()}`,
            type: 'sticker',
            x: 150,
            y: 150,
            sticker: emoji,
            scale: 1.5,
            rotation: 0,
            opacity: 1
        };
        set((state) => ({
            layers: [...state.layers, newLayer],
            selectedLayerId: newLayer.id
        }));
        get().saveHistory();
    },

    addImageLayer: (src, width, height) => {
        const newLayer: EditorLayer = {
            id: `image-${Date.now()}`,
            type: 'image',
            x: 80,
            y: 80,
            src,
            width,
            height,
            rotation: 0,
            opacity: 1
        };
        set((state) => ({
            layers: [...state.layers, newLayer],
            selectedLayerId: newLayer.id
        }));
        get().saveHistory();
    },

    updateLayer: (id, updates) => {
        set((state) => ({
            layers: state.layers.map((l) => (l.id === id ? { ...l, ...updates } as any : l))
        }));
        // Debounce history save? Or simple save.
    },

    deleteLayer: (id) => {
        set((state) => ({
            layers: state.layers.filter((l) => l.id !== id),
            selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId
        }));
        get().saveHistory();
    },

    setSelectedLayerId: (selectedLayerId) => set({ selectedLayerId }),

    // History undo/redo
    history: [],
    historyIndex: -1,
    saveHistory: () => {
        const { layers, backgroundValue, backgroundValue2, backgroundType, appliedFilter, history, historyIndex } = get();
        const stateToSave: HistoryState = {
            layers: JSON.parse(JSON.stringify(layers)),
            backgroundValue,
            backgroundValue2,
            backgroundType,
            appliedFilter
        };

        const cleanHistory = history.slice(0, historyIndex + 1);
        // Limit to 30 records
        if (cleanHistory.length >= 30) {
            cleanHistory.shift();
        }

        set({
            history: [...cleanHistory, stateToSave],
            historyIndex: cleanHistory.length
        });
    },

    undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
            const nextIndex = historyIndex - 1;
            const targetState = history[nextIndex];
            set({
                layers: JSON.parse(JSON.stringify(targetState.layers)),
                backgroundValue: targetState.backgroundValue,
                backgroundValue2: targetState.backgroundValue2,
                backgroundType: targetState.backgroundType,
                appliedFilter: targetState.appliedFilter,
                historyIndex: nextIndex
            });
        }
    },

    redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
            const nextIndex = historyIndex + 1;
            const targetState = history[nextIndex];
            set({
                layers: JSON.parse(JSON.stringify(targetState.layers)),
                backgroundValue: targetState.backgroundValue,
                backgroundValue2: targetState.backgroundValue2,
                backgroundType: targetState.backgroundType,
                appliedFilter: targetState.appliedFilter,
                historyIndex: nextIndex
            });
        }
    },

    resetSession: () => {
        const { photos } = get();
        // Clear URLs to prevent memory leaks
        photos.forEach((p) => URL.revokeObjectURL(p.blobUrl));

        const defaultFrame = PRESET_FRAMES[0];
        set({
            photos: [],
            capturingIndex: 0,
            layers: [],
            selectedLayerId: null,
            appliedFilter: 'original',
            selectedTemplateId: null,
            backgroundType: defaultFrame.background.type,
            backgroundValue: defaultFrame.background.value,
            backgroundValue2: defaultFrame.background.value2 || '',
            history: [],
            historyIndex: -1
        });
    }
}));
