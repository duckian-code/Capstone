use super::*;
use engine::*;
const ID: &str = "00000000-0000-4000-8000-000000000001";
const OTHER_ID: &str = "00000000-0000-4000-8000-000000000002";
fn evidence(rows: &[(&str, usize, usize)]) -> BTreeMap<String, Counts> {
    rows.iter()
        .map(|(l, c, a)| {
            (
                l.to_string(),
                Counts {
                    correct: *c,
                    answered: *a,
                },
            )
        })
        .collect()
}
fn answers_for(a: &Attempt, correct_by_skill: [usize; 3]) -> Answers {
    let b = a.blocks.last().unwrap();
    let mut counts = BTreeMap::<&str, usize>::new();
    b.items
        .iter()
        .map(|i| {
            let skill_index = a
                .scoring_policy
                .included_skills
                .iter()
                .position(|s| s == &i.skill)
                .unwrap();
            let count = counts.entry(&i.skill).or_default();
            let id = if *count < correct_by_skill[skill_index] {
                i.question.correct_option_id.clone()
            } else {
                i.question
                    .options
                    .iter()
                    .find(|o| o.id != i.question.correct_option_id)
                    .unwrap()
                    .id
                    .clone()
            };
            *count += 1;
            (i.question.id.clone(), id)
        })
        .collect()
}
fn attempt() -> Attempt {
    let banks = banks().unwrap();
    let mut a = Attempt::new(ID.into(), "alice".into(), now(), &banks).unwrap();
    a.next_block(&banks, &Seen::new(), now()).unwrap();
    a
}
#[test]
fn routing_boundaries_and_clamps() {
    let c = config();
    assert_eq!(route("B1", 49, 100, &c), "A2");
    assert_eq!(route("B1", 50, 100, &c), "B1");
    assert_eq!(route("B1", 74, 100, &c), "B1");
    assert_eq!(route("B1", 75, 100, &c), "B2");
    assert_eq!(route("A1", 0, 4, &c), "A1");
    assert_eq!(route("C1", 4, 4, &c), "C1");
}
#[test]
fn bank_validation_checks_routes_and_associations() {
    let b = banks().unwrap();
    validate(&b, &config(), &policy()).unwrap();
    assert!(
        b.iter()
            .flat_map(|b| &b.questions)
            .all(|q| q.status == "draft")
    );
    let mut broken = b.clone();
    broken[0]
        .questions
        .retain(|q| q.level != "B1" || q.id.ends_with("001"));
    assert!(validate(&broken, &config(), &policy()).is_err());
    let mut broken = b.clone();
    broken[0].questions[0].passage_version = Some(999);
    assert!(validate(&broken, &config(), &policy()).is_err());
    let mut broken = b.clone();
    broken[1].questions[0].options[1].id = "opt-1".into();
    assert!(validate(&broken, &config(), &policy()).is_err());
    let mut c = config();
    c.questions_per_skill = 5;
    assert!(validate(&b, &c, &policy()).is_err()); // staying at B1 requires 15
    c.questions_per_skill = 3;
    validate(&b, &c, &policy()).unwrap();
}
#[test]
fn independent_routing_stops_after_three_and_never_repeats() {
    let b = banks().unwrap();
    let mut a = attempt();
    a.submit(0, &answers_for(&a, [1, 2, 3]), now()).unwrap();
    a.next_block(&b, &Seen::new(), now()).unwrap();
    for (skill, level) in [("reading", "A2"), ("vocabulary", "B1"), ("grammar", "B2")] {
        assert!(
            a.blocks[1]
                .items
                .iter()
                .filter(|i| i.skill == skill)
                .all(|i| i.administered_difficulty == level)
        );
    }
    a.submit(1, &answers_for(&a, [0, 2, 4]), now()).unwrap();
    a.next_block(&b, &Seen::new(), now()).unwrap();
    assert_eq!(a.blocks[2].items[0].administered_difficulty, "A1");
    assert_eq!(a.blocks[2].items[8].administered_difficulty, "C1");
    a.submit(2, &answers_for(&a, [4, 4, 4]), now()).unwrap();
    assert_eq!(a.status, "completed");
    assert!(a.next_block(&b, &Seen::new(), now()).is_err());
    let ids: std::collections::BTreeSet<_> = a
        .blocks
        .iter()
        .flat_map(|b| &b.items)
        .map(|i| &i.question.id)
        .collect();
    assert_eq!(ids.len(), 36);
    assert_eq!(
        a.results.as_ref().unwrap().skills["reading"]
            .category
            .as_deref(),
        Some("A1")
    );
    assert_eq!(
        a.results.as_ref().unwrap().skills["grammar"]
            .category
            .as_deref(),
        Some("C1")
    );
    // Final vocabulary block routes upward, but only B1 was tested and qualifies.
    assert_eq!(
        a.results.as_ref().unwrap().skills["vocabulary"].category,
        None
    ); // 2+2+4=8/12, below 75%
}
#[test]
fn final_block_route_does_not_award_untested_level() {
    let mut a = attempt();
    let b = banks().unwrap();
    for block in 0..3 {
        a.submit(
            block,
            &answers_for(&a, if block < 2 { [0; 3] } else { [4; 3] }),
            now(),
        )
            .unwrap();
        if block < 2 {
            a.next_block(&b, &Seen::new(), now()).unwrap();
        }
    }
    for result in a.results.unwrap().skills.values() {
        assert_eq!(result.category.as_deref(), Some("A1"));
    }
}
#[test]
fn repeated_visits_aggregate_and_highest_qualified_wins() {
    let mut a = attempt();
    let b = banks().unwrap();
    for (block, correct) in [4, 0, 2].into_iter().enumerate() {
        a.submit(block, &answers_for(&a, [correct; 3]), now())
            .unwrap();
        if block < 2 {
            a.next_block(&b, &Seen::new(), now()).unwrap();
        }
    }
    let r = &a.results.as_ref().unwrap().skills["reading"];
    assert_eq!(r.evidence["B1"].correct, 6);
    assert_eq!(r.evidence["B1"].answered, 8);
    assert_eq!(r.category.as_deref(), Some("B1"));
    assert_eq!(r.placement_progress, Some(0.0));
    let r = placement(
        evidence(&[("A2", 3, 4), ("B2", 3, 4), ("C1", 2, 4)]),
        &config(),
    );
    assert_eq!(r.category.as_deref(), Some("B2"));
    assert_eq!(
        placement(evidence(&[("B1", 2, 4)]), &config()).category,
        None
    );
    assert_eq!(
        placement(evidence(&[("C1", 3, 3)]), &config()).category,
        None
    );
}
#[test]
fn progress_example_missing_zero_ceiling_and_reclassification() {
    let cfg = config();
    let r = placement(evidence(&[("B1", 3, 4), ("B2", 5, 8)]), &cfg);
    assert_eq!(r.next_level_accuracy, Some(0.625));
    assert_eq!(r.required_correct, Some(6));
    assert!((r.placement_progress.unwrap() - 5.0 / 6.0).abs() < 1e-10);
    assert!((r.display_position.unwrap() - (3.0 + 5.0 / 6.0)).abs() < 1e-10);
    for rows in [vec![("B1", 3, 4)], vec![("B1", 3, 4), ("B2", 0, 3)]] {
        let r = placement(evidence(&rows), &cfg);
        assert_eq!(r.progress_status, "not_assessed");
        assert_eq!(r.placement_progress, None);
        assert_eq!(r.display_position, None);
    }
    let r = placement(evidence(&[("B1", 3, 4), ("B2", 0, 4)]), &cfg);
    assert_eq!(r.progress_status, "measured");
    assert_eq!(r.placement_progress, Some(0.0));
    let r = placement(evidence(&[("B1", 3, 4), ("B2", 6, 8)]), &cfg);
    assert_eq!(r.category.as_deref(), Some("B2"));
    assert_eq!(r.next_level.as_deref(), Some("C1"));
    let r = placement(evidence(&[("C1", 3, 4)]), &cfg);
    assert_eq!(r.progress_status, "ceiling");
    assert_eq!(r.display_position, Some(5.0));
}
#[test]
fn overall_uses_equal_category_ranks_and_rounds_half_up() {
    let cfg = config();
    let p = policy();
    for (levels, expected, mean) in [
        (["A1", "A2", "A2"], "A2", 5.0 / 3.0),
        (["B1", "B2", "B2"], "B2", 11.0 / 3.0),
        (["B2", "B1", "A2"], "B1", 3.0),
    ] {
        let skills = p
            .included_skills
            .iter()
            .zip(levels)
            .map(|(s, l)| (s.clone(), placement(evidence(&[(l, 3, 4)]), &cfg)))
            .collect();
        let r = overall(&skills, &p, &cfg);
        assert_eq!(r.category.as_deref(), Some(expected));
        assert_eq!(r.mean_rank, Some(mean));
    }
    let mut skills: BTreeMap<_, _> = p
        .included_skills
        .iter()
        .map(|s| {
            (
                s.clone(),
                placement(evidence(&[("B1", 3, 4), ("B2", 2, 4)]), &cfg),
            )
        })
        .collect();
    assert_eq!(overall(&skills, &p, &cfg).mean_rank, Some(3.0)); // ignore progress positions
    skills.insert("reading".into(), placement(evidence(&[("B1", 0, 4)]), &cfg));
    assert_eq!(overall(&skills, &p, &cfg).status, "unavailable");
    let mut future = p.clone();
    future.included_skills = vec!["reading".into(), "grammar".into()];
    skills.insert("reading".into(), placement(evidence(&[("B2", 3, 4)]), &cfg));
    assert_eq!(
        overall(&skills, &future, &cfg).category.as_deref(),
        Some("B2")
    ); // 3.5 -> 4
}
#[test]
fn selection_prefers_unseen_then_oldest_and_preserves_passages() {
    let b = banks().unwrap();
    let mut seen = Seen::new();
    for bank in &b {
        for (i, q) in bank
            .questions
            .iter()
            .filter(|q| q.level == "B1")
            .enumerate()
        {
            if i >= 4 {
                seen.insert(
                    (bank.bank_id.clone(), q.id.clone()),
                    format!("2026-01-{:02}", i),
                );
            }
        }
    }
    let mut a = Attempt::new(ID.into(), "alice".into(), now(), &b).unwrap();
    a.next_block(&b, &seen, now()).unwrap();
    assert!(
        a.blocks[0]
            .items
            .iter()
            .all(|i| !seen.contains_key(&(i.bank_id.clone(), i.question.id.clone())))
    );
    for i in &a.blocks[0].items {
        if i.skill == "reading" {
            assert_eq!(
                i.question.passage_id.as_ref(),
                i.passage.as_ref().map(|p| &p.id)
            );
        }
        let order: std::collections::BTreeSet<_> = i.displayed_option_order.iter().collect();
        assert_eq!(order.len(), i.question.options.len());
        assert!(order.contains(&i.question.correct_option_id));
    }
    // Make all seen and verify the four oldest are selected per skill.
    for bank in &b {
        for (i, q) in bank
            .questions
            .iter()
            .filter(|q| q.level == "B1")
            .enumerate()
        {
            seen.insert(
                (bank.bank_id.clone(), q.id.clone()),
                format!("2026-01-{:02}", i + 1),
            );
        }
    }
    let mut a = Attempt::new(ID.into(), "alice".into(), now(), &b).unwrap();
    a.next_block(&b, &seen, now()).unwrap();
    assert!(
        a.blocks[0]
            .items
            .iter()
            .all(|i| seen[&(i.bank_id.clone(), i.question.id.clone())] <= "2026-01-04".to_owned())
    );
}
#[test]
fn grading_is_by_id_blocks_lock_and_keys_are_hidden() {
    let mut a = attempt();
    for i in &mut a.blocks[0].items {
        i.displayed_option_order.reverse();
    }
    let json = public_view(&a).to_string();
    assert!(!json.contains("correctOptionId"));
    assert!(!json.contains("explanation"));
    let good = answers_for(&a, [4; 3]);
    let wrong = answers_for(&a, [0; 3]);
    let mut incomplete = good.clone();
    incomplete.pop_first();
    assert!(a.submit(0, &incomplete, now()).is_err());
    let mut invalid = good.clone();
    *invalid.values_mut().next().unwrap() = "bad-id".into();
    assert!(a.submit(0, &invalid, now()).is_err());
    a.submit(0, &good, now()).unwrap();
    assert!(a.blocks[0].items.iter().all(|i| i.correct == Some(true)));
    a.submit(0, &good, now()).unwrap();
    assert!(a.submit(0, &wrong, now()).is_err());
}
async fn db(url: &str) -> SqlitePool {
    sqlx::sqlite::SqlitePoolOptions::new()
        .max_connections(1)
        .connect(url)
        .await
        .unwrap()
}
async fn schema(pool: &SqlitePool) {
    sqlx::raw_sql("PRAGMA foreign_keys=ON; CREATE TABLE users(id TEXT PRIMARY KEY); CREATE TABLE app_state(id INTEGER PRIMARY KEY, active_user_id TEXT REFERENCES users(id)); INSERT INTO users VALUES('alice'),('bob'); INSERT INTO app_state VALUES(1,'alice');").execute(pool).await.unwrap();
    sqlx::raw_sql(include_str!(
        "../../../migrations/0017_proficiency_assessments.sql"
    ))
        .execute(pool)
        .await
        .unwrap();
}
fn runtime() -> tokio::runtime::Runtime {
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .unwrap()
}
#[test]
fn atomic_completion_retries_failure_and_restart_snapshots() {
    runtime().block_on(async {
        let path=std::env::temp_dir().join(format!("causerie-assessment-{}-{}.db",std::process::id(),chrono::Utc::now().timestamp_nanos_opt().unwrap()));
        let url=format!("sqlite:{}?mode=rwc",path.display());
        let pool=db(&url).await; schema(&pool).await; let state=AssessmentState::default();
        let first=start(&pool,&state,"alice",ID).await.unwrap();
        assert_eq!(first,start(&pool,&state,"alice",ID).await.unwrap());
        assert!(start(&pool,&state,"alice",OTHER_ID).await.is_err());
        let mut final_answers=Answers::new();
        for index in 0..3 {
            let a=state.0.lock().await[ID].clone(); let answers=answers_for(&a,[4;3]);
            if index==2 {
                final_answers=answers.clone();
                sqlx::raw_sql("CREATE TRIGGER reject_assessment BEFORE INSERT ON proficiency_assessments BEGIN SELECT RAISE(ABORT,'simulated failure'); END;").execute(&pool).await.unwrap();
                assert!(submit(&pool,&state,"alice",ID,index,answers.clone()).await.is_err());
                assert!(state.0.lock().await[ID].blocks[2].submitted_at.is_none());
                let n:i64=sqlx::query_scalar("SELECT COUNT(*) FROM proficiency_assessments").fetch_one(&pool).await.unwrap(); assert_eq!(n,0);
                sqlx::raw_sql("DROP TRIGGER reject_assessment").execute(&pool).await.unwrap();
            }
            let result=submit(&pool,&state,"alice",ID,index,answers.clone()).await.unwrap();
            assert_eq!(result,submit(&pool,&state,"alice",ID,index,answers).await.unwrap());
        }
        let n:i64=sqlx::query_scalar("SELECT COUNT(*) FROM proficiency_assessments").fetch_one(&pool).await.unwrap(); assert_eq!(n,1);
        let original:String=sqlx::query_scalar("SELECT record_json FROM proficiency_assessments").fetch_one(&pool).await.unwrap();
        pool.close().await;
        let pool=db(&url).await; let restarted=AssessmentState::default();
        let result=submit(&pool,&restarted,"alice",ID,2,final_answers).await.unwrap();
        assert_eq!(result,serde_json::from_str::<serde_json::Value>(&original).unwrap());
        let record:Attempt=serde_json::from_str(&original).unwrap();
        assert_eq!(record.blocks.len(),3); assert!(record.results.is_some());
        let mut changed_banks=banks().unwrap(); changed_banks[0].questions[0].prompt="changed".into();
        assert_eq!(start(&pool,&restarted,"alice",ID).await.unwrap(),result); // no bank-dependent review
        let mut changed_policy=record.scoring_policy.clone(); changed_policy.included_skills.push("writing".into());
        assert_eq!(record.scoring_policy.included_skills.len(),3);
        sqlx::query("UPDATE app_state SET active_user_id='bob'").execute(&pool).await.unwrap();
        assert!(start(&pool,&restarted,"alice",ID).await.is_err());
        let mut tx=pool.begin().await.unwrap(); assert!(saved(&mut tx,"bob",ID).await.unwrap().is_none()); tx.rollback().await.unwrap();
        pool.close().await; let _=std::fs::remove_file(path);
    });
}
#[test]
fn exposure_survives_discard_and_profiles_are_isolated() {
    runtime().block_on(async {
        let pool = db("sqlite::memory:").await;
        schema(&pool).await;
        let state = AssessmentState::default();
        start(&pool, &state, "alice", ID).await.unwrap();
        let old = state.0.lock().await.remove(ID).unwrap(); // same operation as cancellation
        start(&pool, &state, "alice", OTHER_ID).await.unwrap();
        let next = state.0.lock().await[OTHER_ID].clone();
        assert!(next.blocks[0].items.iter().all(|i| {
            !old.blocks[0]
                .items
                .iter()
                .any(|j| j.question.id == i.question.id)
        }));
        let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM proficiency_assessments")
            .fetch_one(&pool)
            .await
            .unwrap();
        assert_eq!(count, 0);
        sqlx::query("UPDATE app_state SET active_user_id='bob'")
            .execute(&pool)
            .await
            .unwrap();
        assert!(
            submit(
                &pool,
                &state,
                "alice",
                OTHER_ID,
                0,
                answers_for(&next, [4; 3])
            )
                .await
                .is_err()
        );
        assert!(start(&pool, &state, "bob", OTHER_ID).await.is_err());
        let mut tx = pool.begin().await.unwrap();
        assert!(seen(&mut tx, "bob").await.unwrap().is_empty());
        tx.rollback().await.unwrap();
        let restarted = AssessmentState::default();
        assert!(
            submit(
                &pool,
                &restarted,
                "bob",
                OTHER_ID,
                0,
                answers_for(&next, [4; 3])
            )
                .await
                .is_err()
        );
    });
}

/// The user's reported result: reading established; vocabulary and grammar drop to A2.
fn reported_attempt() -> Attempt {
    let mut a = attempt();
    let banks = banks().unwrap();
    for (index, correct) in [[3, 4, 2], [2, 1, 2], [0, 1, 0]].into_iter().enumerate() {
        a.submit(index, &answers_for(&a, correct), now()).unwrap();
        if index < 2 {
            a.next_block(&banks, &Seen::new(), now()).unwrap();
        }
    }
    a
}

#[test]
fn reported_scores_get_a2_followups_only_for_unplaced_skills() {
    let mut a = reported_attempt();
    let banks = banks().unwrap();
    assert_eq!(a.status, "in_progress");
    assert!(a.results.is_none());
    assert_eq!(a.follow_up_skills, ["vocabulary", "grammar"]);
    let original_reading = serde_json::to_value(&score(&a).skills["reading"]).unwrap();
    a.next_block(&banks, &Seen::new(), now()).unwrap();
    assert_eq!(a.blocks[3].phase, "follow_up");
    assert_eq!(a.blocks[3].items.len(), 8);
    assert!(
        a.blocks[3]
            .items
            .iter()
            .all(|i| i.skill != "reading" && i.administered_difficulty == "A2")
    );
    let view = public_view(&a);
    assert_eq!(view["answeredQuestionCount"], 36);
    assert_eq!(view["block"]["phase"], "follow_up");
    assert!(!view.to_string().contains("correctOptionId"));
    a.submit(3, &answers_for(&a, [0, 3, 2]), now()).unwrap();
    assert_eq!(a.status, "in_progress");
    a.next_block(&banks, &Seen::new(), now()).unwrap();
    assert_eq!(a.blocks[4].items.len(), 4);
    assert!(
        a.blocks[4]
            .items
            .iter()
            .all(|i| i.skill == "grammar" && i.administered_difficulty == "A2")
    );
    a.submit(4, &answers_for(&a, [0, 0, 4]), now()).unwrap();
    assert_eq!(a.status, "completed");
    let results = a.results.as_ref().unwrap();
    assert_eq!(
        serde_json::to_value(&results.skills["reading"]).unwrap(),
        original_reading
    );
    assert_eq!(results.skills["vocabulary"].category.as_deref(), Some("A2"));
    assert_eq!(results.skills["grammar"].category.as_deref(), Some("A2"));
    assert_eq!(results.skills["grammar"].evidence["A2"].correct, 6);
    assert_eq!(results.skills["grammar"].evidence["A2"].answered, 8);
    assert_eq!(results.overall.category.as_deref(), Some("A2"));
    assert_eq!(results.overall.mean_rank, Some(7.0 / 3.0));
    assert_eq!(a.blocks.iter().map(|b| b.items.len()).sum::<usize>(), 48);
}

#[test]
fn followups_can_drop_again_and_stop_only_on_tested_evidence() {
    let mut a = reported_attempt();
    let banks = banks().unwrap();
    a.next_block(&banks, &Seen::new(), now()).unwrap();
    a.submit(3, &answers_for(&a, [0, 0, 0]), now()).unwrap();
    assert_eq!(a.status, "in_progress");
    assert!(score(&a).skills["grammar"].category.is_none());
    a.next_block(&banks, &Seen::new(), now()).unwrap();
    assert!(
        a.blocks[4]
            .items
            .iter()
            .all(|i| i.administered_difficulty == "A1")
    );
    a.submit(4, &answers_for(&a, [0, 3, 3]), now()).unwrap();
    assert_eq!(a.status, "completed");
    assert_eq!(
        a.results.as_ref().unwrap().skills["grammar"]
            .category
            .as_deref(),
        Some("A1")
    );
}

#[test]
fn no_followup_without_final_drop_and_no_followup_for_placed_skills() {
    let banks = banks().unwrap();
    let mut a = attempt();
    for index in 0..3 {
        a.submit(index, &answers_for(&a, [2; 3]), now()).unwrap();
        if index < 2 {
            a.next_block(&banks, &Seen::new(), now()).unwrap();
        }
    }
    assert_eq!(a.status, "completed"); // B1 50% stayed at B1, so the requested drop trigger did not fire.
    assert!(a.follow_up_skills.is_empty());
    assert_eq!(a.results.unwrap().overall.status, "unavailable");
    let mut a = attempt();
    for (index, correct) in [4, 2, 0].into_iter().enumerate() {
        a.submit(index, &answers_for(&a, [correct; 3]), now())
            .unwrap();
        if index < 2 {
            a.next_block(&banks, &Seen::new(), now()).unwrap();
        }
    }
    assert_eq!(a.status, "completed");
    assert!(a.follow_up_skills.is_empty()); // All three still have an established B1.
}

#[test]
fn exhaustion_uses_remaining_levels_and_preserves_unestablished_results() {
    let mut a = reported_attempt();
    let banks = banks().unwrap();
    let mut iterations = 0;
    while a.status != "completed" {
        a.next_block(&banks, &Seen::new(), now()).unwrap();
        if a.status == "completed" {
            break;
        }
        let index = a.blocks.len() - 1;
        a.submit(index, &answers_for(&a, [0; 3]), now()).unwrap();
        iterations += 1;
        assert!(
            iterations <= 30,
            "follow-ups must terminate with finite banks"
        );
    }
    assert_eq!(a.exhausted_skills, ["vocabulary", "grammar"]);
    assert_eq!(a.results.as_ref().unwrap().overall.status, "unavailable");
    for skill in ["vocabulary", "grammar"] {
        let r = &a.results.as_ref().unwrap().skills[skill];
        assert!(r.category.is_none());
        for level in LEVELS {
            assert_eq!(r.evidence[level].answered, 12);
        }
    }
    let ids: std::collections::BTreeSet<_> = a
        .blocks
        .iter()
        .flat_map(|b| &b.items)
        .map(|i| &i.question.id)
        .collect();
    assert_eq!(ids.len(), 132);
    assert_eq!(
        a.blocks.iter().map(|b| b.items.len()).sum::<usize>(),
        ids.len()
    );
    assert!(a.blocks.iter().all(|b| !b.items.is_empty()));
}

#[test]
fn one_exhausted_skill_does_not_prevent_other_followups() {
    let mut a = reported_attempt();
    let mut banks = banks().unwrap();
    // Simulate no unused grammar questions; vocabulary still has its full bank.
    let used: std::collections::BTreeSet<_> = a
        .blocks
        .iter()
        .flat_map(|b| &b.items)
        .map(|i| i.question.id.clone())
        .collect();
    banks
        .iter_mut()
        .find(|b| b.skill == "grammar")
        .unwrap()
        .questions
        .retain(|q| used.contains(&q.id));
    a.next_block(&banks, &Seen::new(), now()).unwrap();
    assert_eq!(a.exhausted_skills, ["grammar"]);
    assert_eq!(a.blocks[3].items.len(), 4);
    assert!(a.blocks[3].items.iter().all(|i| i.skill == "vocabulary"));
    a.submit(3, &answers_for(&a, [0, 3, 0]), now()).unwrap();
    assert_eq!(a.status, "completed");
    assert_eq!(
        a.results.as_ref().unwrap().skills["vocabulary"]
            .category
            .as_deref(),
        Some("A2")
    );
    assert_eq!(a.results.as_ref().unwrap().overall.status, "unavailable");
}

#[test]
fn legacy_records_keep_their_policy_and_results() {
    let mut a = attempt();
    let banks = banks().unwrap();
    a.config.follow_up = None;
    a.schema_version = 1;
    a.scoring_policy.version = "fr-wave1-equal-category-ranks-v1".into();
    for (index, correct) in [[3, 4, 2], [2, 1, 2], [0, 1, 0]].into_iter().enumerate() {
        a.submit(index, &answers_for(&a, correct), now()).unwrap();
        if index < 2 {
            a.next_block(&banks, &Seen::new(), now()).unwrap();
        }
    }
    assert_eq!(a.status, "completed");
    let original_results = serde_json::to_value(&a.results).unwrap();
    let mut json = serde_json::to_value(&a).unwrap();
    json.as_object_mut().unwrap().remove("followUpSkills");
    json.as_object_mut().unwrap().remove("exhaustedSkills");
    for b in json["blocks"].as_array_mut().unwrap() {
        b.as_object_mut().unwrap().remove("phase");
    }
    let mut historic: Attempt = serde_json::from_value(json).unwrap();
    assert!(historic.config.follow_up.is_none());
    assert_eq!(
        historic.scoring_policy.version,
        "fr-wave1-equal-category-ranks-v1"
    );
    assert_eq!(historic.blocks[0].phase, "main");
    historic
        .submit(2, &answers_for(&historic, [0, 1, 0]), now())
        .unwrap();
    assert_eq!(
        serde_json::to_value(&historic.results).unwrap(),
        original_results
    );
    assert_eq!(historic.blocks.len(), 3);
}

#[test]
fn followup_completion_is_atomic_retryable_and_survives_restart() {
    runtime().block_on(async {
        let pool = db("sqlite::memory:").await; schema(&pool).await;
        let state = AssessmentState::default();
        start(&pool, &state, "alice", ID).await.unwrap();
        for (index, correct) in [[3, 4, 2], [2, 1, 2], [0, 1, 0]].into_iter().enumerate() {
            let a = state.0.lock().await[ID].clone();
            let answers = answers_for(&a, correct);
            let response = submit(&pool, &state, "alice", ID, index, answers.clone()).await.unwrap();
            assert_eq!(response, submit(&pool, &state, "alice", ID, index, answers).await.unwrap());
        }
        let n: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM proficiency_assessments").fetch_one(&pool).await.unwrap();
        assert_eq!(n, 0);
        let a = state.0.lock().await[ID].clone();
        let answers = answers_for(&a, [0, 3, 3]);
        sqlx::raw_sql("CREATE TRIGGER reject_assessment BEFORE INSERT ON proficiency_assessments BEGIN SELECT RAISE(ABORT,'simulated failure'); END;").execute(&pool).await.unwrap();
        assert!(submit(&pool, &state, "alice", ID, 3, answers.clone()).await.is_err());
        assert!(state.0.lock().await[ID].blocks[3].submitted_at.is_none());
        sqlx::raw_sql("DROP TRIGGER reject_assessment").execute(&pool).await.unwrap();
        let result = submit(&pool, &state, "alice", ID, 3, answers.clone()).await.unwrap();
        assert_eq!(result["status"], "completed");
        assert_eq!(result["blocks"].as_array().unwrap().len(), 4);
        let restarted = AssessmentState::default();
        assert_eq!(result, submit(&pool, &restarted, "alice", ID, 3, answers).await.unwrap());
        let n: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM proficiency_assessments").fetch_one(&pool).await.unwrap();
        assert_eq!(n, 1);
    });
}

#[test]
fn exhaustion_completion_is_saved_without_issuing_an_empty_block() {
    runtime().block_on(async {
        let pool = db("sqlite::memory:").await;
        schema(&pool).await;
        let state = AssessmentState::default();
        start(&pool, &state, "alice", ID).await.unwrap();
        for (index, correct) in [[3, 4, 2], [2, 1, 2], [0, 1, 0]].into_iter().enumerate() {
            let a = state.0.lock().await[ID].clone();
            submit(&pool, &state, "alice", ID, index, answers_for(&a, correct))
                .await
                .unwrap();
        }
        let result = loop {
            let a = state.0.lock().await[ID].clone();
            let index = a.blocks.len() - 1;
            assert!(index < 30);
            let answers = answers_for(&a, [0; 3]);
            let response = submit(&pool, &state, "alice", ID, index, answers.clone())
                .await
                .unwrap();
            assert_eq!(
                response,
                submit(&pool, &state, "alice", ID, index, answers)
                    .await
                    .unwrap()
            );
            if response["status"] == "completed" {
                break response;
            }
        };
        assert_eq!(result["exhaustedSkills"].as_array().unwrap().len(), 2);
        assert_eq!(result["results"]["overall"]["status"], "unavailable");
        assert!(
            result["blocks"]
                .as_array()
                .unwrap()
                .iter()
                .all(|b| !b["items"].as_array().unwrap().is_empty())
        );
        let n: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM proficiency_assessments")
            .fetch_one(&pool)
            .await
            .unwrap();
        assert_eq!(n, 1);
    });
}

#[test]
fn difficulty_skip_scores_category_incorrect_and_drops_one_level() {
    let mut a = attempt();

    // Verify the explicit skip does not depend on the ordinary threshold.
    a.config.decrease_below = 0.0;

    let mut answers = answers_for(&a, [4, 4, 4]);
    for item in &a.blocks[0].items {
        if item.skill == "reading" {
            answers.insert(
                item.question.id.clone(),
                TOO_DIFFICULT_ANSWER.into(),
            );
        }
    }

    a.submit(0, &answers, now()).unwrap();

    assert!(a.blocks[0].items.iter()
        .filter(|item| item.skill == "reading")
        .all(|item| item.correct == Some(false)));

    assert!(a.blocks[0].items.iter()
        .filter(|item| item.skill != "reading")
        .all(|item| item.correct == Some(true)));

    // Identical retries also work after serialization.
    let json = serde_json::to_string(&a).unwrap();
    let mut restored: Attempt = serde_json::from_str(&json).unwrap();
    restored.submit(0, &answers, now()).unwrap();

    restored.next_block(&banks().unwrap(), &Seen::new(), now()).unwrap();

    assert!(restored.blocks[1].items.iter()
        .filter(|item| item.skill == "reading")
        .all(|item| item.administered_difficulty == "A2"));

    assert!(restored.blocks[1].items.iter()
        .filter(|item| item.skill != "reading")
        .all(|item| item.administered_difficulty == "B2"));
}

#[test]
fn difficulty_skip_rejects_partial_category_without_mutation() {
    let mut a = attempt();
    let mut answers = answers_for(&a, [4, 4, 4]);
    let question_id = a.blocks[0].items[0].question.id.clone();

    answers.insert(question_id, TOO_DIFFICULT_ANSWER.into());

    let before = serde_json::to_value(&a).unwrap();
    assert!(a.submit(0, &answers, now()).is_err());
    assert_eq!(before, serde_json::to_value(&a).unwrap());
}

#[test]
fn difficulty_skip_stops_at_a1() {
    let mut a = attempt();
    let bank_data = banks().unwrap();

    for index in 0..3 {
        let answers: Answers = a.blocks[index].items.iter()
            .map(|item| (
                item.question.id.clone(),
                TOO_DIFFICULT_ANSWER.into(),
            ))
            .collect();

        a.submit(index, &answers, now()).unwrap();

        if index < 2 {
            a.next_block(&bank_data, &Seen::new(), now()).unwrap();
        }
    }

    assert!(a.blocks[1].items.iter()
        .all(|item| item.administered_difficulty == "A2"));
    assert!(a.blocks[2].items.iter()
        .all(|item| item.administered_difficulty == "A1"));
    assert_eq!(a.status, "completed");
}