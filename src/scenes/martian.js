import martian_world from "../assets/martian_world.glb";

async function martian(BABYLON, engine, currentScene) {
    const { Vector3, Scene, FreeCamera, HemisphericLight } = BABYLON;

    const canvas = document.getElementById("renderCanvas");
    const scene = new Scene(engine);

    // Charger le fichier GLB
    BABYLON.SceneLoader.ImportMeshAsync("", "", martian_world, scene).then((result) => {
        const meshes = result.meshes;

        // Appliquer des couleurs saturées sur les matériaux des meshes
        if (Array.isArray(meshes)) {
            meshes.forEach((mesh) => {
                if (mesh.material && mesh.material.diffuseColor) {
                    // Saturer les couleurs des matériaux
                    mesh.material.diffuseColor = new BABYLON.Color3(1, 0.6, 0); // Orange plus saturé (Couleur de base)
                    mesh.material.specularColor = new BABYLON.Color3(1, 0.5, 0); // Reflet orange
                    mesh.material.emissiveColor = new BABYLON.Color3(1, 0.4, 0); // Lueur orange (émissif)                    
                }
            });
        } else {
            console.warn("Aucun mesh n'a été chargé ou 'meshes' est indéfini.");
        }
    });

    // Création d'une lumière hémisphérique forte
    const light = new HemisphericLight("hemisphericLight", new Vector3(0, 1, 0), scene);
    light.intensity = 2; // Lumière très intense
    light.diffuse = new BABYLON.Color3(1, 1, 1); // Couleur blanche diffuse (blanc pur)
    light.specular = new BABYLON.Color3(1, 1, 1); // Couleur blanche spéculaire
    light.groundColor = new BABYLON.Color3(0, 0, 0); // Couleur de l'environnement (noir)

    // Créer une caméra FreeCamera contrôlable avec ZQSD
    const freeCam = new FreeCamera("freeCamera", new Vector3(8.8, 13.5, -8.5), scene);
    freeCam.setTarget(new Vector3(-1.5, 0.5, 1)); // Utilisation de 'new' pour le Vector3
    freeCam.attachControl(canvas, true);
    freeCam.inertia = 0.5;
    freeCam.angularSensibility = 200; // Sensibilité de la caméra

    // Configurer les touches de mouvement
    freeCam.keysUp.push(90); // Z
    freeCam.keysDown.push(83); // S
    freeCam.keysLeft.push(81); // Q
    freeCam.keysRight.push(68); // D

    // Afficher les positions de la caméra
    scene.onBeforeRenderObservable.add(() => {
        console.log(`Position de la caméra: x=${freeCam.position.x}, y=${freeCam.position.y}, z=${freeCam.position.z}`);
    });

    // Activer la caméra FreeCamera
    scene.activeCamera = freeCam;

    // Supprimer l'ancienne scène
    if (currentScene) currentScene.dispose();

    return scene;
}

export default martian;
