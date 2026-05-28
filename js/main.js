/* =========================================
   Nexora - Shared Frontend Interactions
   Handles nav, scroll effects, reveals,
   counters, testimonial carousel, FAQ,
   form validation, and back-to-top button.
========================================= */
document.addEventListener("DOMContentLoaded", function () {
  var body = document.body;
  var navToggle = document.querySelector(".nav-toggle");
  var navMenu = document.querySelector(".primary-nav");
  var siteHeader = document.querySelector(".site-header");

  // Mobile navigation toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      navMenu.classList.toggle("open");
      body.classList.toggle("nav-open");
    });

    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navToggle.setAttribute("aria-expanded", "false");
        navMenu.classList.remove("open");
        body.classList.remove("nav-open");
      });
    });

    // Reset mobile nav state when moving back to desktop width.
    window.addEventListener("resize", function () {
      if (window.innerWidth > 920) {
        navToggle.setAttribute("aria-expanded", "false");
        navMenu.classList.remove("open");
        body.classList.remove("nav-open");
      }
    });
  }

  // Sticky transparent navbar state transition
  function updateHeaderState() {
    if (!siteHeader) return;
    if (window.scrollY > 24) {
      siteHeader.classList.add("scrolled");
    } else {
      siteHeader.classList.remove("scrolled");
    }
  }
  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });

  // Reveal animations
  var revealItems = document.querySelectorAll(".reveal");
  if (revealItems.length) {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  }

  // Counter animation
  function runCounter(counter) {
    var target = Number(counter.dataset.target || 0);
    var prefix = counter.dataset.prefix || "";
    var suffix = counter.dataset.suffix || "";
    var duration = Number(counter.dataset.duration || 1800);
    var start = null;

    function frame(time) {
      if (start === null) start = time;
      var progress = Math.min((time - start) / duration, 1);
      var value = Math.floor(progress * target);
      counter.textContent = prefix + value.toLocaleString() + suffix;
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        counter.textContent = prefix + target.toLocaleString() + suffix;
      }
    }
    requestAnimationFrame(frame);
  }

  var counters = document.querySelectorAll("[data-counter]");
  if (counters.length) {
    var counterObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          if (el.dataset.started === "true") {
            observer.unobserve(el);
            return;
          }
          el.dataset.started = "true";
          runCounter(el);
          observer.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(function (counter) {
      counterObserver.observe(counter);
    });
  }

  // Testimonial carousel
  var carousel = document.querySelector(".testimonial-carousel");
  if (carousel) {
    var slides = carousel.querySelectorAll(".testimonial-slide");
    var prevBtn = carousel.querySelector(".carousel-prev");
    var nextBtn = carousel.querySelector(".carousel-next");
    var dots = carousel.querySelectorAll(".carousel-dot");
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) return;
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === activeIndex);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === activeIndex);
        dot.setAttribute("aria-selected", i === activeIndex ? "true" : "false");
      });
    }

    function startAutoplay() {
      stopAutoplay();
      timer = setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    function stopAutoplay() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        showSlide(activeIndex - 1);
        startAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        showSlide(activeIndex + 1);
        startAutoplay();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.dataset.slide || 0);
        showSlide(index);
        startAutoplay();
      });
    });

    carousel.addEventListener("mouseenter", stopAutoplay);
    carousel.addEventListener("mouseleave", startAutoplay);

    showSlide(0);
    startAutoplay();
  }

  // FAQ accordion
  var faqButtons = document.querySelectorAll(".faq-question");
  faqButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".faq-item");
      if (!item) return;
      var group = item.parentElement;
      var isOpen = item.classList.contains("open");

      group.querySelectorAll(".faq-item.open").forEach(function (openItem) {
        openItem.classList.remove("open");
      });

      if (!isOpen) item.classList.add("open");
    });
  });

  // Contact and career forms validation
  var forms = document.querySelectorAll(".js-validate-form");
  forms.forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var fields = form.querySelectorAll("[data-required]");
      var feedback = form.querySelector(".form-feedback");
      var errors = [];

      form.querySelectorAll(".invalid").forEach(function (node) {
        node.classList.remove("invalid");
      });

      fields.forEach(function (field) {
        var value = "";
        if (field.type === "file") {
          value = field.files && field.files.length ? "has-file" : "";
        } else {
          value = String(field.value || "").trim();
        }

        if (!value) {
          field.classList.add("invalid");
          errors.push((field.dataset.label || "This field") + " is required.");
        }
      });

      var email = form.querySelector('input[type="email"]');
      if (email && String(email.value || "").trim()) {
        var emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email.value.trim());
        if (!emailValid) {
          email.classList.add("invalid");
          errors.push("Please enter a valid email address.");
        }
      }

      var phone = form.querySelector('input[type="tel"]');
      if (phone && String(phone.value || "").trim()) {
        var phoneValid = /^[+\d][\d\s()-]{6,}$/.test(phone.value.trim());
        if (!phoneValid) {
          phone.classList.add("invalid");
          errors.push("Please enter a valid phone number.");
        }
      }

      var resume = form.querySelector('input[type="file"]');
      if (resume && resume.files && resume.files.length) {
        var ext = resume.files[0].name.split(".").pop().toLowerCase();
        var allowed = ["pdf", "doc", "docx"];
        if (!allowed.includes(ext)) {
          resume.classList.add("invalid");
          errors.push("Resume must be PDF, DOC, or DOCX.");
        }
      }

      if (!feedback) return;

      if (errors.length) {
        feedback.textContent = errors[0];
        feedback.classList.remove("success");
        feedback.classList.add("error");
        return;
      }

      feedback.textContent = "Thanks for your message. Our team will contact you shortly.";
      feedback.classList.remove("error");
      feedback.classList.add("success");
      form.reset();
    });
  });

  // Back-to-top button
  var backTop = document.querySelector(".back-to-top");
  if (backTop) {
    function updateBackTop() {
      if (window.scrollY > 360) backTop.classList.add("visible");
      else backTop.classList.remove("visible");
    }
    updateBackTop();
    window.addEventListener("scroll", updateBackTop, { passive: true });
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Infinite trusted logos track duplication
  var logoTrack = document.querySelector(".logo-track");
  if (logoTrack && logoTrack.dataset.cloned !== "true") {
    logoTrack.innerHTML += logoTrack.innerHTML;
    logoTrack.dataset.cloned = "true";
  }

  // Footer year
  document.querySelectorAll(".current-year").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
});
