document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const scrollBtn = document.getElementById('scrollTopBtn');

  // Menü ki/be kapcsolása mobilon
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      navToggle.classList.toggle('open');
    });

    // Menü bezárása linkre kattintva
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.classList.remove('open');
      });
    });
  }

  // "Fel az oldal tetejére" gomb megjelenítése
  window.onscroll = function() {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
      scrollBtn.style.display = 'block';
    } else {
      scrollBtn.style.display = 'none';
    }
  };

  // Visszagörgetés az oldal tetejére
  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // --- Galéria funkciók ---
  document.querySelectorAll('.gallery-wrapper').forEach(wrapper => {
    const galleryContainer = wrapper.querySelector('.gallery-container');
    const leftArrow = wrapper.querySelector('.left-arrow');
    const rightArrow = wrapper.querySelector('.right-arrow');
    const galleryItems = Array.from(galleryContainer.querySelectorAll('.gallery-item'));
    
    let currentIndex = 0;
    let isScrolling;
    let isAnimating = false; // Új változó a görgetés animációhoz

    const scrollToCenter = (index) => {
      if (isAnimating) return;
      isAnimating = true;

      // Ciklikus viselkedés: ha az utolsó elemnél vagyunk és jobbra lapozunk, ugorjunk vissza az elsőre.
      let newIndex = index;
      if (newIndex >= galleryItems.length) {
        newIndex = 0;
      } else if (newIndex < 0) {
        newIndex = galleryItems.length - 1;
      }

      const targetItem = galleryItems[newIndex];
      const containerWidth = galleryContainer.offsetWidth;
      const itemWidth = targetItem.offsetWidth;
      const scrollPosition = targetItem.offsetLeft - (containerWidth / 2) + (itemWidth / 2);
      
      galleryContainer.scroll({
        left: scrollPosition,
        behavior: 'smooth'
      });
      
      currentIndex = newIndex;
      
      // Várjuk meg, amíg az animáció befejeződik, mielőtt újra kattinthatunk
      setTimeout(() => {
        isAnimating = false;
      }, 300);
    };

    const updateGalleryState = () => {
      const containerRect = galleryContainer.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;

      galleryItems.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const distance = Math.abs(itemCenter - containerCenter);

        // Aktív elem kezelése
        if (distance < rect.width / 2) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
        
        // Elmosódás és skálázás
        const maxDistance = containerRect.width / 2;
        const blurAmount = Math.min(5, (distance / maxDistance) * 5);
        const scaleAmount = 1 - Math.min(0.2, distance / maxDistance * 0.5);
        
        item.style.filter = `blur(${blurAmount}px)`;
        item.style.transform = `scale(${scaleAmount})`;
      });
    };

    galleryContainer.addEventListener('scroll', () => {
      window.clearTimeout(isScrolling);
      isScrolling = setTimeout(() => {
        const containerCenter = galleryContainer.scrollLeft + galleryContainer.offsetWidth / 2;
        let closestItem = null;
        let minDistance = Infinity;

        galleryItems.forEach((item, index) => {
          const itemCenter = item.offsetLeft + item.offsetWidth / 2;
          const distance = Math.abs(itemCenter - containerCenter);
          if (distance < minDistance) {
            minDistance = distance;
            closestItem = index;
          }
        });

        if (closestItem !== null && closestItem !== currentIndex) {
          currentIndex = closestItem;
        }
        updateGalleryState();
      }, 66);
    });

    // Navigációs gombok eseménykezelése
    rightArrow.addEventListener('click', () => {
      scrollToCenter(currentIndex + 1);
    });

    leftArrow.addEventListener('click', () => {
      scrollToCenter(currentIndex - 1);
    });

    // Kezdeti állapot beállítása
    scrollToCenter(0);
    updateGalleryState();
    
    window.addEventListener('resize', () => {
      scrollToCenter(currentIndex);
    });
  });

  // --- Lightbox funkciók ---
  const lightboxOverlay = document.getElementById('lightbox-overlay');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  let currentGalleryItems = []; 
  let currentImageIndex = 0; 

  document.querySelectorAll('.gallery-wrapper').forEach(wrapper => {
    wrapper.addEventListener('click', (e) => {
      if (e.target.closest('.gallery-item')) {
        const clickedItem = e.target.closest('.gallery-item');
        currentGalleryItems = Array.from(wrapper.querySelectorAll('.gallery-item img'));
        currentImageIndex = currentGalleryItems.findIndex(img => img.src === clickedItem.querySelector('img').src);
        
        lightboxImg.src = currentGalleryItems[currentImageIndex].src;
        lightboxImg.alt = currentGalleryItems[currentImageIndex].alt;
        lightboxOverlay.classList.add('visible');
        document.body.style.overflow = 'hidden'; 
      }
    });
  });

  const closeLightbox = () => {
    lightboxOverlay.classList.remove('visible');
    document.body.style.overflow = ''; 
  };

  const showImage = (index) => {
    if (currentGalleryItems.length > 0) {
      // Ciklikus viselkedés a lightboxban is
      let newIndex = index;
      if (newIndex < 0) {
        newIndex = currentGalleryItems.length - 1; 
      } else if (newIndex >= currentGalleryItems.length) {
        newIndex = 0; 
      }
      currentImageIndex = newIndex;

      lightboxImg.src = currentGalleryItems[currentImageIndex].src;
      lightboxImg.alt = currentGalleryItems[currentImageIndex].alt;
    }
  };

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => showImage(currentImageIndex - 1));
  lightboxNext.addEventListener('click', () => showImage(currentImageIndex + 1));
  lightboxOverlay.addEventListener('click', (e) => {
    if (e.target === lightboxOverlay) {
      closeLightbox();
    }
  });

  // Billentyűzet támogatás
  document.addEventListener('keydown', (e) => {
    if (lightboxOverlay.classList.contains('visible')) {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        showImage(currentImageIndex - 1);
      } else if (e.key === 'ArrowRight') {
        showImage(currentImageIndex + 1);
      }
    }
  });

});