import templateHTML from './template.html?raw';
import { Animation } from '../../lib/animation.js';

const ViewPanelView = {
  current_level: 1,
  panelDom: null,
  canvasState: null,
  onOpenCallback: null,
  elements: {
    panel: null,
    closeBtn: null,
    levelValue: null,
    infoButton: null,
    editionButton: null,
  },

  html: () => templateHTML,

  dom: function () {
    const container = document.createElement('div');
    container.innerHTML = this.html();
    return container.firstElementChild;
  },

  init: function (panelElement, infoBtnElement, editionBtnElement, canvasState, onOpenCallback) {
    this.canvasState = canvasState;
    this.onOpenCallback = onOpenCallback;
    this.panelDom = panelElement;
    this.elements.panel = panelElement || document.querySelector('.view-panel');
    this.elements.closeBtn = this.elements.panel.querySelector('.view-panel__close');
    this.elements.levelValue = this.elements.panel.querySelector('.level__value');
    this.elements.infoButton = infoBtnElement;
    this.elements.editionButton = editionBtnElement;

    this.attachEvents();
  },

  attachEvents: function () {
    this.elements.closeBtn.addEventListener('click', () => {
      this.close();
    });
  },

  setLevel: function (level) {
    this.current_level = level;
    if (this.elements.levelValue) {
      this.elements.levelValue.textContent = level;
    }
  },

  open: function () {
    if (this.onOpenCallback && this.canvasState && this.canvasState.lastElementId) {
      this.onOpenCallback(this.canvasState.lastElementId);
    }
    
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

  getLevel: function () {
    return this.current_level;
  },
};

export default ViewPanelView;
