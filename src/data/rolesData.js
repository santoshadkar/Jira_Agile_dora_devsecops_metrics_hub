// Role Definitions and Governance Taxonomy for Jira Agile Metrics
const ROLES = [
  {
    id: "scrum-master",
    name: "Scrum Master / Agile Coach",
    badge: "SM",
    color: "#2563eb",
    icon: "ShieldAlert",
    tagline: "Team flow, sprint predictability, impediment eradication, and continuous improvement.",
    primaryFocus: "Removing friction, guarding team capacity, coaching on WIP limits, and driving retrospective insights.",
    governancePhilosophy: "Mandated metrics represent critical delivery blockers and team health indicators. Optional metrics provide deep-dive diagnostics when specific antipatterns arise."
  },
  {
    id: "product-owner",
    name: "Product Owner / Product Manager",
    badge: "PO",
    color: "#7c3aed",
    icon: "Target",
    tagline: "Value maximization, backlog readiness, scope stability, and release predictability.",
    primaryFocus: "Maintaining healthy backlog depth (Definition of Ready), monitoring epic release burnup, and controlling scope creep.",
    governancePhilosophy: "Mandated metrics ensure customer value is predictably planned, releases are on track, and post-launch defect leakage is contained."
  },
  {
    id: "developer",
    name: "Dev Team / Tech Lead / Engineers",
    badge: "DEV",
    color: "#059669",
    icon: "Code",
    tagline: "Engineering excellence, WIP control, pull-request velocity, and technical debt paydown.",
    primaryFocus: "Keeping Work Item Age low, preventing stale in-progress stories, eradicating flaky code, and addressing tech debt.",
    governancePhilosophy: "Mandated metrics protect engineers from context-switching overloads and alert on blocking dependencies before sprint deadlines."
  },
  {
    id: "qa-tester",
    name: "QA / Test Lead / Quality Analyst",
    badge: "QA",
    color: "#d97706",
    icon: "CheckCircle2",
    tagline: "Quality gating, escaped defect prevention, defect resolution speed, and test coverage.",
    primaryFocus: "Tracking P1/P2 defect backlogs, measuring defect turnaround MTTR, and auditing Definition of Done verification.",
    governancePhilosophy: "Mandated metrics serve as non-negotiable quality gates required for CAB (Change Advisory Board) release sign-off."
  },
  {
    id: "rte-delivery",
    name: "Release Train Engineer / Delivery Mgr",
    badge: "RTE",
    color: "#dc2626",
    icon: "Layers",
    tagline: "Cross-team synchronization, ART predictability, dependency management, and PI delivery.",
    primaryFocus: "Ensuring Program Increment (PI) objectives track to completion and resolving inter-team blockers.",
    governancePhilosophy: "Mandated metrics govern Agile Release Train synchronization, program-level risk mitigation, and enterprise compliance."
  },
  {
    id: "executive",
    name: "Executive Leadership / PMO / Business Owner",
    badge: "EXEC",
    color: "#0891b2",
    icon: "TrendingUp",
    tagline: "Strategic portfolio alignment, time-to-market, capital efficiency, and customer satisfaction.",
    primaryFocus: "Macro-level business value delivery, predictable release dates, and risk containment across portfolios.",
    governancePhilosophy: "Mandated metrics focus exclusively on outcomes, portfolio investment return, and customer-impacting reliability."
  }
];

module.exports = { ROLES };
