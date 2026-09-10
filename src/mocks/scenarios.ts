export const SCENARIOS = ["default", "payment_refused"] as const;
export type ScenarioName = (typeof SCENARIOS)[number];

const STORAGE_KEY = "kurio.mock.scenario";
let activeScenario: ScenarioName = "default";

export function getActiveScenario(): ScenarioName {
  return activeScenario;
}

export function setActiveScenario(scenario: ScenarioName) {
  activeScenario = scenario;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, scenario);
  }
}

export function loadPersistedScenario() {
  if (typeof window === "undefined") return;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && (SCENARIOS as readonly string[]).includes(stored)) {
    activeScenario = stored as ScenarioName;
  }
}
