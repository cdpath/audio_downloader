import { browser } from 'wxt/browser';

interface Settings {
  storagePath: string;
  useParentDir: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  storagePath: 'audios',
  useParentDir: true,
};

document.addEventListener('DOMContentLoaded', async () => {
  const storagePathInput = document.getElementById('storagePath') as HTMLInputElement;
  const useParentDirCheckbox = document.getElementById('useParentDir') as HTMLInputElement;
  const saveButton = document.getElementById('save')!;
  const statusEl = document.getElementById('status')!;

  // Load saved settings
  const result = await browser.storage.sync.get(['storagePath', 'useParentDir']);
  storagePathInput.value = (result.storagePath as string) || DEFAULT_SETTINGS.storagePath;
  useParentDirCheckbox.checked = result.useParentDir !== undefined ? (result.useParentDir as boolean) : DEFAULT_SETTINGS.useParentDir;

  // Save settings
  saveButton.onclick = async () => {
    const settings = {
      storagePath: storagePathInput.value.trim() || DEFAULT_SETTINGS.storagePath,
      useParentDir: useParentDirCheckbox.checked,
    };

    await browser.storage.sync.set(settings);
    
    statusEl.textContent = 'Settings saved!';
    statusEl.style.color = 'green';
    setTimeout(() => {
      statusEl.textContent = '';
    }, 2000);
  };
});
