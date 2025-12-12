import { gsap } from "gsap";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";
gsap.registerPlugin(DrawSVGPlugin);

let Animation = {};

Animation.rotateElement = function (element, duration = 1) {
  gsap.to(element, {
    rotation: "+=360",
    transformOrigin: "50% 50%",
    repeat: -1,
    ease: "linear",
    duration: duration,
  });
};

Animation.colorTransition = function (
  element,
  fromColor,
  toColor,
  duration = 1,
) {
  gsap.fromTo(
    element,
    { fill: fromColor },
    {
      fill: toColor,
      duration: duration,
      repeat: -1,
      yoyo: true,
      ease: "linear",
    },
  );
};

Animation.stretchElement = function (
  element,
  direction = "x",
  scale = 2,
  duration = 1,
) {
  const props = direction === "x" ? { scaleX: scale } : { scaleY: scale };
  gsap.to(element, {
    ...props,
    duration: duration,
    yoyo: true,
    repeat: -1,
    ease: "power1.inOut",
    transformOrigin: "50% 50%",
  });
};

Animation.drawLine = function (paths, fills, duration = 1) {
  gsap
    .timeline()
    .from(paths, {
      drawSVG: 0,
      duration: duration,
      ease: "power1.inOut",
      stagger: 0.1,
    })
    .from(
      fills,
      {
        opacity: 0,
        scale: 1.5,
        transformOrigin: "center center",
        duration: 0.8,
        ease: "elastic.out(2, 0.3)",
      },
      "-=1",
    );
};

Animation.bounce = function (element, duration = 1, height = 100) {
  gsap.to(element, {
    y: -height,
    duration: duration / 2,
    ease: "power1.out",
    yoyo: true,
    repeat: 1,
    transformOrigin: "50% 100%",
  });
};

Animation.ChangeOpacity = function (element, duration = 1, opacity) {
  gsap.to(element, {
    opacity: opacity,
    duration: duration,
    yoyo: true,
    repeat: -1,
    ease: "power1.inOut",
  });
};

Animation.initCanvas = function (element, zoomDuration = 0.5) {
  gsap.to(element, {
    scale: 1.5,
    duration: zoomDuration,
    ease: "power2.out",
    transformOrigin: "center center"
  });
};

Animation.moveCanvas = function (element, deltaX, deltaY) {
  let current = gsap.getProperty(element, "x") || 0;
  let currentY = gsap.getProperty(element, "y") || 0;
  
  gsap.to(element, {
    x: current + deltaX,
    y: currentY + deltaY,
    duration: 0.05,
    overwrite: 'auto'
  });
};

Animation.zoomCanvas = function (element, delta, mouseX, mouseY, minScale = 0.6, maxScale = 3) {
  let currentScale = gsap.getProperty(element, "scale") || 1;
  let zoomFactor = 1.25;
  
  let newScale;
  if (delta > 0) {
    newScale = currentScale / zoomFactor;
  } else {
    newScale = currentScale * zoomFactor;
  }
  
  //mettre les limite
  newScale = Math.max(minScale, Math.min(newScale, maxScale));
  
  let scaleRatio = newScale / currentScale;
  let currentX = gsap.getProperty(element, "x") || 0;
  let currentY = gsap.getProperty(element, "y") || 0;
  
  let newX = mouseX - (mouseX - currentX) * scaleRatio;
  let newY = mouseY - (mouseY - currentY) * scaleRatio;
  
  gsap.to(element, {
    scale: newScale,
    x: newX,
    y: newY,
    duration: 0.2,
    ease: "power2.out",
    transformOrigin: "0 0",
    overwrite: 'auto'
  });
};

export { Animation };
