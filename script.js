async function init() {
  const response = await fetch('./data.json');
  const items = await response.json();

  const claimAGrid = document.getElementById('claim-a-grid');
  const claimBGrid = document.getElementById('claim-b-grid');
  const template = document.getElementById('video-card-template');

  items.forEach((item) => {
    const node = template.content.cloneNode(true);
    const card = node.querySelector('.video-card');
    const prompt = node.querySelector('.prompt');
    const [oriVideo, oursVideo] = node.querySelectorAll('video');
    const pair = [oriVideo, oursVideo];

    prompt.textContent = item.prompt;
    oriVideo.src = `videos/${item.slug}/ori.mp4`;
    oursVideo.src = `videos/${item.slug}/ours.mp4`;

    let syncing = false;

    function syncState(source, action) {
      if (syncing) return;
      syncing = true;
      pair.forEach((video) => {
        if (video === source) return;
        if (action === 'play') {
          video.currentTime = source.currentTime;
          video.play().catch(() => {});
        }
        if (action === 'pause') {
          video.currentTime = source.currentTime;
          video.pause();
        }
        if (action === 'seeking') {
          video.currentTime = source.currentTime;
        }
        if (action === 'ratechange') {
          video.playbackRate = source.playbackRate;
        }
        if (action === 'ended') {
          video.currentTime = 0;
          video.pause();
        }
      });
      syncing = false;
    }

    pair.forEach((video) => {
      video.addEventListener('play', () => syncState(video, 'play'));
      video.addEventListener('pause', () => syncState(video, 'pause'));
      video.addEventListener('seeking', () => syncState(video, 'seeking'));
      video.addEventListener('ratechange', () => syncState(video, 'ratechange'));
      video.addEventListener('ended', () => syncState(video, 'ended'));
    });

    card.addEventListener('mouseenter', () => {
      const t = Math.max(oriVideo.currentTime, oursVideo.currentTime);
      pair.forEach((video) => {
        video.currentTime = t;
      });
    });

    const target = item.claim === 'a' ? claimAGrid : claimBGrid;
    target.appendChild(node);
  });
}

init();
