import { TextBlock, StackPanel, AdvancedDynamicTexture, Image, Button, Rectangle, Control } from "@babylonjs/gui";
import { Scene, Mesh, Vector3 } from "@babylonjs/core";
import { Player } from "../mars/character/characterController";

/**
 * Gère l’interface utilisateur du journal visible lorsqu'on approche d’un livre dans la scène.
 */
export class GUIJournal {
    /** Scène Babylon.js */
    private _scene: Scene;

    /** UI plein écran Babylon.js */
    private _uiTexture: AdvancedDynamicTexture;

    /** Conteneur rectangulaire du journal */
    private _panel: Rectangle;

    /** Image affichée comme contenu du journal */
    private _image: Image;

    /** Distance minimale pour afficher automatiquement le journal */
    private _bookGrabDistance: number = 1;

    /** Référence au mesh du livre */
    private _book: Mesh;

    /** Mesh du joueur */
    private _player: Mesh;

    /** Indique si le journal est actuellement ouvert */
    public journalOpen: boolean = false;

    /** Indique si le joueur a fermé manuellement le journal */
    private _isManuallyClosed: boolean = false;

    /**
     * Crée une nouvelle interface de journal.
     * @param scene - Scène Babylon.js
     * @param book - Mesh représentant le livre
     * @param player - Mesh du joueur
     */
    constructor(scene: Scene, book: Mesh, player: Mesh) {
        this._scene = scene;
        this._book = book;
        this._player = player;
        this._uiTexture = AdvancedDynamicTexture.CreateFullscreenUI("Journal");

        this._panel = new Rectangle();
        this._panel.height = "95%";
        this._panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this._panel.thickness = 0;
        this._panel.background = "transparent";
        this._panel.isVisible = false;
        this._uiTexture.addControl(this._panel);

        this._image = new Image("Feuille", "../../textures/Feuille.png");
        this._image.height = "95%";
        this._image.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._image.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this._image.stretch = Image.STRETCH_UNIFORM;

        this._panel.addControl(this._image);

        const closeButton = Button.CreateSimpleButton("closeButton", "Fermer");
        closeButton.width = "100px";
        closeButton.height = "40px";
        closeButton.color = "rgb(104, 90, 68)";
        closeButton.background = "transparent";
        closeButton.thickness = 0;
        closeButton.top = "40%";
        closeButton.fontStyle = "EB Garamond";
        closeButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._panel.addControl(closeButton);

        closeButton.onPointerClickObservable.add(() => {
            this.hide();
        });
    }

    /**
     * Affiche le journal à l'écran.
     */
    public show(): void {
        if (!this.journalOpen) { 
            this._panel.isVisible = true;
            this.journalOpen = true;
            this._isManuallyClosed = false;
        }
    }

    /**
     * Cache le journal et empêche sa réouverture automatique tant que le joueur ne s’éloigne pas.
     */
    public hide(): void {
        if (this.journalOpen) {
            this._panel.isVisible = false;
            this.journalOpen = false;
            this._isManuallyClosed = true;
        }
    }

    /**
     * Met à jour la logique d’affichage automatique du journal en fonction de la distance au livre.
     * @param bookParent - Mesh représentant le livre
     */
    public update(bookParent: Mesh): void {
        if (!this._player || !bookParent) return;
    
        const distance = Vector3.Distance(this._player.getAbsolutePosition(), bookParent.getAbsolutePosition());

        if (distance <= this._bookGrabDistance && !this._isManuallyClosed) {
            this.show();
        } 

        if (distance > this._bookGrabDistance && !this.journalOpen) {
            this._isManuallyClosed = false;
        }
    }

    /**
     * Ferme le journal et détruit son interface.
     */
    public close(): void {
        this.hide();
        this._uiTexture.dispose();
    }
}
