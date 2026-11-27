(() => {
  const deck = document.querySelector('.review-deck');
  if (!deck) return;
  const cards = [...deck.querySelectorAll('.reader-card')];
  const status = deck.querySelector('[role="status"]');
  let current = cards.findIndex(card => card.classList.contains('review-featured'));
  const half = Math.floor(cards.length / 2);

  function show(index) {
    current = (index + cards.length) % cards.length;
    cards.forEach((card, i) => {
      const offset = (i - current + cards.length + half) % cards.length - half;
      const depth = Math.abs(offset);
      card.classList.remove('review-featured');
      card.dataset.offset = offset;
      card.style.setProperty('--offset', offset);
      card.style.setProperty('--scale', depth ? .86 * .94 ** (depth - 1) : 1);
      card.style.setProperty('--drop', 18 * Math.min(depth, 2) + 'px');
      card.style.setProperty('--tilt', Math.sign(offset) * 7 + 'deg');
      card.inert = offset !== 0;
    });
    status.textContent = 'Review ' + (current + 1) + ' of ' + cards.length + ', ' + cards[current].querySelector('strong').textContent;
  }

  for (const button of deck.querySelectorAll('[data-review-step]')) {
    button.hidden = false;
    button.addEventListener('click', () => show(current + Number(button.dataset.reviewStep)));
  }
  deck.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const onCard = event.target.closest('.reader-card');
    show(current + (event.key === 'ArrowRight' ? 1 : -1));
    if (onCard) cards[current].querySelector('a').focus({preventScroll:true});
  });
  let start;
  let suppressClick = false;
  deck.addEventListener('pointerdown', event => {
    start = [event.clientX, event.clientY];
    suppressClick = false;
  });
  deck.addEventListener('pointercancel', () => { start = null; });
  deck.addEventListener('pointerup', event => {
    if (!start) return;
    const dx = event.clientX - start[0], dy = event.clientY - start[1];
    start = null;
    if (Math.abs(dx) < 32 || Math.abs(dx) <= Math.abs(dy)) return;
    suppressClick = true;
    show(current - Math.sign(dx));
  });
  deck.addEventListener('click', event => {
    if (suppressClick && event.detail) {
      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
  show(current);
})();
