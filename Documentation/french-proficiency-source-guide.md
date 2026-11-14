# French proficiency testing: source guide for Causerie

Research notes prepared 2026-11-13 from the locally supplied PDFs. Scope: French A1–C1. This is a question-authoring reference and a summary for project documentation; it does not implement the test or establish calibrated difficulty.

## 1. Sources and how to use them

All 13 supplied PDFs opened successfully and yielded readable text. Page references below use **PDF page numbers**, counting the first page as 1. The inventory's printed numbering is two lower; the original CEFR/DIALANG book's printed numbering is nine lower. Companion Volume page numbers agree with PDF pages in the sections cited.

| Source | Local document | Relevant locations | Responsibility |
| --- | --- | --- | --- |
| French Linguistic Inventory, Eaquals and partners, 2015 | [Inventory](/home/anabelle/Documents/capstone/inventair-liguistique-des-contenus.pdf) | PDF pp. 16–18: scope and limitations; pp. 42–45: reception text types; pp. 58–63: level summaries; Annex F, pp. 64–110: contextual examples | Select French grammar, communicative functions, vocabulary themes, and usage contexts. |
| DIALANG descriptive scales, in the original CEFR book | [CEFR with DIALANG Appendix C](/home/anabelle/Documents/capstone/DIALANG-CECRL_GBR.pdf) | Appendix C; concise scales pp. 244–246; detailed scales pp. 247–252 | Specify what learners understand or produce, including conditions and limitations. “Document C1/C2/C3” here names appendix documents, not proficiency levels. |
| CEFR Companion Volume, 2020 | [Companion Volume](</home/anabelle/Documents/capstone/CEFR-Companion Volume_eng.pdf>) | Reading pp. 54–60; listening pp. 48–52; writing pp. 66–68; vocabulary and grammar pp. 130–133; discourse pp. 140–141 | Distinguish levels by breadth, independence, accuracy, cohesion, and nuance. |
| DELF A1 | [Candidate](/home/anabelle/Documents/capstone/FRDELF-A1.pdf), [key](/home/anabelle/Documents/capstone/FRDELF-A1-solutions.pdf) | Reading pp. 6–10; writing pp. 11–12; key pp. 2–4 | Concrete information retrieval, short messages, basic personal information. |
| DELF A2 | [Candidate](/home/anabelle/Documents/capstone/FRDELF-A2.pdf), [key](/home/anabelle/Documents/capstone/FRDELF-A2-solutions.pdf) | Reading pp. 8–13; writing pp. 14–15; key p. 3 | Routine transactions, matching needs to information, simple connected accounts. |
| DELF B1 | [Candidate](/home/anabelle/Documents/capstone/FRDELF-B1.pdf), [key](/home/anabelle/Documents/capstone/FRDELF-B1-solutions.pdf) | Reading pp. 5–10; writing p. 11; key pp. 2–3 | Comparing criteria, factual articles, reasons, advice and experiences. |
| DELF B2 | [Candidate](/home/anabelle/Documents/capstone/FRDELF-B2.pdf), [key](/home/anabelle/Documents/capstone/FRDELF-B2-solutions.pdf) | Reading pp. 5–10; writing p. 11; key p. 2 | Arguments, competing viewpoints, supported formal positions. |
| DALF C1 | [Candidate](/home/anabelle/Documents/capstone/FRDELF-C1.pdf), [key](/home/anabelle/Documents/capstone/FRDELF-C1-solutions.pdf) | Reading pp. 5–8; synthesis pp. 9–11; argument p. 14; key p. 2 | Complex interpretation, reformulation, synthesis and nuanced argument. |

The supplied exam collection contains candidate papers and answer keys. Separate audio recordings, transcripts, and complete writing evaluation grids are not in this folder. The papers suffice for this research stage; listening content and full production rubrics will require additional materials when those sections are built. No conclusions here depend on having heard the recordings.

### Evidence versus authoring choices

The inventory is a selective teaching reference based on consensus, not a definitive empirical classification of every structure or word. Its authors explicitly describe weaker consensus at C1 and distinguish stronger-consensus content through typography. The summaries below draw from its level overviews without claiming that every listed item has the same consensus status.

The inventory provides **vocabulary themes and examples, not an exhaustive CEFR word list**. Word banks below are proposed Causerie examples within those themes, not official word-to-level assignments. A word can appear at several levels: the meaning, collocation, context, and task determine its difficulty. Higher-level questions can use elementary vocabulary to test sophisticated reasoning.

Grammar also overlaps across levels. Recognizing a memorized polite conditional at A1 does not establish B1 control of hypothetical situations. Distinguish limited recognition, routine use, and flexible control rather than assigning each tense exclusively to one level.

## 2. Working interpretation of the test plan

Source: [CEFR TESTING PLANNING.md](</home/anabelle/Neumont/Capstone/Documentation/CEFR TESTING PLANNING.md>).

The later, more specific Structure section describes an initial test of **three 12-question blocks**, each containing four reading, four grammar, and four vocabulary questions: **36 scored questions total**, 12 per skill. Start at **B1**, adjust each skill independently, and remain within A1–C1. For example, reading can advance while grammar stays at B1 and vocabulary drops to A2.

The earlier flow example starts at A2; B1 is the working assumption here because the later section explicitly requires it and permits reaching A1 or C1 in the third block. This discrepancy remains a product decision rather than a source-derived rule.

The bank target of 9–12 questions per skill per level means **135–180 initial items** across three skills and five levels. Twelve per cell supports a whole session that stays at the same level without repeating an item. Nine does not. Store unique IDs, preserve each item's administered level and response, prefer unseen/recently unused items, and randomize options while retaining stable answer IDs.

Listening and writing are future additions in the Structure section; speaking is excluded initially. Writing is intended for teacher grading. The distribution table describes a broader eventual test, so its weights should not silently be applied to the three-skill initial version.

### Decisions to resolve before implementation

| Issue | Consequence and proposed treatment |
| --- | --- |
| Four questions per skill per block; advance above 80%, drop below 50% | With equal binary scoring, scores are 0, 25, 50, 75, 100. Advancement requires 4/4; dropping occurs at 0/4 or 1/4; 2/4 and 3/4 stay. Explicitly define equality at the thresholds. |
| Three blocks and level transitions | Assess B1 first, then at most two transitions before the final block. Do not award an untested higher level after the last block solely because it would have been the next routing destination. |
| Low A1 score or high C1 score | Clamp routing to the supported range. Report insufficient A1 evidence or performance at the test ceiling; do not imply demonstrated C2 proficiency. |
| “B1 50%” as halfway to B2 | Percent correct on four B1 questions is not evidence of 50% of the learning distance to B2. Label a provisional indicator as performance at the assessed level; a progress claim needs a defined, validated model. |
| Averaging level labels | A1=1 through C1=5 is a possible application convention, but CEFR bands are not established equal-distance units. Define weighting and rounding; retain the skill profile as the informative result. The plan also mentions a 1–6 scale despite an A1–C1 scope. |
| One float for level plus progress | Define ceiling and progress semantics before storing a combined number. Separate level, earned/possible points, item evidence, and scoring-version fields preserve meaning more clearly. |
| Future sections | The plan mentions 1–2 writing prompts and also six questions per adaptive writing block. Resolve workload and teacher grading before expanding. Do not give untested skills a score of zero. |

These are observations and recommendations, not changes to the approved design. The sources support level descriptions and assessment examples; they do not validate Causerie's proposed routing thresholds or composite score.

## 3. French grammar and vocabulary guidelines by level

For every item, record the intended skill, target level, specific language feature, context, evidence supporting the answer, and why the alternatives are wrong. Select vocabulary surrounding a grammar target that is comfortably understandable at that level.

### A1 — concrete needs and familiar routines

**Inventory basis:** PDF pp. 58–59, printed pp. 56–57.

**Grammar targets:** common present-tense verbs, including être/avoir/aller and regular verbs; basic reflexive routines; subject and stressed pronouns; articles and partitives; gender/number and adjective agreement; possessives and demonstratives; simple questions with est-ce que and common interrogatives; ne…pas and ne…jamais; basic place/time prepositions; quantities; il y a; c'est; simple links with et, ou, mais and alors. The overview also includes modal + infinitive, il faut + infinitive, a few imperatives, futur proche, present progressive, recent past, a limited passé composé, and formulaic polite conditionals.

**Question-writing rule:** ask for one transparent relation in a concrete situation: who, where, when, how much, ownership, agreement, or a familiar action. If using past or conditional forms, limit the demand to a short familiar expression; do not assume general command of tense contrasts or hypothetical reasoning.

**Vocabulary themes:** identity, numbers, dates, family, daily activities, occupations, food, clothing, home, town services, weather, transport and holidays.

**Suggested words/chunks:** prénom, adresse, frère, lundi, demain, matin, pain, eau, acheter, manger, maison, chambre, gare, billet, bus, chaud; avoir faim, à huit heures. Use concrete meanings and everyday quantities.

**Illustrative target:** choose *sommes* in “Nous ___ à la gare.” This tests a familiar present-tense form; the setting contributes no extra inference. A reading item should instead ask something recoverable from a notice, such as its opening time.

### A2 — routine transactions and simple accounts

**Inventory basis:** PDF pp. 59–60, printed pp. 57–58.

**Grammar targets:** broader passé composé, être participle agreement, descriptive imparfait and introductory passé composé/imparfait contrast; futur simple; imperative; expanded negation with plus/rien/personne; comparison and superlative; frequency and quantity adverbs; common prepositional verbs; COD/COI pronouns; en for quantity and y for place; possessive pronouns; qui/que/où; different uses of on; simple reasons and consequences using parce que, à cause de, donc; sequencing with d'abord, ensuite, puis, enfin.

**Question-writing rule:** test a routine exchange or a short sequence whose meaning is explicit. Introduce temporal contrasts with clear cues. Use common antecedents for pronouns and concrete comparisons. Do not require interpreting hidden motives to answer an A2 item.

**Vocabulary themes:** A1 domains expanded to arrangements, services, work, health, personal description, education, household equipment, travel and customs.

**Suggested words/chunks:** rendez-vous, réserver, annuler, ordonnance, fièvre, étage, meuble, formation, collègue, disponible, souvent, moins cher; prendre rendez-vous, passer une commande. A2 use should concern a practical need rather than an abstract debate about the topic.

**Illustrative target:** choose *que* in “Voici le livre ___ tu cherches.” A vocabulary item might choose *annuler* when a message explicitly says an appointment cannot take place.

### B1 — connected experiences, explanations and opinions

**Inventory basis:** PDF pp. 60–61, printed pp. 58–59.

**Grammar targets:** sustained passé composé/imparfait contrast and plus-que-parfait; present conditional for advice, wishes and hypotheses; si + présent with present/future and si + imparfait with conditional; common present subjunctive in obligation, feeling and wish contexts; indicative/subjunctive distinctions in common frames; passive; gérondif; present reporting of speech with que/si; past-participle agreement with preceding direct objects; double object pronouns; dont and compound relatives; emphasis with ce qui/ce que/ce dont…c'est; nominalization; expanded causal, purposive and concessive links.

**Question-writing rule:** make the learner follow relationships across connected clauses: event versus background, prior event, reason, consequence, condition, or opinion. Use familiar contexts so success rests on the target feature. Compound relatives and combined pronouns can occur here, but reserve dense or flexible combinations for higher-level items.

**Vocabulary themes:** work and training, relationships and feelings, health, daily experiences, travel, cultural activities, media and current events.

**Suggested words/chunks:** embaucher, candidature, chômage, entretien d'embauche, déçu, soulagé, souhaiter, conseiller, déménager, reportage, avis; avoir l'intention de, donner son avis. Test familiar paraphrases and suitable collocations rather than isolated translation.

**Illustrative target:** choose *avait commencé* in “Quand nous sommes arrivés, le film ___ depuis dix minutes.” A reading item should ask what caused a change or how a person's experience supports their opinion.

### B2 — arguments, alternatives and complex relationships

**Inventory basis:** PDF pp. 61–63, printed pp. 59–61.

**Grammar targets:** futur antérieur, past infinitive, present/past conditional for advice and regret, unreal past hypotheses, reported speech in the past with tense adjustment, broader subjunctive contexts, present participle versus verbal adjective, more demanding participle agreement, double pronouns and compound relatives in connected discourse. Expand connectors for opposition, concession, cause, purpose and consequence: en revanche, néanmoins, quoique, même si, faute de, à force de, si bien que, en outre. Distinguish mood requirements such as à condition que + subjunctive and au cas où + conditional.

**Question-writing rule:** test how language qualifies, supports, limits or opposes a claim. Supply enough context to distinguish plausible alternatives. Require meaningful control of structures already encountered at B1, not merely the recognition of an unusual conjugation.

**Vocabulary themes:** society, environment, economy, technology, politics, education, culture and professional matters. The inventory includes specialized domains; select broadly interpretable examples or explain incidental technical terms so the test does not become a subject-knowledge exam.

**Suggested words/chunks:** enjeu, mesure, financement, inégalité, durable, conséquence, investissement, réglementation, contester, favoriser; remettre en question, prendre en compte, mettre en œuvre. Test semantic precision, collocations, and alternatives with different argumentative force.

**Illustrative target:** choose *aurions évité* in “Si la mairie avait consulté les habitants, nous ___ ce conflit.” A reading item might distinguish a speaker who supports a policy's goal but rejects its implementation from one who rejects the goal itself.

### C1 — nuance, implication and flexible discourse

**Inventory basis:** PDF p. 63, printed p. 61; Annex F C1 examples begin at PDF p. 100, printed p. 98.

**Grammar targets:** flexible coordination of tense and mood across narrative and argument; recognition of passé simple in appropriate written genres; unreal past hypotheses in nuanced contexts; complex purpose, cause, consequence and concession, including de crainte que, d'autant plus que, au point que and encore que. Combine these with cohesive reference, controlled emphasis, reformulation and appropriate register.

**Question-writing rule:** test the interpretation or precise expression of a qualification, implication, stance, register or relationship across a passage. A single rare form is weak evidence of C1. Include passages requiring integration of several cues, and ensure that the correct interpretation is supported rather than merely conceivable.

**Vocabulary themes:** cultural and societal issues, economics, politics and values, with wider lexical choice, connotations, idioms and stylistic flexibility. C1 is particularly dependent on context and purpose in the inventory.

**Suggested words/chunks:** nuancer, préconiser, présupposé, portée, réticence, équivoque, corroborer, se prévaloir de; émettre des réserves, aller de soi, faire la part des choses. Test these in context. Their presence alone does not establish C1 difficulty.

**Illustrative target:** determine why an author follows a concession with a qualified objection, or select a reformulation preserving both the claim and its degree of certainty. Contrast a cautious claim with an absolute assertion, keeping both options grammatically correct.

## 4. DIALANG: what learners should understand

Basis: Appendix C, Documents C2 and C3, PDF pp. 244–252. These are simplified authoring interpretations, not reproduced descriptors.

| Level | Reading target for the initial test | Listening target for later | Writing target for later |
| --- | --- | --- | --- |
| A1 | Recognize familiar words and explicit information in very short notices, instructions and personal messages; allow rereading. | Recognize simple personal information and instructions in slow, carefully articulated speech. | Supply personal details and write very short basic messages. |
| A2 | Locate relevant details in short everyday texts; match practical needs to advertisements, notices or simple correspondence. | Identify the purpose and main information in short, clear routine exchanges and announcements. | Write short messages about familiar needs and events using basic links. |
| B1 | Understand straightforward factual texts, experiences and clear lines of argument; identify reasons and conclusions without requiring every subtle detail. | Follow main points and useful details in clear standard speech about familiar matters. | Connect experiences, information and opinions into an understandable sequence. |
| B2 | Understand articles and reports expressing positions; identify arguments, relevant details and viewpoints with substantial reading independence. | Follow extended speech and complex arguments on reasonably familiar topics, including speaker attitudes. | Develop clear, detailed accounts and arguments with supporting points. |
| C1 | Interpret complex factual or literary texts, implicit attitudes, fine distinctions and style; permit rereading difficult sections. | Follow complex or loosely organized discourse and implicit relationships or attitudes. | Produce well-organized complex discussion and qualify claims precisely for the intended reader. |

Difficulty should vary through the requested operation as well as the text. A dense article with a question asking only for a visible date provides weak C1 evidence. Conversely, a short passage can test advanced nuance if sufficient context is present. Some descriptors allow reference tools, repetition or rereading; a test that restricts these must state its conditions rather than claim to reproduce every descriptor exactly.

## 5. Companion Volume: distinguishing adjacent levels

Basis: PDF pp. 54, 130–133 and 140–141.

| Transition | Distinction to target |
| --- | --- |
| A1 → A2 | Move from isolated familiar expressions to routine exchanges and simple linked messages; expand practical contexts. |
| A2 → B1 | Move from lists of concrete information to connected accounts, reasons and comprehensible independent opinions. |
| B1 → B2 | Move from straightforward explanation to developed argument, weighing alternatives, and handling different viewpoints. |
| B2 → C1 | Move from clear argument and broad vocabulary to flexible organization, implicit meaning, connotation and precision of stance/register. |

For grammar, A1 involves limited control of a small learned repertoire; A2 still permits systematic basic errors while meaning remains clear; B1 involves reasonable control in familiar contexts; B2 shows good control with some slips or rigidity in complex forms; C1 involves consistently high accuracy. The Companion Volume explicitly notes that accuracy need not improve linearly as learners attempt more demanding language.

For vocabulary, A1 covers concrete expressions; A2 routine needs; B1 familiar topics and circumlocution; B2 broad general vocabulary, collocations and variation; C1 flexible synonym choice, idiomatic language and appropriate precision. A multiple-choice vocabulary item samples recognition/selection; it does not establish all the productive abilities in those descriptors.

## 6. DELF/DALF examples: assessment patterns to adapt

These observations describe the **supplied sample editions**, not an independently verified statement of current exam specifications. Their separate reading, listening, writing and speaking components are broader than Causerie's initial test. They do not provide standalone grammar or vocabulary sections equivalent to the proposed Causerie sections.

| Level | Observed reading tasks | Reusable question-writing lesson |
| --- | --- | --- |
| A1 | A childcare advertisement asks about days, pay and contact method (p. 6); other tasks use library information, job advertisements and outing notices (pp. 7–10). | Ask for one explicit fact or practical action. Use realistic short texts and familiar alternatives. |
| A2 | Match six book descriptions to readers' interests (p. 8); understand building/workplace messages (pp. 9–12); identify practical details in a short museum article (p. 13). | Ask learners to connect a need with a relevant description, or extract actionable information. Include plausible but mismatching options. |
| B1 | Compare restaurant descriptions against four requirements (pp. 5–6); answer questions about bilingual upbringing and holiday rentals (pp. 7–10). | Require paraphrase recognition, criterion comparison and reasons within accessible connected text. B1 can include social issues when treatment is straightforward. |
| B2 | Interpret an article about phone restrictions at school and another about bicycle commuting (pp. 5–8); attribute opinions on film adaptations to three contributors (pp. 9–10). | Distinguish stakeholders, qualifications and argument structure. Wrong answers can reverse the stance, overgeneralize it or attribute it to the wrong person. |
| C1 | Interpret a lengthy article about career/life changes (pp. 5–8), reformulate explanations, and justify true/false judgments with text evidence. | Assess synthesis within a passage and underlying social meaning. Keep an evidence span and explanation for each keyed interpretation. |

The keys use varied point values. The A1 and C1 keys explicitly accept coherent reformulations and do not penalize spelling/syntax in comprehension unless understanding is seriously impaired. The C1 key also makes some true/false scores conditional on a correct justification. These are useful distinctions between testing comprehension and testing written correctness.

**Causerie adaptation:** use equally weighted items if routing uses simple percentages, unless a separate weighting policy is deliberately adopted. For reading multiple-choice items, make all options grammatically acceptable so grammar errors do not give away the answer. For lexical items, keep the grammatical frame constant. For grammar items, use accessible vocabulary and sufficient context to rule out alternate correct tense/mood readings. Converting open responses to multiple choice changes the evidence obtained and introduces guessing.

### Future production and listening reference

The supplied writing tasks show increasing communicative demands:

- **A1:** fill a personal-information form and write an invitation of at least 40 words (pp. 11–12).
- **A2:** describe a birthday and respond to a wedding invitation, each at least 60 words (pp. 14–15).
- **B1:** advise a friend considering a move abroad for work, giving opinions and experience-based examples, at least 160 words (p. 11; embedded email visually checked).
- **B2:** write a justified objection to a mayor's transport decision, at least 250 words (p. 11).
- **C1:** synthesize documents in 200–240 words, without importing personal opinions, then write a separate argument of at least 250 words (pp. 9–14).

These lengths belong to these examples; they are not mandatory Causerie limits. Very short production prompts cannot demonstrate sustained C1 organization as well as an extended task. A future teacher rubric should separately assess fulfillment of the task, organization/cohesion, lexical range and appropriateness, and grammatical control against level expectations.

The listening papers progress from brief everyday messages and situations to extended radio material and complex argument. A2 and B1 instructions provide two hearings; B2 and C1 include tasks with different hearing counts. Causerie will need an explicit replay policy, actual audio, transcripts, and answer evidence. Written questions alone do not establish speech rate, acoustic clarity or recording difficulty.

## 7. Recommended authoring record and review

Use this compact record for each future question:

| Field | Purpose |
| --- | --- |
| ID and version | Preserve the exact item administered and its scoring rule. |
| Language, skill, intended level | French; reading/grammar/vocabulary initially; A1–C1. |
| Target feature | A precise objective, such as identifying an explicit reason or selecting a past hypothetical result. |
| Source reference | Document, PDF page, and relevant descriptor or inventory category. |
| Stimulus and prompt | Original passage/sentence and the question asked. |
| Options with stable IDs | Support answer randomization without changing the correct answer. |
| Key, rationale and evidence | Explain the answer and the relevant passage or language rule. |
| Distractor rationales | Identify the misunderstanding each wrong answer represents; reject ambiguous alternatives. |
| Difficulty rationale | Explain topic familiarity, linguistic load and required reasoning; do not rely on word length alone. |
| Passage/audio group | Keep shared material coherent and track reuse; questions sharing a passage provide related evidence. |
| Review and performance history | Record language review, revisions and eventual item statistics before calling difficulty calibrated. |

For a 12-item grammar bank at each level, distribute items across several target families rather than repeating one conjugation pattern. For reading, balance explicit detail, global meaning and the level-appropriate degree of inference. For vocabulary, include meaning in context, collocations and paraphrases, adding register/connotation at higher levels. These distributions are Causerie recommendations, not official CEFR quotas.

Review each draft for one defensible answer, adequate context, level-appropriate instructions, independent answer evidence and accessible formatting. Keep original question content separate from the exam examples used to inspire its structure. Pilot results will be needed to check whether the intended levels and routing actually discriminate learner performance.
