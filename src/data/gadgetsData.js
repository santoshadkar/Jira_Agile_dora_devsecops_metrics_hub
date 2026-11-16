// Standard Jira Dashboard Gadgets Catalog for Cloud and Data Center
const GADGETS = [
  {
    id: "filter-results",
    name: "Filter Results",
    category: "List & Action",
    compatibility: ["Cloud", "Data Center"],
    description: "Displays a customized table of Jira issues returned by a saved filter with specified columns.",
    recommendedFor: ["Blocked / Impediment Items", "Critical Defects", "Stale In-Progress Issues", "Unplanned Work"],
    configGuide: {
      step1: "Save your metric JQL query as a Jira Filter (e.g., 'SM_Active_Impediments'). Ensure filter permissions are shared with your project/board.",
      step2: "On your Dashboard, click 'Add Gadget' -> search for 'Filter Results' -> click 'Add'.",
      step3: "Select the saved filter, choose Columns to display: Key, Summary, Assignee, Priority, Status, Created, Updated.",
      step4: "Set Number of Results (default: 10 or 25) and Auto-refresh (e.g. Every 15 mins)."
    }
  },
  {
    id: "two-dimensional-filter-stats",
    name: "Two Dimensional Filter Statistics",
    category: "Matrix & Cross-Tab",
    compatibility: ["Cloud", "Data Center"],
    description: "Visualizes a two-dimensional matrix of issue counts cross-tabulating two fields (e.g., Assignee vs Status, Priority vs Component).",
    recommendedFor: ["WIP by Assignee & Status", "Defect Severity by Component", "Epic Progress by Status"],
    configGuide: {
      step1: "Create and save your filter (e.g., 'Sprint_Active_WIP').",
      step2: "Add gadget 'Two Dimensional Filter Statistics'.",
      step3: "Select Saved Filter; Set X-Axis to 'Status' or 'Status Category'; Set Y-Axis to 'Assignee' or 'Component'.",
      step4: "Set 'Show Totals' to Yes; set Number of Results: 20."
    }
  },
  {
    id: "sprint-burndown-gadget",
    name: "Sprint Burndown Gadget",
    category: "Agile Burn",
    compatibility: ["Cloud", "Data Center"],
    description: "Visualizes the remaining story points or hours in the active sprint against an ideal guideline slope.",
    recommendedFor: ["Sprint Burndown", "Mid-Sprint Trajectory"],
    configGuide: {
      step1: "Add gadget 'Sprint Burndown Gadget' (or Agile Burndown).",
      step2: "Select Board: Choose your agile Scrum board.",
      step3: "Select Sprint: Choose 'Active Sprint' (or dynamically defaults to the current open sprint).",
      step4: "Check 'Auto-refresh every 15 minutes'."
    }
  },
  {
    id: "sprint-health-gadget",
    name: "Sprint Health Gadget",
    category: "Agile Summary",
    compatibility: ["Cloud", "Data Center"],
    description: "High-level visual summary showing Time Elapsed, Work Complete %, Scope Change, and Flagged items in the active sprint.",
    recommendedFor: ["Sprint Predictability", "Say-Do Ratio", "Sprint Health Overview"],
    configGuide: {
      step1: "Add gadget 'Sprint Health Gadget'.",
      step2: "Choose your Scrum Board.",
      step3: "Save. Provides a colorful progress dial with % completed, time remaining, and warning badges."
    }
  },
  {
    id: "created-vs-resolved",
    name: "Created vs Resolved Chart",
    category: "Trend & Flow",
    compatibility: ["Cloud", "Data Center"],
    description: "Compares the incoming rate of issues created against the rate of issues resolved over a selected time horizon.",
    recommendedFor: ["Escaped Defects Trend", "Bug Arrival vs Fix Rate", "Backlog Demand vs Throughput"],
    configGuide: {
      step1: "Save filter (e.g. 'All_Bugs_Project_Alpha').",
      step2: "Add 'Created vs Resolved Chart' gadget.",
      step3: "Select Filter; Set Days Previously (e.g. 30, 60, or 90 days); Period: 'Daily' or 'Weekly'.",
      step4: "Set Cumulative: 'Yes' (to see backlog expansion/contraction) or 'No' (for arrival spikes)."
    }
  },
  {
    id: "issue-statistics",
    name: "Issue Statistics Gadget",
    category: "Distribution",
    compatibility: ["Cloud", "Data Center"],
    description: "Shows a bar chart/breakdown of issues returned by a filter grouped by a single attribute (e.g., Issue Type, Priority, Status).",
    recommendedFor: ["Defect Distribution by Severity", "Work Item Distribution by Issue Type", "Backlog Ready Breakdown"],
    configGuide: {
      step1: "Save filter for target scope.",
      step2: "Add 'Issue Statistics' gadget.",
      step3: "Select Filter; Choose Stat Type (e.g., 'Priority', 'Component', 'Status').",
      step4: "Sort Direction: Descending; Include Resolved Issues: No (if active work) or Yes (if historical)."
    }
  },
  {
    id: "average-age-chart",
    name: "Average Age Chart",
    category: "Aging & Lead Time",
    compatibility: ["Cloud", "Data Center"],
    description: "Displays the average age in days of unresolved issues over time, highlighting accumulating stagnation.",
    recommendedFor: ["Work Item Age (WIA)", "Defect Aging MTTR", "Stale Backlog Debt"],
    configGuide: {
      step1: "Save filter for unresolved issues (e.g. 'statusCategory != Done').",
      step2: "Add 'Average Age Chart' gadget.",
      step3: "Select Filter; Days Previously: 30 or 60; Period: 'Daily'.",
      step4: "Save to observe whether the age slope is climbing (bottlenecks) or declining (healthy flow)."
    }
  },
  {
    id: "pie-chart",
    name: "Pie Chart Gadget",
    category: "Visual Share",
    compatibility: ["Cloud", "Data Center"],
    description: "A clean circular breakdown displaying percentages of work items across categories.",
    recommendedFor: ["Flow Distribution (Features vs Debt vs Bugs)", "Technical Debt Share", "Sprint Goal Allocation"],
    configGuide: {
      step1: "Save filter.",
      step2: "Add 'Pie Chart' gadget.",
      step3: "Select Saved Filter and Statistic Type (e.g. 'Issue Type' or 'Custom Category').",
      step4: "Save and set auto-refresh."
    }
  },
  {
    id: "days-remaining-in-sprint",
    name: "Days Remaining in Sprint Gadget",
    category: "Agile Clock",
    compatibility: ["Cloud", "Data Center"],
    description: "Large visual indicator of sprint time remaining to keep the team conscious of the sprint boundary.",
    recommendedFor: ["Sprint Awareness", "Scrum Team Standup Board"],
    configGuide: {
      step1: "Add 'Days Remaining in Sprint Gadget'.",
      step2: "Select Board.",
      step3: "Save to place on sprint dashboard."
    }
  }
];

module.exports = { GADGETS };
