

// Modern Toast Notification Trigger
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconSvg = type === 'success' 
    ? `<svg class="toast-icon" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
         <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
       </svg>`
    : `<svg class="toast-icon" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
         <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
       </svg>`;

  toast.innerHTML = `
    ${iconSvg}
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);
  
  // Animation triggers
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Auto remove toast
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}



// 3. Setup form interaction selectors, submission handlers, and modal controls
document.addEventListener('DOMContentLoaded', () => {
  const feedbackForm = document.getElementById('feedbackForm');
  const orgCards = document.querySelectorAll('.org-card');
  const selectedOrgInput = document.getElementById('selectedOrg');
  
  const customOrgSection = document.getElementById('customOrgSection');
  const customOrgInput = document.getElementById('customOrgInput');
  
  const stars = document.querySelectorAll('.star');
  const selectedRatingInput = document.getElementById('selectedRating');
  
  const feedbackText = document.getElementById('feedbackText');
  const charCounter = document.getElementById('charCounter');
  
  const successModal = document.getElementById('successModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  
  let currentRating = 0;

  // Organization Type Selection Card clicks
  orgCards.forEach(card => {
    card.addEventListener('click', () => {
      selectOrgCard(card);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        selectOrgCard(card);
      }
    });
  });

  function selectOrgCard(card) {
    orgCards.forEach(c => {
      c.classList.remove('selected');
      c.setAttribute('aria-checked', 'false');
      const radio = c.querySelector('input[type="radio"]');
      if (radio) radio.checked = false;
    });
    
    card.classList.add('selected');
    card.setAttribute('aria-checked', 'true');
    const radio = card.querySelector('input[type="radio"]');
    if (radio) {
      radio.checked = true;
      if (selectedOrgInput) {
        selectedOrgInput.value = radio.value;
      }
    }
    
    const orgGrid = document.querySelector('.org-grid');
    removeErrorHighlight(orgGrid);

    // Toggle custom organization input visibility & validation rules
    if (radio && radio.value === 'Other') {
      if (customOrgSection) {
        customOrgSection.classList.add('active');
      }
      if (customOrgInput) {
        customOrgInput.setAttribute('required', '');
      }
    } else {
      if (customOrgSection) {
        customOrgSection.classList.remove('active');
      }
      if (customOrgInput) {
        customOrgInput.removeAttribute('required');
        customOrgInput.value = '';
        removeErrorHighlight(customOrgInput);
      }
    }
  }

  // Interactive Rating Stars
  stars.forEach(star => {
    const ratingValue = parseInt(star.getAttribute('data-rating'));

    star.addEventListener('mouseenter', () => {
      highlightStars(ratingValue);
    });

    star.addEventListener('mouseleave', () => {
      highlightStars(currentRating);
    });

    star.addEventListener('click', () => {
      currentRating = ratingValue;
      if (selectedRatingInput) {
        selectedRatingInput.value = currentRating;
      }
      highlightStars(currentRating);
      
      // Pulse animation micro-interaction
      star.classList.add('star-pulse');
      setTimeout(() => {
        star.classList.remove('star-pulse');
      }, 400);
      
      const starsContainer = document.querySelector('.stars-container');
      removeErrorHighlight(starsContainer);
    });
  });

  function highlightStars(count) {
    stars.forEach(star => {
      const val = parseInt(star.getAttribute('data-rating'));
      if (val <= count) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    });
  }

  // Textarea counter
  if (feedbackText && charCounter) {
    feedbackText.addEventListener('input', () => {
      const currentLength = feedbackText.value.length;
      charCounter.textContent = `${currentLength} / 1000`;
      
      if (currentLength > 0) {
        removeErrorHighlight(feedbackText);
      }
    });
  }

  // Remove validation highlights on focus
  const fullName = document.getElementById('fullName');
  const referralSection = document.getElementById('referralSection');
  const referralName = document.getElementById('referralName');
  const referralContact = document.getElementById('referralContact');

  if (fullName) {
    fullName.addEventListener('input', () => {
      if (fullName.value.trim()) {
        removeErrorHighlight(fullName);
      }
    });
  }

  if (customOrgInput) {
    customOrgInput.addEventListener('input', () => {
      if (customOrgInput.value.trim()) {
        removeErrorHighlight(customOrgInput);
      }
    });
  }

  // Handle recommendation change events
  document.querySelectorAll('input[name="recommend"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const isYes = radio.value === 'Yes';
      if (isYes) {
        if (referralSection) {
          referralSection.classList.add('active');
        }
      } else {
        if (referralSection) {
          referralSection.classList.remove('active');
        }
        if (referralName) referralName.value = '';
        if (referralContact) {
          referralContact.value = '';
          removeErrorHighlight(referralContact);
        }
      }
    });
  });

  const registerInputHandlers = (radioSelector) => {
    document.querySelectorAll(radioSelector).forEach(radio => {
      radio.addEventListener('change', () => {
        const group = radio.closest('.form-group');
        removeErrorHighlight(group);
      });
    });
  };

  registerInputHandlers('input[name="recommend"]');

  // Hook up Success Modal Close event and conditional redirect to Google Reviews
  if (closeModalBtn && successModal) {
    const GOOGLE_REVIEWS_URL = 'https://www.google.com/search?sca_esv=783de1c040cdc5df&hl=en-IN&biw=392&bih=753&sxsrf=APpeQnt1ycxPn2XnQ7lXP7C2HaiKhbUZ9Q:1783793599603&q=gotek+chennai+reviews&uds=AJ5uw1-CdzS3lwnMDA9Mgy04N1sfTc-vKliPO8vZu1BMERU0F9DifBJrPMPAv0QkFbUq7xvi-V-F-j0rDdKOhFg2P1AW4XinQ8b-6J5k2mfl2UEBW_5fhDVPyEDygJN_6nq-qAgTN8g-bmkg5DBpEcUyOF2h7MAkjvPoiJd9f2K1q_HzlML9LU115QD9AZz8eJcd2GD4K4iwDTWWSh-q2k-xgo-0JwVRplqg37-xBbk2mc-cvTATaTNw094TzPrV9acSoQVY_qIbWsN3DAJ2tj9NQ4Wi59dFpPNQssANEVk7gItarGHqjAXm-ivYEtwCbH2s42IgzzHl5C4yCRfRilaCAlrMU07BIYTK1BaCCNbjC5dUXhRe2INBQ1yN_54UAOp1HBiTzIAOLUSavh-sRcGyiEpUiAGRF9YOAkjtF3yN-kKQ1h7rNc8dkPzoo6e_vzBo0cerTo0XuAQs9L76iXLdSf3IdsDARkP0dOKECzNVM07MenYV3AIdSDuImx4RgXdoaxG9ikNcNoTgHpk_kZFVANZG1I8rNg&si=APenkKm7iecQ4G6P-TsbSMFKIQtv3EFIqRAFw-i8uEbk55Z-_7DV_wHlATBhEEmbrEGibz1XxPPOGMD81bxwM9H1sC-Wh-9DVwm3RP-AVXTtCjovrequwXpDrd0qBD8H_RGOEgOLSieQ&sa=X&ved=2ahUKEwj2jO3-nMuVAxVodfUHHQ2hG-oQk8gLegQIHhAB&ictx=1&stq=1&cs=1&lei=v4dSaraxJOjq1e8PjcLu0A4#ebo=1';

    closeModalBtn.addEventListener('click', () => {
      console.log('Done button clicked');
      console.log('Stored rating:', sessionStorage.getItem('lastFeedbackRating'));
      console.log('Redirect condition:', Number(sessionStorage.getItem('lastFeedbackRating')) === 5);
      const storedRating = sessionStorage.getItem('lastFeedbackRating');
      if (storedRating && Number(storedRating) === 5) {
        window.location.href = GOOGLE_REVIEWS_URL;
      } else {
        successModal.classList.remove('active');
      }
    });

    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) {
        const storedRating = sessionStorage.getItem('lastFeedbackRating');
        console.log('[GoTek Redirect] Modal overlay clicked. Stored Rating:', storedRating);
        console.log('[GoTek Redirect] Is 5-star condition true?', Number(storedRating) === 5);
        if (storedRating && Number(storedRating) === 5) {
          console.log('[GoTek Redirect] Redirect URL:', GOOGLE_REVIEWS_URL);
          window.location.href = GOOGLE_REVIEWS_URL;
        } else {
          console.log('[GoTek Redirect] Standard modal close...');
          successModal.classList.remove('active');
        }
      }
    });
  }

  // Submission handler via AJAX
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      let errors = [];

      // 1. Full name validation
      if (!fullName.value.trim()) {
        errors.push({ element: fullName, message: 'Please enter your full name.' });
      }

      // 2. Organization Type Selection check
      if (!selectedOrgInput.value) {
        const orgGrid = document.querySelector('.org-grid');
        errors.push({ element: orgGrid, message: 'Please select your organization type.' });
      } else if (selectedOrgInput.value === 'Other' && customOrgInput && !customOrgInput.value.trim()) {
        errors.push({ element: customOrgInput, message: 'Please specify your organization name.' });
      }

      // 3. Star rating check
      if (!selectedRatingInput.value) {
        const starsContainer = document.querySelector('.stars-container');
        errors.push({ element: starsContainer, message: 'Please rate your experience.' });
      }

      // 4. Feedback text area check
      if (!feedbackText.value.trim()) {
        errors.push({ element: feedbackText, message: 'Please share details of your experience.' });
      }

      // 5. Recommend question check
      const recommend = document.querySelector('input[name="recommend"]:checked');
      if (!recommend) {
        const recommendGroup = document.querySelector('input[name="recommend"]').closest('.form-group');
        errors.push({ element: recommendGroup, message: 'Please select if you recommend GoTek.' });
      }

      // Clear highlights from all fields first
      [
        fullName,
        document.querySelector('.org-grid'),
        customOrgInput,
        document.querySelector('.stars-container'),
        feedbackText,
        document.querySelector('input[name="recommend"]') ? document.querySelector('input[name="recommend"]').closest('.form-group') : null
      ].forEach(el => {
        if (el) removeErrorHighlight(el);
      });

      if (errors.length > 0) {
        // Highlight all invalid fields
        errors.forEach(err => highlightError(err.element, err.message));

        // Find the first error element for focus/scroll
        const firstErrorObj = errors[0];
        const firstErrorEl = firstErrorObj.element;
        let scrollTarget = firstErrorEl;
        if (firstErrorEl.classList.contains('org-grid') || firstErrorEl.classList.contains('stars-container')) {
          scrollTarget = firstErrorEl.closest('.form-group');
        }

        // Smoothly scroll and center the viewport on the first incomplete field, respecting user motion preferences
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        scrollTarget.scrollIntoView({ 
          behavior: prefersReducedMotion ? 'auto' : 'smooth', 
          block: 'center' 
        });

        // Set focus to the input/textarea element
        if (firstErrorEl.tagName === 'INPUT' || firstErrorEl.tagName === 'TEXTAREA') {
          firstErrorEl.focus({ preventScroll: true });
        } else {
          const innerInput = firstErrorEl.querySelector('input, textarea');
          if (innerInput) {
            innerInput.focus({ preventScroll: true });
          }
        }

        // Trigger warning toast
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      const nameVal = fullName.value.trim();
      const orgVal = selectedOrgInput.value === 'Other' && customOrgInput ? customOrgInput.value.trim() : selectedOrgInput.value;
      const ratingVal = parseInt(selectedRatingInput.value);
      const textVal = feedbackText.value.trim();
      const recommendVal = recommend.value;
      const refNameVal = recommendVal === 'Yes' && referralName ? referralName.value.trim() : '';
      const refContactVal = recommendVal === 'Yes' && referralContact ? referralContact.value.trim() : '';

      const payload = {
        fullName: nameVal,
        organizationType: orgVal,
        rating: ratingVal,
        feedbackText: textVal,
        recommend: recommendVal,
        referralName: refNameVal,
        referralContact: refContactVal
      };

      const submitBtn = feedbackForm.querySelector('.btn-submit');
      let originalBtnHTML = '';

      try {
        // Disable submit button and add spinner loading state
        if (submitBtn) {
          submitBtn.disabled = true;
          originalBtnHTML = submitBtn.innerHTML;
          submitBtn.innerHTML = `<span class="spinner"></span> Submitting...`;
        }

        const response = await fetch('submit_feedback.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.success) {
          // Store rating in sessionStorage for conditional redirect logic on Done click
          sessionStorage.setItem('lastFeedbackRating', ratingVal);
          console.log('[GoTek Redirect] Saved rating:', ratingVal);

          // Trigger success toast
          showToast('Thank you! Your feedback has been submitted successfully.', 'success');

          // Trigger success modal overlay and custom confetti celebration
          if (successModal) {
            successModal.classList.add('active');
            triggerConfetti(successModal);
          }

          // Clear Form Fields
          resetForm();
        } else {
          showToast(result.error || 'Submission error occurred.', 'error');
        }
      } catch (err) {
        console.error('Network connection error:', err);
        if (err.name === 'SyntaxError') {
          showToast('Failed to connect to the server: Invalid server response (not JSON).', 'error');
        } else {
          showToast(`Failed to connect to the server: ${err.message || err}`, 'error');
        }
      } finally {
        // Restore submit button state
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
        }
      }
    });
  }

  // Form Reset Helper
  function resetForm() {
    if (feedbackForm) {
      feedbackForm.reset();
    }
    currentRating = 0;
    highlightStars(0);
    if (selectedRatingInput) {
      selectedRatingInput.value = '';
    }
    
    if (customOrgSection) {
      customOrgSection.classList.remove('active');
    }
    if (customOrgInput) {
      customOrgInput.removeAttribute('required');
      customOrgInput.value = '';
      removeErrorHighlight(customOrgInput);
    }

    if (referralSection) {
      referralSection.classList.remove('active');
    }
    if (referralName) referralName.value = '';
    if (referralContact) referralContact.value = '';
    
    orgCards.forEach(c => {
      c.classList.remove('selected');
      c.setAttribute('aria-checked', 'false');
      c.querySelector('input[type="radio"]').checked = false;
    });
    selectedOrgInput.value = '';
    
    charCounter.textContent = '0 / 1000';
    
    // Clear residual error indicators
    document.querySelectorAll('.error-input').forEach(el => el.classList.remove('error-input'));
    document.querySelectorAll('.error-container').forEach(el => el.classList.remove('error-container'));
  }

  // Error highlighting functions with custom message and shake animation
  function highlightError(element, message) {
    let containerEl = element;
    if (element.classList.contains('org-grid') || element.classList.contains('stars-container') || element.classList.contains('form-group')) {
      if (element.classList.contains('form-group')) {
        containerEl = element;
      } else {
        containerEl = element.closest('.form-group');
      }
      containerEl.classList.add('error-container');
    } else {
      element.classList.add('error-input');
      containerEl = element.closest('.form-group') || element.parentNode;
    }

    if (containerEl) {
      containerEl.classList.add('shake-error');
      setTimeout(() => {
        containerEl.classList.remove('shake-error');
      }, 300);

      let errorMsg = containerEl.querySelector('.validation-error-message');
      if (!errorMsg) {
        errorMsg = document.createElement('div');
        errorMsg.className = 'validation-error-message';
        containerEl.appendChild(errorMsg);
      }
      errorMsg.textContent = message || 'This field is required.';
    }
  }

  // Remove validation highlights and messages
  function removeErrorHighlight(element) {
    let containerEl = element;
    if (element.classList.contains('org-grid') || element.classList.contains('stars-container') || element.classList.contains('form-group')) {
      if (element.classList.contains('form-group')) {
        containerEl = element;
      } else {
        containerEl = element.closest('.form-group');
      }
      containerEl.classList.remove('error-container');
    } else {
      element.classList.remove('error-input');
      containerEl = element.closest('.form-group') || element.parentNode;
    }

    if (containerEl) {
      const errorMsg = containerEl.querySelector('.validation-error-message');
      if (errorMsg) {
        errorMsg.remove();
      }
    }
  }
});

// Premium lightweight canvas-free falling confetti celebration
function triggerConfetti(parentEl) {
  // Clear any existing confetti pieces
  const existingConfetti = parentEl.querySelectorAll('.confetti-piece');
  existingConfetti.forEach(c => c.remove());

  // Disable confetti if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const colors = ['#0A50F5', '#D20A11', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];
  // Reduce confetti count on mobile to 25 to prevent lag
  const isMobile = window.innerWidth < 768;
  const confettiCount = isMobile ? 25 : 65;

  for (let i = 0; i < confettiCount; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    
    // Random sizes, shapes, colors and positioning
    const size = Math.floor(Math.random() * 5) + 6; // 6px - 11px
    piece.style.width = `${size}px`;
    piece.style.height = `${size}px`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Spawn across full horizontal width of parent (the modal overlay fixed background)
    piece.style.left = `${Math.floor(Math.random() * 100)}%`;
    piece.style.top = `-20px`;

    // Animation delay and duration
    const delay = Math.random() * 0.4;
    const duration = Math.random() * 1.6 + 1.4; // 1.4s - 3s
    piece.style.animation = `confetti-fall ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s forwards`;
    
    // Add custom rotation starting angle
    piece.style.transform = `rotate(${Math.floor(Math.random() * 360)}deg)`;

    parentEl.appendChild(piece);

    // Auto remove after animation completes
    setTimeout(() => {
      piece.remove();
    }, (delay + duration) * 1000);
  }
}




