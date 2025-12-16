import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";

class SVGView {
  constructor() {
    this.root = htmlToDOM(template);
    this.callbacks = {
      onFilterClick: null,
    };
  }

  html() {
    return template;
  }

  dom() {
    return this.root;
  }

  init(rootElement) {
    this.rootElement = rootElement;
    this.attachEvents();
  }

  setCallbacks(callbacks) {
    if (callbacks.onFilterClick) this.callbacks.onFilterClick = callbacks.onFilterClick;
  }

  attachEvents() {
    if (!this.rootElement) return;
    
    const filtres = this.rootElement.querySelectorAll('[id^="filtre"]');
    filtres.forEach(filtre => {
      filtre.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.callbacks.onFilterClick) {
          this.callbacks.onFilterClick(filtre);
        }
      });
    });
  }
}

export { SVGView };