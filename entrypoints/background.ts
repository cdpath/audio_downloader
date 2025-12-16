export default defineBackground(() => {
  console.log('Dictionary Audio Downloader background started.');

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'DOWNLOAD_AUDIO') {
      console.log('Downloading audio:', message.url);
      browser.downloads.download({
        url: message.url,
        filename: message.filename,
      });
    }
  });
});
