/* ==========================================================================
   MAIN SYSTEM COORDINATOR
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Theme Preference (Cream Light theme is the default)
  const savedTheme = localStorage.getItem('portfolio-theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }

  // 2. Dynamic Copyright Year
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // 3. Indian Standard Time (IST) Clock in bottom Status Bar
  const clockSpan = document.getElementById('status-clock');
  if (clockSpan) {
    const updateClock = () => {
      const date = new Date();
      // Formats specifically to India/Kolkata timezone (IST) where Pune resides
      const options = { 
        timeZone: 'Asia/Kolkata', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: false 
      };
      const timeStr = date.toLocaleTimeString('en-US', options);
      clockSpan.textContent = `${timeStr} IST`;
    };
    updateClock();
    setInterval(updateClock, 1000);
  }

  // 4. Custom Mouse Cursor Follower
  const cursorDot = document.getElementById('custom-cursor');
  const cursorRing = document.getElementById('custom-cursor-ring');
  
  if (cursorDot && cursorRing) {
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Instantly position the center dot
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });
    
    // Smooth trailing ring follow loop
    const followLoop = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
      
      requestAnimationFrame(followLoop);
    };
    followLoop();
    
    // Detect hovering over links and interactive buttons to apply expand effects
    const hoverables = document.querySelectorAll('a, button, select, input[type="range"]');
    hoverables.forEach(item => {
      item.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
      });
      item.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
      });
    });
  }

  // 5. DevTools Console Greeting for Recruiter Audit
  console.log(
    '%cADITYA WADEKAR %c| Portfolio systems',
    'color: #1b5def; font-family: monospace; font-size: 16px; font-weight: bold;',
    'color: #191818; font-family: monospace; font-size: 14px;'
  );
  console.log(
    '%cStatus: Entering Third-Year Robotics Engineering Student @ Pune, India\nFocus: Machine Learning, Data Science, Intelligent Systems\nSeeking: Summer 2026/2027 ML & Data Science Internships\n\nKeyboard Shortcuts:\n  [J] Scroll Down\n  [K] Scroll Up\n  [D] Toggle Dark/Light Theme\n  [H] Toggle Shortcuts Modal',
    'color: rgba(25, 24, 24, 0.7); font-family: monospace; font-size: 11px; line-height: 1.5;'
  );
  
  window.aditya = {
    name: "Aditya Wadekar",
    college: "AISSMS College of Engineering, Pune",
    major: "Robotics & Automation Engineering (B.E. 2028)",
    gpa: "Sem 1: 7.95 | Sem 2: 8.07 | Sem 3: 8.41",
    openSource: "pandas-dev/pandas contributor (documentation & bug fixes)",
    contact: "adityawadekar001@gmail.com | +91 93259 36489"
  };

  // 6. Scroll Fade-in Animations (IntersectionObserver)
  const animElements = document.querySelectorAll(
    'section h2, .about-wrapper, .gatis-grid, .project-card, .timeline-item, .skill-category-card, .hobby-card, .learning-board'
  );
  
  animElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(15px)';
    el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
  });

  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        observer.unobserve(el); // Animate once
      }
    });
  }, { threshold: 0.05 });

  animElements.forEach(el => {
    scrollObserver.observe(el);
  });

  // 7. Clickable links updates active nav styles
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('header.site-header nav a');

  window.addEventListener('scroll', () => {
    let currentId = '';
    sections.forEach(sec => {
      const top = sec.offsetTop;
      if (window.scrollY >= top - window.innerHeight * 0.3) {
        currentId = sec.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === `#${currentId}` || (currentId === 'ml-projects' && href === '#gatis')) {
        link.classList.add('active');
      }
    });
  });

  // 8. Robust Mailto Handling (Copy to clipboard as fallback)
  const mailtoLinks = document.querySelectorAll('a[href^="mailto:"]');
  mailtoLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const email = link.getAttribute('href').replace('mailto:', '');
      
      // Attempt to copy to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email)
          .then(() => {
            if (window.keyboardEngine && typeof window.keyboardEngine.showToast === 'function') {
              window.keyboardEngine.showToast('mail', `Copied to clipboard: ${email}`);
            }
          })
          .catch(err => {
            console.error('Failed to copy email to clipboard: ', err);
          });
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = email;
        textArea.style.position = 'fixed';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          if (window.keyboardEngine && typeof window.keyboardEngine.showToast === 'function') {
            window.keyboardEngine.showToast('mail', `Copied to clipboard: ${email}`);
          }
        } catch (err) {
          console.error('Fallback copy failed: ', err);
        }
        document.body.removeChild(textArea);
      }
    });
  });

  // 9. Initialize 3D Card Tilt Effect
  new CardTilt();
});

/* ==========================================================================
   3D CARD PARALLAX TILT ENGINE
   ========================================================================== */
class CardTilt {
  constructor() {
    // Only activate on hover-capable devices to prevent layout lock-ups on touch
    if (window.matchMedia('(hover: hover)').matches) {
      this.cards = document.querySelectorAll('.editorial-card');
      this.init();
    }
  }

  init() {
    this.cards.forEach(card => {
      // Dynamically inject glare reflection element
      const glare = document.createElement('div');
      glare.className = 'card-glare';
      card.appendChild(glare);

      card.addEventListener('mousemove', (e) => this.handleMouseMove(e, card, glare));
      card.addEventListener('mouseleave', () => this.handleMouseLeave(card, glare));
      card.addEventListener('mouseenter', () => this.handleMouseEnter(card));
    });
  }

  handleMouseEnter(card) {
    // Disable standard transition temporarily to ensure responsiveness
    card.style.transition = 'none';
  }

  handleMouseMove(e, card, glare) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const width = rect.width;
    const height = rect.height;
    
    // Normalized position relative to center: range [-0.5, 0.5]
    const normX = (x / width) - 0.5;
    const normY = (y / height) - 0.5;
    
    const maxRot = 8; // Max 8 degrees of rotation for subtle, elegant depth
    const rotX = -normY * maxRot;
    const rotY = normX * maxRot;
    
    // Apply 3D perspective rotation and scale
    card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.015, 1.015, 1.015)`;
    card.style.boxShadow = `${-normX * 12}px ${-normY * 12}px 16px rgba(0, 0, 0, 0.12)`;
    
    // Calculate light source angle based on mouse coordinates relative to center
    const angle = Math.atan2(y - height / 2, x - width / 2) * (180 / Math.PI);
    glare.style.opacity = '1';
    glare.style.background = `linear-gradient(${angle - 90}deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 80%)`;
  }

  handleMouseLeave(card, glare) {
    // Restore transition for smooth elastic spring back to rest
    card.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    card.style.boxShadow = '';
    glare.style.opacity = '0';
  }
}
