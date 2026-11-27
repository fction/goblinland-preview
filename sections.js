import {configureLink} from './destinations.js';
for(const a of document.querySelectorAll('[data-section-destination]'))configureLink(a,a.dataset.sectionDestination);
// Accordion enhances synchronously after its HTML; it does not depend on this module or WebGL.

const transfer = document.querySelector('.guide-transfer');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
if (transfer && 'IntersectionObserver' in window && !reducedMotion.matches) {
  transfer.dataset.transfer = 'waiting';
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.intersectionRatio < 0.6) return;
    observer.disconnect();
    transfer.dataset.transfer = 'received';
  }, {threshold:0.6});
  observer.observe(transfer);
  // Once the amount settles (or motion is disabled), leave the illustration static.
  const credit = transfer.querySelector('.transfer-credit');
  function finishTransfer() {
    observer.disconnect();
    delete transfer.dataset.transfer;
    reducedMotion.removeEventListener('change', finishTransfer);
    credit.removeEventListener('animationend', finishTransfer);
  }
  credit.addEventListener('animationend', finishTransfer);
  reducedMotion.addEventListener('change', finishTransfer);
}
