import { Scene, Mesh, Vector3, Color3, TransformNode, SceneLoader, FreeCamera, ParticleSystem, Color4, AnimationGroup, MeshBuilder, HemisphericLight, DirectionalLight, ShadowGenerator } from "@babylonjs/core";

export class EnvironmentScene0 {
    private _scene: Scene;
    public assets;

    constructor(scene: Scene) {
        this._scene = scene;
    }

    public async load(): Promise<void> {
        await this.createMartianEnvironment(this._scene);
    }

    // Метод создает сцену
    private async createMartianEnvironment(scene: Scene) {

        // Créer les axes X, Y et Z
        function createAxes(scene: Scene) {

            // Créer des points pour chaque ligne (commençant à l'origine)
            const xAxisPoints = [new Vector3(-1000, 0, 0), new Vector3(1000, 0, 0)];  // Axe X (rouge)
            const yAxisPoints = [new Vector3(0, -1000, 0), new Vector3(0, 1000, 0)];  // Axe Y (jaune)
            const zAxisPoints = [new Vector3(0, 0, -1000), new Vector3(0, 0, 1000)];  // Axe Z (bleu)

            // Créer les lignes pour chaque axe
            const xAxis = MeshBuilder.CreateLines("xAxis", { points: xAxisPoints }, scene);
            const yAxis = MeshBuilder.CreateLines("yAxis", { points: yAxisPoints }, scene);
            const zAxis = MeshBuilder.CreateLines("zAxis", { points: zAxisPoints }, scene);

            // Colorier les axes en utilisant la propriété `color`
            xAxis.color = new Color3(1, 0, 0);  // Rouge pour l'axe X
            yAxis.color = new Color3(1, 1, 0);  // Jaune pour l'axe Y
            zAxis.color = new Color3(0, 0, 1);  // Bleu pour l'axe Z

            // Optionnel : faire en sorte que les lignes soient toujours visibles
            xAxis.isPickable = false;
            yAxis.isPickable = false;
            zAxis.isPickable = false;
        }
        createAxes(scene);

        try {
            const result = await SceneLoader.ImportMeshAsync("", "/", "martian_world.glb", scene);

            // Применяем цвета
            result.meshes.forEach((mesh) => {
                /*if (mesh.material && mesh.material.diffuseColor) {
                    // Saturer les couleurs des matériaux
                    mesh.material.diffuseColor = new Color3(1, 0.6, 0); // Orange plus saturé (Couleur de base)
                    mesh.material.specularColor = new Color3(1, 0.5, 0); // Reflet orange
                    mesh.material.emissiveColor = new Color3(1, 0.4, 0); // Lueur orange (émissif)
                }*/
                mesh.receiveShadows = true; // Permettre au mesh de recevoir les ombres
            });
        } catch (error) {
            console.error("Error loading martian_world.glb:", error);
        }
            //temporary light to light the entire scene
            var light0 = new HemisphericLight("HemiLight", new Vector3(0, 1, 0), scene);
        // Création de la sphère à l'endroit de la lumière (optionnelle, juste pour visualiser la lumière)
        const lightSphere = MeshBuilder.CreateSphere("lightSphere", { diameter: 0.5 }, scene);
        lightSphere.position = new Vector3(12, 13.5, -8.5); // Position de la lumière

        // Création d'une lumière directionnelle venant du haut et de la gauche
        const directionalLight = new DirectionalLight("directionalLight", new Vector3(-12, -13.5, 8.5), scene); // La lumière pointe vers le centre
        directionalLight.diffuse = new Color3(1, 1, 1); // Couleur blanche diffuse
        directionalLight.specular = new Color3(1, 1, 1); // Couleur blanche spéculaire
        directionalLight.intensity = 1; // Intensité de la lumière, ajustable selon le besoin

        // Activer les ombres pour la lumière directionnelle
       // directionalLight.castShadows = true;

        // Créer генератор d'ombres pour la scène
        const shadowGenerator = new ShadowGenerator(1024, directionalLight); // 1024 est la résolution des ombres (plus grand = meilleure qualité mais plus lourd)

        // Configurer les objets pour qu'ils reçoivent et génèrent des ombres
        scene.meshes.forEach((mesh) => {
            // Si le mesh doit générer des ombres (ex. le sol)
            if (mesh !== lightSphere) { // Assurez-vous de ne pas appliquer de ombres sur la sphère lumineuse
                mesh.receiveShadows = true; // Les objets reçoivent des ombres
            }
            // Si le mesh doit projeter des ombres (ex. un objet placé sur le sol)
           // mesh.castShadows = true; // Les objets génèrent des ombres
        });

        // Optionnel : ajuster la taille des ombres si nécessaire
        shadowGenerator.getShadowMap().refreshRate = 1; // Contrôle la fréquence de rafraîchissement des ombres


    }
}