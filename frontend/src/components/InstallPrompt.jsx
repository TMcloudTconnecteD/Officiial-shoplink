import React, { useEffect, useState } from 'react';
import { FaDownload, FaApple, FaAndroid } from 'react-icons/fa';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  useEffect(() => {
    const isDismissed = localStorage.getItem('shoplink-app-dismissed');
    if (isDismissed) {
      setDismissed(true);
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
      localStorage.removeItem('shoplink-app-dismissed');
      setDismissed(false);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (isIOS && !isDismissed) {
      setShowIOSGuide(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [isIOS]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setShowButton(false);
    setDeferredPrompt(null);
    if (outcome === 'accepted') {
      localStorage.setItem('shoplink-app-installed', 'true');
    }
  };

  const handleDismiss = () => {
    setShowButton(false);
    setShowIOSGuide(false);
    setDismissed(true);
    localStorage.setItem('shoplink-app-dismissed', 'true');
  };

  if (showButton && !dismissed) {
    return (
      <div style={{ position: 'fixed', right: '20px', bottom: '92px', zIndex: 60 }}>
        <div style={{
          width: '320px',
          maxWidth: 'calc(100vw - 24px)',
          background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
          borderRadius: '22px',
          padding: '18px 18px 16px',
          color: 'white',
          boxShadow: '0 22px 52px rgba(15,118,110,0.28)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.12)' }}>
              <FaDownload size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>Install ShopLink</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>Speed, savings, and campus deals on your home screen</div>
            </div>
            <button onClick={handleDismiss} style={{ border: 'none', background: 'transparent', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
          </div>

          <button
            onClick={handleInstallClick}
            style={{
              width: '100%',
              border: 'none',
              borderRadius: '14px',
              padding: '12px 14px',
              background: 'rgba(255,255,255,0.95)',
              color: '#0f766e',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 10px 24px rgba(0,0,0,0.08)'
            }}
          >
            Download app
          </button>
        </div>
      </div>
    );
  }

  if (showIOSGuide && !dismissed) {
    return (
      <div style={{ position: 'fixed', right: '20px', bottom: '92px', zIndex: 60 }}>
        <div style={{
          width: '320px',
          maxWidth: 'calc(100vw - 24px)',
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          borderRadius: '22px',
          padding: '18px 18px 16px',
          color: 'white',
          boxShadow: '0 22px 52px rgba(37,99,235,0.26)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.12)' }}>
              <FaApple size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>Add to Home Screen</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>For iPhone / iPad</div>
            </div>
            <button onClick={handleDismiss} style={{ border: 'none', background: 'transparent', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '16px', padding: '12px 12px 10px', fontSize: '0.82rem', lineHeight: 1.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 700 }}>
              <FaAndroid />
              <span>Quick steps</span>
            </div>
            <ol style={{ margin: '0', paddingLeft: '18px' }}>
              <li>Tap the Share button.</li>
              <li>Select <strong>Add to Home Screen</strong>.</li>
              <li>Tap Add in the top-right corner.</li>
            </ol>
          </div>

          <button onClick={handleDismiss} style={{ width: '100%', marginTop: '12px', border: 'none', borderRadius: '14px', padding: '12px 14px', background: 'rgba(255,255,255,0.95)', color: '#1d4ed8', fontWeight: 800, cursor: 'pointer' }}>
            Got it
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default InstallPrompt;
