import { SVGView } from "@/ui/svgTest/index.js";
import { htmlToDOM } from "@/lib/utils.js";
import { Animation } from "../../lib/animation";
import template from "./template.html?raw";

let C = {};

let canvasState = {
  isDragging: false,
  startX: 0,
  startY: 0,
  svg: null
};

C.init = function() {
  return V.init();
}

//test pour faire cligniotet les éléments
C.handler_click = function(ev) {
    const target = ev.target.closest('[id]');
    if (target && target.id.includes('filtre')) {
      Animation.ChangeOpacity(target, 0.5, 0);
    }
};

C.startDrag = function(ev) {
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

let V = {
  rootPage: null,
  svgTest: null
};

V.init = function() {
  V.svgTest = new SVGView();
  V.rootPage = htmlToDOM(template);
  let svgDom = V.svgTest.dom();
  V.rootPage.querySelector('slot[name="svg"]').replaceWith(svgDom);
  
  canvasState.svg = svgDom;
  Animation.initCanvas(svgDom);

  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  
  V.attachEvents();
  return V.rootPage;
};

V.attachEvents = function() {
    V.rootPage.addEventListener("click", C.handler_click);
    V.rootPage.addEventListener("mousedown", C.startDrag);
    V.rootPage.addEventListener("mousemove", C.moveDrag);
    V.rootPage.addEventListener("mouseup", C.endDrag);
    V.rootPage.addEventListener("wheel", C.handleScroll);
}

export function pageTest() {
  return C.init();
}