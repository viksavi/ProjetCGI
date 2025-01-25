import martian_world from "../assets/martian_world.glb";

async function martian(BABYLON, engine, currentScene) {
    const { Vector3, Scene, MeshBuilder, FreeCamera, HemisphericLight } = BABYLON;

    const canvas = document.getElementById("renderCanvas");
    const scene = new Scene(engine);

    BABYLON.SceneLoader.ImportMeshAsync("", martian_world, null, scene);

    // Ajouter une lumière hémisphérique pour une lumière atmosphérique douce mais puissante
    const light = new HemisphericLight("hemisphericLight", new Vector3(0, 1, 0), scene);
    light.intensity = 1.5; // Ajuster l'intensité pour qu'elle soit assez puissante mais douce


    // Créer une caméra FreeCamera contrôlable avec ZQSD
    const freeCam = new FreeCamera("freeCamera", new Vector3(0, 1, -10), scene);
    freeCam.setTarget(Vector3.Zero());
    freeCam.attachControl(canvas, true);
    freeCam.inertia = 0.8;
    freeCam.angularSensibility = 500; // Sensibilité de la caméra

    // Configurer les touches de mouvement
    freeCam.keysUp.push(90); // Z
    freeCam.keysDown.push(83); // S
    freeCam.keysLeft.push(81); // Q
    freeCam.keysRight.push(68); // D

    // Activer la caméra FreeCamera
    scene.activeCamera = freeCam;

    // Attendre que la scène soit prête
    console.log("Waiting for scene to be ready...");
    await scene.whenReadyAsync();
    console.log("Scene is ready!");

    // Supprimer l'ancienne scène
    if (currentScene) currentScene.dispose();

    return scene;
}

export default martian;
