## Tables:
id should be a UUID stored as text
**users**
id: TEXT PK
display_name: TEXT
pronouns: TEXT
native_language: TEXT
target_language: TEXT

not key-value
**user_settings** - identity/profile
user_id: TEXT PK/FK
notifications: INTEGER
theme: TEXT
font_size: REAL

metadata about conversations
**threads**
id: TEXT PK
user_id: TEXT FK
title: TEXT
topic: TEXT
created_at: TEXT
updated_at: TEXT
archived_at: TEXT NULL

**messages**
id: TEXT PK
thread_id: TEXT FK
role: TEXT
content: TEXT
sequence_no: INTEGER
openai_response_id: TEXT NULL
openai_item_id: TEXT NULL
created_at: TEXT

UNIQUE(thread_id, sequence_no)

**message_corrections**
id: TEXT PK
message_id: TEXT FK
original_text: TEXT
corrected_text: TEXT
explanation: TEXT NULL
start_offset: INTEGER NULL
end_offset: INTEGER NULL
category: TEXT NULL
created_at: TEXT

**stickies**
id: TEXT PK
user_id: TEXT FK
selected_text: TEXT
user_text: TEXT
created_at: TEXT
updated_at: TEXT

**goals**
id: TEXT PK
user_id: TEXT FK
title: TEXT
description: TEXT NULL

## Non-Tables Storage
Stronghold (package) - api key
src-tauri/prompts/system-prompt.txt - prompts

## Multiplicities
* User
	* Threads
		* Messages
			* MessageCorrections
	* Stickies
	* Goals

users 1-1 user_settings
users 1-M threads
threads 1-M messages
messages 1-M message_corrections
users 1-M stickies
