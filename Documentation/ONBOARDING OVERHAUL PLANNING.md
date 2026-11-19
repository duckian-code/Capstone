Onboarding needs to assign essential program values, walk the user through core functions, and introduce secondary functions unobtrusively.

### Onboarding Flow
##### General Onboarding Rules
* Only one onboarding prompt appears at a time (one per message after essentials)
* Don't introduce anything while user is typing, selecting text, recording, waiting for a response, or using another panel/dialog
* After a lesson is completed/skipped, allow at least one message turn from user to Dot before next unsolicited prompt
* Opening/closing settings should NEVER trigger a next suggestion
* If a user skips something, mark it internally as "skipped"
* Skip entire tutorial does not skip essentials phase, only everything after
* If an error is encountered during the onboarding process (at any point), the built in error handling solutions should be available to the user (error toasts - predefined solutions), and the onboarding progress should be preserved
* Guidance should NOT be tied to the tutorial thread
	* If user moves to another thread, the defined conditions to trigger tutorial options should persist. Onboarding prompts should only appear on threads where there appropriate controls are available (no spell checker available on vocal threads)
	* Interrupted lessons should not retain pointers to deleted/unavailable message text. If a hint finishes after navigation, record its successful completion without reopening the old dialog or interrupting the new conversation
	* If user interrupts a guided segment before it is marked as complete, interrupted guidance should be resumed when available again
* Onboarding prompts should avoid stealing focus
* After onboarding is complete (or skipped), there should be an option to replay tutorials
	* Replays should be available for the entire onboarding process (everything after essentials) as well as individual features
	* Replay should keep the original onboarding completion intact
	* Allow previously satisfied lessons to appear again (depending on what option is selected)
	* Should not clear goals, reminders, or annotations
	* Save only actions the user performs
	* Can be exited without affecting normal onboarding state. Exit should not resume replaying onboarding steps
* An exchange is a successfully sent user conversation message followed by Dot's completed response. Tool responses, retries, and teacher questions do not count.
* Tutorial callouts are nonmodal, allowing existing modal features to retain normal behavior.
* Final completion message should be shown only once and unobstrusively after all onboarding tasks have been skipped or completed.
* Use completed exchanges for all pacing. Wait one exchange between guided lessons, two exchanges after all guided lessons are completed/skipped before goals, two exchanges before reminders, and one exchange after personalization is resolved before the secondary checklist. Explicitly requested actions do not require a delay. ANY APPARENT CONTRADICTIONS TO THIS RULE SHOULD BE DISCARDED (except the requirement to wait for the sticky stage to be complete)

##### Essentials
This section has a dedicated window that walks you through the different input questions. 
API key
Name, profile picture, and pronouns page 1

* Preserve existing onboarding, asking user for name (and optional profile picture field beside it - failure to upload should display as error but not interrupt onboarding flow), pronouns, target language, and API key.
* Create and activate the user profile BEFORE offering the assessment, without marking essential setup as complete. Essentials complete only after a proficiency level is confirmed and saved. Tutorial completion should be tracked separately. Restarting resumes unfinished phase
* Evaluate user proficiency level ('choose my level' or 'help me find my level')
	* Should explain what each level means in onboarding (simply)
	* 'Help me find my level' should be transparent about estimated test time
	* Option for proficiency test should be grayed out 'feature not yet implemented' if not French
	* If user backs out of proficiency test, they should be returned to the prior screen to select 'choose my level'
	* After user takes proficiency test, application should suggest the average/overall proficiency level. This is a suggestion, and the user may still adjust it. This proficiency test should be logged into history. If any category is not scored, it should suggest the average of whatever skills are available.
		* This does not replace the existing scoring mechanism for future tests, only the suggestion from onboarding. The rule to average even without complete data is UNIQUE to this stage
		* If no skills receive placements, the user should be informed that no placements could be made, and they should be prompted to select a skill level (show the test results from below)
		* After completing the proficiency test, the user should have the option to see their score distribution (helpful in the event no placements are made). This distribution is the sum of the number of questions they got correct/incorrect in each CEFR level. If no score is assigned to the user, this data should be displayed by default
		* Ensure not assessed is distinguished from zero correct. Show correct/incorrect counts alongside number of questions at each level
		* Average the established category ranks using equal weighting and the existing rounding convention. Unplaced skills are excluded
		* Backed out of proficiency test should retain default behavior with discarding results. 
* A restart from this onboarding phase should return to the latest unfinished onboarding screen

##### Guided Practice
Position panel near the relevant message/control WITHOUT covering selected text or composer. Should have a short title, quick explanation, and a "Try It/Continue" option. No dimmed background or automatic focus theft.

* After gathering necessary information, send user to intro text conversation
* Each of the following should offer a "Try it" and "Continue"
* These suggestions should show up as an overlayed interface prompt on the screen that does NOT prevent the user from interacting with the rest of the interface

* Prompt user to use dictionary lookup feature to check words in Dot's message
	* Marked as complete when successful response comes back or when skipped
* Prompt to use hints feature to ask a question about the meaning of a given response
	* completed when hint successfully displays or when skipped
* When it's the users turn, offer help composing an introduction with teacher question (quiet optional offer)
	* Marked as complete when skipped or when teacher response comes back in
* If user makes a mistake in their first message sent to Dot, offer sticky as a way of making a note on it
	* If user makes no mistake, offer to save a useful phrase from Dot or your own message
	* Sticky should be marked as complete when a sticky is saved (or skipped)

##### Post-Success Personalization
Put in a stable area beside/above composer with ONE suggestion at a time. Buttons open existing settings section. Preserve conversation, scroll position, and draft.

* Only after the sticky lesson has been shown

* Present two compact choices with later actions (goals first, introduce practice reminders after a few messages pass)
	* Goals
		* Button 'click here to set goals' shortcuts to settings menu w/goals
		* Marked as complete when skipped or at least one goal is successfully persisted
	* Practice Reminder
		* Button 'click here to set a practice reminder' shortcuts to settings menu w/reminders
		* Marked as complete when skipped or reminder is successfully persisted

##### Secondary Feature Checklist
Collapsible panel where each feature has a short description, explore action, and dismiss action. Include "Hide Suggestions" so users don't have to dismiss every row individually. "Hide Suggestions" marks every feature as skipped and (assuming all prior onboarding tasks are marked as complete or skipped) completes onboarding.

* Introduce 'More ways to learn' panel with a checklist for:
	* spell checking
		* Marked as complete when skipped or spell check button is complete (including "no mistakes found")
	* user settings
		* Marked as complete when the settings menu has been opened (or skipped)
		* This step should not be shown if the user has already opened the menu
	* app settings 
		* Marked as complete when skipped or app settings menu is opened
		* Should not be shown if menu was already opened
	* vocal threads
		* Marked as complete when user selects vocal thread option in thread creation menu (should be a "show me how" button, not a requirement to make one)
* Each individual item should have a button to check it out (arrow) and a button to dismiss (x). When each item is dismissed, complete onboarding 'You're all set! Happy learning'

### Implementation
Skipping parts, sections, or the entirety of the tutorial should act the same as completing it.
Save progress between steps (in case of crash or app close) and avoid repeatedly prompting for dismissed options.

### Onboarding Overhaul Acceptance Checklist
1. Restart preserves essentials progress/stage
2. Assessment cancellation/no-placement results
3. Failed feature request does not interfere with onboarding stage (nor flag false completion)
4. Thread switching during pending response lets response finish
5. Skipped lessons persist and act as valid completions