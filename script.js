// ===== NAVBAR =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('show');
});

const navAnchors = document.querySelectorAll('.nav-links a');
navAnchors.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('show');
  });
});

// ===== SCROLL EFFECTS =====
const navbar = document.getElementById('navbar');
const sections = document.querySelectorAll('section[id]');
const navAnchorsArr = Array.from(navAnchors);

window.addEventListener('scroll', () => {
  // Add shadow on scroll
  navbar.classList.toggle('scrolled', window.scrollY > 50);

  // Active nav link
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 200;
    if (window.scrollY >= top) {
      current = section.getAttribute('id');
    }
  });

  navAnchorsArr.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

// ===== TESTIMONIALS SLIDER =====
const wrapper = document.getElementById('testimonialWrapper');
const slides = wrapper.querySelectorAll('.testimonial');
 const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('sliderDots');
let currentSlide = 0;
const totalSlides = slides.length;

// Create dots
for (let i = 0; i < totalSlides; i++) {
  const dot = document.createElement('div');
  dot.classList.add('dot');
  if (i === 0) dot.classList.add('active');
  dot.dataset.index = i;
  dot.addEventListener('click', () => goToSlide(i));
  dotsContainer.appendChild(dot);
}

const dots = dotsContainer.querySelectorAll('.dot');

function goToSlide(index) {
  currentSlide = index;
  wrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
  dots.forEach(d => d.classList.remove('active'));
  dots[currentSlide].classList.add('active');
}

nextBtn.addEventListener('click', () => {
  currentSlide = (currentSlide + 1) % totalSlides;
  goToSlide(currentSlide);
});

prevBtn.addEventListener('click', () => {
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  goToSlide(currentSlide);
});

// Auto-play
let autoplay = setInterval(() => {
  currentSlide = (currentSlide + 1) % totalSlides;
  goToSlide(currentSlide);
}, 5000);

document.querySelector('.testimonials-slider').addEventListener('mouseenter', () => clearInterval(autoplay));
document.querySelector('.testimonials-slider').addEventListener('mouseleave', () => {
  autoplay = setInterval(() => {
    currentSlide = (currentSlide + 1) % totalSlides;
    goToSlide(currentSlide);
  }, 5000);
});
// ===== PRACTICE PAPERS =====
fetch('/papers/papers.json')
  .then(r => r.json())
  .then(papers => {
    const container = document.getElementById('papersList');
    if (!papers || !papers.length) return;
    const groups = {};
    papers.forEach(p => {
      const parts = p.folder.split(' / ');
      const g = parts.slice(0, 2).join(' / ');
      const subject = parts.slice(2).join(' / ') || 'Other';
      if (!groups[g]) groups[g] = [];
      groups[g].push({ ...p, subject });
    });
    let html = '';
    Object.keys(groups).sort().forEach(group => {
      html += `<div class="papers-group"><h3 class="papers-group-title"><i class="fas fa-folder-open"></i> ${group}</h3>`;
      groups[group].forEach(p => {
        html += `
          <a href="papers/${p.path}" class="paper-item" download>
            <i class="fas fa-file-pdf"></i>
            <div class="paper-info">
              <h4>${p.name.replace(/\.pdf$/i, '')}</h4>
              <span class="paper-subject">${p.subject}</span>
              <span>${p.size} &middot; ${p.date}</span>
            </div>
            <span class="paper-download"><i class="fas fa-download"></i> Download</span>
          </a>
        `;
      });
      html += `</div>`;
    });
    container.innerHTML = html;
  })
  .catch(() => {});

// ===== SCROLL REVEAL =====
const revealElements = document.querySelectorAll('.section:not(.hero)');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

revealElements.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});
