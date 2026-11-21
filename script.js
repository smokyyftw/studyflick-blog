document.addEventListener('DOMContentLoaded', () => {
  // 0. Top Announcement Bar Dismiss
  const announcementBar = document.querySelector('[data-announcement-bar]');
  const announcementDismiss = document.querySelector('[data-announcement-dismiss]');
  if (announcementBar && announcementDismiss) {
    announcementDismiss.addEventListener('click', () => {
      announcementBar.classList.add('is-dismissed');
    });
  }

  // 1. Mobile Navigation Toggle
  const menuBtn = document.querySelector('[data-menu-toggle]');
  const mobileDrawer = document.querySelector('[data-mobile-drawer]');

  if (menuBtn && mobileDrawer) {
    menuBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
    });

    mobileDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && mobileDrawer.classList.contains('is-open')) {
        mobileDrawer.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.focus();
      }
    });
  }

  // 2. Reading Progress Bar (rAF-throttled + GPU scaleX to avoid layout reflows)
  const progressBar = document.querySelector('[data-reading-progress]');
  if (progressBar) {
    let maxScroll = 0;
    let scrollTicking = false;
    let measureTicking = false;

    const renderProgress = () => {
      scrollTicking = false;
      const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
      progressBar.style.transform = `scaleX(${ratio.toFixed(4)})`;
    };

    const measureAndRender = () => {
      measureTicking = false;
      maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      renderProgress();
    };

    const scheduleMeasure = () => {
      if (!measureTicking) {
        measureTicking = true;
        window.requestAnimationFrame(measureAndRender);
      }
    };

    const scheduleScroll = () => {
      if (!scrollTicking) {
        scrollTicking = true;
        window.requestAnimationFrame(renderProgress);
      }
    };

    window.addEventListener('scroll', scheduleScroll, { passive: true });
    window.addEventListener('resize', scheduleMeasure, { passive: true });
    window.addEventListener('load', scheduleMeasure, { once: true });

    if (typeof ResizeObserver === 'function') {
      const resizeObserver = new ResizeObserver(scheduleMeasure);
      resizeObserver.observe(document.documentElement);
    }

    scheduleMeasure();
  }

  // 3. Homepage Comparison Table Category Filter
  const filterButtons = Array.from(document.querySelectorAll('[data-filter-category]'));
  const tableRows = Array.from(document.querySelectorAll('[data-tool-row]'));

  if (filterButtons.length > 0 && tableRows.length > 0) {
    const rowCategories = tableRows.map((row) => row.getAttribute('data-category'));

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const selected = btn.getAttribute('data-filter-category');

        filterButtons.forEach((b) => {
          const isSelected = b === btn;
          b.classList.toggle('is-active', isSelected);
          b.setAttribute('aria-pressed', String(isSelected));
        });

        tableRows.forEach((row, index) => {
          const shouldShow = selected === 'all' || rowCategories[index] === selected;
          row.classList.toggle('is-hidden', !shouldShow);
        });
      });
    });
  }

  // 4. Copy Prompt Code Blocks & Article Share Links
  const copyTextToClipboard = async (textToCopy) => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(textToCopy);
        return true;
      } catch {
        // Fallback below for restricted iframe contexts
      }
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      textarea.setAttribute('readonly', '');
      textarea.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand('copy');
      document.body.removeChild(textarea);
      return copied;
    } catch {
      return false;
    }
  };

  const copyButtons = document.querySelectorAll('[data-copy-prompt]');
  copyButtons.forEach((btn) => {
    const originalLabel = (btn.textContent || 'Copy Prompt').trim();
    let resetTimer = null;

    btn.addEventListener('click', async () => {
      const container = btn.closest('.prompt-block');
      const codeEl = container ? container.querySelector('.prompt-pre') : null;
      if (!codeEl) return;

      const textToCopy = codeEl.textContent ? codeEl.textContent.trim() : '';
      const copied = await copyTextToClipboard(textToCopy);

      if (resetTimer) {
        clearTimeout(resetTimer);
      }

      if (copied) {
        btn.textContent = 'Copied \u2713';
        btn.classList.add('is-copied');
      } else {
        btn.textContent = 'Select text';
      }

      resetTimer = setTimeout(() => {
        btn.textContent = originalLabel;
        btn.classList.remove('is-copied');
      }, 1800);
    });
  });

  const shareCopyButtons = document.querySelectorAll('[data-copy-url]');
  shareCopyButtons.forEach((btn) => {
    const originalLabel = (btn.textContent || 'Copy Link').trim();
    let resetTimer = null;

    btn.addEventListener('click', async () => {
      const targetUrl = btn.getAttribute('data-copy-url') || window.location.href;
      const copied = await copyTextToClipboard(targetUrl);

      if (resetTimer) {
        clearTimeout(resetTimer);
      }

      btn.textContent = copied ? 'Link Copied \u2713' : 'Copy Failed';
      if (copied) {
        btn.classList.add('is-copied');
      }

      resetTimer = setTimeout(() => {
        btn.textContent = originalLabel;
        btn.classList.remove('is-copied');
      }, 1800);
    });
  });

  // 5. Interactive Debugging Checklist (debug-code-ai.html)
  const checklistContainer = document.querySelector('[data-checklist]');
  if (checklistContainer) {
    const checkboxes = Array.from(checklistContainer.querySelectorAll('input[type="checkbox"]'));
    const items = checkboxes.map((box) => box.closest('.checklist-item'));
    const countLabel = checklistContainer.querySelector('[data-checklist-count]');
    const resetBtn = checklistContainer.querySelector('[data-checklist-reset]');

    const updateChecklist = () => {
      const states = checkboxes.map((box) => box.checked);
      let checkedCount = 0;

      states.forEach((isChecked, index) => {
        if (isChecked) checkedCount += 1;
        if (items[index]) {
          items[index].classList.toggle('is-checked', isChecked);
        }
      });

      if (countLabel) {
        countLabel.textContent = `${checkedCount} of ${checkboxes.length} verified`;
      }
    };

    checkboxes.forEach((box) => {
      box.addEventListener('change', updateChecklist);
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        checkboxes.forEach((box) => {
          box.checked = false;
        });
        updateChecklist();
      });
    }

    updateChecklist();
  }

  // 6. Footer Digest Subscription (Client-side confirmation without reload)
  const digestForms = document.querySelectorAll('[data-digest-form]');
  digestForms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const feedback = form.parentElement ? form.parentElement.querySelector('[data-digest-feedback]') : null;
      if (!input || !feedback) return;

      const email = input.value.trim();
      if (!email || !email.includes('@')) {
        feedback.classList.add('is-error');
        feedback.textContent = 'Please enter a valid university or personal email address.';
        return;
      }

      feedback.classList.remove('is-error');
      feedback.textContent = `Subscribed ${email} to the weekly StudyFlick digest.`;
      input.value = '';
    });
  });

  // 7. Graceful Image Fallback Handler (batched read pass before DOM write pass)
  const mediaImages = Array.from(document.querySelectorAll('.media-frame img'));
  const brokenFrames = [];

  mediaImages.forEach((img) => {
    if (img.complete && img.naturalWidth === 0) {
      const frame = img.closest('.media-frame');
      if (frame) brokenFrames.push(frame);
    }

    img.addEventListener('error', () => {
      const frame = img.closest('.media-frame');
      if (frame) {
        frame.classList.add('has-fallback');
      }
    });
  });

  if (brokenFrames.length > 0) {
    brokenFrames.forEach((frame) => {
      frame.classList.add('has-fallback');
    });
  }
});
