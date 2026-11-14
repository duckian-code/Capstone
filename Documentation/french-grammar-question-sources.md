# French grammar bank: source mapping and review

Prepared 2026-11-14. Review draft: 60 original French grammar questions, 12 at each intended level A1–C1. Every question is revision 1 and has draft status pending review.

## Files and scope

- Bank: [grammar.json](../Causerie/src-tauri/resources/proficiency/fr/grammar.json).
- Guide: [French proficiency source guide](french-proficiency-source-guide.md).
- Plan: [CEFR TESTING PLANNING](CEFR%20TESTING%20PLANNING.md).
- Existing bank formats: [reading documentation](french-reading-question-sources.md) and [vocabulary documentation](french-vocabulary-question-sources.md).

This bank tests grammatical recognition, controlled completion, interpretation and meaning-preserving transformation in French. It does not measure spontaneous accuracy in free production. All contexts and question wording are original. French is the learner-facing language; no English translation knowledge is required.

## Sources and attribution

- **INV:** [French Linguistic Inventory](/home/anabelle/Documents/capstone/inventair-liguistique-des-contenus.pdf). Main grammar overviews: A1 PDF p. 58; A2 pp. 59–60; B1 p. 61; B2 pp. 62–63; C1 p. 63. Per-item references identify the target or related lower-level structure being combined.
- **CV:** [CEFR Companion Volume](</home/anabelle/Documents/capstone/CEFR-Companion Volume_eng.pdf>), PDF p. 132, grammatical accuracy: progression from a small learned repertoire toward reliable control of complex language. The source also explains why accuracy need not increase linearly when learners attempt more demanding language.
- **DIA:** [DIALANG Appendix C](/home/anabelle/Documents/capstone/DIALANG-CECRL_GBR.pdf), PDF p. 236: structures are among the tested areas, but its self-assessment scales do not supply a French grammatical-structure syllabus. It is background for assessment separation, not evidence assigning a tense to a level.
- **DELF/DALF samples:** provide communicative contexts and broader assessment expectations, but the supplied papers have no standalone grammar section corresponding to this bank. No question here is claimed to be an official DELF/DALF grammar item.
- **Guide:** §3 supplies the agreed French grammar authoring targets; §5 explains adjacent-level distinctions.

All references use PDF page numbers, counting the first page as 1. INV printed numbering is two lower. The inventory is selective and consensus-based, not an exhaustive or empirically calibrated grammar syllabus. Its content classifications overlap across levels. The same construction can support an easier isolated item and a harder integrated one.

C1 items mostly combine previously encountered structures with C1 temporal, discourse and reformulation demands. References to lower-level inventory entries are explicit; the bank does not claim that every structure first appears at C1. Local explanations describe the ordinary standard-French construction in the stated context, not every literary, dialectal or colloquial possibility. Difficulty labels remain authoring judgments requiring learner trials.

## Data contract

The collection follows the existing bank envelope: `schemaVersion: 1`, `bankVersion: 1`, `bankId: "fr-grammar"`, `language: "fr"`, `skill: "grammar"`, supported `levels`, `passages` and `questions`. Other languages can use sibling directories and independent banks, such as `es/grammar.json`. `fr` does not prescribe a country-specific locale.

`passages` is empty: every question contains its complete context in `prompt`, without passage IDs. The runtime format remains `single_choice` for completion, transformation and interpretation. Tags distinguish the operation and grammatical target. Preserve line breaks in the prompt. Two completion questions have two blanks; their options provide the two forms in order, separated by `/`, as stated in those prompts. No free-text scoring or new response type is implied.

Each question has a stable ID, version 1, draft status, four stable option IDs, one correct option ID and a French explanation. Source data, level rationale and distractor notes are stored only in this document. Correct answers earn one point. Adaptive thresholds and session records remain separate.

Question version identifies a content/scoring revision; schemaVersion identifies the JSON contract; bankVersion identifies a collection release. Preserve old revisions once administered and use stable question IDs for repeat avoidance. Correct positions are balanced within each level; runtime selection must still shuffle option IDs and save the displayed order. Withhold keys and explanations from the active test payload until feedback is appropriate.

Only the grammar JSON and this source document are added. No code, migration, loader, bundling configuration, or earlier bank status is changed. Tauri currently uses an explicit resource list, so integration and bundling are deferred to the implementation task.

## Authoring decisions that prevent ambiguous scoring

- When several tenses could express a future or past event, the instruction names the required tense or supplies an explicit timeline. Naming a tense deliberately tests controlled form selection, not spontaneous tense choice.
- Transformations state the required mood, tense, participants or meaning. A grammatically possible distractor can still be wrong because it changes one of these requirements; its note explains the change.
- The basic negative item specifies written standard ne… pas; it does not label ordinary spoken omission of ne as universally ungrammatical.
- The imperative item distinguishes the explicitly requested imperative from an infinitive, which can itself be a legitimate instruction on a sign.
- The fear-clause item identifies ne as expletive and tests its interpretation. It does not require adding this optional ne in every fear clause.
- Partial negation is supplied with an explicit three-out-of-five context, rather than relying on a potentially ambiguous isolated sentence.
- C1 gerund attachment is tested in controlled standard written reformulation; the intended subject and simultaneity are supplied.

## Coverage

| Level | Questions | Targets |
| --- | ---: | --- |
| A1 | 12 | Present tense, articles, adjective agreement, possessives, written negation, interrogatives, place prepositions, reflexives, near future and infinitive complements. |
| A2 | 12 | Passé composé, être-participle agreement, habitual imparfait, futur simple, direct/indirect object pronouns, en/y, simple relatives, comparison and imperative. |
| B1 | 12 | Background/event contrast, past anteriority, unreal present hypothesis, common mood frames, passive voice, gerund, preceding-object agreement, dont, double pronouns, indirect questions and restriction. |
| B2 | 12 | Future anterior, past infinitive, past unreal consequence, reported speech, conjunction-governed mood, compound relatives, participle/adjective distinction, imperative pronoun order, emphasis, modal reproach and concessive transformation. |
| C1 | 12 | Integrated narrative and reported chronology, mixed-time hypotheses, fear clauses and expletive ne, subject control, concessive qualification, reinforced cause, unintended result, relative reference, negation scope, passive past subjunctive and gerund attachment. |

## Answer index

| Question ID | Version | Target | Operation | Key | Answer |
| --- | ---: | --- | --- | --- | --- |
| `fr-grammar-a1-001` | 1 | `present_etre` | `completion` | `opt-1` | sommes |
| `fr-grammar-a1-002` | 1 | `present_avoir` | `completion` | `opt-3` | ont |
| `fr-grammar-a1-003` | 1 | `present_regular` | `completion` | `opt-2` | parles |
| `fr-grammar-a1-004` | 1 | `indefinite_article` | `completion` | `opt-4` | une |
| `fr-grammar-a1-005` | 1 | `adjective_agreement` | `completion` | `opt-1` | petites |
| `fr-grammar-a1-006` | 1 | `possessive_determiner` | `completion` | `opt-3` | mes |
| `fr-grammar-a1-007` | 1 | `negation_ne_pas` | `transformation` | `opt-2` | Je ne travaille pas dimanche. |
| `fr-grammar-a1-008` | 1 | `interrogative_location` | `completion` | `opt-4` | Où |
| `fr-grammar-a1-009` | 1 | `country_preposition` | `completion` | `opt-1` | en |
| `fr-grammar-a1-010` | 1 | `reflexive_pronoun` | `completion` | `opt-3` | nous |
| `fr-grammar-a1-011` | 1 | `near_future_infinitive` | `completion` | `opt-2` | regarder |
| `fr-grammar-a1-012` | 1 | `impersonal_infinitive` | `completion` | `opt-4` | fermer |
| `fr-grammar-a2-001` | 1 | `passe_compose_avoir` | `completion` | `opt-1` | fini |
| `fr-grammar-a2-002` | 1 | `passe_compose_etre_agreement` | `completion` | `opt-3` | allées |
| `fr-grammar-a2-003` | 1 | `imparfait_habit` | `completion` | `opt-2` | jouions |
| `fr-grammar-a2-004` | 1 | `future_simple` | `completion` | `opt-4` | habiterons |
| `fr-grammar-a2-005` | 1 | `direct_object_pronoun` | `completion` | `opt-1` | la |
| `fr-grammar-a2-006` | 1 | `indirect_object_pronoun` | `completion` | `opt-3` | leur |
| `fr-grammar-a2-007` | 1 | `en_quantity` | `completion` | `opt-2` | en |
| `fr-grammar-a2-008` | 1 | `y_location` | `completion` | `opt-4` | y |
| `fr-grammar-a2-009` | 1 | `relative_qui` | `completion` | `opt-1` | qui |
| `fr-grammar-a2-010` | 1 | `relative_que` | `completion` | `opt-3` | que |
| `fr-grammar-a2-011` | 1 | `comparison` | `completion` | `opt-2` | que |
| `fr-grammar-a2-012` | 1 | `imperative_vous` | `transformation` | `opt-4` | Fermez la porte. |
| `fr-grammar-b1-001` | 1 | `past_background_event` | `completion` | `opt-1` | préparais / a sonné |
| `fr-grammar-b1-002` | 1 | `past_anteriority` | `completion` | `opt-3` | avait préparé |
| `fr-grammar-b1-003` | 1 | `present_hypothesis` | `completion` | `opt-2` | voyagerions |
| `fr-grammar-b1-004` | 1 | `subjunctive_obligation` | `completion` | `opt-4` | fasses |
| `fr-grammar-b1-005` | 1 | `indicative_hope` | `completion` | `opt-1` | viendra |
| `fr-grammar-b1-006` | 1 | `passive_past` | `transformation` | `opt-3` | Les invitations ont été envoyées par la secrétaire. |
| `fr-grammar-b1-007` | 1 | `gerund_subject` | `interpretation` | `opt-2` | Léa écoute la radio pendant qu’elle prépare le repas. |
| `fr-grammar-b1-008` | 1 | `avoir_preceding_object_agreement` | `completion` | `opt-4` | écrites |
| `fr-grammar-b1-009` | 1 | `relative_dont` | `completion` | `opt-1` | dont |
| `fr-grammar-b1-010` | 1 | `double_pronouns` | `transformation` | `opt-3` | Je le lui donne. |
| `fr-grammar-b1-011` | 1 | `indirect_yes_no_question` | `completion` | `opt-2` | si |
| `fr-grammar-b1-012` | 1 | `restriction_ne_que` | `interpretation` | `opt-4` | Le musée ouvre seulement le dimanche. |
| `fr-grammar-b2-001` | 1 | `future_anterior` | `completion` | `opt-1` | aurons terminé |
| `fr-grammar-b2-002` | 1 | `past_infinitive` | `completion` | `opt-3` | avoir reçu |
| `fr-grammar-b2-003` | 1 | `past_counterfactual` | `completion` | `opt-2` | aurions réservé |
| `fr-grammar-b2-004` | 1 | `past_reported_speech` | `transformation` | `opt-4` | Nora a dit lundi qu’elle partirait le lendemain. |
| `fr-grammar-b2-005` | 1 | `conditional_au_cas_ou` | `completion` | `opt-1` | auriez |
| `fr-grammar-b2-006` | 1 | `subjunctive_concession` | `completion` | `opt-3` | soit |
| `fr-grammar-b2-007` | 1 | `compound_relative` | `completion` | `opt-2` | lesquels |
| `fr-grammar-b2-008` | 1 | `participle_adjective` | `completion` | `opt-4` | fatigantes / fatiguant |
| `fr-grammar-b2-009` | 1 | `double_pronouns_imperative` | `transformation` | `opt-1` | Donnez-les-lui. |
| `fr-grammar-b2-010` | 1 | `emphasis_ce_dont` | `completion` | `opt-3` | Ce dont |
| `fr-grammar-b2-011` | 1 | `conditional_past_reproach` | `interpretation` | `opt-2` | Il aurait été préférable que tu nous préviennes, mais tu ne l’as pas fait. |
| `fr-grammar-b2-012` | 1 | `causal_vs_concessive` | `transformation` | `opt-4` | Bien qu’il ait plu, le match a continué. |
| `fr-grammar-c1-001` | 1 | `literary_temporal_structure` | `interpretation` | `opt-1` | La décision précède l’entrée de Nora ; la discussion sur l’annonce est en cours à son entrée ; Nora comprend ensuite la situation. |
| `fr-grammar-c1-002` | 1 | `mixed_counterfactual` | `completion` | `opt-3` | serions |
| `fr-grammar-c1-003` | 1 | `reported_speech_multiple_times` | `transformation` | `opt-2` | Léa a déclaré le 10 juin qu’elle avait reçu le dossier la veille et qu’elle le présenterait le lendemain. |
| `fr-grammar-c1-004` | 1 | `expletive_ne_fear` | `interpretation` | `opt-4` | Le comité a prolongé le délai pour éviter que certains candidats renoncent à déposer leur dossier. |
| `fr-grammar-c1-005` | 1 | `purpose_subject_control` | `transformation` | `opt-1` | Le comité a simplifié le formulaire pour permettre aux candidats de le remplir sans aide. |
| `fr-grammar-c1-006` | 1 | `concessive_qualification` | `interpretation` | `opt-3` | La seconde proposition apporte une réserve qui limite l’appréciation positive de la première. |
| `fr-grammar-c1-007` | 1 | `reinforced_cause` | `transformation` | `opt-2` | Nous devons vérifier ces chiffres ; leur utilisation pour répartir les aides renforce encore cette nécessité. |
| `fr-grammar-c1-008` | 1 | `result_vs_purpose` | `transformation` | `opt-4` | Le chantier a pris tellement de retard que le financement initial n’était plus suffisant. |
| `fr-grammar-c1-009` | 1 | `embedded_relative_reference` | `transformation` | `opt-1` | Lors de la première sélection, le coût des projets concernés avait été sous-estimé ; le comité a ensuite réexaminé ces projets. |
| `fr-grammar-c1-010` | 1 | `quantified_negation_scope` | `interpretation` | `opt-3` | Toutes les propositions n’ont pas été retenues. |
| `fr-grammar-c1-011` | 1 | `past_subjunctive_passive` | `completion` | `opt-2` | aient été transmis |
| `fr-grammar-c1-012` | 1 | `gerund_attachment` | `transformation` | `opt-4` | En examinant les comptes, les auditrices ont découvert plusieurs anomalies. |

## A1: question-by-question mapping

Present tense, articles, adjective agreement, possessives, written negation, interrogatives, place prepositions, reflexives, near future and infinitive complements.

### fr-grammar-a1-001 — version 1

- **Target / operation:** `present_etre` / `completion`.
- **Source basis:** INV PDF pp. 58; CV PDF p. 132; guide §3 (A1) and §5.
- **Level rationale:** Common present-tense agreement with an explicit subject.
- **Prompt and context:**

  Complétez au présent.

  Ma sœur et moi, nous ___ à la maison.

- **Correct answer:** `opt-1` — sommes
- **Rule / meaning:** Avec nous, le verbe être au présent se conjugue sommes.
- **Distractor rationale:**
  - `opt-2` — suis: Suis s’emploie avec je.
  - `opt-3` — êtes: Êtes s’emploie avec vous.
  - `opt-4` — sont: Sont s’emploie avec ils ou elles.

### fr-grammar-a1-002 — version 1

- **Target / operation:** `present_avoir` / `completion`.
- **Source basis:** INV PDF pp. 58; CV PDF p. 132; guide §3 (A1) and §5.
- **Level rationale:** Common irregular present with a concrete plural noun subject.
- **Prompt and context:**

  Complétez au présent.

  Les enfants ___ un ballon.

- **Correct answer:** `opt-3` — ont
- **Rule / meaning:** Les enfants peut être remplacé par ils : ils ont.
- **Distractor rationale:**
  - `opt-1` — a: A correspond à il ou elle, pas au pluriel.
  - `opt-2` — avons: Avons correspond à nous.
  - `opt-4` — avez: Avez correspond à vous.

### fr-grammar-a1-003 — version 1

- **Target / operation:** `present_regular` / `completion`.
- **Source basis:** INV PDF pp. 58; CV PDF p. 132; guide §3 (A1) and §5.
- **Level rationale:** Regular present agreement in a short familiar sentence.
- **Prompt and context:**

  Complétez au présent.

  Tu ___ français avec ton amie.

- **Correct answer:** `opt-2` — parles
- **Rule / meaning:** Au présent, parler se conjugue tu parles.
- **Distractor rationale:**
  - `opt-1` — parle: Avec tu, parler prend la terminaison -es.
  - `opt-3` — parlons: Parlons correspond à nous.
  - `opt-4` — parlent: Parlent correspond à ils ou elles.

### fr-grammar-a1-004 — version 1

- **Target / operation:** `indefinite_article` / `completion`.
- **Source basis:** INV PDF pp. 58; CV PDF p. 132; guide §3 (A1) and §5.
- **Level rationale:** Basic gender and number of an indefinite article; the requested article type is explicit.
- **Prompt and context:**

  Complétez avec l’article indéfini qui convient.

  Dans mon sac, il y a ___ pomme.

- **Correct answer:** `opt-4` — une
- **Rule / meaning:** Pomme est un nom féminin singulier : une pomme.
- **Distractor rationale:**
  - `opt-1` — un: Pomme est féminin, pas masculin.
  - `opt-2` — des: Pomme est ici au singulier.
  - `opt-3` — du: Du est un article partitif masculin, pas l’article indéfini féminin demandé.

### fr-grammar-a1-005 — version 1

- **Target / operation:** `adjective_agreement` / `completion`.
- **Source basis:** INV PDF pp. 58; CV PDF p. 132; guide §3 (A1) and §5.
- **Level rationale:** Basic adjective gender/number agreement in a concrete description.
- **Prompt and context:**

  Complétez avec la forme correcte de petit.

  Ces deux maisons sont ___.

- **Correct answer:** `opt-1` — petites
- **Rule / meaning:** Maisons est féminin pluriel : l’adjectif devient petites.
- **Distractor rationale:**
  - `opt-2` — petit: Le masculin singulier ne s’accorde pas avec maisons.
  - `opt-3` — petite: Le féminin singulier ne marque pas le pluriel.
  - `opt-4` — petits: Le masculin pluriel ne marque pas le féminin.

### fr-grammar-a1-006 — version 1

- **Target / operation:** `possessive_determiner` / `completion`.
- **Source basis:** INV PDF pp. 58; CV PDF p. 132; guide §3 (A1) and §5.
- **Level rationale:** Basic possessive choice using explicitly specified ownership and plural number.
- **Prompt and context:**

  Complétez pour dire que les clés sont à moi.

  Voici ___ clés.

- **Correct answer:** `opt-3` — mes
- **Rule / meaning:** Mes est le possessif de première personne pour un nom pluriel.
- **Distractor rationale:**
  - `opt-1` — mon: Mon accompagne un nom singulier, pas clés.
  - `opt-2` — ma: Ma accompagne un nom féminin singulier.
  - `opt-4` — tes: Tes indiquerait que les clés sont à toi, pas à moi.

### fr-grammar-a1-007 — version 1

- **Target / operation:** `negation_ne_pas` / `transformation`.
- **Source basis:** INV PDF pp. 58; CV PDF p. 132; guide §3 (A1) and §5.
- **Level rationale:** Basic written negation; the instruction avoids treating ordinary spoken omission of ne as universally wrong.
- **Prompt and context:**

  Choisissez la phrase négative correcte en français écrit standard. Utilisez ne… pas.

  Je travaille dimanche.

- **Correct answer:** `opt-2` — Je ne travaille pas dimanche.
- **Rule / meaning:** Dans cette phrase, ne précède travaille et pas le suit.
- **Distractor rationale:**
  - `opt-1` — Je pas travaille dimanche.: La négation demandée nécessite ne avant le verbe et pas après.
  - `opt-3` — Je ne pas travaille dimanche.: Pas doit suivre le verbe conjugué.
  - `opt-4` — Je travaille ne pas dimanche.: Ne doit précéder le verbe conjugué.

### fr-grammar-a1-008 — version 1

- **Target / operation:** `interrogative_location` / `completion`.
- **Source basis:** INV PDF pp. 58; CV PDF p. 132; guide §3 (A1) and §5.
- **Level rationale:** Basic interrogative function with an explicit location answer.
- **Prompt and context:**

  Complétez la question qui demande le lieu.

  — ___ habites-tu ?
  — À Lyon.

- **Correct answer:** `opt-4` — Où
- **Rule / meaning:** Où permet de demander un lieu.
- **Distractor rationale:**
  - `opt-1` — Quand: Quand demande un moment, pas un lieu.
  - `opt-2` — Comment: Comment demande une manière.
  - `opt-3` — Pourquoi: Pourquoi demande une raison.

### fr-grammar-a1-009 — version 1

- **Target / operation:** `country_preposition` / `completion`.
- **Source basis:** INV PDF pp. 58; CV PDF p. 132; guide §3 (A1) and §5.
- **Level rationale:** Basic locative construction with a familiar country name.
- **Prompt and context:**

  Complétez.

  Elle habite ___ France.

- **Correct answer:** `opt-1` — en
- **Rule / meaning:** Avec le nom de pays féminin France, on emploie en : en France.
- **Distractor rationale:**
  - `opt-2` — au: Au s’emploie notamment avec des noms de pays masculins commençant par une consonne, pas France.
  - `opt-3` — aux: Aux convient à des noms de pays pluriels.
  - `opt-4` — à: On dit en France pour situer une habitation dans ce pays.

### fr-grammar-a1-010 — version 1

- **Target / operation:** `reflexive_pronoun` / `completion`.
- **Source basis:** INV PDF pp. 58; CV PDF p. 132; guide §3 (A1) and §5.
- **Level rationale:** Basic reflexive routine with matching person.
- **Prompt and context:**

  Complétez avec le pronom qui convient.

  Nous ___ levons à sept heures.

- **Correct answer:** `opt-3` — nous
- **Rule / meaning:** Le pronom réfléchi reprend la personne du sujet : nous nous levons.
- **Distractor rationale:**
  - `opt-1` — se: Se correspond à la troisième personne.
  - `opt-2` — me: Me correspond à je.
  - `opt-4` — vous: Vous ne correspond pas au sujet nous pour ce verbe pronominal.

### fr-grammar-a1-011 — version 1

- **Target / operation:** `near_future_infinitive` / `completion`.
- **Source basis:** INV PDF pp. 58; CV PDF p. 132; guide §3 (A1) and §5.
- **Level rationale:** Recognition of the familiar aller + infinitive pattern.
- **Prompt and context:**

  Complétez cette phrase au futur proche.

  Ce soir, je vais ___ un film.

- **Correct answer:** `opt-2` — regarder
- **Rule / meaning:** Le futur proche se forme avec aller au présent suivi de l’infinitif : je vais regarder.
- **Distractor rationale:**
  - `opt-1` — regarde: Après vais, le verbe du futur proche doit être à l’infinitif.
  - `opt-3` — regardé: Le participe passé ne forme pas le futur proche après vais.
  - `opt-4` — regardons: Regardons est une forme conjuguée, pas un infinitif.

### fr-grammar-a1-012 — version 1

- **Target / operation:** `impersonal_infinitive` / `completion`.
- **Source basis:** INV PDF pp. 58; CV PDF p. 132; guide §3 (A1) and §5.
- **Level rationale:** Common obligation + infinitive frame, without requiring the subjunctive.
- **Prompt and context:**

  Complétez.

  Avant de sortir, il faut ___ la porte.

- **Correct answer:** `opt-4` — fermer
- **Rule / meaning:** On emploie l’infinitif après il faut : il faut fermer.
- **Distractor rationale:**
  - `opt-1` — ferme: Après il faut sans que, on utilise ici l’infinitif.
  - `opt-2` — fermons: Fermons est conjugué avec nous, pas à l’infinitif.
  - `opt-3` — fermé: Fermé est un participe passé, pas un infinitif.

## A2: question-by-question mapping

Passé composé, être-participle agreement, habitual imparfait, futur simple, direct/indirect object pronouns, en/y, simple relatives, comparison and imperative.

### fr-grammar-a2-001 — version 1

- **Target / operation:** `passe_compose_avoir` / `completion`.
- **Source basis:** INV PDF pp. 59–60; CV PDF p. 132; guide §3 (A2) and §5.
- **Level rationale:** Routine completed event; identify the participle with an already supplied auxiliary.
- **Prompt and context:**

  Complétez au passé composé.

  Hier, nous avons ___ le travail à dix-sept heures.

- **Correct answer:** `opt-1` — fini
- **Rule / meaning:** Le passé composé de finir avec nous est nous avons fini.
- **Distractor rationale:**
  - `opt-2` — finir: Le passé composé demande un participe passé après avoir.
  - `opt-3` — finissons: Finissons est une forme du présent.
  - `opt-4` — finissait: Finissait est une forme de l’imparfait.

### fr-grammar-a2-002 — version 1

- **Target / operation:** `passe_compose_etre_agreement` / `completion`.
- **Source basis:** INV PDF pp. 59–60; CV PDF p. 132; guide §3 (A2) and §5.
- **Level rationale:** Agreement with être in a familiar movement verb; no exceptional pronominal agreement.
- **Prompt and context:**

  Complétez au passé composé.

  Léa et sa sœur sont ___ au marché.

- **Correct answer:** `opt-3` — allées
- **Rule / meaning:** Avec être, le participe passé aller s’accorde ici avec Léa et sa sœur : allées.
- **Distractor rationale:**
  - `opt-1` — allé: Le participe doit s’accorder au féminin pluriel avec le sujet.
  - `opt-2` — allée: Cette forme est au féminin singulier, pas pluriel.
  - `opt-4` — allés: Cette forme est au masculin pluriel, pas féminin.

### fr-grammar-a2-003 — version 1

- **Target / operation:** `imparfait_habit` / `completion`.
- **Source basis:** INV PDF pp. 59; CV PDF p. 132; guide §3 (A2) and §5.
- **Level rationale:** Basic past habit with an explicit tense instruction; distinguish forms rather than accepting several narrative tenses.
- **Prompt and context:**

  Complétez à l’imparfait pour décrire une habitude passée.

  Quand nous étions enfants, nous ___ au parc tous les mercredis.

- **Correct answer:** `opt-2` — jouions
- **Rule / meaning:** L’imparfait de jouer avec nous est jouions ; il décrit ici une habitude passée.
- **Distractor rationale:**
  - `opt-1` — jouons: Jouons est au présent, pas à l’imparfait.
  - `opt-3` — jouerons: Jouerons est au futur simple.
  - `opt-4` — jouerions: Jouerions est au conditionnel présent.

### fr-grammar-a2-004 — version 1

- **Target / operation:** `future_simple` / `completion`.
- **Source basis:** INV PDF pp. 59; CV PDF p. 132; guide §3 (A2) and §5.
- **Level rationale:** Simple future formation; naming the tense prevents a plausible present-for-future alternative.
- **Prompt and context:**

  Complétez au futur simple.

  L’année prochaine, nous ___ dans une autre ville.

- **Correct answer:** `opt-4` — habiterons
- **Rule / meaning:** Le futur simple de habiter avec nous est habiterons.
- **Distractor rationale:**
  - `opt-1` — habitons: Habitons est au présent, même si le présent peut exprimer un futur dans d’autres consignes.
  - `opt-2` — habitions: Habitions est à l’imparfait dans ce contexte.
  - `opt-3` — habiterions: Habiterions est au conditionnel présent.

### fr-grammar-a2-005 — version 1

- **Target / operation:** `direct_object_pronoun` / `completion`.
- **Source basis:** INV PDF pp. 60; CV PDF p. 132; guide §3 (A2) and §5.
- **Level rationale:** Single direct-object pronoun with explicit referent and no compound-tense agreement.
- **Prompt and context:**

  Remplacez uniquement « cette voisine » par un pronom.

  Je vois cette voisine chaque matin. → Je ___ vois chaque matin.

- **Correct answer:** `opt-1` — la
- **Rule / meaning:** Cette voisine est un complément d’objet direct féminin singulier : la.
- **Distractor rationale:**
  - `opt-2` — lui: Voir prend ici un complément direct, pas à cette voisine.
  - `opt-3` — leur: Leur serait un complément indirect pluriel.
  - `opt-4` — les: Cette voisine est au singulier, pas au pluriel.

### fr-grammar-a2-006 — version 1

- **Target / operation:** `indirect_object_pronoun` / `completion`.
- **Source basis:** INV PDF pp. 60; CV PDF p. 132; guide §3 (A2) and §5.
- **Level rationale:** Single indirect-object pronoun in a routine family context.
- **Prompt and context:**

  Remplacez uniquement « à mes parents » par un pronom.

  Je parle à mes parents. → Je ___ parle.

- **Correct answer:** `opt-3` — leur
- **Rule / meaning:** À mes parents est un complément indirect pluriel : je leur parle.
- **Distractor rationale:**
  - `opt-1` — les: Les reprend un objet direct, alors que parler se construit ici avec à.
  - `opt-2` — lui: Lui serait singulier, alors que mes parents est pluriel.
  - `opt-4` — le: Le reprend un objet direct masculin singulier.

### fr-grammar-a2-007 — version 1

- **Target / operation:** `en_quantity` / `completion`.
- **Source basis:** INV PDF pp. 60; CV PDF p. 132; guide §3 (A2) and §5.
- **Level rationale:** Basic en + quantity in a routine transaction.
- **Prompt and context:**

  Remplacez « des pommes » par un pronom et gardez la quantité.

  — Vous achetez des pommes ?
  — Oui, nous ___ achetons trois.

- **Correct answer:** `opt-2` — en
- **Rule / meaning:** En reprend les pommes tandis que trois indique la quantité : nous en achetons trois.
- **Distractor rationale:**
  - `opt-1` — y: Y ne reprend pas ici une quantité de pommes.
  - `opt-3` — les: Avec trois conservé après le verbe, le pronom attendu pour la quantité est en.
  - `opt-4` — leur: Leur désigne un complément indirect pluriel, pas une quantité achetée.

### fr-grammar-a2-008 — version 1

- **Target / operation:** `y_location` / `completion`.
- **Source basis:** INV PDF pp. 60; CV PDF p. 132; guide §3 (A2) and §5.
- **Level rationale:** Basic place replacement with y.
- **Prompt and context:**

  Remplacez uniquement « à la piscine » par un pronom.

  Nous allons à la piscine le mardi. → Nous ___ allons le mardi.

- **Correct answer:** `opt-4` — y
- **Rule / meaning:** Y reprend ici le lieu introduit par à : nous y allons.
- **Distractor rationale:**
  - `opt-1` — en: En peut reprendre une provenance avec de, pas la destination à la piscine ici.
  - `opt-2` — la: La serait un objet direct, pas un complément de lieu après aller.
  - `opt-3` — lui: Lui ne reprend pas le lieu à la piscine.

### fr-grammar-a2-009 — version 1

- **Target / operation:** `relative_qui` / `completion`.
- **Source basis:** INV PDF pp. 60; CV PDF p. 132; guide §3 (A2) and §5.
- **Level rationale:** Simple subject relative in a familiar description.
- **Prompt and context:**

  Complétez avec le pronom relatif qui convient.

  C’est la personne ___ travaille à l’accueil.

- **Correct answer:** `opt-1` — qui
- **Rule / meaning:** Qui est le sujet de travaille et reprend la personne.
- **Distractor rationale:**
  - `opt-2` — que: Il faut un sujet pour travaille ; que serait un objet direct.
  - `opt-3` — où: Où reprend un lieu ou un moment, pas le sujet personne.
  - `opt-4` — dont: Aucune construction avec de ne justifie dont ici.

### fr-grammar-a2-010 — version 1

- **Target / operation:** `relative_que` / `completion`.
- **Source basis:** INV PDF pp. 60; CV PDF p. 132; guide §3 (A2) and §5.
- **Level rationale:** Simple direct-object relative with an explicit subject in the relative clause.
- **Prompt and context:**

  Complétez avec le pronom relatif qui convient.

  Voici le livre ___ tu cherches.

- **Correct answer:** `opt-3` — que
- **Rule / meaning:** On cherche quelque chose : le livre est repris par le relatif objet que.
- **Distractor rationale:**
  - `opt-1` — qui: Le sujet de cherches est déjà tu ; le pronom reprend l’objet.
  - `opt-2` — où: Où ne remplace pas l’objet direct de chercher.
  - `opt-4` — dont: On cherche un livre, sans de ; dont ne convient pas.

### fr-grammar-a2-011 — version 1

- **Target / operation:** `comparison` / `completion`.
- **Source basis:** INV PDF pp. 60; CV PDF p. 132; guide §3 (A2) and §5.
- **Level rationale:** Basic comparative construction with concrete familiar facts.
- **Prompt and context:**

  Complétez.

  Paul a vingt ans et Léa a dix-huit ans. Paul est plus âgé ___ Léa.

- **Correct answer:** `opt-2` — que
- **Rule / meaning:** La comparaison se construit avec plus… que : plus âgé que Léa.
- **Distractor rationale:**
  - `opt-1` — de: Le complément du comparatif plus âgé se construit avec que ici.
  - `opt-3` — à: À ne relie pas les deux personnes dans cette comparaison.
  - `opt-4` — comme: Comme ne suit pas plus dans cette construction comparative.

### fr-grammar-a2-012 — version 1

- **Target / operation:** `imperative_vous` / `transformation`.
- **Source basis:** INV PDF pp. 59; CV PDF p. 132; guide §3 (A2) and §5.
- **Level rationale:** Routine instruction with explicit person and mood, avoiding ambiguity with valid infinitive signage.
- **Prompt and context:**

  Vous vous adressez à plusieurs personnes. Choisissez la consigne à l’impératif présent.

  Fermer la porte.

- **Correct answer:** `opt-4` — Fermez la porte.
- **Rule / meaning:** À l’impératif présent correspondant à vous, on dit fermez.
- **Distractor rationale:**
  - `opt-1` — Fermer la porte.: C’est l’infinitif ; il peut servir de consigne, mais ce n’est pas l’impératif demandé.
  - `opt-2` — Ferment la porte.: Ferment est une forme de la troisième personne du pluriel, pas l’impératif.
  - `opt-3` — Fermais la porte.: Fermais est une forme de l’imparfait.

## B1: question-by-question mapping

Background/event contrast, past anteriority, unreal present hypothesis, common mood frames, passive voice, gerund, preceding-object agreement, dont, double pronouns, indirect questions and restriction.

### fr-grammar-b1-001 — version 1

- **Target / operation:** `past_background_event` / `completion`.
- **Source basis:** INV PDF pp. 61; CV PDF p. 132; guide §3 (B1) and §5.
- **Level rationale:** Explicit background/event contrast across clauses; the context determines their temporal roles.
- **Prompt and context:**

  Choisissez les deux formes, dans l’ordre des blancs. La préparation du repas était déjà en cours quand le téléphone a sonné une fois.

  Je ___ le repas quand le téléphone ___.

- **Correct answer:** `opt-1` — préparais / a sonné
- **Rule / meaning:** L’imparfait préparais décrit l’action en cours ; le passé composé a sonné présente l’événement ponctuel.
- **Distractor rationale:**
  - `opt-2` — ai préparé / sonnait: Cette combinaison inverse le rôle de l’action en cours et de l’événement ponctuel demandé.
  - `opt-3` — préparerai / a sonné: Le futur ne situe pas la préparation comme déjà en cours lors de cet événement passé.
  - `opt-4` — prépare / sonnera: Cette combinaison ne respecte pas le cadre passé imposé.

### fr-grammar-b1-002 — version 1

- **Target / operation:** `past_anteriority` / `completion`.
- **Source basis:** INV PDF pp. 61; CV PDF p. 132; guide §3 (B1) and §5.
- **Level rationale:** Past-before-past relation supported by already completed preparation, not just an isolated form.
- **Prompt and context:**

  Complétez pour indiquer une action déjà terminée avant notre arrivée passée.

  Quand nous sommes arrivés, Nora ___ déjà le repas ; tout était prêt.

- **Correct answer:** `opt-3` — avait préparé
- **Rule / meaning:** Le plus-que-parfait avait préparé situe la préparation avant notre arrivée passée.
- **Distractor rationale:**
  - `opt-1` — préparera: Le futur ne situe pas l’action avant l’arrivée passée.
  - `opt-2` — préparerait: Le conditionnel exprimerait notamment un futur dans le passé ou une hypothèse, pas l’antériorité achevée demandée.
  - `opt-4` — prépare: Le présent ne marque pas l’antériorité achevée dans ce récit passé.

### fr-grammar-b1-003 — version 1

- **Target / operation:** `present_hypothesis` / `completion`.
- **Source basis:** INV PDF pp. 61; CV PDF p. 132; guide §3 (B1) and §5.
- **Level rationale:** Present hypothetical consequence using a clearly unreal current premise.
- **Prompt and context:**

  Complétez cette hypothèse imaginaire sur la situation actuelle.

  Nous n’avons pas assez d’argent. Si nous en avions davantage, nous ___ plus souvent.

- **Correct answer:** `opt-2` — voyagerions
- **Rule / meaning:** Dans cette hypothèse, si + imparfait est suivi du conditionnel présent : nous voyagerions.
- **Distractor rationale:**
  - `opt-1` — voyagerons: Le futur simple ne correspond pas à la conséquence de cette hypothèse imaginaire au présent.
  - `opt-3` — voyageons: Le présent n’exprime pas ici la conséquence hypothétique demandée.
  - `opt-4` — avons voyagé: Le passé composé exprimerait des voyages accomplis, pas cette possibilité actuelle.

### fr-grammar-b1-004 — version 1

- **Target / operation:** `subjunctive_obligation` / `completion`.
- **Source basis:** INV PDF pp. 61; CV PDF p. 132; guide §3 (B1) and §5.
- **Level rationale:** Common obligation frame with a frequent irregular subjunctive.
- **Prompt and context:**

  Complétez.

  Pour finir à temps, il faut que tu ___ cet exercice maintenant.

- **Correct answer:** `opt-4` — fasses
- **Rule / meaning:** Après il faut que, on utilise le subjonctif : que tu fasses.
- **Distractor rationale:**
  - `opt-1` — fais: Fais est à l’indicatif présent ; il faut que appelle ici le subjonctif.
  - `opt-2` — feras: Feras est au futur simple, pas au subjonctif.
  - `opt-3` — faire: Le sujet tu dans la proposition introduite par que nécessite un verbe conjugué.

### fr-grammar-b1-005 — version 1

- **Target / operation:** `indicative_hope` / `completion`.
- **Source basis:** INV PDF pp. 61; CV PDF p. 132; guide §3 (B1) and §5.
- **Level rationale:** Contrast a common affirmative indicative frame with subjunctive overgeneralization; mood and time are explicit.
- **Prompt and context:**

  Complétez en employant le futur simple après espérer à la forme affirmative.

  J’espère que Nora ___ demain.

- **Correct answer:** `opt-1` — viendra
- **Rule / meaning:** À la forme affirmative, espérer que se construit normalement avec l’indicatif ; viendra est au futur simple.
- **Distractor rationale:**
  - `opt-2` — vienne: Vienne est au subjonctif présent, pas au futur simple demandé.
  - `opt-3` — venir: Venir est un infinitif et ne forme pas ici une proposition conjuguée.
  - `opt-4` — venue: Venue est un participe passé, sans auxiliaire dans cette phrase.

### fr-grammar-b1-006 — version 1

- **Target / operation:** `passive_past` / `transformation`.
- **Source basis:** INV PDF pp. 61; CV PDF p. 132; guide §3 (B1) and §5.
- **Level rationale:** Active-to-passive transformation preserving tense, participant roles and agreement.
- **Prompt and context:**

  Mettez la phrase à la voix passive en conservant le passé composé.

  La secrétaire a envoyé les invitations.

- **Correct answer:** `opt-3` — Les invitations ont été envoyées par la secrétaire.
- **Rule / meaning:** Le passif au passé composé se forme avec ont été et le participe accordé : envoyées.
- **Distractor rationale:**
  - `opt-1` — Les invitations ont envoyé la secrétaire.: Cette phrase reste active et inverse les rôles.
  - `opt-2` — Les invitations sont envoyées par la secrétaire.: Cette forme passive est au présent, pas au passé composé demandé.
  - `opt-4` — Les invitations ont été envoyé par la secrétaire.: Le participe envoyé doit s’accorder au féminin pluriel avec invitations.

### fr-grammar-b1-007 — version 1

- **Target / operation:** `gerund_subject` / `interpretation`.
- **Source basis:** INV PDF pp. 61; CV PDF p. 132; guide §3 (B1) and §5.
- **Level rationale:** Interpret subject linkage and simultaneity rather than merely identify the -ant ending.
- **Prompt and context:**

  Quelle reformulation conserve le sujet des actions et leur relation dans le temps ?

  En préparant le repas, Léa écoute la radio.

- **Correct answer:** `opt-2` — Léa écoute la radio pendant qu’elle prépare le repas.
- **Rule / meaning:** Le gérondif en préparant a le même sujet que écoute, Léa, et marque ici la simultanéité.
- **Distractor rationale:**
  - `opt-1` — Une autre personne écoute la radio pendant que Léa prépare le repas.: Le sujet du gérondif est celui du verbe principal : Léa.
  - `opt-3` — Léa écoute la radio seulement après avoir fini de préparer le repas.: Le gérondif décrit ici des actions simultanées, pas successives.
  - `opt-4` — Une autre personne écoute la radio après le départ de Léa.: La phrase n’introduit ni cet autre sujet ni ce départ.

### fr-grammar-b1-008 — version 1

- **Target / operation:** `avoir_preceding_object_agreement` / `completion`.
- **Source basis:** INV PDF pp. 61; CV PDF p. 132; guide §3 (B1) and §5.
- **Level rationale:** Agreement with a preceding direct object in a simple relative clause.
- **Prompt and context:**

  Complétez avec la forme correcte du participe passé.

  Les lettres que j’ai ___ sont sur la table.

- **Correct answer:** `opt-4` — écrites
- **Rule / meaning:** Que reprend les lettres, complément direct placé avant ai écrit : on écrit écrites.
- **Distractor rationale:**
  - `opt-1` — écrit: Le complément direct les lettres, repris par que, est placé avant avoir : l’accord est nécessaire.
  - `opt-2` — écrits: Cette forme est au masculin pluriel au lieu du féminin pluriel.
  - `opt-3` — écrite: Cette forme est au féminin singulier au lieu du pluriel.

### fr-grammar-b1-009 — version 1

- **Target / operation:** `relative_dont` / `completion`.
- **Source basis:** INV PDF pp. 61; CV PDF p. 132; guide §3 (B1) and §5.
- **Level rationale:** Select a relative pronoun from the explicit verb construction parler de.
- **Prompt and context:**

  Reliez les idées : « Voici le projet. Je te parle de ce projet. »

  Voici le projet ___ je te parle.

- **Correct answer:** `opt-1` — dont
- **Rule / meaning:** Dont reprend de ce projet : le projet dont je te parle.
- **Distractor rationale:**
  - `opt-2` — que: Parler de demande ici un relatif reprenant de, pas un objet direct.
  - `opt-3` — qui: Le sujet de parle est déjà je.
  - `opt-4` — où: Le projet n’est pas repris ici comme un lieu ou un moment.

### fr-grammar-b1-010 — version 1

- **Target / operation:** `double_pronouns` / `transformation`.
- **Source basis:** INV PDF pp. 61; CV PDF p. 132; guide §3 (B1) and §5.
- **Level rationale:** Two-pronoun ordering with explicit, unambiguous referents.
- **Prompt and context:**

  Remplacez « le livre » et « à ma sœur » par des pronoms, sans changer le sens.

  Je donne le livre à ma sœur.

- **Correct answer:** `opt-3` — Je le lui donne.
- **Rule / meaning:** Le reprend le livre ; lui reprend à ma sœur. L’ordre est le lui avant donne.
- **Distractor rationale:**
  - `opt-1` — Je lui le donne.: Dans cette combinaison avant le verbe, le précède lui.
  - `opt-2` — Je la lui donne.: La ne reprend pas le livre, qui est masculin singulier.
  - `opt-4` — Je le leur donne.: Leur indiquerait plusieurs destinataires, alors que ma sœur est singulier.

### fr-grammar-b1-011 — version 1

- **Target / operation:** `indirect_yes_no_question` / `completion`.
- **Source basis:** INV PDF pp. 61; CV PDF p. 132; guide §3 (B1) and §5.
- **Level rationale:** Present-tense indirect question; isolate the reporting structure without backshift complexity.
- **Prompt and context:**

  Rapportez cette question sans changer le temps du verbe.

  Paul me demande : « Est-ce que tu viens ? »
  Paul me demande ___ je viens.

- **Correct answer:** `opt-2` — si
- **Rule / meaning:** Pour rapporter une question à laquelle on peut répondre oui ou non, on emploie si.
- **Distractor rationale:**
  - `opt-1` — que: Une interrogation totale indirecte s’introduit par si, pas simplement que.
  - `opt-3` — ce que: Ce que introduirait une question portant sur un objet, pas une réponse oui/non.
  - `opt-4` — qu’est-ce que: Cette forme appartient à une interrogation directe, pas à la construction demandée.

### fr-grammar-b1-012 — version 1

- **Target / operation:** `restriction_ne_que` / `interpretation`.
- **Source basis:** INV PDF pp. 61; CV PDF p. 132; guide §3 (B1) and §5.
- **Level rationale:** Interpret restrictive syntax without confusing it with ordinary negation.
- **Prompt and context:**

  Quelle phrase conserve exactement le sens de la phrase suivante ?

  Le musée n’ouvre que le dimanche.

- **Correct answer:** `opt-4` — Le musée ouvre seulement le dimanche.
- **Rule / meaning:** Ne… que exprime une restriction, équivalente ici à seulement.
- **Distractor rationale:**
  - `opt-1` — Le musée n’ouvre jamais le dimanche.: Cette phrase exclut le dimanche, alors que la phrase initiale le réserve à l’ouverture.
  - `opt-2` — Le musée ouvre tous les jours sauf le dimanche.: Cette phrase inverse la restriction.
  - `opt-3` — Le musée ouvre aussi le dimanche, comme les autres jours.: Aussi ajoute le dimanche ; ne… que le limite à ce jour.

## B2: question-by-question mapping

Future anterior, past infinitive, past unreal consequence, reported speech, conjunction-governed mood, compound relatives, participle/adjective distinction, imperative pronoun order, emphasis, modal reproach and concessive transformation.

### fr-grammar-b2-001 — version 1

- **Target / operation:** `future_anterior` / `completion`.
- **Source basis:** INV PDF pp. 62; CV PDF p. 132; guide §3 (B2) and §5.
- **Level rationale:** Future completion relative to an explicit later deadline; tense instruction removes present/future alternatives.
- **Prompt and context:**

  Complétez avec le futur antérieur pour présenter le travail comme achevé avant un moment futur.

  Demain à dix-huit heures, nous ___ le rapport ; il pourra alors être envoyé.

- **Correct answer:** `opt-1` — aurons terminé
- **Rule / meaning:** Le futur antérieur aurons terminé présente le travail comme achevé au repère futur indiqué.
- **Distractor rationale:**
  - `opt-2` — avons terminé: Le passé composé ne correspond pas au futur antérieur demandé.
  - `opt-3` — avions terminé: Le plus-que-parfait situe l’antériorité par rapport à un repère passé.
  - `opt-4` — aurions terminé: Le conditionnel passé ne correspond pas au futur antérieur demandé.

### fr-grammar-b2-002 — version 1

- **Target / operation:** `past_infinitive` / `completion`.
- **Source basis:** INV PDF pp. 62; CV PDF p. 132; guide §3 (B2) and §5.
- **Level rationale:** Past infinitive linking successive actions with the same subject.
- **Prompt and context:**

  Complétez pour indiquer que Léa reçoit la confirmation avant de réserver.

  Après ___ la confirmation, Léa a réservé son billet.

- **Correct answer:** `opt-3` — avoir reçu
- **Rule / meaning:** Après avoir reçu emploie l’infinitif passé et marque l’antériorité de la réception.
- **Distractor rationale:**
  - `opt-1` — recevoir: Après suivi d’un infinitif exprimant cette action achevée exige ici l’infinitif passé.
  - `opt-2` — avoir recevoir: Après avoir, il faut le participe passé reçu, pas recevoir.
  - `opt-4` — ayant reçu: Après ne se construit pas ici avec le participe présent ayant.

### fr-grammar-b2-003 — version 1

- **Target / operation:** `past_counterfactual` / `completion`.
- **Source basis:** INV PDF pp. 62; CV PDF p. 132; guide §3 (B2) and §5.
- **Level rationale:** Past unreal condition and consequence in a familiar travel setting.
- **Prompt and context:**

  Complétez pour exprimer une conséquence qui ne s’est pas réalisée dans le passé.

  Nous n’avons pas été prévenus. Si nous l’avions été, nous ___ nos billets plus tôt.

- **Correct answer:** `opt-2` — aurions réservé
- **Rule / meaning:** Si + plus-que-parfait peut introduire une condition passée non réalisée ; la conséquence passée se met ici au conditionnel passé.
- **Distractor rationale:**
  - `opt-1` — avons réservé: Le passé composé présenterait la réservation comme réalisée.
  - `opt-3` — réserverons: Le futur simple ne désigne pas une conséquence passée non réalisée.
  - `opt-4` — réservons: Le présent ne convient pas à la conséquence passée demandée.

### fr-grammar-b2-004 — version 1

- **Target / operation:** `past_reported_speech` / `transformation`.
- **Source basis:** INV PDF pp. 62; CV PDF p. 132; guide §3 (B2) and §5.
- **Level rationale:** Coordinate tense, person and time deixis in an explicitly retrospective report.
- **Prompt and context:**

  Une semaine plus tard, rapportez les paroles de Nora en faisant la concordance des temps et en adaptant le repère temporel.

  Lundi, Nora a dit : « Je partirai demain. »

- **Correct answer:** `opt-4` — Nora a dit lundi qu’elle partirait le lendemain.
- **Rule / meaning:** Dans cette transposition, partirai devient partirait, je devient elle et demain devient le lendemain.
- **Distractor rationale:**
  - `opt-1` — Nora a dit lundi qu’elle partira demain.: Cette formulation ne transpose ni le futur ni demain par rapport au lundi passé, comme demandé.
  - `opt-2` — Nora a dit lundi qu’elle était partie la veille.: Cette phrase place le départ avant les paroles, au lieu de le situer après.
  - `opt-3` — Nora a dit lundi que je partirais le lendemain.: Je modifierait l’identité de la personne qui doit partir.

### fr-grammar-b2-005 — version 1

- **Target / operation:** `conditional_au_cas_ou` / `completion`.
- **Source basis:** INV PDF pp. 62; CV PDF p. 132; guide §3 (B2) and §5.
- **Level rationale:** Mood selection after a conventional hypothetical conjunction.
- **Prompt and context:**

  Complétez en français écrit standard.

  Gardez mon numéro au cas où vous ___ besoin de me joindre.

- **Correct answer:** `opt-1` — auriez
- **Rule / meaning:** Dans cet emploi, au cas où introduit une éventualité au conditionnel : vous auriez.
- **Distractor rationale:**
  - `opt-2` — avez: Au cas où se construit normalement avec le conditionnel dans cet emploi.
  - `opt-3` — aurez: Aurez est au futur, pas au conditionnel attendu.
  - `opt-4` — ayez: Ayez est au subjonctif, pas au conditionnel attendu.

### fr-grammar-b2-006 — version 1

- **Target / operation:** `subjunctive_concession` / `completion`.
- **Source basis:** INV PDF pp. 62–63; CV PDF p. 132; guide §3 (B2) and §5.
- **Level rationale:** Subjunctive in a concessive subordinate clause.
- **Prompt and context:**

  Complétez.

  Bien que le trajet ___ long, nous acceptons de venir.

- **Correct answer:** `opt-3` — soit
- **Rule / meaning:** Bien que introduit une concession et se construit avec le subjonctif : soit.
- **Distractor rationale:**
  - `opt-1` — est: Bien que appelle ici le subjonctif, pas l’indicatif présent.
  - `opt-2` — sera: Le futur simple n’est pas le mode attendu après bien que.
  - `opt-4` — être: Le sujet le trajet nécessite ici un verbe conjugué après que.

### fr-grammar-b2-007 — version 1

- **Target / operation:** `compound_relative` / `completion`.
- **Source basis:** INV PDF pp. 62; CV PDF p. 132; guide §3 (B2) and §5.
- **Level rationale:** Compound relative following a supplied preposition, with agreement and verb government.
- **Prompt and context:**

  Conservez la construction « compter sur ces documents ».

  Voici les documents sur ___ nous comptons pour préparer le dossier.

- **Correct answer:** `opt-2` — lesquels
- **Rule / meaning:** Après sur, le relatif composé s’accorde avec documents : sur lesquels.
- **Distractor rationale:**
  - `opt-1` — lesquelles: Lesquelles est féminin pluriel, alors que documents est masculin.
  - `opt-3` — lequel: Lequel est singulier, alors que documents est pluriel.
  - `opt-4` — dont: Dont reprendrait de ; on ne dit pas sur dont dans cette construction.

### fr-grammar-b2-008 — version 1

- **Target / operation:** `participle_adjective` / `completion`.
- **Source basis:** INV PDF pp. 62; CV PDF p. 132; guide §3 (B2) and §5.
- **Level rationale:** Distinguish adjectival and verbal uses, including their spelling and agreement, within connected clauses.
- **Prompt and context:**

  Choisissez les deux formes, dans l’ordre.

  Ces journées sont ___ ; les tâches ___ le plus les équipes seront réorganisées.

- **Correct answer:** `opt-4` — fatigantes / fatiguant
- **Rule / meaning:** Fatigantes est un adjectif verbal accordé avec journées ; fatiguant est un participe présent invariable qui prend les équipes comme objet.
- **Distractor rationale:**
  - `opt-1` — fatiguant / fatigantes: L’adjectif doit s’accorder avec journées ; le participe verbal qui a les équipes comme objet reste invariable.
  - `opt-2` — fatiguantes / fatigants: L’adjectif s’écrit fatigantes sans u ; le participe verbal reste invariable et garde le u.
  - `opt-3` — fatigante / fatiguants: L’adjectif doit être pluriel ; le participe verbal ne s’accorde pas avec tâches.

### fr-grammar-b2-009 — version 1

- **Target / operation:** `double_pronouns_imperative` / `transformation`.
- **Source basis:** INV PDF pp. 62; CV PDF p. 132; guide §3 (B2) and §5.
- **Level rationale:** Reorder two object pronouns in an affirmative imperative rather than reuse declarative order.
- **Prompt and context:**

  Remplacez « ces documents » et « à Paul » par des pronoms, en conservant l’impératif affirmatif.

  Donnez ces documents à Paul.

- **Correct answer:** `opt-1` — Donnez-les-lui.
- **Rule / meaning:** À l’impératif affirmatif, les pronoms suivent le verbe avec des traits d’union : donnez-les-lui.
- **Distractor rationale:**
  - `opt-2` — Les lui donnez.: À l’impératif affirmatif, les pronoms se placent après le verbe.
  - `opt-3` — Donnez-lui-les.: Dans cette combinaison, les précède lui.
  - `opt-4` — Donnez-les-leur.: Leur désigne plusieurs destinataires, alors que Paul est singulier.

### fr-grammar-b2-010 — version 1

- **Target / operation:** `emphasis_ce_dont` / `completion`.
- **Source basis:** INV PDF pp. 62; CV PDF p. 132; guide §3 (B2) and §5.
- **Level rationale:** Cleft-style emphasis with de-government across two parts of a sentence.
- **Prompt and context:**

  Complétez en conservant la construction « avoir besoin de soutien ».

  ___ nous avons besoin, c’est de soutien.

- **Correct answer:** `opt-3` — Ce dont
- **Rule / meaning:** Ce dont reprend le complément introduit par de dans avoir besoin de.
- **Distractor rationale:**
  - `opt-1` — Ce que: Avoir besoin se construit avec de, pas avec un objet direct.
  - `opt-2` — Ce qui: Ce qui serait sujet ; le sujet de avons est déjà nous.
  - `opt-4` — Ce où: Ce où ne forme pas ici la construction de mise en relief.

### fr-grammar-b2-011 — version 1

- **Target / operation:** `conditional_past_reproach` / `interpretation`.
- **Source basis:** INV PDF pp. 62; CV PDF p. 132; guide §3 (B2) and §5.
- **Level rationale:** Interpret modal force and past non-realization rather than identify a form in isolation.
- **Prompt and context:**

  Quelle reformulation conserve le reproche exprimé ?

  Tu aurais dû nous prévenir avant de modifier le programme.

- **Correct answer:** `opt-2` — Il aurait été préférable que tu nous préviennes, mais tu ne l’as pas fait.
- **Rule / meaning:** Le conditionnel passé de devoir exprime ici un reproche concernant une action souhaitable non accomplie.
- **Distractor rationale:**
  - `opt-1` — Tu nous as prévenus comme il le fallait.: Le reproche porte justement sur l’absence d’avertissement.
  - `opt-3` — Tu devras nous prévenir avant une modification à venir.: Cette phrase remplace le reproche passé par une obligation future.
  - `opt-4` — Tu n’avais pas le droit de nous prévenir.: Cette phrase inverse l’évaluation : prévenir aurait été souhaitable.

### fr-grammar-b2-012 — version 1

- **Target / operation:** `causal_vs_concessive` / `transformation`.
- **Source basis:** INV PDF pp. 62–63; CV PDF p. 132; guide §3 (B2) and §5.
- **Level rationale:** Transform a prepositional concession into a finite clause while preserving its logical and factual status.
- **Prompt and context:**

  Choisissez la phrase qui transforme le groupe « malgré la pluie » en proposition de concession, sans changer le sens.

  Malgré la pluie, le match a continué.

- **Correct answer:** `opt-4` — Bien qu’il ait plu, le match a continué.
- **Rule / meaning:** Malgré introduit une concession ; bien que + subjonctif conserve cette relation entre la pluie et la poursuite du match.
- **Distractor rationale:**
  - `opt-1` — Parce qu’il a plu, le match a continué.: Parce que transforme la concession en cause.
  - `opt-2` — Pour qu’il pleuve, le match a continué.: Pour que introduit un but, pas une concession.
  - `opt-3` — S’il avait plu, le match aurait continué.: Cette formulation remplace le fait de la pluie par une condition hypothétique.

## C1: question-by-question mapping

Integrated narrative and reported chronology, mixed-time hypotheses, fear clauses and expletive ne, subject control, concessive qualification, reinforced cause, unintended result, relative reference, negation scope, passive past subjunctive and gerund attachment.

### fr-grammar-c1-001 — version 1

- **Target / operation:** `literary_temporal_structure` / `interpretation`.
- **Source basis:** INV PDF pp. 63; earlier narrative targets 61–62; CV PDF p. 132; guide §3 (C1) and §5.
- **Level rationale:** C1 candidate: integrate three narrative tense functions and a future-in-the-past perspective, rather than identify a rare ending.
- **Prompt and context:**

  Quelle chronologie respecte les temps du récit ?

  Lorsque Nora entra dans la salle, le comité avait déjà arrêté sa décision. Les membres discutaient encore de la façon de l’annoncer. Elle comprit alors que son intervention ne pourrait plus en modifier le contenu.

- **Correct answer:** `opt-1` — La décision précède l’entrée de Nora ; la discussion sur l’annonce est en cours à son entrée ; Nora comprend ensuite la situation.
- **Rule / meaning:** Le plus-que-parfait marque l’antériorité, l’imparfait l’arrière-plan en cours, et les passés simples font avancer le récit.
- **Distractor rationale:**
  - `opt-2` — Nora entre, puis le comité prend sa décision pendant qu’elle intervient.: Le plus-que-parfait avait arrêté place la décision avant son entrée ; aucune intervention effective n’est racontée.
  - `opt-3` — La discussion et l’annonce sont achevées avant que Nora entre dans la salle.: Discutaient encore présente une discussion en cours ; l’annonce n’est pas donnée comme accomplie.
  - `opt-4` — Nora comprend d’abord la situation, puis entre pendant que le comité choisit le contenu de sa décision.: Comprit alors suit entra, et le contenu de la décision est déjà fixé.

### fr-grammar-c1-002 — version 1

- **Target / operation:** `mixed_counterfactual` / `completion`.
- **Source basis:** INV PDF pp. 63 (past unreal hypotheses with present/past conditional); CV PDF p. 132; guide §3 (C1) and §5.
- **Level rationale:** C1 candidate: distinguish the time of an unreal condition from the time of its consequence.
- **Prompt and context:**

  Complétez par le conditionnel présent pour exprimer la conséquence actuelle d’une condition passée non réalisée.

  L’accord n’a pas été signé l’an dernier. S’il l’avait été, nous ___ aujourd’hui en mesure de financer les travaux.

- **Correct answer:** `opt-3` — serions
- **Rule / meaning:** Une condition passée non réalisée peut avoir une conséquence actuelle : si + plus-que-parfait, puis conditionnel présent.
- **Distractor rationale:**
  - `opt-1` — aurions été: Le conditionnel passé situerait la conséquence comme accomplie dans le passé, pas à l’état actuel demandé.
  - `opt-2` — serons: Le futur simple ne correspond pas à la conséquence hypothétique actuelle.
  - `opt-4` — étions: L’imparfait ne forme pas ici la conséquence au conditionnel présent demandée.

### fr-grammar-c1-003 — version 1

- **Target / operation:** `reported_speech_multiple_times` / `transformation`.
- **Source basis:** INV PDF pp. 63 (temporal coordination); 62 (reported speech in the past); CV PDF p. 132; guide §3 (C1) and §5.
- **Level rationale:** C1 candidate: coordinate two temporal relationships, person reference and deictic shifts within one report; extends the B2 structure.
- **Prompt and context:**

  Le 20 juin, vous rapportez les propos tenus par Léa le 10 juin. Transposez les temps et les repères temporels en conservant la chronologie.

  Léa a déclaré le 10 juin : « J’ai reçu le dossier hier et je le présenterai demain. »

- **Correct answer:** `opt-2` — Léa a déclaré le 10 juin qu’elle avait reçu le dossier la veille et qu’elle le présenterait le lendemain.
- **Rule / meaning:** Par rapport aux paroles du 10 juin, la réception est antérieure et la présentation future : avait reçu la veille, présenterait le lendemain.
- **Distractor rationale:**
  - `opt-1` — Léa a déclaré le 10 juin qu’elle recevrait le dossier la veille et qu’elle l’avait présenté le lendemain.: Cette formulation inverse les relations d’antériorité et de postériorité aux paroles.
  - `opt-3` — Léa a déclaré le 10 juin qu’elle avait reçu le dossier le lendemain et qu’elle le présenterait la veille.: Les repères la veille et le lendemain sont inversés par rapport aux faits rapportés.
  - `opt-4` — Léa a déclaré le 10 juin qu’elle a reçu le dossier hier et qu’elle le présentera demain.: Cette formulation ne transpose pas les temps et repères demandés ; hier et demain renverraient ici au 20 juin.

### fr-grammar-c1-004 — version 1

- **Target / operation:** `expletive_ne_fear` / `interpretation`.
- **Source basis:** INV PDF pp. 63 (de crainte que + subjunctive); CV PDF p. 132; guide §3 (C1) and §5.
- **Level rationale:** C1 candidate: interpret a fear clause without mistaking stylistic ne for semantic negation. The item names its function and tests the resulting meaning.
- **Prompt and context:**

  Quelle reformulation respecte le sens de cette phrase ? Le ne est ici explétif.

  Le comité a prolongé le délai de crainte que certains candidats ne renoncent à déposer leur dossier.

- **Correct answer:** `opt-4` — Le comité a prolongé le délai pour éviter que certains candidats renoncent à déposer leur dossier.
- **Rule / meaning:** Dans cette construction, ne est explétif : il ne nie pas renoncent. Le renoncement est l’événement redouté.
- **Distractor rationale:**
  - `opt-1` — Le comité a prolongé le délai parce qu’il souhaitait que certains candidats renoncent.: La phrase vise à éviter le renoncement, pas à le provoquer.
  - `opt-2` — Le comité a prolongé le délai pour éviter que certains candidats ne renoncent pas.: L’ajout de pas crée une véritable négation et inverse ce que le comité cherche à éviter.
  - `opt-3` — Le comité a prolongé le délai après avoir constaté que tous les candidats avaient déjà renoncé.: La phrase exprime une crainte concernant certains candidats, pas un constat accompli concernant tous.

### fr-grammar-c1-005 — version 1

- **Target / operation:** `purpose_subject_control` / `transformation`.
- **Source basis:** INV PDF pp. 63 (purpose and reformulation); 62 (purpose constructions); CV PDF p. 132; guide §3 (C1) and §5.
- **Level rationale:** C1 candidate: preserve subject control and purpose across finite and infinitival reformulations.
- **Prompt and context:**

  Reformulez sans changer qui accomplit chaque action : le comité simplifie le formulaire ; les candidats doivent pouvoir le remplir sans aide.

  Le comité a simplifié le formulaire afin que les candidats puissent le remplir sans aide.

- **Correct answer:** `opt-1` — Le comité a simplifié le formulaire pour permettre aux candidats de le remplir sans aide.
- **Rule / meaning:** Permettre aux candidats de conserve leur rôle comme sujet de remplir, tandis que le comité reste l’auteur de la simplification.
- **Distractor rationale:**
  - `opt-2` — Le comité a simplifié le formulaire afin de pouvoir le remplir sans aide.: Le sujet implicite de pouvoir devient le comité, pas les candidats.
  - `opt-3` — Les candidats ont simplifié le formulaire pour que le comité puisse le remplir sans aide.: Les rôles du comité et des candidats sont inversés.
  - `opt-4` — Le comité a simplifié le formulaire parce que les candidats pouvaient déjà le remplir sans aide.: La relation de but devient une cause présentée comme déjà réalisée.

### fr-grammar-c1-006 — version 1

- **Target / operation:** `concessive_qualification` / `interpretation`.
- **Source basis:** INV PDF pp. 63 (encore que); CV PDF p. 132; guide §3 (C1) and §5.
- **Level rationale:** C1 candidate: interpret the qualifying force of a concessive clause and its unfulfilled modal content.
- **Prompt and context:**

  Quelle analyse respecte la relation introduite par encore que ?

  La solution paraît satisfaisante, encore que son coût doive être réévalué avant toute décision définitive.

- **Correct answer:** `opt-3` — La seconde proposition apporte une réserve qui limite l’appréciation positive de la première.
- **Rule / meaning:** Encore que introduit une concession ; le subjonctif doive s’inscrit dans cette réserve à l’appréciation initiale.
- **Distractor rationale:**
  - `opt-1` — La seconde proposition donne la cause certaine de l’appréciation positive.: Encore que n’introduit pas ici une cause, mais une réserve concessive.
  - `opt-2` — La seconde proposition exprime le but pour lequel la solution paraît satisfaisante.: La réévaluation n’est pas présentée comme le but de cette appréciation.
  - `opt-4` — La seconde proposition affirme que le coût a déjà été réévalué et validé.: Doive être réévalué présente une nécessité restante, pas une action accomplie.

### fr-grammar-c1-007 — version 1

- **Target / operation:** `reinforced_cause` / `transformation`.
- **Source basis:** INV PDF pp. 63 (d’autant plus que); CV PDF p. 132; guide §3 (C1) and §5.
- **Level rationale:** C1 candidate: preserve an intensified causal relation without confusing it with proportion, concession or a condition.
- **Prompt and context:**

  Quelle reformulation conserve la relation exprimée par d’autant plus que ?

  Nous devons vérifier ces chiffres, d’autant plus qu’ils serviront à répartir les aides.

- **Correct answer:** `opt-2` — Nous devons vérifier ces chiffres ; leur utilisation pour répartir les aides renforce encore cette nécessité.
- **Rule / meaning:** D’autant plus que ajoute une raison qui renforce la nécessité déjà affirmée.
- **Distractor rationale:**
  - `opt-1` — Nous devons vérifier ces chiffres bien qu’ils ne servent pas à répartir les aides.: Cette phrase introduit une concession et nie l’utilisation annoncée.
  - `opt-3` — Nous vérifierons ces chiffres uniquement s’ils ont déjà servi à répartir les aides.: Cette phrase transforme une raison supplémentaire en condition exclusive et change le temps.
  - `opt-4` — Plus nous vérifions ces chiffres, plus le montant des aides augmente.: Cette phrase exprime une proportion, absente de d’autant plus que dans le contexte donné.

### fr-grammar-c1-008 — version 1

- **Target / operation:** `result_vs_purpose` / `transformation`.
- **Source basis:** INV PDF pp. 63 (au point que); 63 (B2 consequence connectors); CV PDF p. 132; guide §3 (C1) and §5.
- **Level rationale:** C1 candidate: transform a degree/result clause while maintaining causality and the absence of intended purpose.
- **Prompt and context:**

  Les reports successifs ont eu une conséquence imprévue, et non recherchée. Choisissez la reformulation qui conserve cette relation.

  Le chantier a été retardé au point que le financement initial n’était plus suffisant.

- **Correct answer:** `opt-4` — Le chantier a pris tellement de retard que le financement initial n’était plus suffisant.
- **Rule / meaning:** Au point que et tellement… que expriment ici le degré de retard et sa conséquence, sans intention de la produire.
- **Distractor rationale:**
  - `opt-1` — Le chantier a été retardé pour que le financement initial ne soit plus suffisant.: Pour que introduit un but, contraire au caractère imprévu indiqué.
  - `opt-2` — Le chantier a été retardé à condition que le financement initial ne soit plus suffisant.: À condition que transforme la conséquence en condition.
  - `opt-3` — Le chantier a été retardé parce que le financement initial n’était déjà plus suffisant.: Parce que présente l’insuffisance comme la cause du retard, au lieu de sa conséquence.

### fr-grammar-c1-009 — version 1

- **Target / operation:** `embedded_relative_reference` / `transformation`.
- **Source basis:** INV PDF pp. 63 (temporal coordination and reformulation); 61–62 (relatives, passive and plus-que-parfait); CV PDF p. 132; guide §3 (C1) and §5.
- **Level rationale:** C1 candidate: coordinate a possessive relative, passive voice and past anteriority while preserving a restricted referent set.
- **Prompt and context:**

  Quelle reformulation conserve les relations grammaticales et la chronologie ?

  Le comité a réexaminé les projets dont le coût avait été sous-estimé lors de la première sélection.

- **Correct answer:** `opt-1` — Lors de la première sélection, le coût des projets concernés avait été sous-estimé ; le comité a ensuite réexaminé ces projets.
- **Rule / meaning:** Dont exprime ici le coût des projets ; avait été sous-estimé situe cette sous-estimation avant le réexamen.
- **Distractor rationale:**
  - `opt-2` — Le comité avait sous-estimé le coût de certains projets, puis il les a réexaminés.: Le passif initial ne dit pas qui a sous-estimé le coût ; cette formulation attribue cette action au comité sans justification.
  - `opt-3` — Le comité a réexaminé tous les projets, puis leur coût a été sous-estimé lors d’une sélection ultérieure.: Cette formulation généralise à tous les projets et inverse l’antériorité indiquée par avait été.
  - `opt-4` — Le comité a réexaminé uniquement le coût des projets après la première sélection.: L’objet du réexamen initial est les projets, pas uniquement leur coût.

### fr-grammar-c1-010 — version 1

- **Target / operation:** `quantified_negation_scope` / `interpretation`.
- **Source basis:** INV PDF pp. 63 (precision and reformulation); 61 (expanded negation); CV PDF p. 132; guide §3 (C1) and §5.
- **Level rationale:** C1 candidate: interpret negation scope under quantification in explicit context; the sentence alone could invite pragmatic ambiguity, which the numerical context resolves.
- **Prompt and context:**

  Le dossier indique que trois propositions sur cinq ont été retenues. Quelle phrase est compatible avec ce bilan et exprime une sélection partielle ?

- **Correct answer:** `opt-3` — Toutes les propositions n’ont pas été retenues.
- **Rule / meaning:** Dans le contexte explicite de trois propositions sur cinq, toutes… ne… pas exprime une négation partielle : certaines n’ont pas été retenues.
- **Distractor rationale:**
  - `opt-1` — Aucune proposition n’a été retenue.: Aucune nie la sélection de toute proposition et contredit les trois retenues.
  - `opt-2` — Pas une seule proposition n’a été retenue.: Pas une seule exprime une absence totale, pas une sélection partielle.
  - `opt-4` — Toutes les propositions ont été retenues.: Cette phrase affirme une sélection totale, contraire à trois sur cinq.

### fr-grammar-c1-011 — version 1

- **Target / operation:** `past_subjunctive_passive` / `completion`.
- **Source basis:** INV PDF pp. 63 (coordination of moods and tenses); 62 (subjunctive in feelings/judgment); CV PDF p. 132; guide §3 (C1) and §5.
- **Level rationale:** C1 candidate: combine required mood, completed anteriority and passive voice in a stated retrospective evaluation.
- **Prompt and context:**

  Les documents ont été transmis hier, sans autorisation. La directrice exprime aujourd’hui son regret au sujet de cet envoi déjà effectué. Complétez.

  Elle regrette que les documents ___ avant son accord.

- **Correct answer:** `opt-2` — aient été transmis
- **Rule / meaning:** Le regret appelle le subjonctif ; l’action antérieure et passive se construit avec aient été transmis.
- **Distractor rationale:**
  - `opt-1` — soient transmis: Le subjonctif présent ne marque pas l’antériorité accomplie explicitement demandée.
  - `opt-3` — aient transmis: Cette forme active ferait des documents le sujet d’une transmission, sans objet exprimé ici.
  - `opt-4` — ont été transmis: Après regretter que dans cette phrase, on attend le subjonctif, pas l’indicatif.

### fr-grammar-c1-012 — version 1

- **Target / operation:** `gerund_attachment` / `transformation`.
- **Source basis:** INV PDF pp. 63 (controlled reformulation); 61–62 (gerund); CV PDF p. 132; guide §3 (C1) and §5.
- **Level rationale:** C1 candidate: control clause attachment and preserve simultaneity while resisting a plausible passive reformulation.
- **Prompt and context:**

  Reformulez avec un gérondif, en conservant les personnes qui accomplissent les actions.

  Pendant que les auditrices examinaient les comptes, elles ont découvert plusieurs anomalies.

- **Correct answer:** `opt-4` — En examinant les comptes, les auditrices ont découvert plusieurs anomalies.
- **Rule / meaning:** Le sujet implicite du gérondif doit ici être celui du verbe principal : les auditrices. Le gérondif conserve la simultanéité.
- **Distractor rationale:**
  - `opt-1` — En examinant les comptes, plusieurs anomalies ont été découvertes par les auditrices.: Dans cette construction, le sujet grammatical du verbe principal serait anomalies, qui ne peut pas examiner les comptes.
  - `opt-2` — En découvrant plusieurs anomalies, les auditrices ont décidé d’examiner les comptes.: Cette phrase place la découverte comme contexte d’une décision d’examiner, au lieu de situer la découverte pendant l’examen.
  - `opt-3` — Après avoir examiné les comptes, les auditrices ont découvert plusieurs anomalies.: Cette phrase peut être grammaticale, mais elle remplace la simultanéité et le gérondif demandés par une action antérieure.

## Validation and remaining review

Checked: parseable UTF-8 JSON with no duplicate object keys; 60 unique IDs and prompts; 12 questions per supported level; all items draft/version 1; four distinct nonempty options per item; one resolving correct key; balanced key positions; no passage dependencies or embedded sourceReferences; all 60 revisions documented with their sources, rules and three distractor explanations; local links resolve.

Authoring review considered alternative readings, chronology, pronoun reference, mood and register, agreement, and the preservation of meaning in transformations. No application test suite is needed for content-only additions. User review and empirical difficulty validation remain separate; these items do not establish a certified CEFR result or comprehensive productive grammar mastery.
