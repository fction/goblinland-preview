import {configureLink} from './destinations.js';
for(const a of document.querySelectorAll('[data-section-destination]'))configureLink(a,a.dataset.sectionDestination);
// Accordion enhances synchronously after its HTML; it does not depend on this module or WebGL.
