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

  // 2. Reading Progress Bar (Article Pages)
  const progressBar = document.querySelector('[data-reading-progress]');
  if (progressBar) {
    const updateProgress = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100)) : 0;
      progressBar.style.width = pct + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  // 3. Homepage Comparison Table Category Filter
  const filterButtons = document.querySelectorAll('[data-filter-category]');
  const tableRows = document.querySelectorAll('[data-tool-row]');

  if (filterButtons.length > 0 && tableRows.length > 0) {
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const selected = btn.getAttribute('data-filter-category');

        filterButtons.forEach((b) => {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');

        tableRows.forEach((row) => {
          const rowCategory = row.getAttribute('data-category');
          if (selected === 'all' || rowCategory === selected) {
            row.classList.remove('is-hidden');
          } else {
            row.classList.add('is-hidden');
          }
        });
      });
    });
  }

  // 4. Copy Prompt Code Blocks
  const copyButtons = document.querySelectorAll('[data-copy-prompt]');
  copyButtons.forEach((btn) => {
    const originalLabel = (btn.textContent || 'Copy Prompt').trim();
    let resetTimer = null;

    btn.addEventListener('click', async () => {
      const container = btn.closest('.prompt-block');
      const codeEl = container ? container.querySelector('.prompt-pre') : null;
      if (!codeEl) return;

      const textToCopy = codeEl.textContent ? codeEl.textContent.trim() : '';
      let copied = false;

      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        try {
          await navigator.clipboard.writeText(textToCopy);
          copied = true;
        } catch {
          copied = false;
        }
      }

      if (!copied) {
        try {
          const textarea = document.createElement('textarea');
          textarea.value = textToCopy;
          textarea.setAttribute('readonly', '');
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          copied = document.execCommand('copy');
          document.body.removeChild(textarea);
        } catch {
          copied = false;
        }
      }

      if (resetTimer) {
        clearTimeout(resetTimer);
      }

      if (copied) {
        btn.textContent = 'Copied';
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

  // 5. Interactive Debugging Checklist (debug-code-ai.html)
  const checklistContainer = document.querySelector('[data-checklist]');
  if (checklistContainer) {
    const checkboxes = checklistContainer.querySelectorAll('input[type="checkbox"]');
    const countLabel = checklistContainer.querySelector('[data-checklist-count]');
    const resetBtn = checklistContainer.querySelector('[data-checklist-reset]');

    const updateChecklist = () => {
      let checkedCount = 0;
      checkboxes.forEach((box) => {
        const item = box.closest('.checklist-item');
        if (box.checked) {
          checkedCount += 1;
          if (item) item.classList.add('is-checked');
        } else {
          if (item) item.classList.remove('is-checked');
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
        feedback.textContent = 'Please enter a valid student or personal email address.';
        return;
      }

      feedback.textContent = `Subscribed ${email} to the weekly StudyFlick study digest.`;
      input.value = '';
    });
  });

  // 7. Graceful Image Fallback Handler
  document.querySelectorAll('.media-frame img').forEach((img) => {
    img.addEventListener('error', () => {
      const frame = img.closest('.media-frame');
      if (frame) {
        frame.classList.add('has-fallback');
      }
    });
    if (img.complete && img.naturalWidth === 0) {
      const frame = img.closest('.media-frame');
      if (frame) {
        frame.classList.add('has-fallback');
      }
    }
  });
});
