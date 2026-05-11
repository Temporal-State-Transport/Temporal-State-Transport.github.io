async function init() {
  const response = await fetch('./data.json');
  const items = await response.json();

  const claimAGrid = document.getElementById('claim-a-grid');
  const claimBGrid = document.getElementById('claim-b-grid');
  const template = document.getElementById('video-card-template');

  items.forEach((item) => {
    const node = template.content.cloneNode(true);
    const index = node.querySelector('.sample-index');
    const tag = node.querySelector('.claim-tag');
    const prompt = node.querySelector('.prompt');
    const [oriVideo, oursVideo] = node.querySelectorAll('video');

    index.textContent = `Sample ${String(item.idx).padStart(2, '0')}`;
    tag.textContent = item.claim === 'a' ? 'Detail realism' : 'Physical correction';
    prompt.textContent = item.prompt;

    oriVideo.src = `videos/${item.slug}/ori.mp4`;
    oursVideo.src = `videos/${item.slug}/ours.mp4`;

    const target = item.claim === 'a' ? claimAGrid : claimBGrid;
    target.appendChild(node);
  });
}

init();
