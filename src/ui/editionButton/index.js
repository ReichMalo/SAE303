import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";

let EditionButtonView = {
  elements: {
    burgerToggle: null,
    editionBtn: null,
    validationBtn: null,
    cancelBtn: null,
    validationButtonsContainer: null,
    editionButtonsWrapper: null
  },

  callbacks: {
    onEditionToggle: null,
    onValidate: null,
    onCancel: null,
    onBurgerToggle: null
  },

  html: function () {
    return template;
  },

  dom: function () {
    return htmlToDOM(template);
  },

  init: function(rootElement) {
    this.elements.burgerToggle = rootElement.querySelector('#burger-toggle');
    this.elements.editionBtn = rootElement.querySelector('.edition-btn');
    this.elements.validationBtn = rootElement.querySelector('.validation-btn');
    this.elements.cancelBtn = rootElement.querySelector('.cancel-btn');
    this.elements.validationButtonsContainer = rootElement.querySelector('.validation-buttons');
    this.elements.editionButtonsWrapper = rootElement.querySelector('.edition-buttons-wrapper');
    
    this.attachEvents();
  },

  attachEvents: function() {
    if (this.elements.burgerToggle && this.elements.editionButtonsWrapper) {
      this.elements.burgerToggle.addEventListener('change', () => {
        if (this.elements.burgerToggle.checked) {
          this.elements.editionButtonsWrapper.classList.add('hidden');
        } else {
          this.elements.editionButtonsWrapper.classList.remove('hidden');
        }
        if (this.callbacks.onBurgerToggle) {
          this.callbacks.onBurgerToggle(this.elements.burgerToggle.checked);
        }
      });
    }

    if (this.elements.editionBtn) {
      this.elements.editionBtn.addEventListener('click', () => {
        if (this.callbacks.onEditionToggle) {
          this.callbacks.onEditionToggle();
        }
        this.toggleButtons();
      });
    }

    if (this.elements.validationBtn) {
      this.elements.validationBtn.addEventListener('click', () => {
        if (this.callbacks.onValidate) {
          this.callbacks.onValidate();
        }
        this.hideValidationButtons();
      });
    }

    if (this.elements.cancelBtn) {
      this.elements.cancelBtn.addEventListener('click', () => {
        if (this.callbacks.onCancel) {
          this.callbacks.onCancel();
        }
        this.hideValidationButtons();
      });
    }
  },

  toggleButtons: function() {
    this.elements.editionBtn.classList.toggle('hidden');
    this.elements.validationButtonsContainer.classList.toggle('hidden');
  },

  showValidationButtons: function() {
    this.elements.editionBtn.classList.add('hidden');
    this.elements.validationButtonsContainer.classList.remove('hidden');
  },

  hideValidationButtons: function() {
    this.elements.editionBtn.classList.remove('hidden');
    this.elements.validationButtonsContainer.classList.add('hidden');
  },

  setCallbacks: function(callbacks) {
    Object.assign(this.callbacks, callbacks);
  }
};

export { EditionButtonView };
