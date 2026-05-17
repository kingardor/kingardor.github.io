import { Home, ScrollText, Briefcase, Wrench, Folder as FolderIcon, Radio, Mail, MessageSquare } from 'lucide-react';
import Dock from './reactbits/Dock.jsx';

export function TopNav({ onAsk }) {
  const jump = (id) => () => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const items = [
    { icon: <Home size={20} strokeWidth={1.75} />,          label: 'Home',         onClick: jump('top') },
    { icon: <ScrollText size={20} strokeWidth={1.75} />,    label: 'Manifesto',    onClick: jump('manifesto') },
    { icon: <Briefcase size={20} strokeWidth={1.75} />,     label: 'Career',       onClick: jump('career') },
    { icon: <Wrench size={20} strokeWidth={1.75} />,        label: 'Skills',       onClick: jump('skills') },
    { icon: <FolderIcon size={20} strokeWidth={1.75} />,    label: 'Work',         onClick: jump('projects') },
    { icon: <Radio size={20} strokeWidth={1.75} />,         label: 'Signals',      onClick: jump('videos') },
    { icon: <Mail size={20} strokeWidth={1.75} />,          label: 'Contact',      onClick: jump('contact') },
    { icon: <MessageSquare size={20} strokeWidth={1.75} />, label: 'Ask Veronica', onClick: onAsk || (() => { location.hash = '/chat'; }) },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
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
