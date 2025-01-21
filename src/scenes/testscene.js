async function testscene(BABYLON, engine, currentScene) {
    const { Vector3, Scene, MeshBuilder, FreeCamera, HemisphericLight } = BABYLON;

    const scene = new Scene(engine);

    // Créer une boîte pour référence
    const box = MeshBuilder.CreateBox("box", { size: 1 }, scene);

    // Ajouter une lumière hémisphérique
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    // Créer une caméra ArcRotate
    const canvas = document.getElementById("renderCanvas");
    const cam = new BABYLON.ArcRotateCamera("arcCamera", BABYLON.Tools.ToRadians(0), BABYLON.Tools.ToRadians(45), 10, new Vector3(0,0,0), scene);
    cam.attachControl(canvas, true);

    // Ajuster les limites (optionnel)
    cam.wheelPrecision = 50;
    cam.lowerRadiusLimit = 2;
    cam.upperRadiusLimit = 20;

    // Attendre que la scène soit prête
    console.log("Waiting for scene to be ready...");
    await scene.whenReadyAsync();
    console.log("Scene is ready!");

    // Supprimer l'ancienne scène
    if (currentScene) currentScene.dispose();

    return scene;
}

export default testscene;
