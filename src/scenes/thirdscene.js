import abandoned_water_canal from "../assets/abandoned_water_canal.glb";

async function testscene(BABYLON, engine, currentScene) {
    const { Vector3, Scene, MeshBuilder, FreeCamera, HemisphericLight } = BABYLON;

    const scene = new Scene(engine);

    BABYLON.SceneLoader.ImportMeshAsync("", abandoned_water_canal, null, scene);

    // Ajouter une lumière hémisphérique
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    // Créer une caméra ArcRotate
    const canvas = document.getElementById("renderCanvas");
    const cam = new BABYLON.ArcRotateCamera("arcCamera", BABYLON.Tools.ToRadians(0), BABYLON.Tools.ToRadians(45), 10, new Vector3(0,0,0), scene);
    cam.inertia = 0.8;
    cam.attachControl(canvas, true);

    // Ajuster les limites (optionnel)
    cam.wheelPrecision = 50;
    cam.lowerRadiusLimit = 2;
    cam.upperRadiusLimit = 20;

    scene.registerBeforeRender(() => {
        // Paramètres du cône
        const coneAngle = Math.PI / 12; // Angle du cône
        const coneCos = Math.cos(coneAngle); // Pré-calcul du cosinus de l'angle
        const coneDirection = cam.getForwardRay().direction.normalize(); // Direction du cône, basée sur la caméra
        const maxDistance = cam.position.subtract(new BABYLON.Vector3(0, 0, 0)).length(); // Distance max (jusqu'au centre)
        const tolerance = 0.01; // Tolérance pour la limite du cône
    
        // Vérifier les collisions avec les murs
        scene.meshes.forEach(mesh => {
            if (mesh.name.includes("wall")) { // Assurez-vous que le nom du mesh contient "wall"
                const wallCenter = mesh.getBoundingInfo().boundingBox.centerWorld; // Centre du mur
                const directionToWall = wallCenter.subtract(cam.position).normalize(); // Direction vers le mur
                const distanceToWall = wallCenter.subtract(cam.position).length(); // Distance au mur
                const dot = BABYLON.Vector3.Dot(coneDirection, directionToWall);
    
                // Si le mur est dans le cône et à une distance inférieure ou égale au centre
                if (dot >= coneCos - tolerance && distanceToWall <= maxDistance) {
                    mesh.visibility = 0.1; // Rendre transparent
                    if (mesh.material) {
                        mesh.material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
                    }
                } else {
                    mesh.visibility = 1; // Rendre visible
                }
            }
        });
    });
    

    // Attendre que la scène soit prête
    console.log("Waiting for scene to be ready...");
    await scene.whenReadyAsync();
    console.log("Scene is ready!");

    // Supprimer l'ancienne scène
    if (currentScene) currentScene.dispose();

    return scene;
}

export default testscene;
