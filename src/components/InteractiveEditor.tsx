import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text as KonvaText, Image as KonvaImage, Group, Transformer } from 'react-konva';
import { useBoothStore, PRESET_FRAMES } from '../stores/boothStore';
import { Undo, Redo, Type, Trash2, ArrowRight, Upload } from 'lucide-react';

const FILTER_PRESETS = [
    { id: 'original', name: 'Original' },
    { id: 'vintage', name: 'Vintage (Sepia)' },
    { id: 'mono', name: 'Monokrom' },
    { id: 'cool', name: 'Cool (Cyan)' },
    { id: 'warm', name: 'Warm (Gold)' }
];

const STICKER_LIST = ['❤️', '⭐', '🥳', '📸', '✨', '🔥', '👑', '😎', '🍕', '🎉', '💡', '🌈'];

const BACKGROUND_COLORS = [
    '#f6f1e7', // paper
    '#18171c', // dark ink
    '#d6524a', // soft red
    '#7fbf8f', // sage green
    '#e8a33d', // amber gold
    '#7fa0bf', // sky blue
    '#ffffff'  // white
];

// Helper to load image elements reactively
const ImageLoader: React.FC<{
    url: string;
    x: number;
    y: number;
    width: number;
    height: number;
    cornerRadius?: number;
    filter: string;
}> = ({ url, x, y, width, height, cornerRadius = 0, filter }) => {
    const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        const img = new Image();
        img.src = url;
        img.onload = () => setImageEl(img);
    }, [url]);

    if (!imageEl) return null;

    // Apply color filters visually in Konva
    // Let's compute crop to cover slot width/height
    const imageRatio = imageEl.width / imageEl.height;
    const slotRatio = width / height;

    let cropWidth = imageEl.width;
    let cropHeight = imageEl.height;
    let cropX = 0;
    let cropY = 0;

    if (imageRatio > slotRatio) {
        cropWidth = imageEl.height * slotRatio;
        cropX = (imageEl.width - cropWidth) / 2;
    } else {
        cropHeight = imageEl.width / slotRatio;
        cropY = (imageEl.height - cropHeight) / 2;
    }

    // Handle filter adjustments by applying context filter rules on draw if possible,
    // or using visual tint overlays in Konva since pure Konva caching can slow down rendering.
    // We'll overlay color sheets inside Konva groups to tint them!
    let tintColor = '';
    let tintOpacity = 0;

    if (filter === 'vintage') {
        tintColor = '#9e782f';
        tintOpacity = 0.25;
    } else if (filter === 'mono') {
        tintColor = '#888888';
        tintOpacity = 0.8;
    } else if (filter === 'cool') {
        tintColor = '#00ffff';
        tintOpacity = 0.15;
    } else if (filter === 'warm') {
        tintColor = '#ffaa00';
        tintOpacity = 0.15;
    }

    return (
        <Group clipFunc={(ctx) => {
            ctx.beginPath();
            if (cornerRadius > 0) {
                // Approximate rounded rectangle clipping
                ctx.roundRect(x, y, width, height, cornerRadius);
            } else {
                ctx.rect(x, y, width, height);
            }
            ctx.closePath();
            ctx.clip();
        }}>
            <KonvaImage
                image={imageEl}
                x={x}
                y={y}
                width={width}
                height={height}
                crop={{
                    x: cropX,
                    y: cropY,
                    width: cropWidth,
                    height: cropHeight
                }}
            />
            {/* Tint overlay for filters */}
            {tintColor && (
                <Rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={tintColor}
                    opacity={tintOpacity}
                    globalCompositeOperation={filter === 'mono' ? 'color' : 'multiply'}
                />
            )}
        </Group>
    );
};

// Component to render an uploaded image inside the Konva Stage
const InlineImageLayer: React.FC<{
    layer: { id: string; type: 'image'; x: number; y: number; src: string; width: number; height: number; rotation: number; opacity: number };
    isSelected: boolean;
    shapeRef: React.MutableRefObject<any> | null;
    onSelect: () => void;
    onChange: (updates: Record<string, any>) => void;
}> = ({ layer, shapeRef, onSelect, onChange }) => {
    const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        const img = new Image();
        img.src = layer.src;
        img.onload = () => setImgEl(img);
    }, [layer.src]);

    if (!imgEl) return null;

    return (
        <KonvaImage
            id={layer.id}
            ref={shapeRef}
            image={imgEl}
            x={layer.x}
            y={layer.y}
            width={layer.width}
            height={layer.height}
            rotation={layer.rotation}
            opacity={layer.opacity}
            draggable
            onDragEnd={(e) => {
                onChange({ x: e.target.x(), y: e.target.y() });
            }}
            onTransformEnd={() => {
                const node = shapeRef?.current;
                if (node) {
                    onChange({
                        x: node.x(),
                        y: node.y(),
                        width: Math.max(20, node.width() * node.scaleX()),
                        height: Math.max(20, node.height() * node.scaleY()),
                        rotation: node.rotation()
                    });
                    node.scaleX(1);
                    node.scaleY(1);
                }
            }}
            onClick={onSelect}
        />
    );
};

export const InteractiveEditor: React.FC = () => {
    const {
        photos,
        selectedFrameId,
        layers,
        selectedLayerId,
        appliedFilter,
        backgroundType,
        backgroundValue,
        backgroundValue2,
        addTextLayer,
        addStickerLayer,
        addImageLayer,
        updateLayer,
        deleteLayer,
        setSelectedLayerId,
        setAppliedFilter,
        setBackground,
        undo,
        redo,
        setScreen
    } = useBoothStore();

    const [activeTab, setActiveTab] = useState<'bg' | 'filters' | 'decor'>('bg');
    const imageUploadRef = useRef<HTMLInputElement>(null);

    // Find active frame spec
    const activeFrame = PRESET_FRAMES.find(f => f.id === selectedFrameId) || PRESET_FRAMES[0];

    // Reference to selected nodes for Konva Transform handles
    const shapeRef = useRef<any>(null);
    const trRef = useRef<any>(null);

    // Update transformer selection
    useEffect(() => {
        if (trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getStage().batchDraw();
        } else if (trRef.current) {
            trRef.current.nodes([]);
            trRef.current.getStage().batchDraw();
        }
    }, [selectedLayerId]);

    // Handle background input changes
    const handleColorClick = (color: string) => {
        setBackground('solid', color);
    };

    const handleCustomColor = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBackground('solid', e.target.value);
    };

    const handleGradientChange = (col1: string, col2: string) => {
        setBackground('gradient', col1, col2);
    };

    return (
        <div>
            <div className="section-head" style={{ marginBottom: '30px' }}>
                <div>
                    <p className="kicker">Studio Kreatif</p>
                    <h2>Edit Foto & Bingkai</h2>
                </div>
                <p>Tambahkan teks, filter vintage, stiker, dan ubah warna latar belakang bingkai Anda.</p>
            </div>

            <div className="editor-layout">
                {/* 1. Main Editor Interactive Canvas */}
                <div className="editor-canvas-container">
                    <div className="editor-stage-wrapper">
                        {/* Outer wrapper clips to the scaled display size */}
                        <div style={{
                            width: 420,
                            height: activeFrame.height * (420 / activeFrame.width),
                            overflow: 'hidden',
                            margin: '0 auto',
                            position: 'relative',
                            flexShrink: 0
                        }}>
                            {/* We will scale down the stage visually to fit the editor preview area */}
                            <Stage
                                width={activeFrame.width}
                                height={activeFrame.height}
                                style={{
                                    transform: `scale(${420 / activeFrame.width})`,
                                    transformOrigin: 'top left',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                }}
                                onMouseDown={(e) => {
                                    // Deselect when clicking canvas background
                                    if (e.target === e.target.getStage()) {
                                        setSelectedLayerId(null);
                                    }
                                }}
                            >
                                <Layer>
                                    {/* Background color */}
                                    {backgroundType === 'solid' ? (
                                        <Rect
                                            width={activeFrame.width}
                                            height={activeFrame.height}
                                            fill={backgroundValue}
                                        />
                                    ) : (
                                        <Rect
                                            width={activeFrame.width}
                                            height={activeFrame.height}
                                            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                                            fillLinearGradientEndPoint={{ x: 0, y: activeFrame.height }}
                                            fillLinearGradientColorStops={[0, backgroundValue, 1, backgroundValue2]}
                                        />
                                    )}

                                    {/* Render photo slots */}
                                    {activeFrame.slots.map((slot, index) => {
                                        const photo = photos[index];
                                        if (!photo) return null;
                                        return (
                                            <ImageLoader
                                                key={slot.id}
                                                url={photo.blobUrl}
                                                x={slot.x}
                                                y={slot.y}
                                                width={slot.width}
                                                height={slot.height}
                                                cornerRadius={slot.radius}
                                                filter={appliedFilter}
                                            />
                                        );
                                    })}

                                    {/* Render editable text & stickers layers */}
                                    {layers.map((layer) => {
                                        const isSelected = selectedLayerId === layer.id;
                                        if (layer.type === 'text') {
                                            return (
                                                <KonvaText
                                                    key={layer.id}
                                                    id={layer.id}
                                                    ref={isSelected ? shapeRef : null}
                                                    x={layer.x}
                                                    y={layer.y}
                                                    text={layer.text}
                                                    fontFamily={layer.fontFamily}
                                                    fontSize={layer.fontSize}
                                                    fill={layer.color}
                                                    rotation={layer.rotation}
                                                    opacity={layer.opacity}
                                                    draggable
                                                    onDragEnd={(e) => {
                                                        updateLayer(layer.id, {
                                                            x: e.target.x(),
                                                            y: e.target.y()
                                                        });
                                                    }}
                                                    onTransformEnd={() => {
                                                        const node = shapeRef.current;
                                                        if (node) {
                                                            updateLayer(layer.id, {
                                                                x: node.x(),
                                                                y: node.y(),
                                                                rotation: node.rotation(),
                                                                fontSize: Math.round(node.fontSize() * node.scaleX())
                                                            });
                                                            node.scaleX(1);
                                                            node.scaleY(1);
                                                        }
                                                    }}
                                                    onClick={() => setSelectedLayerId(layer.id)}
                                                    onDblClick={() => {
                                                        const newText = prompt('Ubah Teks:', layer.text);
                                                        if (newText !== null) {
                                                            updateLayer(layer.id, { text: newText });
                                                        }
                                                    }}
                                                />
                                            );
                                        } else if (layer.type === 'sticker') {
                                            // Sticker (emoji) layer
                                            return (
                                                <KonvaText
                                                    key={layer.id}
                                                    id={layer.id}
                                                    ref={isSelected ? shapeRef : null}
                                                    x={layer.x}
                                                    y={layer.y}
                                                    text={layer.sticker}
                                                    fontSize={36 * layer.scale}
                                                    rotation={layer.rotation}
                                                    opacity={layer.opacity}
                                                    draggable
                                                    onDragEnd={(e) => {
                                                        updateLayer(layer.id, {
                                                            x: e.target.x(),
                                                            y: e.target.y()
                                                        });
                                                    }}
                                                    onTransformEnd={() => {
                                                        const node = shapeRef.current;
                                                        if (node) {
                                                            updateLayer(layer.id, {
                                                                x: node.x(),
                                                                y: node.y(),
                                                                rotation: node.rotation(),
                                                                scale: node.scaleX() * layer.scale
                                                            });
                                                            node.scaleX(1);
                                                            node.scaleY(1);
                                                        }
                                                    }}
                                                    onClick={() => setSelectedLayerId(layer.id)}
                                                />
                                            );
                                        } else if (layer.type === 'image') {
                                            // Uploaded image sticker layer
                                            return (
                                                <InlineImageLayer
                                                    key={layer.id}
                                                    layer={layer}
                                                    isSelected={isSelected}
                                                    shapeRef={isSelected ? shapeRef : null}
                                                    onSelect={() => setSelectedLayerId(layer.id)}
                                                    onChange={(updates) => updateLayer(layer.id, updates)}
                                                />
                                            );
                                        } else {
                                            return null;
                                        }
                                    })}

                                    {/* Transformer handle */}
                                    {selectedLayerId && (
                                        <Transformer
                                            ref={trRef}
                                            boundBoxFunc={(oldBox, newBox) => {
                                                // Limit min scale
                                                if (newBox.width < 30 || newBox.height < 30) {
                                                    return oldBox;
                                                }
                                                return newBox;
                                            }}
                                        />
                                    )}
                                </Layer>
                            </Stage>
                        </div>
                    </div>
                </div>

                {/* 2. Control Sidebar */}
                <div className="editor-sidebar">
                    {/* Top Undo/Redo & Utility controls */}
                    <div className="flex-between">
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn btn-ghost btn-sm" onClick={undo} title="Undo">
                                <Undo size={16} />
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={redo} title="Redo">
                                <Redo size={16} />
                            </button>
                        </div>
                        {selectedLayerId && (
                            <button
                                className="btn btn-red btn-sm"
                                onClick={() => deleteLayer(selectedLayerId)}
                                style={{ padding: '8px 12px' }}
                            >
                                <Trash2 size={14} /> Hapus Item
                            </button>
                        )}
                    </div>

                    {/* Selected Layer Controls — shown when a layer is active */}
                    {selectedLayerId && (() => {
                        const selLayer = layers.find(l => l.id === selectedLayerId);
                        if (!selLayer) return null;

                        return (
                            <div className="layer-controls-panel">
                                <p className="layer-controls-title">
                                    {selLayer.type === 'image' ? 'Gambar Stiker' : selLayer.type === 'text' ? '✏️ Teks' : '😀 Stiker'}
                                </p>

                                {/* Size / Scale slider */}
                                {selLayer.type === 'image' && (
                                    <div className="ctrl-row">
                                        <label>Ukuran</label>
                                        <input
                                            type="range"
                                            min={20}
                                            max={activeFrame.width * 0.9}
                                            value={selLayer.width}
                                            onChange={(e) => {
                                                const newW = Number(e.target.value);
                                                const ratio = selLayer.height / selLayer.width;
                                                updateLayer(selLayer.id, { width: newW, height: Math.round(newW * ratio) });
                                            }}
                                        />
                                        <span className="ctrl-val">{Math.round(selLayer.width)}px</span>
                                    </div>
                                )}

                                {selLayer.type === 'text' && (
                                    <div className="ctrl-row">
                                        <label>Ukuran Font</label>
                                        <input
                                            type="range"
                                            min={12}
                                            max={120}
                                            value={selLayer.fontSize}
                                            onChange={(e) => updateLayer(selLayer.id, { fontSize: Number(e.target.value) })}
                                        />
                                        <span className="ctrl-val">{selLayer.fontSize}px</span>
                                    </div>
                                )}

                                {selLayer.type === 'sticker' && (
                                    <div className="ctrl-row">
                                        <label>Ukuran</label>
                                        <input
                                            type="range"
                                            min={0.5}
                                            max={8}
                                            step={0.1}
                                            value={selLayer.scale}
                                            onChange={(e) => updateLayer(selLayer.id, { scale: Number(e.target.value) })}
                                        />
                                        <span className="ctrl-val">{selLayer.scale.toFixed(1)}×</span>
                                    </div>
                                )}

                                {/* Rotation slider for all types */}
                                <div className="ctrl-row">
                                    <label>Rotasi</label>
                                    <input
                                        type="range"
                                        min={-180}
                                        max={180}
                                        value={selLayer.rotation}
                                        onChange={(e) => updateLayer(selLayer.id, { rotation: Number(e.target.value) })}
                                    />
                                    <span className="ctrl-val">{selLayer.rotation}°</span>
                                </div>

                                {/* Opacity slider for all types */}
                                <div className="ctrl-row">
                                    <label>Opasitas</label>
                                    <input
                                        type="range"
                                        min={0.05}
                                        max={1}
                                        step={0.05}
                                        value={selLayer.opacity}
                                        onChange={(e) => updateLayer(selLayer.id, { opacity: Number(e.target.value) })}
                                    />
                                    <span className="ctrl-val">{Math.round(selLayer.opacity * 100)}%</span>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Sidebar Tabs */}
                    <div className="sidebar-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'bg' ? 'active' : ''}`}
                            onClick={() => setActiveTab('bg')}
                        >
                            Latar
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'filters' ? 'active' : ''}`}
                            onClick={() => setActiveTab('filters')}
                        >
                            Filter
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'decor' ? 'active' : ''}`}
                            onClick={() => setActiveTab('decor')}
                        >
                            Dekorasi
                        </button>
                    </div>

                    <div className="tab-content">
                        {/* TAB 1: Background Editor */}
                        {activeTab === 'bg' && (
                            <>
                                <div className="form-group">
                                    <label>Warna Latar Belakang</label>
                                    <div className="color-swatch-grid">
                                        {BACKGROUND_COLORS.map((color) => (
                                            <div
                                                key={color}
                                                className={`color-swatch ${backgroundType === 'solid' && backgroundValue === color ? 'active' : ''}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => handleColorClick(color)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Kustom Warna</label>
                                    <input
                                        type="color"
                                        value={backgroundType === 'solid' ? backgroundValue : '#ffffff'}
                                        onChange={handleCustomColor}
                                        style={{ width: '100%', height: '40px', cursor: 'pointer', padding: 0 }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Gradasi Vintage</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        <button
                                            className="preset-btn"
                                            onClick={() => handleGradientChange('#e2b98a', '#c98a6a')}
                                        >
                                            Wood Sunset
                                        </button>
                                        <button
                                            className="preset-btn"
                                            onClick={() => handleGradientChange('#2a2632', '#161419')}
                                        >
                                            Carbon Dark
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* TAB 2: Filters */}
                        {activeTab === 'filters' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {FILTER_PRESETS.map((preset) => (
                                    <button
                                        key={preset.id}
                                        className={`preset-btn ${appliedFilter === preset.id ? 'active' : ''}`}
                                        style={{ textAlign: 'left', padding: '12px 16px' }}
                                        onClick={() => setAppliedFilter(preset.id)}
                                    >
                                        {preset.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* TAB 3: Decor (Stickers, Text & Image Upload) */}
                        {activeTab === 'decor' && (
                            <>
                                <button className="btn btn-ghost btn-block" onClick={() => addTextLayer()}>
                                    <Type size={16} /> Tambah Teks Baru
                                </button>

                                {/* Image Upload as Sticker */}
                                <div className="form-group">
                                    <label>Upload Gambar Sendiri</label>
                                    <p style={{ fontSize: '12px', color: 'var(--text-on-ink-dim)', marginBottom: '10px', marginTop: '4px' }}>
                                        Upload foto/logo/stiker dari perangkatmu — diproses lokal, tidak diunggah ke server.
                                    </p>
                                    <button
                                        className="btn btn-ghost btn-block"
                                        onClick={() => imageUploadRef.current?.click()}
                                        style={{ borderStyle: 'dashed', gap: '8px' }}
                                    >
                                        <Upload size={16} /> Pilih Gambar
                                    </button>
                                    <input
                                        ref={imageUploadRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            const reader = new FileReader();
                                            reader.onload = (ev) => {
                                                const src = ev.target?.result as string;
                                                // Load image to get natural dimensions, place at 1/4 of frame size
                                                const img = new Image();
                                                img.onload = () => {
                                                    const maxW = activeFrame.width * 0.35;
                                                    const ratio = img.height / img.width;
                                                    const w = Math.min(img.width, maxW);
                                                    const h = w * ratio;
                                                    addImageLayer(src, w, h);
                                                };
                                                img.src = src;
                                            };
                                            reader.readAsDataURL(file);
                                            // Reset so same file can be uploaded again
                                            e.target.value = '';
                                        }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Tambah Stiker / Emoji</label>
                                    <div className="stickers-grid">
                                        {STICKER_LIST.map((sticker) => (
                                            <div
                                                key={sticker}
                                                className="sticker-item"
                                                onClick={() => addStickerLayer(sticker)}
                                            >
                                                {sticker}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '40px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button className="btn btn-ghost" onClick={() => setScreen('review')}>Kembali</button>
                <button className="btn btn-amber" onClick={() => setScreen('result')}>
                    Proses Akhir <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};
