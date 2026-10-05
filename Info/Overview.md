### Name Ideas:
* <u>Roselight</u>
* ~~LingoNook~~
* Solas
* ~~Ambiance~~
* ~~Vernacular~~
* Accented
* Fluentish
* Idiomate
* <u>Causerie</u>
* ~~Bavard~~
* Passerelle

### Description
[Name] is an AI driven language learning platform targeted towards intermediate and advanced learners. 

ART STYLE PIVOT:
Instead of avatar profile views, maybe a more personalized pixelated version with a pixel avatar that you can talk to. Maybe she can move around the app (INSPIRED BY OUTCORE), would seamlessly transition into a shimeji mode

### Strategies
* Engage DIRECT Learning Strategies
	* Memory strategies (cognitive)
	* Mental links and imagery/mnemonics (cognitive)
	* Practice reminders (cognitive)
	* Reasoning out answers (cognitive)
	* I/O association (cognitive)
	* Educated guess system (compensation)
* Engage INDIRECT Learning Strategies
	* Planning (meta-cog)
	* Eval progress (meta-cog)
	* Monitor learning (meta-cog)
	* Self-encouragement (affective)
	* Emotional impact on learning (affective)
	* Reduce anxiety (affective)
	* Inquiring (social)
	* Collaborating (social)
	* Empathising (social)

### Practical Features
* Conversation System
	* Topic-based conversations (storage, context, and retrieval)
* Sticky Notes
	* Encourage mnemonics on words/phrases (NOT TRANSLATING)
* Reminder System
	* Send periodic reminders/notifications (configurable) to practice
* Hint System
	* Get a hint on the meaning of the word (provided version of sticky notes)
* Goals System
	* Allow user to set goals that can then be targeted in conversation
	* Provide critique and feedback specific to goals
	* Ask the LLM to focus on grammar, it's suggestions will focus on grammar
	* Choose up to 3 linguistic focuses (I.E. Grammar, vocabulary, or tenses)
* Proficiency Test
	* Allow user to test their proficiency in a given language
* Break System
	* Application will encourage breaks away from studying to help prevent burnout(?)


### Technical Features
* Select different LLMs for low priority, medium priority, and high priority
* Modular design (to prevent context bleeding and check over things)

### Tech Stack
* Tauri2 (desktop shell)
* React/TS/Vite (front-end)
* PixiJS (character rendering)
* XState (character behaviour)
* SQLite
* GoLang (application logic)

Note: Whenever a feature touches the OS, filesystem, database location, or Tauri native layer, perform a cross-platform test the same week.

Note: Perform internal scope checkpoints
#### Week 2
* Tauri works
* Rust communication works
* React works
* XState works
* PixiJS can respond to state
* SQLite works
* OpenAI works

#### Week 3-6
* Do vertical slice development. Make a front feature then make sure it works (loosely) with the back

#### Week 6
* 'Ugly' final version of MVP
* Not bug free
* Not polished
* Functional.

#### Week 8
* **NO NEW REQUIRED ARCHITECTURE**
* POLISH DIS HOE


#### Week 9
* **ONLY DO STRETCH IF THE APPLICATION IS PRESENTATION SAFE**
* Spend last few days preparing presentation


#### Week 10
 * Update this as you approach The End™
 * Presentation should be finished (I think)