# French reading bank: source mapping and review

Prepared 2026-11-14. Review draft: 60 original French reading-comprehension questions, 12 at each level A1–C1. All questions and passages are version 1. No application behavior or code is changed.

## Files and provenance

- Question bank: [reading.json](../Causerie/src-tauri/resources/proficiency/fr/reading.json).
- Authoring guide: [French proficiency source guide](french-proficiency-source-guide.md).
- Test plan: [CEFR TESTING PLANNING](CEFR%20TESTING%20PLANNING.md).
- Passages, people, organizations, scenarios and question wording are original assessment material. Local reports and professional documents are fictional. They do not make factual claims about real studies or organizations.
- Sources support the intended level, reading operation and task format. These are not copied DELF/DALF questions, official exam items, or empirically calibrated CEFR levels.

## Source key (PDF pages, counting the first page as 1)

- **INV:** [French Linguistic Inventory](/home/anabelle/Documents/capstone/inventair-liguistique-des-contenus.pdf). Level summaries: A1 pp. 58–59; A2 pp. 59–60; B1 pp. 60–61; B2 pp. 61–63; C1 p. 63. Provides context, language and communicative-function guidance; it does not assign an official level to every word.
- **DIA:** [DIALANG Appendix C](/home/anabelle/Documents/capstone/DIALANG-CECRL_GBR.pdf). Overall reading scale p. 244; detailed A1–B1 reading scale p. 247; detailed B2–C1 scale p. 248.
- **CV:** [CEFR Companion Volume](</home/anabelle/Documents/capstone/CEFR-Companion Volume_eng.pdf>). Reading pp. 54–60, especially overall reading and correspondence p. 54; vocabulary/grammar distinctions pp. 130–133.
- **EX-A1:** [DELF A1 candidate](/home/anabelle/Documents/capstone/FRDELF-A1.pdf), [answer key](/home/anabelle/Documents/capstone/FRDELF-A1-solutions.pdf), key pp. 2–3. Candidate page references are specified per item below. References describe comparable task operations, not copied stimulus text.
- **EX-A2:** [DELF A2 candidate](/home/anabelle/Documents/capstone/FRDELF-A2.pdf), [answer key](/home/anabelle/Documents/capstone/FRDELF-A2-solutions.pdf), key pp. 3. Candidate page references are specified per item below. References describe comparable task operations, not copied stimulus text.
- **EX-B1:** [DELF B1 candidate](/home/anabelle/Documents/capstone/FRDELF-B1.pdf), [answer key](/home/anabelle/Documents/capstone/FRDELF-B1-solutions.pdf), key pp. 2–3. Candidate page references are specified per item below. References describe comparable task operations, not copied stimulus text.
- **EX-B2:** [DELF B2 candidate](/home/anabelle/Documents/capstone/FRDELF-B2.pdf), [answer key](/home/anabelle/Documents/capstone/FRDELF-B2-solutions.pdf), key pp. 2. Candidate page references are specified per item below. References describe comparable task operations, not copied stimulus text.
- **EX-C1:** [DALF C1 candidate](/home/anabelle/Documents/capstone/FRDELF-C1.pdf), [answer key](/home/anabelle/Documents/capstone/FRDELF-C1-solutions.pdf), key pp. 2. Candidate page references are specified per item below. References describe comparable task operations, not copied stimulus text.

## Data contract and review status

`schemaVersion` describes the JSON structure; `bankVersion` identifies the release of this collection. Both start at 1. Each question has its own stable `id` and `version`. Each passage also has an ID and version, referenced by `passageId` and `passageVersion`. When revising content or scoring later, retain the old revision for historical sessions rather than silently overwriting it.

The top-level collection contains `language`, `skill`, `levels`, `passages`, and `questions`. The `fr` directory and language metadata reserve a clear path for other language banks (for example `es/reading.json`) without mixing their questions. `fr` identifies general French; it does not assert a country-specific locale.

Each question uses `single_choice`, four stable option IDs, one `correctOptionId`, French learner-facing content and explanation, and tags identifying the reading operation and genre. All questions have `status: "draft"` pending user review. No question embeds sourceReferences; this document is the source mapping keyed by question ID and revision. IDs on options are local to their question revision.

Correct options occupy each of the four stored positions three times per level. This is not the runtime presentation order: the future test should shuffle options and save their IDs in the order displayed. Score every question as 0 or 1; the file intentionally contains no routing thresholds or session results.

There are six passages per level and two independently answerable questions per passage. Neither question requires the answer to its partner. A future selector can group already-selected questions by passage for convenience, but must track individual item exposure and shared passage exposure. Two questions on a shared passage provide related, not independent, measurement evidence. A four-item block can use two paired passages or four distinct passages; this bank does not impose either selection policy.

This file sits alongside existing backend resources. It is not yet loaded, migrated into SQLite, or added to the explicit Tauri bundle resource list. Those integration changes are intentionally deferred because this task only creates content files. A future backend should keep keys and explanations out of the test-taking payload until appropriate feedback is allowed.

## Coverage

| Level | Passages | Questions | Intended reading demand |
| --- | ---: | ---: | --- |
| A1 | 6 | 12 | Very short concrete messages and notices; explicit times, places, prices and instructions. Familiar present-tense forms and everyday nouns. No inference beyond linking an explicit detail to its referent. |
| A2 | 6 | 12 | Short routine documents and simple past accounts; match needs, follow an explicit reason or sequence, and apply stated conditions. Familiar vocabulary with basic connectors, negation and time relations. |
| B1 | 6 | 12 | Connected factual or personal texts; distinguish a reason from background, summarize an evaluation, compare practical criteria, and follow a clearly explained conclusion. Familiar contexts keep the reasoning accessible. |
| B2 | 6 | 12 | Extended arguments and multiple viewpoints; distinguish support from reservations, evaluate evidence within the text, and preserve qualifications in paraphrases. The task tests argument relationships rather than specialist knowledge. |
| C1 | 6 | 12 | Longer, denser original passages across essay, professional and literary registers; infer assumptions, irony and relationships, interpret metaphor, and synthesize qualified positions. Intended C1 difficulty is provisional; short selected-response tasks cannot demonstrate every C1 reading capability. |

## Answer index

| Question ID | Revision | Passage | Correct option | Answer |
| --- | ---: | --- | --- | --- |
| `fr-reading-a1-001` | 1 | `fr-reading-a1-p01` v1 | `opt-1` | À treize heures. |
| `fr-reading-a1-002` | 1 | `fr-reading-a1-p01` v1 | `opt-3` | Du pain. |
| `fr-reading-a1-003` | 1 | `fr-reading-a1-p02` v1 | `opt-2` | Le dimanche. |
| `fr-reading-a1-004` | 1 | `fr-reading-a1-p02` v1 | `opt-4` | 3 euros. |
| `fr-reading-a1-005` | 1 | `fr-reading-a1-p03` v1 | `opt-1` | Près de la gare. |
| `fr-reading-a1-006` | 1 | `fr-reading-a1-p03` v1 | `opt-3` | En téléphonant après 18 heures. |
| `fr-reading-a1-007` | 1 | `fr-reading-a1-p04` v1 | `opt-2` | Devant l’école. |
| `fr-reading-a1-008` | 1 | `fr-reading-a1-p04` v1 | `opt-4` | En bus. |
| `fr-reading-a1-009` | 1 | `fr-reading-a1-p05` v1 | `opt-1` | Au rez-de-chaussée. |
| `fr-reading-a1-010` | 1 | `fr-reading-a1-p05` v1 | `opt-3` | Demander à Paul. |
| `fr-reading-a1-011` | 1 | `fr-reading-a1-p06` v1 | `opt-2` | Le mercredi à 14 heures. |
| `fr-reading-a1-012` | 1 | `fr-reading-a1-p06` v1 | `opt-4` | Des crayons. |
| `fr-reading-a2-001` | 1 | `fr-reading-a2-p01` v1 | `opt-1` | Demain matin. |
| `fr-reading-a2-002` | 1 | `fr-reading-a2-p01` v1 | `opt-3` | Parce qu’il devait aller travailler. |
| `fr-reading-a2-003` | 1 | `fr-reading-a2-p02` v1 | `opt-2` | Cuisine facile. |
| `fr-reading-a2-004` | 1 | `fr-reading-a2-p02` v1 | `opt-4` | Son appareil photo. |
| `fr-reading-a2-005` | 1 | `fr-reading-a2-p03` v1 | `opt-1` | Parce que le château était fermé. |
| `fr-reading-a2-006` | 1 | `fr-reading-a2-p03` v1 | `opt-3` | Ils ont mangé dans un café. |
| `fr-reading-a2-007` | 1 | `fr-reading-a2-p04` v1 | `opt-2` | Dans la cour, sous le toit. |
| `fr-reading-a2-008` | 1 | `fr-reading-a2-p04` v1 | `opt-4` | Pour permettre aux voisins de passer. |
| `fr-reading-a2-009` | 1 | `fr-reading-a2-p05` v1 | `opt-1` | Un roman en bon état pour adolescents. |
| `fr-reading-a2-010` | 1 | `fr-reading-a2-p05` v1 | `opt-3` | Rester avec leurs enfants. |
| `fr-reading-a2-011` | 1 | `fr-reading-a2-p06` v1 | `opt-2` | Un plat et un dessert. |
| `fr-reading-a2-012` | 1 | `fr-reading-a2-p06` v1 | `opt-4` | Payer son repas. |
| `fr-reading-b1-001` | 1 | `fr-reading-b1-p01` v1 | `opt-1` | Pour éviter de trop demander aux bénévoles. |
| `fr-reading-b1-002` | 1 | `fr-reading-b1-p01` v1 | `opt-3` | Le lieu de rencontre propose désormais plusieurs activités. |
| `fr-reading-b1-003` | 1 | `fr-reading-b1-p02` v1 | `opt-2` | La possibilité de suivre un projet complet. |
| `fr-reading-b1-004` | 1 | `fr-reading-b1-p02` v1 | `opt-4` | Il a été utile malgré certaines difficultés personnelles. |
| `fr-reading-b1-005` | 1 | `fr-reading-b1-p03` v1 | `opt-1` | La salle des Peupliers. |
| `fr-reading-b1-006` | 1 | `fr-reading-b1-p03` v1 | `opt-3` | Le studio Canal. |
| `fr-reading-b1-007` | 1 | `fr-reading-b1-p04` v1 | `opt-2` | Pour apprendre à comprendre une panne et les solutions possibles. |
| `fr-reading-b1-008` | 1 | `fr-reading-b1-p04` v1 | `opt-4` | Quand une personne sait mieux quoi faire de son objet, même s’il reste en panne. |
| `fr-reading-b1-009` | 1 | `fr-reading-b1-p05` v1 | `opt-1` | La distance entre la gare d’arrivée et les bureaux. |
| `fr-reading-b1-010` | 1 | `fr-reading-b1-p05` v1 | `opt-3` | Étudier cette solution en tenant compte de sa propre situation. |
| `fr-reading-b1-011` | 1 | `fr-reading-b1-p06` v1 | `opt-2` | Le fonctionnement de la boîte était mal connu. |
| `fr-reading-b1-012` | 1 | `fr-reading-b1-p06` v1 | `opt-4` | Mieux informer les habitants, puis observer l’utilisation. |
| `fr-reading-b2-001` | 1 | `fr-reading-b2-p01` v1 | `opt-1` | Poursuivre l’essai avec des aménagements et une évaluation plus complète. |
| `fr-reading-b2-002` | 1 | `fr-reading-b2-p01` v1 | `opt-3` | Pour montrer que la hausse observée pourrait être temporaire. |
| `fr-reading-b2-003` | 1 | `fr-reading-b2-p02` v1 | `opt-2` | Élodie. |
| `fr-reading-b2-004` | 1 | `fr-reading-b2-p02` v1 | `opt-4` | Changer le calendrier ne suffit pas : il faut repenser le travail. |
| `fr-reading-b2-005` | 1 | `fr-reading-b2-p03` v1 | `opt-1` | Parce que l’inscription ne garantit pas des retours et des réutilisations effectives. |
| `fr-reading-b2-006` | 1 | `fr-reading-b2-p03` v1 | `opt-3` | Ils facilitent le retour, mais leur effet doit encore être vérifié. |
| `fr-reading-b2-007` | 1 | `fr-reading-b2-p04` v1 | `opt-2` | Des conditions équitables et pratiques pour assurer le service du soir. |
| `fr-reading-b2-008` | 1 | `fr-reading-b2-p04` v1 | `opt-4` | Elle masque les effets différents de la réforme sur les personnes concernées. |
| `fr-reading-b2-009` | 1 | `fr-reading-b2-p05` v1 | `opt-1` | La participation peut rendre la présence utile, mais les absences ont aussi des causes pratiques. |
| `fr-reading-b2-010` | 1 | `fr-reading-b2-p05` v1 | `opt-3` | Elle distingue la disponibilité du contenu de la possibilité réelle d’y accéder. |
| `fr-reading-b2-011` | 1 | `fr-reading-b2-p06` v1 | `opt-2` | Sur la place à donner à la production alimentaire par rapport aux usages collectifs. |
| `fr-reading-b2-012` | 1 | `fr-reading-b2-p06` v1 | `opt-4` | De juger le projet selon ses objectifs réels sans garantir son financement. |
| `fr-reading-c1-001` | 1 | `fr-reading-c1-p01` v1 | `opt-1` | Le temps non mesuré par l’administration aurait cessé d’être une charge pour quelqu’un. |
| `fr-reading-c1-002` | 1 | `fr-reading-c1-p01` v1 | `opt-3` | Le succès obtenu grâce à une aide extérieure peut masquer le besoin même de cette aide. |
| `fr-reading-c1-003` | 1 | `fr-reading-c1-p02` v1 | `opt-2` | Elle souligne ironiquement qu’un accueil poli peut coexister avec une exclusion de la décision. |
| `fr-reading-c1-004` | 1 | `fr-reading-c1-p02` v1 | `opt-4` | Une consultation peut être honnêtement menée tout en limitant en amont les choix qui auront du poids. |
| `fr-reading-c1-005` | 1 | `fr-reading-c1-p03` v1 | `opt-1` | Sa place préservée maintient une trace de vie que le classement des objets est en train d’effacer. |
| `fr-reading-c1-006` | 1 | `fr-reading-c1-p03` v1 | `opt-3` | Il accepte discrètement de suspendre sa logique d’efficacité pour laisser une place au besoin d’Ana. |
| `fr-reading-c1-007` | 1 | `fr-reading-c1-p04` v1 | `opt-2` | Maintenir l’accord sur l’objectif tout en contestant la solidité de l’affirmation publique. |
| `fr-reading-c1-008` | 1 | `fr-reading-c1-p04` v1 | `opt-4` | Pour éclairer des obstacles possibles que le seul retour des volontaires ne permet pas d’identifier. |
| `fr-reading-c1-009` | 1 | `fr-reading-c1-p05` v1 | `opt-1` | La continuité d’un lieu peut nécessiter de nouveaux usages plutôt que la reproduction de ses anciennes formes. |
| `fr-reading-c1-010` | 1 | `fr-reading-c1-p05` v1 | `opt-3` | À mettre en évidence les publics différents que la formule du directeur réunit sans les distinguer. |
| `fr-reading-c1-011` | 1 | `fr-reading-c1-p06` v1 | `opt-2` | Celle d’une personne dont les goûts antérieurs délimiteraient durablement les découvertes pertinentes. |
| `fr-reading-c1-012` | 1 | `fr-reading-c1-p06` v1 | `opt-4` | Permettre des parcours moins dépendants du profil, sans supprimer toute forme d’accompagnement. |

## A1: item-by-item mapping

Very short concrete messages and notices; explicit times, places, prices and instructions. Familiar present-tense forms and everyday nouns. No inference beyond linking an explicit detail to its referent.

### fr-reading-a1-001 — version 1

- **Passage:** `fr-reading-a1-p01` v1 — Un message de Nora.
- **Prompt:** À quelle heure Hugo doit-il arriver chez Nora ?
- **Operation:** `explicit_detail`.
- **Sources:** INV pp. 58–59; DIA pp. 244, 247; CV pp. 54–60; EX-A1 candidate pp. 6, 10 (task-format reference; companion answer key listed above).
- **Level rationale:** A1: locate an explicitly stated meeting time in a short personal message.
- **Answer:** `opt-1` — À treize heures.
- **Evidence from original passage:** « Viens chez moi à treize heures pour manger. »
- **Explanation:** Nora demande à Hugo de venir chez elle à treize heures.
- **Distractor review:**
  - `opt-2` — À midi. Midi est la fin du travail de Nora.
  - `opt-3` — À dix heures. Cette heure ne figure pas dans le message.
  - `opt-4` — À seize heures. Cette heure ne figure pas dans le message.

### fr-reading-a1-002 — version 1

- **Passage:** `fr-reading-a1-p01` v1 — Un message de Nora.
- **Prompt:** Que doit apporter Hugo ?
- **Operation:** `required_action`.
- **Sources:** INV pp. 58–59; DIA pp. 244, 247; CV pp. 54–60; EX-A1 candidate pp. 6, 10 (task-format reference; companion answer key listed above).
- **Level rationale:** A1: recognize one direct everyday request.
- **Answer:** `opt-3` — Du pain.
- **Evidence from original passage:** « Apporte du pain, s’il te plaît. »
- **Explanation:** Nora demande du pain à Hugo.
- **Distractor review:**
  - `opt-1` — Une salade. Le frère de Nora prépare la salade.
  - `opt-2` — Des fruits. Nora ne demande pas de fruits.
  - `opt-4` — Du fromage. Nora ne demande pas de fromage.

### fr-reading-a1-003 — version 1

- **Passage:** `fr-reading-a1-p02` v1 — À la piscine.
- **Prompt:** Quel jour la piscine est-elle fermée ?
- **Operation:** `explicit_detail`.
- **Sources:** INV pp. 58–59; DIA pp. 244, 247; CV pp. 54–60; EX-A1 candidate pp. 7–8 (task-format reference; companion answer key listed above).
- **Level rationale:** A1: retrieve an explicit closure day from a simple notice.
- **Answer:** `opt-2` — Le dimanche.
- **Evidence from original passage:** « Fermée le dimanche. »
- **Explanation:** La piscine est fermée le dimanche.
- **Distractor review:**
  - `opt-1` — Le lundi. La piscine ouvre du lundi au vendredi.
  - `opt-3` — Le vendredi. Le vendredi fait partie des jours d’ouverture.
  - `opt-4` — Le samedi. Elle ouvre le samedi matin.

### fr-reading-a1-004 — version 1

- **Passage:** `fr-reading-a1-p02` v1 — À la piscine.
- **Prompt:** Combien coûte une entrée pour un enfant ?
- **Operation:** `explicit_detail`.
- **Sources:** INV pp. 58–59; DIA pp. 244, 247; CV pp. 54–60; EX-A1 candidate pp. 7–8 (task-format reference; companion answer key listed above).
- **Level rationale:** A1: associate a familiar category with its stated price without arithmetic.
- **Answer:** `opt-4` — 3 euros.
- **Evidence from original passage:** « Entrée : 5 euros pour les adultes, 3 euros pour les enfants. »
- **Explanation:** Le prix indiqué pour les enfants est de 3 euros.
- **Distractor review:**
  - `opt-1` — 5 euros. C’est le prix pour un adulte.
  - `opt-2` — 9 euros. 9 h est l’heure d’ouverture du samedi, pas un prix.
  - `opt-3` — 10 euros. 10 h est une heure d’ouverture, pas un prix.

### fr-reading-a1-005 — version 1

- **Passage:** `fr-reading-a1-p03` v1 — Une chambre à louer.
- **Prompt:** Où se trouve l’appartement ?
- **Operation:** `explicit_detail`.
- **Sources:** INV pp. 58–59; DIA pp. 244, 247; CV pp. 54–60; EX-A1 candidate pp. 6, 9 (task-format reference; companion answer key listed above).
- **Level rationale:** A1: identify an explicitly stated location in a short advertisement.
- **Answer:** `opt-1` — Près de la gare.
- **Evidence from original passage:** « dans un appartement près de la gare »
- **Explanation:** L’annonce situe l’appartement près de la gare.
- **Distractor review:**
  - `opt-2` — Près de la piscine. La piscine n’est pas mentionnée.
  - `opt-3` — Au-dessus d’un magasin. Aucun magasin n’est indiqué.
  - `opt-4` — À côté d’une école. Aucune école n’est indiquée.

### fr-reading-a1-006 — version 1

- **Passage:** `fr-reading-a1-p03` v1 — Une chambre à louer.
- **Prompt:** Comment demander une visite ?
- **Operation:** `required_action`.
- **Sources:** INV pp. 58–59; DIA pp. 244, 247; CV pp. 54–60; EX-A1 candidate pp. 6, 9 (task-format reference; companion answer key listed above).
- **Level rationale:** A1: follow a short instruction with a familiar time expression.
- **Answer:** `opt-3` — En téléphonant après 18 heures.
- **Evidence from original passage:** « Pour visiter, téléphonez à Mme Petit après 18 heures. »
- **Explanation:** Il faut appeler Mme Petit après 18 heures pour visiter.
- **Distractor review:**
  - `opt-1` — En envoyant un message. L’annonce demande de ne pas envoyer de messages.
  - `opt-2` — En téléphonant avant midi. Les appels sont demandés après 18 heures.
  - `opt-4` — En allant à la gare. La gare situe le logement, ce n’est pas le lieu de rendez-vous indiqué.

### fr-reading-a1-007 — version 1

- **Passage:** `fr-reading-a1-p04` v1 — La sortie de dimanche.
- **Prompt:** Où le groupe se retrouve-t-il le matin ?
- **Operation:** `explicit_detail`.
- **Sources:** INV pp. 58–59; DIA pp. 244, 247; CV pp. 54–60; EX-A1 candidate pp. 10 (task-format reference; companion answer key listed above).
- **Level rationale:** A1: distinguish the meeting place from the destination.
- **Answer:** `opt-2` — Devant l’école.
- **Evidence from original passage:** « Rendez-vous devant l’école à 9 heures. »
- **Explanation:** Le rendez-vous du matin est devant l’école.
- **Distractor review:**
  - `opt-1` — Dans le jardin des Roses. Le jardin est la destination de la visite.
  - `opt-3` — Devant la gare. La gare n’est pas mentionnée.
  - `opt-4` — Chez Lucie. Lucie signe le message mais ne donne pas rendez-vous chez elle.

### fr-reading-a1-008 — version 1

- **Passage:** `fr-reading-a1-p04` v1 — La sortie de dimanche.
- **Prompt:** Comment le groupe va-t-il au jardin ?
- **Operation:** `explicit_detail`.
- **Sources:** INV pp. 58–59; DIA pp. 244, 247; CV pp. 54–60; EX-A1 candidate pp. 10 (task-format reference; companion answer key listed above).
- **Level rationale:** A1: find an explicit means of transport.
- **Answer:** `opt-4` — En bus.
- **Evidence from original passage:** « Nous partons en bus à 9 h 15. »
- **Explanation:** Le groupe part en bus.
- **Distractor review:**
  - `opt-1` — À pied. Le message annonce un départ en bus.
  - `opt-2` — En train. Aucun train n’est prévu.
  - `opt-3` — À vélo. Aucun déplacement à vélo n’est prévu.

### fr-reading-a1-009 — version 1

- **Passage:** `fr-reading-a1-p05` v1 — Petit-déjeuner à l’hôtel.
- **Prompt:** Où prend-on le petit-déjeuner ?
- **Operation:** `explicit_detail`.
- **Sources:** INV pp. 58–59; DIA pp. 244, 247; CV pp. 54–60; EX-A1 candidate pp. 7–8 (task-format reference; companion answer key listed above).
- **Level rationale:** A1: locate a service using a familiar place expression.
- **Answer:** `opt-1` — Au rez-de-chaussée.
- **Evidence from original passage:** « Le petit-déjeuner est servi dans la salle du rez-de-chaussée »
- **Explanation:** Le petit-déjeuner est servi au rez-de-chaussée.
- **Distractor review:**
  - `opt-2` — Dans les chambres. Le texte indique une salle commune au rez-de-chaussée.
  - `opt-3` — Au premier étage. Cet étage n’est pas indiqué.
  - `opt-4` — Sur la terrasse. Aucune terrasse n’est mentionnée.

### fr-reading-a1-010 — version 1

- **Passage:** `fr-reading-a1-p05` v1 — Petit-déjeuner à l’hôtel.
- **Prompt:** Que faut-il faire pour avoir un café ?
- **Operation:** `required_action`.
- **Sources:** INV pp. 58–59; DIA pp. 244, 247; CV pp. 54–60; EX-A1 candidate pp. 7–8 (task-format reference; companion answer key listed above).
- **Level rationale:** A1: identify a direct service instruction; no inferred procedure.
- **Answer:** `opt-3` — Demander à Paul.
- **Evidence from original passage:** « Pour avoir un café, demandez à Paul. »
- **Explanation:** Paul est la personne à qui demander un café.
- **Distractor review:**
  - `opt-1` — Le prendre sur la grande table. Le thé et le jus, pas le café, sont indiqués sur cette table.
  - `opt-2` — Aller dans sa chambre. Le texte ne demande pas d’aller dans sa chambre.
  - `opt-4` — Donner sa clé à Paul. La clé doit être laissée à l’accueil au départ, pas échangée contre un café.

### fr-reading-a1-011 — version 1

- **Passage:** `fr-reading-a1-p06` v1 — Au club de dessin.
- **Prompt:** Quand a lieu le cours pour les enfants ?
- **Operation:** `explicit_detail`.
- **Sources:** INV pp. 58–59; DIA pp. 244, 247; CV pp. 54–60; EX-A1 candidate pp. 7–10 (task-format reference; companion answer key listed above).
- **Level rationale:** A1: match a participant group to its schedule.
- **Answer:** `opt-2` — Le mercredi à 14 heures.
- **Evidence from original passage:** « Le cours pour les enfants a lieu le mercredi à 14 heures. »
- **Explanation:** Les enfants ont cours le mercredi à 14 heures.
- **Distractor review:**
  - `opt-1` — Le mardi à 18 heures. C’est le cours des adultes.
  - `opt-3` — Le mercredi à 18 heures. 18 heures est l’horaire du mardi pour les adultes.
  - `opt-4` — Le mardi à 14 heures. 14 heures correspond au mercredi, pas au mardi.

### fr-reading-a1-012 — version 1

- **Passage:** `fr-reading-a1-p06` v1 — Au club de dessin.
- **Prompt:** Que faut-il apporter au cours ?
- **Operation:** `required_action`.
- **Sources:** INV pp. 58–59; DIA pp. 244, 247; CV pp. 54–60; EX-A1 candidate pp. 7–10 (task-format reference; companion answer key listed above).
- **Level rationale:** A1: retrieve one explicit equipment requirement.
- **Answer:** `opt-4` — Des crayons.
- **Evidence from original passage:** « Apportez des crayons. »
- **Explanation:** Le club demande d’apporter des crayons et fournit le papier.
- **Distractor review:**
  - `opt-1` — Du papier. Le papier est déjà disponible dans la salle.
  - `opt-2` — Une table. Aucune table à apporter n’est demandée.
  - `opt-3` — Un livre. Aucun livre à apporter n’est demandé.

## A2: item-by-item mapping

Short routine documents and simple past accounts; match needs, follow an explicit reason or sequence, and apply stated conditions. Familiar vocabulary with basic connectors, negation and time relations.

### fr-reading-a2-001 — version 1

- **Passage:** `fr-reading-a2-p01` v1 — Un colis pour Léa.
- **Prompt:** Léa rentre aujourd’hui à 19 heures. Quand peut-elle récupérer son colis, selon le message ?
- **Operation:** `practical_information`.
- **Sources:** INV pp. 59–60; DIA pp. 244, 247; CV pp. 54–60; EX-A2 candidate pp. 9–12 (task-format reference; companion answer key listed above).
- **Level rationale:** A2: apply an explicitly stated alternative to a routine situation.
- **Answer:** `opt-1` — Demain matin.
- **Evidence from original passage:** « Si tu rentres plus tard, tu peux récupérer le colis demain matin. »
- **Explanation:** À 19 heures, Mme Roux est sortie. Le message propose le lendemain matin.
- **Distractor review:**
  - `opt-2` — Aujourd’hui à 19 heures chez Mme Roux. Mme Roux sera sortie après 18 heures.
  - `opt-3` — Ce soir à la poste. Le message précise que le colis n’est pas à la poste.
  - `opt-4` — Aujourd’hui au travail de Sami. Sami a laissé le colis chez Mme Roux.

### fr-reading-a2-002 — version 1

- **Passage:** `fr-reading-a2-p01` v1 — Un colis pour Léa.
- **Prompt:** Pourquoi Sami a-t-il laissé le colis chez Mme Roux ?
- **Operation:** `explicit_reason`.
- **Sources:** INV pp. 59–60; DIA pp. 244, 247; CV pp. 54–60; EX-A2 candidate pp. 9–12 (task-format reference; companion answer key listed above).
- **Level rationale:** A2: identify an explicit reason while distinguishing two people’s plans.
- **Answer:** `opt-3` — Parce qu’il devait aller travailler.
- **Evidence from original passage:** « car je pars travailler »
- **Explanation:** Sami explique qu’il part travailler.
- **Distractor review:**
  - `opt-1` — Parce qu’il allait au cinéma. C’est Mme Roux qui va au cinéma.
  - `opt-2` — Parce que Léa habite chez Mme Roux. Le message ne dit pas que Léa y habite.
  - `opt-4` — Parce que le livreur devait revenir. Sami a déjà pris le colis ; aucun retour du livreur n’est annoncé.

### fr-reading-a2-003 — version 1

- **Passage:** `fr-reading-a2-p02` v1 — Choisir un atelier.
- **Prompt:** Nadia ne sait pas cuisiner et voudrait apprendre à préparer un repas végétarien. Quel atelier lui convient ?
- **Operation:** `matching_needs`.
- **Sources:** INV pp. 59–60; DIA pp. 244, 247; CV pp. 54–60; EX-A2 candidate pp. 8 (task-format reference; companion answer key listed above).
- **Level rationale:** A2: match two concrete needs to a short service description, following the sample matching format.
- **Answer:** `opt-2` — Cuisine facile.
- **Evidence from original passage:** « « Cuisine facile » commence à 10 heures et accueille les débutants. On prépare un repas sans viande »
- **Explanation:** Cuisine facile accepte les débutants et propose un repas sans viande.
- **Distractor review:**
  - `opt-1` — Photos en ville. Cet atelier concerne la photographie, pas la cuisine.
  - `opt-3` — Jardin sur le balcon. On y apprend à jardiner, pas à préparer un repas.
  - `opt-4` — Les trois ateliers. Seul Cuisine facile propose de préparer un repas.

### fr-reading-a2-004 — version 1

- **Passage:** `fr-reading-a2-p02` v1 — Choisir un atelier.
- **Prompt:** Que doit apporter une personne inscrite à « Photos en ville » ?
- **Operation:** `required_action`.
- **Sources:** INV pp. 59–60; DIA pp. 244, 247; CV pp. 54–60; EX-A2 candidate pp. 8 (task-format reference; companion answer key listed above).
- **Level rationale:** A2: locate a requirement in several adjacent descriptions.
- **Answer:** `opt-4` — Son appareil photo.
- **Evidence from original passage:** « chacun doit apporter son appareil photo »
- **Explanation:** Les participants à Photos en ville doivent apporter leur appareil.
- **Distractor review:**
  - `opt-1` — Des plantes. Les plantes concernent l’atelier de jardinage et sont fournies.
  - `opt-2` — Un repas. Le repas est préparé pendant l’atelier de cuisine.
  - `opt-3` — Des pots. Les pots sont fournis pour l’atelier de jardinage.

### fr-reading-a2-005 — version 1

- **Passage:** `fr-reading-a2-p03` v1 — Une visite différente.
- **Prompt:** Pourquoi Émilie et ses amis ont-ils visité le musée ?
- **Operation:** `explicit_reason`.
- **Sources:** INV pp. 59–60; DIA pp. 244, 247; CV pp. 54–60; EX-A2 candidate pp. 13 (task-format reference; companion answer key listed above).
- **Level rationale:** A2: follow an explicit cause and consequence in a simple past narrative.
- **Answer:** `opt-1` — Parce que le château était fermé.
- **Evidence from original passage:** « il était fermé pour travaux. Nous avons donc pris le bus pour aller au musée de la ville. »
- **Explanation:** Le musée remplace la visite du château fermé pour travaux.
- **Distractor review:**
  - `opt-2` — Parce qu’il pleuvait avant leur départ. La pluie arrive après le repas, pas avant la visite.
  - `opt-3` — Parce que le café était fermé. Ils ont mangé au café ; il n’était pas fermé.
  - `opt-4` — Parce qu’ils avaient réservé au musée. Aucune réservation n’est mentionnée.

### fr-reading-a2-006 — version 1

- **Passage:** `fr-reading-a2-p03` v1 — Une visite différente.
- **Prompt:** Qu’ont-ils fait juste après la visite du musée ?
- **Operation:** `sequence`.
- **Sources:** INV pp. 59–60; DIA pp. 244, 247; CV pp. 54–60; EX-A2 candidate pp. 13 (task-format reference; companion answer key listed above).
- **Level rationale:** A2: follow chronological markers in a short personal account.
- **Answer:** `opt-3` — Ils ont mangé dans un café.
- **Evidence from original passage:** « Ensuite, nous avons mangé dans un petit café près du musée. »
- **Explanation:** Le repas au café vient juste après la visite.
- **Distractor review:**
  - `opt-1` — Ils ont visité le château. Le château était fermé.
  - `opt-2` — Ils sont rentrés à pied. Ils ont finalement repris le bus.
  - `opt-4` — Ils ont acheté de vieux jouets. Ils ont vu des jouets au musée ; aucun achat n’est indiqué.

### fr-reading-a2-007 — version 1

- **Passage:** `fr-reading-a2-p04` v1 — Les vélos de la résidence.
- **Prompt:** Où les habitants peuvent-ils mettre leur vélo pendant les travaux ?
- **Operation:** `practical_information`.
- **Sources:** INV pp. 59–60; DIA pp. 244, 247; CV pp. 54–60; EX-A2 candidate pp. 9–12 (task-format reference; companion answer key listed above).
- **Level rationale:** A2: extract a temporary arrangement from an everyday notice.
- **Answer:** `opt-2` — Dans la cour, sous le toit.
- **Evidence from original passage:** « Pendant les travaux, vous pouvez le mettre dans la cour, sous le toit près de l’entrée. »
- **Explanation:** La cour couverte est le lieu proposé pendant les travaux.
- **Distractor review:**
  - `opt-1` — Dans le couloir. Le message demande de laisser le couloir libre.
  - `opt-3` — Dans le local à vélos. Le local doit être vidé pour les travaux.
  - `opt-4` — Dans le bureau du gardien. Ce lieu n’est pas proposé pour les vélos.

### fr-reading-a2-008 — version 1

- **Passage:** `fr-reading-a2-p04` v1 — Les vélos de la résidence.
- **Prompt:** Pourquoi faut-il laisser le couloir libre ?
- **Operation:** `explicit_reason`.
- **Sources:** INV pp. 59–60; DIA pp. 244, 247; CV pp. 54–60; EX-A2 candidate pp. 9–12 (task-format reference; companion answer key listed above).
- **Level rationale:** A2: understand an explicitly explained instruction.
- **Answer:** `opt-4` — Pour permettre aux voisins de passer.
- **Evidence from original passage:** « les voisins doivent pouvoir passer facilement »
- **Explanation:** Le couloir doit rester libre pour le passage des voisins.
- **Distractor review:**
  - `opt-1` — Pour y ranger les outils. Le texte ne prévoit pas de ranger des outils dans le couloir.
  - `opt-2` — Pour y réparer les vélos. Aucune réparation de vélos n’y est prévue.
  - `opt-3` — Pour fermer l’entrée de la résidence. Le message veut faciliter le passage, pas fermer l’entrée.

### fr-reading-a2-009 — version 1

- **Passage:** `fr-reading-a2-p05` v1 — Une nouvelle bibliothèque.
- **Prompt:** Quel don la bibliothèque accepte-t-elle le samedi matin ?
- **Operation:** `practical_information`.
- **Sources:** INV pp. 59–60; DIA pp. 244, 247; CV pp. 54–60; EX-A2 candidate pp. 13 (task-format reference; companion answer key listed above).
- **Level rationale:** A2: combine two explicitly stated conditions for a practical choice.
- **Answer:** `opt-1` — Un roman en bon état pour adolescents.
- **Evidence from original passage:** « La bibliothèque cherche aussi des livres pour les adolescents. Vous pouvez en apporter le samedi matin, mais seulement s’ils sont en bon état. »
- **Explanation:** Le don doit être un livre pour adolescents en bon état.
- **Distractor review:**
  - `opt-2` — Un magazine récent. Les magazines ne sont pas acceptés.
  - `opt-3` — Un livre pour adolescents avec des pages manquantes. Les livres doivent être en bon état.
  - `opt-4` — Une collection de journaux. Le texte demande des livres pour adolescents, pas des journaux.

### fr-reading-a2-010 — version 1

- **Passage:** `fr-reading-a2-p05` v1 — Une nouvelle bibliothèque.
- **Prompt:** Que doivent faire les parents pendant la lecture du mercredi ?
- **Operation:** `required_action`.
- **Sources:** INV pp. 59–60; DIA pp. 244, 247; CV pp. 54–60; EX-A2 candidate pp. 13 (task-format reference; companion answer key listed above).
- **Level rationale:** A2: interpret a simple pronoun reference and attendance condition.
- **Answer:** `opt-3` — Rester avec leurs enfants.
- **Evidence from original passage:** « Les parents restent avec eux pendant l’activité. »
- **Explanation:** Les parents doivent rester avec leurs enfants pendant la lecture.
- **Distractor review:**
  - `opt-1` — Attendre à l’extérieur. Le texte demande de rester avec les enfants.
  - `opt-2` — Lire les histoires à la place de la bénévole. C’est la bénévole qui lit les histoires.
  - `opt-4` — Revenir chercher les enfants le samedi. Le samedi concerne les dons, pas la lecture du mercredi.

### fr-reading-a2-011 — version 1

- **Passage:** `fr-reading-a2-p06` v1 — Le repas de vendredi.
- **Prompt:** Que comprend le menu à 18 euros ?
- **Operation:** `practical_information`.
- **Sources:** INV pp. 59–60; DIA pp. 244, 247; CV pp. 54–60; EX-A2 candidate pp. 11–12 (task-format reference; companion answer key listed above).
- **Level rationale:** A2: identify the contents of an everyday offer.
- **Answer:** `opt-2` — Un plat et un dessert.
- **Evidence from original passage:** « Le menu à 18 euros comprend un plat et un dessert. »
- **Explanation:** Le prix comprend le plat et le dessert, sans les boissons.
- **Distractor review:**
  - `opt-1` — Un plat et une boisson. Les boissons sont en plus ; le dessert est inclus.
  - `opt-3` — Une entrée et un plat. Aucune entrée n’est incluse dans la description.
  - `opt-4` — Un dessert et une boisson. Le plat est inclus et la boisson ne l’est pas.

### fr-reading-a2-012 — version 1

- **Passage:** `fr-reading-a2-p06` v1 — Le repas de vendredi.
- **Prompt:** Paul annule vendredi matin. Que devra-t-il faire, selon le message ?
- **Operation:** `practical_information`.
- **Sources:** INV pp. 59–60; DIA pp. 244, 247; CV pp. 54–60; EX-A2 candidate pp. 11–12 (task-format reference; companion answer key listed above).
- **Level rationale:** A2: apply an explicit deadline and consequence to a familiar transaction.
- **Answer:** `opt-4` — Payer son repas.
- **Evidence from original passage:** « Après cette heure, le restaurant préparera votre repas et il faudra le payer, même si vous êtes absent. »
- **Explanation:** Vendredi matin est après jeudi midi : le repas reste à payer.
- **Distractor review:**
  - `opt-1` — Choisir un autre plat. Il annule sa venue ; le choix du plat n’est pas la conséquence indiquée.
  - `opt-2` — Payer seulement une boisson. Le texte impose le paiement du repas après le délai.
  - `opt-3` — Ne rien payer. L’annulation sans paiement devait être faite avant jeudi midi.

## B1: item-by-item mapping

Connected factual or personal texts; distinguish a reason from background, summarize an evaluation, compare practical criteria, and follow a clearly explained conclusion. Familiar contexts keep the reasoning accessible.

### fr-reading-b1-001 — version 1

- **Passage:** `fr-reading-b1-p01` v1 — Le café des voisins.
- **Prompt:** Pourquoi les responsables ont-ils renoncé à ouvrir tous les jours ?
- **Operation:** `explicit_reason`.
- **Sources:** INV pp. 60–61; DIA pp. 244, 247; CV pp. 54–60; EX-B1 candidate pp. 7–10 (task-format reference; companion answer key listed above).
- **Level rationale:** B1: connect a practical decision with its explicit longer-term purpose in a factual account.
- **Answer:** `opt-1` — Pour éviter de trop demander aux bénévoles.
- **Evidence from original passage:** « Ils ont finalement préféré limiter les horaires pour ne pas épuiser l’équipe. »
- **Explanation:** Les horaires limités doivent préserver l’équipe bénévole et permettre au café de durer.
- **Distractor review:**
  - `opt-2` — Parce que les clients ne viennent jamais le lundi. Le texte indique au contraire que certains regrettent la fermeture du lundi.
  - `opt-3` — Pour supprimer les activités pour les enfants. L’aide aux devoirs n’est pas supprimée.
  - `opt-4` — Parce qu’ils ont déjà embauché une personne. Ils cherchent encore une personne salariée.

### fr-reading-b1-002 — version 1

- **Passage:** `fr-reading-b1-p01` v1 — Le café des voisins.
- **Prompt:** Comment le projet a-t-il évolué depuis son début ?
- **Operation:** `main_idea`.
- **Sources:** INV pp. 60–61; DIA pp. 244, 247; CV pp. 54–60; EX-B1 candidate pp. 7–10 (task-format reference; companion answer key listed above).
- **Level rationale:** B1: summarize a clearly signposted change across consecutive sentences.
- **Answer:** `opt-3` — Le lieu de rencontre propose désormais plusieurs activités.
- **Evidence from original passage:** « Au départ, ils voulaient simplement retrouver un lieu où discuter. Aujourd’hui, leur café propose aussi une aide aux devoirs et des soirées de jeux. »
- **Explanation:** Au lieu de seulement accueillir des discussions, le café organise aussi des activités.
- **Distractor review:**
  - `opt-1` — Les bénévoles ont tous été remplacés par des salariés. Le salarié recherché doit compléter les bénévoles.
  - `opt-2` — Le café est devenu une école à temps plein. L’aide aux devoirs est une activité parmi d’autres.
  - `opt-4` — Le café a abandonné son rôle de lieu de rencontre. Les activités prolongent ce rôle plutôt qu’elles ne le remplacent.

### fr-reading-b1-003 — version 1

- **Passage:** `fr-reading-b1-p02` v1 — Un stage loin de chez soi.
- **Prompt:** Qu’est-ce qui a surtout motivé le choix de ce stage ?
- **Operation:** `motivation`.
- **Sources:** INV pp. 60–61; DIA pp. 244, 247; CV pp. 54–60; EX-B1 candidate pp. 7–10 (task-format reference; companion answer key listed above).
- **Level rationale:** B1: identify the decisive reason despite competing advice and background information.
- **Answer:** `opt-2` — La possibilité de suivre un projet complet.
- **Evidence from original passage:** « un projet que je pourrais suivre du début à la fin. C’est cela qui m’a décidé. »
- **Explanation:** Le projet complet proposé a été l’élément décisif.
- **Distractor review:**
  - `opt-1` — La réputation de l’entreprise auprès de ses amis. Ses amis préféraient une grande société plus connue.
  - `opt-3` — La garantie d’obtenir un emploi ensuite. Aucune promesse d’embauche n’a été faite.
  - `opt-4` — La proximité de sa famille. L’entreprise se trouve loin de chez lui.

### fr-reading-b1-004 — version 1

- **Passage:** `fr-reading-b1-p02` v1 — Un stage loin de chez soi.
- **Prompt:** Quel bilan la personne fait-elle de son stage ?
- **Operation:** `overall_attitude`.
- **Sources:** INV pp. 60–61; DIA pp. 244, 247; CV pp. 54–60; EX-B1 candidate pp. 7–10 (task-format reference; companion answer key listed above).
- **Level rationale:** B1: understand a straightforward positive evaluation qualified by a stated disadvantage.
- **Answer:** `opt-4` — Il a été utile malgré certaines difficultés personnelles.
- **Evidence from original passage:** « je savais mieux quel métier je voulais exercer. Je ne regrette donc pas mon choix, même si vivre loin de mes proches m’a parfois pesé. »
- **Explanation:** Le stage a clarifié son projet professionnel malgré l’éloignement.
- **Distractor review:**
  - `opt-1` — Il a été inutile puisqu’il n’a pas mené à un emploi. La personne a mieux compris son choix de métier et ne regrette pas le stage.
  - `opt-2` — Il a été facile dès le premier jour. La première semaine a été difficile.
  - `opt-3` — Il a surtout permis de se rapprocher de sa famille. L’éloignement des proches a été une difficulté.

### fr-reading-b1-005 — version 1

- **Passage:** `fr-reading-b1-p03` v1 — Trouver un lieu pour répéter.
- **Prompt:** Quel lieu respecte toutes les conditions annoncées par le groupe ?
- **Operation:** `matching_criteria`.
- **Sources:** INV pp. 60–61; DIA pp. 244, 247; CV pp. 54–60; EX-B1 candidate pp. 5–6 (task-format reference; companion answer key listed above).
- **Level rationale:** B1: integrate four practical constraints across several descriptions, modeled on DELF criterion comparison.
- **Answer:** `opt-1` — La salle des Peupliers.
- **Evidence from original passage:** « La salle des Peupliers, accessible directement depuis la rue, peut accueillir douze personnes. Elle coûte 55 euros, mais les groupes doivent apporter leurs instruments. Elle est libre tous les jeudis soir. »
- **Explanation:** Les Peupliers conviennent pour le nombre de personnes, le budget, l’accès et le jour.
- **Distractor review:**
  - `opt-2` — La salle du Parc. Elle est accessible seulement par un escalier.
  - `opt-3` — Le studio Canal. Son prix dépasse le budget maximal.
  - `opt-4` — Le centre du Marché. La salle est déjà réservée le jeudi soir.

### fr-reading-b1-006 — version 1

- **Passage:** `fr-reading-b1-p03` v1 — Trouver un lieu pour répéter.
- **Prompt:** Avec un budget de 80 euros, quel lieu respecterait les conditions d’accès du groupe et serait équipé pour jouer ?
- **Operation:** `matching_criteria`.
- **Sources:** INV pp. 60–61; DIA pp. 244, 247; CV pp. 54–60; EX-B1 candidate pp. 5–6 (task-format reference; companion answer key listed above).
- **Level rationale:** B1: reevaluate a concrete choice under one changed constraint; the prompt does not assume unlisted availability.
- **Answer:** `opt-3` — Le studio Canal.
- **Evidence from original passage:** « Le studio Canal est au rez-de-chaussée et possède tout le matériel nécessaire ; il coûte 80 euros. »
- **Explanation:** Avec un budget de 80 euros, le studio Canal répond aux conditions d’accès et d’équipement indiquées.
- **Distractor review:**
  - `opt-1` — La salle du Parc. Un budget plus élevé ne supprime pas l’escalier.
  - `opt-2` — Le centre du Marché. Le texte ne le décrit pas comme équipé pour jouer, et il reste réservé le jeudi.
  - `opt-4` — Aucun autre lieu. Le studio Canal coûte exactement 80 euros et possède le matériel.

### fr-reading-b1-007 — version 1

- **Passage:** `fr-reading-b1-p04` v1 — Acheter moins, réparer davantage.
- **Prompt:** Pourquoi les propriétaires participent-ils eux-mêmes aux réparations ?
- **Operation:** `purpose`.
- **Sources:** INV pp. 60–61; DIA pp. 244, 247; CV pp. 54–60; EX-B1 candidate pp. 7–10 (task-format reference; companion answer key listed above).
- **Level rationale:** B1: identify an explicitly explained purpose beyond the surface activity.
- **Answer:** `opt-2` — Pour apprendre à comprendre une panne et les solutions possibles.
- **Evidence from original passage:** « L’objectif est de leur montrer comment chercher une panne simple et décider si une réparation est possible. »
- **Explanation:** L’atelier vise l’apprentissage des participants, pas seulement la réparation des objets.
- **Distractor review:**
  - `opt-1` — Pour travailler ensuite comme bénévoles obligatoires. Aucun engagement futur n’est imposé.
  - `opt-3` — Pour vendre leurs objets aux réparateurs. L’atelier ne propose pas de vente.
  - `opt-4` — Pour éviter tout recours à un professionnel. Les bénévoles peuvent justement conseiller un professionnel.

### fr-reading-b1-008 — version 1

- **Passage:** `fr-reading-b1-p04` v1 — Acheter moins, réparer davantage.
- **Prompt:** Selon l’association, quand une séance peut-elle être considérée comme réussie ?
- **Operation:** `main_conclusion`.
- **Sources:** INV pp. 60–61; DIA pp. 244, 247; CV pp. 54–60; EX-B1 candidate pp. 7–10 (task-format reference; companion answer key listed above).
- **Level rationale:** B1: paraphrase the explicit conclusion of a straightforward explanatory article.
- **Answer:** `opt-4` — Quand une personne sait mieux quoi faire de son objet, même s’il reste en panne.
- **Evidence from original passage:** « apprendre à faire un choix informé compte aussi »
- **Explanation:** Mieux comprendre ses options est aussi un résultat utile.
- **Distractor review:**
  - `opt-1` — Seulement quand tous les appareils sont réparés sur place. La conclusion rejette cette condition.
  - `opt-2` — Quand les participants achètent tous un nouvel appareil. L’achat systématique n’est pas l’objectif.
  - `opt-3` — Quand les réparateurs gardent les objets une semaine. Le texte oppose l’atelier à ce fonctionnement.

### fr-reading-b1-009 — version 1

- **Passage:** `fr-reading-b1-p05` v1 — Le trajet de Malik.
- **Prompt:** Quel problème le vélo a-t-il permis de résoudre pour Malik ?
- **Operation:** `cause_and_solution`.
- **Sources:** INV pp. 60–61; DIA pp. 244, 247; CV pp. 54–60; EX-B1 candidate pp. 7–10 (task-format reference; companion answer key listed above).
- **Level rationale:** B1: connect a stated obstacle to the solution described in the following sentence.
- **Answer:** `opt-1` — La distance entre la gare d’arrivée et les bureaux.
- **Evidence from original passage:** « La gare d’arrivée était cependant loin des nouveaux bureaux. »
- **Explanation:** Le vélo lui permet d’effectuer la dernière partie du trajet après le train.
- **Distractor review:**
  - `opt-2` — Le manque de place dans sa voiture. Le vélo sert à relier la gare aux bureaux.
  - `opt-3` — Le prix élevé des billets de train. Le prix des billets n’est pas discuté.
  - `opt-4` — L’absence de train près de son domicile. Le texte ne mentionne pas une telle absence.

### fr-reading-b1-010 — version 1

- **Passage:** `fr-reading-b1-p05` v1 — Le trajet de Malik.
- **Prompt:** Quel conseil correspond à l’avis de Malik ?
- **Operation:** `overall_attitude`.
- **Sources:** INV pp. 60–61; DIA pp. 244, 247; CV pp. 54–60; EX-B1 candidate pp. 7–10 (task-format reference; companion answer key listed above).
- **Level rationale:** B1: interpret advice with explicit practical qualifications.
- **Answer:** `opt-3` — Étudier cette solution en tenant compte de sa propre situation.
- **Evidence from original passage:** « Il ne pense pas que tout le monde puisse adopter exactement la même organisation. »
- **Explanation:** Malik recommande d’examiner les conditions pratiques avant d’adopter cette solution.
- **Distractor review:**
  - `opt-1` — Vendre sa voiture avant d’essayer le train. Malik conserve sa voiture pour certains jours.
  - `opt-2` — Choisir le train uniquement s’il réduit le temps de trajet. Malik y trouve un avantage même sans trajet plus court.
  - `opt-4` — Copier ses déplacements sans vérifier les horaires. Il demande précisément de vérifier les horaires et les conditions.

### fr-reading-b1-011 — version 1

- **Passage:** `fr-reading-b1-p06` v1 — Des livres à partager.
- **Prompt:** Qu’a révélé la rencontre avec les voisins ?
- **Operation:** `cause_and_effect`.
- **Sources:** INV pp. 60–61; DIA pp. 244, 247; CV pp. 54–60; EX-B1 candidate pp. 7–10 (task-format reference; companion answer key listed above).
- **Level rationale:** B1: distinguish an initial assumption from the explanation found afterward.
- **Answer:** `opt-2` — Le fonctionnement de la boîte était mal connu.
- **Evidence from original passage:** « beaucoup ignoraient que les livres étaient gratuits et certains pensaient que la boîte appartenait à l’école voisine »
- **Explanation:** Les habitants manquaient d’informations sur l’accès gratuit à la boîte.
- **Distractor review:**
  - `opt-1` — Les habitants refusaient tous de lire. Cette généralisation n’est pas le résultat de la rencontre.
  - `opt-3` — L’école avait interdit l’accès à la boîte. L’appartenance à l’école était une croyance de certains habitants.
  - `opt-4` — Les livres étaient trop chers. Les livres sont gratuits, même si beaucoup l’ignoraient.

### fr-reading-b1-012 — version 1

- **Passage:** `fr-reading-b1-p06` v1 — Des livres à partager.
- **Prompt:** Que fera la ville avant de décider d’un déplacement ?
- **Operation:** `sequence_and_plan`.
- **Sources:** INV pp. 60–61; DIA pp. 244, 247; CV pp. 54–60; EX-B1 candidate pp. 7–10 (task-format reference; companion answer key listed above).
- **Level rationale:** B1: summarize an explicitly sequenced response to a local problem.
- **Answer:** `opt-4` — Mieux informer les habitants, puis observer l’utilisation.
- **Evidence from original passage:** « La ville va donc ajouter un panneau explicatif et organiser une première rencontre autour des livres. Elle attendra quelques mois avant de décider de déplacer la boîte. »
- **Explanation:** La ville prévoit d’abord des informations et une rencontre, puis une période d’attente.
- **Distractor review:**
  - `opt-1` — Fermer immédiatement les trois boîtes. Aucune fermeture générale n’est prévue.
  - `opt-2` — Faire payer les livres du square. La ville veut expliquer leur gratuité.
  - `opt-3` — Confier définitivement la boîte à l’école. L’école n’en devient pas propriétaire.

## B2: item-by-item mapping

Extended arguments and multiple viewpoints; distinguish support from reservations, evaluate evidence within the text, and preserve qualifications in paraphrases. The task tests argument relationships rather than specialist knowledge.

### fr-reading-b2-001 — version 1

- **Passage:** `fr-reading-b2-p01` v1 — Une rue sans voitures ?.
- **Prompt:** Quelle position l’association défend-elle ?
- **Operation:** `qualified_stance`.
- **Sources:** INV pp. 61–63; DIA pp. 244, 248; CV pp. 54–60; EX-B2 candidate pp. 5–8 (task-format reference; companion answer key listed above).
- **Level rationale:** B2: distinguish support for a policy objective from reservations about implementation and evidence.
- **Answer:** `opt-1` — Poursuivre l’essai avec des aménagements et une évaluation plus complète.
- **Evidence from original passage:** « Elle soutient donc l’objectif d’un espace plus accueillant, tout en demandant des garanties sur la manière de l’évaluer. »
- **Explanation:** L’association soutient l’objectif, mais demande des adaptations et davantage de preuves.
- **Distractor review:**
  - `opt-2` — Abandonner le projet puisque toutes les ventes ont baissé. Le texte n’indique pas une baisse générale et l’association refuse l’abandon immédiat.
  - `opt-3` — Généraliser la mesure puisque les passages ont augmenté. L’association estime les premières données insuffisantes.
  - `opt-4` — Réserver la rue aux seuls clients des boutiques. Aucune restriction de ce type n’est proposée.

### fr-reading-b2-002 — version 1

- **Passage:** `fr-reading-b2-p01` v1 — Une rue sans voitures ?.
- **Prompt:** Pourquoi l’association évoque-t-elle la curiosité des premières semaines ?
- **Operation:** `argument_function`.
- **Sources:** INV pp. 61–63; DIA pp. 244, 248; CV pp. 54–60; EX-B2 candidate pp. 5–8 (task-format reference; companion answer key listed above).
- **Level rationale:** B2: identify the role of a methodological reservation in an argument.
- **Answer:** `opt-3` — Pour montrer que la hausse observée pourrait être temporaire.
- **Evidence from original passage:** « la curiosité suscitée par une nouveauté peut gonfler les chiffres des premières semaines »
- **Explanation:** L’effet de nouveauté peut rendre les premiers chiffres peu représentatifs de la suite.
- **Distractor review:**
  - `opt-1` — Pour prouver que les visiteurs ne feront jamais d’achats. Une influence temporaire ne prouve pas une absence définitive d’achats.
  - `opt-2` — Pour expliquer pourquoi les livraisons doivent cesser. Les livraisons doivent rester possibles tôt le matin.
  - `opt-4` — Pour affirmer que les commerçants ont falsifié les chiffres. Aucune falsification n’est évoquée.

### fr-reading-b2-003 — version 1

- **Passage:** `fr-reading-b2-p02` v1 — Travailler quatre jours.
- **Prompt:** Qui insiste surtout sur la nécessité de prévoir la journée libre à l’avance ?
- **Operation:** `viewpoint_attribution`.
- **Sources:** INV pp. 61–63; DIA pp. 244, 248; CV pp. 54–60; EX-B2 candidate pp. 9–10 (task-format reference; companion answer key listed above).
- **Level rationale:** B2: attribute a qualified viewpoint among several contributions to a shared debate.
- **Answer:** `opt-2` — Élodie.
- **Evidence from original passage:** « Encore faut-il que cette journée soit prévisible »
- **Explanation:** Élodie lie les avantages pratiques à la possibilité de prévoir la journée libre.
- **Distractor review:**
  - `opt-1` — Camille. Camille s’inquiète surtout d’une charge inchangée concentrée en quatre jours.
  - `opt-3` — Yanis. Yanis parle des besoins de présence et du coût de la réorganisation.
  - `opt-4` — Les trois personnes de la même manière. La prévisibilité de la journée libre est la préoccupation spécifique d’Élodie.

### fr-reading-b2-004 — version 1

- **Passage:** `fr-reading-b2-p02` v1 — Travailler quatre jours.
- **Prompt:** Sur quel point Camille et Yanis se rejoignent-ils ?
- **Operation:** `shared_position`.
- **Sources:** INV pp. 61–63; DIA pp. 244, 248; CV pp. 54–60; EX-B2 candidate pp. 9–10 (task-format reference; companion answer key listed above).
- **Level rationale:** B2: synthesize a point of agreement expressed through different practical arguments.
- **Answer:** `opt-4` — Changer le calendrier ne suffit pas : il faut repenser le travail.
- **Evidence from original passage:** « elle suppose des embauches ou une réorganisation des équipes »
- **Explanation:** Camille demande d’adapter la charge et Yanis l’organisation : le calendrier seul ne suffit pas.
- **Distractor review:**
  - `opt-1` — Tous les métiers permettent de supprimer les mêmes tâches. Yanis oppose les contraintes de son atelier à celles d’une agence.
  - `opt-2` — Il faut diminuer les salaires pour financer la réforme. Camille décrit le maintien des salaires ; Yanis ne demande pas de baisse.
  - `opt-3` — La semaine de quatre jours doit être refusée dans toutes les entreprises. Ils précisent des conditions sans rejet général.

### fr-reading-b2-005 — version 1

- **Passage:** `fr-reading-b2-p03` v1 — Des emballages à rapporter.
- **Prompt:** Pourquoi le nombre de clients inscrits ne suffit-il pas à évaluer le dispositif ?
- **Operation:** `evidence_evaluation`.
- **Sources:** INV pp. 61–63; DIA pp. 244, 248; CV pp. 54–60; EX-B2 candidate pp. 5–8 (task-format reference; companion answer key listed above).
- **Level rationale:** B2: identify a limitation of an apparently favorable indicator from a causal explanation.
- **Answer:** `opt-1` — Parce que l’inscription ne garantit pas des retours et des réutilisations effectives.
- **Evidence from original passage:** « Le bénéfice dépend donc du nombre de réutilisations, ainsi que du transport et du lavage. »
- **Explanation:** L’effet environnemental dépend de l’usage répété, pas de la seule adhésion au programme.
- **Distractor review:**
  - `opt-2` — Parce que seuls les clients non inscrits peuvent rapporter les récipients. Aucune règle de ce type n’est indiquée.
  - `opt-3` — Parce que les récipients solides ne peuvent jamais être écologiques. Le bénéfice est conditionnel, pas impossible.
  - `opt-4` — Parce que le montant de la consigne mesure directement les déchets évités. La somme versée ne mesure pas le nombre de réutilisations.

### fr-reading-b2-006 — version 1

- **Passage:** `fr-reading-b2-p03` v1 — Des emballages à rapporter.
- **Prompt:** Comment l’association juge-t-elle les nouveaux points de dépôt ?
- **Operation:** `qualified_stance`.
- **Sources:** INV pp. 61–63; DIA pp. 244, 248; CV pp. 54–60; EX-B2 candidate pp. 5–8 (task-format reference; companion answer key listed above).
- **Level rationale:** B2: preserve both the positive assessment and the remaining reservation.
- **Answer:** `opt-3` — Ils facilitent le retour, mais leur effet doit encore être vérifié.
- **Evidence from original passage:** « Elle souligne toutefois qu’il faudra observer les résultats avant d’affirmer que le dispositif est plus avantageux que les solutions existantes. »
- **Explanation:** L’association approuve l’amélioration pratique sans considérer son efficacité comme démontrée.
- **Distractor review:**
  - `opt-1` — Ils prouvent déjà la supériorité environnementale du dispositif. L’association demande encore d’observer les résultats.
  - `opt-2` — Ils sont moins utiles qu’une campagne accusant les clients. L’association affirme le contraire.
  - `opt-4` — Ils doivent remplacer complètement le lavage des récipients. Les points de dépôt ne suppriment pas le besoin de lavage.

### fr-reading-b2-007 — version 1

- **Passage:** `fr-reading-b2-p04` v1 — Un musée ouvert le soir.
- **Prompt:** Que demandent principalement les gardiens ?
- **Operation:** `viewpoint_attribution`.
- **Sources:** INV pp. 61–63; DIA pp. 244, 248; CV pp. 54–60; EX-B2 candidate pp. 5–10 (task-format reference; companion answer key listed above).
- **Level rationale:** B2: distinguish operational conditions from opposition to the overall proposal.
- **Answer:** `opt-2` — Des conditions équitables et pratiques pour assurer le service du soir.
- **Evidence from original passage:** « Ils demandent une rotation négociée et des solutions de retour pour ceux qui n’ont plus de bus »
- **Explanation:** Les gardiens demandent une répartition négociée du travail et des possibilités de retour.
- **Distractor review:**
  - `opt-1` — Le maintien obligatoire de tous les horaires actuels. Cette demande n’est pas attribuée aux gardiens.
  - `opt-3` — L’interdiction de toute ouverture après 18 heures. Ils reconnaissent l’intérêt de l’ouverture tardive.
  - `opt-4` — La réservation du vendredi aux retraités. La demande des retraités concerne le mardi.

### fr-reading-b2-008 — version 1

- **Passage:** `fr-reading-b2-p04` v1 — Un musée ouvert le soir.
- **Prompt:** Que reproche l’éditorial à l’opposition entre modernité et immobilisme ?
- **Operation:** `author_stance`.
- **Sources:** INV pp. 61–63; DIA pp. 244, 248; CV pp. 54–60; EX-B2 candidate pp. 5–10 (task-format reference; companion answer key listed above).
- **Level rationale:** B2: interpret an author’s criticism of a simplified framing of a policy debate.
- **Answer:** `opt-4` — Elle masque les effets différents de la réforme sur les personnes concernées.
- **Evidence from original passage:** « quels publics gagneront un accès au musée, et à quelles conditions pour les autres ? »
- **Explanation:** L’éditorial veut examiner les avantages et les contraintes selon les publics et le personnel.
- **Distractor review:**
  - `opt-1` — Elle accorde trop d’importance au prix des collections. La valeur des collections n’est pas abordée.
  - `opt-2` — Elle empêche de prouver que les retraités refusent toute nouveauté. L’auteur conteste précisément cette lecture simplificatrice.
  - `opt-3` — Elle donne trop de pouvoir aux visiteurs du vendredi. Le texte critique une manière de poser le débat, pas un pouvoir formel des visiteurs.

### fr-reading-b2-009 — version 1

- **Passage:** `fr-reading-b2-p05` v1 — Faut-il tout enregistrer ?.
- **Prompt:** Quelle conclusion respecte les réserves de l’enseignante ?
- **Operation:** `scope_of_claim`.
- **Sources:** INV pp. 61–63; DIA pp. 244, 248; CV pp. 54–60; EX-B2 candidate pp. 5–8 (task-format reference; companion answer key listed above).
- **Level rationale:** B2: choose a paraphrase that preserves a causal qualification and avoids overgeneralization.
- **Answer:** `opt-1` — La participation peut rendre la présence utile, mais les absences ont aussi des causes pratiques.
- **Evidence from original passage:** « Elle refuse cependant d’en déduire que toute absence serait un jugement sur la qualité du cours »
- **Explanation:** L’intérêt de la présence compte, sans expliquer toutes les absences.
- **Distractor review:**
  - `opt-2` — Chaque absence prouve que le cours est de mauvaise qualité. L’enseignante rejette explicitement cette déduction.
  - `opt-3` — Les enregistrements font baisser la présence dans tous les cours. Les résultats ne sont pas uniformes.
  - `opt-4` — Les étudiants qui travaillent doivent renoncer aux enregistrements. Ces étudiants font partie des bénéficiaires visés.

### fr-reading-b2-010 — version 1

- **Passage:** `fr-reading-b2-p05` v1 — Faut-il tout enregistrer ?.
- **Prompt:** Quel rôle joue la remarque sur les étudiants mal connectés ?
- **Operation:** `argument_function`.
- **Sources:** INV pp. 61–63; DIA pp. 244, 248; CV pp. 54–60; EX-B2 candidate pp. 5–8 (task-format reference; companion answer key listed above).
- **Level rationale:** B2: explain how a supporting point refines a broader claim about access.
- **Answer:** `opt-3` — Elle distingue la disponibilité du contenu de la possibilité réelle d’y accéder.
- **Evidence from original passage:** « Mettre un fichier en ligne ne suffit pas, selon elle, à garantir que tous puissent effectivement l’utiliser. »
- **Explanation:** L’accès réel suppose aussi des équipements et une connexion utilisable.
- **Distractor review:**
  - `opt-1` — Elle montre que les exercices participatifs doivent être supprimés. Elle porte sur les équipements, pas sur la suppression des exercices.
  - `opt-2` — Elle prouve que les cours en ligne coûtent toujours plus cher. Aucune comparaison générale de coût n’est établie.
  - `opt-4` — Elle conseille de réserver les fichiers aux étudiants vivant près du campus. Cette restriction n’est pas proposée.

### fr-reading-b2-011 — version 1

- **Passage:** `fr-reading-b2-p06` v1 — Un jardin sur le toit.
- **Prompt:** Sur quoi porte principalement le désaccord entre les habitants ?
- **Operation:** `competing_criteria`.
- **Sources:** INV pp. 61–63; DIA pp. 244, 248; CV pp. 54–60; EX-B2 candidate pp. 5–10 (task-format reference; companion answer key listed above).
- **Level rationale:** B2: identify competing evaluation criteria rather than merely opposing opinions.
- **Answer:** `opt-2` — Sur la place à donner à la production alimentaire par rapport aux usages collectifs.
- **Evidence from original passage:** « D’autres répondent que les rencontres et les ateliers ont une valeur, même si la récolte reste limitée. »
- **Explanation:** Les habitants ne donnent pas le même poids à la récolte et à la vie collective.
- **Distractor review:**
  - `opt-1` — Sur la nécessité de renforcer un toit déjà réparé. Le texte ne dit pas que le toit a déjà été réparé.
  - `opt-3` — Sur l’interdiction de cultiver des légumes en ville. Aucune interdiction n’est évoquée.
  - `opt-4` — Sur le choix de vendre ou de donner une récolte abondante. La récolte prévue est modeste et sa distribution n’est pas discutée.

### fr-reading-b2-012 — version 1

- **Passage:** `fr-reading-b2-p06` v1 — Un jardin sur le toit.
- **Prompt:** Que permettrait la comparaison proposée par la coordinatrice ?
- **Operation:** `purpose`.
- **Sources:** INV pp. 61–63; DIA pp. 244, 248; CV pp. 54–60; EX-B2 candidate pp. 5–10 (task-format reference; companion answer key listed above).
- **Level rationale:** B2: understand the purpose and explicit limits of a proposed decision framework.
- **Answer:** `opt-4` — De juger le projet selon ses objectifs réels sans garantir son financement.
- **Evidence from original passage:** « Cette comparaison ne rendrait pas le jardin automatiquement prioritaire »
- **Explanation:** Comparer les usages collectifs clarifie le débat, mais ne décide pas d’avance du résultat.
- **Distractor review:**
  - `opt-1` — De démontrer que le jardin doit forcément passer avant tous les autres projets. La coordinatrice précise qu’il ne serait pas automatiquement prioritaire.
  - `opt-2` — De revenir à la promesse d’autonomie alimentaire. Elle refuse cette promesse irréaliste.
  - `opt-3` — De supprimer les dépenses liées aux espaces collectifs. Elle propose une comparaison, pas la suppression de ces dépenses.

## C1: item-by-item mapping

Longer, denser original passages across essay, professional and literary registers; infer assumptions, irony and relationships, interpret metaphor, and synthesize qualified positions. Intended C1 difficulty is provisional; short selected-response tasks cannot demonstrate every C1 reading capability.

### fr-reading-c1-001 — version 1

- **Passage:** `fr-reading-c1-p01` v1 — Le temps rendu invisible.
- **Prompt:** Quel présupposé du bilan l’auteur met-il principalement en cause ?
- **Operation:** `implicit_assumption`.
- **Sources:** INV pp. 63; DIA pp. 244, 248; CV pp. 54–60; EX-C1 candidate pp. 5–8 (task-format reference; companion answer key listed above).
- **Level rationale:** C1: infer an unstated accounting assumption through the sustained metaphor of transferred ownership and the examples across paragraphs.
- **Answer:** `opt-1` — Le temps non mesuré par l’administration aurait cessé d’être une charge pour quelqu’un.
- **Evidence from original passage:** « Il a surtout changé de propriétaire. »
- **Explanation:** L’auteur conteste l’assimilation entre la disparition d’une attente mesurée et la disparition du travail nécessaire.
- **Distractor review:**
  - `opt-2` — Les gains de rapidité internes démontreraient que chaque usager est devenu autonome. Le texte examine un transfert de charge ; il ne décrit pas une mesure individuelle de l’autonomie.
  - `opt-3` — Le travail des proches serait déjà intégré au coût officiel de chaque dossier. Ce travail est précisément absent des indicateurs.
  - `opt-4` — Toute tâche transférée aux usagers produirait nécessairement un dossier moins conforme. Les dossiers aidés peuvent arriver parfaitement conformes.

### fr-reading-c1-002 — version 1

- **Passage:** `fr-reading-c1-p01` v1 — Le temps rendu invisible.
- **Prompt:** Que signifie le paradoxe selon lequel l’aide devient la preuve qu’elle était superflue ?
- **Operation:** `rhetorical_paradox`.
- **Sources:** INV pp. 63; DIA pp. 244, 248; CV pp. 54–60; EX-C1 candidate pp. 5–8 (task-format reference; companion answer key listed above).
- **Level rationale:** C1: interpret a paradox and reconstruct the difference between observed success and hidden enabling conditions.
- **Answer:** `opt-3` — Le succès obtenu grâce à une aide extérieure peut masquer le besoin même de cette aide.
- **Evidence from original passage:** « leur dossier finit par arriver, parfaitement conforme, et le système n’enregistre que cette réussite »
- **Explanation:** Le résultat visible efface le soutien invisible qui l’a permis, d’où une conclusion erronée sur son inutilité.
- **Distractor review:**
  - `opt-1` — La réussite d’une démarche rendrait tout soutien inutile pour les démarches suivantes. Le passage ne mesure pas l’autonomie future ; il montre que l’aide présente est masquée.
  - `opt-2` — L’aide serait reconnue dans le bilan, mais jugée trop coûteuse pour être maintenue. Elle n’est justement pas enregistrée comme condition du succès.
  - `opt-4` — Les dossiers sans aide seraient considérés comme moins fiables que les dossiers accompagnés. Le texte n’établit aucune hiérarchie de fiabilité entre ces dossiers.

### fr-reading-c1-003 — version 1

- **Passage:** `fr-reading-c1-p02` v1 — Une consultation très ouverte.
- **Prompt:** Quel effet produit la formule sur « toute la considération due à ce qui ne sera pas compté » ?
- **Operation:** `ironic_tone`.
- **Sources:** INV pp. 63; DIA pp. 244, 248; CV pp. 54–60; EX-C1 candidate pp. 5–8 (task-format reference; companion answer key listed above).
- **Level rationale:** C1: identify understated institutional irony without confusing exclusion from a metric with censorship.
- **Answer:** `opt-2` — Elle souligne ironiquement qu’un accueil poli peut coexister avec une exclusion de la décision.
- **Evidence from original passage:** « elle a été classée parmi les commentaires, là où les idées sont accueillies avec toute la considération due à ce qui ne sera pas compté »
- **Explanation:** La politesse affichée contraste avec l’absence d’effet de cette proposition sur le décompte.
- **Distractor review:**
  - `opt-1` — Elle annonce qu’un examen spécifique des commentaires donnera davantage de poids à cette proposition. Aucun examen donnant davantage de poids à la proposition n’est prévu.
  - `opt-3` — Elle dénonce la suppression matérielle des commentaires pour faciliter le dépouillement. Les commentaires sont accueillis et conservés, mais hors du décompte décisionnel.
  - `opt-4` — Elle suggère que les collectifs ont choisi de rester hors du vote pour protéger leur indépendance. Le texte attribue le classement au dispositif, pas à un choix des collectifs.

### fr-reading-c1-004 — version 1

- **Passage:** `fr-reading-c1-p02` v1 — Une consultation très ouverte.
- **Prompt:** Quelle critique rend le mieux compte de l’ensemble de l’éditorial ?
- **Operation:** `scope_of_criticism`.
- **Sources:** INV pp. 63; DIA pp. 244, 248; CV pp. 54–60; EX-C1 candidate pp. 5–8 (task-format reference; companion answer key listed above).
- **Level rationale:** C1: synthesize a nuanced institutional critique while preserving its explicit concession about necessary limits.
- **Answer:** `opt-4` — Une consultation peut être honnêtement menée tout en limitant en amont les choix qui auront du poids.
- **Evidence from original passage:** « La transparence du dépouillement ne remplace pas celle du choix initial des possibles. »
- **Explanation:** L’auteur distingue l’honnêteté du traitement des réponses et les effets du cadrage préalable.
- **Distractor review:**
  - `opt-1` — Une consultation n’est légitime que si aucune limite ne restreint les propositions possibles. L’auteur reconnaît que des limites sont nécessaires.
  - `opt-2` — Le nombre élevé de participants suffit à effacer les défauts du questionnaire initial. Le dernier paragraphe distingue mobilisation et construction des choix.
  - `opt-3` — Des résultats fidèles aux réponses garantissent que toutes les attentes ont été représentées. C’est précisément le passage des réponses cadrées au souhait collectif que l’auteur critique.

### fr-reading-c1-005 — version 1

- **Passage:** `fr-reading-c1-p03` v1 — La maison rendue.
- **Prompt:** Pourquoi la tasse retient-elle particulièrement l’attention d’Ana ?
- **Operation:** `literary_inference`.
- **Sources:** INV pp. 63; DIA pp. 244, 248; CV pp. 54–60; EX-C1 candidate pp. 5–8 (task-format reference; companion answer key listed above).
- **Level rationale:** C1: interpret figurative contrast and infer attachment to a lived arrangement rather than a literal possession.
- **Answer:** `opt-1` — Sa place préservée maintient une trace de vie que le classement des objets est en train d’effacer.
- **Evidence from original passage:** « comme si la maison avait conservé un geste alors que tout le reste était devenu un inventaire »
- **Explanation:** La tasse compte par la continuité du geste et du lieu, plus que comme objet à posséder.
- **Distractor review:**
  - `opt-2` — Elle offre enfin à Ana un objet personnel qu’elle pourra substituer à tous ses autres souvenirs. Ana la repose et refuse de la garder ; l’enjeu dépasse la possession d’un souvenir.
  - `opt-3` — Elle révèle à Ana un défaut de méthode qu’elle souhaite faire corriger avant de poursuivre le tri. L’émotion concerne la transformation de la maison en inventaire, pas une correction de méthode.
  - `opt-4` — Elle confirme que son frère partage déjà son souhait de laisser la cuisine intacte. Le frère propose de classer la tasse ; l’oubli de son rangement ne prouve pas ce souhait.

### fr-reading-c1-006 — version 1

- **Passage:** `fr-reading-c1-p03` v1 — La maison rendue.
- **Prompt:** Dans le contexte du récit, que suggère surtout le choix final du frère de ne pas rouvrir la fenêtre ?
- **Operation:** `implicit_relationship`.
- **Sources:** INV pp. 63; DIA pp. 244, 248; CV pp. 54–60; EX-C1 candidate pp. 5–8 (task-format reference; companion answer key listed above).
- **Level rationale:** C1: infer a relational shift from the ending and its echo of the opening, without claiming certainty about unexpressed motives.
- **Answer:** `opt-3` — Il accepte discrètement de suspendre sa logique d’efficacité pour laisser une place au besoin d’Ana.
- **Evidence from original passage:** « Pour la première fois de la journée, il laissa une tâche inachevée : il ne rouvrit pas la fenêtre. »
- **Explanation:** Après les tensions liées au rangement, cette suspension volontaire suggère une concession silencieuse.
- **Distractor review:**
  - `opt-1` — Il cherche surtout à prouver qu’Ana devra désormais assumer seule les tâches qu’elle retarde. Aucune exigence de transfert des tâches n’est formulée ; le geste final répond à la tension sans reproche.
  - `opt-2` — Il renonce au projet de visite afin de préserver définitivement la maison telle qu’elle était. Une fenêtre laissée fermée ne signifie pas l’annulation de la visite ou du projet.
  - `opt-4` — Il estime que le classement des objets a déjà répondu à toutes les attentes de sa sœur. L’hésitation et le geste d’Ana montrent justement que le classement ne répond pas à son besoin.

### fr-reading-c1-007 — version 1

- **Passage:** `fr-reading-c1-p04` v1 — La prudence du rapport.
- **Prompt:** Quelle est la fonction principale de la formule « une ambition, que nous partageons » ?
- **Operation:** `professional_register`.
- **Sources:** INV pp. 63; DIA pp. 244, 248; CV pp. 54–60; EX-C1 candidate pp. 5–8 (task-format reference; companion answer key listed above).
- **Level rationale:** C1: interpret diplomatic alignment as a means of delivering a substantive criticism in professional register.
- **Answer:** `opt-2` — Maintenir l’accord sur l’objectif tout en contestant la solidité de l’affirmation publique.
- **Evidence from original passage:** « Nous suggérons de distinguer ici une ambition, que nous partageons, d’un effet établi, que les données ne documentent pas encore. »
- **Explanation:** La formule atténue le désaccord sur la communication en réaffirmant un objectif commun.
- **Distractor review:**
  - `opt-1` — Transformer l’accord sur l’objectif en validation des effets déjà annoncés dans le communiqué. L’accord sur l’ambition est précisément dissocié de la preuve d’un effet.
  - `opt-3` — Faire dépendre l’avenir du programme du retrait de toute ambition d’élargissement. Le rapport partage l’ambition et propose un élargissement de l’expérimentation.
  - `opt-4` — Présenter le désaccord comme une simple préférence stylistique sans enjeu de fond. La formulation porte sur la différence substantielle entre ambition et résultat établi.

### fr-reading-c1-008 — version 1

- **Passage:** `fr-reading-c1-p04` v1 — La prudence du rapport.
- **Prompt:** Pourquoi les auteurs proposent-ils d’interroger les salariés qui ne se présentent pas spontanément ?
- **Operation:** `inference_limits`.
- **Sources:** INV pp. 63; DIA pp. 244, 248; CV pp. 54–60; EX-C1 candidate pp. 5–8 (task-format reference; companion answer key listed above).
- **Level rationale:** C1: connect the limitation of the sample to a proposed inquiry without converting hypotheses into established facts.
- **Answer:** `opt-4` — Pour éclairer des obstacles possibles que le seul retour des volontaires ne permet pas d’identifier.
- **Evidence from original passage:** « Des entretiens permettraient de comprendre si leur réserve tient à un manque d’intérêt, à une disponibilité insuffisante ou à la crainte »
- **Explanation:** Les entretiens doivent explorer plusieurs raisons possibles de non-participation, invisibles dans le bilan des volontaires.
- **Distractor review:**
  - `opt-1` — Pour établir que le manque de disponibilité explique à lui seul l’absence de candidatures. La disponibilité n’est qu’une hypothèse parmi plusieurs à explorer.
  - `opt-2` — Pour confirmer, auprès d’un autre public, une efficacité déjà démontrée sur les carrières. L’effet sur les parcours n’est pas encore établi, même chez les volontaires.
  - `opt-3` — Pour remplacer les déclarations des volontaires par celles de personnes jugées plus objectives. Le rapport ne déclare pas les autres salariés plus objectifs et ne propose pas de remplacer le bilan.

### fr-reading-c1-009 — version 1

- **Passage:** `fr-reading-c1-p05` v1 — Conserver sans figer.
- **Prompt:** Quel paradoxe soutient la conclusion du texte ?
- **Operation:** `central_paradox`.
- **Sources:** INV pp. 63; DIA pp. 244, 248; CV pp. 54–60; EX-C1 candidate pp. 5–8 (task-format reference; companion answer key listed above).
- **Level rationale:** C1: synthesize an apparent contradiction between preservation and invention across a cultural argument.
- **Answer:** `opt-1` — La continuité d’un lieu peut nécessiter de nouveaux usages plutôt que la reproduction de ses anciennes formes.
- **Evidence from original passage:** « Préserver le droit de s’approprier un lieu peut exiger davantage de nouveauté que la restauration minutieuse de son apparence. »
- **Explanation:** L’auteur distingue la fidélité à l’apparence et la continuité d’un rapport vivant au lieu.
- **Distractor review:**
  - `opt-2` — La fidélité aux usages anciens suppose de renoncer à toute amélioration du confort de la salle. L’auteur refuse explicitement le retour aux sièges cassés au nom de la mémoire.
  - `opt-3` — La restauration de l’apparence suffit à préserver le rapport collectif au lieu, malgré de nouveaux tarifs. Le texte distingue précisément la conservation matérielle et l’appropriation collective.
  - `opt-4` — La transmission du patrimoine devient possible seulement après l’effacement des traces de son histoire. La conclusion défend une continuité vivante, pas l’effacement de l’histoire.

### fr-reading-c1-010 — version 1

- **Passage:** `fr-reading-c1-p05` v1 — Conserver sans figer.
- **Prompt:** À quoi servent les trois questions sur la ville à laquelle le cinéma serait rendu ?
- **Operation:** `rhetorical_question`.
- **Sources:** INV pp. 63; DIA pp. 244, 248; CV pp. 54–60; EX-C1 candidate pp. 5–8 (task-format reference; companion answer key listed above).
- **Level rationale:** C1: interpret the critical function of a rhetorical sequence and the shifting reference of an abstract collective noun.
- **Answer:** `opt-3` — À mettre en évidence les publics différents que la formule du directeur réunit sans les distinguer.
- **Evidence from original passage:** « À quelle ville le rend-on : à celle que les archives permettent de représenter, à celle qui peut acheter ses billets, ou à celle qui n’a pas encore franchi la porte ? »
- **Explanation:** Les questions décomposent l’apparente unité de « la ville » en publics aux rapports différents au lieu.
- **Distractor review:**
  - `opt-1` — À désigner les anciens habitués comme les seuls représentants légitimes de la ville. Les questions incluent également le public qui n’a pas encore franchi la porte.
  - `opt-2` — À montrer que la ville actuelle se confond désormais avec les personnes qui achètent des billets. L’auteur interroge et élargit cette définition, il ne la valide pas.
  - `opt-4` — À établir un ordre de priorité déjà arrêté entre les archives, les clients et les futurs visiteurs. La série ouvre une question de représentation ; elle ne fixe pas de classement.

### fr-reading-c1-011 — version 1

- **Passage:** `fr-reading-c1-p06` v1 — Le droit de ne pas être recommandé.
- **Prompt:** Quelle conception de l’utilisateur l’auteur critique-t-il à travers l’image de la carte ?
- **Operation:** `implicit_assumption`.
- **Sources:** INV pp. 63; DIA pp. 244, 248; CV pp. 54–60; EX-C1 candidate pp. 5–8 (task-format reference; companion answer key listed above).
- **Level rationale:** C1: interpret an extended metaphor and the assumption about identity underlying an apparently useful service.
- **Answer:** `opt-2` — Celle d’une personne dont les goûts antérieurs délimiteraient durablement les découvertes pertinentes.
- **Evidence from original passage:** « un territoire dont nos préférences passées auraient déjà dessiné la carte »
- **Explanation:** La métaphore remet en cause la réduction des découvertes futures au profil construit à partir du passé.
- **Distractor review:**
  - `opt-1` — Celle d’une personne dont les préférences seraient trop imprécises pour permettre une recommandation utile. L’auteur reconnaît la pertinence des recommandations et critique les limites de cette pertinence.
  - `opt-3` — Celle d’une personne qui devrait oublier toute expérience antérieure pour pouvoir découvrir une œuvre. Il refuse d’assimiler la suspension du profil à l’oubli de toute préférence.
  - `opt-4` — Celle d’une personne dont le profil ne retiendrait que les œuvres sélectionnées au hasard. Le profil décrit repose sur les appréciations passées, pas sur une sélection aléatoire.

### fr-reading-c1-012 — version 1

- **Passage:** `fr-reading-c1-p06` v1 — Le droit de ne pas être recommandé.
- **Prompt:** Quelle proposition est la plus fidèle à la position de l’auteur ?
- **Operation:** `qualified_proposal`.
- **Sources:** INV pp. 63; DIA pp. 244, 248; CV pp. 54–60; EX-C1 candidate pp. 5–8 (task-format reference; companion answer key listed above).
- **Level rationale:** C1: reconstruct a proposal positioned between two rejected extremes while preserving its qualified scope.
- **Answer:** `opt-4` — Permettre des parcours moins dépendants du profil, sans supprimer toute forme d’accompagnement.
- **Evidence from original passage:** « Entre l’itinéraire parfaitement balisé et le hasard intégral, il existe pourtant des médiations »
- **Explanation:** L’auteur propose des médiations et une suspension du profil, entre prédiction intégrale et hasard sans repères.
- **Distractor review:**
  - `opt-1` — Remplacer toutes les recommandations par un tirage aléatoire afin de supprimer les influences. L’auteur refuse de présenter le hasard intégral comme forcément émancipateur.
  - `opt-2` — Améliorer uniquement la précision des profils pour prévoir chaque changement de goût. Il défend aussi ce qui peut se produire hors des anticipations.
  - `opt-3` — Conserver exclusivement les œuvres correspondant aux préférences déjà enregistrées. Cette limitation est précisément celle qu’il critique.

## Validation and remaining review

Structural validation checks: 60 unique question IDs; 12 questions and six passages per level; exactly two questions per passage; versioned passage references resolve; every correct key resolves to one of four unique options; option text is nonempty and distinct within an item; all levels/language/skill/status values match this draft; each quoted evidence span occurs in its referenced passage; all 60 question revisions have source mappings and three distractor explanations.

Content review checks: each answer is supported by its passage, prompts do not depend on outside knowledge or another item’s answer, and the distractor notes distinguish unsupported claims, role/sequence confusions, overgeneralizations and reversed arguments. The final wording and difficulty remain subject to user review. No learner pilot or psychometric calibration has been performed.

Allow rereading during the future test. Timing, reference-tool access, adaptive selection and result reporting remain separate implementation decisions. In particular, these questions do not validate claims that a percent-correct result measures a fixed fraction of the distance to the next CEFR level.
