// ==================== 404 Page Interactive Features ====================

document.addEventListener('DOMContentLoaded', () => {
  // Generate animated stars
  generateStars();
  
  // Add interactive effects to buttons
  initializeButtons();
  
  // Track when user attempts to "return home" from error
  trackErrorResolution();
  
  // Initialize mouse tracking effect
  initializeMouseTracking();
  
  // Add scroll animations
  initializeScrollAnimations();
  
  // Add background color pulse on hover
  const statsElements = document.querySelectorAll('.stat');
  statsElements.forEach(stat => {
    stat.addEventListener('mouseenter', () => {
      stat.style.borderColor = '#06b6d4';
      stat.style.transform = 'scale(1.05)';
    });
    stat.addEventListener('mouseleave', () => {
      stat.style.borderColor = 'rgba(6, 182, 212, 0.3)';
      stat.style.transform = 'scale(1)';
    });
  });

  // Add accessibility features
  initializeAccessibility();

  // Easter eggs
  initializeEasterEggs();
});

/**
 * Generate animated stars in the background
 */
function generateStars() {
  const starsContainer = document.querySelector('.stars');
  const starCount = Math.min(Math.max(Math.floor(window.innerWidth / 100), 20), 100);
  
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.cssText = `
      position: fixed;
      width: ${Math.random() * 2 + 1}px;
      height: ${Math.random() * 2 + 1}px;
      background: white;
      border-radius: 50%;
      top: ${Math.random() * 100}%;
      left: ${Math.random() * 100}%;
      opacity: ${Math.random() * 0.7 + 0.3};
      z-index: 0;
      pointer-events: none;
      animation: twinkle ${Math.random() * 3 + 2}s ease-in-out ${Math.random() * 2}s infinite;
    `;
    starsContainer.appendChild(star);
  }
}

/**
 * Initialize button interactions
 */
function initializeButtons() {
  const buttons = document.querySelectorAll('.error-actions .btn');
  
  buttons.forEach(btn => {
    // Add ripple effect on click
    btn.addEventListener('click', (e) => {
      // Create ripple element
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 50%;
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        animation: ripple-animation 0.6s ease-out;
      `;
      
      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);
      
      // Remove ripple after animation
      setTimeout(() => ripple.remove(), 600);
    });
    
    // Add hover particle effect for primary button
    if (btn.classList.contains('btn-primary')) {
      btn.addEventListener('mouseenter', () => {
        createParticles(btn);
      });
    }
  });
}

/**
 * Create particle effects
 */
function createParticles(element) {
  const rect = element.getBoundingClientRect();
  const particleCount = 5;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: fixed;
      width: 4px;
      height: 4px;
      background: #06b6d4;
      border-radius: 50%;
      left: ${rect.left + rect.width / 2}px;
      top: ${rect.top + rect.height / 2}px;
      pointer-events: none;
      z-index: 1000;
      box-shadow: 0 0 10px #06b6d4;
      animation: particle-float ${Math.random() * 1 + 0.8}s ease-out forwards;
    `;
    
    const angle = (Math.PI * 2 * i) / particleCount;
    const velocity = 50 + Math.random() * 50;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;
    
    particle.style.setProperty('--vx', `${vx}px`);
    particle.style.setProperty('--vy', `${vy}px`);
    
    document.body.appendChild(particle);
    
    setTimeout(() => particle.remove(), 1500);
  }
}

/**
 * Add CSS for particle animation
 */
function addParticleStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple-animation {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
    
    @keyframes particle-float {
      to {
        transform: translate(var(--vx), var(--vy));
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

addParticleStyles();

/**
 * Track error resolution (for analytics)
 */
function trackErrorResolution() {
  const homeButton = document.querySelector('.error-actions .btn-primary');
  const contactButton = document.querySelector('.error-actions .btn-secondary');
  
  if (homeButton) {
    homeButton.addEventListener('click', () => {
      // You can send this to analytics
      console.log('User resolved 404 error by going home');
      
      // Optional: Prevent default and show confirmation animation
      // showSuccessAnimation();
    });
  }
  
  if (contactButton) {
    contactButton.addEventListener('click', () => {
      console.log('User reported 404 error');
    });
  }
}

/**
 * Mouse tracking effect for interactive elements
 */
function initializeMouseTracking() {
  const errorCode = document.querySelector('.error-code');
  const glitch = document.querySelector('.glitch');
  
  if (errorCode && glitch) {
    document.addEventListener('mousemove', (e) => {
      const x = e.clientX;
      const y = e.clientY;
      
      // Subtle rotation based on mouse position
      const rotateX = (y / window.innerHeight - 0.5) * 5;
      const rotateY = (x / window.innerWidth - 0.5) * 5;
      
      errorCode.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
  }
}

/**
 * Initialize scroll animations
 */
function initializeScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
      }
    });
  }, observerOptions);
  
  // Observe elements that should animate in
  document.querySelectorAll('.error-content > *').forEach(el => {
    observer.observe(el);
  });
}

/**
 * Accessibility features
 */
function initializeAccessibility() {
  // Add focus styles to buttons
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(btn => {
    btn.setAttribute('tabindex', '0');
    btn.addEventListener('focus', () => {
      btn.style.outline = '2px solid #06b6d4';
      btn.style.outlineOffset = '2px';
    });
    btn.addEventListener('blur', () => {
      btn.style.outline = 'none';
    });
  });
}

/**
 * Easter eggs and fun interactions
 */
function initializeEasterEggs() {
  let konamiCode = [];
  const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
  
  document.addEventListener('keydown', (e) => {
    konamiCode.push(e.code);
    konamiCode = konamiCode.slice(-10);
    
    // Check for Konami code
    if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
      activateMatrixRain();
    }
  });
  
  // Easter egg: Click error code multiple times
  let clickCount = 0;
  const errorCode = document.querySelector('.error-code');
  if (errorCode) {
    errorCode.style.cursor = 'pointer';
    errorCode.addEventListener('click', () => {
      clickCount++;
      errorCode.style.animation = 'none';
      void errorCode.offsetWidth; // Trigger reflow
      errorCode.style.animation = 'spin 0.5s ease-in-out';
      
      if (clickCount === 10) {
        showEasterEggMessage();
        clickCount = 0;
      }
      
      setTimeout(() => {
        errorCode.style.animation = 'pulse-glow 3s ease-in-out infinite';
      }, 500);
    });
  }
}

/**
 * Matrix rain easter egg
 */
function activateMatrixRain() {
  const container = document.body;
  const characters = '01アイウエオカキクケコサシスセソタチツテ';
  
  for (let i = 0; i < 20; i++) {
    const span = document.createElement('span');
    span.innerHTML = characters.charAt(Math.floor(Math.random() * characters.length));
    span.style.cssText = `
      position: fixed;
      left: ${Math.random() * 100}%;
      top: -10px;
      color: #06b6d4;
      font-size: 1.5rem;
      opacity: 0.6;
      z-index: 999;
      font-family: 'Courier New', monospace;
      animation: fall ${Math.random() * 3 + 2}s linear forwards;
    `;
    container.appendChild(span);
  }
}

/**
 * Show Easter egg message
 */
function showEasterEggMessage() {
  const message = document.createElement('div');
  message.innerHTML = '🎉 You found an easter egg! Keep exploring...';
  message.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(6, 182, 212, 0.9);
    color: white;
    padding: 2rem;
    border-radius: 12px;
    z-index: 10000;
    font-weight: 700;
    font-size: 1.25rem;
    text-align: center;
    animation: slideIn 0.5s ease-out forwards, slideOut 0.5s ease-in 2.5s forwards;
    backdrop-filter: blur(10px);
  `;
  document.body.appendChild(message);
  
  setTimeout(() => message.remove(), 3000);
}

/**
 * Add keyboard navigation
 */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    // If a button is focused, click it
    const focused = document.activeElement;
    if (focused && focused.classList.contains('btn')) {
      focused.click();
    }
  }
  
  // Easter egg: Press 'h' to go home
  if (e.key.toLowerCase() === 'h') {
    const homeButton = document.querySelector('.error-actions .btn-primary');
    if (homeButton) homeButton.click();
  }
});

/**
 * Add interactive 404 code animation on scroll
 */
window.addEventListener('scroll', () => {
  const errorCode = document.querySelector('.error-code');
  const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  
  if (errorCode) {
    errorCode.style.opacity = Math.max(0.5, 1 - scrollPercent / 100);
  }
});

/**
 * Responsive adjustments
 */
function handleResize() {
  const isMobile = window.innerWidth < 768;
  const errorCode = document.querySelector('.error-code');
  
  if (isMobile && errorCode) {
    errorCode.style.fontSize = 'clamp(3rem, 15vw, 5rem)';
  }
}

window.addEventListener('resize', handleResize);
handleResize();

/**
 * Add performance monitoring (optional)
 */
if (window.performance && window.performance.timing) {
  window.addEventListener('load', () => {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    
    // Log only in development
    if (window.location.hostname === 'localhost') {
      console.log(`404 Page loaded in ${pageLoadTime}ms`);
    }
  });
}

// ==================== Easter Egg: Konami Code ====================
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiPosition = 0;

document.addEventListener('keydown', (e) => {
  const key = e.type === 'keypress' ? String.fromCharCode(e.which).toLowerCase() : e.key;
  const requiredKey = konamiCode[konamiPosition];
  
  if (key === requiredKey) {
    konamiPosition++;
    
    if (konamiPosition === konamiCode.length) {
      activateEasterEgg();
      konamiPosition = 0;
    }
  } else {
    konamiPosition = 0;
  }
});

function activateEasterEgg() {
  console.log('🎮 Easter Egg Activated! You found the Konami Code!');
  
  // Create confetti effect
  const confetti = document.createElement('div');
  confetti.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10000;
  `;
  
  document.body.appendChild(confetti);
  
  // Create confetti particles
  for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div');
    const size = Math.random() * 8 + 4;
    const colors = ['#06b6d4', '#2563eb', '#7c3aed', '#ec4899'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    particle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: -${size}px;
      pointer-events: none;
      animation: confetti-fall ${Math.random() * 3 + 2}s linear forwards;
      box-shadow: 0 0 ${size}px ${color};
    `;
    
    confetti.appendChild(particle);
  }
  
  // Show easter egg message
  const message = document.createElement('div');
  message.textContent = '🎮 Konami Code Unlocked! You\'re a true gamer!';
  message.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(6, 182, 212, 0.9);
    color: white;
    padding: 2rem 3rem;
    border-radius: 12px;
    font-size: 1.5rem;
    font-weight: 700;
    z-index: 10001;
    backdrop-filter: blur(10px);
    border: 2px solid #06b6d4;
    animation: popup 0.5s ease-out forwards;
    box-shadow: 0 0 30px rgba(6, 182, 212, 0.6);
  `;
  
  document.body.appendChild(message);
  
  // Remove elements after animation
  setTimeout(() => {
    confetti.remove();
    message.remove();
  }, 5000);
}

// Add confetti animation
const style = document.createElement('style');
style.textContent = `
  @keyframes confetti-fall {
    to {
      transform: translateY(100vh) rotateZ(360deg);
      opacity: 0;
    }
  }
  
  @keyframes popup {
    from {
      transform: translate(-50%, -50%) scale(0);
      opacity: 0;
    }
    to {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);
