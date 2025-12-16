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

C.getCompetenceFromFiltre = function(filtreElement) {
  let parent = filtreElement.parentElement;
  let foundElement = null;
  
  while (parent) {
    if (parent.id && !parent.id.includes('filtre')) {
      if (parent.id.includes('lvl')) {
        V.updatePanelWithData(parent.id);
        return parent.id;
      }
      if (!foundElement) {
        foundElement = parent.id;
      }
    }
    parent = parent.parentElement;
  }
  
  if (foundElement) {
    V.updatePanelWithData(foundElement);
    return foundElement;
  }
  
  return null;
};

C.startDrag = function(ev) {
  let infoPanelElement = document.querySelector('.info-panel');
  let viewPanelElement = document.querySelector('.view-panel');
  
  if (infoPanelElement && infoPanelElement.contains(ev.target)) return;
  if (viewPanelElement && viewPanelElement.contains(ev.target)) return;
  
  canvasState.isDragging = true;
  canvasState.startX = ev.clientX;
  canvasState.startY = ev.clientY;
};

C.moveDrag = function(ev) {
  if (!canvasState.isDragging || !canvasState.svg) return;
  
  let deltaX = ev.clientX - canvasState.startX;
  let deltaY = ev.clientY - canvasState.startY;
  
  Animation.moveCanvas(canvasState.svg, deltaX, deltaY);
  
  canvasState.startX = ev.clientX;
  canvasState.startY = ev.clientY;
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
    V.applyPreviewOpacity(elementId, level);
  }
};

C.validateChanges = function() {
  for (let key in tempProgressData) {
    progressData[key] = tempProgressData[key];
  }
  localStorage.setItem('progressData', JSON.stringify(progressData));
  tempProgressData = {};
  V.applyFiltersOpacity();
};

C.cancelChanges = function() {
  progressData = JSON.parse(localStorage.getItem('progressData')) || {};
  tempProgressData = {};
  V.applyFiltersOpacity();
};

let V = {
  rootPage: null,
  svgTest: null,
  infoPanel: null,
  viewPanel: null
};


V.updatePanelWithData = function(elementId) {
  canvasState.lastElementId = elementId;
  
  for (let competenceKey in skillData) {
    let competence = skillData[competenceKey];
    
    if (competence.niveaux) {
      for (let niveau of competence.niveaux) {
        if (niveau.acs) {
          for (let ac of niveau.acs) {
            if (ac.code === elementId) {
              V.fillPanelTemplate(ac.code, ac.libelle, niveau.libelle);
              V.fillViewPanelTemplate(ac.code, ac.libelle, niveau.libelle);
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
          V.fillPanelTemplate(elementId, niveau.libelle, competence.libelle_long);
          V.fillViewPanelTemplate(elementId, niveau.libelle, competence.libelle_long);
          return;
        }
      }
    }
  }
};


V.fillPanelTemplate = function(title, description) {
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


V.fillViewPanelTemplate = function(title, description) {
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


V.applyPreviewOpacity = function(elementId, level) {
  const element = canvasState.svg.querySelector(`[id="${elementId}"]`);
  if (element) {
    const filtreElements = element.querySelectorAll('[id*="filtre"]');
    filtreElements.forEach(filtreElement => {
      Animation.setFilterOpacity(filtreElement, level, 0.3);
    });
  }
};


V.applyFiltersOpacity = function() {
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

V.init = function() {
  V.svgTest = new SVGView();
  V.rootPage = htmlToDOM(template);
  V.infoPanel = InfoPanelView;
  V.viewPanel = ViewPanelView;
  
  const svgDom = V.svgTest.dom();
  const infoBtnDom = InfoButtonView.dom();
  const editionBtnDom = EditionButtonView.dom();
  const infoPanelDom = V.infoPanel.dom();
  const viewPanelDom = V.viewPanel.dom();
  
  V.rootPage.querySelector('slot[name="svg"]').replaceWith(svgDom);
  V.rootPage.querySelector('slot[name="infoButton"]').replaceWith(infoBtnDom);
  V.rootPage.querySelector('slot[name="editionButton"]').replaceWith(editionBtnDom);
  V.rootPage.appendChild(infoPanelDom);
  V.rootPage.appendChild(viewPanelDom);
  
  canvasState.svg = svgDom;
  Animation.initCanvas(svgDom);

  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  
  const infoBtnElement = V.rootPage.querySelector('.info-button-container') || infoBtnDom;
  const editionBtnElement = V.rootPage.querySelector('.edition-button-container') || editionBtnDom;
  V.infoPanel.init(infoPanelDom, infoBtnElement, editionBtnElement, canvasState, C.saveLevelProgress);
  V.viewPanel.init(viewPanelDom, infoBtnElement, editionBtnElement, canvasState);
  
  V.applyFiltersOpacity();
  V.attachEvents();
  return V.rootPage;
};



V.attachEvents = function() {
    V.rootPage.addEventListener("mousedown", C.startDrag);
    V.rootPage.addEventListener("mousemove", C.moveDrag);
    V.rootPage.addEventListener("mouseup", C.endDrag);
    V.rootPage.addEventListener("wheel", C.handleScroll);
    

    EditionButtonView.init(V.rootPage);
    EditionButtonView.setCallbacks({
      onEditionToggle: function() {
        canvasState.isEditionMode = !canvasState.isEditionMode;
      },
      onValidate: function() {
        C.validateChanges();
        canvasState.isEditionMode = false;
      },
      onCancel: function() {
        C.cancelChanges();
        canvasState.isEditionMode = false;
      }
    });
    
    
    V.infoPanel.setCallbacks({
      onLevelChange: function(level) {
        C.saveLevelProgress(canvasState.lastElementId, level);
      },
      onClose: function() {
        canvasState.isPanelOpen = false;
      }
    });
    
    V.viewPanel.setCallbacks({
      onClose: function() {
        canvasState.isPanelOpen = false;
      }
    });
    
    V.svgTest.init(V.rootPage);
    V.svgTest.setCallbacks({
      onFilterClick: function(filtreElement) {
        if (canvasState.isEditionMode) {
          let isInLink = filtreElement.closest('[id*="lien"]');
          if (!isInLink) {
            C.getCompetenceFromFiltre(filtreElement);
            V.infoPanel.open();
          }
        } else {
          C.getCompetenceFromFiltre(filtreElement);
          V.viewPanel.open();
        }
      }
    });
};

export function pageSvg() {
  return C.init();
}