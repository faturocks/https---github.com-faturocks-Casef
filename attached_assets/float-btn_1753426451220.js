// Floating Back to Top Button
(function() {
  function createBackToTop() {
    if (document.getElementById('back-to-top-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'back-to-top-btn';
    btn.title = 'Back to Top';
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>`;
    btn.className = 'fixed z-50 bottom-6 right-6 md:bottom-10 md:right-10 p-3 rounded-full bg-sky-600 hover:bg-sky-700 text-white shadow-lg transition-opacity opacity-0 pointer-events-none';
    btn.style.transition = 'opacity 0.2s';
    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.body.appendChild(btn);
    // Show/hide on scroll
    window.addEventListener('scroll', function() {
      if (window.scrollY > 200) {
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
      } else {
        btn.style.opacity = '0';
        btn.style.pointerEvents = 'none';
      }
    });
  }
  document.addEventListener('DOMContentLoaded', createBackToTop);
})();
