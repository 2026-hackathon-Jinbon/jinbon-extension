const DEFAULT_API_BASE_URL = 'http://localhost:8070';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'JINBON_VERIFY_URL') {
    return false;
  }

  verifyUrl(message.payload)
    .then((data) => sendResponse({ ok: true, data }))
    .catch((error) => sendResponse({ ok: false, error: normalizeError(error) }));

  return true;
});

async function verifyUrl(payload) {
  const { apiBaseUrl = DEFAULT_API_BASE_URL } = await chrome.storage.sync.get({
    apiBaseUrl: DEFAULT_API_BASE_URL,
  });
  const endpoint = `${apiBaseUrl.replace(/\/$/, '')}/api/verify/url`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: payload.url }),
  });

  let body = null;
  try {
    body = await response.json();
  } catch (_error) {
    body = null;
  }

  if (!response.ok) {
    const message = body?.message || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return body?.data ?? body;
}

function normalizeError(error) {
  return error?.message || '진본 확인 중 오류가 발생했습니다.';
}
