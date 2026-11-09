import getpass
import html
import json
import urllib.error
import urllib.request
from pathlib import Path

VOICES = ["marin", "coral", "shimmer"]
MODEL = "gpt-4o-mini-tts"

SAMPLES = {
    "en-US": {
        "label": "English — United States",
        "text": (
            "Hi! I'm Dot. We can take our time. "
            "Would you rather tell me about your day, "
            "or imagine a little trip together? "
            "Tomorrow, we could meet near the station "
            "at eight thirty. What would you like to do first?"
        ),
        "instructions": (
            "Speak entirely in English with a natural General American "
            "accent. Use a warm, feminine-sounding conversational delivery. "
            "Be friendly and lightly playful, with natural pauses and "
            "clear pronunciation at a comfortable pace. "
            "Avoid an announcer voice or exaggerated enthusiasm. "
            "Read the supplied text exactly; do not add commentary."
        ),
    },
    "fr-FR": {
        "label": "French — France",
        "text": (
            "Salut ! Moi, c'est Dot. On peut prendre notre temps. "
            "Tu préfères me raconter ta journée "
            "ou imaginer une petite sortie ensemble ? "
            "Demain, nous pourrions nous retrouver près de la gare, "
            "vers huit heures et demie. "
            "Qu'est-ce que tu aimerais faire en premier ?"
        ),
        "instructions": (
            "Speak entirely in French with a natural contemporary "
            "metropolitan French accent from France. Use natural French "
            "liaison, vowel pronunciation, and conversational rhythm. "
            "Use a warm, feminine-sounding conversational delivery. "
            "Be friendly and lightly playful, with natural pauses and "
            "clear pronunciation at a comfortable pace. "
            "Avoid an announcer voice or an exaggerated theatrical accent. "
            "Read the supplied text exactly; do not add commentary."
        ),
    },
}


def generate_audio(api_key, voice, sample):
    body = json.dumps({
        "model": MODEL,
        "voice": voice,
        "input": sample["text"],
        "instructions": sample["instructions"],
        "response_format": "mp3",
    }).encode("utf-8")

    request = urllib.request.Request(
        "https://api.openai.com/v1/audio/speech",
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            return response.read()
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        try:
            detail = json.loads(detail)["error"]["message"]
        except (ValueError, KeyError, TypeError):
            detail = f"HTTP {error.code}"
        raise RuntimeError(detail) from None
    except urllib.error.URLError as error:
        raise RuntimeError(f"Connection failed: {error.reason}") from None


def main():
    api_key = getpass.getpass("OpenAI API key (hidden): ").strip()
    if not api_key:
        raise SystemExit("No API key entered.")

    output = Path.cwd() / "dot-voice-audition"
    output.mkdir(exist_ok=True)

    sections = []

    for locale, sample in SAMPLES.items():
        cards = []

        for voice in VOICES:
            filename = f"{locale}-{voice}.mp3"
            path = output / filename

            # Re-running resumes without paying for existing samples again.
            if path.exists() and path.stat().st_size > 0:
                print(f"Keeping existing sample: {filename}")
            else:
                print(f"Generating: {filename}")
                try:
                    audio = generate_audio(api_key, voice, sample)
                    if not audio:
                        raise RuntimeError("The API returned empty audio.")
                    path.write_bytes(audio)
                except RuntimeError as error:
                    raise SystemExit(
                        f"Stopped: {error}\n"
                        "Completed samples were retained. Run again to resume."
                    ) from None

            cards.append(f"""
                <article>
                    <h3>{html.escape(voice.title())}</h3>
                    <audio controls preload="none" src="{filename}">
                        Your browser does not support audio playback.
                    </audio>
                </article>
            """)

        sections.append(f"""
            <section>
                <h2>{html.escape(sample["label"])}</h2>
                <p lang="{locale}">{html.escape(sample["text"])}</p>
                <div class="voices">{"".join(cards)}</div>
                <details>
                    <summary>Delivery instructions</summary>
                    <p>{html.escape(sample["instructions"])}</p>
                </details>
            </section>
        """)

    page = """<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Dot — Voice Audition</title>
    <style>
        body {
            max-width: 1050px;
            margin: 2rem auto;
            padding: 0 1rem;
            font: 16px/1.6 system-ui, sans-serif;
            background: #29262d;
            color: #faf2f4;
        }
        section {
            margin: 2rem 0;
            padding: 1.25rem;
            border: 1px solid #776971;
            border-radius: 12px;
            background: #403b40;
        }
        .voices {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
            gap: 1rem;
        }
        article { min-width: 0; }
        h3 { color: #e6a6b5; }
        audio { width: 100%; }
        details { margin-top: 1.25rem; }
        summary { cursor: pointer; }
    </style>
</head>
<body>
    <h1>Dot — Voice Audition</h1>
    <p>AI-generated speech · Marin, Coral, and Shimmer</p>
    <p>Compare warmth, feminine presentation, pronunciation,
       natural rhythm, and suitability for a learning companion.</p>
    CONTENT
    <script>
        // Prevent overlapping samples while comparing voices.
        document.addEventListener("play", (event) => {
            document.querySelectorAll("audio").forEach((audio) => {
                if (audio !== event.target) audio.pause();
            });
        }, true);
    </script>
</body>
</html>
""".replace("CONTENT", "".join(sections))

    index = output / "index.html"
    index.write_text(page, encoding="utf-8")

    print(f"\nOpen this file in your browser:\n{index.resolve()}")


if __name__ == "__main__":
    main()

