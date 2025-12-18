import { SVGView } from "@/ui/svgComplet/index.js";
import {InfoButtonView} from "@/ui/infoButton/index.js";
import {EditionButtonView} from "@/ui/editionButton/index.js";
import InfoPanelView from "@/ui/infoPanel/index.js";
import ViewPanelView from "@/ui/viewPanel/index.js";
import { htmlToDOM } from "@/lib/utils.js";
import { Animation } from "../../lib/animation";
import { pn } from "@/data/export.js";
import template from "./template.html?raw";



let M = {
  progressData: JSON.parse(localStorage.getItem('progressData')) || {},
  tempProgressData: {},
  historiqueGlobal: JSON.parse(localStorage.getItem('historiqueData')) || { modifications: [] }
};



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


//obtenir l'id avec le filtre (car il est le premier élément par dessus les autres)
C.getCompetenceFromFiltre = function(filtreElement) {
  let parent = filtreElement.parentElement;
  let foundElement = null;
  
  while (parent) {
    if (parent.id && !parent.id.includes('filtre')) {
      if (parent.id.includes('lvl')) {
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
    C.updatePanelWithData(foundElement);
    return foundElement;
  }
  
  return null;
};

// on ajoute un élément dans les changements temporaires
C.saveLevelProgress = function(elementId, level) {
  if (elementId) {
    M.tempProgressData[elementId] = level;
    V.applyPreviewOpacity(elementId, level);
  }
};

//valider les changements et les enregistrer dans le localstorage
C.validateChanges = function() {
  for (let key in M.tempProgressData) {
    M.progressData[key] = M.tempProgressData[key];
    
    // Ajouter à l'historique global
    M.historiqueGlobal.modifications.push({
      acCode: key,
      level: M.tempProgressData[key],
      date: new Date().toLocaleDateString('fr-FR'),
      timestamp: new Date().toISOString()
    });
  }
  localStorage.setItem('progressData', JSON.stringify(M.progressData));
  localStorage.setItem('historiqueData', JSON.stringify(M.historiqueGlobal));
  M.tempProgressData = {};
  V.applyFiltersOpacity();
};

//annuler les changements temporaire, 
C.cancelChanges = function() {
  M.progressData = JSON.parse(localStorage.getItem('progressData')) || {};
  M.tempProgressData = {};
  V.applyFiltersOpacity();
};

// mettre ça dans le composant /!\ /!\ /!\
C.fillPanelTemplate = function(title, description) {
  if (!V.infoPanel || !V.infoPanel.panelDom) return;
  
  let titleElement = V.infoPanel.panelDom.querySelector('.info-panel__title');
  let descElement = V.infoPanel.panelDom.querySelector('.info-panel__text p');
  
  if (titleElement) {
    titleElement.textContent = title;
  }
  
  if (descElement) {
    descElement.textContent = description;
  }
  
  let savedLevel = M.progressData[canvasState.lastElementId] || 1;
  V.infoPanel.selectValue(savedLevel);
};

// mettre ça dans le composant /!\ /!\ /!\
C.fillViewPanelTemplate = function(title, description) {
  if (!V.viewPanel || !V.viewPanel.panelDom) return;
  
  let titleElement = V.viewPanel.panelDom.querySelector('.view-panel__title');
  let descElement = V.viewPanel.panelDom.querySelector('.view-panel__text p');
  
  if (titleElement) {
    titleElement.textContent = title;
  }
  
  if (descElement) {
    descElement.textContent = description;
  }

  const savedLevel = M.progressData[canvasState.lastElementId] || 1;
  V.viewPanel.setLevel(savedLevel);
};

C.updatePanelWithData = function(elementId) {
  canvasState.lastElementId = elementId;
  let isLevel = elementId.includes('_lvl');
  
  if (!isLevel) {
    let acLibelle = pn.getACLibelle(elementId);
    C.fillPanelTemplate(elementId, acLibelle);
    C.fillViewPanelTemplate(elementId, acLibelle);
    return;
  }
  
  const levelData = pn.getLevelLibelle(elementId);
  if (levelData) {
    C.fillPanelTemplate(elementId, levelData.libelle, levelData.libelle_long);
    C.fillViewPanelTemplate(elementId, levelData.libelle, levelData.libelle_long);
  }
};




let V = {
  rootPage: null,
  svgComplet: null,
  infoPanel: null,
  viewPanel: null
};

// change l'opacité pour un élément (avec level en paramétre)
V.applyPreviewOpacity = function(elementId, level) {
  let element = canvasState.svg.querySelector(`[id="${elementId}"]`);
  if (element) {
    let filtreElements = element.querySelectorAll('[id*="filtre"]'); // filtre du lien + filtre de compétence
    filtreElements.forEach(filtreElement => {
      Animation.setFilterOpacity(filtreElement, level, 0.3);
    });
  }
};

// opacité stocké dans le localstorage à partir de progressData 
// on reste en V mais on met un paramétre (progressData) que l'on copie pour ne pas modifier directement
V.applyFiltersOpacity = function(progressData = M.progressData) {
  const dataCopy = JSON.parse(JSON.stringify(progressData));
  for (let elementId in dataCopy) {
    let competenceElement = canvasState.svg.querySelector(`[id="${elementId}"]`);
    if (competenceElement) {
      let filtreElements = competenceElement.querySelectorAll('[id*="filtre"]');
      filtreElements.forEach(filtreElement => {
        let level = dataCopy[elementId] || 1;
        Animation.setFilterOpacity(filtreElement, level, 0);
      });
    }
  }
};

//début du drag
V.startDrag = function(ev) {
  let infoPanelElement = document.querySelector('.info-panel');
  let viewPanelElement = document.querySelector('.view-panel');
  
  if (infoPanelElement && infoPanelElement.contains(ev.target)) return;
  if (viewPanelElement && viewPanelElement.contains(ev.target)) return;
  
  canvasState.isDragging = true;
  canvasState.startX = ev.clientX;
  canvasState.startY = ev.clientY;
};

//drag en cours
V.moveDrag = function(ev) {
  if (!canvasState.isDragging || !canvasState.svg) return;
  
  let deltaX = ev.clientX - canvasState.startX;
  let deltaY = ev.clientY - canvasState.startY;
  
  Animation.moveCanvas(canvasState.svg, deltaX, deltaY);
  
  canvasState.startX = ev.clientX;
  canvasState.startY = ev.clientY;
};

//fin du drag
V.endDrag = function(ev) {
  canvasState.isDragging = false;
};

//zoom/dézoom
V.handleScroll = function(ev) {
  Animation.zoomCanvas(canvasState.svg, ev.deltaY, ev.clientX, ev.clientY);
};

V.init = function() {
  V.svgComplet = new SVGView();
  V.rootPage = htmlToDOM(template);
  V.infoPanel = InfoPanelView;
  V.viewPanel = ViewPanelView;
  
  const svgDom = V.svgComplet.dom();
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
    V.rootPage.addEventListener("mousedown", V.startDrag);
    V.rootPage.addEventListener("mousemove", V.moveDrag);
    V.rootPage.addEventListener("mouseup", V.endDrag);
    V.rootPage.addEventListener("wheel", V.handleScroll);
    

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
    
    V.svgComplet.init(V.rootPage);
    V.svgComplet.setCallbacks({
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