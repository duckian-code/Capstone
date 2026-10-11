import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Application, Assets, Sprite, Texture } from "pixi.js";
import { createActor, createMachine } from "xstate";
import type { ActorRefFrom } from "xstate";
import "./App.css";

// WebKitGTK (the Linux Tauri WebView) does not reliably upload textures decoded
// through Pixi's worker/createImageBitmap path. Use the browser Image loader instead.
Assets.setPreferences({
  preferWorkers: false,
  preferCreateImageBitmap: false,
});

const mascotMachine = createMachine({
  id: "mascot",
  initial: "idle",
  states: {
    idle: {
      on: { SUBMIT: "received" },
    },
    received: {
      on: { RESPONSE_RECEIVED: "idle", REQUEST_FAILED: "idle" },
    },
  },
});

type MascotEvent =
  | { type: "SUBMIT" }
  | { type: "RESPONSE_RECEIVED" }
  | { type: "REQUEST_FAILED" };

function App() {
  const mascotContainer = useRef<HTMLDivElement>(null);
  const mascotActor = useRef<ActorRefFrom<typeof mascotMachine> | null>(null);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const actor = createActor(mascotMachine);
    mascotActor.current = actor;
    actor.start();
    const app = new Application();
    let disposed = false;
    let initialized = false;
    let unsubscribe: (() => void) | undefined;

    async function initializeMascot() {
      await app.init({
        width: 400,
        height: 300,
        backgroundColor: 0x292c32,
      });
      initialized = true;

      if (disposed || !mascotContainer.current) {
        app.destroy(true);
        return;
      }

      mascotContainer.current.appendChild(app.canvas);

      const [idleTexture, receivedTexture] = await Promise.all([
        Assets.load<Texture>("/assets/idle.png"),
        Assets.load<Texture>("/assets/received.png"),
      ]);

      if (disposed) return;

      idleTexture.source.scaleMode = "nearest";
      receivedTexture.source.scaleMode = "nearest";

      const mascot = new Sprite(idleTexture);
      mascot.anchor.set(0.5);
      mascot.position.set(200, 150);
      mascot.scale.set(0.3);
      app.stage.addChild(mascot);

      const subscription = actor.subscribe((snapshot) => {
        mascot.texture =
          snapshot.value === "received" ? receivedTexture : idleTexture;
      });
      unsubscribe = () => subscription.unsubscribe();
    }

    initializeMascot().catch((reason) => {
      console.error("Unable to initialize mascot", reason);
    });

    return () => {
      disposed = true;
      unsubscribe?.();
      actor.stop();
      mascotActor.current = null;
      if (initialized) app.destroy(true);
    };
  }, []);

  function sendMascotEvent(event: MascotEvent) {
    mascotActor.current?.send(event);
  }

  async function submitPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = prompt.trim();

    if (!message || isLoading) return;

    setIsLoading(true);
    setResponse("");
    setError("");
    sendMascotEvent({ type: "SUBMIT" });

    try {
      const answer = await invoke<string>("send_message", { message });
      setResponse(answer);
      sendMascotEvent({ type: "RESPONSE_RECEIVED" });
    } catch (reason) {
      setError(String(reason));
      sendMascotEvent({ type: "REQUEST_FAILED" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="container">
      <h1>OpenAI Mascot Demo</h1>

      <div ref={mascotContainer} aria-label="Mascot status" />

      <form className="row" onSubmit={submitPrompt}>
        <input
          id="prompt-input"
          value={prompt}
          onChange={(event) => setPrompt(event.currentTarget.value)}
          placeholder="Enter a message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !prompt.trim()}>
          {isLoading ? "Sending..." : "Submit"}
        </button>
      </form>

      {response && <p>{response}</p>}
      {error && <p role="alert">{error}</p>}
    </main>
  );
}

export default App;
