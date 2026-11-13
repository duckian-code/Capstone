## Test Distribution

TEST ADMINISTERS QUESTIONS FROM A1 TO C1 (5 levels)

| Skill                         |     Approx. weight | How to test                             |
| ----------------------------- | -----------------: | --------------------------------------- |
| Reading comprehension         |                25% | Short texts + comprehension questions   |
| Vocabulary / lexical range    |                20% | Contextual word selection / cloze       |
| Grammar / grammatical control |                20% | Sentence completion / error recognition |
| Written production            |                20% | 1–2 short free-response prompts         |
| Listening                     |             10–15% | Audio + comprehension                   |
| Speaking                      | Optional initially | Recorded or live AI-evaluated response  |

## Test Flow

The test should not statically run through questions in increasing difficulty, it should instead provide a more nuanced dynamic difficulty increase based on user performance. For example:

Start at A2. If the player scores >80%, move to B1. If the player scores <50%, move to A1.
The test should have an appropriate stock of questions for each level, totaling to 9 or 12 questions per category per difficulty. 

Written production should provide some pre-assigned prompts and ask for user input, locking down other features in the application (no way to stop true cheating, so whatever). The teacher should grade the written section.

Audio may be borrowed from open source places and collected into the questions with hard coded answers, same as the first 3 categories. The speaking section will not be included for the first implementation of the test.

**Expect main proficiency (B1) to not change much, so instead show progress as the smaller measure (B1 50%)**

## Structure
* Final Score
	* Final score should be your final % on whichever proficiency you ended on
	* EX: if you made it to B1 on a particular skill, show B1 plus progress to next level
	* Progress to next level is the average of your scores on the latest difficulty increase
		* If you go to B1 and stay for the rest of the test, your score should be >50% <80%
	* **TALLEY FOR INDIVIDUAL SKILLS, INCREMENT INDIVIDUAL SKILL DIFFICULTY**
	* Final score should be an average of the individual scores
		* R: B2, G: B1, V: A2, L: B1, W: B1 should average to B1 (1-6, add and divide for scale)
* ALL TESTS
	* Every test item should have an ID, every testing session should record which questions were administered
	* When selecting questions, prefer (in order)
		1. Questions never seen
		2. Questions not seen in the last few tests
		3. Previously seen questions (after pool is exhausted)
	* Randomize answer order (help prevent memorization)
	* **3 blocks, start at B1** - this allows the user to jump up to C1 OR go all the way down to A1
* Reading/Grammar/Vocabulary Section
	* 12 question adaptive blocks (FUTURE: bigger blocks, more accurate)
		* 4 reading, 4 grammar, 4 vocab. After these, adjust EACH ONES difficulty based on score
	* Preserve scores across difficulty hikes
* Listening Section (**FUTURE ADDITION**)
	* 6 questions per adaptive block
* Writing Section (**FUTURE ADDITION**)
	* 6 questions per adaptive block

FINAL SCORE SHOULD DISPLAY YOUR ESTIMATED LEVEL AND INDIVIDUAL SKILLS
French Proficiency: B1
Reading: B2
Grammar: A2
Vocabulary: B1
Listening: B1
Writing: B1

Individual scores should also include a score 0-100 that is your progress to the **next level**. A B1 50 should display as a B1 with the bar 50% full, meaning half way to B2.

**STORED DATA FROM A TEST**:
* user id (who took it?)
* final proficiency (float - 1 to 5) two decimal precision = progress to next level?
* administered questions
* answers
* results

## Sources
* French Linguistic Inventory - *grammatical structures/vocab per level*
	* https://www.france-education-international.fr/document/cecrl?utm_source=chatgpt.com
* DIALANG descriptive scales - *what learners should understand*
	* https://web.archive.org/web/20251010164402/https://book.coe.int/en/attachment?id_attachment=1870
* CEFR Companion Volume - *broader proficiency expectations and distinctions (per level)*
	* https://rm.coe.int/cefr-companion-volume-with-new-descriptors-2020/16809ea0d4?utm_source=chatgpt.com
* DELF/DALF exam examples - *what assessment questions look like*
	* A1: https://www.france-education-international.fr/diplome/delf-tout-public/niveau-a1/exemples-sujets?langue=fr&utm_source=chatgpt.com
	* A2: https://www.france-education-international.fr/diplome/delf-tout-public/niveau-a2/exemples-sujets?langue=fr&utm_source=chatgpt.com
	  B1: https://www.france-education-international.fr/diplome/delf-tout-public/niveau-b1/exemples-sujets?langue=fr&utm_source=chatgpt.com
	* B2: https://www.france-education-international.fr/diplome/delf-tout-public/niveau-b2/exemples-sujets?langue=fr&utm_source=chatgpt.com
	* C1: https://www.france-education-international.fr/diplome/dalf/exemples-sujets?langue=fr&utm_source=chatgpt.com
	* INCLUDES TONS OF EXAMPLES

NOTE: these questions will be appropriate for levels, but not empirically accurate to the level
