use dotenv::dotenv;
use std::env;
use openai_api_rust::*;
use openai_api_rust::chat::*;
use openai_api_rust::completions::*;
use std::io;
use std::io::prelude::*;
use std::io::stdin;

fn main() {
    // ENV DEMO
    dotenv().ok();
    let api_key = env::var("API_KEY").expect("API_KEY not set.");

    // INPUT LOOP DEMO
    println!("OpenAI API Demo! Please enter your intitial message to the AI. Say 'Au revoir !' to quit.");
    let mut messages: Vec<Message> = Vec::new();

    loop {
        print!("\nYou: ");
        io::stdout().flush().unwrap();

        let mut input = String::new();
        io::stdin().read_line(&mut input).unwrap();

        let input = input.trim();

        if input == "Au revoir !" {
            break;
        }

        if input.is_empty() {
            continue;
        }

        messages.push(Message {
            role: Role::User,
            content: input.to_string(),
        });

        // API DEMO
        let auth = Auth::new(api_key.as_str());
        let openai = OpenAI::new(auth, "https://api.openai.com/v1/");
        let body = ChatBody {
            model: "gpt-4o-mini".to_string(),
            max_tokens: Some(256),
            temperature: Some(0.7_f32),
            top_p: None,
            n: Some(1), // responses generated
            stream: Some(false), // stream messages as they're generated
            stop: None, // defines stop cases where the model should stop generating
            presence_penalty: None, // defines how unique responses should be according to history
            frequency_penalty: None, // penalize tokens by their frequency in text. Decreases likelihood to repeat same line
            logit_bias: None, // modify likelihood of a given token showing up in output
            user: None,
            messages: messages.clone(),
        };

        match openai.chat_completion_create(&body) {
            Ok(response) => {
                if let Some(choice) = response.choices.first() {
                    if let Some(message) = &choice.message {
                        println!("AI: {}", message.content);

                        messages.push(Message {
                            role: Role::Assistant,
                            content: message.content.clone(),
                        });
                    }
                }
            }
            Err(err) => {
                eprintln!("API Error: {:?}", err);

                // REMOVE MESSAGE TO KEEP HISTORY CONSISTENT!!!
                messages.pop();
            }
        }
    }

    println!("Au revoir !");
}