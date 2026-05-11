async function init() {
  const response = await fetch('./data.json');
  const items = await response.json();

  const claimAGrid = document.getElementById('claim-a-grid');
  const claimBGrid = document.getElementById('claim-b-grid');
  const template = document.getElementById('video-card-template');

  items.forEach((item) => {
    const node = template.content.cloneNode(true);
    const card = node.querySelector('.video-card');
    const index = node.querySelector('.sample-index');
    const pill = node.querySelector('.claim-pill');
    const prompt = node.querySelector('.prompt');
    const [oriVideo, oursVideo] = node.querySelectorAll('video');

    index.textContent = `Sample ${String(item.idx).padStart(2, '0')}`;
    pill.textContent = item.claim === 'a' ? 'Detail recovery' : 'Physical correction';
    prompt.textContent = item.prompt;

    oriVideo.src = `videos/${item.slug}/ori.mp4`;
    oursVideo.src = `videos/${item.slug}/ours.mp4`;

    const playAll = () => {
      oriVideo.play().catch(() => {});
      oursVideo.play().catch(() => {});
    };

    const pauseAll = () => {
      oriVideo.pause();
      oursVideo.pause();
    };

    card.addEventListener('mouseenter', playAll);
    card.addEventListener('mouseleave', pauseAll);
    card.addEventListener('focusin', playAll);
    card.addEventListener('focusout', pauseAll);
    card.addEventListener('touchstart', playAll, { passive: true });

    const target = item.claim === 'a' ? claimAGrid : claimBGrid;
    target.appendChild(node);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const videos = entry.target.querySelectorAll('video');
        if (entry.isIntersecting) {
          videos.forEach((video) => video.play().catch(() => {}));
        } else {
          videos.forEach((video) => video.pause());
        }
      });
    },
    {
      threshold: 0.35,
    }
  );

  document.querySelectorAll('.video-card').forEach((card) => observer.observe(card));
}

init();
