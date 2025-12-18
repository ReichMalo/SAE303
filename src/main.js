import "./global.css";
import { Router } from "./lib/router.js";
import { RootLayout } from "./layouts/root/layout.js";
import { The404Page } from "./pages/404/page.js";
import { pageSvg } from "./pages/PageSvg/page.js";
import { PageHistoriqueViz } from "./pages/PageHistoriqueViz/page.js";

// Exemple d'utilisation avec authentification

const router = new Router("app");

router.addLayout("/", RootLayout);
router.addRoute("/", pageSvg);
router.addRoute("/PageSvg", pageSvg);
router.addRoute("/historique", PageHistoriqueViz);


router.addRoute("*", The404Page);

// Démarrer le routeur
router.start();
