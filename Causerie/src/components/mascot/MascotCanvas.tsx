// WebKitGTK (the Linux Tauri WebView) does not reliably upload textures decoded
// through Pixi's worker/createImageBitmap path. Use the browser Image loader instead.
import {
    AnimatedSprite,
    Application,
    Assets,
    Rectangle,
    Texture,
} from "pixi.js";
import {useEffect, useRef} from "react";
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

        const frameTextures: Texture[] = [];

        function destroyApplication() {
            if (!initialized) return;

            initialized = false;

            // Destroy the sprite and its animation subscription
            // Keep the shared Assets-loaded image sources
            app.destroy(true, { children: true });

            for (const texture of frameTextures) {
                texture.destroy(false);
            }

            frameTextures.length = 0;
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

            const COLUMNS = 4;
            const ROWS = 3;

            const framesPerSecond: Record<MascotState, number> = {
                idle: 8,
                respond: 8,
                wait: 8,
                error: 8,
            };

            function sliceSheet(sheet: Texture): Texture[] {
                const frameWidth = sheet.width / COLUMNS;
                const frameHeight = sheet.height / ROWS;

                if (
                    !Number.isInteger(frameWidth) ||
                    !Number.isInteger(frameHeight)
                ) {
                    throw new Error(
                        "Mascot sheets must contain 4 columns and 3 rows of equal-sized frames.",
                    );
                }

                // Preserve crisp pixel-art edges.
                sheet.source.scaleMode = "nearest";

                return Array.from({ length: COLUMNS * ROWS }, (_, index) => {
                    const column = index % COLUMNS;
                    const row = Math.floor(index / COLUMNS);

                    const texture = new Texture({
                        source: sheet.source,
                        frame: new Rectangle(
                            column * frameWidth,
                            row * frameHeight,
                            frameWidth,
                            frameHeight,
                        ),
                    });

                    frameTextures.push(texture);
                    return texture;
                });
            }

            const respondFrames = sliceSheet(respondTexture);

            const animations: Record<MascotState, Texture[]> = {
                idle: sliceSheet(idleTexture),
                wait: sliceSheet(waitTexture),
                error: sliceSheet(errorTexture),

                // 0 → 11 → 1, then the next cycle starts at 0
                // Neither endpoint is duplicated when changing direction
                respond: [
                    ...respondFrames,
                    ...respondFrames.slice(1, -1).reverse(),
                ],
            };

            let activeState = stateRef.current;

            const sprite = new AnimatedSprite({
                textures: animations[activeState],
                autoUpdate: false,
                loop: true,
                animationSpeed: framesPerSecond[activeState] / 60,
            });

            sprite.anchor.set(0.5);
            app.stage.addChild(sprite);

            // Use this application's ticker so animation stops with the renderer
            app.ticker.add((ticker) => {
                sprite.update(ticker);
            });

            sprite.play();

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
                if (disposed || nextState === activeState) return;

                activeState = nextState;

                sprite.stop();
                sprite.textures = animations[nextState];
                sprite.animationSpeed = framesPerSecond[nextState] / 60;
                sprite.gotoAndPlay(0);

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