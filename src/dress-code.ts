// Dress Code page functionality

class DressCodePage {
  private rsvpButton: HTMLElement | null;

  constructor() {
    this.rsvpButton = document.getElementById('rsvp-btn');
    this.init();
  }

  private init(): void {
    this.setupEventListeners();
    this.addPageAnimations();
    this.createColorCircles();
    this.createColorCircles2();
    // Hot module replacement for development
    if (import.meta.hot) {
      import.meta.hot.accept();
    }
  }

  private setupEventListeners(): void {
    // RSVP button click handler
    if (this.rsvpButton) {
      this.rsvpButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleRSVPClick();
      });
    }

    // Add some interactive hover effects
    this.addHoverEffects();
  }

  private handleRSVPClick(): void {
    // For now, show an alert - you can replace this with actual RSVP functionality
    alert('RSVP functionality coming soon! Please contact us directly for now.');
    
    // Example of how you might redirect to an RSVP form
    // window.location.href = 'rsvp.html';
  }

  private addHoverEffects(): void {
    const examples = document.querySelectorAll('.dress-example');
    
    examples.forEach((example) => {
      example.addEventListener('mouseenter', () => {
        example.classList.add('hovered');
      });

      example.addEventListener('mouseleave', () => {
        example.classList.remove('hovered');
      });
    });
  }

  private addPageAnimations(): void {
    // Add staggered animation to dress examples
    const examples = document.querySelectorAll('.dress-example');
    
    examples.forEach((example, index) => {
      (example as HTMLElement).style.animationDelay = `${0.1 * index}s`;
      example.classList.add('fade-in-stagger');
    });

    // Add CSS for staggered animation
    if (!document.querySelector('#stagger-styles')) {
      const style = document.createElement('style');
      style.id = 'stagger-styles';
      style.textContent = `
        .fade-in-stagger {
          opacity: 0;
          animation: fadeInStagger 0.6s ease-out forwards;
        }

        @keyframes fadeInStagger {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dress-example.hovered {
          transform: translateY(-5px) scale(1.02);
        }
      `;
      document.head.appendChild(style);
    }
  }

  private createColorCircles(): void {
    const colorsContainer = document.querySelector('.colors-circles');
    if (!colorsContainer) return;

    // Brown color images to display
    const brownImages = [
      { image: 'brown4.jpeg', name: 'chocolate oscuro' },
      { image: 'brown2.jpeg', name: 'chocolate claro' },
      { image: 'brown3.jpeg', name: 'bronze' },
    ];

    brownImages.forEach((imageInfo, index) => {
      const circleWrapper = document.createElement('div');
      circleWrapper.style.position = 'relative';
      
      const circle = document.createElement('div');
      circle.className = 'color-circle';
      circle.style.animationDelay = `${0.2 * index}s`;
      circle.classList.add('fade-in-stagger');
      
      const img = document.createElement('img');
      img.src = `/${imageInfo.image}`;
      img.alt = imageInfo.name;
      img.style.display = 'block';
      circle.appendChild(img);
      circleWrapper.appendChild(circle);
      colorsContainer.appendChild(circleWrapper);
    });
  }

  private createColorCircles2(): void {
    const colorsContainer = document.querySelector('.colors-circles-2');
    if (!colorsContainer) return;

    // Brown color images to display
    const brownImages = [
      { image: 'brown7.jpeg', name: 'rosa vieja' },
      { image: 'brown11.jpeg', name: 'morado' },
      { image: 'brown1.jpeg', name: 'verde' },
      { image: 'brown9.jpeg', name: 'celeste' },
      { image: 'brown10.jpeg', name: 'azul' },
    ];

    brownImages.forEach((imageInfo, index) => {
      const circleWrapper = document.createElement('div');
      circleWrapper.style.position = 'relative';
      
      const circle = document.createElement('div');
      circle.className = 'color-circle';
      circle.style.animationDelay = `${0.2 * index}s`;
      circle.classList.add('fade-in-stagger');
      
      const img = document.createElement('img');
      img.src = `/${imageInfo.image}`;
      img.alt = imageInfo.name;
      img.style.display = 'block';
      circle.appendChild(img);
      circleWrapper.appendChild(circle);
      colorsContainer.appendChild(circleWrapper);
    });
  }
}

// Initialize the dress code page
document.addEventListener('DOMContentLoaded', () => {
  new DressCodePage();

});

// Export for potential external use
export { DressCodePage }; 