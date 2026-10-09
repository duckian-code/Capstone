use std::io::{self, Write};
use reqwest::blocking::get;
use serde_json::Value;

fn main() {
    println!("WiktAPI Demo! Enter a French word. Say 'quit' to quit.");

    loop {
        print!("> ");
        io::stdout().flush().unwrap();

        let mut input = String::new();
        io::stdin().read_line(&mut input).unwrap();
        let input = input.trim();

        if input == "quit" {
            break;
        }

        if input.is_empty() {
            continue;
        }

        // Closure permits ? and handles errors inside the loop
        let result = (|| -> Result<Value, reqwest::Error> {
            let url = format!(
                "https://api.wiktapi.dev/v1/en/word/{input}?lang=fr"
            );

            let response = get(&url)?
                .error_for_status()?
                .json::<Value>()?;

            Ok(response)
        })();

        match result {
            Ok(parsed) => {
                let senses = parsed["entries"]
                    .as_array()
                    .into_iter()
                    .flatten()
                    .flat_map(|entry| {
                        entry["senses"]
                            .as_array()
                            .into_iter()
                            .flatten()
                    });

                let mut translation = None;
                let mut example = None;

                for sense in senses {
                    // First English definition
                    if translation.is_none() {
                        translation = sense["glosses"][0].as_str();
                    }

                    // First example with an English translation
                    if example.is_none() {
                        example = sense["examples"]
                            .as_array()
                            .and_then(|examples| {
                                examples.iter().find_map(|e| {
                                    let french = e["text"].as_str()?;
                                    let english = e["translation"]
                                        .as_str()
                                        .or_else(|| e["english"].as_str())?;

                                    Some((french, english))
                                })
                            });
                    }
                }

                println!("Definition: {}", translation.unwrap_or("N/A"));

                if let Some((fr, en)) = example {
                    println!("French: {fr}");
                    println!("English: {en}");
                } else {
                    println!("No translated example available.");
                }
            }
            Err(err) => eprintln!("Request failed: {err}"),
        }
    }
}

