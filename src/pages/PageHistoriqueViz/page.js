import { LigneModificationView } from "@/ui/ligneModification/index.js";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";

let M = {
  modifications: [],
  filteredModifications: []
};

let C = {};

C.loadHistorique = function() {
  let historiqueData = JSON.parse(localStorage.getItem('historiqueData')) || { modifications: [] };
  M.modifications = historiqueData.modifications;
  M.filteredModifications = historiqueData.modifications;
};

C.getUniqueCodes = function() {
  let codes = [];
  for (let i = 0; i < M.modifications.length; i++) {
    let code = M.modifications[i].acCode;
    if (codes.indexOf(code) === -1) {
      codes.push(code);
    }
  }
  codes.sort();
  return codes;
};

C.filterByCode = function(acCode) {
  if (!acCode) {
    M.filteredModifications = M.modifications;
  } else {
    M.filteredModifications = [];
    for (let i = 0; i < M.modifications.length; i++) {
      if (M.modifications[i].acCode === acCode) {
        M.filteredModifications.push(M.modifications[i]);
      }
    }
  }
  V.updateList();
};

C.init = function() {
  C.loadHistorique();
  return V.init();
};

let V = {
  rootPage: null,
  select: null,
  listContainer: null
};

V.init = function() {
  V.rootPage = htmlToDOM(template);
  V.select = V.rootPage.querySelector('#acFilter');
  V.listContainer = V.rootPage.querySelector('[name="modifications"]');
  
  V.populateSelect();
  V.updateList();
  V.attachEvents();
  
  return V.rootPage;
};

V.populateSelect = function() {
  let codes = C.getUniqueCodes();
  for (let i = 0; i < codes.length; i++) {
    let code = codes[i];
    let option = document.createElement('option');
    option.value = code;
    option.textContent = code;
    V.select.appendChild(option);
  }
};

V.updateList = function() {
  if (M.filteredModifications.length === 0) {
    V.listContainer.innerHTML = '<div style="text-align: center; padding: 2rem; color: #9ca3af;">Aucune modification.</div>';
  } else {
    let lignesDom = LigneModificationView.dom(M.filteredModifications);
    V.listContainer.innerHTML = '';
    V.listContainer.appendChild(lignesDom);
  }
};

V.attachEvents = function() {
  V.select.addEventListener('change', (e) => {
    C.filterByCode(e.target.value);
  });
};

export function PageHistoriqueViz(params) {
  return C.init();
}
