// ===== BLOG NAVBAR =====
const blogHamburger = document.getElementById('hamburger');
const blogNavLinks = document.getElementById('navLinks');

if (blogHamburger && blogNavLinks) {
  blogHamburger.addEventListener('click', () => {
    blogHamburger.classList.toggle('open');
    blogNavLinks.classList.toggle('show');
  });
  blogNavLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      blogHamburger.classList.remove('open');
      blogNavLinks.classList.remove('show');
    });
  });
}

const blogNavbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (blogNavbar) blogNavbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== BLOG SEARCH (listing page) =====
const blogSearchInput = document.getElementById('blogSearch');
const blogGrid = document.getElementById('blogGrid');

if (blogSearchInput && blogGrid) {
  const blogCards = blogGrid.querySelectorAll('.blog-card');
  blogSearchInput.addEventListener('input', () => {
    const q = blogSearchInput.value.trim().toLowerCase();
    blogCards.forEach(card => {
      const match = !q || card.dataset.search.indexOf(q) !== -1;
      card.style.display = match ? '' : 'none';
    });
  });
}