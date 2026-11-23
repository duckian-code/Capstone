import type { AssessmentRecord } from './assessment';
import type { ProficiencyLevel } from './proficiency';
export function suggestedLevel(record: AssessmentRecord): ProficiencyLevel | null {
    const ranks = record.scoringPolicy.includedSkills.map(id => record.results.skills[id])
        .filter(skill => skill?.placementStatus === 'established' && skill.rank != null).map(skill => skill.rank!);
    if (!ranks.length) return null;
    return record.config.levels[Math.floor(ranks.reduce((a,b) => a+b, 0) / ranks.length + .5) - 1] ?? null;
}
export function assessmentDistribution(record: AssessmentRecord) {
    return record.config.levels.map(level => {
        const items = record.blocks.flatMap(block => block.items).filter(item => item.administeredDifficulty === level);
        const correct = items.filter(item => item.submittedOptionId === item.question.correctOptionId).length;
        return { level, total: items.length, correct, incorrect: items.length - correct };
    });
}