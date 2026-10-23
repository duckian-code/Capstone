export interface GoalDefinition {
    id: string;
    label: string;
    active: boolean;
}

export type GoalSlots = [
    string | null,
    string | null,
    string | null
];

export interface GoalSettings {
    catalog: GoalDefinition[];
    slots: GoalSlots;
}

export function selectedGoalLabels(settings: GoalSettings): string[] {
    return settings.slots
        .map((id) =>
            settings.catalog.find((goal) => goal.id === id)?.label)
        .filter((label): label is string => label !== undefined);
}