import { TextBlock, StackPanel, AdvancedDynamicTexture, Image, Button, Rectangle, Control } from "@babylonjs/gui";
import { Scene, Mesh, Vector3 } from "@babylonjs/core";
import { Player } from "../mars/character/characterController";

export class GUIJournal {
    private _scene: Scene;
    private _uiTexture: AdvancedDynamicTexture;
    private _panel: Rectangle;
    private _image: Image;
    private _bookGrabDistance: number = 1;
    private _book: Mesh;
    private _player: Mesh;
    public journalOpen: boolean = false;

    constructor(scene: Scene, book: Mesh, player: Mesh) {
        this._scene = scene;
        this._book = book;
        this._player = player;

        // Créer une texture UI plein écran
        this._uiTexture = AdvancedDynamicTexture.CreateFullscreenUI("Journal");

        // Créer un panneau pour contenir les éléments de l'UI
        this._panel = new Rectangle();
        this._panel.width = "500px";  // Définir une largeur fixe
        this._panel.height = "600px"; // Définir une hauteur fixe
        this._panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this._panel.cornerRadius = 10;
        this._panel.color = "black"; // Couleur de la bordure
        this._panel.thickness = 4; // Épaisseur de la bordure
        this._panel.background = "transparent"; // Ou rgba(0,0,0,0)
        this._uiTexture.addControl(this._panel);

        // Créer l'image
        this._image = new Image("Feuille", "../../public/textures/Feuille.png");
        this._image.width = 0.95; // 95% de la largeur du panneau
        this._image.height = 0.95; // 95% de la hauteur du panneau
        this._image.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._image.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this._image.stretch = Image.STRETCH_UNIFORM; // Garder les proportions de l'image

        // Gestionnaire d'événements pour le chargement de l'image
        this._image.onImageLoadedObservable.add(() => {
            console.log("Image Feuille.png chargée avec succès.");
        });

        // Gestionnaire d'événements pour vérifier si l'image est chargée ou non
        this._image.onImageLoadedObservable.add(() => {
            console.log("Image Feuille.png chargée avec succès.");
        });

        // Vérification manuelle si l'image n'est pas chargée
        if (!this._image.isLoaded) {
            console.error("Erreur lors du chargement de l'image Feuille.png.");
        }

        this._panel.addControl(this._image);


        // Créer le bouton de fermeture
        const closeButton = Button.CreateSimpleButton("closeButton", "Fermer");
        closeButton.width = "120px"; //Taille du bouton
        closeButton.height = "40px";
        closeButton.color = "white";
        closeButton.background = "red";
        closeButton.cornerRadius = 10;
        closeButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        closeButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        closeButton.top = "-20px"; // Décaler un peu vers le haut
        this._panel.addControl(closeButton);

        // Ajouter la logique de fermeture
        closeButton.onPointerClickObservable.add(() => {
            this.hide();
        });

        // Masquer l'UI au départ
        this.hide();
    }

    // Méthode pour afficher l'UI
    public show(): void {
        this._panel.isVisible = true;
        this.journalOpen = true;
    }

    // Méthode pour masquer l'UI
    public hide(): void {
        this._panel.isVisible = false;
        this.journalOpen = false;
    }

    public update(bookParent: Mesh): void {
        if (!this._player || !bookParent) return;

        const distance = Vector3.Distance(this._player.getAbsolutePosition(), bookParent.getAbsolutePosition());

        if (distance <= this._bookGrabDistance && !this.journalOpen) {
            this.show();
        }
    }
    
    //Méthode pour fermer l'UI et la supprimer de la scène
    //A utiliser une fois qu'on sort du monde de mars !!
    public close(): void {
        this._uiTexture.dispose();
    }
}