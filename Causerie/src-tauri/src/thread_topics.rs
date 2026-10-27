use serde::Serialize;

#[derive(Serialize)]
pub struct ThreadTopic {
    pub id: usize,
    pub title: &'static str,
    pub prompt: &'static str,
}

// IDs are array positions: append new topics rather than reordering them.
pub const TOPICS: &[(&str, &str)] = &[
    ("Introductions", "Introduce yourself and discover shared interests."),
    ("Family", "Describe family relationships and different personalities."),
    ("Daily routines", "Compare daily routines and discuss an unexpected change."),
    ("Hobbies", "Explore a hobby and explain what makes it enjoyable."),
    ("Your hometown", "Describe a hometown and what makes it distinctive."),
    ("Finding a home", "Compare places to live and discuss practical needs."),
    ("Neighbors", "Discuss a neighborhood situation and getting along with others."),
    ("School life", "Talk about classes, assignments, and learning experiences."),
    ("Working life", "Discuss workplace routines, responsibilities, and challenges."),
    ("Future plans", "Talk about ambitions and plans that might change."),

    ("At a café", "Discuss ordering drinks, preferences, and a café situation."),
    ("Eating out", "Discuss a restaurant visit, menu choices, and dietary preferences."),
    ("Grocery shopping", "Plan groceries and deal with an unavailable ingredient."),
    ("Cooking together", "Explain a recipe and adapt it to an unexpected limitation."),
    ("Buying clothes", "Compare clothing, sizes, styles, and practical needs."),
    ("Choosing a gift", "Choose a thoughtful gift while considering a budget."),
    ("Returning a purchase", "Explain a problem with a purchase and request a solution."),
    ("Managing a budget", "Prioritize expenses and explain financial tradeoffs."),
    ("Local services", "Describe a practical problem and arrange help from a local service."),
    ("Making an appointment", "Arrange an appointment and negotiate scheduling constraints."),

    ("Asking for directions", "Describe a route and clarify unfamiliar landmarks."),
    ("Public transportation", "Choose transport and respond to a disruption."),
    ("A train journey", "Plan a train journey and handle a travel complication."),
    ("At the airport", "Discuss airport procedures and an unexpected travel change."),
    ("Booking accommodation", "Compare accommodation and explain specific requirements."),
    ("Planning a trip", "Plan an itinerary with competing preferences."),
    ("Weather and plans", "Adjust plans because of changing weather."),
    ("Packing for a journey", "Decide what to pack for a particular destination."),
    ("Lost belongings", "Describe a lost item and retrace what happened."),
    ("Exploring a new place", "Choose what to explore and discuss local discoveries."),

    ("Feeling unwell", "Describe everyday symptoms and discuss seeking appropriate help."),
    ("Exercise", "Compare forms of exercise and find an enjoyable routine."),
    ("Sleep and rest", "Discuss rest, sleep routines, and everyday obstacles."),
    ("Changing a habit", "Explain a habit you want to change and consider realistic steps."),
    ("Expressing emotions", "Describe feelings and what caused them."),
    ("Friendship", "Discuss friendship, support, and differing expectations."),
    ("Invitations", "Invite someone, respond politely, and arrange details."),
    ("Celebrations", "Plan a celebration with different preferences and constraints."),
    ("Traditions", "Explain a tradition and compare how people celebrate."),
    ("Manners and etiquette", "Discuss politeness and an unfamiliar social convention."),

    ("Music", "Compare musical tastes and choose music for an occasion."),
    ("Films and television", "Recommend something to watch and explain your choice."),
    ("Books and stories", "Discuss a story, character, or surprising ending."),
    ("Discussing the news", "Discuss a fictional news situation and distinguish facts from opinions."),
    ("Everyday technology", "Explain how you use technology and solve an everyday problem."),
    ("Online privacy", "Discuss online sharing and different privacy preferences."),
    ("The environment", "Compare practical ways to reduce environmental impact."),
    ("Animals", "Discuss animals, their behavior, and responsible care."),
    ("Volunteering", "Choose a volunteering activity and explain what you could contribute."),
    ("Community life", "Discuss a local improvement and different community needs."),

    ("Telling a story", "Recount an unexpected event in a clear sequence."),
    ("Childhood memories", "Describe a memory and compare the past with the present."),
    ("Giving an opinion", "Express an opinion and support it with reasons."),
    ("Comparing options", "Compare alternatives and explain which you prefer."),
    ("Making a recommendation", "Recommend an option suited to another person's needs."),
    ("Disagreeing politely", "Express disagreement while acknowledging another perspective."),
    ("Making an apology", "Explain a misunderstanding, apologize, and suggest a repair."),
    ("Asking for clarification", "Clarify an ambiguous explanation without pretending to understand."),
    ("Negotiating a compromise", "Negotiate a practical compromise between competing preferences."),
    ("Imagining possibilities", "Explore a hypothetical situation and its possible consequences."),
];

#[tauri::command]
pub fn list_thread_topics() -> Vec<ThreadTopic> {
    TOPICS
        .iter()
        .enumerate()
        .map(|(id, &(title, prompt))| ThreadTopic { id, title, prompt })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashSet;

    #[test]
    fn catalog_is_large_and_distinct() {
        assert!(TOPICS.len() >= 50);

        let titles: HashSet<_> = TOPICS.iter().map(|topic| topic.0).collect();
        assert_eq!(titles.len(), TOPICS.len());

        assert!(TOPICS.iter().all(|(title, prompt)| {
            !title.trim().is_empty() && !prompt.trim().is_empty()
        }));
    }
}
