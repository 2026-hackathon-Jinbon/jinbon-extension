const ROOT_ID = 'jinbon-extension-root';
const SUPPORTED_HOSTS = ['youtube.com', 'instagram.com'];

let lastUrl = '';
let isVerifying = false;

init();
setInterval(() => {
  if (location.href !== lastUrl) {
    init();
  }
}, 1000);

function init() {
  lastUrl = location.href;

  if (!isSupportedVideoPage()) {
    removeRoot();
    return;
  }

  const root = ensureRoot();
  renderIdle(root);
}

function isSupportedVideoPage() {
  const host = location.hostname.replace(/^www\./, '');
  const supported = SUPPORTED_HOSTS.some((domain) => host === domain || host.endsWith(`.${domain}`));

  if (!supported) return false;
  if (host.includes('youtube.com')) return location.pathname === '/watch' || location.pathname.startsWith('/shorts/');
  if (host.includes('instagram.com')) return /^\/(reel|p|tv)\/[^/]+/.test(location.pathname);

  return false;
}

function ensureRoot() {
  const existing = document.getElementById(ROOT_ID);
  if (existing) return existing;

  const root = document.createElement('div');
  root.id = ROOT_ID;
  root.setAttribute('data-jinbon-state', 'idle');
  document.documentElement.appendChild(root);
  return root;
}

function removeRoot() {
  document.getElementById(ROOT_ID)?.remove();
}

function renderIdle(root) {
  root.innerHTML = `
    <button class="jinbon-button" type="button" title="현재 영상 진본 여부 확인">
      <span class="jinbon-mark">J</span>
      <span>진본 확인</span>
    </button>
    <section class="jinbon-panel" hidden></section>
  `;

  root.querySelector('.jinbon-button').addEventListener('click', () => verifyCurrentVideo(root));
}

async function verifyCurrentVideo(root) {
  if (isVerifying) return;

  isVerifying = true;
  root.setAttribute('data-jinbon-state', 'loading');
  renderPanel(root, {
    title: '진본 확인 중',
    message: '현재 영상 URL을 분석하고 있어요.',
    tone: 'loading',
  });

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'JINBON_VERIFY_URL',
      payload: {
        url: getCanonicalVideoUrl(),
        title: document.title,
        pageUrl: location.href,
      },
    });

    if (!response?.ok) {
      throw new Error(response?.error || '진본 확인 요청에 실패했습니다.');
    }

    renderResult(root, response.data);
  } catch (error) {
    renderPanel(root, {
      title: '확인 실패',
      message: error.message || '백엔드 서버가 켜져 있는지 확인해주세요.',
      tone: 'error',
    });
  } finally {
    isVerifying = false;
  }
}

function getCanonicalVideoUrl() {
  const url = new URL(location.href);

  if (url.hostname.includes('youtube.com')) {
    if (url.pathname === '/watch') {
      const videoId = url.searchParams.get('v');
      if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
    }

    if (url.pathname.startsWith('/shorts/')) {
      return `https://www.youtube.com${url.pathname}`;
    }
  }

  if (url.hostname.includes('instagram.com') && /^\/(reel|p|tv)\/[^/]+/.test(url.pathname)) {
    return `https://www.instagram.com${url.pathname}`;
  }

  return location.href;
}

function renderResult(root, result) {
  const status = result.displayStatus || (result.authentic ? 'AUTHENTICATED' : 'NOT_AUTHENTICATED');
  let title, tone;
  if (status === 'AUTHENTICATED') {
    title = '진본 인증';
    tone = 'success';
  } else if (status === 'UNAVAILABLE') {
    title = '확인 중';
    tone = 'warning';
  } else {
    title = '미인증';
    tone = 'warning';
  }
  const message = result.message || (status === 'AUTHENTICATED' ? '블록체인에 등록이 확인된 영상입니다.' : '등록된 진본 기록을 찾지 못했습니다.');
  const meta = buildMeta(result);

  renderPanel(root, { title, message, tone, meta, notice: result.notice });
}

function buildMeta(result) {
  const rows = [];
  if (result.registeredAt) rows.push(['등록 시각', formatDate(result.registeredAt)]);
  return rows;
}

function renderPanel(root, { title, message, tone, meta = [], notice = '' }) {
  const panel = root.querySelector('.jinbon-panel');
  panel.hidden = false;
  panel.className = `jinbon-panel is-${tone}`;
  panel.innerHTML = `
    <div class="jinbon-panel-header">
      <strong>${escapeHtml(title)}</strong>
      <button class="jinbon-close" type="button" title="닫기">×</button>
    </div>
    <p>${escapeHtml(message)}</p>
    ${meta.length ? `<dl>${meta.map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>` : ''}
    ${notice ? `<small>${escapeHtml(notice)}</small>` : ''}
  `;

  panel.querySelector('.jinbon-close').addEventListener('click', () => {
    panel.hidden = true;
    root.setAttribute('data-jinbon-state', 'idle');
  });
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[char]);
}
