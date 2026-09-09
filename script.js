async function init() {
  const contentSource = document.body.dataset.contentSource || './data.json';
  const assetRoot = document.body.dataset.assetRoot || '.';
  const response = await fetch(contentSource, { cache: 'no-store' });
  const items = await response.json();

  const claimAGrid = document.getElementById('claim-a-grid');
  const claimBGrid = document.getElementById('claim-b-grid');
  const template = document.getElementById('video-card-template');

  items
    .filter((item) => item.idx !== 4)
    .forEach((item) => {
      const node = template.content.cloneNode(true);
      const prompt = node.querySelector('.prompt');
      const observation = node.querySelector('.observation');
      const [oriVideo, oursVideo] = node.querySelectorAll('video');
      const pair = [oriVideo, oursVideo];

      prompt.textContent = item.prompt;
      observation.textContent = item.observation;
      oriVideo.src = `${assetRoot}/videos/${item.slug}/ori.mp4`;
      oursVideo.src = `${assetRoot}/videos/${item.slug}/ours.mp4`;

      function syncTime(source) {
        pair.forEach((video) => {
          if (video !== source && Math.abs(video.currentTime - source.currentTime) > 0.12) {
            video.currentTime = source.currentTime;
          }
        });
      }

      async function playPair(source) {
        const other = source === oriVideo ? oursVideo : oriVideo;
        if (other.readyState < 3) {
          return;
        }
        const t = source.currentTime;
        if (Math.abs(other.currentTime - t) > 0.12) {
          other.currentTime = t;
        }
        other.playbackRate = source.playbackRate;
        await Promise.allSettled([source.play().catch(() => {}), other.play().catch(() => {})]);
      }

      function pausePair(source) {
        const other = source === oriVideo ? oursVideo : oriVideo;
        if (!other.paused) {
          other.pause();
        }
        syncTime(source);
      }

      function seekPair(source) {
        syncTime(source);
      }

      function ratePair(source) {
        const other = source === oriVideo ? oursVideo : oriVideo;
        other.playbackRate = source.playbackRate;
      }

      function endPair(source) {
        const other = source === oriVideo ? oursVideo : oriVideo;
        other.pause();
        other.currentTime = 0;
      }

      pair.forEach((video) => {
        video.addEventListener('play', () => {
          playPair(video);
        });
        video.addEventListener('pause', () => {
          pausePair(video);
        });
        video.addEventListener('seeking', () => {
          seekPair(video);
        });
        video.addEventListener('ratechange', () => {
          ratePair(video);
        });
        video.addEventListener('ended', () => {
          endPair(video);
        });
        video.addEventListener('loadeddata', () => {
          if (!pair.some((v) => v.readyState < 3) && pair.some((v) => !v.paused)) {
            const leader = pair.find((v) => !v.paused) || video;
            playPair(leader);
          }
        });
      });

      const target = item.claim === 'a' ? claimAGrid : claimBGrid;
      target.appendChild(node);
    });
}

function setupCopyButton() {
  const button = document.querySelector('.copy-button');
  const citation = document.getElementById('bibtex');
  const status = document.querySelector('.copy-status');

  if (!button || !citation || !status) {
    return;
  }

  button.addEventListener('click', async () => {
    const text = citation.textContent.trim();
    const defaultLabel = button.dataset.defaultLabel || 'Copy BibTeX';
    const copiedLabel = button.dataset.copiedLabel || 'Copied';
    const copiedMessage = status.dataset.copiedMessage || 'BibTeX copied to clipboard.';

    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }

    button.textContent = copiedLabel;
    status.textContent = copiedMessage;
    window.setTimeout(() => {
      button.textContent = defaultLabel;
      status.textContent = '';
    }, 1800);
  });
}

function setupReveal() {
  const sections = document.querySelectorAll('main > section');

  if (!('IntersectionObserver' in window)) {
    sections.forEach((section) => section.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px' },
  );

  sections.forEach((section) => {
    section.classList.add('reveal-ready');
    observer.observe(section);
  });
}

function setupHeroGlow() {
  const hero = document.querySelector('.hero-block');
  if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    hero.style.setProperty('--pointer-x', `${x}%`);
    hero.style.setProperty('--pointer-y', `${y}%`);
  });
}

init()
  .then(() => {
    setupCopyButton();
    setupReveal();
    setupHeroGlow();
  })
  .catch((error) => {
    console.error('Unable to initialize the project page.', error);
  });
