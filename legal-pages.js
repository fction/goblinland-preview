// Native fragment navigation keeps browser history, Find and text selection.
(()=>{const links=[...document.querySelectorAll('.legal-toc a')];function sync(){for(const a of links){if(a.hash===location.hash)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');}}addEventListener('hashchange',sync);sync();})();
