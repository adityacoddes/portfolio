/* ==========================================================================
   KEYBOARD NAVIGATION & SHORTCUT ENGINE
   ========================================================================== */

class KeyboardEngine {
  constructor() {
    this.sections = [
      { id: 'hero', name: 'Introduction' },
      { id: 'gatis', name: 'GATIS Case Study' },
      { id: 'ml-projects', name: 'ML Projects' },
      { id: 'skills', name: 'Technical Skills' },
      { id: 'learning', name: 'Currently Learning' },
      { id: 'hobbies', name: 'Beyond Engineering' },
      { id: 'contact', name: 'Contact Info' }
    ];
    
    this.currentSectionIndex = 0;
    this.toastTimeout = null;
    
    this.init();
  }

  init() {
    this.createToastElement();
    this.createHelpModal();
    
    // Bind global key listeners
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    
    // Bind click listener for help button in status bar
    const helpBtn = document.getElementById('status-help-btn');
    if (helpBtn) {
      helpBtn.addEventListener('click', () => this.toggleHelpModal());
    }
    
    // Detect active section on scroll to sync J/K index
    window.addEventListener('scroll', () => this.syncActiveSectionIndex());
  }

  createToastElement() {
    this.toast = document.createElement('div');
    this.toast.className = 'keyboard-toast';
    document.body.appendChild(this.toast);
  }

  createHelpModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'keyboard-modal';
    this.modal.innerHTML = `
      <div class="keyboard-modal-content">
        <h3 class="keyboard-modal-title">Keyboard Navigation</h3>
        <ul class="keyboard-shortcuts-list">
          <li class="keyboard-shortcut-row">
            <span>Scroll Down</span>
            <span class="keys"><kbd>J</kbd></span>
          </li>
          <li class="keyboard-shortcut-row">
            <span>Scroll Up</span>
            <span class="keys"><kbd>K</kbd></span>
          </li>
          <li class="keyboard-shortcut-row">
            <span>Toggle Theme</span>
            <span class="keys"><kbd>D</kbd></span>
          </li>
          <li class="keyboard-shortcut-row">
            <span>Toggle Help Guide</span>
            <span class="keys"><kbd>H</kbd></span>
          </li>
          <li class="keyboard-shortcut-row">
            <span>Jump to Section</span>
            <span class="keys"><kbd>1</kbd> - <kbd>7</kbd></span>
          </li>
        </ul>
        <button class="keyboard-modal-close" id="close-kbd-modal">Dismiss Guide</button>
      </div>
    `;
    document.body.appendChild(this.modal);
    
    this.modal.querySelector('#close-kbd-modal').addEventListener('click', () => {
      this.toggleHelpModal();
    });
    
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.toggleHelpModal();
      }
    });
  }

  handleKeyDown(e) {
    // Ignore keyboard shortcuts if the user is typing in a form or input
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
      return;
    }

    const key = e.key.toLowerCase();
    
    // 1. Help Modal toggle [H]
    if (key === 'h') {
      e.preventDefault();
      this.toggleHelpModal();
      this.showToast('h', 'Help Guide Toggled');
      return;
    }

    // 2. Theme Toggle [D]
    if (key === 'd') {
      e.preventDefault();
      this.toggleTheme();
      return;
    }

    // 3. Scroll Down [J]
    if (key === 'j') {
      e.preventDefault();
      this.scrollSection(1);
      this.showToast('j', 'Scroll: Next Section');
      return;
    }

    // 4. Scroll Up [K]
    if (key === 'k') {
      e.preventDefault();
      this.scrollSection(-1);
      this.showToast('k', 'Scroll: Previous Section');
      return;
    }

    // 5. Direct Jump [1-9]
    if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(key)) {
      const idx = parseInt(key) - 1;
      if (idx < this.sections.length) {
        e.preventDefault();
        this.currentSectionIndex = idx;
        const targetSection = document.getElementById(this.sections[idx].id);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
          this.showToast(key, `Jump: ${this.sections[idx].name}`);
        }
      }
    }
  }

  toggleHelpModal() {
    this.modal.classList.toggle('active');
    
    // Update Mode in status bar when help modal is open
    const statusMode = document.getElementById('status-mode');
    if (statusMode) {
      statusMode.textContent = this.modal.classList.contains('active') ? 'HELP' : 'VIEW';
    }
  }

  toggleTheme() {
    const isDark = document.body.classList.contains('dark');
    if (isDark) {
      document.body.classList.remove('dark');
      this.showToast('d', 'Theme: Cream Light');
    } else {
      document.body.classList.add('dark');
      this.showToast('d', 'Theme: Obsidian Dark');
    }
    
    // Save theme preference in localStorage
    localStorage.setItem('portfolio-theme', !isDark ? 'dark' : 'light');
    
    // Dispatch custom event to notify other scripts (like widgets redrawing canvas charts)
    document.dispatchEvent(new Event('themeChanged'));
  }

  scrollSection(direction) {
    let nextIndex = this.currentSectionIndex + direction;
    
    if (nextIndex >= 0 && nextIndex < this.sections.length) {
      this.currentSectionIndex = nextIndex;
      const targetSection = document.getElementById(this.sections[nextIndex].id);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  syncActiveSectionIndex() {
    // Find which section is currently active on scroll to sync index
    let activeId = '';
    this.sections.forEach((sec, idx) => {
      const el = document.getElementById(sec.id);
      if (el) {
        const top = el.offsetTop;
        if (window.scrollY >= top - window.innerHeight * 0.4) {
          activeId = sec.id;
          this.currentSectionIndex = idx;
        }
      }
    });
    
    // Update status location readout
    const statusLoc = document.getElementById('status-location');
    if (statusLoc && activeId) {
      statusLoc.textContent = `src/sections/${activeId}.html`;
    }
  }

  showToast(keyChar, message) {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    
    this.toast.innerHTML = `<span class="key">${keyChar.toUpperCase()}</span> ${message}`;
    this.toast.classList.add('show');
    
    // Temporarily flash key action mode in bottom status-bar
    const statusMode = document.getElementById('status-mode');
    const originalMode = statusMode ? statusMode.textContent : 'VIEW';
    if (statusMode && originalMode !== 'HELP') {
      statusMode.textContent = 'KEY_CMD';
    }
    
    this.toastTimeout = setTimeout(() => {
      this.toast.classList.remove('show');
      if (statusMode && statusMode.textContent === 'KEY_CMD') {
        statusMode.textContent = this.modal.classList.contains('active') ? 'HELP' : 'VIEW';
      }
    }, 1500);
  }
}

// Instantiate on document load
document.addEventListener('DOMContentLoaded', () => {
  window.keyboardEngine = new KeyboardEngine();
});
