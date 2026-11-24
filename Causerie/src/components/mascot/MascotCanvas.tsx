// WebKitGTK (the Linux Tauri WebView) does not reliably upload textures decoded
// through Pixi's worker/createImageBitmap path. Use the browser Image loader instead.
import {useEffect, useRef} from "react";
import type { MascotState } from "../../state/mascotMachine.ts";
import {
    AnimatedSprite,
    Application,
    Assets,
    Graphics,
    Rectangle,
    Texture,
} from "pixi.js";

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

            // Add the surface first so Dot renders in front of it
            const surface = new Graphics();
            app.stage.addChild(surface);
            app.stage.addChild(sprite);

            function surfaceColors() {
                const styles = getComputedStyle(host!);

                function color(variable: string, fallback: string) {
                    return styles.getPropertyValue(variable).trim() || fallback;
                }

                return {
                    top: color("--color-surface-raised", "#524a51"),
                    front: color("--color-sidebar", "#403b40"),
                    border: color("--color-border", "#776971"),
                    highlight: color("--color-accent-warm", "#f1c899"),
                    shadow: color("--color-bg", "#353338"),
                };
            }

            // Use this application's ticker so animation stops with the renderer
            app.ticker.add((ticker) => {
                sprite.update(ticker);
            });

            sprite.play();

            // Coordinates within each 192 × 192 animation frame
            // Initial alignment estimate from the current sprite sheets
            const STANDING_FOOT_Y = 186;
            const SITTING_SEAT_Y = 126;
            const SITTING_OFFSET_Y = STANDING_FOOT_Y - SITTING_SEAT_Y;

            // RENDER SHELF - OPTION A
            // function drawSurface() {
            //     const colors = surfaceColors();
            //     surface.clear();
            //
            //     // Soft-looking shadow beneath the shelf.
            //     surface
            //         .ellipse(0, 15, 65, 5)
            //         .fill({ color: colors.shadow, alpha: 0.3 });
            //
            //     // Front face adds thickness.
            //     surface
            //         .roundRect(-68, 0, 136, 10, 3)
            //         .fill(colors.front)
            //         .stroke({
            //             color: colors.border,
            //             width: 1,
            //             alpha: 0.8,
            //         });
            //
            //     // Shallow top surface meets the mascot's contact line.
            //     surface
            //         .roundRect(-70, -3, 140, 5, 2)
            //         .fill(colors.top)
            //         .stroke({
            //             color: colors.border,
            //             width: 1,
            //         });
            //
            //     // Warm edge detail.
            //     surface
            //         .moveTo(-65, 0)
            //         .lineTo(65, 0)
            //         .stroke({
            //             color: colors.highlight,
            //             width: 1,
            //             alpha: 0.65,
            //         });
            // }

            // RENDER PLATFORM - OPTION B
            function drawSurface() {
                const colors = surfaceColors();
                surface.clear();

                // Grounding shadow beneath the platform.
                surface
                    .ellipse(0, 15, 64, 7)
                    .fill({ color: colors.shadow, alpha: 0.3 });

                // Lower ellipse creates the platform's depth.
                surface
                    .ellipse(0, 6, 66, 11)
                    .fill(colors.front)
                    .stroke({
                        color: colors.border,
                        width: 1,
                        alpha: 0.8,
                    });

                // Top surface, centered on the shared contact height.
                surface
                    .ellipse(0, 0, 66, 11)
                    .fill(colors.top)
                    .stroke({
                        color: colors.highlight,
                        width: 1,
                        alpha: 0.55,
                    });

                // Subtle inset detail.
                surface
                    .ellipse(0, -1, 57, 7)
                    .stroke({
                        color: colors.border,
                        width: 0.75,
                        alpha: 0.45,
                    });
            }

            function resize() {
                if (disposed) return;

                const width = host!.clientWidth;
                const height = host!.clientHeight;

                if (width <= 0 || height <= 0) return;

                app.renderer.resize(width, height);

                const frameWidth = sprite.texture.width;
                const frameHeight = sprite.texture.height;

                // Reserve space for the seated pose's hanging legs
                // Use the same scale for every pose to avoid size jumps
                const layoutHeight = frameHeight + SITTING_OFFSET_Y;

                const scale = Math.min(
                    (width * 0.85) / frameWidth,
                    (height * 0.98) / layoutHeight,
                );

                const layoutTop = (height - layoutHeight * scale) / 2;
                const poseOffset = activeState === "idle" ? SITTING_OFFSET_Y : 0;

                sprite.scale.set(scale);
                sprite.position.set(
                    width / 2,
                    layoutTop + (frameHeight / 2 + poseOffset) * scale,
                );
                surface.position.set(
                    width / 2,
                    layoutTop + STANDING_FOOT_Y * scale,
                );
                surface.scale.set(scale);
                drawSurface();
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