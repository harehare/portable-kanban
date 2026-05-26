import * as React from 'react';
import {
  MdFolderOpen,
  MdAdd,
  MdLightMode,
  MdDarkMode,
  MdBrightnessMedium,
  MdArrowForward,
} from 'react-icons/md';

export type Theme = 'system' | 'light' | 'dark';

type Props = {
  theme: Theme;
  onThemeChange: (t: Theme) => void;
  onOpen: () => void;
  onNew: () => void;
};

const themeConfig: { value: Theme; Icon: React.ElementType; label: string }[] = [
  { value: 'system', Icon: MdBrightnessMedium, label: 'System' },
  { value: 'light', Icon: MdLightMode, label: 'Light' },
  { value: 'dark', Icon: MdDarkMode, label: 'Dark' },
];

export const LandingPage = ({ theme, onThemeChange, onOpen, onNew }: Props) => {
  return (
    <div className="landing-root">
      {/* Theme switcher — top right */}
      <div className="landing-theme-bar">
        {themeConfig.map(({ value, Icon, label }) => (
          <button
            key={value}
            className={`landing-theme-btn ${theme === value ? 'active' : ''}`}
            onClick={() => onThemeChange(value)}
            title={label}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="landing-hero">
        {/* Logo */}
        <div className="landing-logo">
          <img src="/icon.png" alt="Portable Kanban" className="landing-logo-img" />
        </div>

        <h1 className="landing-title">Portable Kanban</h1>
        <p className="landing-subtitle">
          A lightweight kanban board that lives in your filesystem.
          <br />
          Open any <code>.kanban</code> file to get started.
        </p>

        {/* Actions */}
        <div className="landing-actions">
          <button className="landing-btn landing-btn-primary" onClick={onOpen}>
            <MdFolderOpen size={20} />
            <span>Open file</span>
            <MdArrowForward size={16} className="landing-btn-arrow" />
          </button>
          <button className="landing-btn landing-btn-secondary" onClick={onNew}>
            <MdAdd size={20} />
            <span>New file</span>
          </button>
        </div>

        {/* Feature pills */}
        <div className="landing-features">
          {['Works offline', 'Plain JSON', 'Git-friendly', 'Cross-platform'].map((f) => (
            <span key={f} className="landing-feature-pill">
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
