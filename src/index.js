import {
  Engine,
  Scene,
  Vector3,
  SceneLoader,
  ArcRotateCamera
} from "@babylonjs/core";
import * as BABYLON from "babylonjs";
import "@babylonjs/loaders/glTF/2.0";
import "@babylonjs/core/Helpers/sceneHelpers";
import firstscene from "./scenes/firstscene.js";
import secondscene from "./scenes/secondscene.js";
import testscene from "./scenes/testscene.js";
import thirdscene from "./scenes/thirdscene.js";

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
let currentScene = null;

// Fonction pour changer de scène
async function changeScene(newSceneFunction) {
    currentScene = await newSceneFunction(BABYLON, engine, currentScene);
}

// Initialisation
async function startGame() {
    // Charger la première scène
    await changeScene(firstscene);

    // Gestion des touches pour changer de scène
    window.addEventListener("keydown", async (event) => {
        if (event.key === "a") {
            await changeScene(firstscene);
        } else if (event.key === "z") {
            await changeScene(secondscene);
        } else if (event.key === "e") {
            await changeScene(testscene);
        } else if (event.key === "r") {
            await changeScene(thirdscene);
        }
    });

    // Lancer la boucle de rendu
    engine.runRenderLoop(() => {
        if (currentScene) {
            currentScene.render();
        }
    });

    // Redimensionner le moteur lorsque la fenêtre est redimensionnée
    window.addEventListener("resize", () => {
        engine.resize();
    });
}

startGame();
