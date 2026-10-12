
import "./style.css";

import { Application, Assets, Sprite, Texture } from "pixi.js";
import { createActor } from "xstate";
import { mascotMachine } from "./mascotMachine";

async function main() {
    // Initialize PixiJS
    const app = new Application();

    // PixiJS requires async initialization
    await app.init({
        width: 400,
        height: 300,
        backgroundColor: 0x292c32,
    });

    document.querySelector<HTMLDivElement>("#mascot")!
        .appendChild(app.canvas);

    // Load both assets once
    const idleTexture = await Assets.load<Texture>(
        "/assets/idle.png"
    );

    const happyTexture = await Assets.load<Texture>(
        "/assets/happy.png"
    );

    // Create a single sprite
    const mascot = new Sprite(idleTexture);

    mascot.anchor.set(0.5);
    mascot.position.set(200, 150);
    mascot.scale.set(3);

    // Preserve crisp pixel art
    idleTexture.source.scaleMode = "nearest";
    happyTexture.source.scaleMode = "nearest";

    app.stage.addChild(mascot);

    // Create XState actor
    const actor = createActor(mascotMachine);

    const status = document.querySelector("#status")!;

    // React to state changes
    function updateMascot(state: string) {
        status.textContent = `Current state: ${state}`;

        switch (state) {
            case "idle":
                mascot.texture = idleTexture;
                break;

            case "happy":
                mascot.texture = happyTexture;
                break;
        }
    }

    // IMPORTANT EXPOSES AND SUBSCRIBES TO CHANGES
    actor.subscribe((snapshot) => {
        updateMascot(String(snapshot.value));
    });

    actor.start();

    // Connect UI buttons to state machine
    document.querySelector("#happy")!
        .addEventListener("click", () => {
            actor.send({ type: "MAKE_HAPPY" });
        });

    document.querySelector("#idle")!
        .addEventListener("click", () => {
            actor.send({ type: "MAKE_IDLE" });
        });
}

main().catch(console.error);
