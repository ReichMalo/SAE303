import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";

let C = {};

C.init = function() {
  return V.init();
};

let V = {
  rootPage: null
};

V.init = function() {
  V.rootPage = htmlToDOM(template);
  return V.rootPage;
};

export function PageAccueil() {
  return C.init();
}
