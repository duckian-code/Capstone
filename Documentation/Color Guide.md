Color palette is pinkish with grey neutrals for the MVP. The following is a React style naming for use in code:
```
export const colors = {
  bg: "#353338",

  surface: {
    sidebar: "#403B40",
    default: "#494249",
    raised: "#524A51",
    selected: "#5E545C",
    soft: "#62565E",
  },

  border: "#776971",

  text: {
    primary: "#FAF2F4",
    secondary: "#D4C4C9",
  },

  accent: {
    primary: "#E6A6B5",
    primaryText: "#41252E",
    warm: "#F1C899",
    warmText: "#53311A",
  },

  message: {
    assistant: "#564C53",
    user: "#946C78",
    userText: "#FFF8F9",
  },
};
```

The following is for derived interaction tokens:
```
:root {
  --color-hover: #685B64;
  --color-pressed: #74636D;

  --color-disabled-bg: #4A4449;
  --color-disabled-text: #9F9297;

  --color-overlay: rgba(30, 27, 31, 0.72);
  --color-shadow: rgba(0, 0, 0, 0.28);
}
```

ACCENTS GUIDE:
Pink accent should be used for actions and identity.
Peach accent should be used for learning-related information.

Following CSS helps map which color should be used where:
```
:root {
  /* Core surfaces */
  --color-bg: #353338;
  --color-sidebar: #403B40;
  --color-surface: #494249;
  --color-surface-raised: #524A51;
  --color-surface-selected: #5E545C;
  --color-surface-soft: #62565E;

  /* Borders / separators */
  --color-border: #776971;

  /* Typography */
  --color-text-primary: #FAF2F4;
  --color-text-secondary: #D4C4C9;

  /* Brand / interactive accents */
  --color-accent-primary: #E6A6B5;
  --color-accent-primary-text: #41252E;

  --color-accent-warm: #F1C899;
  --color-accent-warm-text: #53311A;

  /* Conversation */
  --color-message-assistant: #564C53;
  --color-message-user: #946C78;
  --color-message-user-text: #FFF8F9;

  /* Semantic aliases */
  --color-focus: #E6A6B5;
  --color-active: #E6A6B5;
  --color-highlight: #F1C899;
}
```

| Token                       | Use                                           |
| --------------------------- | --------------------------------------------- |
| `--color-bg`                | Main conversation background                  |
| `--color-sidebar`           | Thread sidebar                                |
| `--color-surface`           | Headers, cards, toolbar backgrounds           |
| `--color-surface-raised`    | Inputs, dropdowns, menus                      |
| `--color-surface-selected`  | Selected thread / active navigation           |
| `--color-surface-soft`      | Goal cards, feedback callouts                 |
| `--color-border`            | Dividers, input outlines, subtle card borders |
| `--color-text-primary`      | Main body text, headings                      |
| `--color-text-secondary`    | Metadata, timestamps, placeholders            |
| `--color-accent-primary`    | Primary buttons, active controls, links       |
| `--color-accent-warm`       | Goals, educational highlights, mascot accents |
| `--color-message-assistant` | AI message bubbles                            |
| `--color-message-user`      | User message bubbles                          |
| `--color-bg`                | Main conversation background                  |
| `--color-sidebar`           | Thread sidebar                                |
| `--color-surface`           | Headers, cards, toolbar backgrounds           |
| `--color-surface-raised`    | Inputs, dropdowns, menus                      |
| `--color-surface-selected`  | Selected thread / active navigation           |
| `--color-surface-soft`      | Goal cards, feedback callouts                 |
| `--color-border`            | Dividers, input outlines, subtle card borders |
| `--color-text-primary`      | Main body text, headings                      |
| `--color-text-secondary`    | Metadata, timestamps, placeholders            |
| `--color-accent-primary`    | Primary buttons, active controls, links       |
| `--color-accent-warm`       | Goals, educational highlights, mascot accents |
| `--color-message-assistant` | AI message bubbles                            |
| `--color-message-user`      | User message bubbles                          |
