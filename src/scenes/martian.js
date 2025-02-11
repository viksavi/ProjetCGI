import martian_world from "../assets/martian_world.glb";
import "@babylonjs/loaders/glTF";

async function martian(BABYLON, engine, currentScene, changeSceneCallback) {
  const {
    Vector3,
    Scene,
    FreeCamera,
    DirectionalLight,
    Color3,
    MeshBuilder,
    StandardMaterial,
    HemisphericLight,
    Color4,
  } = BABYLON;

  const canvas = document.getElementById("renderCanvas");
  const scene = new Scene(engine);

  // Couleur d'arrière-plan
  scene.clearColor = new Color4(0.1, 0.1, 0.1, 1);

  // Chargement du fichier GLB
  await BABYLON.SceneLoader.ImportMeshAsync("", "", martian_world, scene);

  // Création d'une lumière directionnelle
  const lightPosition = new Vector3(-12, 13.5, -8.5);
  const directionalLight = new DirectionalLight(
    "directionalLight",
    Vector3.Normalize(new Vector3(0, 0, 0).subtract(lightPosition)),
    scene
  );
  directionalLight.position = lightPosition;
  directionalLight.diffuse = new Color3(1, 1, 1);
  directionalLight.specular = new Color3(1, 1, 1);
  directionalLight.intensity = 1.5;

  // Lumière hémisphérique pour l'ambiance
  const hemisphericLight = new HemisphericLight("HemiLight", new Vector3(0, 1, 0), scene);
  hemisphericLight.intensity = 0.5;

  // Éclairage ambiant global
  scene.ambientColor = new Color3(0.2, 0.2, 0.2);

  // Création d'une caméra FreeCamera contrôlable
  const freeCam = new FreeCamera("freeCamera", new Vector3(8.8, 11, -9), scene);
  freeCam.setTarget(new Vector3(-1.5, 0.5, 1));
  freeCam.attachControl(canvas, true);
  freeCam.inertia = 0.5;
  freeCam.angularSensibility = 200;

  // Configuration des touches pour le mouvement (ZQSD)
  freeCam.keysUp.push(90);    // Z
  freeCam.keysDown.push(83);  // S
  freeCam.keysLeft.push(81);  // Q
  freeCam.keysRight.push(68); // D

  scene.activeCamera = freeCam;

  // Si une scène existait déjà, on la supprime
  if (currentScene) currentScene.dispose();

  // Création de la skybox avec SkyMaterial
  const skyMaterial = new SkyMaterial("skyMaterial", scene);
  skyMaterial.backFaceCulling = false;

  // Création d'une sphère pour la skybox
  const skybox = MeshBuilder.CreateSphere("skybox", { diameter: 2000, segments: 32 }, scene);
  skybox.material = skyMaterial;
  skybox.isPickable = false;
  skybox.rotation.y += Math.PI;

  // Alignement du soleil dans le skyMaterial avec la direction de la lumière
  skyMaterial.sunPosition = directionalLight.direction.scale(-1000);

  // Réglages du SkyMaterial pour l'ambiance
  skyMaterial.turbidity = 1;
  skyMaterial.luminance = 0.8;
  skyMaterial.inclination = 0.0;
  skyMaterial.azimuth = 0.25;

  // Faire suivre la skybox à la caméra
  scene.onBeforeRenderObservable.add(() => {
    skybox.position = scene.activeCamera.position;
  });

  return scene;
}

export default martian;
