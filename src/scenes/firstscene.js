async function firstscene(BABYLON, engine, currentScene) {
    const { Scene, Vector3, MeshBuilder, HemisphericLight, StandardMaterial } = BABYLON;

    const scene = new Scene(engine);

    // Créer les axes X, Y et Z
    function createAxes(scene) {
        const { Vector3, LinesMesh } = BABYLON;

        // Créer des points pour chaque ligne (commençant à l'origine)
        const xAxisPoints = [new Vector3(-1000, 0, 0), new Vector3(1000, 0, 0)];  // Axe X (rouge)
        const yAxisPoints = [new Vector3(0, -1000, 0), new Vector3(0, 1000, 0)];  // Axe Y (jaune)
        const zAxisPoints = [new Vector3(0, 0, -1000), new Vector3(0, 0, 1000)];  // Axe Z (bleu)

        // Créer les lignes pour chaque axe
        const xAxis = BABYLON.MeshBuilder.CreateLines("xAxis", { points: xAxisPoints }, scene);
        const yAxis = BABYLON.MeshBuilder.CreateLines("yAxis", { points: yAxisPoints }, scene);
        const zAxis = BABYLON.MeshBuilder.CreateLines("zAxis", { points: zAxisPoints }, scene);

        // Colorier les axes en utilisant la propriété `color`
        xAxis.color = new BABYLON.Color3(1, 0, 0);  // Rouge pour l'axe X
        yAxis.color = new BABYLON.Color3(1, 1, 0);  // Jaune pour l'axe Y
        zAxis.color = new BABYLON.Color3(0, 0, 1);  // Bleu pour l'axe Z

        // Optionnel : faire en sorte que les lignes soient toujours visibles
        xAxis.isPickable = false;
        yAxis.isPickable = false;
        zAxis.isPickable = false;
    }
    createAxes(scene);

    // Créer une boîte pour référence
    const box = MeshBuilder.CreateBox("box", { size: 1.5 }, scene);

    // Créer des murs
    const wall1 = BABYLON.MeshBuilder.CreateBox("wall1", { width: 5, height: 3, depth: 0.1 }, scene);
    wall1.position.z = -2.5;
    const wall2 = BABYLON.MeshBuilder.CreateBox("wall2", { width: 5, height: 3, depth: 0.1 }, scene);
    wall2.position.z = 2.5;
    const wall3 = BABYLON.MeshBuilder.CreateBox("wall3", { width: 0.1, height: 3, depth: 5.1 }, scene);
    wall3.position.x = -2.5;
    const wall4 = BABYLON.MeshBuilder.CreateBox("wall4", { width: 0.1, height: 3, depth: 5.1 }, scene);
    wall4.position.x = 2.5;

    // Créer un sol
    const ground = MeshBuilder.CreateBox("ground", { width: 5, height: 0.1, depth: 5 }, scene);
    ground.position.y = -1.45;

    // Ajouter une lumière hémisphérique
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(5, 10, 5), scene);
    light.diffuse = new BABYLON.Color3(1, 1, 1);  // Lumière diffuse (blanche)

    // Créer une caméra ArcRotate
    const canvas = document.getElementById("renderCanvas");
    const cam = new BABYLON.ArcRotateCamera("arcCamera", BABYLON.Tools.ToRadians(0), BABYLON.Tools.ToRadians(45), 10, box.position, scene);
    cam.inertia = 0.8;
    cam.attachControl(canvas, true);

    const walls = [wall1, wall2, wall3, wall4];
    scene.registerBeforeRender(() => {
        // Paramètres du cône
        const coneAngle = Math.PI / 12; // Angle du cône
        const coneCos = Math.cos(coneAngle); // Pré-calcul du cosinus de l'angle
        const coneDirection = cam.getForwardRay().direction; // Direction du cône, basée sur la caméra
        const maxDistance = cam.position.subtract(new BABYLON.Vector3(0, 0, 0)).length(); // Distance max (jusqu'au centre)
    
        // Vérifier les collisions avec les murs
        walls.forEach(wall => {
            // Calculer la direction vers le mur
            const directionToWall = wall.position.subtract(cam.position).normalize();
            const distanceToWall = wall.position.subtract(cam.position).length();
            const dot = BABYLON.Vector3.Dot(coneDirection, directionToWall);
    
            // Si le mur est dans le cône et à une distance inférieure ou égale au centre
            if (dot >= coneCos && distanceToWall <= maxDistance) {
                wall.visibility = 0.1; // Rendre transparent
            } else {
                wall.visibility = 1; // Rendre visible
            }
        });
    });
    
    
    
    
    // Supprimer l'ancienne scène
    if (currentScene) currentScene.dispose();

    return scene;
}

export default firstscene;
