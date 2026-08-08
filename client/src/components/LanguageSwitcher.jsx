import { useState, useEffect, useRef } from 'react';

const LanguageSwitcher = () => {
  const [lang, setLang] = useState('en');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', label: 'English', icon: '🇺🇸' },
    { code: 'hi', label: 'हिंदी', icon: '🇮🇳' },
    { code: 'mr', label: 'मराठी', icon: '🇮🇳' }
  ];

  useEffect(() => {
    // Read the googtrans cookie to set initial state
    const match = document.cookie.match(/(?:^|;)\s*googtrans=([^;]*)/);
    if (match && match[1]) {
      const parts = decodeURIComponent(match[1]).split('/');
      if (parts.length === 3) {
        setLang(parts[2]);
      }
    }

    // Close dropdown on outside click
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (selectedLang) => {
    setLang(selectedLang);
    setIsOpen(false);
    
    const domain = window.location.hostname;
    
    // Clear existing cookies first to prevent conflicts
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${domain}; path=/;`;

    if (selectedLang !== 'en') {
      document.cookie = `googtrans=/en/${selectedLang}; path=/`;
      document.cookie = `googtrans=/en/${selectedLang}; domain=${domain}; path=/`;
    }
    
    // Reload page to apply translation natively
    window.location.reload();
  };

  const activeLang = languages.find(l => l.code === lang) || languages[0];

  return (
    <div className="language-switcher notranslate" translate="no" ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: '0.35rem 0.75rem',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '50px',
          cursor: 'pointer',
          fontWeight: '500',
          fontSize: '0.85rem',
          color: 'var(--color-text)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface)'}
      >
        <span style={{ fontSize: '1.2rem' }}>{activeLang.icon}</span>
        <span>{activeLang.label}</span>
        <span style={{ fontSize: '0.7rem', opacity: 0.6, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '120%',
          right: 0,
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          minWidth: '150px',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {languages.map(l => (
            <div 
              key={l.code}
              onClick={() => handleSelect(l.code)}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                cursor: 'pointer',
                backgroundColor: lang === l.code ? 'rgba(0,0,0,0.03)' : 'transparent',
                borderBottom: '1px solid var(--color-border)',
                transition: 'background-color 0.2s',
                fontWeight: lang === l.code ? '600' : '400'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = lang === l.code ? 'rgba(0,0,0,0.03)' : 'transparent'}
            >
              <span style={{ fontSize: '1.2rem' }}>{l.icon}</span>
              {l.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
