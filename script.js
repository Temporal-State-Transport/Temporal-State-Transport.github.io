async function init() {
  const response = await fetch('./data.json');
  const items = await response.json();

  const claimAGrid = document.getElementById('claim-a-grid');
  const claimBGrid = document.getElementById('claim-b-grid');
  const template = document.getElementById('video-card-template');

  items
    .filter((item) => item.idx !== 4)
    .forEach((item) => {
      const node = template.content.cloneNode(true);
      const prompt = node.querySelector('.prompt');
      const [oriVideo, oursVideo] = node.querySelectorAll('video');
      const pair = [oriVideo, oursVideo];

      prompt.textContent = item.prompt;
      oriVideo.src = `videos/${item.slug}/ori.mp4`;
      oursVideo.src = `videos/${item.slug}/ours.mp4`;

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

init();
