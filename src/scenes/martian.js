import martian_world from "../assets/martian_world.glb";

async function martian(BABYLON, engine, currentScene, changeSceneCallback) {
    const { Vector3, Scene, FreeCamera, DirectionalLight, ShadowGenerator, Color3, MeshBuilder, StandardMaterial } = BABYLON;

    const canvas = document.getElementById("renderCanvas");
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

    // Charger le fichier GLB
    BABYLON.SceneLoader.ImportMeshAsync("", "", martian_world, scene).then((result) => {
        const meshes = result.meshes;

        // Appliquer des couleurs saturées sur les matériaux des meshes
        if (Array.isArray(meshes)) {
            meshes.forEach((mesh) => {
                if (mesh.material && mesh.material.diffuseColor) {
                    // Saturer les couleurs des matériaux
                    mesh.material.diffuseColor = new Color3(1, 0.6, 0); // Orange plus saturé (Couleur de base)
                    mesh.material.specularColor = new Color3(1, 0.5, 0); // Reflet orange
                    mesh.material.emissiveColor = new Color3(1, 0.4, 0); // Lueur orange (émissif)                    
                }
                mesh.receiveShadows = true; // Permettre au mesh de recevoir les ombres
            });
        } else {
            console.warn("Aucun mesh n'a été chargé ou 'meshes' est indéfini.");
        }
    });

    // Création de la sphère à l'endroit de la lumière (optionnelle, juste pour visualiser la lumière)
    const lightSphere = MeshBuilder.CreateSphere("lightSphere", { diameter: 0.5 }, scene);
    lightSphere.position = new Vector3(12, 13.5, -8.5); // Position de la lumière

    // Création d'une lumière directionnelle venant du haut et de la gauche
    const directionalLight = new DirectionalLight("directionalLight", new Vector3(-12, -13.5, 8.5), scene); // La lumière pointe vers le centre
    directionalLight.diffuse = new Color3(1, 1, 1); // Couleur blanche diffuse
    directionalLight.specular = new Color3(1, 1, 1); // Couleur blanche spéculaire
    directionalLight.intensity = 1; // Intensité de la lumière, ajustable selon le besoin

    // Activer les ombres pour la lumière directionnelle
    directionalLight.castShadows = true;

    // Créer un générateur d'ombres pour la scène
    const shadowGenerator = new ShadowGenerator(1024, directionalLight); // 1024 est la résolution des ombres (plus grand = meilleure qualité mais plus lourd)

    // Configurer les objets pour qu'ils reçoivent et génèrent des ombres
    scene.meshes.forEach((mesh) => {
        // Si le mesh doit générer des ombres (ex. le sol)
        if (mesh !== lightSphere) { // Assurez-vous de ne pas appliquer de ombres sur la sphère lumineuse
            mesh.receiveShadows = true; // Les objets reçoivent des ombres
        }
        // Si le mesh doit projeter des ombres (ex. un objet placé sur le sol)
        mesh.castShadows = true; // Les objets génèrent des ombres
    });

    // Optionnel : ajuster la taille des ombres si nécessaire
    shadowGenerator.getShadowMap().refreshRate = 1; // Contrôle la fréquence de rafraîchissement des ombres


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

    /*
    // Afficher les positions de la caméra
     scene.onBeforeRenderObservable.add(() => {
        console.log(`Position de la caméra: x=${freeCam.position.x}, y=${freeCam.position.y}, z=${freeCam.position.z}`);
    });

    // Afficher les positions de la caméra
    scene.onBeforeRenderObservable.add(() => {
        console.log(`Position de la caméra: x=${freeCam.position.x}, y=${freeCam.position.y}, z=${freeCam.position.z}`);
    });
    */

    // Activer la caméra FreeCamera
    scene.activeCamera = freeCam;

      // Création du cadre
      const frame = MeshBuilder.CreatePlane("frame", { width: 2, height: 1, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, scene);
      frame.position = new Vector3(0, 1, 3);
    
      const frameMaterial = new StandardMaterial("frameMaterial", scene);
      frameMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5); // Couleur grise pour le cadre
      frame.material = frameMaterial;
    
       // Ajout d'un texte au cadre
      const frameText = BABYLON.MeshBuilder.CreatePlane("frameText", { width: 1.8, height: 0.5 }, scene);
      frameText.position = new Vector3(0, 1, 3.01); 
    
      const textTexture = new BABYLON.DynamicTexture("textTexture", { width: 512, height: 256 }, scene);
      const textContext = textTexture.getContext();
      textContext.font = "bold 36px Arial";
      textContext.fillStyle = "white";
      textContext.textAlign = "center";
      textContext.textBaseline = "middle";
      textContext.fillText("Changer de scène", textTexture.getSize().width / 2, textTexture.getSize().height / 2);
      textTexture.update();
    
      const textMaterial = new BABYLON.StandardMaterial("textMaterial", scene);
      textMaterial.diffuseTexture = textTexture;
      textMaterial.emissiveColor = new Color3(1, 1, 1) // Couleur du texte
      frameText.material = textMaterial;
    
      // Clic sur le cadre
    frame.actionManager = new BABYLON.ActionManager(scene);
    frame.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPickTrigger,
        () => {
          if(changeSceneCallback) changeSceneCallback();
        }
      )
    );

    // Supprimer l'ancienne scène
    if (currentScene) currentScene.dispose();

    return scene;
}

export default martian;