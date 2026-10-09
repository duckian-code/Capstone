use std::io;
use std::io::Write;
use reqwest::blocking::get;
use reqwest::get;

fn main() -> Result<(), reqwest::Error> {
    println!("WiktAPI Demo! Please enter your French word to translate. Say 'quit' to quit");

    loop {
        print!("> ");
        io::stdout().flush().unwrap();

        let mut input = String::new();
        io::stdin().read_line(&mut input).unwrap();

        let input = input.trim().to_string();

        if input == "quit" {
            break;
        }

        if input.is_empty() {
            continue;
        }

        let req_url = "https://api.wiktapi.dev/v1/en/word/".to_string() + &input + "?lang=fr";
        let response = get(req_url)?.text()?;
        let parsed: Value = serde_json::from_str(&response)?;

        // TODO: parse out direct translation, sentence in French, and translated version of that sentence
        
        println!("{}", response);
    }
}

