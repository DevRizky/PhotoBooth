import React, { useEffect, useRef, useState } from 'react';
import { useBoothStore } from '../stores/boothStore';

// Web Audio API Synth for offline/local sounds
const playSound = (type: 'beep' | 'shutter') => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        if (type === 'beep') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        } else if (type === 'shutter') {
            // White noise combined with sine waves for a realistic shutter sound
            const bufferSize = ctx.sampleRate * 0.1; // 100ms
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1000;

            const osc = ctx.createOscillator();
            osc.frequency.setValueAtTime(150, ctx.currentTime);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

            noise.connect(filter);
            filter.connect(gain);
            osc.connect(gain);
            gain.connect(ctx.destination);

            noise.start();
            osc.start();
            noise.stop(ctx.currentTime + 0.15);
            osc.stop(ctx.currentTime + 0.15);
        }
    } catch (e) {
        console.warn("Audio play blocked/failed:", e);
    }
};

export const CameraBooth: React.FC = () => {
    const {
        photoCount,
        countdownDuration,
        mirrorCamera,
        selectedCameraId,
        soundEnabled,
        addPhoto,
        setScreen,
        resetSession
    } = useBoothStore();

    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
    const [countdown, setCountdown] = useState<number>(countdownDuration);
    const [flashActive, setFlashActive] = useState<boolean>(false);

    // Track index in a ref so async callbacks always read the latest value
    const indexRef = useRef<number>(0);
    indexRef.current = currentPhotoIndex;

    // Track photoCount in a ref so callbacks can read it without stale closure
    const photoCountRef = useRef<number>(photoCount);
    photoCountRef.current = photoCount;

    // Initialise webcam
    useEffect(() => {
        let activeStream: MediaStream | null = null;
        
        const startVideo = async () => {
            try {
                const constraints: MediaStreamConstraints = {
                    video: selectedCameraId
                        ? { deviceId: { exact: selectedCameraId }, width: 1280, height: 720 }
                        : { width: 1280, height: 720 }
                };
                
                const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
                activeStream = mediaStream;
                setStream(mediaStream);
                
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error("Error setting up stream:", err);
            }
        };

        startVideo();

        return () => {
            if (activeStream) {
                activeStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [selectedCameraId]);

    // Capture flow: one useEffect per photo index change, only when stream is ready
    useEffect(() => {
        if (!stream) return;
        if (currentPhotoIndex >= photoCount) {
            // All photos taken, move to review
            if (currentPhotoIndex > 0) {
                setScreen('review');
            }
            return;
        }

        setCountdown(countdownDuration);

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    triggerShutter();
                    return 0;
                }
                if (soundEnabled) playSound('beep');
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPhotoIndex, stream]);

    const triggerShutter = () => {
        if (soundEnabled) playSound('shutter');
        setFlashActive(true);
        
        // Brief timeout for flash visualization before frame grab
        setTimeout(() => {
            setFlashActive(false);
            grabFrame();
        }, 100);
    };

    const grabFrame = () => {
        if (!videoRef.current) return;
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
            
            // Capture current index from ref so it is never stale
            const capturedIndex = indexRef.current;

            canvas.toBlob((blob) => {
                if (blob) {
                    const blobUrl = URL.createObjectURL(blob);
                    addPhoto({
                        id: `photo-${Date.now()}-${capturedIndex}`,
                        blobUrl,
                        capturedAt: Date.now()
                    });
                    
                    // Move to next slot
                    setCurrentPhotoIndex(capturedIndex + 1);
                }
            }, 'image/jpeg', 0.95);
        }
    };

    const handleCancel = () => {
        resetSession();
        setScreen('setup');
    };

    return (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div className="section-head" style={{ marginBottom: '20px', textAlign: 'center' }}>
                <h2>Ambil Gambar</h2>
                <p>Bersiaplah di depan kamera. Pose terbaikmu!</p>
            </div>

            <div className="cam-card">
                <div className="cam-viewport">
                    <span className="cam-badge"><i></i>LIVE PREVIEW</span>
                    <span className="cam-badge-lock">🔒 lokal</span>
                    
                    {/* The Camera Stream Video */}
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={mirrorCamera ? 'mirrored' : ''}
                    />

                    {/* Flash Layer Overlay */}
                    <div className={`cam-flash ${flashActive ? 'flash-active' : ''}`} />

                    {/* Countdown number */}
                    {countdown > 0 && (
                        <div className="cam-countdown">
                            <span>{countdown}</span>
                        </div>
                    )}
                </div>

                <div className="cam-foot">
                    <div className="cam-dots">
                        {Array.from({ length: photoCount }).map((_, idx) => (
                            <i key={idx} className={idx <= currentPhotoIndex ? 'on' : ''}></i>
                        ))}
                    </div>
                    <span className="mono">Foto {Math.min(currentPhotoIndex + 1, photoCount)} / {photoCount}</span>
                </div>
            </div>

            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
                <button className="btn btn-red" onClick={handleCancel}>Batal & Keluar</button>
            </div>
        </div>
    );
};
