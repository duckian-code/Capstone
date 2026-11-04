// WebKitGTK (the Linux Tauri WebView) does not reliably upload textures decoded
// through Pixi's worker/createImageBitmap path. Use the browser Image loader instead.
import {Application, Assets, Sprite} from "pixi.js";
import {useEffect, useRef} from "react";
import type { Texture } from "pixi.js";
import type { MascotState } from "../../state/mascotMachine.ts";

Assets.setPreferences({
    preferWorkers: false,
    preferCreateImageBitmap: false,
});

interface Props {
    state: MascotState;
    onError: ( message: string ) => void;
}

export function MascotCanvas({ state, onError }: Props ) {
    const hostRef = useRef<HTMLDivElement>(null);
    const stateRef = useRef(state);
    const onErrorRef = useRef(onError);
    // after pixijs and textures are ready
    const updateSpriteRef =
        useRef<((nextState: MascotState) => void) | null>(null);

    useEffect(() => {
        onErrorRef.current = onError;
    }, [onError]);

    useEffect(() => {
        stateRef.current = state;
        updateSpriteRef.current?.(state);
    }, [state]);

    useEffect(() => {
        const host = hostRef.current;

        if (!host) return;

        const app = new Application();

        let disposed = false;
        let initialized = false;
        let observer: ResizeObserver | null = null;

        function destroyApplication() {
            if (!initialized) return;

            initialized = false;

            // Destroy the children, but retain shared textures
            app.destroy(true, {children: true});
        }

        async function initialize() {
            await app.init({
                width: Math.max(1, host!.clientWidth),
                height: Math.max(1, host!.clientHeight),
                backgroundAlpha: 0,
                antialias: false,
                autoDensity: true,
                resolution: Math.min(window.devicePixelRatio ||  1, 2),
            });

            initialized = true;

            if (disposed) {
                destroyApplication();
                return;
            }

            app.canvas.setAttribute("aria-hidden", "true");
            host!.appendChild(app.canvas);

            // resolve URLs using the browser so Tauri's custom scheme retains its host
            function loadMascotTexture(filename: string): Promise<Texture> {
                const url = new URL(
                    `/assets/${filename}`,
                    document.baseURI,
                ).href;

                return Assets.load<Texture>(url);
            }

            const [
                idleTexture,
                respondTexture,
                waitTexture,
                errorTexture,
            ] = await Promise.all([
                loadMascotTexture("idle.png"),
                loadMascotTexture("respond.png"),
                loadMascotTexture("wait.png"),
                loadMascotTexture("error.png"),
            ]);


            if (disposed) return;

            const textures = {
                idle: idleTexture,
                respond: respondTexture,
                wait: waitTexture,
                error: errorTexture,
            }

            // expandable and dynamic instead of static assignment
            Object.values(textures).forEach((texture) => {
                texture.source.scaleMode = "nearest";
            })

            const sprite = new Sprite(textures[stateRef.current]);
            sprite.anchor.set(0.5);
            app.stage.addChild(sprite);

            function resize() {
                if (disposed) return;

                const width = host!.clientWidth;
                const height = host!.clientHeight;

                if (width <= 0 || height <= 0) return;

                app.renderer.resize(width, height);

                sprite.position.set(width / 2, height / 2);

                const scale = Math.min(
                    (width * 0.7) / sprite.texture.width,
                    (height * 0.8) / sprite.texture.height
                );

                sprite.scale.set(scale);
            }

            updateSpriteRef.current = (nextState) => {
                sprite.texture = textures[nextState];
                resize();
            };

            observer = new ResizeObserver(resize);
            observer.observe(host!);

            resize();
        }

        void initialize().catch((reason: unknown) => {
            observer?.disconnect();
            updateSpriteRef.current = null;
            destroyApplication();

            if (!disposed) {
                onErrorRef.current(`Mascot initialization failed: ${String(reason)}`);
            }
        });

        return () => {
            disposed = true;
            observer?.disconnect();
            updateSpriteRef.current = null;
            destroyApplication();
        }
    }, []);

    return (
        <div
            ref={hostRef}
            className="mascot-canvas"
            role="img"
            aria-label="Your conversation partner"
        />
    )
}