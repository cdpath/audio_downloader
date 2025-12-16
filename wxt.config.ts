import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    permissions: ['downloads'],
    host_permissions: ['*://*.vocabulary.com/*'],
    name: "Dictionary Audio Downloader",
    description: "Download audio pronunciations from dictionary websites (Vocabulary.com, etc.)",
    version: "1.0.0",
  }
});
