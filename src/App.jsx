import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  CheckCheck,
  ChevronRight,
  Flame,
  Maximize2,
  Radio,
  Shield,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Status', icon: Activity },
  { id: 'quests', label: 'Daily quests', icon: Target },
  { id: 'stats', label: 'Attributes', icon: Zap },
  { id: 'skills', label: 'Skill trees', icon: Sparkles },
  { id: 'bosses', label: 'Boss room', icon: Shield },
  { id: 'achievements', label: 'Archive', icon: Trophy },
  { id: 'journal', label: 'Journal', icon: CheckCheck },
  { id: 'settings', label: 'Settings', icon: Radio },
];

function dayKey(date = new Date()) {
  return date.toLocaleDateString('en-CA');
}

function readPlayerData() {
  try {
    const state = JSON.parse(localStorage.getItem('solo-system-v2') || '{}');
    const xp = Math.max(0, Number(state.xp) || 0);
    let streak = 0;
    const claimedDays = new Set(state.claimHistory || []);
    const cursor = new Date();
    while (claimedDays.has(dayKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    const quests = state.quests?.[dayKey()] || [];
    return {
      xp,
      level: Math.floor(xp / 100) + 1,
      rank: xp < 400 ? 'E' : xp < 900 ? 'D' : xp < 1400 ? 'C' : xp < 1900 ? 'B' : xp < 2900 ? 'A' : 'S',
      streak,
      quests: Array.isArray(quests) ? quests.length : 0,
      progress: xp % 100,
    };
  } catch {
    return { xp: 0, level: 1, rank: 'E', streak: 0, quests: 0, progress: 0 };
  }
}

const motionFor = (reduce, values) => (reduce ? {} : values);

function AmbientField({ reduce }) {
  return (
    <div className="ambient-field" aria-hidden="true">
      <div className="ambient-wash wash-one" />
      <div className="ambient-wash wash-two" />
      <motion.div
        className="aura-ring aura-ring-one"
        animate={motionFor(reduce, { rotate: 360 })}
        transition={{ duration: 46, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="aura-ring aura-ring-two"
        animate={motionFor(reduce, { rotate: -360 })}
        transition={{ duration: 66, repeat: Infinity, ease: 'linear' }}
      />
      {Array.from({ length: 18 }, (_, index) => (
        <motion.i
          className={`particle particle-${index % 3}`}
          key={index}
          style={{ left: `${(index * 47 + 9) % 100}%`, top: `${(index * 31 + 16) % 100}%` }}
          animate={motionFor(reduce, {
            y: [0, -18 - (index % 5) * 7, 0],
            opacity: [0.12, 0.65, 0.12],
            scale: [0.75, 1.25, 0.75],
          })}
          transition={{ duration: 4.5 + (index % 5), delay: (index % 7) * 0.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

function BootSequence({ onComplete, reduce }) {
  useEffect(() => {
    if (reduce) {
      onComplete();
      return undefined;
    }
    const timer = window.setTimeout(onComplete, 1850);
    return () => window.clearTimeout(timer);
  }, [onComplete, reduce]);

  return (
    <motion.div className="boot-screen" initial={reduce ? false : { opacity: 1 }} exit={reduce ? {} : { opacity: 0 }} transition={{ duration: reduce ? 0 : 0.45 }}>
      <div className="boot-grid" />
      <motion.div className="boot-sigil" initial={reduce ? false : { scale: 0.7, opacity: 0 }} animate={reduce ? undefined : { scale: 1, opacity: 1 }} transition={{ duration: reduce ? 0 : 0.8, ease: 'easeOut' }}>
        <span className="sigil-orbit orbit-a" />
        <span className="sigil-orbit orbit-b" />
        <Flame size={42} strokeWidth={1.25} />
      </motion.div>
      <motion.p className="boot-kicker" initial={reduce ? false : { letterSpacing: '0.7em', opacity: 0 }} animate={reduce ? undefined : { letterSpacing: '0.34em', opacity: 1 }} transition={{ delay: reduce ? 0 : 0.25, duration: reduce ? 0 : 0.65 }}>
        PLAYER SYSTEM // ONLINE
      </motion.p>
      <motion.h1 initial={reduce ? false : { y: 18, opacity: 0 }} animate={reduce ? undefined : { y: 0, opacity: 1 }} transition={{ delay: reduce ? 0 : 0.4, duration: reduce ? 0 : 0.55 }}>
        ARISE<span>.</span>
      </motion.h1>
      <div className="boot-progress"><motion.span initial={reduce ? false : { scaleX: 0 }} animate={reduce ? undefined : { scaleX: 1 }} transition={{ duration: reduce ? 0 : 1.2, delay: reduce ? 0 : 0.45, ease: 'easeInOut' }} /></div>
      <button className="boot-skip" onClick={onComplete}>Skip intro <ChevronRight size={14} /></button>
    </motion.div>
  );
}

export default function App() {
  const reduce = useReducedMotion();
  const [booting, setBooting] = useState(true);
  const [summary, setSummary] = useState(readPlayerData);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [frameReady, setFrameReady] = useState(false);
  const iframeRef = useRef(null);

  const refreshSummary = useCallback(() => {
    const next = readPlayerData();
    setSummary((current) => (
      current.xp === next.xp && current.level === next.level && current.rank === next.rank &&
      current.streak === next.streak && current.quests === next.quests && current.progress === next.progress
        ? current
        : next
    ));
  }, []);

  useEffect(() => {
    const onStorage = () => refreshSummary();
    const interval = window.setInterval(refreshSummary, 1600);
    window.addEventListener('storage', onStorage);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('storage', onStorage);
    };
  }, [refreshSummary]);

  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }, []);

  const completeBoot = useCallback(() => setBooting(false), []);

  const handleFrameLoad = useCallback(() => {
    const frame = iframeRef.current;
    if (!frame) return;
    try {
      const doc = frame.contentDocument;
      if (doc && !doc.getElementById('react-control-room-style')) {
        const style = doc.createElement('style');
        style.id = 'react-control-room-style';
        style.textContent = `
          html,body{min-height:100%;background:#050712!important;color:#edf4ff!important;scrollbar-color:#263c5b #070a12}
          body>main.app{max-width:none!important;width:100%!important;margin:0!important;padding:10px!important;overflow:visible!important;border-radius:0!important;background:transparent!important}
          body>main.app>.top,body>main.app>.metrics,body>main.app>.nav,body>main.app>.footer,body>main.app>.svg-container{display:none!important}
          #view{margin-top:0!important}
          #view .status-screen{display:none!important}
          .card{border-color:#263c5b!important;box-shadow:0 10px 35px #0008,inset 0 0 20px #2b78ff08!important}
          .status-screen{border-color:#315a89!important}
          .toast{z-index:1000!important}
        `;
        doc.head.appendChild(style);
      }
      if (doc && !doc.documentElement.dataset.reactNavigationSync) {
        doc.documentElement.dataset.reactNavigationSync = 'true';
        doc.addEventListener('click', (event) => {
          const target = event.target.closest?.('[data-tab], [data-goto]');
          const id = target?.dataset.tab || target?.dataset.goto;
          if (TABS.some((tab) => tab.id === id)) setActiveTab(id);
        }, true);
      }
      setFrameReady(true);
      refreshSummary();
    } catch {
      setFrameReady(false);
    }
  }, [refreshSummary]);

  const goToTab = (id) => {
    setActiveTab(id);
    const doc = iframeRef.current?.contentDocument;
    const button = doc?.querySelector(`#nav [data-tab="${id}"]`);
    if (button) button.click();
  };

  const openFullscreen = () => {
    const frame = iframeRef.current;
    if (frame?.requestFullscreen) frame.requestFullscreen().catch(() => {});
  };

  const progress = summary.progress;

  return (
    <div className={`system-app ${reduce ? 'motion-reduced' : ''}`}>
      <AmbientField reduce={reduce} />
      <AnimatePresence>{booting && <BootSequence key="boot" onComplete={completeBoot} reduce={reduce} />}</AnimatePresence>

      <motion.div className="app-shell" initial={reduce ? false : { opacity: 0, y: 18 }} animate={reduce ? { opacity: 1, y: 0 } : { opacity: booting ? 0 : 1, y: booting ? 18 : 0 }} transition={{ duration: reduce ? 0 : 0.55, ease: 'easeOut' }}>
        <header className="command-header">
          <div className="brand-lockup">
            <div className="brand-mark"><img src="./logo-arise.jpg" alt="" /></div>
            <div>
              <div className="brand-name">ARISE <span>／</span> SYSTEM</div>
              <div className="brand-caption">PERSONAL HUNTER INTERFACE</div>
            </div>
          </div>
          <div className="header-center"><span className="online-dot" /> SYSTEM ONLINE <span className="header-divider">/</span> LOCAL SAVE ACTIVE</div>
          <div className="header-actions">
            <div className="rank-chip"><span>RANK</span><strong>{summary.rank}</strong></div>
            <button className="icon-button" onClick={openFullscreen} aria-label="Open app in full screen" title="Full screen"><Maximize2 size={17} /></button>
          </div>
        </header>

        <section className="hero-panel">
          <div className="hero-copy">
            <motion.div className="eyebrow" initial={reduce ? false : { opacity: 0, x: -12 }} animate={reduce ? undefined : { opacity: booting ? 0 : 1, x: booting ? -12 : 0 }} transition={{ delay: reduce ? 0 : 0.15, duration: reduce ? 0 : 0.25 }}>
              <span className="eyebrow-line" /> DAILY HUNTER REPORT
            </motion.div>
            <h1>Power is <em>earned.</em><br /><span>Every day.</span></h1>
            <p>Your quests, attributes, and streak—all in one live system. Small wins compound into a stronger you.</p>
            <div className="hero-status"><span className="status-pulse"><Zap size={13} fill="currentColor" /></span> AURA FIELD ACTIVE <span className="status-separator">·</span> LEVEL {summary.level}</div>
          </div>

          <div className="hero-orb-wrap" aria-hidden="true">
            <motion.div className="hero-orbit hero-orbit-a" animate={motionFor(reduce, { rotate: 360 })} transition={{ duration: 28, repeat: Infinity, ease: 'linear' }} />
            <motion.div className="hero-orbit hero-orbit-b" animate={motionFor(reduce, { rotate: -360 })} transition={{ duration: 38, repeat: Infinity, ease: 'linear' }} />
            <motion.div className="hero-core" animate={motionFor(reduce, { scale: [1, 1.04, 1], filter: ['brightness(0.9)', 'brightness(1.35)', 'brightness(0.9)'] })} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}>
              <Flame size={34} strokeWidth={1.25} />
              <span className="core-level">LVL {summary.level}</span>
            </motion.div>
            <span className="orbit-label label-top">MANA FLOW <b>STABLE</b></span>
            <span className="orbit-label label-bottom">CLASS <b>AWAKENING</b></span>
          </div>

          <div className="hero-xp">
            <div className="xp-heading"><span>EXPERIENCE</span><strong>{summary.xp.toLocaleString()} <small>XP</small></strong></div>
            <div className="react-xp-track"><motion.span initial={reduce ? false : { scaleX: 0 }} animate={reduce ? undefined : { scaleX: progress / 100 }} transition={{ duration: reduce ? 0 : 1.2, delay: reduce ? 0 : 0.3 }} /></div>
            <div className="xp-foot"><span>LEVEL {summary.level}</span><span>{100 - progress} XP TO NEXT</span></div>
            <div className="hero-xp-mark"><Sparkles size={14} /> LEVEL PROGRESS</div>
          </div>
        </section>

        <section className="metrics-row" aria-label="Player statistics">
          <Metric icon={Zap} label="TOTAL EXPERIENCE" value={summary.xp.toLocaleString()} suffix="XP" accent="cyan" reduce={reduce} />
          <Metric icon={Flame} label="CURRENT STREAK" value={summary.streak} suffix={summary.streak === 1 ? 'DAY' : 'DAYS'} accent="violet" reduce={reduce} />
          <Metric icon={CheckCheck} label="QUESTS CHECKED" value={summary.quests} suffix="TODAY" accent="amber" reduce={reduce} />
          <motion.div className="sync-card" animate={motionFor(reduce, { borderColor: ['#263344', '#4266a0', '#263344'] })} transition={{ duration: 5, repeat: Infinity }}>
            <div className="sync-icon"><Radio size={17} /></div>
            <div><span>PLAYER DATA</span><strong>{frameReady ? 'SYNCED' : 'CONNECTING'}</strong></div>
            <span className={`sync-dot ${frameReady ? 'is-live' : ''}`} />
          </motion.div>
        </section>

        <section className="system-console">
          <div className="console-topline">
            <div className="console-title"><span className="console-index">01</span><div><h2>PLAYER SYSTEM</h2><p>Choose a module. Your progress saves on this device.</p></div></div>
            <div className="console-live"><span className="online-dot" /> LIVE CONNECTION</div>
          </div>

          <nav className="react-nav" aria-label="System modules">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} className={`module-tab ${activeTab === id ? 'is-active' : ''}`} onClick={() => goToTab(id)}>
                <Icon size={15} strokeWidth={1.8} /><span>{label}</span>
                {activeTab === id && (reduce ? <i className="tab-indicator" /> : <motion.i className="tab-indicator" layoutId="tab-indicator" />)}
              </button>
            ))}
            <div className="nav-spacer" />
            <span className="nav-hint"><ArrowUpRight size={13} /> SELECT MODULE</span>
          </nav>

          <div className="legacy-frame-wrap">
            <div className="energy-frame" aria-hidden="true" />
            <div className="frame-corner corner-tl" /><div className="frame-corner corner-tr" />
            <div className="frame-corner corner-bl" /><div className="frame-corner corner-br" />
            <div className="frame-title"><span className="frame-title-dot" /> {TABS.find((item) => item.id === activeTab)?.label.toUpperCase()} MODULE</div>
            {!frameReady && <div className="frame-loading"><motion.div className="loading-rune" animate={motionFor(reduce, { rotate: 360 })} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}><Sparkles size={24} /></motion.div><span>INITIALIZING PLAYER DATA</span></div>}
            <iframe ref={iframeRef} title="ARISE Player System" src="./legacy.html?embedded=1" onLoad={handleFrameLoad} className={frameReady ? 'legacy-frame is-ready' : 'legacy-frame'} />
          </div>
        </section>

        <footer className="system-footer"><span><span className="footer-mark">A</span> ARISE PLAYER SYSTEM <span className="footer-muted">· build 02</span></span><span>YOUR PROGRESS STAYS ON THIS DEVICE</span></footer>
      </motion.div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, suffix, accent, reduce }) {
  return (
    <motion.article className={`metric-card accent-${accent}`} whileHover={reduce ? undefined : { y: -3, borderColor: 'rgba(130,180,255,.42)' }} transition={{ duration: reduce ? 0 : 0.18 }}>
      <div className="metric-icon"><Icon size={16} strokeWidth={1.8} /></div>
      <div className="metric-content"><span>{label}</span><strong>{value}<small>{suffix}</small></strong></div>
      <span className="metric-edge" />
    </motion.article>
  );
}
