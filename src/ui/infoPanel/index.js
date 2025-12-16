import templateHTML from './template.html?raw';
import { Animation } from '../../lib/animation.js';


const InfoPanelView = {
  current_value: 1,
  dom: null,
  panelDom: null,
  canvasState: null,
  onValueChangeCallback: null,
  elements: {
    panel: null,
    handle: null,
    labels: [],
    closeBtn: null,
    infoButton: null,
    editionButton: null,
  },

  html: () => templateHTML,

  dom: function () {
    const container = document.createElement('div');
    container.innerHTML = this.html();
    return container.firstElementChild;
  },

  init: function (panelElement, infoBtnElement, editionBtnElement, canvasState, onValueChangeCallback) {
    this.canvasState = canvasState;
    this.onValueChangeCallback = onValueChangeCallback;
    this.panelDom = panelElement;
    this.elements.panel = panelElement || document.querySelector('.info-panel');
    this.elements.handle = this.elements.panel.querySelector('.selector__handle');
    this.elements.labels = Array.from(this.elements.panel.querySelectorAll('.selector__label'));
    this.elements.closeBtn = this.elements.panel.querySelector('.info-panel__close');
    this.elements.infoButton = infoBtnElement;
    this.elements.editionButton = editionBtnElement;

    this.updateSelectorPosition(1);
    if (this.elements.labels.length > 0) {
      this.elements.labels[0].classList.add('active');
    }

    this.attachEvents();
  },

  attachEvents: function () {
    this.elements.labels.forEach((label, index) => {
      label.addEventListener('click', () => {
        this.selectValue(index + 1);
      });
    });

    let isDragging = false;
    this.elements.handle.addEventListener('mousedown', () => {
      isDragging = true;
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const track = document.querySelector('.selector__track');
      const rect = track.getBoundingClientRect();
      const position = (e.clientX - rect.left) / rect.width;
      const clampedPosition = Math.max(0, Math.min(1, position));
      
      const value = Math.round(clampedPosition * 4) + 1;
      this.selectValue(value);
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    this.elements.closeBtn.addEventListener('click', () => {
      this.close();
    });
  },

  selectValue: function (value) {
    value = Math.max(1, Math.min(5, value));
    
    if (this.current_value === value) return;

    this.current_value = value;
    
    // Mettre à jour les labels
    this.elements.labels.forEach((label, index) => {
      label.classList.remove('active');
      if (index + 1 === value) {
        label.classList.add('active');
      }
    });

    // Animer la position du handle
    this.updateSelectorPosition(value);
    
    // Appeler le callback de sauvegarde
    if (this.onValueChangeCallback && this.canvasState && this.canvasState.lastElementId) {
      this.onValueChangeCallback(this.canvasState.lastElementId, value);
    }
  },

  updateSelectorPosition: function (value) {
    Animation.animateSelectorHandle(this.elements.handle, value, 0.3);
  },

  open: function () {
    if (this.canvasState) {
      this.canvasState.isPanelOpen = true;
    }
    if (this.elements.infoButton) this.elements.infoButton.classList.add('hidden');
    if (this.elements.editionButton) this.elements.editionButton.classList.add('hidden');
    
    Animation.openInfoPanel(this.elements.panel, 0.4);
  },

  close: function () {
    if (this.canvasState) {
      this.canvasState.isPanelOpen = false;
    }
    if (this.elements.infoButton) this.elements.infoButton.classList.remove('hidden');
    if (this.elements.editionButton) this.elements.editionButton.classList.remove('hidden');
    
    Animation.closeInfoPanel(this.elements.panel, () => {
      this.elements.panel.classList.add('hidden');
    }, 0.4);
  },

  getValue: function () {
    return this.current_value;
  },
};

export default InfoPanelView;
