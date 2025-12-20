interface Settings {
  storagePath: string;
  useParentDir: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  storagePath: 'audios',
  useParentDir: true,
};

export default defineBackground(() => {
  console.log('Dictionary Audio Downloader background started.');

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'DOWNLOAD_AUDIO') {
      // Build filename based on settings
      browser.storage.sync.get(['storagePath', 'useParentDir']).then((result) => {
        const settings: Settings = {
          storagePath: (result.storagePath as string) || DEFAULT_SETTINGS.storagePath,
          useParentDir: result.useParentDir !== undefined ? (result.useParentDir as boolean) : DEFAULT_SETTINGS.useParentDir,
        };
        const { word, index, extension } = message;
        const basePath = settings.storagePath.replace(/\/+$/, ''); // trim trailing slashes
        
        // Sanitize word for filename: remove invalid chars, replace spaces with underscores
        const safeWord = word
          .replace(/[<>:"\\|?*]/g, '') // remove invalid filename chars
          .replace(/\s+/g, '_')          // replace spaces with underscores
          .replace(/^\.|\.$|^\.+$/g, '') // remove leading/trailing dots
          .toLowerCase()
          || 'audio';                     // fallback if empty
        
        let filename: string;
        if (settings.useParentDir) {
          filename = `${basePath}/${safeWord}/${safeWord}_${index}.${extension}`;
        } else {
          filename = `${basePath}/${safeWord}_${index}.${extension}`;
        }

        console.log('Downloading audio:', message.url, 'to', filename);
        browser.downloads.download({
          url: message.url,
          filename: filename,
        });
      });
    }
  });
});
