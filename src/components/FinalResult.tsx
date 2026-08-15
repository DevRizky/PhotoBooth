import React, { useEffect, useState } from 'react';
import { useBoothStore, PRESET_FRAMES, STRIP_TEMPLATES } from '../stores/boothStore';
import { Download, RefreshCw, Edit } from 'lucide-react';

export const FinalResult: React.FC = () => {
    const {
        photos,
        selectedFrameId,
        layers,
        appliedFilter,
        backgroundType,
        backgroundValue,
        backgroundValue2,
        selectedTemplateId,
        setScreen,
        resetSession
    } = useBoothStore();

    const [isRendering, setIsRendering] = useState<boolean>(true);
    const [resultBlobUrl, setResultBlobUrl] = useState<string>('');
    const [exportFormat, setExportFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');

    const activeFrame = PRESET_FRAMES.find(f => f.id === selectedFrameId) || PRESET_FRAMES[0];

    // High resolution render target
    const targetScale = 2; // Render at 2x high resolution
    const exportWidth = activeFrame.width * targetScale;
    const exportHeight = activeFrame.height * targetScale;

    useEffect(() => {
        const renderHighRes = async () => {
            setIsRendering(true);
            try {
                const canvas = document.createElement('canvas');
                canvas.width = exportWidth;
                canvas.height = exportHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error("Could not create canvas context");

                // Apply overall scaling matching target scale
                ctx.scale(targetScale, targetScale);

                // 1. Draw Strip Template (below background and photos)
                const activeTemplate = STRIP_TEMPLATES.find(t => t.id === selectedTemplateId);
                if (activeTemplate) {
                    const tplImg = await new Promise<HTMLImageElement>((resolve, reject) => {
                        const el = new Image();
                        el.src = activeTemplate.src;
                        el.onload = () => resolve(el);
                        el.onerror = reject;
                    });
                    ctx.drawImage(tplImg, 0, 0, activeFrame.width, activeFrame.height);
                }

                // 2. Draw Background (only when no strip template is active)
                if (!activeTemplate) {
                    if (backgroundType === 'solid') {
                        ctx.fillStyle = backgroundValue;
                        ctx.fillRect(0, 0, activeFrame.width, activeFrame.height);
                    } else {
                        const gradient = ctx.createLinearGradient(0, 0, 0, activeFrame.height);
                        gradient.addColorStop(0, backgroundValue);
                        gradient.addColorStop(1, backgroundValue2 || backgroundValue);
                        ctx.fillStyle = gradient;
                        ctx.fillRect(0, 0, activeFrame.width, activeFrame.height);
                    }
                }

                // 3. Draw Photos into slots
                for (let i = 0; i < activeFrame.slots.length; i++) {
                    const slot = activeFrame.slots[i];
                    const photo = photos[i];
                    if (!photo) continue;

                    // Load photo image element
                    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                        const element = new Image();
                        element.src = photo.blobUrl;
                        element.onload = () => resolve(element);
                        element.onerror = reject;
                    });

                    ctx.save();

                    // Apply Slot clipping path & round corner
                    ctx.beginPath();
                    if (slot.radius > 0) {
                        ctx.roundRect(slot.x, slot.y, slot.width, slot.height, slot.radius);
                    } else {
                        ctx.rect(slot.x, slot.y, slot.width, slot.height);
                    }
                    ctx.closePath();
                    ctx.clip();

                    // Calculate cover size cropping
                    const imgRatio = img.width / img.height;
                    const slotRatio = slot.width / slot.height;

                    let cropWidth = img.width;
                    let cropHeight = img.height;
                    let cropX = 0;
                    let cropY = 0;

                    if (imgRatio > slotRatio) {
                        cropWidth = img.height * slotRatio;
                        cropX = (img.width - cropWidth) / 2;
                    } else {
                        cropHeight = img.width / slotRatio;
                        cropY = (img.height - cropHeight) / 2;
                    }

                    // Draw image stretched to cover slot bounds
                    ctx.drawImage(
                        img,
                        cropX, cropY, cropWidth, cropHeight,
                        slot.x, slot.y, slot.width, slot.height
                    );

                    // Apply filter overlay tints on slot photos
                    let tintColor = '';
                    let tintOpacity = 0;

                    if (appliedFilter === 'vintage') {
                        tintColor = '#9e782f';
                        tintOpacity = 0.25;
                    } else if (appliedFilter === 'mono') {
                        // Apply desaturation via global Composite Operation or manual pixel adjustments
                        ctx.globalCompositeOperation = 'color';
                        ctx.fillStyle = '#888888';
                        ctx.fillRect(slot.x, slot.y, slot.width, slot.height);
                    } else if (appliedFilter === 'cool') {
                        tintColor = '#00ffff';
                        tintOpacity = 0.15;
                    } else if (appliedFilter === 'warm') {
                        tintColor = '#ffaa00';
                        tintOpacity = 0.15;
                    }

                    if (tintColor) {
                        ctx.globalCompositeOperation = 'multiply';
                        ctx.fillStyle = tintColor;
                        ctx.globalAlpha = tintOpacity;
                        ctx.fillRect(slot.x, slot.y, slot.width, slot.height);
                    }

                    ctx.restore();
                }

                // 3.5 Draw Strip Template Decoration (on top of photos, below text/sticker layers)
                // This mirrors what the Konva editor preview already does — without this step,
                // the decoration PNG never gets composited into the final high-res canvas.
                if (activeTemplate?.decorationSrc) {
                    const decoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
                        const el = new Image();
                        el.src = activeTemplate.decorationSrc as string;
                        el.onload = () => resolve(el);
                        el.onerror = reject;
                    });
                    ctx.drawImage(decoImg, 0, 0, activeFrame.width, activeFrame.height);
                }

                // 4. Draw Text, Sticker, and Image Layers
                for (const layer of layers) {
                    ctx.save();

                    // Move context to layer origin
                    ctx.translate(layer.x, layer.y);
                    ctx.rotate((layer.rotation * Math.PI) / 180);
                    ctx.globalAlpha = layer.opacity;

                    if (layer.type === 'text') {
                        ctx.fillStyle = layer.color;
                        ctx.font = `${layer.fontSize}px 'Space Grotesk', sans-serif`;
                        ctx.textBaseline = 'top';
                        ctx.fillText(layer.text, 0, 0);
                    } else if (layer.type === 'sticker') {
                        ctx.font = `${36 * layer.scale}px sans-serif`;
                        ctx.textBaseline = 'top';
                        ctx.fillText(layer.sticker, 0, 0);
                    } else if (layer.type === 'image') {
                        // Draw uploaded image sticker
                        const imgEl = await new Promise<HTMLImageElement>((resolve, reject) => {
                            const el = new Image();
                            el.src = layer.src;
                            el.onload = () => resolve(el);
                            el.onerror = reject;
                        });
                        ctx.drawImage(imgEl, 0, 0, layer.width, layer.height);
                    }

                    ctx.restore();
                }

                // Export final canvas to blob URL
                canvas.toBlob((blob) => {
                    if (blob) {
                        const url = URL.createObjectURL(blob);
                        setResultBlobUrl(url);
                        setIsRendering(false);
                    }
                }, exportFormat, 0.95);

            } catch (err) {
                console.error("High-res render failed:", err);
                setIsRendering(false);
            }
        };

        renderHighRes();

        return () => {
            if (resultBlobUrl) {
                URL.revokeObjectURL(resultBlobUrl);
            }
        };
    }, [photos, selectedFrameId, layers, appliedFilter, backgroundType, backgroundValue, backgroundValue2, selectedTemplateId, exportFormat]);

    const handleDownload = () => {
        const ext = exportFormat === 'image/png' ? 'png' : exportFormat === 'image/webp' ? 'webp' : 'jpg';
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = new Date().toTimeString().slice(0, 8).replace(/:/g, '');

        const link = document.createElement('a');
        link.download = `photo-booth-${dateStr}-${timeStr}.${ext}`;
        link.href = resultBlobUrl;
        link.click();
    };

    const handleNewSession = () => {
        resetSession();
        setScreen('home');
    };

    return (
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
            <div className="section-head" style={{ marginBottom: '30px', textAlign: 'center' }}>
                <div>
                    <p className="kicker">Hasil Selesai</p>
                    <h2>Foto Siap Diunduh!</h2>
                </div>
                <p>Bingkai foto kustom Anda telah selesai dirender secara lokal. Server kami tidak menyimpan salinan apa pun.</p>
            </div>

            <div className="result-layout">
                {isRendering ? (
                    <div style={{
                        height: '350px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--amber)',
                        gap: '15px'
                    }}>
                        <RefreshCw className="animate-spin" size={48} style={{ animation: 'spin 1.5s linear infinite' }} />
                        <span className="mono">Sedang Merender Output High-Res...</span>
                    </div>
                ) : (
                    <>
                        {/* Display styled Polaroid frame preview */}
                        <div className="result-preview">
                            <img src={resultBlobUrl} alt="Hasil Render Final" />
                        </div>

                        {/* Format selector */}
                        <div className="form-group" style={{ width: '100%', maxWidth: '360px' }}>
                            <label>Format Ekspor</label>
                            <select
                                value={exportFormat}
                                onChange={(e) => setExportFormat(e.target.value as any)}
                            >
                                <option value="image/jpeg">JPG (Kualitas Tinggi)</option>
                                <option value="image/png">PNG (Transparan/Kompresi Loseless)</option>
                                <option value="image/webp">WebP (Ringan & Cepat)</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                            <button className="btn btn-ghost" onClick={() => setScreen('editor')}>
                                <Edit size={16} /> Edit Lagi
                            </button>
                            <button className="btn btn-amber" onClick={handleDownload}>
                                <Download size={16} /> Unduh Foto
                            </button>
                        </div>

                        <button
                            className="btn btn-ghost"
                            style={{ borderStyle: 'dashed', marginTop: '20px' }}
                            onClick={handleNewSession}
                        >
                            Mulai Sesi Baru
                        </button>
                    </>
                )}
            </div>

            {/* Adding basic spin animation in JS since index.css doesn't have spin animation */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};