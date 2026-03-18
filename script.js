document.addEventListener('DOMContentLoaded', () => {

    // Allow automated screenshots by scrolling via URL params:
    // - ?section=footer (scroll to element id)
    // - ?scroll=1234 (scroll to Y position)
    try {
        const params = new URLSearchParams(window.location.search);
        const section = params.get('section');
        if (section) {
            const target = document.getElementById(section);
            if (target) {
                setTimeout(() => target.scrollIntoView({ block: 'start', behavior: 'auto' }), 300);
            }
        }
        const scrollParam = params.get('scroll');
        if (scrollParam != null) {
            const y = Number(scrollParam);
            if (Number.isFinite(y) && y >= 0) {
                // Let layout settle (fonts/images) before scrolling.
                setTimeout(() => window.scrollTo({ top: y, left: 0, behavior: 'auto' }), 300);
            }
        }
    } catch (_) {
        // Ignore if URLSearchParams isn't supported.
    }
    
    // --- Sticky Navbar ---
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    });

    const closeMenu = () => {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = 'auto'; // Enable scrolling
    };

    closeMenuBtn.addEventListener('click', closeMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // --- Hero Animations (Initial Load) ---
    const heroElements = document.querySelectorAll('.fade-up');
    
    // Trigger hero animations shortly after load
    setTimeout(() => {
        heroElements.forEach(el => {
            el.classList.add('visible');
        });
    }, 100);

    // --- Scroll Reveal Animations (Intersection Observer) ---
    const revealElements = document.querySelectorAll('.reveal');
    
    const elementInView = (el, percentageScroll = 100) => {
        const elementTop = el.getBoundingClientRect().top;
        return (
            elementTop <= ((window.innerHeight || document.documentElement.clientHeight) * (percentageScroll/100))
        );
    };

    const displayScrollElement = (element) => {
        element.classList.add('active');
    };

    const hideScrollElement = (element) => {
        // Optional: remove 'active' if you want them to hide when scrolling up
        // element.classList.remove('active');
    };

    const handleScrollAnimation = () => {
        revealElements.forEach((el) => {
            if (elementInView(el, 85)) {
                displayScrollElement(el);
            } else {
                hideScrollElement(el);
            }
        });
    };

    // Use Intersection Observer for better performance if supported
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // Stop observing once revealed
                }
            });
        }, observerOptions);

        revealElements.forEach(el => {
            observer.observe(el);
        });
    } else {
        // Fallback for older browsers
        window.addEventListener('scroll', () => {
            handleScrollAnimation();
        });
        
        // Initial check
        handleScrollAnimation();
    }
});
