(() => {
  'use strict';

  const formOverlay = document.querySelector('#lead-form');
  if (!formOverlay) return;

  const formOpeners = [...document.querySelectorAll('[data-form-open]')];
  const formQuestions = document.querySelector('#form-questions');
  const formContact = document.querySelector('#form-contact');
  const formOptions = formQuestions.querySelector('.form-options');
  const formTitle = document.querySelector('#form-question-title');
  const formDescription = document.querySelector('#form-question-description');
  const formContinue = formQuestions.querySelector('.form-continue');
  const formBack = formOverlay.querySelector('.form-back');
  const formProgress = formOverlay.querySelector('.form-progress');
  const formQuestionError = document.querySelector('#form-question-error');
  const formConsent = document.querySelector('#form-consent');
  const formStatus = document.querySelector('#form-validation-status');
  const formScreens = {
    questions: formOverlay.querySelector('.form-questions'),
    contact: formOverlay.querySelector('.form-contact'),
    success: formOverlay.querySelector('.form-success')
  };
  const formSteps = [
    {
      key: 'dondeVivir', title: '¿Dónde quieres vivir?',
      options: [['Bogotá', 'Building'], ['Sabana', 'House'], ['Estoy abierto a opciones', 'Location']]
    },
    {
      key: 'presupuesto', title: '¿Cuál es tu presupuesto aproximado en COP?',
      options: [['Menos de $200 Millones', 'Price low'], ['Entre $200 - $400 Millones', 'Gem'], ['Entre $400 - $650 Millones', 'Money bag'], ['Más de $650 Millones', 'Price Stretch']]
    },
    {
      key: 'financiacion', title: '¿Cómo piensas financiar tu compra?',
      description: 'Si necesitas financiación, también podemos ayudarte a explorar tus opciones.',
      options: [['Crédito hipotecario', 'Loan'], ['Recursos propios', 'savings'], ['Leasing habitacional', 'Contract'], ['Recursos del FNA', 'Finance'], ['Aún no lo sé', 'Question']]
    },
    {
      key: 'cuandoComprar', title: '¿Cuándo te gustaría comprar?',
      description: 'Esta información nos ayuda a priorizar las mejores opciones para ti.',
      options: [['Lo antes posible', 'Fast 2'], ['En 1–3 meses', 'Soon'], ['En 3–6 meses', 'Now'], ['Estoy explorando', 'Search']]
    }
  ];

  let formStep = 0;
  let formState;
  let formOpener = null;
  let formScrollY = 0;
  let formReturnToTop = false;

  function createFormState() {
    const params = new URLSearchParams(window.location.search);
    return {
      nombre: '', whatsapp: '', email: '',
      dondeVivir: '', presupuesto: '', financiacion: '', cuandoComprar: '',
      utm_source: params.get('utm_source') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_content: params.get('utm_content') || ''
    };
  }

  function clearFormError(input) {
    input.removeAttribute('aria-invalid');
    const error = document.querySelector(`#${input.id}-error`);
    error.textContent = '';
    error.hidden = true;
  }

  function resetForm() {
    formState = createFormState();
    formStep = 0;
    formContact.reset();
    formContact.querySelectorAll('input').forEach(clearFormError);
    formStatus.textContent = '';
    formQuestionError.textContent = '';
    formQuestionError.hidden = true;
    renderFormStep(false);
  }

  function showFormScreen(name, heading, moveFocus = true) {
    Object.entries(formScreens).forEach(([key, screen]) => { screen.hidden = key !== name; });
    formOverlay.dataset.screen = name;
    formOverlay.scrollTop = 0;
    formOverlay.querySelector('.form-step-scroll').scrollTop = 0;
    if (moveFocus) heading.focus({ preventScroll: true });
  }

  function renderFormStep(moveFocus = true) {
    const step = formSteps[formStep];
    formQuestions.dataset.step = String(formStep + 1);
    formTitle.textContent = step.title;
    formDescription.textContent = step.description || '';
    formDescription.hidden = !step.description;
    if (step.description) formOptions.setAttribute('aria-describedby', 'form-question-description');
    else formOptions.removeAttribute('aria-describedby');
    document.querySelector('#form-step-label').textContent = `PASO ${formStep + 1} DE 4`;
    formProgress.setAttribute('aria-valuenow', String(formStep + 1));
    formProgress.firstElementChild.style.width = `${(formStep + 1) * 25}%`;
    formBack.setAttribute('aria-label', formStep === 0 ? 'Volver al inicio' : 'Volver al paso anterior');
    formOptions.replaceChildren();

    step.options.forEach(([value, icon]) => {
      const label = document.createElement('label');
      label.className = 'form-option';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = step.key;
      input.value = value;
      input.required = true;
      input.checked = formState[step.key] === value;
      const card = document.createElement('span');
      card.className = 'form-option-card';
      const iconCircle = document.createElement('span');
      iconCircle.className = 'form-option-icon';
      const image = document.createElement('img');
      image.src = `Assets/Icons/${icon}.svg`;
      image.alt = '';
      image.width = 16;
      image.height = 16;
      iconCircle.append(image);
      const text = document.createElement('span');
      text.textContent = value;
      const check = document.createElement('span');
      check.className = 'form-option-check';
      check.textContent = '✓';
      check.setAttribute('aria-hidden', 'true');
      card.append(iconCircle, text, check);
      label.append(input, card);
      formOptions.append(label);
    });

    formContinue.setAttribute('aria-disabled', String(!formState[step.key]));
    formQuestionError.hidden = true;
    formQuestionError.textContent = '';
    showFormScreen('questions', formTitle, moveFocus);
  }

  function openForm(opener) {
    if (formOverlay.open) return;
    formOpener = opener;
    formScrollY = window.scrollY;
    formReturnToTop = false;
    resetForm();
    document.documentElement.classList.add('form-is-open');
    formOverlay.showModal(); // Native dialog makes the landing page inert and contains focus.
    formTitle.focus({ preventScroll: true });
  }

  function closeForm(returnToTop = false) {
    formReturnToTop = returnToTop;
    formOverlay.close();
  }

  formOpeners.forEach(button => button.addEventListener('click', () => openForm(button)));
  formOverlay.addEventListener('cancel', event => {
    event.preventDefault();
    closeForm();
  });
  formOverlay.addEventListener('close', () => {
    document.documentElement.classList.remove('form-is-open');
    resetForm();
    window.scrollTo({ top: formReturnToTop ? 0 : formScrollY, behavior: 'instant' });
    (formReturnToTop ? formOpeners[0] : formOpener)?.focus({ preventScroll: true });
    formOpener = null;
  });
  formBack.addEventListener('click', () => {
    if (formOverlay.dataset.screen === 'contact') {
      formStep = 3;
      renderFormStep();
    } else if (formStep > 0) {
      formStep -= 1;
      renderFormStep();
    } else {
      closeForm();
    }
  });

  formQuestions.addEventListener('change', event => {
    if (!event.target.matches('input[type="radio"]')) return;
    formState[formSteps[formStep].key] = event.target.value;
    formContinue.setAttribute('aria-disabled', 'false');
    formQuestionError.hidden = true;
    formQuestionError.textContent = '';
  });
  formQuestions.addEventListener('submit', event => {
    event.preventDefault();
    if (!formState[formSteps[formStep].key]) {
      formQuestionError.textContent = 'Selecciona una opción para continuar.';
      formQuestionError.hidden = false;
      formOptions.querySelector('input').focus();
      return;
    }
    if (formStep < 3) {
      formStep += 1;
      renderFormStep();
    } else {
      formBack.setAttribute('aria-label', 'Volver al paso anterior');
      showFormScreen('contact', document.querySelector('#form-contact-title'));
    }
  });

  function formFieldError(input) {
    if (input === formConsent) {
      return input.checked ? '' : 'Para continuar, debes autorizar el tratamiento de tus datos personales.';
    }
    if (!input.value.trim()) {
      return { nombre: 'Escribe tu nombre.', whatsapp: 'Escribe tu número de WhatsApp.', email: 'Escribe tu email.' }[input.name];
    }
    if (input.name === 'email' && input.validity.typeMismatch) return 'Escribe un email válido.';
    return '';
  }

  function validateFormField(input) {
    const message = formFieldError(input);
    if (!message) {
      clearFormError(input);
      return true;
    }
    const error = document.querySelector(`#${input.id}-error`);
    input.setAttribute('aria-invalid', 'true');
    error.textContent = message;
    error.hidden = false;
    return false;
  }

  formContact.addEventListener('input', event => {
    const input = event.target;
    if (!input.matches('input')) return;
    if (input !== formConsent) formState[input.name] = input.value;
    if (input.getAttribute('aria-invalid') === 'true') validateFormField(input);
    formStatus.textContent = '';
  });

  formContact.addEventListener('submit', event => {
    event.preventDefault();
    // Re-read inputs here to include values supplied by browser autofill.
    ['nombre', 'whatsapp', 'email'].forEach(key => {
      const input = formContact.elements.namedItem(key);
      input.value = input.value.trim();
      formState[key] = input.value;
    });
    const invalidFields = [...formContact.querySelectorAll('input')].filter(input => !validateFormField(input));
    if (invalidFields.length) {
      formStatus.textContent = 'Revisa los campos indicados antes de continuar.';
      if (invalidFields.includes(formConsent)) {
        formConsent.focus({ preventScroll: true });
        formConsent.closest('.form-privacy').scrollIntoView({ block: 'nearest', behavior: 'instant' });
      } else {
        invalidFields[0].focus();
      }
      return;
    }
    // Guard against bypassing the question flow; never log a partial submission.
    const missingStep = formSteps.findIndex(step => !formState[step.key]);
    if (missingStep !== -1) {
      formStep = missingStep;
      renderFormStep();
      return;
    }
    const { nombre, whatsapp, email, dondeVivir, presupuesto, financiacion, cuandoComprar,
      utm_source, utm_campaign, utm_content } = formState;
    const submission = {
      nombre, whatsapp, email, dondeVivir, presupuesto, financiacion, cuandoComprar,
      utm_source, utm_campaign, utm_content
    };
    console.log(submission); // Local prototype only: no storage or network submission.
    showFormScreen('success', document.querySelector('#form-success-title'));
  });

  formOverlay.querySelector('.form-return').addEventListener('click', () => closeForm(true));
  resetForm();
})();
