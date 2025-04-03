// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 70,
            behavior: 'smooth'
          });
        }
      });
    });
    
    // Intersection Observer for fade-in animations
    const fadeElements = document.querySelectorAll('.feature-card, .step, .faq-item');
    
    const fadeOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };
    
    const fadeObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, fadeOptions);
    
    fadeElements.forEach(element => {
      element.style.opacity = '0';
      element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      element.style.transform = 'translateY(20px)';
      fadeObserver.observe(element);
    });
    
    // Add class for visible elements
    document.documentElement.style.setProperty(
      '--animate-visible', 
      'opacity: 1; transform: translateY(0);'
    );
    
    // Add style for visible class
    const style = document.createElement('style');
    style.textContent = '.visible { opacity: 1 !important; transform: translateY(0) !important; }';
    document.head.appendChild(style);
    
    // Demo extension functionality
    const demoButton = document.querySelector('.cta-button');
    if (demoButton) {
      demoButton.addEventListener('click', function(e) {
        // If clicked at the homepage, show a quick demo modal instead of navigating
        if (window.location.hash === '' || window.location.hash === '#') {
          e.preventDefault();
          showDemoModal();
        }
      });
    }
    
    function showDemoModal() {
      // Create modal elements
      const modal = document.createElement('div');
      modal.className = 'demo-modal';
      modal.innerHTML = `
        <div class="demo-modal-content">
          <span class="close-modal">&times;</span>
          <h3>VoiceReader Demo</h3>
          <p>This is a demonstration of how VoiceReader works. In the actual extension, you would hear this text read aloud.</p>
          <div class="demo-controls">
            <div class="demo-control">
              <label>Voice Selection:</label>
              <select>
                <option>English (US) - Female</option>
                <option>English (UK) - Male</option>
                <option>English (US) - Male</option>
              </select>
            </div>
            <div class="demo-control">
              <label>Speed: 1.0x</label>
              <input type="range" min="0.5" max="2" step="0.1" value="1">
            </div>
            <div class="demo-control">
              <label>Volume: 100%</label>
              <input type="range" min="0" max="1" step="0.1" value="1">
            </div>
          </div>
          <button class="demo-play-btn">
            <i class="fas fa-play"></i> Play Demo
          </button>
          <a href="#download" class="demo-download-btn">Download Extension</a>
        </div>
      `;
      
      // Add modal styles
      const modalStyle = document.createElement('style');
      modalStyle.textContent = `
        .demo-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1001;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .demo-modal.active {
          opacity: 1;
        }
        .demo-modal-content {
          background-color: white;
          padding: 30px;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
          position: relative;
          transform: translateY(20px);
          transition: transform 0.3s;
        }
        .demo-modal.active .demo-modal-content {
          transform: translateY(0);
        }
        .close-modal {
          position: absolute;
          top: 10px;
          right: 15px;
          font-size: 24px;
          cursor: pointer;
          color: #aaa;
        }
        .close-modal:hover {
          color: #333;
        }
        .demo-controls {
          margin: 20px 0;
        }
        .demo-control {
          margin-bottom: 15px;
        }
        .demo-control label {
          display: block;
          margin-bottom: 5px;
        }
        .demo-control select, .demo-control input {
          width: 100%;
        }
        .demo-play-btn {
          display: block;
          width: 100%;
          padding: 12px;
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          margin-bottom: 10px;
          cursor: pointer;
        }
        .demo-download-btn {
          display: block;
          text-align: center;
          text-decoration: none;
          color: var(--primary-color);
        }
      `;
      document.head.appendChild(modalStyle);
      
      // Add modal to document
      document.body.appendChild(modal);
      
      // Show modal with animation
      setTimeout(() => {
        modal.classList.add('active');
      }, 10);
      
      // Close modal functionality
      const closeBtn = modal.querySelector('.close-modal');
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => {
          modal.remove();
        }, 300);
      });
      
      // Close when clicking outside
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
          setTimeout(() => {
            modal.remove();
          }, 300);
        }
      });
      
      // Simulate playing audio
      const playBtn = modal.querySelector('.demo-play-btn');
      playBtn.addEventListener('click', () => {
        playBtn.innerHTML = '<i class="fas fa-pause"></i> Playing...';
        playBtn.disabled = true;
        
        // Use speech synthesis if available for a real demo
        if ('speechSynthesis' in window) {
          const demoText = modal.querySelector('p').textContent;
          const utterance = new SpeechSynthesisUtterance(demoText);
          
          utterance.onend = function() {
            playBtn.innerHTML = '<i class="fas fa-play"></i> Play Again';
            playBtn.disabled = false;
          };
          
          speechSynthesis.speak(utterance);
        } else {
          // Fake demo if speech synthesis is not available
          setTimeout(() => {
            playBtn.innerHTML = '<i class="fas fa-play"></i> Play Again';
            playBtn.disabled = false;
          }, 5000);
        }
      });
      
      // Navigate to download section when clicking download button
      const downloadBtn = modal.querySelector('.demo-download-btn');
      downloadBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => {
          modal.remove();
          
          const downloadSection = document.getElementById('download');
          if (downloadSection) {
            window.scrollTo({
              top: downloadSection.offsetTop - 70,
              behavior: 'smooth'
            });
          }
        }, 300);
      });
    }
  });