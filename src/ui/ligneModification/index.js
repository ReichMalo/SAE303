import { genericRenderer } from "@/lib/utils.js";
import template from "./template.html?raw";

let LigneModificationView = {
  html: function(data) {
    let html = '';
    for (let i = data.length - 1; i >= 0; i--) {
      let mod = data[i];
      html += genericRenderer(template, {
        acCode: mod.acCode,
        date: mod.date,
        level: mod.level,
        time: mod.date + ' ' + new Date(mod.timestamp).toLocaleTimeString('fr-FR')
      });
    }
    return html;
  },

  dom: function(data) {
    let container = document.createElement('div');
    container.innerHTML = LigneModificationView.html(data);
    return container;
  }
};

export { LigneModificationView };
