# French vocabulary bank: source mapping and review

Prepared 2026-11-14. Review draft: 60 original French vocabulary questions, 12 at each intended level A1–C1. All items are version 1 and await user review. This task adds content only.

## Files and scope

- Bank: [vocabulary.json](../Causerie/src-tauri/resources/proficiency/fr/vocabulary.json).
- Guide: [French proficiency source guide](french-proficiency-source-guide.md).
- Plan: [CEFR TESTING PLANNING](CEFR%20TESTING%20PLANNING.md).
- Related format: [reading bank documentation](french-reading-question-sources.md).

All prompts, contexts, options and explanations are original. The questions use French only, without assuming an English-speaking learner. Examples involving organizations, policy and research are hypothetical language contexts, not claims about real events.

This is a contextual lexical recognition/selection bank. It samples word meanings, lexical chunks, collocations, register and connotation. It does not measure total vocabulary size or demonstrate spontaneous productive range. Grammar is supporting context: options use matching parts of speech or comparable phrases rather than competing conjugations or agreement endings. Some collocations necessarily test lexical construction; their conventional wording is the target.

## Source key and attribution limits

- **INV:** [French Linguistic Inventory](/home/anabelle/Documents/capstone/inventair-liguistique-des-contenus.pdf). PDF level overviews: A1 pp. 58–59; A2 pp. 59–60; B1 pp. 60–61; B2 pp. 61–63; C1 p. 63. B1 work examples p. 87; B2 work/culture examples pp. 99–100; C1 cultural vocabulary examples p. 109. The source describes themes, communicative functions and examples rather than an exhaustive graded vocabulary list.
- **CV:** [CEFR Companion Volume](</home/anabelle/Documents/capstone/CEFR-Companion Volume_eng.pdf>). PDF p. 131: vocabulary range; pp. 132–133: vocabulary control. A1 has a vocabulary-range descriptor but no separate vocabulary-control descriptor; this document does not invent one.
- **DIA:** [DIALANG Appendix C](/home/anabelle/Documents/capstone/DIALANG-CECRL_GBR.pdf), PDF p. 236: assessment procedure. It identifies vocabulary as a tested area, but its self-assessment statements cover reading, listening and writing, not vocabulary or structures. Its reading scales are not used as word-level classifications here.
- **DELF/DALF samples:** the supplied candidate papers provide examples of practical, social, professional and cultural contexts. They do not offer separate vocabulary sections matching this bank. Therefore no item is attributed to an official standalone DELF/DALF vocabulary question.
- **Guide:** sections 3 and 5 of the project guide synthesize French level themes and the vocabulary distinctions used below.

Page numbers refer to PDF pages, counting the first page as 1. INV printed page numbers are two lower. CV numbering agrees in the sections cited.

Per-item references below support the topic, communicative function and lexical demand. Unless an explicit example is identified, they do not claim that the source lists the exact target word at that level. The level rationales are Causerie authoring judgments. Words and expressions may be familiar below their assigned level; the context and required distinction also matter. Pilot evidence is needed before treating difficulty labels as calibrated.

## Data contract

The collection uses the same envelope as the reading bank: `schemaVersion: 1`, `bankVersion: 1`, a language/skill bank ID, supported `levels`, `passages` and `questions`. The bank ID is `fr-vocabulary`, with `language: "fr"` and `skill: "vocabulary"`. The language directory can be extended with separate banks such as `es/vocabulary.json` later. The code `fr` does not assert a country-specific dialect.

`passages` is empty because each prompt contains its complete context. Questions omit the optional `passageId` and `passageVersion` fields. A frontend should preserve the line break between the instruction and the context. The placeholder `___` is part of the prompt; the user selects an option rather than typing a response. Meaning-in-context questions also use the same `single_choice` format.

Each question has a stable ID, `version: 1`, `status: "draft"`, four options with stable local IDs, one correct option ID, a French explanation and tags for operation/topic. Sources, target labels, difficulty rationales and distractor notes live in this document rather than the runtime question object.

Question version identifies a content/scoring revision, schemaVersion identifies the file format, and bankVersion identifies this collection release. Future edits should preserve old administered revisions rather than silently alter historical tests. Avoid-repeat selection should use the stable question ID even when revisions differ.

Each correct answer earns one point; scoring thresholds and adaptive behavior remain outside these content files. Stored correct positions are balanced (three in each position per level). The future runtime should still shuffle options by stable ID and record the actual display order. Answer keys and explanations should be withheld from the test-taking payload until feedback is permitted.

No loader, database migration, UI, or Tauri resource configuration is changed. Like the reading bank, this new file will require integration and explicit bundling when the assessment is implemented. Reading questions and their review status are left unchanged.

## Coverage

| Level | Questions | Scope |
| --- | ---: | --- |
| A1 | 12 | Concrete everyday words: food, objects, clothing, transport, family, routine and time. Twelve short contextual choices. |
| A2 | 12 | Routine transactions and arrangements: cancellation, postponement, reimbursement, travel, health, housing, workplace roles and common expressions. |
| B1 | 12 | Familiar experiences and opinions: emotions, employment, plans, money, relationships, everyday figurative meanings and lexical chunks. |
| B2 | 12 | Broader social and professional topics: semantic precision, argumentative lexis, collocations, figurative meaning and context-dependent senses. |
| C1 | 12 | Precise evidential and evaluative vocabulary, professional register, connotation and idiomatic language; preserve the strength and scope of a claim. |

## Review index

| Question ID | Version | Target | Operation | Key | Answer |
| --- | ---: | --- | --- | --- | --- |
| `fr-vocabulary-a1-001` | 1 | pain | `contextual_word` | `opt-1` | pain |
| `fr-vocabulary-a1-002` | 1 | eau | `contextual_word` | `opt-3` | eau |
| `fr-vocabulary-a1-003` | 1 | gare | `contextual_word` | `opt-2` | gare |
| `fr-vocabulary-a1-004` | 1 | chaise | `contextual_word` | `opt-4` | chaise |
| `fr-vocabulary-a1-005` | 1 | manteau | `contextual_word` | `opt-1` | manteau |
| `fr-vocabulary-a1-006` | 1 | clé | `contextual_word` | `opt-3` | clé |
| `fr-vocabulary-a1-007` | 1 | dormir | `contextual_word` | `opt-2` | dormir |
| `fr-vocabulary-a1-008` | 1 | acheter | `contextual_word` | `opt-4` | acheter |
| `fr-vocabulary-a1-009` | 1 | froid | `contextual_word` | `opt-1` | froid |
| `fr-vocabulary-a1-010` | 1 | frère | `contextual_word` | `opt-3` | frère |
| `fr-vocabulary-a1-011` | 1 | demain | `contextual_word` | `opt-2` | Demain |
| `fr-vocabulary-a1-012` | 1 | matin | `contextual_word` | `opt-4` | matin |
| `fr-vocabulary-a2-001` | 1 | annuler | `contextual_word` | `opt-1` | annuler |
| `fr-vocabulary-a2-002` | 1 | reporter | `contextual_word` | `opt-3` | reporter |
| `fr-vocabulary-a2-003` | 1 | remboursement | `contextual_word` | `opt-2` | remboursement |
| `fr-vocabulary-a2-004` | 1 | correspondance | `contextual_word` | `opt-4` | correspondance |
| `fr-vocabulary-a2-005` | 1 | ordonnance | `contextual_word` | `opt-1` | ordonnance |
| `fr-vocabulary-a2-006` | 1 | loyer | `contextual_word` | `opt-3` | loyer |
| `fr-vocabulary-a2-007` | 1 | collègue | `contextual_word` | `opt-2` | collègue |
| `fr-vocabulary-a2-008` | 1 | disponible | `contextual_word` | `opt-4` | disponible |
| `fr-vocabulary-a2-009` | 1 | retrouver | `contextual_word` | `opt-1` | retrouver |
| `fr-vocabulary-a2-010` | 1 | rarement | `contextual_word` | `opt-3` | rarement |
| `fr-vocabulary-a2-011` | 1 | aimable | `contextual_word` | `opt-2` | aimable |
| `fr-vocabulary-a2-012` | 1 | prendre rendez-vous | `collocation` | `opt-4` | prendre |
| `fr-vocabulary-b1-001` | 1 | soulagé | `contextual_word` | `opt-1` | soulagé |
| `fr-vocabulary-b1-002` | 1 | déçue | `contextual_word` | `opt-3` | déçue |
| `fr-vocabulary-b1-003` | 1 | renoncer à | `meaning_in_context` | `opt-2` | Abandonner ce projet. |
| `fr-vocabulary-b1-004` | 1 | embaucher | `meaning_in_context` | `opt-4` | Recruter deux personnes pour y travailler. |
| `fr-vocabulary-b1-005` | 1 | déménager | `contextual_word` | `opt-1` | déménager |
| `fr-vocabulary-b1-006` | 1 | économiser | `contextual_word` | `opt-3` | économiser |
| `fr-vocabulary-b1-007` | 1 | se rendre compte | `collocation` | `opt-2` | compte |
| `fr-vocabulary-b1-008` | 1 | se plaindre | `meaning_in_context` | `opt-4` | Exprimer leur mécontentement. |
| `fr-vocabulary-b1-009` | 1 | en panne | `meaning_in_context` | `opt-1` | Elle ne fonctionne plus normalement. |
| `fr-vocabulary-b1-010` | 1 | d’occasion | `meaning_in_context` | `opt-3` | Déjà utilisé par un propriétaire précédent. |
| `fr-vocabulary-b1-011` | 1 | s’entendre bien | `meaning_in_context` | `opt-2` | Ils ont de bonnes relations. |
| `fr-vocabulary-b1-012` | 1 | donner son avis | `collocation` | `opt-4` | avis |
| `fr-vocabulary-b2-001` | 1 | atténuer | `semantic_precision` | `opt-1` | atténuer |
| `fr-vocabulary-b2-002` | 1 | compromis | `contextual_word` | `opt-3` | compromis |
| `fr-vocabulary-b2-003` | 1 | prendre en compte | `collocation` | `opt-2` | compte |
| `fr-vocabulary-b2-004` | 1 | mettre en œuvre | `collocation` | `opt-4` | œuvre |
| `fr-vocabulary-b2-005` | 1 | contester | `semantic_precision` | `opt-1` | conteste |
| `fr-vocabulary-b2-006` | 1 | marge de manœuvre | `meaning_in_context` | `opt-3` | Une liberté de décision à l’intérieur de certaines limites. |
| `fr-vocabulary-b2-007` | 1 | pertinent | `semantic_precision` | `opt-2` | pertinent |
| `fr-vocabulary-b2-008` | 1 | pénurie | `semantic_precision` | `opt-4` | pénurie |
| `fr-vocabulary-b2-009` | 1 | une source | `meaning_in_context` | `opt-1` | Une personne ou un document dont provient une information. |
| `fr-vocabulary-b2-010` | 1 | durable | `semantic_precision` | `opt-3` | durable |
| `fr-vocabulary-b2-011` | 1 | remettre en question | `collocation` | `opt-2` | Réexaminer sa validité au lieu de la tenir pour acquise. |
| `fr-vocabulary-b2-012` | 1 | incitatif | `semantic_precision` | `opt-4` | incitatif |
| `fr-vocabulary-c1-001` | 1 | corroborer | `semantic_precision` | `opt-1` | corroborer |
| `fr-vocabulary-c1-002` | 1 | inférer | `semantic_precision` | `opt-3` | inférer |
| `fr-vocabulary-c1-003` | 1 | équivoque | `semantic_precision` | `opt-2` | équivoque |
| `fr-vocabulary-c1-004` | 1 | péremptoire | `connotation` | `opt-4` | péremptoire |
| `fr-vocabulary-c1-005` | 1 | émettre des réserves | `register` | `opt-1` | Le comité émet des réserves sur le calendrier proposé. |
| `fr-vocabulary-c1-006` | 1 | nuancer | `semantic_precision` | `opt-3` | nuancer |
| `fr-vocabulary-c1-007` | 1 | se prévaloir de | `meaning_in_context` | `opt-2` | Faire valoir cette expérience à son avantage. |
| `fr-vocabulary-c1-008` | 1 | faire la part des choses | `idiom` | `opt-4` | Distinguer les différents aspects pour porter un jugement équilibré. |
| `fr-vocabulary-c1-009` | 1 | tirer son épingle du jeu | `idiom` | `opt-1` | Réussir à bien s’en sortir malgré un contexte défavorable. |
| `fr-vocabulary-c1-010` | 1 | dépouillé | `connotation` | `opt-3` | Sobre et réduit à l’essentiel. |
| `fr-vocabulary-c1-011` | 1 | présupposé | `semantic_precision` | `opt-2` | présupposé |
| `fr-vocabulary-c1-012` | 1 | probant | `semantic_precision` | `opt-4` | probants |

## A1: question-by-question rationale

Concrete everyday words: food, objects, clothing, transport, family, routine and time. Twelve short contextual choices.

### fr-vocabulary-a1-001 — version 1

- **Target:** pain.
- **Operation / topic:** `contextual_word` / `food`.
- **Source basis:** INV pp. 58–59; CV pp. 131 (vocabulary range; no A1 vocabulary-control descriptor is supplied); project guide §3 (A1) and §5.
- **Difficulty rationale:** Concrete everyday food word in a familiar shopping expression; no grammatical contrast.
- **Prompt and context:**

  Choisissez le mot qui convient.

  À la boulangerie, je voudrais une baguette de ___.

- **Correct answer:** `opt-1` — pain
- **Meaning / answer rationale:** Une baguette est une forme de pain.
- **Distractor rationale:**
  - `opt-2` — riz: Le riz ne sert pas à désigner une baguette de boulangerie.
  - `opt-3` — sel: Le sel est un ingrédient, pas le produit demandé.
  - `opt-4` — sucre: Le sucre ne désigne pas une baguette de boulangerie.

### fr-vocabulary-a1-002 — version 1

- **Target:** eau.
- **Operation / topic:** `contextual_word` / `daily_needs`.
- **Source basis:** INV pp. 58–59; CV pp. 131 (vocabulary range; no A1 vocabulary-control descriptor is supplied); project guide §3 (A1) and §5.
- **Difficulty rationale:** Identify a basic everyday substance from a concrete action; all options fit the elided article.
- **Prompt and context:**

  Choisissez le mot qui convient.

  J’ai soif. Je prends un verre et je le remplis avec l’___ du robinet.

- **Correct answer:** `opt-3` — eau
- **Meaning / answer rationale:** On peut remplir un verre avec l’eau du robinet.
- **Distractor rationale:**
  - `opt-1` — huile: Un robinet d’eau ne fournit pas d’huile.
  - `opt-2` — orange: Une orange est un fruit, pas le liquide du robinet.
  - `opt-4` — encre: L’encre sert à écrire, pas à boire.

### fr-vocabulary-a1-003 — version 1

- **Target:** gare.
- **Operation / topic:** `contextual_word` / `transport`.
- **Source basis:** INV pp. 58–59; CV pp. 131 (vocabulary range; no A1 vocabulary-control descriptor is supplied); project guide §3 (A1) and §5.
- **Difficulty rationale:** Basic location word in a familiar travel context; all options are feminine place nouns.
- **Prompt and context:**

  Choisissez le mot qui convient.

  Mon train part à dix heures. Je vais à la ___.

- **Correct answer:** `opt-2` — gare
- **Meaning / answer rationale:** On prend le train à la gare.
- **Distractor rationale:**
  - `opt-1` — plage: La plage est au bord de l’eau, pas le lieu de départ d’un train.
  - `opt-3` — poste: La poste sert notamment à envoyer du courrier.
  - `opt-4` — mairie: La mairie est un bâtiment administratif.

### fr-vocabulary-a1-004 — version 1

- **Target:** chaise.
- **Operation / topic:** `contextual_word` / `home`.
- **Source basis:** INV pp. 58–59; CV pp. 131 (vocabulary range; no A1 vocabulary-control descriptor is supplied); project guide §3 (A1) and §5.
- **Difficulty rationale:** Concrete household object selected by its ordinary function.
- **Prompt and context:**

  Choisissez le mot qui convient.

  Pour manger à table, je m’assieds sur une ___.

- **Correct answer:** `opt-4` — chaise
- **Meaning / answer rationale:** Une chaise sert à s’asseoir.
- **Distractor rationale:**
  - `opt-1` — lampe: Une lampe éclaire ; ce n’est pas un siège.
  - `opt-2` — porte: Une porte permet d’entrer et de sortir.
  - `opt-3` — assiette: Une assiette contient la nourriture ; ce n’est pas un siège.

### fr-vocabulary-a1-005 — version 1

- **Target:** manteau.
- **Operation / topic:** `contextual_word` / `clothing`.
- **Source basis:** INV pp. 58–59; CV pp. 131 (vocabulary range; no A1 vocabulary-control descriptor is supplied); project guide §3 (A1) and §5.
- **Difficulty rationale:** Identify common outerwear using concrete temperature and placement cues.
- **Prompt and context:**

  Choisissez le mot qui convient.

  Il fait froid dehors. Par-dessus mon pull, je mets un long ___ bien chaud.

- **Correct answer:** `opt-1` — manteau
- **Meaning / answer rationale:** Un manteau se porte par-dessus les autres vêtements pour se protéger du froid.
- **Distractor rationale:**
  - `opt-2` — chapeau: Un chapeau se porte sur la tête, pas par-dessus un pull.
  - `opt-3` — pantalon: Un pantalon couvre les jambes, pas le pull.
  - `opt-4` — maillot: Un maillot n’est pas le long vêtement chaud décrit.

### fr-vocabulary-a1-006 — version 1

- **Target:** clé.
- **Operation / topic:** `contextual_word` / `daily_objects`.
- **Source basis:** INV pp. 58–59; CV pp. 131 (vocabulary range; no A1 vocabulary-control descriptor is supplied); project guide §3 (A1) and §5.
- **Difficulty rationale:** Recognize a familiar personal object from a short concrete action; all options share gender.
- **Prompt and context:**

  Choisissez le mot qui convient.

  Pour ouvrir la porte de chez moi, je mets la ___ dans la serrure et je la tourne.

- **Correct answer:** `opt-3` — clé
- **Meaning / answer rationale:** La clé permet d’ouvrir la serrure de la porte.
- **Distractor rationale:**
  - `opt-1` — lettre: Une lettre ne sert pas à tourner une serrure.
  - `opt-2` — photo: Une photo ne permet pas d’ouvrir une serrure.
  - `opt-4` — cuillère: Une cuillère sert à manger, pas à ouvrir normalement une porte.

### fr-vocabulary-a1-007 — version 1

- **Target:** dormir.
- **Operation / topic:** `contextual_word` / `daily_routine`.
- **Source basis:** INV pp. 58–59; CV pp. 131 (vocabulary range; no A1 vocabulary-control descriptor is supplied); project guide §3 (A1) and §5.
- **Difficulty rationale:** Basic routine verb; all options are infinitives, so the key depends on meaning.
- **Prompt and context:**

  Choisissez le mot qui convient.

  Il est tard. Je vais au lit pour ___ jusqu’à demain matin.

- **Correct answer:** `opt-2` — dormir
- **Meaning / answer rationale:** On va au lit pour dormir pendant la nuit.
- **Distractor rationale:**
  - `opt-1` — courir: On court en se déplaçant, pas en restant au lit.
  - `opt-3` — conduire: Conduire concerne un véhicule, pas le sommeil.
  - `opt-4` — nager: Nager se fait dans l’eau, pas dans un lit.

### fr-vocabulary-a1-008 — version 1

- **Target:** acheter.
- **Operation / topic:** `contextual_word` / `shopping`.
- **Source basis:** INV pp. 58–59; CV pp. 131 (vocabulary range; no A1 vocabulary-control descriptor is supplied); project guide §3 (A1) and §5.
- **Difficulty rationale:** Concrete transaction verb contrasted with other everyday actions.
- **Prompt and context:**

  Choisissez le mot qui convient.

  Au magasin, je donne de l’argent pour ___ un livre et le garder.

- **Correct answer:** `opt-4` — acheter
- **Meaning / answer rationale:** Acheter signifie obtenir quelque chose en le payant.
- **Distractor rationale:**
  - `opt-1` — vendre: Vendre consiste à céder un bien et recevoir de l’argent.
  - `opt-2` — prêter: Prêter consiste à donner temporairement un objet à quelqu’un.
  - `opt-3` — laver: Laver signifie nettoyer, pas obtenir un objet contre de l’argent.

### fr-vocabulary-a1-009 — version 1

- **Target:** froid.
- **Operation / topic:** `contextual_word` / `weather`.
- **Source basis:** INV pp. 58–59; CV pp. 131 (vocabulary range; no A1 vocabulary-control descriptor is supplied); project guide §3 (A1) and §5.
- **Difficulty rationale:** Choose among familiar avoir expressions according to a concrete bodily sensation.
- **Prompt and context:**

  Choisissez le mot qui convient.

  En hiver, sans mon manteau, je tremble : j’ai ___.

- **Correct answer:** `opt-1` — froid
- **Meaning / answer rationale:** Avoir froid peut faire trembler ; un manteau aide à se réchauffer.
- **Distractor rationale:**
  - `opt-2` — chaud: Avoir chaud ne correspond pas au besoin d’un manteau dans ce contexte.
  - `opt-3` — faim: La faim est le besoin de manger.
  - `opt-4` — soif: La soif est le besoin de boire.

### fr-vocabulary-a1-010 — version 1

- **Target:** frère.
- **Operation / topic:** `contextual_word` / `family`.
- **Source basis:** INV pp. 58–59; CV pp. 131 (vocabulary range; no A1 vocabulary-control descriptor is supplied); project guide §3 (A1) and §5.
- **Difficulty rationale:** Basic family relation, with no knowledge of a family tree beyond one relation.
- **Prompt and context:**

  Choisissez le mot qui convient.

  Paul et moi avons les mêmes parents. Paul est mon ___.

- **Correct answer:** `opt-3` — frère
- **Meaning / answer rationale:** Un garçon qui a les mêmes parents que moi est mon frère.
- **Distractor rationale:**
  - `opt-1` — père: Le père est un parent, pas une personne qui partage les mêmes parents.
  - `opt-2` — fils: Le fils appartient à la génération suivante.
  - `opt-4` — oncle: L’oncle est le frère d’un parent.

### fr-vocabulary-a1-011 — version 1

- **Target:** demain.
- **Operation / topic:** `contextual_word` / `time`.
- **Source basis:** INV pp. 58–59; CV pp. 131 (vocabulary range; no A1 vocabulary-control descriptor is supplied); project guide §3 (A1) and §5.
- **Difficulty rationale:** Common time word grounded in an explicit day sequence.
- **Prompt and context:**

  Choisissez le mot qui convient.

  Aujourd’hui, c’est lundi. ___, c’est mardi.

- **Correct answer:** `opt-2` — Demain
- **Meaning / answer rationale:** Demain est le jour qui suit aujourd’hui.
- **Distractor rationale:**
  - `opt-1` — Hier: Hier désigne le jour précédent, donc dimanche ici.
  - `opt-3` — Maintenant: Maintenant désigne le moment présent, pas le jour suivant.
  - `opt-4` — Aujourd’hui: Aujourd’hui est lundi dans ce contexte.

### fr-vocabulary-a1-012 — version 1

- **Target:** matin.
- **Operation / topic:** `contextual_word` / `daily_routine`.
- **Source basis:** INV pp. 58–59; CV pp. 131 (vocabulary range; no A1 vocabulary-control descriptor is supplied); project guide §3 (A1) and §5.
- **Difficulty rationale:** Basic part-of-day vocabulary in a conventional routine.
- **Prompt and context:**

  Choisissez le mot qui convient.

  Je me lève à sept heures du ___, puis je prends mon petit-déjeuner.

- **Correct answer:** `opt-4` — matin
- **Meaning / answer rationale:** Le matin est le début de la journée ; on y prend généralement le petit-déjeuner.
- **Distractor rationale:**
  - `opt-1` — soir: Le contexte décrit le début de la journée et le petit-déjeuner.
  - `opt-2` — printemps: Le printemps est une saison, pas un moment de la journée.
  - `opt-3` — week-end: Le week-end est une partie de la semaine, pas le moment indiqué par sept heures.

## A2: question-by-question rationale

Routine transactions and arrangements: cancellation, postponement, reimbursement, travel, health, housing, workplace roles and common expressions.

### fr-vocabulary-a2-001 — version 1

- **Target:** annuler.
- **Operation / topic:** `contextual_word` / `appointments`.
- **Source basis:** INV pp. 59–60; CV pp. 131, 133; project guide §3 (A2) and §5.
- **Difficulty rationale:** Routine planning vocabulary; all choices are infinitives after the same pronoun.
- **Prompt and context:**

  Choisissez le mot qui convient.

  Le concert n’aura pas lieu et aucune autre date n’est prévue. Les organisateurs doivent l’___.

- **Correct answer:** `opt-1` — annuler
- **Meaning / answer rationale:** Annuler un événement signifie décider qu’il n’aura pas lieu.
- **Distractor rationale:**
  - `opt-2` — annoncer: Annoncer informe de l’existence d’un événement, pas de sa suppression.
  - `opt-3` — avancer: Avancer déplace l’événement à une date plus tôt.
  - `opt-4` — organiser: Organiser prépare l’événement au lieu de le supprimer.

### fr-vocabulary-a2-002 — version 1

- **Target:** reporter.
- **Operation / topic:** `contextual_word` / `appointments`.
- **Source basis:** INV pp. 59–60; CV pp. 131, 133; project guide §3 (A2) and §5.
- **Difficulty rationale:** Distinguish changing a date from changing duration using a clear everyday schedule.
- **Prompt and context:**

  Choisissez le mot qui convient.

  La réunion de lundi aura finalement lieu jeudi. Nous allons la ___ de trois jours.

- **Correct answer:** `opt-3` — reporter
- **Meaning / answer rationale:** Reporter une réunion, c’est la déplacer à une date ultérieure.
- **Distractor rationale:**
  - `opt-1` — prolonger: Prolonger augmente la durée, pas le délai avant le début.
  - `opt-2` — avancer: Avancer la réunion la ferait commencer plus tôt.
  - `opt-4` — raccourcir: Raccourcir réduit la durée de la réunion.

### fr-vocabulary-a2-003 — version 1

- **Target:** remboursement.
- **Operation / topic:** `contextual_word` / `shopping`.
- **Source basis:** INV pp. 59–60; CV pp. 131, 133; project guide §3 (A2) and §5.
- **Difficulty rationale:** Practical customer-service vocabulary distinguished from other transaction terms.
- **Prompt and context:**

  Choisissez le mot qui convient.

  Je rends cet appareil au magasin. Je ne veux pas un autre modèle ; je veux récupérer mon argent. Je demande un ___.

- **Correct answer:** `opt-2` — remboursement
- **Meaning / answer rationale:** Un remboursement consiste à rendre l’argent payé.
- **Distractor rationale:**
  - `opt-1` — échange: Un échange donnerait un autre produit à la place.
  - `opt-3` — supplément: Un supplément est une somme ou un élément ajouté.
  - `opt-4` — reçu: Un reçu prouve un paiement, mais ne rend pas l’argent.

### fr-vocabulary-a2-004 — version 1

- **Target:** correspondance.
- **Operation / topic:** `contextual_word` / `transport`.
- **Source basis:** INV pp. 59–60; CV pp. 131, 133; project guide §3 (A2) and §5.
- **Difficulty rationale:** Everyday travel sense of a word with other meanings; the context fixes the transport sense.
- **Prompt and context:**

  Choisissez le mot qui convient.

  Pour arriver à destination, je dois changer de train à Lyon. J’y prends ma ___.

- **Correct answer:** `opt-4` — correspondance
- **Meaning / answer rationale:** Prendre une correspondance signifie prendre un autre transport pour continuer son trajet.
- **Distractor rationale:**
  - `opt-1` — réservation: Une réservation retient une place, elle ne désigne pas le train suivant.
  - `opt-2` — livraison: Une livraison consiste à apporter un objet à un destinataire.
  - `opt-3` — promenade: Une promenade est une sortie, pas le changement de train prévu.

### fr-vocabulary-a2-005 — version 1

- **Target:** ordonnance.
- **Operation / topic:** `contextual_word` / `health`.
- **Source basis:** INV pp. 59–60; CV pp. 131, 133; project guide §3 (A2) and §5.
- **Difficulty rationale:** Common health-service noun; no medical knowledge is needed to answer.
- **Prompt and context:**

  Choisissez le mot qui convient.

  Le médecin écrit les médicaments à prendre sur une ___. Je présente ce document à la pharmacie.

- **Correct answer:** `opt-1` — ordonnance
- **Meaning / answer rationale:** Une ordonnance est le document sur lequel un professionnel habilité prescrit un traitement.
- **Distractor rationale:**
  - `opt-2` — facture: Une facture indique une somme à payer, pas les médicaments prescrits.
  - `opt-3` — invitation: Une invitation propose de participer à un événement.
  - `opt-4` — carte postale: Une carte postale sert à envoyer un message personnel.

### fr-vocabulary-a2-006 — version 1

- **Target:** loyer.
- **Operation / topic:** `contextual_word` / `housing`.
- **Source basis:** INV pp. 59–60; CV pp. 131, 133; project guide §3 (A2) and §5.
- **Difficulty rationale:** Routine housing expense contrasted with other common money-related terms.
- **Prompt and context:**

  Choisissez le mot qui convient.

  Je ne suis pas propriétaire de mon appartement. Chaque mois, je verse un ___ pour y habiter.

- **Correct answer:** `opt-3` — loyer
- **Meaning / answer rationale:** Le loyer est la somme payée pour occuper un logement loué.
- **Distractor rationale:**
  - `opt-1` — salaire: Un salaire rémunère le travail.
  - `opt-2` — pourboire: Un pourboire remercie pour un service et n’est pas le paiement du logement.
  - `opt-4` — billet: Un billet n’est pas le nom du paiement mensuel pour louer un logement.

### fr-vocabulary-a2-007 — version 1

- **Target:** collègue.
- **Operation / topic:** `contextual_word` / `work`.
- **Source basis:** INV pp. 59–60; CV pp. 131, 133; project guide §3 (A2) and §5.
- **Difficulty rationale:** Choose the relationship named by the workplace context, without assuming additional social relationships.
- **Prompt and context:**

  Choisissez le mot qui convient.

  Nous travaillons dans la même équipe au bureau. Salomé est ma ___.

- **Correct answer:** `opt-2` — collègue
- **Meaning / answer rationale:** Une collègue est une personne avec qui l’on travaille.
- **Distractor rationale:**
  - `opt-1` — cliente: Une cliente achète un produit ou un service ; ce n’est pas le rôle décrit.
  - `opt-3` — voisine: Une voisine habite à proximité ; le contexte porte sur le travail.
  - `opt-4` — cousine: Une cousine a un lien familial ; aucun lien de famille n’est indiqué.

### fr-vocabulary-a2-008 — version 1

- **Target:** disponible.
- **Operation / topic:** `contextual_word` / `services`.
- **Source basis:** INV pp. 59–60; CV pp. 131, 133; project guide §3 (A2) and §5.
- **Difficulty rationale:** Common service availability adjective; all alternatives have the same feminine form.
- **Prompt and context:**

  Choisissez le mot qui convient.

  Cette chambre n’est pas réservée pour ce soir. Vous pouvez la prendre : elle est ___.

- **Correct answer:** `opt-4` — disponible
- **Meaning / answer rationale:** Une chambre disponible peut être réservée ou utilisée.
- **Distractor rationale:**
  - `opt-1` — occupée: Occupée signifie que quelqu’un utilise déjà la chambre.
  - `opt-2` — fermée: Fermée ne signifie pas qu’on peut la prendre ce soir.
  - `opt-3` — bruyante: Bruyante décrit le bruit, pas la possibilité de réserver.

### fr-vocabulary-a2-009 — version 1

- **Target:** retrouver.
- **Operation / topic:** `contextual_word` / `daily_objects`.
- **Source basis:** INV pp. 59–60; CV pp. 131, 133; project guide §3 (A2) and §5.
- **Difficulty rationale:** Routine experience expressed with a simple past-to-present sequence.
- **Prompt and context:**

  Choisissez le mot qui convient.

  J’avais perdu mes lunettes. Après les avoir cherchées partout, je viens de les ___ sous le canapé.

- **Correct answer:** `opt-1` — retrouver
- **Meaning / answer rationale:** Retrouver un objet perdu signifie le découvrir après l’avoir cherché.
- **Distractor rationale:**
  - `opt-2` — prêter: Prêter ne signifie pas découvrir un objet perdu.
  - `opt-3` — réparer: Réparer concerne un objet abîmé, pas un objet que l’on cherchait.
  - `opt-4` — casser: Casser abîme un objet, au lieu de le découvrir.

### fr-vocabulary-a2-010 — version 1

- **Target:** rarement.
- **Operation / topic:** `contextual_word` / `frequency`.
- **Source basis:** INV pp. 59–60; CV pp. 131, 133; project guide §3 (A2) and §5.
- **Difficulty rationale:** Recognize a common frequency paraphrase; distractors represent higher frequencies.
- **Prompt and context:**

  Choisissez le mot qui convient.

  Je vais très peu au cinéma, une seule fois dans l’année. J’y vais ___.

- **Correct answer:** `opt-3` — rarement
- **Meaning / answer rationale:** Rarement signifie peu souvent.
- **Distractor rationale:**
  - `opt-1` — souvent: Souvent exprime une fréquence élevée.
  - `opt-2` — quotidiennement: Quotidiennement signifie chaque jour.
  - `opt-4` — constamment: Constamment indique une présence ou une répétition presque permanente.

### fr-vocabulary-a2-011 — version 1

- **Target:** aimable.
- **Operation / topic:** `contextual_word` / `description`.
- **Source basis:** INV pp. 59–60; CV pp. 131, 133; project guide §3 (A2) and §5.
- **Difficulty rationale:** Basic character description supported by observable everyday behavior.
- **Prompt and context:**

  Choisissez le mot qui convient.

  La vendeuse nous sourit et répond gentiment à nos questions. Elle est très ___.

- **Correct answer:** `opt-2` — aimable
- **Meaning / answer rationale:** Une personne aimable est agréable et gentille avec les autres.
- **Distractor rationale:**
  - `opt-1` — impolie: Impolie contredit la manière gentille et souriante décrite.
  - `opt-3` — mécontente: Mécontente exprime l’insatisfaction, pas la qualité de l’accueil.
  - `opt-4` — distraite: Distraite décrit un manque d’attention, pas la gentillesse.

### fr-vocabulary-a2-012 — version 1

- **Target:** prendre rendez-vous.
- **Operation / topic:** `collocation` / `appointments`.
- **Source basis:** INV pp. 59–60; CV pp. 131, 133; project guide §3 (A2) and §5.
- **Difficulty rationale:** Common lexical chunk for a routine service interaction; all choices are infinitives.
- **Prompt and context:**

  Choisissez le mot qui convient.

  Je téléphone au cabinet du dentiste pour ___ rendez-vous.

- **Correct answer:** `opt-4` — prendre
- **Meaning / answer rationale:** On dit « prendre rendez-vous » pour fixer un moment où rencontrer quelqu’un.
- **Distractor rationale:**
  - `opt-1` — rendre: Rendre rendez-vous n’est pas l’expression employée pour fixer une consultation.
  - `opt-2` — tenir: Tenir rendez-vous n’est pas l’expression employée ici.
  - `opt-3` — porter: Porter rendez-vous n’est pas l’expression employée ici.

## B1: question-by-question rationale

Familiar experiences and opinions: emotions, employment, plans, money, relationships, everyday figurative meanings and lexical chunks.

### fr-vocabulary-b1-001 — version 1

- **Target:** soulagé.
- **Operation / topic:** `contextual_word` / `feelings`.
- **Source basis:** INV pp. 60–61; CV pp. 131, 133; project guide §3 (B1) and §5.
- **Difficulty rationale:** Familiar emotional vocabulary distinguished by the change from worry to relief.
- **Prompt and context:**

  Choisissez le mot qui convient.

  Marc craignait d’avoir perdu son chat. Il vient de le retrouver en bonne santé et ne ressent plus cette inquiétude : il est ___.

- **Correct answer:** `opt-1` — soulagé
- **Meaning / answer rationale:** Être soulagé, c’est éprouver un apaisement après la fin d’une inquiétude.
- **Distractor rationale:**
  - `opt-2` — déçu: Déçu indique qu’une attente n’a pas été satisfaite.
  - `opt-3` — méfiant: Méfiant signifie qu’on manque de confiance.
  - `opt-4` — jaloux: Jaloux renvoie à la crainte de perdre une relation ou à l’envie de ce qu’un autre possède.

### fr-vocabulary-b1-002 — version 1

- **Target:** déçue.
- **Operation / topic:** `contextual_word` / `culture`.
- **Source basis:** INV pp. 60–61; CV pp. 131, 133; project guide §3 (B1) and §5.
- **Difficulty rationale:** Interpret an emotional evaluation of a familiar cultural experience.
- **Prompt and context:**

  Choisissez le mot qui convient.

  Lina attendait beaucoup de ce film, mais elle l’a trouvé ennuyeux. Le film n’a pas répondu à ses attentes : elle est ___.

- **Correct answer:** `opt-3` — déçue
- **Meaning / answer rationale:** Une personne déçue constate que ce qu’elle espérait ne s’est pas réalisé.
- **Distractor rationale:**
  - `opt-1` — rassurée: Rassurée signifie qu’une crainte a diminué, pas qu’une attente a été déçue.
  - `opt-2` — émerveillée: Émerveillée exprime une admiration intense, contraire au jugement décrit.
  - `opt-4` — reconnaissante: Reconnaissante exprime la gratitude.

### fr-vocabulary-b1-003 — version 1

- **Target:** renoncer à.
- **Operation / topic:** `meaning_in_context` / `plans`.
- **Source basis:** INV pp. 60–61; CV pp. 131, 133; project guide §3 (B1) and §5.
- **Difficulty rationale:** Recognize a familiar intention/change-of-plan expression in context.
- **Prompt and context:**

  Dans ce contexte, que signifie « renoncer à » ?

  Le voyage dépasse largement son budget. Après plusieurs calculs, Amir décide de renoncer à ce projet.

- **Correct answer:** `opt-2` — Abandonner ce projet.
- **Meaning / answer rationale:** Renoncer à un projet signifie décider de ne pas le réaliser.
- **Distractor rationale:**
  - `opt-1` — Préparer ce projet plus rapidement.: Renoncer signifie ne plus poursuivre le projet.
  - `opt-3` — Réserver ce projet pour ses amis.: Il ne s’agit pas de transférer le projet à quelqu’un.
  - `opt-4` — Rendre ce projet plus coûteux.: Le coût motive la décision, mais renoncer ne signifie pas augmenter ce coût.

### fr-vocabulary-b1-004 — version 1

- **Target:** embaucher.
- **Operation / topic:** `meaning_in_context` / `work`.
- **Source basis:** INV pp. 60–61; CV pp. 131, 133; project guide §3 (B1) and §5. INV p. 87 also includes B1 employment examples with embaucher.
- **Difficulty rationale:** Employment vocabulary explicitly represented in the inventory’s B1 work examples.
- **Prompt and context:**

  Dans cette phrase, que signifie « embaucher » ?

  Pour ouvrir un nouveau rayon, le magasin va embaucher deux vendeurs.

- **Correct answer:** `opt-4` — Recruter deux personnes pour y travailler.
- **Meaning / answer rationale:** Embaucher quelqu’un signifie le recruter comme salarié.
- **Distractor rationale:**
  - `opt-1` — Mettre fin au contrat de deux personnes.: Il s’agirait de licencier ou de laisser partir des salariés.
  - `opt-2` — Accorder des congés à deux personnes.: Embaucher concerne l’entrée dans un emploi, pas les congés.
  - `opt-3` — Former deux clients à utiliser un produit.: Les personnes embauchées deviennent salariées, pas clientes en formation.

### fr-vocabulary-b1-005 — version 1

- **Target:** déménager.
- **Operation / topic:** `contextual_word` / `housing`.
- **Source basis:** INV pp. 60–61; CV pp. 131, 133; project guide §3 (B1) and §5.
- **Difficulty rationale:** Common life-event verb, distinguished from other activities and travel.
- **Prompt and context:**

  Choisissez le mot qui convient.

  Nous quittons notre logement de Lille pour habiter à Rennes. Ce week-end, nous allons ___ avec tous nos meubles.

- **Correct answer:** `opt-1` — déménager
- **Meaning / answer rationale:** Déménager signifie changer de domicile et déplacer ses affaires.
- **Distractor rationale:**
  - `opt-2` — voyager: Voyager ne désigne pas spécifiquement un changement de domicile avec ses meubles.
  - `opt-3` — bricoler: Bricoler consiste à effectuer de petits travaux.
  - `opt-4` — camper: Camper signifie séjourner dans une tente ou une installation de camping.

### fr-vocabulary-b1-006 — version 1

- **Target:** économiser.
- **Operation / topic:** `contextual_word` / `money`.
- **Source basis:** INV pp. 60–61; CV pp. 131, 133; project guide §3 (B1) and §5.
- **Difficulty rationale:** Distinguish familiar financial actions from the described saving strategy.
- **Prompt and context:**

  Choisissez le mot qui convient.

  Pour acheter un vélo dans quelques mois, je mets chaque semaine une petite somme de côté. Je voudrais ___ assez d’argent.

- **Correct answer:** `opt-3` — économiser
- **Meaning / answer rationale:** Économiser de l’argent, dans ce contexte, signifie le mettre de côté pour un usage futur.
- **Distractor rationale:**
  - `opt-1` — emprunter: Emprunter consiste à recevoir de l’argent qu’il faudra rendre.
  - `opt-2` — dépenser: Dépenser utilise l’argent au lieu de le mettre de côté.
  - `opt-4` — rembourser: Rembourser consiste à rendre une somme due.

### fr-vocabulary-b1-007 — version 1

- **Target:** se rendre compte.
- **Operation / topic:** `collocation` / `daily_life`.
- **Source basis:** INV pp. 60–61; CV pp. 131, 133; project guide §3 (B1) and §5.
- **Difficulty rationale:** B1 candidate: familiar lexical chunk for awareness in a practical experience; alternatives are other nouns in rendre expressions, not conjugations.
- **Prompt and context:**

  Choisissez le mot qui complète l’expression.

  En vérifiant sa facture, Léa s’aperçoit d’une erreur. Elle vient de se rendre ___ qu’un article a été compté deux fois.

- **Correct answer:** `opt-2` — compte
- **Meaning / answer rationale:** « Se rendre compte » signifie prendre conscience de quelque chose ou s’en apercevoir.
- **Distractor rationale:**
  - `opt-1` — service: Se rendre service signifie s’aider, pas découvrir une erreur.
  - `opt-3` — visite: Se rendre visite désigne une rencontre, pas une prise de conscience.
  - `opt-4` — raison: Se rendre raison ne forme pas l’expression signifiant s’apercevoir de quelque chose.

### fr-vocabulary-b1-008 — version 1

- **Target:** se plaindre.
- **Operation / topic:** `meaning_in_context` / `services`.
- **Source basis:** INV pp. 60–61; CV pp. 131, 133; project guide §3 (B1) and §5.
- **Difficulty rationale:** Identify a common communicative action within a service problem.
- **Prompt and context:**

  Que signifie l’expression « se plaindre » dans ce contexte ?

  Le chauffage de l’hôtel ne fonctionne toujours pas. Les clients vont à l’accueil pour se plaindre.

- **Correct answer:** `opt-4` — Exprimer leur mécontentement.
- **Meaning / answer rationale:** Se plaindre consiste ici à exprimer son insatisfaction à propos du chauffage.
- **Distractor rationale:**
  - `opt-1` — Faire part de leur gratitude.: La gratitude correspond à remercier, pas à se plaindre.
  - `opt-2` — Demander pardon pour leur comportement.: Il s’agirait de s’excuser.
  - `opt-3` — Féliciter le personnel pour son travail.: Féliciter exprime une appréciation positive.

### fr-vocabulary-b1-009 — version 1

- **Target:** en panne.
- **Operation / topic:** `meaning_in_context` / `daily_life`.
- **Source basis:** INV pp. 60–61; CV pp. 131, 133; project guide §3 (B1) and §5.
- **Difficulty rationale:** Recognize a common fixed expression using an explicit everyday symptom.
- **Prompt and context:**

  Que signifie « en panne » ici ?

  La voiture est en panne : le moteur ne démarre plus.

- **Correct answer:** `opt-1` — Elle ne fonctionne plus normalement.
- **Meaning / answer rationale:** Un appareil ou un véhicule en panne ne fonctionne plus correctement.
- **Distractor rationale:**
  - `opt-2` — Elle est arrivée après l’heure prévue.: Il s’agirait d’un retard, pas nécessairement d’une panne.
  - `opt-3` — Elle est garée à l’endroit prévu.: Une voiture garée peut fonctionner normalement.
  - `opt-4` — Elle est en vente chez un professionnel.: La panne ne signifie pas que le véhicule est à vendre.

### fr-vocabulary-b1-010 — version 1

- **Target:** d’occasion.
- **Operation / topic:** `meaning_in_context` / `shopping`.
- **Source basis:** INV pp. 60–61; CV pp. 131, 133; project guide §3 (B1) and §5.
- **Difficulty rationale:** Interpret a familiar multiword expression rather than a different sense of occasion.
- **Prompt and context:**

  Que veut dire « d’occasion » dans cette annonce ?

  Vélo d’occasion : acheté neuf il y a deux ans, utilisé chaque semaine, bon état.

- **Correct answer:** `opt-3` — Déjà utilisé par un propriétaire précédent.
- **Meaning / answer rationale:** Un objet d’occasion a déjà appartenu ou servi à quelqu’un avant sa revente.
- **Distractor rationale:**
  - `opt-1` — Fabriqué spécialement pour une fête.: Une occasion peut désigner un événement, mais pas dans cette expression.
  - `opt-2` — Jamais utilisé depuis sa fabrication.: L’annonce précise qu’il a servi chaque semaine.
  - `opt-4` — Disponible uniquement à la location.: D’occasion décrit l’usage antérieur, pas une location.

### fr-vocabulary-b1-011 — version 1

- **Target:** s’entendre bien.
- **Operation / topic:** `meaning_in_context` / `relationships`.
- **Source basis:** INV pp. 60–61; CV pp. 131, 133; project guide §3 (B1) and §5.
- **Difficulty rationale:** Distinguish the interpersonal sense of a familiar verb from literal hearing and agreement.
- **Prompt and context:**

  Que signifie « s’entendent bien » dans cette phrase ?

  Même s’ils ne sont pas toujours du même avis, les deux collègues s’entendent bien et aiment travailler ensemble.

- **Correct answer:** `opt-2` — Ils ont de bonnes relations.
- **Meaning / answer rationale:** Bien s’entendre avec quelqu’un signifie avoir de bonnes relations avec cette personne.
- **Distractor rationale:**
  - `opt-1` — Ils ont exactement les mêmes opinions.: Le texte précise qu’ils ne sont pas toujours du même avis.
  - `opt-3` — Ils parlent assez fort pour être entendus.: Le sens relationnel, pas auditif, est visé ici.
  - `opt-4` — Ils travaillent toujours dans le même bureau.: Une bonne entente n’implique pas le même lieu de travail.

### fr-vocabulary-b1-012 — version 1

- **Target:** donner son avis.
- **Operation / topic:** `collocation` / `opinions`.
- **Source basis:** INV pp. 60–61; CV pp. 131, 133; project guide §3 (B1) and §5.
- **Difficulty rationale:** Common opinion collocation with related-looking lexical distractors, all masculine nouns.
- **Prompt and context:**

  Choisissez le mot qui convient.

  Après la visite, chacun peut dire ce qu’il a aimé ou non et donner son ___ sur l’exposition.

- **Correct answer:** `opt-4` — avis
- **Meaning / answer rationale:** Donner son avis signifie exprimer son opinion.
- **Distractor rationale:**
  - `opt-1` — devis: Un devis présente une estimation de prix.
  - `opt-2` — préavis: Un préavis annonce à l’avance une fin de contrat ou un départ.
  - `opt-3` — récit: Un récit raconte des événements ; donner son récit n’est pas l’expression pour exprimer une opinion.

## B2: question-by-question rationale

Broader social and professional topics: semantic precision, argumentative lexis, collocations, figurative meaning and context-dependent senses.

### fr-vocabulary-b2-001 — version 1

- **Target:** atténuer.
- **Operation / topic:** `semantic_precision` / `social_issues`.
- **Source basis:** INV pp. 61–63; CV pp. 131–132; project guide §3 (B2) and §5.
- **Difficulty rationale:** Distinguish degrees and mechanisms of change in a social-policy context.
- **Prompt and context:**

  Choisissez le verbe le plus précis.

  La nouvelle aide ne supprime pas les difficultés des familles, mais elle en réduit l’intensité. Elle permet de les ___.

- **Correct answer:** `opt-1` — atténuer
- **Meaning / answer rationale:** Atténuer signifie rendre moins intense, sans nécessairement supprimer.
- **Distractor rationale:**
  - `opt-2` — aggraver: Aggraver rend les difficultés plus fortes.
  - `opt-3` — résoudre: Résoudre ferait disparaître le problème, contrairement à la limite indiquée.
  - `opt-4` — dissimuler: Dissimuler empêche de voir les difficultés, sans les réduire.

### fr-vocabulary-b2-002 — version 1

- **Target:** compromis.
- **Operation / topic:** `contextual_word` / `negotiation`.
- **Source basis:** INV pp. 61–63; CV pp. 131–132; project guide §3 (B2) and §5.
- **Difficulty rationale:** Lexis of negotiation and argument; distinguish agreement through concessions from other outcomes.
- **Prompt and context:**

  Choisissez le mot qui convient.

  Chaque partie accepte d’abandonner une partie de ses exigences pour parvenir à un accord. Elles trouvent un ___.

- **Correct answer:** `opt-3` — compromis
- **Meaning / answer rationale:** Un compromis est un accord obtenu grâce à des concessions réciproques.
- **Distractor rationale:**
  - `opt-1` — ultimatum: Un ultimatum impose une exigence finale plutôt que des concessions réciproques.
  - `opt-2` — report: Un report déplace une décision dans le temps sans constituer l’accord décrit.
  - `opt-4` — constat: Un constat décrit une situation sans établir nécessairement un accord.

### fr-vocabulary-b2-003 — version 1

- **Target:** prendre en compte.
- **Operation / topic:** `collocation` / `decision_making`.
- **Source basis:** INV pp. 61–63; CV pp. 131–132; project guide §3 (B2) and §5.
- **Difficulty rationale:** Select a conventional collocation and distinguish considering needs from taking responsibility for them.
- **Prompt and context:**

  Choisissez le mot qui complète l’expression.

  Pour décider des horaires, la mairie doit prendre en ___ les besoins des habitants, c’est-à-dire les considérer dans sa réflexion.

- **Correct answer:** `opt-2` — compte
- **Meaning / answer rationale:** Prendre en compte un élément signifie le considérer dans sa réflexion ou sa décision.
- **Distractor rationale:**
  - `opt-1` — cause: Prendre en cause n’est pas l’expression signifiant considérer un élément.
  - `opt-3` — place: Prendre en place ne forme pas cette expression.
  - `opt-4` — charge: Prendre en charge signifie assumer la responsabilité ou le coût, pas simplement considérer les besoins dans une décision.

### fr-vocabulary-b2-004 — version 1

- **Target:** mettre en œuvre.
- **Operation / topic:** `collocation` / `work`.
- **Source basis:** INV pp. 61–63; CV pp. 131–132; project guide §3 (B2) and §5.
- **Difficulty rationale:** Recognize an implementation collocation among other grammatically valid mettre en expressions.
- **Prompt and context:**

  Choisissez le mot qui complète l’expression.

  Le plan a été approuvé. Les équipes vont maintenant le mettre en ___, c’est-à-dire passer à son application.

- **Correct answer:** `opt-4` — œuvre
- **Meaning / answer rationale:** Mettre en œuvre un plan signifie l’appliquer concrètement.
- **Distractor rationale:**
  - `opt-1` — doute: Mettre en doute consiste à contester, pas à appliquer.
  - `opt-2` — vente: Mettre en vente signifie proposer à l’achat.
  - `opt-3` — cause: Mettre en cause remet en question ou implique une responsabilité, sans signifier appliquer.

### fr-vocabulary-b2-005 — version 1

- **Target:** contester.
- **Operation / topic:** `semantic_precision` / `argumentation`.
- **Source basis:** INV pp. 61–63; CV pp. 131–132; project guide §3 (B2) and §5.
- **Difficulty rationale:** Argumentative verb tied to a specific stance rather than a generic action.
- **Prompt and context:**

  Choisissez le verbe qui convient.

  L’association affirme que la décision est injustifiée et demande qu’elle soit réexaminée. Elle la ___.

- **Correct answer:** `opt-1` — conteste
- **Meaning / answer rationale:** Contester une décision signifie en remettre en cause le bien-fondé ou la validité.
- **Distractor rationale:**
  - `opt-2` — approuve: Approuver revient à accepter ou soutenir la décision.
  - `opt-3` — applique: Appliquer signifie exécuter la décision, pas en discuter le bien-fondé.
  - `opt-4` — reproduit: Reproduire signifie refaire ou copier, pas remettre en question.

### fr-vocabulary-b2-006 — version 1

- **Target:** marge de manœuvre.
- **Operation / topic:** `meaning_in_context` / `work`.
- **Source basis:** INV pp. 61–63; CV pp. 131–132; project guide §3 (B2) and §5.
- **Difficulty rationale:** Interpret a figurative expression in a professional context with explicit constraints.
- **Prompt and context:**

  Que signifie « marge de manœuvre » ici ?

  Le budget total est fixé, mais la responsable garde une marge de manœuvre pour répartir les dépenses entre les activités.

- **Correct answer:** `opt-3` — Une liberté de décision à l’intérieur de certaines limites.
- **Meaning / answer rationale:** Une marge de manœuvre est une possibilité d’agir ou de choisir malgré des contraintes.
- **Distractor rationale:**
  - `opt-1` — Une somme supplémentaire qui augmente automatiquement le budget.: Le budget total reste fixé.
  - `opt-2` — Un délai obligatoire avant toute décision.: L’expression ne désigne pas un délai.
  - `opt-4` — Une obligation de répartir toutes les dépenses à parts égales.: La marge de manœuvre permet au contraire certains choix de répartition.

### fr-vocabulary-b2-007 — version 1

- **Target:** pertinent.
- **Operation / topic:** `semantic_precision` / `argumentation`.
- **Source basis:** INV pp. 61–63; CV pp. 131–132; project guide §3 (B2) and §5.
- **Difficulty rationale:** Choose an evaluative adjective for relevance rather than profitability, duration or marginality.
- **Prompt and context:**

  Choisissez l’adjectif qui convient.

  Cet exemple répond directement à la question discutée et aide à comprendre l’argument. Il est particulièrement ___.

- **Correct answer:** `opt-2` — pertinent
- **Meaning / answer rationale:** Un exemple pertinent est adapté à la question et utile pour l’éclairer.
- **Distractor rationale:**
  - `opt-1` — rentable: Rentable décrit un gain financier ou un rendement, pas le rapport à une question.
  - `opt-3` — provisoire: Provisoire signifie temporaire.
  - `opt-4` — anecdotique: Anecdotique renvoie souvent à un détail secondaire ; ce n’est pas la qualité décrite ici.

### fr-vocabulary-b2-008 — version 1

- **Target:** pénurie.
- **Operation / topic:** `semantic_precision` / `economy`.
- **Source basis:** INV pp. 61–63; CV pp. 131–132; project guide §3 (B2) and §5.
- **Difficulty rationale:** Broader societal vocabulary expressing a supply/need relationship in context.
- **Prompt and context:**

  Choisissez le mot qui convient.

  Les besoins en logements dépassent largement le nombre de logements disponibles. La ville connaît une ___ de logements.

- **Correct answer:** `opt-4` — pénurie
- **Meaning / answer rationale:** Une pénurie est une insuffisance de ressources disponibles par rapport aux besoins.
- **Distractor rationale:**
  - `opt-1` — abondance: L’abondance correspond à une grande quantité disponible, contraire au manque décrit.
  - `opt-2` — stabilité: La stabilité désigne l’absence de changement important, pas l’insuffisance.
  - `opt-3` — diversité: La diversité décrit la variété, pas le rapport entre l’offre et les besoins.

### fr-vocabulary-b2-009 — version 1

- **Target:** une source.
- **Operation / topic:** `meaning_in_context` / `media`.
- **Source basis:** INV pp. 61–63; CV pp. 131–132; project guide §3 (B2) and §5.
- **Difficulty rationale:** Context-sensitive polysemy in a media setting, without requiring journalistic technical knowledge.
- **Prompt and context:**

  Dans ce contexte, que désigne « une source » ?

  Avant de publier l’article, la journaliste vérifie la fiabilité de chaque source utilisée pour établir les faits.

- **Correct answer:** `opt-1` — Une personne ou un document dont provient une information.
- **Meaning / answer rationale:** En journalisme, une source est à l’origine d’une information utilisée.
- **Distractor rationale:**
  - `opt-2` — Un lieu où l’eau sort naturellement du sol.: C’est un autre sens de source, absent du contexte journalistique.
  - `opt-3` — Une version imprimée du journal destinée aux lecteurs.: La source fournit l’information ; elle n’est pas nécessairement le journal publié.
  - `opt-4` — Une correction de la mise en page avant l’impression.: La source concerne l’origine de l’information, pas la présentation.

### fr-vocabulary-b2-010 — version 1

- **Target:** durable.
- **Operation / topic:** `semantic_precision` / `environment`.
- **Source basis:** INV pp. 61–63; CV pp. 131–132; project guide §3 (B2) and §5.
- **Difficulty rationale:** Connect duration and resource preservation in a general environmental context.
- **Prompt and context:**

  Choisissez l’adjectif qui convient.

  La commune cherche une solution qui puisse fonctionner longtemps sans épuiser les ressources dont elle dépend : une solution ___.

- **Correct answer:** `opt-3` — durable
- **Meaning / answer rationale:** Durable désigne ici une solution qui peut se maintenir dans le temps en préservant ses ressources.
- **Distractor rationale:**
  - `opt-1` — provisoire: Provisoire indique une solution temporaire.
  - `opt-2` — instantanée: Instantanée concerne l’immédiateté, pas le maintien dans le temps.
  - `opt-4` — éphémère: Éphémère signifie de très courte durée.

### fr-vocabulary-b2-011 — version 1

- **Target:** remettre en question.
- **Operation / topic:** `collocation` / `argumentation`.
- **Source basis:** INV pp. 61–63; CV pp. 131–132; project guide §3 (B2) and §5.
- **Difficulty rationale:** Recognize a conventional argumentative expression without overstating it as definitive rejection.
- **Prompt and context:**

  Que signifie « remettre en question » dans cette phrase ?

  Ces nouveaux résultats conduisent les chercheurs à remettre en question leur première explication.

- **Correct answer:** `opt-2` — Réexaminer sa validité au lieu de la tenir pour acquise.
- **Meaning / answer rationale:** Remettre une explication en question, c’est réexaminer son bien-fondé.
- **Distractor rationale:**
  - `opt-1` — La répéter sous la forme d’une question sans en changer l’évaluation.: L’expression porte sur le doute ou le réexamen, pas sur la ponctuation.
  - `opt-3` — La considérer comme définitivement démontrée.: Cela est contraire au réexamen de sa validité.
  - `opt-4` — Interdire à d’autres personnes de l’étudier.: L’expression ne signifie pas empêcher l’examen.

### fr-vocabulary-b2-012 — version 1

- **Target:** incitatif.
- **Operation / topic:** `semantic_precision` / `public_policy`.
- **Source basis:** INV pp. 61–63; CV pp. 131–132; project guide §3 (B2) and §5.
- **Difficulty rationale:** B2 candidate: distinguish encouragement through an incentive from coercion, punishment and deterrence in public-policy vocabulary.
- **Prompt and context:**

  Choisissez l’adjectif le plus précis.

  La mesure offre une réduction aux personnes qui choisissent le vélo, sans imposer ce choix ni sanctionner les autres. Ce dispositif est ___.

- **Correct answer:** `opt-4` — incitatif
- **Meaning / answer rationale:** Un dispositif incitatif encourage un comportement, notamment par un avantage, sans l’imposer.
- **Distractor rationale:**
  - `opt-1` — coercitif: Coercitif impose ou contraint, alors que le choix reste libre.
  - `opt-2` — répressif: Répressif vise la sanction d’un comportement, absente ici.
  - `opt-3` — dissuasif: Dissuasif vise à décourager un comportement ; ici l’avantage encourage explicitement le choix du vélo.

## C1: question-by-question rationale

Precise evidential and evaluative vocabulary, professional register, connotation and idiomatic language; preserve the strength and scope of a claim.

### fr-vocabulary-c1-001 — version 1

- **Target:** corroborer.
- **Operation / topic:** `semantic_precision` / `evidence`.
- **Source basis:** INV pp. 63; CV pp. 131–132; project guide §3 (C1) and §5.
- **Difficulty rationale:** C1 candidate: precise evidential verb; distinguish supporting, assuming, limiting and refuting a claim.
- **Prompt and context:**

  Choisissez le verbe le plus précis.

  Deux témoignages indépendants concordent avec l’hypothèse initiale et lui apportent un soutien supplémentaire, sans constituer à eux seuls une démonstration définitive. Ils viennent la ___.

- **Correct answer:** `opt-1` — corroborer
- **Meaning / answer rationale:** Corroborer signifie renforcer une affirmation par des éléments concordants, sans impliquer nécessairement une preuve définitive.
- **Distractor rationale:**
  - `opt-2` — réfuter: Réfuter vise à montrer qu’une proposition est fausse, à l’inverse du soutien décrit.
  - `opt-3` — présupposer: Présupposer consiste à tenir une proposition pour admise au départ, pas à lui apporter un nouvel appui.
  - `opt-4` — relativiser: Relativiser limite la portée d’une proposition, alors que ces témoignages la renforcent.

### fr-vocabulary-c1-002 — version 1

- **Target:** inférer.
- **Operation / topic:** `semantic_precision` / `reasoning`.
- **Source basis:** INV pp. 63; CV pp. 131–132; project guide §3 (C1) and §5.
- **Difficulty rationale:** C1 candidate: distinguish indirect reasoned knowledge from direct observation, prescription and invention.
- **Prompt and context:**

  Choisissez le verbe le plus précis.

  La chercheuse n’a pas observé directement le départ des habitants. Elle le déduit de plusieurs indices concordants relevés dans les archives. Ces indices lui permettent de l’___.

- **Correct answer:** `opt-3` — inférer
- **Meaning / answer rationale:** Inférer consiste à tirer une conclusion à partir d’indices ou de propositions.
- **Distractor rationale:**
  - `opt-1` — observer: Observer directement est précisément exclu par le contexte.
  - `opt-2` — ordonner: Ordonner le départ serait le provoquer par une instruction, pas le déduire.
  - `opt-4` — inventer: Inventer ne désigne pas une conclusion raisonnée à partir d’indices.

### fr-vocabulary-c1-003 — version 1

- **Target:** équivoque.
- **Operation / topic:** `semantic_precision` / `communication`.
- **Source basis:** INV pp. 63; CV pp. 131–132; project guide §3 (C1) and §5.
- **Difficulty rationale:** C1 candidate: lexical precision between ambiguity, explicitness, firmness and dogmatism.
- **Prompt and context:**

  Choisissez l’adjectif le plus précis.

  La réponse a été rédigée de telle façon qu’elle peut se comprendre comme un accord ou comme un refus ; sa formulation laisse subsister les deux lectures. Elle est ___.

- **Correct answer:** `opt-2` — équivoque
- **Meaning / answer rationale:** Une réponse équivoque permet plusieurs interprétations et entretient une ambiguïté.
- **Distractor rationale:**
  - `opt-1` — explicite: Explicite signifie clairement formulée, ce qui exclurait ici l’ambiguïté décrite.
  - `opt-3` — catégorique: Catégorique exprime une position nette, sans cette hésitation entre deux lectures.
  - `opt-4` — péremptoire: Péremptoire décrit une affirmation imposée sans admettre de discussion, pas une double interprétation.

### fr-vocabulary-c1-004 — version 1

- **Target:** péremptoire.
- **Operation / topic:** `connotation` / `argumentation`.
- **Source basis:** INV pp. 63; CV pp. 131–132; project guide §3 (C1) and §5.
- **Difficulty rationale:** C1 candidate: identify evaluative connotation and interpersonal stance, not merely certainty.
- **Prompt and context:**

  Choisissez l’adjectif qui décrit le mieux le ton.

  « Il n’y a rien à discuter : j’ai raison, un point c’est tout. » L’intervenant assène son avis comme une vérité qui n’admet aucune objection. Son ton est ___.

- **Correct answer:** `opt-4` — péremptoire
- **Meaning / answer rationale:** Un ton péremptoire présente une affirmation comme incontestable et ferme la discussion.
- **Distractor rationale:**
  - `opt-1` — circonspect: Circonspect exprime la prudence, contraire à l’absence de réserve.
  - `opt-2` — conciliant: Conciliant exprime la recherche d’un accord ou de concessions.
  - `opt-3` — nuancé: Nuancé introduit des distinctions ou des réserves plutôt qu’une affirmation absolue.

### fr-vocabulary-c1-005 — version 1

- **Target:** émettre des réserves.
- **Operation / topic:** `register` / `professional_communication`.
- **Source basis:** INV pp. 63; CV pp. 131–132; project guide §3 (C1) and §5.
- **Difficulty rationale:** C1 candidate: choose a professional lexical formulation preserving the exact degree of commitment.
- **Prompt and context:**

  Dans un compte rendu professionnel, quelle formulation exprime des doutes précis sans transformer ceux-ci en refus définitif ?

  Le comité soutient l’objectif, mais doute de la faisabilité du calendrier et demande des garanties avant de s’engager.

- **Correct answer:** `opt-1` — Le comité émet des réserves sur le calendrier proposé.
- **Meaning / answer rationale:** Émettre des réserves signifie formuler des objections ou des limites à son adhésion, sans nécessairement refuser.
- **Distractor rationale:**
  - `opt-2` — Le comité oppose un refus catégorique au calendrier proposé.: Cette formulation transforme une réserve conditionnelle en rejet définitif.
  - `opt-3` — Le comité donne son aval sans réserve au calendrier proposé.: Elle efface les doutes et la demande de garanties.
  - `opt-4` — Le comité se désintéresse du calendrier proposé.: Elle exprime un manque d’intérêt, pas un soutien assorti de doutes.

### fr-vocabulary-c1-006 — version 1

- **Target:** nuancer.
- **Operation / topic:** `semantic_precision` / `argumentation`.
- **Source basis:** INV pp. 63; CV pp. 131–132; project guide §3 (C1) and §5.
- **Difficulty rationale:** C1 candidate: discriminate qualification from withdrawal, repetition and evasion.
- **Prompt and context:**

  Choisissez le verbe le plus précis.

  L’autrice maintient son analyse générale, mais distingue désormais plusieurs cas et ajoute des limites à certaines conclusions. Elle souhaite ainsi ___ son propos.

- **Correct answer:** `opt-3` — nuancer
- **Meaning / answer rationale:** Nuancer consiste à introduire des distinctions ou des réserves qui rendent un propos moins absolu.
- **Distractor rationale:**
  - `opt-1` — rétracter: Rétracter son propos reviendrait à le retirer, alors que l’analyse générale est maintenue.
  - `opt-2` — réitérer: Réitérer consiste à répéter, sans nécessairement ajouter des distinctions.
  - `opt-4` — escamoter: Escamoter consiste à éluder ou faire disparaître discrètement, pas à préciser les limites.

### fr-vocabulary-c1-007 — version 1

- **Target:** se prévaloir de.
- **Operation / topic:** `meaning_in_context` / `professional_communication`.
- **Source basis:** INV pp. 63; CV pp. 131–132; project guide §3 (C1) and §5.
- **Difficulty rationale:** C1 candidate: interpret a formal lexical expression and its strategic self-presentation function.
- **Prompt and context:**

  Que signifie « se prévaloir de » dans ce contexte ?

  Pour défendre sa candidature, elle se prévaut de son expérience à l’étranger, qu’elle présente comme un atout décisif.

- **Correct answer:** `opt-2` — Faire valoir cette expérience à son avantage.
- **Meaning / answer rationale:** Se prévaloir de quelque chose signifie l’invoquer pour en tirer un avantage ou justifier une prétention.
- **Distractor rationale:**
  - `opt-1` — Prendre ses distances avec cette expérience.: Cela reviendrait à s’en détacher, à l’inverse de son utilisation comme atout.
  - `opt-3` — S’excuser d’avoir vécu cette expérience.: Aucun regret ni excuse n’est exprimé.
  - `opt-4` — Vérifier auprès d’un tiers que cette expérience a bien eu lieu.: L’expression désigne la mise en avant d’un avantage, pas une vérification.

### fr-vocabulary-c1-008 — version 1

- **Target:** faire la part des choses.
- **Operation / topic:** `idiom` / `judgment`.
- **Source basis:** INV pp. 63; CV pp. 131–132; project guide §3 (C1) and §5.
- **Difficulty rationale:** C1 candidate: interpret a common idiom in a nuanced evaluative context rather than a literal distribution.
- **Prompt and context:**

  Que signifie « faire la part des choses » dans ce contexte ?

  Le bilan comporte des erreurs, mais le projet a aussi produit des résultats utiles. Pour l’évaluer, il faut faire la part des choses.

- **Correct answer:** `opt-4` — Distinguer les différents aspects pour porter un jugement équilibré.
- **Meaning / answer rationale:** Faire la part des choses signifie distinguer les éléments d’une situation sans les confondre dans un jugement global simplificateur.
- **Distractor rationale:**
  - `opt-1` — Partager les responsabilités en parts strictement égales.: L’expression ne demande pas une répartition mathématique des responsabilités.
  - `opt-2` — Choisir les seuls résultats favorables pour défendre le projet.: Un jugement équilibré tient aussi compte des erreurs.
  - `opt-3` — Suspendre toute appréciation tant qu’il reste une erreur.: L’expression invite à distinguer les aspects, pas à rendre tout jugement impossible.

### fr-vocabulary-c1-009 — version 1

- **Target:** tirer son épingle du jeu.
- **Operation / topic:** `idiom` / `culture`.
- **Source basis:** INV pp. 63; CV pp. 131–132; project guide §3 (C1) and §5. INV p. 109 supplies an explicit C1 cultural example of this expression or sense; the present question is original.
- **Difficulty rationale:** C1 candidate: contextual idiom in cultural criticism; the inventory uses this expression in its C1 cultural examples (PDF p. 109).
- **Prompt and context:**

  Que signifie « tirer leur épingle du jeu » dans cette critique ?

  La mise en scène manque de cohérence, mais les deux interprètes principaux tirent leur épingle du jeu : leur prestation reste convaincante.

- **Correct answer:** `opt-1` — Réussir à bien s’en sortir malgré un contexte défavorable.
- **Meaning / answer rationale:** Tirer son épingle du jeu signifie réussir à se sortir avantageusement d’une situation difficile.
- **Distractor rationale:**
  - `opt-2` — Se retirer du spectacle avant sa première représentation.: Les interprètes participent au spectacle et leur prestation est évaluée.
  - `opt-3` — Profiter des faiblesses du spectacle pour éviter de jouer.: La critique souligne la qualité de leur jeu, pas l’évitement de leur travail.
  - `opt-4` — S’attribuer le mérite de l’ensemble de la mise en scène.: L’expression ne signifie pas s’approprier le travail d’autrui.

### fr-vocabulary-c1-010 — version 1

- **Target:** dépouillé.
- **Operation / topic:** `connotation` / `culture`.
- **Source basis:** INV pp. 63; CV pp. 131–132; project guide §3 (C1) and §5. INV p. 109 supplies an explicit C1 cultural example of this expression or sense; the present question is original.
- **Difficulty rationale:** C1 candidate: recognize a positively evaluated aesthetic sense rather than deprivation or incompleteness; related inventory example on PDF p. 109.
- **Prompt and context:**

  Dans cette description d’une œuvre, que signifie « dépouillé » ?

  Le dessin évite tout ornement. Quelques lignes soigneusement choisies suffisent à créer l’émotion ; ce style dépouillé est pleinement maîtrisé.

- **Correct answer:** `opt-3` — Sobre et réduit à l’essentiel.
- **Meaning / answer rationale:** Dépouillé qualifie ici un style volontairement sobre, sans ornements superflus.
- **Distractor rationale:**
  - `opt-1` — Inachevé faute de maîtrise technique.: Le texte précise que la simplicité est pleinement maîtrisée.
  - `opt-2` — Surchargé d’éléments décoratifs.: Le dessin évite précisément les ornements.
  - `opt-4` — Privé de sa valeur après une dégradation.: Il s’agit d’un choix stylistique, pas d’un dommage subi.

### fr-vocabulary-c1-011 — version 1

- **Target:** présupposé.
- **Operation / topic:** `semantic_precision` / `reasoning`.
- **Source basis:** INV pp. 63; CV pp. 131–132; project guide §3 (C1) and §5.
- **Difficulty rationale:** C1 candidate: identify a precise term for an implicit premise, distinguishing its logical role from an outcome or denial.
- **Prompt and context:**

  Choisissez le nom le plus précis.

  Tout le raisonnement repose sur une idée tenue pour vraie dès le départ, mais jamais démontrée dans le texte. Cette idée constitue un ___.

- **Correct answer:** `opt-2` — présupposé
- **Meaning / answer rationale:** Un présupposé est une idée admise au départ, souvent sans être explicitement justifiée.
- **Distractor rationale:**
  - `opt-1` — aboutissement: Un aboutissement est un résultat final, pas le point de départ admis.
  - `opt-3` — démenti: Un démenti contredit une affirmation au lieu de la prendre pour base.
  - `opt-4` — corollaire: Un corollaire découle d’une proposition établie ; ce n’est pas l’idée initiale supposée vraie.

### fr-vocabulary-c1-012 — version 1

- **Target:** probant.
- **Operation / topic:** `semantic_precision` / `evaluation`.
- **Source basis:** INV pp. 63; CV pp. 131–132; project guide §3 (C1) and §5.
- **Difficulty rationale:** C1 candidate: distinguish evidential force from plausibility, salience and secondary importance.
- **Prompt and context:**

  Choisissez l’adjectif le plus précis.

  Le dossier contient des éléments vérifiables et convergents qui étayent solidement la conclusion. Leur force de démonstration, et non leur caractère surprenant, les rend particulièrement ___.

- **Correct answer:** `opt-4` — probants
- **Meaning / answer rationale:** Des éléments probants apportent une preuve ou un appui convaincant à une conclusion.
- **Distractor rationale:**
  - `opt-1` — spectaculaires: Spectaculaire renvoie à un effet frappant, explicitement distingué de la force de démonstration.
  - `opt-2` — plausibles: Plausible signifie vraisemblable ; cela n’exprime pas à lui seul la force des preuves décrites.
  - `opt-3` — accessoires: Accessoire désigne un élément secondaire, pas une preuve qui étaye solidement la conclusion.

## Validation and review limits

Checked: valid UTF-8 JSON without duplicate object keys; 60 unique question IDs; 12 questions per supported level; question version 1 and draft status throughout; four distinct nonempty options and one resolving answer key per item; unique prompts; no passage dependencies or embedded sourceReferences; balanced stored correct positions; all 60 revisions mapped here with target, source rationale, explanation and three distractor notes; documentation links resolve locally.

Authoring review checked intended meanings, contextual disambiguation, lexical rather than conjugation contrasts, and explicit explanation of each distractor. The remaining step is user review. No learner pilot, empirical difficulty calibration or claim of exhaustive vocabulary coverage is included.
