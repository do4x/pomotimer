import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Resource } from '../../types/resource';
import type { Subject } from '../../types/subject';
import { subjectName } from '../../types/subject';
import { useT, useLang } from '../../i18n/i18n';
import './ResourceSidebar.css';

interface Props {
  activeSubject: Subject;
  resources: Resource[];
  onAddResource: (subjectId: string, url: string, title?: string) => void;
  onRemoveResource: (subjectId: string, id: string) => void;
}

function getTypeIcon(type: Resource['type']) {
  switch (type) {
    case 'youtube': return '▶';
    case 'pdf': return '📄';
    default: return '🔗';
  }
}

export function ResourceSidebar({ activeSubject, resources, onAddResource, onRemoveResource }: Props) {
  const t = useT();
  const lang = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const closeTimeout = useRef<number | null>(null);

  const accent = activeSubject.color;

  const handleEnter = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setIsOpen(true);
  };

  const handleLeave = () => {
    closeTimeout.current = window.setTimeout(() => setIsOpen(false), 300);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;
    onAddResource(activeSubject.id, trimmedUrl, title.trim() || undefined);
    setUrl('');
    setTitle('');
  };

  return (
    <>
      <div className="sidebar-trigger" onMouseEnter={handleEnter} />

      <motion.div
        className="sidebar-tab"
        animate={{ opacity: isOpen ? 0 : 1 }}
        onMouseEnter={handleEnter}
        style={{ borderColor: accent }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="resource-sidebar glass-panel"
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          >
            <div className="sidebar-header">
              <motion.div
                className="sidebar-accent"
                animate={{ backgroundColor: accent }}
                transition={{ duration: 0.4 }}
              />
              <span className="sidebar-title">{subjectName(activeSubject.id, lang)}</span>
              <span className="sidebar-count">{resources.length}</span>
            </div>

            <div className="sidebar-resources">
              {resources.length === 0 && (
                <div className="sidebar-empty">{t('No resources for this subject', 'Nicio resursă pentru această materie')}</div>
              )}
              {resources.map(r => (
                <motion.a
                  key={r.id}
                  className="resource-item"
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                >
                  <span className="resource-icon">{getTypeIcon(r.type)}</span>
                  <span className="resource-title">{r.title}</span>
                  <button
                    className="resource-remove"
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemoveResource(activeSubject.id, r.id);
                    }}
                  >×</button>
                </motion.a>
              ))}
            </div>

            <form className="sidebar-add" onSubmit={handleAdd}>
              <input
                type="text"
                className="sidebar-input"
                placeholder={t('Paste URL...', 'Lipește URL...')}
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
              <input
                type="text"
                className="sidebar-input sidebar-input-sm"
                placeholder={t('Title (optional)', 'Titlu (opțional)')}
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              <button type="submit" className="sidebar-add-btn" style={{ color: accent }}>
                {t('Add', 'Adaugă')}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
