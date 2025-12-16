import { htmlToDOM  } from "../../lib/utils.js";
import template from "./template.html?raw";

// EditionButtonView est un composant statique
// on ne fait que charger le template HTML
// en donnant la possibilité de l'avoir sous forme html ou bien de dom
let EditionButtonView = {
  html: function () {
    return template;
  },

  dom: function () {
    return htmlToDOM(template);
  }
};

export { EditionButtonView };
