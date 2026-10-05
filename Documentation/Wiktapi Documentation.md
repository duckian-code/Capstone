Wiktapi lets you query an API with a word and language and get a returned definition.

### Endpoints
> [!NOTE] Endpoint Example: 
`curl "https://api.wiktapi.dev/v1/en/word/chat?lang=fr"`
```json
{
  "word": "chat",
  "edition": "en",
  "entries": [
    {
      "word": "chat",
      "lang": "French",
      "lang_code": "fr",
      "pos": "noun",
      "senses": [{ "glosses": ["cat"] }],
      "sounds": [{ "ipa": "/ʃa/" }]
    }
  ]
}
```

> [!NOTE] Response Example:
```
{
  "word": "chat",
  "edition": "en",
  "entries": [
    {
      "senses": [
        {
          "examples": [
            {
              "text": "Soudain, d’un seul élan, cela se précipita sur lui, avec un miaulement plaintif et la queue droite. C’était un jeune chat, menu et décharné, qui frottait sa tête contre les jambes de Bert, en ronronnant.",
              "ref": "1910, Henry-D. Davray, B. Kozakiewicz (tr.), La Guerre dans les airs, translation of The War in the Air by H. G. Wells, page 335:",
              "english": "It advanced suddenly upon him with a rush, with a little meawling cry and tail erect. It rubbed its head against him and purred. It was a tiny, skinny little kitten.",
              "type": "quotation",
              "bold_text_offsets": [
                [
                  117,
                  121
                ]
              ],
              "translation": "It advanced suddenly upon him with a rush, with a little meawling cry and tail erect. It rubbed its head against him and purred. It was a tiny, skinny little kitten."
            }
          ],
          "links": [
            [
              "cat",
              "cat"
            ]
          ],
          "categories": [
            "French terms with quotations"
          ],
          "glosses": [
            "cat (feline)"
          ],
          "tags": [
            "masculine"
          ]
        },
        {
          "examples": [
            {
              "text": "— Est-ce un chat ou une chatte ? » demanda Jean.\n Sophie ne se prononça point, Alice devint rouge et dit en riant :\n« C’est un chat !\n— En êtes-vous sûre ? demanda Jean.\n— Ah bien! fit Alice, pour sûr ! »",
              "ref": "1896, Paul Margueritte, “Une flaque”, in L’eau qui dort, Paris: Armand Colin et cⁱᵉ, […], section II, pages 102–103:",
              "english": "\"Is it a tomcat or a girl cat?\" asked Jean.\n Sophie not having spoken, Alice turned red and said, laughing:\n \"It's a tomcat!\"\n \"Are you sure?\" asked Jean.\n \"Of course,\" said Alice, \"for sure!\"",
              "type": "quotation",
              "bold_text_offsets": [
                [
                  12,
                  16
                ],
                [
                  24,
                  28
                ],
                [
                  127,
                  131
                ]
              ],
              "translation": "\"Is it a tomcat or a girl cat?\" asked Jean.\n Sophie not having spoken, Alice turned red and said, laughing:\n \"It's a tomcat!\"\n \"Are you sure?\" asked Jean.\n \"Of course,\" said Alice, \"for sure!\"",
              "bold_translation_offsets": [
                [
                  9,
                  15
                ],
                [
                  117,
                  123
                ]
              ]
            }
          ],
          "links": [
            [
              "cat",
              "cat"
            ],
            [
              "tom",
              "tom"
            ],
            [
              "tomcat",
              "tomcat"
            ]
          ],
          "categories": [
            "French terms with quotations"
          ],
          "raw_glosses": [
            "(male) cat, tom, tomcat"
          ],
          "glosses": [
            "cat, tom, tomcat"
          ],
          "tags": [
            "masculine"
          ]
        },
        {
          "examples": [
            {
              "text": "Alors, quand il repère, sur le Web, une scène croustillante montrant un groupe en train de se livrer à « une partie de chat, à poil, dans un camp de la mort », c'est comme un déclic.",
              "ref": "2023 August, Arnaud de Montjoye, “En touriste à Auschwitz”, in Le Monde diplomatique, page 24:",
              "type": "quotation",
              "bold_text_offsets": [
                [
                  119,
                  123
                ]
              ]
            }
          ],
          "links": [
            [
              "tag",
              "tag"
            ],
            [
              "tig",
              "tig"
            ]
          ],
          "categories": [
            "French terms with quotations",
            "Requests for translations of French quotations"
          ],
          "glosses": [
            "tag, tig (children’s game)"
          ],
          "tags": [
            "masculine"
          ]
        }
      ],
      "sounds": [
        {
          "ipa": "/ʃa/"
        },
        {
          "audio": "Fr-chat.ogg",
          "ogg_url": "https://upload.wikimedia.org/wikipedia/commons/6/65/Fr-chat.ogg",
          "mp3_url": "https://upload.wikimedia.org/wikipedia/commons/transcoded/6/65/Fr-chat.ogg/Fr-chat.ogg.mp3"
        },
        {
          "tags": [
            "Canada"
          ],
          "ipa": "[ʃɑ]"
        },
        {
          "tags": [
            "Canada"
          ],
          "ipa": "[ʃɔ]"
        },
        {
          "rhymes": "-a"
        },
        {
          "homophone": "chats"
        }
      ],
      "translations": [],
      "forms": [
        {
          "form": "chats",
          "tags": [
            "plural"
          ]
        },
        {
          "form": "chatte",
          "tags": [
            "feminine"
          ]
        }
      ]
    },
    {
      "senses": [
        {
          "links": [
            [
              "Internet",
              "Internet"
            ],
            [
              "chat",
              "chat#English"
            ]
          ],
          "categories": [
            "fr:Internet"
          ],
          "synonyms": [
            {
              "word": "tchat"
            }
          ],
          "raw_glosses": [
            "(Internet) chat (online discussion)"
          ],
          "glosses": [
            "chat (online discussion)"
          ],
          "tags": [
            "Internet",
            "masculine"
          ]
        }
      ],
      "sounds": [
        {
          "ipa": "/tʃat/"
        }
      ],
      "translations": [],
      "forms": [
        {
          "form": "chats",
          "tags": [
            "plural"
          ]
        }
      ]
    }
  ]
}
```

> [!NOTE] Other Endpoints
**Fetch Just the Definitions**
`curl "https://api.wiktapi.dev/v1/en/word/run/definitions"`
**Search for Words**
`curl "https://api.wiktapi.dev/v1/en/search?q=katz&lang=de"`

> [!NOTE] All Endpoints:
`GET /v1/editions` - List available Wiktionary editions
`GET /v1/languages` - List word languages with entry conuts
`GET /v1/{edition}/word/{word}` - Full entry
`GET /v1/{edition}/word/{word}/definitions` - Glosses, examples, tags
`GET /v1/{edition}/word/{word}/translations` - Translation table
`GET /v1/{edition}/word/{word}/pronunciations` - IPA and audio
`GET /v1/{edition}/word/{word}/forms` - Inflected forms
`GET /v1/{edition}/search?q=` - Prefix search

### Editions
Edition is the source you query, identified by language code (en, fr, ed, ...).
Editions control:
1. The dictionary that's queried
2. The language the definitions are in

To get available editions:
`curl https://api.wiktapi.dev/v1/editions`

### Word Language (`?lang=`)
The `?lang=` parameter filters entries to a specific word language: the language the word itself belongs to.

`GET /v1/en/word/Haus?lang=de` 
* German word "Haus", English definitions

`GET /v1/fr/word/Haus?lang=de`
* German word "Haus", French definitions

Without `?lang=`, you get every language that has a word with that spelling:
`GET /v1/en/word/chat`
* French "chat"
* English "chat"
* etc

`curl https://api.wiktapi.dev/v1/languages`
* See all word languages in a given instance