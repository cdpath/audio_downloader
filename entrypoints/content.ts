export default defineContentScript({
  matches: ['*://*.vocabulary.com/dictionary/*'],
  main() {
    console.log('Dictionary Audio Downloader: Vocabulary.com loaded');

    // Function to inject buttons into the page
    function injectDownloadButtons() {
       // 1. Global search for data-audio links (Standard US audio)
       const audioLinks = document.querySelectorAll('a.audio[data-audio]');
       audioLinks.forEach((link) => {
          if (!link.nextElementSibling?.classList.contains('vocab-audio-downloader-btn')) {
             const token = link.getAttribute('data-audio');
             if (token) {
                const audioUrl = `https://audio.vocabulary.com/1.0/us/${token}.mp3`;
                createAndInsertButton(link, audioUrl, 'mp3', token);
             }
          }
       });

       // 2. Global search for explicit audio/video tags (UK or other variants)
       const mediaElements = document.querySelectorAll('audio.pron-audio, video.pron-audio');
       mediaElements.forEach((media) => {
           // Check if wrapped in an anchor or standalone
           const parentLink = media.closest('a.audio');
           const target = parentLink || media;

           if (!target.nextElementSibling?.classList.contains('vocab-audio-downloader-btn')) {
              const src = media.getAttribute('src') || media.querySelector('source')?.getAttribute('src');
              if (src) {
                 createAndInsertButton(target, src, 'mp4', 'video');
              }
           }
       });
    }

    function createAndInsertButton(targetElement: Element, url: string, ext: string, idHint: string) {
        const btn = document.createElement('button');
        btn.className = 'vocab-audio-downloader-btn';
        btn.innerText = '⬇';
        btn.title = `Download ${ext.toUpperCase()}`;
        btn.style.marginLeft = '8px';
        btn.style.cursor = 'pointer';
        btn.style.border = '1px solid #ccc';
        btn.style.background = '#f0f0f0';
        btn.style.color = '#333';
        btn.style.fontSize = '14px';
        btn.style.padding = '2px 6px';
        btn.style.borderRadius = '4px';
        btn.style.zIndex = '9999';
        btn.style.position = 'relative';
        btn.style.display = 'inline-block';
        btn.style.verticalAlign = 'middle';

        // Track button index for this word
        const allButtons = document.querySelectorAll('.vocab-audio-downloader-btn');
        const buttonIndex = allButtons.length;

        btn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const word = getWord();

          browser.runtime.sendMessage({
            type: 'DOWNLOAD_AUDIO',
            url: url,
            word: word,
            index: buttonIndex,
            extension: ext,
          });
        };

        targetElement.insertAdjacentElement('afterend', btn);
    }
    
    function getWord() {
        let word = "audio";
        const h1 = document.querySelector('h1');
        if (h1) {
           word = h1.innerText.trim();
        } else {
           const titleParts = document.title.split(' - ');
           if (titleParts.length > 0) word = titleParts[0].trim();
        }
        return word.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }

    // Run injection on load
    injectDownloadButtons();

    // Observe for changes
    const observer = new MutationObserver((mutations) => {
      injectDownloadButtons();
    });
    observer.observe(document.body, { childList: true, subtree: true });


    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'GET_AUDIO_LINKS') {
        const audioData: Array<{index: number; extension: string; url: string; word: string}> = [];
        
        // Try to guess the word
        let word = "audio";
        const h1 = document.querySelector('h1');
        if (h1) {
           word = h1.innerText.trim();
        } else {
           const titleParts = document.title.split(' - ');
           if (titleParts.length > 0) word = titleParts[0].trim();
        }
        // sanitize word for filename
        word = word.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        // Find all .ipa-with-audio containers to maintain order
        const ipaContainers = document.querySelectorAll('.ipa-with-audio');
        
        // Global index for the page
        let audioIndex = 1;

        ipaContainers.forEach((container) => {
          // Check for data-audio
          const link = container.querySelector('a.audio[data-audio]');
          if (link) {
             const token = link.getAttribute('data-audio');
             if (token) {
               audioData.push({
                 index: audioIndex++,
                 extension: 'mp3',
                 url: `https://audio.vocabulary.com/1.0/us/${token}.mp3`,
                 word: word
               });
             }
          }

          // Check for video/mp4 (uk audio often in video tag)
          const video = container.querySelector('audio.pron-audio, video.pron-audio');
          if (video) {
             const src = video.getAttribute('src') || video.querySelector('source')?.getAttribute('src');
             if (src) {
                audioData.push({
                  index: audioIndex++,
                  extension: 'mp4',
                  url: src,
                  word: word
                });
             }
          }
        });

        // Fallback: if no .ipa-with-audio containers found (different layout?), try global search
        if (audioData.length === 0) {
             const links = document.querySelectorAll('a.audio[data-audio]');
             links.forEach((link) => {
                const token = link.getAttribute('data-audio');
                if (token) {
                   audioData.push({
                     index: audioIndex++,
                     extension: 'mp3',
                     url: `https://audio.vocabulary.com/1.0/us/${token}.mp3`,
                     word: word
                   });
                }
             });
        }

        console.log('[VocabDebug] Found audio links:', audioData);
        sendResponse(audioData);
      }
    });
  },
});
