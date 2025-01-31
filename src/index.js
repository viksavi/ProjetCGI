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
  import testscene from "./scenes/testscene.js";
  import martian from "./scenes/martian.js";
  
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true);
  let currentScene = null;
  
  // Fonction pour changer de scène
  async function changeScene(newSceneFunction) {
    if (currentScene) {
        currentScene.dispose();
        currentScene = null; // Libérer la référence de la scène
    }
  
    try {
        currentScene = await newSceneFunction(BABYLON, engine, currentScene, () => changeScene(firstscene));
        if(currentScene) {
            engine.runRenderLoop(() => {
                if(currentScene) currentScene.render();
            });
        }
    } catch(error) {
        console.error("Error loading scene:", error);
    }
  }
  
  // Initialisation
  async function startGame() {
      // Charger la première scène
      await changeScene(firstscene);
  
      // Gestion des touches pour changer de scène
      window.addEventListener("keydown", async (event) => {
          if (event.key === "1") {
              await changeScene(firstscene);
          } else if (event.key === "2") {
              await changeScene(testscene);
          } else if (event.key === "3") {
              await changeScene(martian);
          }
      });
  
      // Redimensionner le moteur lorsque la fenêtre est redimensionnée
      window.addEventListener("resize", () => {
          engine.resize();
      });
  }
  
  startGame();