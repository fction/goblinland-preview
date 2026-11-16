import { selectorProductForCard, selectorProducts } from './selector-content.js';

const stage = document.querySelector('#stage');
const board = stage.querySelector('.hero-grid-layout');
const compact = document.querySelector('.hero-comparison-compact');
const buttons = board.querySelectorAll('[data-hero-card]');

function createSpecification(card, id) {
  const productKey = selectorProductForCard[card];
  const product = selectorProducts[productKey];
  const panel = document.createElement('div');
  const marker = document.createElement('span');
  const facts = document.createElement('dl');

  panel.id = id;
  panel.className = 'hero-specification';
  panel.hidden = true;
  marker.className = 'hero-spec-marker';
  marker.setAttribute('aria-hidden', 'true');

  for (const [label, value] of product.facts) {
    const row = document.createElement('div');
    const term = document.createElement('dt');
    const description = document.createElement('dd');
    term.textContent = label;
    description.textContent = value;
    if (label === 'Payments') description.classList.add('hero-spec-supported');
    if (label === 'Cash' && productKey === 'virtual') {
      description.classList.add('hero-spec-unavailable');
    }
    row.append(term, description);
    facts.append(row);
  }

  panel.append(marker, facts);
  return panel;
}

// Keep the board at its original size: the 3D scene uses its bounds for projection.
function fitDesktopSpecifications() {
  if (!board.offsetHeight) return;

  let contentBottom = 0;
  let bottom = board.offsetHeight;
  for (const button of buttons) {
    const column = button.parentElement;
    contentBottom = Math.max(contentBottom, column.offsetTop + column.offsetHeight);
    bottom = Math.max(bottom, contentBottom);
  }
  stage.style.setProperty('--hero-spec-overflow', Math.ceil(bottom - board.offsetHeight) + 'px');
}

const observer = new ResizeObserver(fitDesktopSpecifications);
observer.observe(board);

for (const button of buttons) {
  const card = button.dataset.heroCard;
  const column = button.parentElement;
  const productName = selectorProducts[selectorProductForCard[card]].name;
  const label = column.querySelector('p > span');
  label.textContent = productName;
  const number = column.querySelector('small').textContent;
  button.setAttribute('aria-label', productName + ' ' + number + ' specifications');
  const compactColumn = document.createElement('article');
  const compactHeading = document.createElement('h3');
  compactHeading.textContent = productName;
  const compactButton = button.cloneNode(true);
  const views = [
    [column, button, 'hero-spec-' + card.toLowerCase()],
    [compactColumn, compactButton, 'hero-spec-compact-' + card.toLowerCase()],
  ];

  compactColumn.append(compactHeading, compactButton);
  compact.append(compactColumn);
  observer.observe(column);

  const panels = views.map(([container, control, id]) => {
    const panel = createSpecification(card, id);
    control.setAttribute('aria-controls', id);
    control.setAttribute('aria-expanded', 'false');
    control.disabled = false;
    container.append(panel);
    return panel;
  });

  // The panels stay open for the lifetime of this document, including BFCache restores.
  function reveal() {
    if (!panels[0].hidden) return;

    views.forEach(([, control], index) => {
      control.setAttribute('aria-expanded', 'true');
      panels[index].hidden = false;
    });
    fitDesktopSpecifications();
  }

  for (const [, control] of views) control.addEventListener('click', reveal);
}

compact.hidden = false;
