export const reportPromoEvent = (logEvent, module, event, details = {}) => {
  logEvent({ module, event, ...details })
    .unwrap()
    .catch((error) => console.error(`Could not record ${module} ${event}:`, error));
};

export const promoEnabled = (settings, module) => Boolean(settings?.modules) && settings.modules[module] !== false;
