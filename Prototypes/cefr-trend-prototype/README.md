# CEFR placement-progress prototype

Open `index.html` in a browser for the standalone demo. The wrapper uses the visualization runtime for theme styles and controls, so an internet connection may be needed. `french-proficiency-trends.html` is the editable in-conversation fragment. Regenerate the standalone wrapper after editing the fragment.

All observations are synthetic. This version demonstrates scoring/display behavior, not the earlier three-block adaptive routing algorithm, and changes no Causerie application code.

## Demo scoring

- A level qualifies with at least four answered questions and at least 75% correct. Select the highest qualifying tested level.
- For the immediately following level, `requiredCorrect = ceil(0.75 * answered)`.
- With at least four next-level answers, `placementProgress = correct / requiredCorrect` and `position = levelRank + placementProgress` (A1=1 through C1=5).
- Crossing the threshold changes the estimated level; progress then requires evidence at the new next level.
- Absent or insufficient next-level evidence produces no fractional position. A hollow mark shows only the estimated band and breaks the progress line. This differs from an observed zero, which has a filled mark and a valid zero-progress position.
- C1 is the ceiling; no C2 estimate or progress is inferred.
- The dashed overall line averages available complete display positions with weights 25:20:20 for reading:grammar:vocabulary. It is an application display index, not a CEFR level. If any skill has unassessed next-level progress, the overall point is omitted instead of silently substituting zero or changing weights.

## Interactions

Choose a series, assessment and detail skill. The November grammar slider varies correct B2 answers from 0 to 8 while retaining B1 evidence of 3/4. It focuses the November grammar result automatically:

- 5/8: 62.5% accuracy; 83.3% toward the B2 cutoff; estimated B1.
- 6/8: 75% accuracy; B2 threshold met; estimated B2, C1 progress unassessed.

September reading demonstrates missing next-level evidence; September vocabulary demonstrates an observed 0/4 at C1. November reading demonstrates the C1 ceiling. The fictional evidence replaces the older terminal-score-only dataset because that dataset could not support next-level progress.

Validation: JavaScript syntax; all DOM references; threshold boundaries, rounding for non-divisible denominators, missing versus zero and insufficient evidence, ceiling behavior; 1,080 control combinations at each of 320px and 736px using a DOM test harness. Browser rendering has not been visually inspected.
