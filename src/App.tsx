import { useBoothStore } from './stores/boothStore';
import { CameraSetup } from './components/CameraSetup';
import { CameraBooth } from './components/CameraBooth';
import { PhotoReview } from './components/PhotoReview';
import { InteractiveEditor } from './components/InteractiveEditor';
import { FinalResult } from './components/FinalResult';

function App() {
    const { screen, setScreen } = useBoothStore();

    // Render active screen component
    const renderActiveScreen = () => {
        switch (screen) {
            case 'setup':
                return <CameraSetup />;
            case 'camera':
                return <CameraBooth />;
            case 'review':
                return <PhotoReview />;
            case 'editor':
                return <InteractiveEditor />;
            case 'result':
                return <FinalResult />;
            case 'home':
            default:
                return (
                    <section id="beranda">
                        <header className="hero">
                            <div>
                                <p className="eyebrow">Personal Web Photo Booth</p>
                                <h1>Ambil foto.<br />Edit di sini.<br /><em>Tidak pernah</em> diunggah.</h1>
                                <p>Photo booth berbasis browser yang menangkap, mengedit, dan mencetak momen kamu — semuanya di
                                    perangkat sendiri. Tidak ada akun, tidak ada server, tidak ada jejak.</p>
                                <div className="hero-ctas">
                                    <button className="btn btn-amber" onClick={() => setScreen('setup')}>Mulai Sesi</button>
                                    <a href="#privacy" className="link-arrow">Lihat arsitektur privasi <span>↓</span></a>
                                </div>
                                <div className="stack-note">
                                    <div><strong>React + Vite</strong>Client-side rendering</div>
                                    <div><strong>Konva + Canvas</strong>Editor & final render</div>
                                    <div><strong>IndexedDB</strong>Frame &amp; favorit lokal</div>
                                </div>
                            </div>

                            <div className="hero-visual">
                                <div className="hero-strip-print">
                                    {/* Vintage tape decoration */}
                                    <div className="strip-tape"></div>

                                    <div className="strip-photo-area">
                                        <div className="strip-photo-viewport">
                                            <span className="cam-badge"><i></i>PREVIEW</span>
                                            <div className="cam-countdown"><span>3</span></div>
                                            <div className="photo-mesh-grid"></div>
                                        </div>
                                    </div>
                                    <div className="strip-print-footer">
                                        <div className="strip-footer-note">BOOTH.COM — 2026</div>
                                        <div className="strip-slot-indicator">PHOTO 01</div>
                                    </div>
                                </div>
                            </div>
                        </header>
                    </section>
                );
        }
    };

    return (
        <>
            {/* Film grain overlay */}
            <div className="grain" aria-hidden="true"></div>

            {/* Film sprocket rails decoration */}
            <div className="rail left" aria-hidden="true">
                <span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span>
            </div>
            <div className="rail right" aria-hidden="true">
                <span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span>
            </div>

            <div className="wrap">
                {/* Top Nav Brand Header */}
                <nav className="topnav">
                    <div className="brand" onClick={() => setScreen('home')}>
                        <span className="brand-mark"></span>BOOTH.COM
                    </div>
                    <ul className="nav-links">
                        <li><a href="#beranda" onClick={(e) => { if (screen !== 'home') { e.preventDefault(); setScreen('home'); setTimeout(() => document.getElementById('beranda')?.scrollIntoView({ behavior: 'smooth' }), 150); } }}>Beranda</a></li>
                        <li><a href="#flow" onClick={(e) => { if (screen !== 'home') { e.preventDefault(); setScreen('home'); setTimeout(() => document.getElementById('flow')?.scrollIntoView({ behavior: 'smooth' }), 150); } }}>Cara Kerja</a></li>
                        <li><a href="#privacy" onClick={(e) => { if (screen !== 'home') { e.preventDefault(); setScreen('home'); setTimeout(() => document.getElementById('privacy')?.scrollIntoView({ behavior: 'smooth' }), 150); } }}>Privasi</a></li>
                        <li><button className="btn btn-amber btn-sm" onClick={() => setScreen('setup')}>Mulai Sesi</button></li>
                    </ul>
                    <button
                        className="nav-hamburger"
                        aria-label="Toggle menu"
                        onClick={() => {
                            const el = document.querySelector('.nav-links') as HTMLElement | null;
                            if (el) el.classList.toggle('nav-open');
                        }}
                    >
                        <span></span><span></span><span></span>
                    </button>
                </nav>

                {/* Main Screen Container */}
                <main style={{ minHeight: 'calc(100vh - 250px)', padding: '40px 0' }}>
                    {renderActiveScreen()}
                </main>

                {/* Filmstrip User Journey section (Only visible on home screen) */}
                {screen === 'home' && (
                    <section id="flow">
                        <div className="section-head">
                            <div>
                                <p className="kicker">User journey</p>
                                <h2>Empat bingkai, satu gulungan film.</h2>
                            </div>
                            <p>Dari kamera sampai file terunduh — setiap langkah terjadi di browser yang sama, tanpa round-trip ke
                                server mana pun.</p>
                        </div>

                        <div className="filmstrip">
                            <div className="flow">
                                {/* HOME */}
                                <div className="screen">
                                    <div className="screen-chrome">
                                        <i></i><i></i><i></i>
                                        <span>home</span>
                                    </div>
                                    <div className="screen-label">
                                        <span className="step-num">01</span>
                                        <h3>Home</h3>
                                    </div>
                                    <div className="screen-body">
                                        <div className="mock-home">
                                            <span className="mock-logo"></span>
                                            <span className="display">PERSONAL BOOTH</span>
                                            <p>Buat momen kamu secara privat, langsung dari browser.</p>
                                            <span className="mock-lock">diproses lokal</span>
                                        </div>
                                    </div>
                                    <div className="screen-actions">
                                        <button className="btn btn-amber btn-sm btn-block" onClick={() => setScreen('setup')}>Mulai</button>
                                    </div>
                                </div>

                                {/* CAMERA */}
                                <div className="screen">
                                    <div className="screen-chrome">
                                        <i></i><i></i><i></i>
                                        <span>camera</span>
                                    </div>
                                    <div className="screen-label">
                                        <span className="step-num">02</span>
                                        <h3>Camera</h3>
                                    </div>
                                    <div className="screen-body">
                                        <div className="mock-cam">
                                            <span className="rec"><i></i>CAM ON</span>
                                            <span className="num">3</span>
                                            <div className="tally">
                                                <i className="on"></i><i></i><i></i><i></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="screen-actions">
                                        <button className="btn btn-ghost btn-sm btn-block" disabled>Batal</button>
                                    </div>
                                </div>

                                {/* EDITOR */}
                                <div className="screen">
                                    <div className="screen-chrome">
                                        <i></i><i></i><i></i>
                                        <span>editor</span>
                                    </div>
                                    <div className="screen-label">
                                        <span className="step-num">03</span>
                                        <h3>Editor</h3>
                                    </div>
                                    <div className="screen-body">
                                        <div className="mock-editor">
                                            <div className="mock-canvas">
                                                <div className="slot"></div>
                                                <div className="slot"></div>
                                                <div className="slot"></div>
                                                <div className="slot"></div>
                                            </div>
                                            <div className="mock-side">
                                                <div className="chip-row">
                                                    <span className="chip on">Film</span>
                                                    <span className="chip">Vintage</span>
                                                    <span className="chip">Minimal</span>
                                                </div>
                                                <div className="layer-list">
                                                    <div className="layer-item"><i></i>Teks</div>
                                                    <div className="layer-item"><i></i>Logo</div>
                                                    <div className="layer-item"><i></i>Dekorasi</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="screen-actions">
                                        <button className="btn btn-ghost btn-sm btn-block" disabled>Undo · Redo · Filter</button>
                                    </div>
                                </div>

                                {/* RESULT */}
                                <div className="screen">
                                    <div className="screen-chrome">
                                        <i></i><i></i><i></i>
                                        <span>result</span>
                                    </div>
                                    <div className="screen-label">
                                        <span className="step-num">04</span>
                                        <h3>Result</h3>
                                    </div>
                                    <div className="screen-body">
                                        <div className="mock-result">
                                            <div className="polaroid">
                                                <div className="photo"></div>
                                            </div>
                                            <span className="mono">diproses lokal</span>
                                        </div>
                                    </div>
                                    <div className="screen-actions">
                                        <button className="btn btn-amber btn-sm btn-block" disabled>Unduh JPG</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Privacy description segment */}
                <section id="privacy">
                    <div className="section-head">
                        <div>
                            <p className="kicker">Privacy architecture</p>
                            <h2>Server tidak pernah melihat fotomu.</h2>
                        </div>
                    </div>

                    <div className="privacy-strip">
                        <div className="diagram">
                            <div className="diagram-row">
                                <span className="diagram-node">Kamera</span>
                                <span className="diagram-arrow">→</span>
                                <span className="diagram-node">Memori</span>
                                <span className="diagram-arrow">→</span>
                                <span className="diagram-node">Canvas</span>
                                <span className="diagram-arrow">→</span>
                                <span className="diagram-node">Unduhan</span>
                            </div>
                            <div className="diagram-row denied">
                                <span className="diagram-node blocked">Server</span>
                                <span className="diagram-arrow">✕</span>
                                <span className="diagram-node blocked">Database Foto</span>
                                <span className="stamp">TIDAK ADA JALUR</span>
                            </div>
                            <p className="diagram-caption"><strong>NO PHOTO UPLOAD</strong> — seluruh proses capture, edit, dan
                                render berjalan di dalam browser milikmu.</p>
                        </div>

                        <ul className="privacy-list">
                            <li><span className="pl-num">01</span>
                                <div><b>Kamera aktif seperlunya</b>Stream hanya berjalan saat mode kamera dibuka, dan langsung
                                    dihentikan begitu selesai.</div>
                            </li>
                            <li><span className="pl-num">02</span>
                                <div><b>Tidak ada upload otomatis</b>Foto tidak pernah dikirim ke server atau API pihak ketiga
                                    selama alur normal.</div>
                            </li>
                            <li><span className="pl-num">03</span>
                                <div><b>Storage lokal terbatas</b>localStorage hanya untuk preferensi; foto & frame custom
                                    disimpan di IndexedDB perangkat.</div>
                            </li>
                            <li><span className="pl-num">04</span>
                                <div><b>Cleanup otomatis</b>Object URL, blob sementara, dan state editor dibersihkan setiap sesi
                                    selesai.</div>
                            </li>
                        </ul>
                    </div>

                    <div className="stack-chips">
                        <span className="stack-chip">React</span>
                        <span className="stack-chip">TypeScript</span>
                        <span className="stack-chip">Vite</span>
                        <span className="stack-chip">Zustand</span>
                        <span className="stack-chip">Konva.js</span>
                        <span className="stack-chip">Canvas API</span>
                        <span className="stack-chip">IndexedDB</span>
                    </div>
                </section>

                {/* Footer segment */}
                <footer>
                    <div className="footer-left">
                        <div className="brand" style={{ fontSize: '20px', cursor: 'pointer' }} onClick={() => setScreen('home')}>
                            <span className="brand-mark" style={{ width: '20px', height: '20px' }}></span>BOOTH.COM
                        </div>
                        <p className="mono" style={{ marginTop: '10px', maxWidth: '320px', lineHeight: 1.6 }}>
                            Photo booth berbasis browser. Semua diproses lokal — tidak ada server, tidak ada upload, tidak ada jejak.
                        </p>
                    </div>
                    <div className="footer-nav">
                        <div className="footer-nav-col">
                            <span className="footer-nav-title">Navigasi</span>
                            <a href="beranda" onClick={(e) => { e.preventDefault(); setScreen('home'); }}>Beranda</a>
                            <a href="#privacy" onClick={(e) => { if (screen !== 'home') { e.preventDefault(); setScreen('home'); setTimeout(() => document.getElementById('privacy')?.scrollIntoView({ behavior: 'smooth' }), 150); } }}>privasi</a>
                            <a href="#flow" onClick={(e) => { if (screen !== 'home') { e.preventDefault(); setScreen('home'); setTimeout(() => document.getElementById('flow')?.scrollIntoView({ behavior: 'smooth' }), 150); } }}>Cara Kerja</a>
                        </div>
                        <div className="footer-nav-col">
                            <span className="footer-nav-title">Info</span>
                            <a href="#privacy" onClick={(e) => { if (screen !== 'home') { e.preventDefault(); setScreen('home'); setTimeout(() => document.getElementById('privacy')?.scrollIntoView({ behavior: 'smooth' }), 150); } }}>Arsitektur Privasi</a>
                            <span className="mono" style={{ fontSize: '11px', color: 'var(--text-on-ink-dim)', marginTop: '4px' }}>React + Vite + Konva</span>
                            <span className="mono" style={{ fontSize: '11px', color: 'var(--text-on-ink-dim)' }}>V1.0 · Lokal-first</span>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <span className="mono">© 2026 BOOTH. · By Mochammad Rizky</span>
                        <span className="mono">Diproses sepenuhnya di perangkatmu </span>
                    </div>
                </footer>
            </div>
        </>
    );
}

export default App;
