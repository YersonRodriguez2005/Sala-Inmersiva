import { useEffect, useState, useRef } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  ControlBar,
  ParticipantTile,
  useLocalParticipant,
  useTracks,
  useParticipants,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';

const serverUrl = 'wss://webrtc-avp2dcm0.livekit.cloud';

/* ─────────────────────────────────────────────────────────────────────────
   ESTILOS GLOBALES
───────────────────────────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg-void:      #04060C;
      --bg-deep:      #080C14;
      --bg-surface:   rgba(255,255,255,0.04);
      --bg-hover:     rgba(255,255,255,0.07);
      --bg-border:    rgba(255,255,255,0.08);
      --accent:       #00D4AA;
      --accent-dim:   rgba(0,212,170,0.13);
      --accent-glow:  rgba(0,212,170,0.4);
      --danger:       #FF4466;
      --danger-dim:   rgba(255,68,102,0.13);
      --text-hi:      #EEF2F7;
      --text-mid:     #8A93A8;
      --text-lo:      #4A5368;
      --font-ui:      'Syne', sans-serif;
      --font-mono:    'JetBrains Mono', monospace;
      --radius-sm:    6px;
      --radius-md:    10px;
      --radius-lg:    14px;
    }

    html, body, #root {
      height: 100%; width: 100%;
      background: var(--bg-void);
      overflow: hidden;
    }

    @keyframes fadeUp    { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
    @keyframes fadeIn    { from { opacity:0 } to { opacity:1 } }
    @keyframes spin      { to   { transform:rotate(360deg) } }
    @keyframes blink     { 0%,100% { opacity:1 } 50% { opacity:.3 } }
    @keyframes barPulse  { 0%,100% { transform:scaleY(.4) } 50% { transform:scaleY(1) } }
    @keyframes meshDrift1 { 0%,100% { transform:translate(0,0) scale(1) } 50% { transform:translate(-40px,25px) scale(1.06) } }
    @keyframes meshDrift2 { 0%,100% { transform:translate(0,0) scale(1) } 50% { transform:translate(30px,-30px) scale(1.08) } }
    @keyframes pipIn     { from { opacity:0; transform:scale(.88) translateY(10px) } to { opacity:1; transform:scale(1) translateY(0) } }
    @keyframes ctrlIn    { from { opacity:0; transform:translateY(22px) } to { opacity:1; transform:translateY(0) } }

    /* Shell */
    .wec-shell {
      position: relative;
      height: 100vh; width: 100vw;
      overflow: hidden;
      display: flex; flex-direction: column;
      font-family: var(--font-ui);
      color: var(--text-hi);
    }

    /* Grain */
    .wec-shell::after {
      content: ''; position: absolute; inset: 0; z-index: 0;
      pointer-events: none; opacity: .35;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E");
    }

    /* Blobs */
    .blob { position:absolute; border-radius:50%; filter:blur(110px); pointer-events:none; z-index:0; }
    .blob-1 { width:650px; height:650px; top:-220px; left:-180px;
      background:radial-gradient(circle,rgba(0,212,170,.06) 0%,transparent 70%);
      animation:meshDrift1 14s ease-in-out infinite; }
    .blob-2 { width:550px; height:550px; bottom:-180px; right:-120px;
      background:radial-gradient(circle,rgba(88,56,230,.07) 0%,transparent 70%);
      animation:meshDrift2 17s ease-in-out infinite; }

    /* Header */
    .wec-header {
      position:relative; z-index:20;
      display:flex; align-items:center; justify-content:space-between;
      padding:0 28px; height:58px;
      border-bottom:1px solid var(--bg-border);
      background:rgba(4,6,12,.82);
      backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
      flex-shrink:0;
    }
    .wec-brand { display:flex; align-items:center; gap:11px; }
    .wec-mark {
      width:32px; height:32px; border:1.5px solid var(--accent);
      border-radius:var(--radius-sm);
      display:flex; align-items:center; justify-content:center;
      font-size:10px; font-weight:800; color:var(--accent); letter-spacing:.05em;
      box-shadow:0 0 14px var(--accent-glow);
    }
    .wec-brand-name { font-size:13px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; }
    .wec-brand-sep  { color:var(--text-lo); }

    .wec-header-right { display:flex; align-items:center; gap:16px; }
    .wec-signal { display:flex; align-items:flex-end; gap:2.5px; }
    .wec-bar { width:3px; border-radius:2px; background:var(--accent); transform-origin:bottom; }
    .wec-bar:nth-child(1) { height:6px;  animation:barPulse 1s .0s ease-in-out infinite; }
    .wec-bar:nth-child(2) { height:10px; animation:barPulse 1s .2s ease-in-out infinite; }
    .wec-bar:nth-child(3) { height:14px; animation:barPulse 1s .4s ease-in-out infinite; }
    .wec-live-badge {
      display:flex; align-items:center; gap:5px;
      font-family:var(--font-mono); font-size:10px; font-weight:500;
      letter-spacing:.1em; color:var(--accent); text-transform:uppercase;
    }
    .wec-live-dot {
      width:6px; height:6px; border-radius:50%;
      background:var(--accent); box-shadow:0 0 8px var(--accent);
      animation:blink 1.6s ease-in-out infinite;
    }
    .wec-session-id { font-family:var(--font-mono); font-size:10px; color:var(--text-lo); letter-spacing:.07em; }

    /* Body */
    .wec-body { position:relative; z-index:5; flex:1; min-height:0; display:flex; flex-direction:column; }

    /* Stage */
    .wec-stage { flex:1; min-height:0; position:relative; overflow:hidden; animation:fadeIn .5s ease both; }

    /* Empty state */
    .wec-empty {
      height:100%; display:flex; flex-direction:column;
      align-items:center; justify-content:center; gap:12px;
    }
    .wec-empty-ring {
      width:80px; height:80px; border-radius:50%;
      border:1px solid var(--bg-border);
      display:flex; align-items:center; justify-content:center;
    }
    .wec-empty-icon  { font-size:28px; opacity:.3; }
    .wec-empty-title { font-size:12px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--text-mid); }
    .wec-empty-sub   { font-family:var(--font-mono); font-size:10px; color:var(--text-lo); letter-spacing:.06em; }

    /* Remote grid */
    .wec-grid { height:100%; display:grid; gap:8px; padding:10px; align-content:start; }
    .wec-remote-tile {
      border-radius:var(--radius-md); overflow:hidden;
      background:var(--bg-deep); border:1px solid var(--bg-border);
      aspect-ratio:16/9;
    }
    .wec-remote-tile > * { width:100%; height:100%; }

    /* PiP */
    .wec-pip {
      position:absolute; bottom:16px; right:16px;
      width:196px; border-radius:var(--radius-md); overflow:hidden;
      border:1.5px solid rgba(0,212,170,.28);
      box-shadow:0 0 0 1px rgba(0,212,170,.06), 0 16px 48px rgba(0,0,0,.75);
      background:var(--bg-deep);
      animation:pipIn .4s .15s ease both; z-index:30;
    }
    .wec-pip video {
      width:100%; display:block; object-fit:cover;
      transform:scaleX(-1); aspect-ratio:4/3;
    }
    .wec-pip-label {
      position:absolute; bottom:0; left:0; right:0;
      padding:22px 8px 7px;
      background:linear-gradient(transparent,rgba(4,6,12,.88));
      font-family:var(--font-mono); font-size:9px;
      color:var(--text-mid); letter-spacing:.07em;
      display:flex; align-items:center; gap:4px;
    }
    .wec-pip-dot { width:5px; height:5px; border-radius:50%; background:var(--accent); box-shadow:0 0 6px var(--accent); }
    .wec-pip-off {
      aspect-ratio:4/3; display:flex; flex-direction:column;
      align-items:center; justify-content:center; gap:5px;
    }
    .wec-pip-off-icon { font-size:20px; opacity:.25; }
    .wec-pip-off-text { font-family:var(--font-mono); font-size:9px; color:var(--text-lo); letter-spacing:.06em; }

    /* Controls */
    .wec-controls {
      flex-shrink:0;
      display:flex; align-items:center; justify-content:center;
      padding:12px 24px;
      background:rgba(4,6,12,.88);
      backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
      border-top:1px solid var(--bg-border);
      animation:ctrlIn .4s .1s ease both;
      position:relative; z-index:20;
    }

    /* LiveKit overrides */
    .lk-control-bar { background:transparent !important; border:none !important; padding:0 !important; gap:8px !important; }
    .lk-button {
      background:var(--bg-surface) !important;
      border:1px solid var(--bg-border) !important;
      border-radius:var(--radius-sm) !important;
      color:var(--text-hi) !important;
      padding:8px 16px !important;
      font-family:var(--font-ui) !important;
      font-size:11.5px !important; font-weight:600 !important;
      letter-spacing:.04em !important; cursor:pointer !important;
      transition:all .16s ease !important;
      display:flex !important; align-items:center !important; gap:6px !important;
    }
    .lk-button:hover { background:var(--bg-hover) !important; border-color:rgba(255,255,255,.14) !important; transform:translateY(-1px) !important; }
    .lk-button svg { width:16px; height:16px; }

    /* Muted/off state */
    .lk-button[aria-pressed="true"] {
      color:var(--danger) !important;
      border-color:rgba(255,68,102,.28) !important;
      background:var(--danger-dim) !important;
    }

    /* Disconnect */
    .lk-disconnect-button {
      background:var(--danger-dim) !important;
      border-color:rgba(255,68,102,.3) !important;
      color:var(--danger) !important;
    }
    .lk-disconnect-button:hover {
      background:rgba(255,68,102,.22) !important;
      border-color:rgba(255,68,102,.5) !important;
      box-shadow:0 0 20px rgba(255,68,102,.2) !important;
      transform:translateY(-1px) !important;
    }

    /* Status bar */
    .wec-statusbar {
      display:flex; align-items:center; justify-content:space-between;
      padding:6px 28px;
      border-top:1px solid var(--bg-border);
      background:rgba(4,6,12,.96);
      flex-shrink:0; position:relative; z-index:20;
    }
    .wec-sb-item {
      font-family:var(--font-mono); font-size:9.5px;
      color:var(--text-lo); letter-spacing:.07em;
      display:flex; align-items:center; gap:5px;
    }
    .wec-sb-dot { width:4px; height:4px; border-radius:50%; background:var(--accent); box-shadow:0 0 5px var(--accent); }

    /* Loading */
    .wec-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:24px; height:100%; animation:fadeUp .5s ease both; }
    .wec-spinner { position:relative; width:52px; height:52px; }
    .wec-spinner::before,.wec-spinner::after { content:''; position:absolute; inset:0; border-radius:50%; }
    .wec-spinner::before { border:1.5px solid rgba(0,212,170,.1); }
    .wec-spinner::after  { border:1.5px solid transparent; border-top-color:var(--accent); border-right-color:rgba(0,212,170,.3); animation:spin .85s linear infinite; box-shadow:0 0 18px var(--accent-glow); }
    .wec-loading-title { font-size:12px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--text-hi); text-align:center; }
    .wec-loading-sub   { margin-top:5px; font-family:var(--font-mono); font-size:10px; color:var(--text-lo); letter-spacing:.07em; text-align:center; }
    .wec-dots { display:flex; gap:5px; margin-top:14px; justify-content:center; }
    .wec-dot  { width:4px; height:4px; border-radius:50%; background:var(--accent); animation:blink 1.2s ease-in-out infinite; }
    .wec-dot:nth-child(2) { animation-delay:.2s; }
    .wec-dot:nth-child(3) { animation-delay:.4s; }

    /* Error */
    .wec-error { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; height:100%; animation:fadeUp .5s ease both; }
    .wec-err-icon { width:54px; height:54px; border-radius:50%; background:var(--danger-dim); border:1px solid rgba(255,68,102,.22); display:flex; align-items:center; justify-content:center; font-size:22px; box-shadow:0 0 28px rgba(255,68,102,.18); }
    .wec-err-code  { font-family:var(--font-mono); font-size:9px; letter-spacing:.12em; text-transform:uppercase; color:var(--danger); opacity:.7; }
    .wec-err-title { font-size:13px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
    .wec-err-msg   { font-family:var(--font-mono); font-size:10.5px; color:var(--text-lo); text-align:center; max-width:320px; line-height:1.65; }
    .wec-err-detail{ padding:8px 16px; background:var(--danger-dim); border:1px solid rgba(255,68,102,.14); border-radius:var(--radius-sm); font-family:var(--font-mono); font-size:10px; color:var(--danger); letter-spacing:.04em; }
    .wec-btn-retry { margin-top:4px; padding:8px 22px; background:transparent; border:1px solid rgba(0,212,170,.28); border-radius:var(--radius-sm); color:var(--accent); font-family:var(--font-ui); font-size:11px; font-weight:600; letter-spacing:.12em; text-transform:uppercase; cursor:pointer; transition:all .18s ease; }
    .wec-btn-retry:hover { background:var(--accent-dim); border-color:var(--accent); box-shadow:0 0 22px var(--accent-glow); }
  `}</style>
);

/* ─────────────────────────────────────────────────────────────────────────
   ROOM INNER — hooks dentro del contexto LiveKitRoom
───────────────────────────────────────────────────────────────────────── */
function RoomInner({ sessionId, onConnected }) {
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  const pipVideoRef = useRef(null);

  const cameraTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false }
  );

  const localCamTrack = cameraTracks.find((t) => t.participant?.isLocal);
  const remoteCamTracks = cameraTracks.filter((t) => !t.participant?.isLocal);
  const remoteCount = participants.filter((p) => !p.isLocal).length;
  const gridCols = remoteCount <= 1 ? 1 : remoteCount <= 4 ? 2 : 3;

  // Attach local track to PiP video element
  useEffect(() => {
    const track = localCamTrack?.publication?.track;
    const el = pipVideoRef.current;
    if (track && el) {
      track.attach(el);
      return () => track.detach(el);
    }
  }, [localCamTrack?.publication?.track]);

  // Notify parent when connected
  useEffect(() => { onConnected?.(); }, []);

  const now = new Date();
  const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  const hasCamera = !!localCamTrack?.publication?.track;

  return (
    <>
      {/* ── Stage ─────────────────────────────────────────── */}
      <div className="wec-stage">
        {remoteCount === 0 ? (
          /* Enfoque recomendado: Usar ParticipantTile para el track local en lugar de <video> manual */
          <div className="wec-grid" style={{ gridTemplateColumns: '1fr', height: '100%', alignContent: 'center' }}>
            {hasCamera ? (
              <div className="wec-remote-tile" style={{ margin: '0 auto', width: '100%', maxWidth: '900px' }}>
                <ParticipantTile trackRef={localCamTrack} />
              </div>
            ) : (
              <div className="wec-empty">
                <div className="wec-empty-ring">
                  <span className="wec-empty-icon">📷</span>
                </div>
                <div className="wec-empty-title">Cámara Desactivada</div>
                <div className="wec-empty-sub">Enciende tu cámara para verte en pantalla</div>
              </div>
            )}
          </div>
        ) : (
          /* Mantiene la cuadrícula normal cuando hay remotos */
          <div
            className="wec-grid"
            style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
          >
            {remoteCamTracks.map((trackRef) => (
              <div key={trackRef.participant.sid} className="wec-remote-tile">
                <ParticipantTile trackRef={trackRef} />
              </div>
            ))}
          </div>
        )}

        {/* PiP cámara propia: SOLO se renderiza si hay remotos en la sala */}
        {remoteCount > 0 && (
          <div className="wec-pip">
            {hasCamera ? (
              <>
                <video ref={pipVideoRef} autoPlay muted playsInline />
                <div className="wec-pip-label">
                  <span className="wec-pip-dot" />
                  {localParticipant?.identity ?? 'Tú'}
                </div>
              </>
            ) : (
              <div className="wec-pip-off">
                <span className="wec-pip-off-icon">📷</span>
                <span className="wec-pip-off-text">Cámara desactivada</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Controles ─────────────────────────────────────── */}
      <div className="wec-controls">
        <ControlBar
          variation="verbose"
          controls={{
            microphone: true,
            camera: true,
            screenShare: true,
            leave: true,
            chat: false,
          }}
        />
      </div>

      {/* ── Barra de estado ───────────────────────────────── */}
      <div className="wec-statusbar">
        <div className="wec-sb-item"><span className="wec-sb-dot" />{sessionId}</div>
        <div className="wec-sb-item">
          wec-test-room &nbsp;·&nbsp; {remoteCount + 1} participante{remoteCount !== 0 ? 's' : ''}
        </div>
        <div className="wec-sb-item">{dateStr} · {timeStr}</div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   APP ROOT
───────────────────────────────────────────────────────────────────────── */
export default function App() {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [sessionId] = useState(
    () => `SES-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  );

  const fetchToken = async () => {
    setError(null);
    setToken(null);
    setIsLive(false);
    try {
      const res = await fetch('http://localhost:3000/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: 'wec-test-room',
          participantName: `user-${Math.floor(Math.random() * 1000)}`,
        }),
      });
      if (!res.ok) throw new Error('Falló la autenticación con el servidor');
      const data = await res.json();
      setToken(data.token);
    } catch (err) {
      setError(err.message);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchToken(); }, []);

  return (
    <>
      <GlobalStyles />
      <div className="wec-shell">
        <div className="blob blob-1" />
        <div className="blob blob-2" />

        {/* Header */}
        <header className="wec-header">
          <div className="wec-brand">
            <div className="wec-mark">WEC</div>
            <span className="wec-brand-sep">·</span>
            <span className="wec-brand-name">Immersive Live</span>
          </div>
          <div className="wec-header-right">
            {isLive && (
              <>
                <div className="wec-signal">
                  <div className="wec-bar" /><div className="wec-bar" /><div className="wec-bar" />
                </div>
                <div className="wec-live-badge">
                  <span className="wec-live-dot" /> Live
                </div>
              </>
            )}
            <span className="wec-session-id">{sessionId}</span>
          </div>
        </header>

        {/* Body */}
        <div className="wec-body">
          {error ? (
            <div className="wec-error">
              <div className="wec-err-icon">⚠</div>
              <div className="wec-err-code">Error · E_AUTH_FAIL</div>
              <div className="wec-err-title">Fallo de conexión</div>
              <div className="wec-err-msg">
                No fue posible conectar al servidor de sesión.
                Verifica tu red e intenta de nuevo.
              </div>
              <div className="wec-err-detail">{error}</div>
              <button className="wec-btn-retry" onClick={fetchToken}>Reintentar</button>
            </div>
          ) : !token ? (
            <div className="wec-loading">
              <div className="wec-spinner" />
              <div>
                <div className="wec-loading-title">Iniciando sesión inmersiva</div>
                <div className="wec-loading-sub">Autenticando credenciales…</div>
                <div className="wec-dots">
                  <span className="wec-dot" /><span className="wec-dot" /><span className="wec-dot" />
                </div>
              </div>
            </div>
          ) : (
            <LiveKitRoom
              video={true}
              audio={true}
              token={token}
              serverUrl={serverUrl}
              connect={true}
              onConnected={() => setIsLive(true)}
              onDisconnected={() => setIsLive(false)}
              style={{
                display: 'flex', flexDirection: 'column',
                flex: 1, minHeight: 0,
                background: 'transparent',
              }}
            >
              <RoomAudioRenderer />
              <RoomInner sessionId={sessionId} onConnected={() => setIsLive(true)} />
            </LiveKitRoom>
          )}
        </div>
      </div>
    </>
  );
}