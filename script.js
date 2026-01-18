// ===== Terminal Typing Animation =====
const commands = [
  { cmd: 'fixguard scan .', output: '✓ Scanning 127 files...\n✓ Found 3 issues (2 auto-fixable)' },
  { cmd: 'fixguard scan . --auto-fix', output: '✓ Applied 2 verified patches\n✓ 1 issue requires manual review' },
  { cmd: 'fixguard heal .', output: '⚡ AI-powered fix loop started...\n✓ Generated 3 test cases\n✓ All tests passing' },
  { cmd: 'fixguard report . --format=sarif', output: '✓ SARIF report generated\n→ .fixguard/reports/sarif.json' },
  { cmd: 'fixguard rollback abc123', output: '✓ Snapshot restored\n✓ 2 files reverted to previous state' }
];

let commandIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingDelay = 100;
let showingOutput = false;

const typedCommand = document.getElementById('typed-command');
const terminalOutput = document.getElementById('terminal-output');

function typeCommand() {
  if (!typedCommand) return;

  const currentCommand = commands[commandIndex];

  if (showingOutput) {
    // Wait then start deleting
    setTimeout(() => {
      showingOutput = false;
      isDeleting = true;
      if (terminalOutput) terminalOutput.textContent = '';
      typeCommand();
    }, 2500);
    return;
  }

  if (isDeleting) {
    typedCommand.textContent = currentCommand.cmd.substring(0, charIndex - 1);
    charIndex--;
    typingDelay = 30;

    if (charIndex === 0) {
      isDeleting = false;
      commandIndex = (commandIndex + 1) % commands.length;
      typingDelay = 500;
    }
  } else {
    typedCommand.textContent = currentCommand.cmd.substring(0, charIndex + 1);
    charIndex++;
    typingDelay = Math.random() * 80 + 40;

    if (charIndex === currentCommand.cmd.length) {
      // Show output
      setTimeout(() => {
        if (terminalOutput) {
          terminalOutput.textContent = currentCommand.output;
        }
        showingOutput = true;
        typeCommand();
      }, 300);
      return;
    }
  }

  setTimeout(typeCommand, typingDelay);
}

// ===== Mobile Menu Toggle =====
const menuToggle = document.getElementById('menu-toggle');
const nav = document.getElementById('nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    nav.classList.toggle('active');
  });

  // Close menu when clicking a link
  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      nav.classList.remove('active');
    });
  });
}

// ===== Scroll Fade-in Animation =====
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

// Observe all sections
document.querySelectorAll('.section').forEach(section => {
  observer.observe(section);
});

// ===== Copy to Clipboard =====
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const textToCopy = btn.dataset.copy || btn.previousElementSibling?.textContent;

    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);

      // Visual feedback
      const originalHTML = btn.innerHTML;
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
      btn.style.color = 'var(--accent)';

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.color = '';
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  });
});

// ===== Smooth Scroll for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;

    e.preventDefault();
    const target = document.querySelector(href);

    if (target) {
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ===== Form Validation & Submission =====
const form = document.getElementById('feedback-form');

if (form) {
  const submitBtn = document.getElementById('submit-btn');
  const successMessage = document.getElementById('form-success');

  const validators = {
    name: {
      validate: (value) => value.trim().length >= 2,
      message: 'Please enter your name (at least 2 characters)'
    },
    email: {
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: 'Please enter a valid email address'
    },
    message: {
      validate: (value) => value.trim().length >= 10,
      message: 'Please enter your message (at least 10 characters)'
    }
  };

  function showError(fieldId, message) {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const inputEl = document.getElementById(fieldId);

    if (errorEl && inputEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
      inputEl.style.borderColor = 'var(--error-red)';
    }
  }

  function clearError(fieldId) {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const inputEl = document.getElementById(fieldId);

    if (errorEl && inputEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
      inputEl.style.borderColor = '';
    }
  }

  function validateField(fieldId) {
    const inputEl = document.getElementById(fieldId);
    const validator = validators[fieldId];

    if (!inputEl || !validator) return true;

    if (!validator.validate(inputEl.value)) {
      showError(fieldId, validator.message);
      return false;
    }

    clearError(fieldId);
    return true;
  }

  // Clear errors on input
  ['name', 'email', 'message'].forEach(fieldId => {
    const inputEl = document.getElementById(fieldId);
    if (inputEl) {
      inputEl.addEventListener('input', () => clearError(fieldId));
    }
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all fields
    let isValid = true;
    ['name', 'email', 'message'].forEach(fieldId => {
      if (!validateField(fieldId)) {
        isValid = false;
      }
    });

    if (!isValid) return;

    // Show loading state
    if (submitBtn) {
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
    }

    // Collect form data
    const formData = {
      name: document.getElementById('name')?.value.trim(),
      email: document.getElementById('email')?.value.trim(),
      category: document.getElementById('category')?.value || 'general',
      message: document.getElementById('message')?.value.trim(),
      timestamp: new Date().toISOString()
    };

    try {
      // Try Formspree first (replace with your endpoint)
      // Direct mailto (since no backend is configured yet)
      throw new Error('Using mailto fallback');
    } catch (error) {
      // Fallback: Open email client
      const subject = encodeURIComponent(`Feedback: ${formData.category} - ${formData.name}`);
      const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\nCategory: ${formData.category}\n\n${formData.message}`);
      window.location.href = `mailto:hello@fixgaurd.online?subject=${subject}&body=${body}`;

      // Also store locally for backup
      const submissions = JSON.parse(localStorage.getItem('fixguard-feedback') || '[]');
      submissions.push(formData);
      localStorage.setItem('fixguard-feedback', JSON.stringify(submissions));
    }

    // Simulate network delay for demo
    await new Promise(resolve => setTimeout(resolve, 800));

    // Show success
    if (submitBtn) {
      submitBtn.classList.remove('loading');
      submitBtn.style.display = 'none';
    }
    if (successMessage) {
      successMessage.classList.add('visible');
    }

    // Reset form
    form.reset();

    // Reset success message after 5 seconds
    setTimeout(() => {
      if (successMessage) {
        successMessage.classList.remove('visible');
      }
      if (submitBtn) {
        submitBtn.style.display = '';
        submitBtn.disabled = false;
      }
    }, 5000);
  });
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
  // Start typing animation after a short delay
  setTimeout(typeCommand, 1000);
});
