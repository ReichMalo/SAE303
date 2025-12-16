import { SVGView } from "@/ui/svgComplet/index.js";
import {InfoButtonView} from "@/ui/infoButton/index.js";
import {EditionButtonView} from "@/ui/editionButton/index.js";
import InfoPanelView from "@/ui/infoPanel/index.js";
import ViewPanelView from "@/ui/viewPanel/index.js";
import { htmlToDOM } from "@/lib/utils.js";
import { Animation } from "../../lib/animation";
import skillData from "@/data/skill.json";
import template from "./template.html?raw";

let progressData = JSON.parse(localStorage.getItem('progressData')) || {};
let tempProgressData = {};

let C = {};

let canvasState = {
  isDragging: false,
  startX: 0,
  startY: 0,
  svg: null,
  isEditionMode: false,
  isPanelOpen: false,
  lastElementId: null
};



C.init = function() {
  return V.init();
}

C.handler_click = function(ev) {
    let target = ev.target.closest('[id]');
    if (target && target.id.includes('filtre')) {
      if(canvasState.isEditionMode) {
        let isInLink = target.closest('[id*="lien"]');
        if (!isInLink) {
          C.getCompetenceFromFiltre(target);
          V.infoPanel.open();
        }
     }
     else {
        C.getCompetenceFromFiltre(target);
        V.viewPanel.open();
    }
  }
};

C.getCompetenceFromFiltre = function(filtreElement) {
  let parent = filtreElement.parentElement;
  let foundElement = null;
  
  while (parent) {
    if (parent.id && !parent.id.includes('filtre')) {
      if (parent.id.includes('lvl')) {
        console.log(parent.id);
        C.updatePanelWithData(parent.id);
        return parent.id;
      }
      if (!foundElement) {
        foundElement = parent.id;
      }
    }
    parent = parent.parentElement;
  }
  
  if (foundElement) {
    console.log(foundElement);
    C.updatePanelWithData(foundElement);
    return foundElement;
  }
  
  return null;
};

C.updatePanelWithData = function(elementId) {
  canvasState.lastElementId = elementId;
  
  for (let competenceKey in skillData) {
    let competence = skillData[competenceKey];
    
    if (competence.niveaux) {
      for (let niveau of competence.niveaux) {
        if (niveau.acs) {
          for (let ac of niveau.acs) {
            if (ac.code === elementId) {
              C.fillPanelTemplate(ac.code, ac.libelle, niveau.libelle);
              C.fillViewPanelTemplate(ac.code, ac.libelle, niveau.libelle);
              return;
            }
          }
        }
      }
    }
  }
  
  for (let competenceKey in skillData) {
    let competence = skillData[competenceKey];
    
    if (competence.niveaux) {
      for (let niveau of competence.niveaux) {
        let niveauId = competence.nom_court.toLowerCase() + '_lvl' + niveau.ordre;
        
        if (niveauId === elementId) {
          C.fillPanelTemplate(elementId, niveau.libelle, competence.libelle_long);
          C.fillViewPanelTemplate(elementId, niveau.libelle, competence.libelle_long);
          return;
        }
      }
    }
  }
};

C.fillPanelTemplate = function(title, description, longDescription) {
  if (!V.infoPanel || !V.infoPanel.panelDom) return;
  
  let titleElement = V.infoPanel.panelDom.querySelector('.info-panel__title');
  let descElement = V.infoPanel.panelDom.querySelector('.info-panel__text p');
  
  if (titleElement) {
    titleElement.textContent = title;
  }
  
  if (descElement) {
    descElement.textContent = description;
  }
  
  
  let savedLevel = progressData[canvasState.lastElementId] || 1;
  V.infoPanel.selectValue(savedLevel);
};

C.fillViewPanelTemplate = function(title, description, longDescription) {
  if (!V.viewPanel || !V.viewPanel.panelDom) return;
  
  const titleElement = V.viewPanel.panelDom.querySelector('.view-panel__title');
  const descElement = V.viewPanel.panelDom.querySelector('.view-panel__text p');
  
  if (titleElement) {
    titleElement.textContent = title;
  }
  
  if (descElement) {
    descElement.textContent = description;
  }

  const savedLevel = progressData[canvasState.lastElementId] || 1;
  V.viewPanel.setLevel(savedLevel);
};

C.startDrag = function(ev) {
  const infoPanelElement = document.querySelector('.info-panel');
  const viewPanelElement = document.querySelector('.view-panel');
  
  if (infoPanelElement && infoPanelElement.contains(ev.target)) return;
  if (viewPanelElement && viewPanelElement.contains(ev.target)) return;
  
  canvasState.isDragging = true;
  canvasState.startX = ev.clientX;
  canvasState.startY = ev.clientY;
};

C.moveDrag = function(ev) {
  if (!canvasState.isDragging || !canvasState.svg) return;
  
  let currentX = ev.clientX;
  let currentY = ev.clientY;
  
  let deltaX = currentX - canvasState.startX;
  let deltaY = currentY - canvasState.startY;
  
  Animation.moveCanvas(canvasState.svg, deltaX, deltaY);
  
  canvasState.startX = currentX;
  canvasState.startY = currentY;
};

C.endDrag = function(ev) {
  canvasState.isDragging = false;
};

C.handleScroll = function(ev) {
  Animation.zoomCanvas(canvasState.svg, ev.deltaY, ev.clientX, ev.clientY);
};

C.saveLevelProgress = function(elementId, level) {
  if (elementId) {
    tempProgressData[elementId] = level;
    
    C.applyPreviewOpacity(elementId, level);
  }
};

C.applyPreviewOpacity = function(elementId, level) {
  const element = canvasState.svg.querySelector(`[id="${elementId}"]`);
  if (element) {
    const filtreElements = element.querySelectorAll('[id*="filtre"]');
    filtreElements.forEach(filtreElement => {
      Animation.setFilterOpacity(filtreElement, level, 0.3);
    });
  }
};

C.validateChanges = function() {
  for (let key in tempProgressData) {
    progressData[key] = tempProgressData[key];
  }
  localStorage.setItem('progressData', JSON.stringify(progressData));
  console.log('Modifications validées et sauvegardées');
  tempProgressData = {};
  C.applyFiltersOpacity();
};

C.cancelChanges = function() {
  progressData = JSON.parse(localStorage.getItem('progressData')) || {};
  tempProgressData = {};
  console.log('Modifications annulées');
};

C.applyFiltersOpacity = function() {
  for (let elementId in progressData) {
    const competenceElement = canvasState.svg.querySelector(`[id="${elementId}"]`);
    if (competenceElement) {
      const filtreElements = competenceElement.querySelectorAll('[id*="filtre"]');
      filtreElements.forEach(filtreElement => {
        const level = progressData[elementId] || 1;
        Animation.setFilterOpacity(filtreElement, level, 0);
      });
    }
  }
};

let V = {
  rootPage: null,
  svgTest: null,
  infoPanel: null,
  viewPanel: null
};

V.init = function() {
  V.svgTest = new SVGView();
  V.rootPage = htmlToDOM(template);
  let svgDom = V.svgTest.dom();
  let infoBtnDom = InfoButtonView.dom();
  let editionBtnDom = EditionButtonView.dom();
  let infoPanelDom = InfoPanelView.dom();
  let viewPanelDom = ViewPanelView.dom();
  
  V.rootPage.querySelector('slot[name="svg"]').replaceWith(svgDom);
  V.rootPage.querySelector('slot[name="infoButton"]').replaceWith(infoBtnDom);
  V.rootPage.querySelector('slot[name="editionButton"]').replaceWith(editionBtnDom);
  V.rootPage.appendChild(infoPanelDom);
  V.rootPage.appendChild(viewPanelDom);
  
  canvasState.svg = svgDom;
  Animation.initCanvas(svgDom);

  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  
  V.infoPanel = InfoPanelView;
  V.viewPanel = ViewPanelView;
  let infoBtnElement = V.rootPage.querySelector('.info-button-container') || infoBtnDom;
  let editionBtnElement = V.rootPage.querySelector('.edition-button-container') || editionBtnDom;
  V.infoPanel.init(infoPanelDom, infoBtnElement, editionBtnElement, canvasState, C.saveLevelProgress);
  V.viewPanel.init(viewPanelDom, infoBtnElement, editionBtnElement, canvasState, C.updatePanelWithData);
  
  C.applyFiltersOpacity();
  
  V.attachEvents();
  return V.rootPage;
};

V.attachEvents = function() {
    V.rootPage.addEventListener("click", C.handler_click);
    V.rootPage.addEventListener("mousedown", C.startDrag);
    V.rootPage.addEventListener("mousemove", C.moveDrag);
    V.rootPage.addEventListener("mouseup", C.endDrag);
    V.rootPage.addEventListener("wheel", C.handleScroll);
    let burgerToggle = V.rootPage.querySelector('#burger-toggle');
    let editionBtn = V.rootPage.querySelector('.edition-btn');
    let validationBtn = V.rootPage.querySelector('.validation-btn');
    let cancelBtn = V.rootPage.querySelector('.cancel-btn');
    let validationButtonsContainer = V.rootPage.querySelector('.validation-buttons');
    let editionButtonsWrapper = V.rootPage.querySelector('.edition-buttons-wrapper');
    
    if (burgerToggle && editionButtonsWrapper) {
      burgerToggle.addEventListener('change', function() {
        if (this.checked) {
          editionButtonsWrapper.classList.add('hidden');
        } else {
          editionButtonsWrapper.classList.remove('hidden');
        }
      });
    }
    
    if (editionBtn) {
      editionBtn.addEventListener('click', function() {
        canvasState.isEditionMode = !canvasState.isEditionMode;
        if (canvasState.isEditionMode) {
          editionBtn.classList.add('hidden');
          validationButtonsContainer.classList.remove('hidden');
        } else {
          editionBtn.classList.remove('hidden');
          validationButtonsContainer.classList.add('hidden');
        }
      });
    }
    
    if (validationBtn) {
      validationBtn.addEventListener('click', function() {
        C.validateChanges(); 
        canvasState.isEditionMode = false;
        editionBtn.classList.remove('hidden');
        validationButtonsContainer.classList.add('hidden');
      });
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function() {
        C.cancelChanges(); 
        canvasState.isEditionMode = false;
        editionBtn.classList.remove('hidden');
        validationButtonsContainer.classList.add('hidden');
      });
    }
    
    
    V.infoPanel.onOpen = function() {
      canvasState.isPanelOpen = true;
    };
    V.infoPanel.onClose = function() {
      canvasState.isPanelOpen = false;
    };
    V.viewPanel.onOpen = function() {
      canvasState.isPanelOpen = true;
    };
    V.viewPanel.onClose = function() {
      canvasState.isPanelOpen = false;
    };
}

export function pageSvg() {
  return C.init();
}