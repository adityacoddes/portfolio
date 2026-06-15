/* ==========================================================================
   PROJECT CARD MECHANICS - DETAILS DRAWER & FILTERING
   ========================================================================== */

class ProjectManager {
  constructor() {
    this.expandButtons = document.querySelectorAll('.project-card-expand-btn');
    this.filterButtons = document.querySelectorAll('.project-filter-btn');
    this.projectCards = document.querySelectorAll('.project-card-wrapper');
    this.timelineItems = document.querySelectorAll('.timeline-item');
    
    this.init();
  }

  init() {
    // 1. Expand/Collapse drawers
    this.expandButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.toggleDrawer(e));
    });

    // 2. Journey timeline hover tracker
    this.setupTimelineObserver();
  }

  toggleDrawer(e) {
    const btn = e.currentTarget;
    const cardBody = btn.closest('.editorial-card');
    const drawer = cardBody.querySelector('.project-drawer');
    const labelSpan = btn.querySelector('.btn-label') || btn;
    const arrowSpan = btn.querySelector('.btn-arrow');
    
    if (!drawer) return;

    const isActive = drawer.classList.contains('active');
    
    // Collapse all other active drawers first for a clean layout
    document.querySelectorAll('.project-drawer.active').forEach(otherDrawer => {
      if (otherDrawer !== drawer) {
        otherDrawer.classList.remove('active');
        otherDrawer.style.maxHeight = null;
        
        // Reset corresponding buttons
        const otherCard = otherDrawer.closest('.editorial-card');
        const otherBtn = otherCard.querySelector('.project-card-expand-btn');
        if (otherBtn) {
          const otherLabel = otherBtn.querySelector('.btn-label') || otherBtn;
          const otherArrow = otherBtn.querySelector('.btn-arrow');
          if (otherLabel) otherLabel.textContent = 'Technical Details';
          if (otherArrow) otherArrow.style.transform = 'rotate(0deg)';
        }
      }
    });

    // Toggle current drawer
    if (isActive) {
      drawer.classList.remove('active');
      drawer.style.maxHeight = null;
      labelSpan.textContent = 'Technical Details';
      if (arrowSpan) arrowSpan.style.transform = 'rotate(0deg)';
    } else {
      drawer.classList.add('active');
      // Set height dynamically based on content scroll height
      drawer.style.maxHeight = drawer.scrollHeight + 'px';
      labelSpan.textContent = 'Close Details';
      if (arrowSpan) arrowSpan.style.transform = 'rotate(180deg)';
      
      // Smoothly scroll the card into view if needed
      setTimeout(() => {
        cardBody.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 300);
    }
  }

  setupTimelineObserver() {
    if (this.timelineItems.length === 0) return;

    // Use IntersectionObserver to highlight active journey stages
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -40% 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        } else {
          // Keep it highlighted once visited to make scrolling look completed
          // entry.target.classList.remove('active');
        }
      });
    }, observerOptions);

    this.timelineItems.forEach(item => {
      observer.observe(item);
    });
  }
}

// Instantiate on document load
document.addEventListener('DOMContentLoaded', () => {
  new ProjectManager();
});
