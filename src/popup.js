const DEFAULT_API_BASE_URL = 'http://localhost:8070';
const input = document.getElementById('apiBaseUrl');
const saveButton = document.getElementById('save');
const status = document.getElementById('status');

chrome.storage.sync.get({ apiBaseUrl: DEFAULT_API_BASE_URL }, ({ apiBaseUrl }) => {
  input.value = apiBaseUrl;
});

saveButton.addEventListener('click', async () => {
  const value = input.value.trim().replace(/\/$/, '') || DEFAULT_API_BASE_URL;
  await chrome.storage.sync.set({ apiBaseUrl: value });
  input.value = value;
  status.textContent = '저장됨';
  setTimeout(() => {
    status.textContent = '';
  }, 1600);
});
