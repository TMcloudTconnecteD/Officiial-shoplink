import React, { useEffect, useState } from 'react';
import { FaDownload, FaApple, FaAndroid } from 'react-icons/fa';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Detect if device is iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  useEffect(() => {
    // Check localStorage for dismissed state
    const isDismissed = localStorage.getItem('shimmer-app-dismissed');
    if (isDismissed) {
      setDismissed(true);
    }

    const handler = (e) => {
      // prevent automatic prompt
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
      localStorage.removeItem('shimmer-app-dismissed'); // Re-enable if event fires
      setDismissed(false);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Show iOS guide on iOS devices
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
      localStorage.setItem('shimmer-app-installed', 'true');
    }
  };

  const handleDismiss = () => {
    setShowButton(false);
    setShowIOSGuide(false);
    setDismissed(true);
    localStorage.setItem('shimmer-app-dismissed', 'true');
  };

  // Android/Chrome PWA Install Button
  if (showButton && !dismissed) {
    return (
      <div className="fixed bottom-20 md:bottom-4 right-4 z-50 animate-bounce">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl shadow-2xl border-2 border-emerald-400 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <FaDownload size={20} />
              <div>
                <h3 className="font-bold text-base">Install ShopLink</h3>
                <p className="text-xs text-emerald-100">Quick access from home screen</p>
              </div>
              <button
                onClick={handleDismiss}
                className="ml-auto text-emerald-200 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>
            <button
              onClick={handleInstallClick}
              className="w-full bg-white text-emerald-600 font-bold py-2 rounded-lg hover:bg-emerald-50 transition-all shadow-md"
            >
              Download App
            </button>
          </div>
        </div>
      </div>
    );
  }

  // iOS Guide (Share → Add to Home Screen)
  if (showIOSGuide && !dismissed) {
    return (
      <div className="fixed bottom-20 md:bottom-4 right-4 z-50 animate-bounce">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-2xl border-2 border-blue-400 overflow-hidden max-w-xs">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <FaApple size={20} />
              <div>
                <h3 className="font-bold text-base">Add to Home Screen</h3>
                <p className="text-xs text-blue-100">Available on iOS</p>
              </div>
              <button
                onClick={handleDismiss}
                className="ml-auto text-blue-200 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>
            <div className="text-sm bg-blue-700 rounded-lg p-3 mb-3">
              <p className="font-semibold mb-2">📱 Easy Steps:</p>
              <ol className="text-xs list-decimal list-inside space-y-1">
                <li>Tap <strong>Share</strong> (bottom icon)</li>
                <li>Select <strong>"Add to Home Screen"</strong></li>
                <li>Tap <strong>Add</strong></li>
              </ol>
            </div>
            <button
              onClick={handleDismiss}
              className="w-full bg-white text-blue-600 font-bold py-2 rounded-lg hover:bg-blue-50 transition-all"
            >
              Got It
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default InstallPrompt;
