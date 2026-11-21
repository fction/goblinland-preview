(() => {
  const demo = document.querySelector('.wallet-demo');
  if (!demo) return;
  const card = demo.querySelector('#demo-card');
  const asset = demo.querySelector('#demo-asset');
  const history = demo.querySelector('.desk-history');
  const filter = history.querySelector('select');
  let currentView = 'overview';
  function renderHistory() {
    history.hidden = currentView === 'fund';
    history.querySelector('h4').textContent = currentView === 'activity' ? 'Activity' : 'Recent activity';
    const matching = [...history.querySelectorAll('[data-history-card]')].filter(row => filter.value === 'all' || row.dataset.historyCard === filter.value);
    const visible = currentView === 'overview' ? matching.slice(0, 3) : matching;
    for (const row of history.querySelectorAll('[data-history-card]')) row.hidden = !visible.includes(row);
  }
  function renderCard() {
    const physical = card.value === 'physical';
    demo.querySelector('#demo-art').src = 'assets/hero/portrait-approved-' + (physical ? 'Cash' : 'Virtual') + '.png';
    demo.querySelector('#demo-balance').textContent = physical ? '$980.00' : '$260.50';
    demo.querySelector('#demo-physical').hidden = !physical;
    demo.querySelector('#demo-instructions').textContent = physical
      ? 'Open your dashboard for the ' + asset.value + ' deposit address and network for your physical card.'
      : 'Select your virtual card in the dashboard to see its available funding methods.';
  }
  function show(view) {
    currentView = view;
    renderHistory();
    for (const screen of demo.querySelectorAll('[data-screen]')) screen.hidden = screen.dataset.screen !== view;
    for (const button of demo.querySelectorAll('[data-view]')) {
      if (button.dataset.view === view) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    }
  }
  demo.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (button?.dataset.view) show(button.dataset.view);
    if (button?.dataset.fundCard) {
      card.value = button.dataset.fundCard;
      renderCard();
      show('fund');
      demo.querySelector('#desk-fund').focus({preventScroll:true});
    }
  });
  card.addEventListener('change', renderCard);
  asset.addEventListener('change', renderCard);
  filter.addEventListener('change', renderHistory);
  renderHistory();
  renderCard();
})();
