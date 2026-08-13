import React, { useState, useRef, useEffect } from 'react';
import { useBoothStore } from '../stores/boothStore';

// Web Audio shutter and beep
const playSound = (type: 'beep' | 'shutter') => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        if (type === 'beep') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc.start(); osc.stop(ctx.currentTime + 0.15);
        } else if (type === 'shutter') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc.start(); osc.stop(ctx.currentTime + 0.15);
        }
    } catch (e) {}
};

export const PhotoReview: React.FC = () => {
    const {
        photos,
        photoCount,
        mirrorCamera,
        selectedCameraId,
        soundEnabled,
        retakeSinglePhoto,
        setScreen,
        resetSession
    } = useBoothStore();

    // Retake modal state
    const [retakeIndex, setRetakeIndex] = useState<number | null>(null);
    const [retakeCountdown, setRetakeCountdown] = useState<number>(3);
    const [retakeFlash, setRetakeFlash] = useState<boolean>(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    // Initialise webcam for individual retake
    useEffect(() => {
        if (retakeIndex === null) {
            if (stream) {
                stream.getTracks().forEach(t => t.stop());
                setStream(null);
            }
            return;
        }

        let activeStream: MediaStream | null = null;
        const startVideo = async () => {
            try {
                const constraints = selectedCameraId
                    ? { video: { deviceId: { exact: selectedCameraId }, width: 1280, height: 720 } }
                    : { video: { width: 1280, height: 720 } };
                const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
                activeStream = mediaStream;
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }

                // Start countdown
                setRetakeCountdown(3);
            } catch (err) {
                console.error("Failed to open camera for retake:", err);
                setRetakeIndex(null);
            }
        };

        startVideo();

        return () => {
            if (activeStream) {
                activeStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [retakeIndex]);

    // Countdown effect for retake
    useEffect(() => {
        if (retakeIndex === null || !stream) return;

        const timer = setInterval(() => {
            setRetakeCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    triggerRetakeShutter();
                    return 0;
                }
                if (soundEnabled) playSound('beep');
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [retakeIndex, stream]);

    const triggerRetakeShutter = () => {
        if (soundEnabled) playSound('shutter');
        setRetakeFlash(true);
        setTimeout(() => {
            setRetakeFlash(false);
            captureRetake();
        }, 100);
    };

    const captureRetake = () => {
        if (!videoRef.current || retakeIndex === null) return;
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            if (mirrorCamera) {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                if (blob && retakeIndex !== null) {
                    const blobUrl = URL.createObjectURL(blob);
                    retakeSinglePhoto(retakeIndex, {
                        id: `photo-${Date.now()}-retake`,
                        blobUrl,
                        capturedAt: Date.now()
                    });
                    // Close retake
                    setRetakeIndex(null);
                }
            }, 'image/jpeg', 0.95);
        }
    };

    const handleRetakeAll = () => {
        resetSession();
        setScreen('camera');
    };

    return (
        <div>
            <div className="section-head" style={{ marginBottom: '30px' }}>
                <div>
                    <p className="kicker">Tinjau Hasil</p>
                    <h2>Foto Anda</h2>
                </div>
                <p>Ulas hasil capture Anda di bawah ini. Anda dapat mengulangi (retake) foto tertentu atau lanjut ke Editor.</p>
            </div>

            <div className="review-grid">
                {Array.from({ length: photoCount }).map((_, idx) => {
                    const photo = photos[idx];
                    return (
                        <div key={idx} className="review-card">
                            {photo ? (
                                <img src={photo.blobUrl} alt={`Captured ${idx + 1}`} />
                            ) : (
                                <div style={{
                                    width: '100%',
                                    aspectRatio: '4/5',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'var(--ink)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--text-on-ink-dim)',
                                    border: '1px dashed var(--line-strong)'
                                }}>
                                    Belum Diambil
                                </div>
                            )}
                            <div className="review-card-meta">
                                <span className="mono">Foto {idx + 1}</span>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => setRetakeIndex(idx)}
                                >
                                    Retake
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '40px' }}>
                <button className="btn btn-red" onClick={handleRetakeAll}>Ulangi Semua</button>
                <button className="btn btn-amber" onClick={() => setScreen('editor')}>Lanjut ke Editor</button>
            </div>

            {/* Individual Retake Camera Overlay Modal */}
            {retakeIndex !== null && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(24, 23, 28, 0.95)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 99999,
                    padding: '20px'
                }}>
                    <h3 className="display" style={{ fontSize: '32px', color: 'var(--amber)', marginBottom: '10px' }}>
                        Mengulang Foto {retakeIndex + 1}
                    </h3>
                    <p style={{ color: 'var(--text-on-ink-dim)', marginBottom: '20px' }}>
                        Bersiaplah di depan kamera. Pengambilan gambar akan dilakukan secara otomatis.
                    </p>

                    <div className="cam-card" style={{ maxWidth: '640px', width: '100%' }}>
                        <div className="cam-viewport" style={{ aspectRatio: '4/3' }}>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className={mirrorCamera ? 'mirrored' : ''}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div className={`cam-flash ${retakeFlash ? 'flash-active' : ''}`} />
                            {retakeCountdown > 0 && (
                                <div className="cam-countdown">
                                    <span>{retakeCountdown}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        className="btn btn-ghost"
                        style={{ marginTop: '20px' }}
                        onClick={() => setRetakeIndex(null)}
                    >
                        Batal
                    </button>
                </div>
            )}
        </div>
    );
};
