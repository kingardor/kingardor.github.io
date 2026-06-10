import { Home, Briefcase, Wrench, Folder as FolderIcon, Radio, Mail, Play, Command, MessageSquare } from 'lucide-react';
import Dock from './reactbits/Dock.jsx';
import { isMobile, prefersReduced } from '../../shared/utils/capabilities.js';

/**
 * Bottom dock navigation (magnifying, macOS-style) — sits just above the
 * telemetry HUD strip. Tour is desktop-only (the tour itself is gated).
 */
export function TopNav({ onAsk }) {
  const jump = (id) => () => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const items = [
    { icon: <Home size={20} strokeWidth={1.75} />,      label: 'Home',    onClick: jump('top') },
    { icon: <Briefcase size={20} strokeWidth={1.75} />, label: 'Career',  onClick: jump('career') },
    { icon: <Wrench size={20} strokeWidth={1.75} />,    label: 'Stack',   onClick: jump('skills') },
    { icon: <FolderIcon size={20} strokeWidth={1.75} />,label: 'Work',    onClick: jump('projects') },
    { icon: <Radio size={20} strokeWidth={1.75} />,     label: 'Signals', onClick: jump('videos') },
    { icon: <Mail size={20} strokeWidth={1.75} />,      label: 'Contact', onClick: jump('contact') },
    ...(!isMobile && !prefersReduced ? [{
      icon: <Play size={20} strokeWidth={1.75} />,
      label: 'Tour',
      onClick: () => window.dispatchEvent(new CustomEvent('ob:tour')),
    }] : []),
    {
      icon: <Command size={20} strokeWidth={1.75} />,
      label: '⌘K',
      onClick: () => window.dispatchEvent(new CustomEvent('ob:palette')),
    },
    {
      icon: <MessageSquare size={20} strokeWidth={1.75} />,
      label: 'Ask Veronica',
      onClick: onAsk || (() => { location.hash = '/chat'; }),
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'calc(var(--hud-h) + 12px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 80,
      }}
    >
      <Dock
        items={items}
        panelHeight={46}
        baseItemSize={32}
        magnification={48}
        distance={120}
      />
    </div>
  );
}
