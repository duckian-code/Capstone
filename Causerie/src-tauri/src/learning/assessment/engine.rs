//! Wave 1 runtime data only. Source-reference documentation stays with the banks.
use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, BTreeSet};

pub const LEVELS: [&str; 5] = ["A1", "A2", "B1", "B2", "C1"];
pub type Answers = BTreeMap<String, String>;
pub type Seen = BTreeMap<(String, String), String>; // bank/question -> last shown UTC

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    pub blocks: usize,
    pub questions_per_skill: usize,
    pub starting_level: String,
    pub decrease_below: f64,
    pub increase_at: f64,
    pub minimum_evidence: usize,
    pub placement_threshold: f64,
    pub levels: Vec<String>,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Policy {
    pub version: String,
    pub included_skills: Vec<String>,
    pub overall_method: String,
}
pub fn config() -> Config {
    Config {
        blocks: 3,
        questions_per_skill: 4,
        starting_level: "B1".into(),
        decrease_below: 0.5,
        increase_at: 0.75,
        minimum_evidence: 4,
        placement_threshold: 0.75,
        levels: LEVELS.map(String::from).to_vec(),
    }
}
pub fn policy() -> Policy {
    Policy {
        version: "fr-wave1-equal-category-ranks-v1".into(),
        included_skills: ["reading", "vocabulary", "grammar"]
            .map(String::from)
            .to_vec(),
        overall_method: "equal mean of category ranks; floor(mean + 0.5)".into(),
    }
}
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct OptionItem {
    pub id: String,
    pub text: String,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Passage {
    pub id: String,
    pub version: u32,
    pub language: String,
    pub level: String,
    pub title: String,
    pub genre: String,
    pub text: String,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Question {
    pub id: String,
    pub version: u32,
    pub language: String,
    pub skill: String,
    pub level: String,
    pub format: String,
    pub status: String,
    pub prompt: String,
    pub passage_id: Option<String>,
    pub passage_version: Option<u32>,
    pub options: Vec<OptionItem>,
    pub correct_option_id: String,
    pub explanation: String,
    pub tags: Vec<String>,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Bank {
    pub schema_version: u32,
    pub bank_id: String,
    pub bank_version: u32,
    pub language: String,
    pub skill: String,
    pub levels: Vec<String>,
    pub passages: Vec<Passage>,
    pub questions: Vec<Question>,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BankRef {
    pub bank_id: String,
    pub bank_version: u32,
    pub skill: String,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Item {
    pub bank_id: String,
    pub bank_version: u32,
    pub skill: String,
    pub administered_difficulty: String,
    pub question: Question,
    pub passage: Option<Passage>,
    pub displayed_option_order: Vec<String>,
    pub submitted_option_id: Option<String>,
    pub correct: Option<bool>,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Block {
    pub index: usize,
    pub shown_at: String,
    pub submitted_at: Option<String>,
    pub items: Vec<Item>,
}
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct Counts {
    pub correct: usize,
    pub answered: usize,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SkillResult {
    pub category: Option<String>,
    pub rank: Option<usize>,
    pub placement_status: String,
    pub evidence: BTreeMap<String, Counts>,
    pub next_level: Option<String>,
    pub next_level_counts: Option<Counts>,
    pub next_level_accuracy: Option<f64>,
    pub required_correct: Option<usize>,
    pub progress_status: String,
    pub placement_progress: Option<f64>,
    pub display_position: Option<f64>,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Overall {
    pub status: String,
    pub mean_rank: Option<f64>,
    pub category: Option<String>,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Results {
    pub skills: BTreeMap<String, SkillResult>,
    pub overall: Overall,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Attempt {
    pub schema_version: u32,
    pub id: String,
    pub user_id: String,
    pub language: String,
    pub status: String,
    pub started_at: String,
    pub completed_at: Option<String>,
    pub config: Config,
    pub scoring_policy: Policy,
    pub banks: Vec<BankRef>,
    pub blocks: Vec<Block>,
    pub results: Option<Results>,
}

pub fn banks() -> Result<Vec<Bank>, String> {
    [
        include_str!("../../../resources/proficiency/fr/reading.json"),
        include_str!("../../../resources/proficiency/fr/vocabulary.json"),
        include_str!("../../../resources/proficiency/fr/grammar.json"),
    ]
    .iter()
    .map(|s| serde_json::from_str(s).map_err(|e| format!("Invalid assessment bank: {e}")))
    .collect()
}
fn rank(level: &str, cfg: &Config) -> usize {
    cfg.levels
        .iter()
        .position(|v| v == level)
        .expect("validated level")
}
pub fn route(level: &str, correct: usize, answered: usize, cfg: &Config) -> String {
    let i = rank(level, cfg);
    let accuracy = correct as f64 / answered as f64;
    let next = if accuracy < cfg.decrease_below {
        i.saturating_sub(1)
    } else if accuracy >= cfg.increase_at {
        (i + 1).min(cfg.levels.len() - 1)
    } else {
        i
    };
    cfg.levels[next].clone()
}

/// Maximum demand at each level across every feasible route; no assumptions about 4 items.
fn demand(cfg: &Config) -> Vec<usize> {
    fn visit(cfg: &Config, at: usize, block: usize, counts: &mut Vec<usize>, max: &mut Vec<usize>) {
        counts[at] += cfg.questions_per_skill;
        for i in 0..counts.len() {
            max[i] = max[i].max(counts[i]);
        }
        if block + 1 < cfg.blocks {
            let next: BTreeSet<_> = (0..=cfg.questions_per_skill)
                .map(|n| {
                    rank(
                        &route(&cfg.levels[at], n, cfg.questions_per_skill, cfg),
                        cfg,
                    )
                })
                .collect();
            for i in next {
                visit(cfg, i, block + 1, counts, max);
            }
        }
        counts[at] -= cfg.questions_per_skill;
    }
    let mut max = vec![0; cfg.levels.len()];
    visit(
        cfg,
        rank(&cfg.starting_level, cfg),
        0,
        &mut vec![0; cfg.levels.len()],
        &mut max,
    );
    max
}
pub fn validate(banks: &[Bank], cfg: &Config, policy: &Policy) -> Result<(), String> {
    if cfg.blocks == 0
        || cfg.blocks > 10
        || cfg.questions_per_skill == 0
        || cfg.minimum_evidence == 0
        || cfg.levels != LEVELS.map(String::from)
        || !cfg.levels.contains(&cfg.starting_level)
        || !(0.0..=1.0).contains(&cfg.decrease_below)
        || !(0.0..=1.0).contains(&cfg.increase_at)
        || cfg.decrease_below > cfg.increase_at
        || !(0.0..=1.0).contains(&cfg.placement_threshold)
        || cfg.placement_threshold == 0.0
        || policy.included_skills.is_empty()
        || policy.included_skills.iter().collect::<BTreeSet<_>>().len()
            != policy.included_skills.len()
    {
        return Err("Invalid assessment configuration.".into());
    }
    let demand = demand(cfg);
    let mut bank_ids = BTreeSet::new();
    let mut question_ids = BTreeSet::new();
    for skill in &policy.included_skills {
        let matching: Vec<_> = banks
            .iter()
            .filter(|b| &b.skill == skill && b.language == "fr")
            .collect();
        if matching.len() != 1 {
            return Err(format!("Expected one French {skill} bank."));
        }
        let b = matching[0];
        if b.schema_version != 1
            || b.bank_version == 0
            || !bank_ids.insert(&b.bank_id)
            || b.levels != cfg.levels
        {
            return Err(format!("Invalid bank metadata: {}", b.bank_id));
        }
        let mut passage_ids = BTreeSet::new();
        for p in &b.passages {
            if p.version == 0
                || !passage_ids.insert(&p.id)
                || p.language != b.language
                || !cfg.levels.contains(&p.level)
                || p.text.trim().is_empty()
            {
                return Err(format!("Invalid passage: {}", p.id));
            }
        }
        for q in &b.questions {
            let ids: BTreeSet<_> = q.options.iter().map(|o| &o.id).collect();
            if !question_ids.insert(&q.id)
                || q.version == 0
                || q.skill != *skill
                || q.language != b.language
                || !cfg.levels.contains(&q.level)
                || q.format != "single_choice"
                || q.prompt.trim().is_empty()
                || q.explanation.trim().is_empty()
                || ids.len() != q.options.len()
                || ids.len() < 2
                || !ids.contains(&q.correct_option_id)
                || q.options
                    .iter()
                    .any(|o| o.id.is_empty() || o.text.trim().is_empty())
            {
                return Err(format!("Invalid question: {}", q.id));
            }
            match (&q.passage_id, q.passage_version) {
                (Some(id), Some(version))
                    if b.passages.iter().any(|p| {
                        &p.id == id
                            && p.version == version
                            && p.level == q.level
                            && p.language == q.language
                    }) =>
                {
                    ()
                }
                (None, None) if skill != "reading" => (),
                _ => return Err(format!("Invalid passage association: {}", q.id)),
            }
            // Draft questions are deliberately eligible in Wave 1; never mutate status.
        }
        for (i, level) in cfg.levels.iter().enumerate() {
            let count = b.questions.iter().filter(|q| &q.level == level).count();
            if count < demand[i] {
                return Err(format!(
                    "{} {level}: need {} distinct questions, found {count}.",
                    b.bank_id, demand[i]
                ));
            }
        }
    }
    Ok(())
}
fn random_below(bound: usize) -> Result<usize, String> {
    let bound = bound as u64;
    let limit = u64::MAX - u64::MAX % bound;
    loop {
        let mut bytes = [0; 8];
        getrandom::getrandom(&mut bytes)
            .map_err(|_| "Unable to randomize assessment.".to_owned())?;
        let n = u64::from_le_bytes(bytes);
        if n < limit {
            return Ok((n % bound) as usize);
        }
    }
}
fn shuffle<T>(values: &mut [T]) -> Result<(), String> {
    for i in (1..values.len()).rev() {
        values.swap(i, random_below(i + 1)?);
    }
    Ok(())
}
impl Attempt {
    pub fn new(id: String, user_id: String, now: String, banks: &[Bank]) -> Result<Self, String> {
        let cfg = config();
        let scoring_policy = policy();
        validate(banks, &cfg, &scoring_policy)?;
        Ok(Self {
            schema_version: 1,
            id,
            user_id,
            language: "fr".into(),
            status: "in_progress".into(),
            started_at: now,
            completed_at: None,
            config: cfg,
            scoring_policy,
            banks: banks
                .iter()
                .map(|b| BankRef {
                    bank_id: b.bank_id.clone(),
                    bank_version: b.bank_version,
                    skill: b.skill.clone(),
                })
                .collect(),
            blocks: vec![],
            results: None,
        })
    }
    pub fn next_block(&mut self, banks: &[Bank], seen: &Seen, now: String) -> Result<(), String> {
        if self.blocks.len() >= self.config.blocks
            || self.blocks.last().is_some_and(|b| b.submitted_at.is_none())
        {
            return Err("No new block is available.".into());
        }
        let used: BTreeSet<_> = self
            .blocks
            .iter()
            .flat_map(|b| &b.items)
            .map(|i| &i.question.id)
            .collect();
        let mut items = vec![];
        for skill in &self.scoring_policy.included_skills {
            let level = if let Some(b) = self.blocks.last() {
                let group: Vec<_> = b.items.iter().filter(|i| &i.skill == skill).collect();
                route(
                    &group[0].administered_difficulty,
                    group.iter().filter(|i| i.correct == Some(true)).count(),
                    group.len(),
                    &self.config,
                )
            } else {
                self.config.starting_level.clone()
            };
            let bank = banks
                .iter()
                .find(|b| &b.skill == skill)
                .ok_or("Missing bank.")?;
            let mut pool: Vec<_> = bank
                .questions
                .iter()
                .filter(|q| q.level == level && !used.contains(&q.id))
                .collect();
            // Random tie breaks, then stable ordering: unseen first, oldest exposure next.
            shuffle(&mut pool)?;
            pool.sort_by_key(|q| seen.get(&(bank.bank_id.clone(), q.id.clone())));
            if pool.len() < self.config.questions_per_skill {
                return Err(format!("Insufficient unused {skill} {level} questions."));
            }
            pool.truncate(self.config.questions_per_skill);
            // Group selected passage siblings without changing the preference-based selection.
            pool.sort_by(|a, b| a.passage_id.cmp(&b.passage_id));
            for q in pool {
                let mut order: Vec<_> = q.options.iter().map(|o| o.id.clone()).collect();
                shuffle(&mut order)?;
                items.push(Item {
                    bank_id: bank.bank_id.clone(),
                    bank_version: bank.bank_version,
                    skill: skill.clone(),
                    administered_difficulty: level.clone(),
                    question: q.clone(),
                    passage: bank
                        .passages
                        .iter()
                        .find(|p| {
                            Some(&p.id) == q.passage_id.as_ref()
                                && Some(p.version) == q.passage_version
                        })
                        .cloned(),
                    displayed_option_order: order,
                    submitted_option_id: None,
                    correct: None,
                });
            }
        }
        self.blocks.push(Block {
            index: self.blocks.len(),
            shown_at: now,
            submitted_at: None,
            items,
        });
        Ok(())
    }
    pub fn submit(&mut self, index: usize, answers: &Answers, now: String) -> Result<(), String> {
        let block = self.blocks.get_mut(index).ok_or("Invalid block.")?;
        if answers.len() != block.items.len()
            || block.items.iter().any(|i| {
                !answers
                    .get(&i.question.id)
                    .is_some_and(|id| i.displayed_option_order.contains(id))
            })
        {
            return Err("Answer every question with a valid option before submitting.".into());
        }
        if block.submitted_at.is_some() {
            return if block
                .items
                .iter()
                .all(|i| i.submitted_option_id.as_ref() == answers.get(&i.question.id))
            {
                Ok(()) // Identical retries only. Submitted blocks are immutable.
            } else {
                Err("This block has already been submitted.".into())
            };
        }
        for item in &mut block.items {
            let id = answers[&item.question.id].clone();
            item.correct = Some(id == item.question.correct_option_id);
            item.submitted_option_id = Some(id);
        }
        block.submitted_at = Some(now.clone());
        if self.blocks.len() == self.config.blocks {
            self.results = Some(score(self));
            self.status = "completed".into();
            self.completed_at = Some(now);
        }
        Ok(())
    }
}
pub fn placement(evidence: BTreeMap<String, Counts>, cfg: &Config) -> SkillResult {
    let index = cfg.levels.iter().rposition(|level| {
        evidence.get(level).is_some_and(|c| {
            c.answered >= cfg.minimum_evidence
                && c.correct >= (cfg.placement_threshold * c.answered as f64).ceil() as usize
        })
    });
    let mut r = SkillResult {
        category: index.map(|i| cfg.levels[i].clone()),
        rank: index.map(|i| i + 1),
        placement_status: if index.is_some() {
            "established"
        } else {
            "not_established"
        }
        .into(),
        evidence,
        next_level: None,
        next_level_counts: None,
        next_level_accuracy: None,
        required_correct: None,
        progress_status: "placement_not_established".into(),
        placement_progress: None,
        display_position: None,
    };
    if let Some(i) = index {
        if i + 1 == cfg.levels.len() {
            r.progress_status = "ceiling".into();
            r.display_position = Some((i + 1) as f64);
        } else {
            let next = cfg.levels[i + 1].clone();
            r.next_level = Some(next.clone());
            r.next_level_counts = r.evidence.get(&next).cloned();
            r.progress_status = "not_assessed".into();
            if let Some(c) = r.evidence.get(&next) {
                if c.answered >= cfg.minimum_evidence {
                    let required = (cfg.placement_threshold * c.answered as f64).ceil() as usize;
                    let progress = c.correct as f64 / required as f64;
                    r.next_level_accuracy = Some(c.correct as f64 / c.answered as f64);
                    r.required_correct = Some(required);
                    r.placement_progress = Some(progress);
                    r.display_position = Some((i + 1) as f64 + progress);
                    r.progress_status = "measured".into();
                }
            }
        }
    }
    r
}
pub fn overall(skills: &BTreeMap<String, SkillResult>, policy: &Policy, cfg: &Config) -> Overall {
    let ranks: Option<Vec<_>> = policy
        .included_skills
        .iter()
        .map(|s| skills.get(s).and_then(|r| r.rank))
        .collect();
    match ranks {
        Some(ranks) if !ranks.is_empty() => {
            let mean = ranks.iter().sum::<usize>() as f64 / ranks.len() as f64;
            Overall {
                status: "available".into(),
                mean_rank: Some(mean),
                category: Some(cfg.levels[(mean + 0.5).floor() as usize - 1].clone()),
            }
        }
        _ => Overall {
            status: "unavailable".into(),
            mean_rank: None,
            category: None,
        },
    }
}
pub fn score(a: &Attempt) -> Results {
    let skills: BTreeMap<_, _> = a
        .scoring_policy
        .included_skills
        .iter()
        .map(|skill| {
            let mut evidence = BTreeMap::<String, Counts>::new();
            for i in a
                .blocks
                .iter()
                .filter(|b| b.submitted_at.is_some())
                .flat_map(|b| &b.items)
                .filter(|i| &i.skill == skill)
            {
                let c = evidence
                    .entry(i.administered_difficulty.clone())
                    .or_default();
                c.answered += 1;
                c.correct += usize::from(i.correct == Some(true));
            }
            (skill.clone(), placement(evidence, &a.config))
        })
        .collect();
    Results {
        overall: overall(&skills, &a.scoring_policy, &a.config),
        skills,
    }
}

/// Never expose answer keys, previous-block correctness or explanations during a test.
pub fn public_view(a: &Attempt) -> serde_json::Value {
    if a.status == "completed" {
        return serde_json::to_value(a).expect("serializable attempt");
    }
    let b = a.blocks.last().expect("issued block");
    serde_json::json!({ "id": a.id, "userId": a.user_id, "language": a.language,
        "status": a.status, "config": a.config, "scoringPolicy": a.scoring_policy,
        "block": { "index": b.index, "items": b.items.iter().map(|i| serde_json::json!({
            "id": i.question.id, "skill": i.skill, "prompt": i.question.prompt, "passage": i.passage,
            "options": i.displayed_option_order.iter().map(|id| i.question.options.iter().find(|o| &o.id == id).unwrap()).collect::<Vec<_>>()
        })).collect::<Vec<_>>() } })
}
