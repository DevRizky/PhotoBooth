import React, { useEffect, useState } from 'react';
import { useBoothStore, PRESET_FRAMES } from '../stores/boothStore';

export const CameraSetup: React.FC = () => {
    const {
        countdownDuration,
        mirrorCamera,
        selectedCameraId,
        soundEnabled,
        selectedFrameId,
        setConfig,
        setSelectedFrameId,
        setScreen
    } = useBoothStore();

    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

    useEffect(() => {
        const checkPermissionAndDevices = async () => {
            try {
                // Request temporary permission to read label info
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                stream.getTracks().forEach(t => t.stop());
                setPermissionGranted(true);
                
                const allDevices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
                setDevices(videoDevices);

                if (videoDevices.length > 0 && !selectedCameraId) {
                    setConfig({ selectedCameraId: videoDevices[0].deviceId });
                }
            } catch (err) {
                console.error("Camera access denied:", err);
                setPermissionGranted(false);
            }
        };

        checkPermissionAndDevices();
    }, [selectedCameraId, setConfig]);

    if (permissionGranted === false) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <h2 className="display" style={{ fontSize: '32px', color: 'var(--red)' }}>Akses Kamera Ditolak</h2>
                <p style={{ color: 'var(--text-on-ink-dim)', margin: '20px 0', maxWidth: '500px', marginInline: 'auto' }}>
                    Aplikasi ini memerlukan akses ke kamera perangkat Anda untuk dapat berfungsi. Silakan aktifkan izin kamera pada browser Anda kemudian coba lagi.
                </p>
                <button className="btn btn-amber" onClick={() => window.location.reload()}>Coba Lagi</button>
            </div>
        );
    }

    return (
        <div>
            <div className="section-head" style={{ marginBottom: '30px' }}>
                <div>
                    <p className="kicker">Konfigurasi Booth</p>
                    <h2>Pengaturan Sesi Foto</h2>
                </div>
                <p>Sesuaikan kamera, hitung mundur, dan gaya bingkai sebelum sesi dimulai.</p>
            </div>

            <div className="grid-setup">
                {/* Left Panel: Camera Setup */}
                <div className="setup-panel">
                    <h3 className="display" style={{ fontSize: '24px', margin: 0, color: 'var(--amber)' }}>1. Kamera & Perangkat</h3>

                    <div className="form-group">
                        <label>Pilih Kamera</label>
                        <select
                            value={selectedCameraId}
                            onChange={(e) => setConfig({ selectedCameraId: e.target.value })}
                        >
                            {devices.map((device, idx) => (
                                <option key={device.deviceId || idx} value={device.deviceId}>
                                    {device.label || `Kamera ${idx + 1}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="settings-toggle">
                        <span style={{ fontSize: '14.5px' }}>Cermin Kamera (Mirror)</span>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={mirrorCamera}
                                onChange={(e) => setConfig({ mirrorCamera: e.target.checked })}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="settings-toggle">
                        <span style={{ fontSize: '14.5px' }}>Suara Countdown & Shutter</span>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={soundEnabled}
                                onChange={(e) => setConfig({ soundEnabled: e.target.checked })}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>

                {/* Right Panel: Frame & Photo Layout Config */}
                <div className="setup-panel">
                    <h3 className="display" style={{ fontSize: '24px', margin: 0, color: 'var(--amber)' }}>2. Tata Letak & Hitung Mundur</h3>

                    <div className="form-group">
                        <label>Pilih Format Bingkai</label>
                        <select
                            value={selectedFrameId}
                            onChange={(e) => setSelectedFrameId(e.target.value)}
                        >
                            {PRESET_FRAMES.map((frame) => (
                                <option key={frame.id} value={frame.id}>
                                    {frame.name} ({frame.slots.length} Foto)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Hitung Mundur (Detik)</label>
                        <div className="preset-grid">
                            {[3, 5, 10].map((sec) => (
                                <button
                                    key={sec}
                                    type="button"
                                    className={`preset-btn ${countdownDuration === sec ? 'active' : ''}`}
                                    onClick={() => setConfig({ countdownDuration: sec })}
                                >
                                    {sec}s
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '40px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button className="btn btn-ghost" onClick={() => setScreen('home')}>Kembali</button>
                <button className="btn btn-amber" onClick={() => setScreen('camera')}>Mulai Sesi Foto</button>
            </div>
        </div>
    );
};
