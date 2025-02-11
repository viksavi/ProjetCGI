import isometric_bedroom from "../assets/isometric_bedroom.glb";

async function firstscene(BABYLON, engine, currentScene) {
    const { Vector3, Scene, MeshBuilder, FreeCamera, HemisphericLight, ArcRotateCamera, Tools } = BABYLON;

    const scene = new Scene(engine);

    try {
        // Charger le modèle isometric_bedroom
        await BABYLON.SceneLoader.ImportMeshAsync("", "../assets/", "isometric_bedroom.glb", scene);
        console.log("isometric_bedroom loaded successfully");
    } catch (error) {
        console.error("Error loading isometric_bedroom.glb:", error);
    }

    // Ajouter une lumière hémisphérique
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7; // Ajuster l'intensité de la lumière

    // Créer une caméra ArcRotate
    const canvas = document.getElementById("renderCanvas");
    const cam = new ArcRotateCamera("arcCamera", Tools.ToRadians(0), Tools.ToRadians(45), 10, new Vector3(0, 0, 0), scene);
    cam.attachControl(canvas, true);

    // Ajuster les limites (optionnel)
    cam.wheelPrecision = 50;
    cam.lowerRadiusLimit = 2;
    cam.upperRadiusLimit = 20;

    // Positionner la caméra pour voir la scène
    cam.setPosition(new Vector3(0, 5, -10)); // Ajustez ces valeurs pour la meilleure vue

    // Attendre que la scène soit prête
    console.log("Waiting for scene to be ready...");
    await scene.whenReadyAsync();
    console.log("Scene is ready!");

    // Supprimer l'ancienne scène
    if (currentScene) currentScene.dispose();

    return scene;
}

export default firstscene;