import { browser } from 'wxt/browser';

document.addEventListener('DOMContentLoaded', async () => {
  const list = document.getElementById('audio-list')!;
  const messageEl = document.getElementById('message')!;

  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0 || !tabs[0].id) {
      list.innerHTML = '<li>No active tab found.</li>';
      return;
    }

    const response = await browser.tabs.sendMessage(tabs[0].id, { type: 'GET_AUDIO_LINKS' });
    
    if (!response || response.length === 0) {
      list.innerHTML = '<li>No audio found on this page.</li>';
      return;
    }

    list.innerHTML = '';
    response.forEach((item: any) => {
      const li = document.createElement('li');
      
      const infoSpan = document.createElement('span');
      infoSpan.textContent = `#${item.index} (${item.extension.toUpperCase()})`;
      
      const btn = document.createElement('button');
      btn.textContent = 'Download';
      btn.onclick = () => {
        const filename = `audios/${item.word}_${item.index}.${item.extension}`;
        browser.runtime.sendMessage({
          type: 'DOWNLOAD_AUDIO',
          url: item.url,
          filename: filename
        });
      };

      li.appendChild(infoSpan);
      li.appendChild(btn);
      list.appendChild(li);
    });

  } catch (err) {
    console.error(err);
    list.innerHTML = '<li>Error scanning page. Is this a dictionary page?</li>';
  }
});
