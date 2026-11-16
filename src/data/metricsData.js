// Central Catalog of Agile Metrics with Dual Jira Cloud / Data Center JQL & Role Governance Matrix
const METRICS = [
  // ==========================================
  // 1. SCRUM EXECUTION & PREDICTABILITY
  // ==========================================
  {
    id: "sprint-velocity-predictability",
    name: "Sprint Velocity & Commitment Predictability (Say-Do Ratio)",
    framework: "Scrum",
    category: "Predictability & Flow",
    purpose: "Measures the amount of work completed in story points per sprint compared to initial commitment made during Sprint Planning.",
    formula: "Say-Do Ratio (%) = (Completed Story Points / Committed Story Points) * 100",
    benchmark: "Target: 85% - 100%. Under 75% indicates over-commitment or high mid-sprint churn; Over 115% indicates severe sandbagging or runaway scope creep.",
    roles: {
      "scrum-master": {
        status: "Mandated",
        reason: "Primary health signal for team estimation accuracy, capacity planning, and sprint commitment reliability."
      },
      "product-owner": {
        status: "Mandated",
        reason: "Directly determines realistic release forecasting, feature delivery milestones, and MVP predictability."
      },
      "developer": {
        status: "Optional",
        reason: "Helps team understand sustainable pace and avoid burnout, but individual team members shouldn't be judged on velocity."
      },
      "qa-tester": {
        status: "Optional",
        reason: "Provides visibility into the volume of testing demand arriving in the latter half of the sprint."
      },
      "rte-delivery": {
        status: "Mandated",
        reason: "Aggregated normalized predictability across teams forms the ART Predictability Measure for SAFe PI objectives."
      },
      "executive": {
        status: "Mandated",
        reason: "High-level indicator of whether digital delivery commitments can be trusted by business stakeholders."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND sprint in openSprints() AND statusCategory = "Done"',
    dataCenterJql: 'project = "{{projectKey}}" AND sprint in openSprints() AND status in ("Done", "Closed", "Resolved")',
    cloudVsDcNotes: 'In Cloud, statusCategory = "Done" automatically captures any custom done status. In older Data Center versions prior to 8.x, explicitly list final status names: status in ("Done", "Closed", "Resolved") or configure status category mappings in Board Settings.',
    recommendedGadgets: [
      {
        name: "Sprint Health Gadget",
        type: "Agile Summary",
        configuration: "Select Board ID {{boardId}}. Tracks Work Complete vs Scope Change.",
        dimensions: "1/2 Column"
      },
      {
        name: "Sprint Burndown Gadget",
        type: "Burndown Chart",
        configuration: "Select Board ID {{boardId}}, Active Sprint. Shows committed vs actual burn trajectory.",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Using velocity as a performance metric to stack-rank or penalize individual engineers.",
      "Story point inflation: inflating estimates sprint-over-sprint to show artificial velocity 'growth'.",
      "Closing half-finished stories at sprint end just to hit the commitment number, creating hidden technical debt."
    ]
  },
  {
    id: "sprint-burndown-hours-points",
    name: "Sprint Burndown & Mid-Sprint Work Trajectory",
    framework: "Scrum",
    category: "Execution & WIP",
    purpose: "Tracks day-by-day remaining work in the active sprint against the ideal linear guideline to identify delays early.",
    formula: "Remaining Work = Total Committed Points - Points in 'Done' Status per day",
    benchmark: "Healthy burndown tracks closely to the ideal guideline. Plateauing in first 7 days followed by a 'cliff-dive' at sprint end indicates mini-waterfall.",
    roles: {
      "scrum-master": {
        status: "Mandated",
        reason: "Core daily standup inspection tool to catch stalled stories and organize swarming."
      },
      "product-owner": {
        status: "Optional",
        reason: "Provides early warning if lower-priority scope negotiation is required before sprint end."
      },
      "developer": {
        status: "Mandated",
        reason: "Guides daily self-organization and signals when to stop starting new work and finish existing WIP."
      },
      "qa-tester": {
        status: "Mandated",
        reason: "Warns QA of imminent testing bottleneck when development burndown is backloaded to the final 2 days."
      },
      "rte-delivery": {
        status: "Optional",
        reason: "Useful for spot-checking teams struggling with sprint stability during the PI."
      },
      "executive": {
        status: "Optional",
        reason: "Too operational for leadership; executives should inspect Release / Epic Burnup instead."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND sprint in openSprints() AND statusCategory != "Done" ORDER BY rank ASC',
    dataCenterJql: 'project = "{{projectKey}}" AND sprint in openSprints() AND status not in ("Done", "Closed", "Resolved") ORDER BY Rank ASC',
    cloudVsDcNotes: 'Cloud boards support remaining estimate updates in real-time. In Data Center, ensure Estimation Statistic (Story Points vs Original Time Estimate) in Board -> Configure -> Estimation matches team agreement.',
    recommendedGadgets: [
      {
        name: "Sprint Burndown Gadget",
        type: "Agile Burn",
        configuration: "Select Agile Scrum Board. Gadget auto-renders guidelines and event flags (scope added/removed).",
        dimensions: "Full Width or 1/2 Column"
      },
      {
        name: "Days Remaining in Sprint Gadget",
        type: "Countdown",
        configuration: "Select Agile Scrum Board. Shows remaining calendar days.",
        dimensions: "1/4 Column"
      }
    ],
    antiPatterns: [
      "Flat burndown: Stories stay 'In Progress' until the final day because stories are sized too large (> 5 days).",
      "Burndown climbing upward: Indicates continuous unplanned scope injection without team consent."
    ]
  },
  {
    id: "scope-creep-mid-sprint",
    name: "Scope Creep / Mid-Sprint Scope Churn",
    framework: "Scrum",
    category: "Execution & WIP",
    purpose: "Monitors issues and story points added to the active sprint after Sprint Planning completed.",
    formula: "Scope Churn (%) = (Story Points Added After Sprint Start / Initial Committed Points) * 100",
    benchmark: "Target: < 10% of sprint capacity. > 20% scope creep severely degrades sprint goal predictability and causes spillover.",
    roles: {
      "scrum-master": {
        status: "Mandated",
        reason: "Signals violation of sprint boundary protection; prompts coaching on backlog discipline."
      },
      "product-owner": {
        status: "Mandated",
        reason: "Enforces trade-off discussions: if new urgent work enters, equal story points must be removed."
      },
      "developer": {
        status: "Optional",
        reason: "Protects engineering focus from uncontrolled context switching and ad-hoc managerial requests."
      },
      "qa-tester": {
        status: "Optional",
        reason: "Unplanned additions frequently skip QA test planning and cause release defects."
      },
      "rte-delivery": {
        status: "Mandated",
        reason: "Tracks teams with volatile scope that threaten ART dependency delivery."
      },
      "executive": {
        status: "Optional",
        reason: "High scope churn explains why roadmaps slip despite teams working overtime."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND sprint in openSprints() AND created >= startOfDay("-{{dateWindowDays}}d") AND issueFunction in addedAfterSprintStart("{{boardId}}")',
    dataCenterJql: 'project = "{{projectKey}}" AND sprint in openSprints() AND created >= -14d AND issueFunction in addedAfterSprintStart("{{boardId}}")',
    cloudVsDcNotes: 'In Cloud without ScriptRunner/Jira Cloud plugins, use date-based filtering: "project = {{projectKey}} AND sprint in openSprints() AND created >= startOfWeek()". In DC with ScriptRunner, use issueFunction in addedAfterSprintStart() for exact sprint boundary tracking.',
    recommendedGadgets: [
      {
        name: "Filter Results",
        type: "Table List",
        configuration: "Display newly injected sprint issues sorted by Created Date DESC.",
        dimensions: "1/2 Column"
      },
      {
        name: "Two Dimensional Filter Statistics",
        type: "Matrix",
        configuration: "X-Axis: Issue Type; Y-Axis: Priority. Filter: Unplanned sprint additions.",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Adding urgent bugs directly into the active sprint without removing equivalent story points.",
      "Sneaking technical spikes into active sprints without team consensus."
    ]
  },
  {
    id: "sprint-spillover-carryover",
    name: "Sprint Spillover & Carryover Rate",
    framework: "Scrum",
    category: "Execution & WIP",
    purpose: "Measures the volume of user stories not completed within the sprint boundary and pushed to subsequent sprints.",
    formula: "Spillover Rate (%) = (Spilled Story Points / Total Sprint Scope) * 100",
    benchmark: "Target: < 10%. Consistent spillover > 20% indicates story slicing deficiencies, unmanaged dependencies, or testing bottlenecks.",
    roles: {
      "scrum-master": {
        status: "Mandated",
        reason: "Key topic for Retrospectives: why did stories stall (Definition of Done too heavy, late QA, or hidden blockers)?"
      },
      "product-owner": {
        status: "Mandated",
        reason: "Impacts release planning and stakeholder communication when commitments slide across sprints."
      },
      "developer": {
        status: "Mandated",
        reason: "Identifies oversized stories that should have been sliced into smaller thin vertical increments."
      },
      "qa-tester": {
        status: "Mandated",
        reason: "Spillover is often concentrated in 'Ready for QA' or 'In QA' states at the 11th hour."
      },
      "rte-delivery": {
        status: "Optional",
        reason: "Identifies systemic team bottlenecks that could impact PI milestone delivery."
      },
      "executive": {
        status: "Optional",
        reason: "High spillover indicates fragile predictability and compromised commitments."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND sprint in closedSprints() AND statusCategory != "Done"',
    dataCenterJql: 'project = "{{projectKey}}" AND sprint in closedSprints() AND status not in ("Done", "Closed", "Resolved")',
    cloudVsDcNotes: 'When a sprint closes in Jira, uncompleted issues are moved either to the backlog or to the next active sprint. Tracking sprint in (closedSprints()) AND sprint in (openSprints()) isolates true carryover items.',
    recommendedGadgets: [
      {
        name: "Filter Results",
        type: "Table List",
        configuration: "Filter: Issues present in both current and previous sprint. Columns: Key, Summary, Assignee, Original Estimate, Story Points.",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Renaming or extending the sprint end date just to avoid recording spillover.",
      "Splitting an unfinished story into 'Dev Done' and 'QA Done' stories to artificially claim velocity."
    ]
  },
  {
    id: "blocked-impediment-time",
    name: "Blocked / Impediment Items & Flagged Work Age",
    framework: "Hybrid",
    category: "Execution & WIP",
    purpose: "Tracks active issues that cannot progress due to external dependencies, environmental outages, or technical roadblocks.",
    formula: "Blocker Ratio (%) = (Blocked Issues / Total Active WIP) * 100; Average Blocked Time = Sum(Blocked Hours) / Blocked Issues",
    benchmark: "Target: 0 critical blockers > 24 hours. Blocker ratio should be < 5% of active sprint WIP.",
    roles: {
      "scrum-master": {
        status: "Mandated",
        reason: "Highest daily priority: Scrum Master's primary duty is unblocking the team immediately."
      },
      "product-owner": {
        status: "Optional",
        reason: "Alerts PO when blocked items require business escalation or external vendor contact."
      },
      "developer": {
        status: "Mandated",
        reason: "Prevents developers from silently remaining blocked without surfacing impediments on the board."
      },
      "qa-tester": {
        status: "Mandated",
        reason: "Quickly flags broken test environments, missing test data, or deployment delays."
      },
      "rte-delivery": {
        status: "Mandated",
        reason: "Escalates cross-team or cross-ART impediments that require management intervention."
      },
      "executive": {
        status: "Optional",
        reason: "Surfaces systemic organizational roadblocks (e.g. procurement delays, architecture approvals)."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND sprint in openSprints() AND (Flagged is not EMPTY OR status in ("Blocked", "Impediment")) ORDER BY updated ASC',
    dataCenterJql: 'project = "{{projectKey}}" AND sprint in openSprints() AND (Flagged is not EMPTY OR status in ("Blocked", "Impediment") OR cf[10100] is not EMPTY) ORDER BY updated ASC',
    cloudVsDcNotes: 'In Cloud, Jira uses the native "Flagged" field (adds a visual yellow flag and card highlight). In Data Center, some organizations use custom field "Impediment" (cf[10100]) or custom workflow status "Blocked". Verify board card colors settings.',
    recommendedGadgets: [
      {
        name: "Filter Results",
        type: "Active Blocker List",
        configuration: "Display Key, Summary, Assignee, Flagged Reason, Updated. Highlight items updated > 2 days ago in red.",
        dimensions: "Full Width"
      },
      {
        name: "Issue Statistics",
        type: "Bar Chart",
        configuration: "Filter: Blocked items. Stat Type: Assignee or Component.",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Not flagging blocked items on the Jira board and only mentioning them verbally at standup.",
      "Leaving flagged items in 'In Progress' status without pausing the cycle time clock."
    ]
  },

  // ==========================================
  // 2. KANBAN & LEAN FLOW METRICS
  // ==========================================
  {
    id: "cycle-time-percentile",
    name: "Cycle Time (85th & 95th Percentile Service Level Expectation)",
    framework: "Kanban",
    category: "Predictability & Flow",
    purpose: "Measures the elapsed calendar time from when work begins (In Progress) until it reaches Done status.",
    formula: "Cycle Time = Resolved Date - In Progress Start Date (Target: 85% completed in <= X days)",
    benchmark: "Target: 85th percentile <= 5-8 days for standard stories; <= 24 hours for Critical Bugs. Average cycle time is misleading; always use 85th/95th percentile.",
    roles: {
      "scrum-master": {
        status: "Mandated",
        reason: "Defines the team's Service Level Expectation (SLE) and uncovers workflow bottlenecks."
      },
      "product-owner": {
        status: "Mandated",
        reason: "Enables probabilistic forecasting (e.g., 'there is an 85% chance this feature ships in 7 days')."
      },
      "developer": {
        status: "Mandated",
        reason: "Encourages smaller batch sizes and prevents long-lived branches/work items."
      },
      "qa-tester": {
        status: "Optional",
        reason: "Shows QA phase duration within overall cycle time."
      },
      "rte-delivery": {
        status: "Mandated",
        reason: "Monitors flow health across all teams on the ART; high cycle times point to cross-team friction."
      },
      "executive": {
        status: "Mandated",
        reason: "The definitive measure of organizational agility: how fast an idea turns into customer value."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND statusCategory = "Done" AND resolved >= startOfDay("-{{dateWindowDays}}d") ORDER BY resolved DESC',
    dataCenterJql: 'project = "{{projectKey}}" AND status in ("Done", "Closed", "Resolved") AND resolved >= -{{dateWindowDays}}d ORDER BY resolved DESC',
    cloudVsDcNotes: 'Jira Cloud and DC provide the native "Control Chart" report on Kanban boards to visualize 85th/95th percentile cycle times. In Cloud, you can also filter by custom datetime stamps.',
    recommendedGadgets: [
      {
        name: "Average Age Chart",
        type: "Age Trend",
        configuration: "Filter: Unresolved In-Progress work. Period: Daily. Tracks whether work age is expanding.",
        dimensions: "1/2 Column"
      },
      {
        name: "Two Dimensional Filter Statistics",
        type: "Matrix",
        configuration: "X-Axis: Status; Y-Axis: Issue Type. Tracks aging concentration.",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Using mean (average) cycle time instead of 85th percentile, which hides catastrophic long-tail delays.",
      "Keeping stories in 'In Progress' while waiting weeks for third-party approval."
    ]
  },
  {
    id: "work-in-progress-wip-limits",
    name: "Work In Progress (WIP) vs WIP Limits",
    framework: "Kanban",
    category: "Execution & WIP",
    purpose: "Measures the number of concurrent work items currently active between Backlog and Done, comparing against team WIP limits.",
    formula: "WIP Count = Count(Issues in In Progress, Code Review, Testing); Little's Law: Cycle Time = WIP / Throughput",
    benchmark: "Target: WIP <= 1 to 1.5 items per developer. Any column exceeding the column WIP limit must trigger a swarming stop-the-line response.",
    roles: {
      "scrum-master": {
        status: "Mandated",
        reason: "Enforces Little's Law: limiting WIP is the single most effective way to accelerate cycle time."
      },
      "product-owner": {
        status: "Optional",
        reason: "Prevents PO from overloading the development funnel with half-baked requests."
      },
      "developer": {
        status: "Mandated",
        reason: "Eliminates multi-tasking penalties; encourages pairing and finishing work before pulling new tasks."
      },
      "qa-tester": {
        status: "Mandated",
        reason: "Protects QA from receiving a massive tsunami of stories dumped at the end of the iteration."
      },
      "rte-delivery": {
        status: "Optional",
        reason: "Audits team adherence to Kanban flow policies across the train."
      },
      "executive": {
        status: "Optional",
        reason: "Explains why 'more people working on more things' paradoxically slows down delivery speed."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND statusCategory = "In Progress" ORDER BY updated ASC',
    dataCenterJql: 'project = "{{projectKey}}" AND status in ("In Progress", "In Review", "Testing", "Dev Active") ORDER BY updated ASC',
    cloudVsDcNotes: 'In Cloud, Kanban boards highlight columns in red when WIP limits are violated. In Data Center, configure Column Constraints (Maximum / Minimum) under Board -> Columns.',
    recommendedGadgets: [
      {
        name: "Two Dimensional Filter Statistics",
        type: "WIP Matrix",
        configuration: "X-Axis: Status; Y-Axis: Assignee. Instantly highlights team members with > 2 items in progress.",
        dimensions: "Full Width"
      },
      {
        name: "Pie Chart",
        type: "WIP Distribution",
        configuration: "Stat Type: Status for all open work items.",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Increasing WIP limits whenever a column overflows instead of fixing the root cause bottleneck.",
      "Assigning 3-4 active stories to a single developer simultaneously."
    ]
  },
  {
    id: "work-item-age-wia",
    name: "Work Item Age (WIA) & Stale Work Detector",
    framework: "Kanban",
    category: "Execution & WIP",
    purpose: "Measures the total time elapsed since an active item entered 'In Progress' without reaching completion. WIA is the leading indicator of cycle time.",
    formula: "Work Item Age (days) = Current Date - Date entered 'In Progress' status",
    benchmark: "Target: No work item should have an age greater than the team's 85th percentile cycle time (typically <= 5 days). Age > 10 days = severe bottleneck.",
    roles: {
      "scrum-master": {
        status: "Mandated",
        reason: "Leading indicator to catch issues BEFORE they breach SLA, rather than looking at cycle time in retrospect."
      },
      "product-owner": {
        status: "Optional",
        reason: "Provides transparency on stories that are taking twice as long as expected."
      },
      "developer": {
        status: "Mandated",
        reason: "Directs team standup focus to the oldest aging items first (Right-to-Left board review)."
      },
      "qa-tester": {
        status: "Mandated",
        reason: "Flags stories stuck in QA or UAT environments waiting for verification."
      },
      "rte-delivery": {
        status: "Optional",
        reason: "Identifies stuck features across teams before they cause PI objective failures."
      },
      "executive": {
        status: "Optional",
        reason: "Operational early warning signal."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND statusCategory = "In Progress" AND status changed to "In Progress" before startOfDay("-5d") ORDER BY updated ASC',
    dataCenterJql: 'project = "{{projectKey}}" AND status in ("In Progress", "Code Review", "Testing") AND status changed before -5d ORDER BY updated ASC',
    cloudVsDcNotes: 'Jira Cloud supports "status changed to ... before ...". In Data Center, ensure indexing of history fields is enabled for high performance.',
    recommendedGadgets: [
      {
        name: "Filter Results",
        type: "Aging Watchlist",
        configuration: "Filter: Active work older than 5 days. Columns: Key, Summary, Assignee, Status, Updated.",
        dimensions: "Full Width"
      },
      {
        name: "Average Age Chart",
        type: "Chart",
        configuration: "Days: 30; Period: Daily. Tracks aging trend.",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Reviewing boards from Left-to-Right (starting new stories) instead of Right-to-Left (clearing oldest aging items first).",
      "Ignoring aging items until sprint end retro."
    ]
  },
  {
    id: "throughput-cadence",
    name: "Throughput (Weekly Delivery Cadence & Run Rate)",
    framework: "Kanban",
    category: "Predictability & Flow",
    purpose: "Measures the actual count of completed work items delivered per unit of time (e.g., items per week), without relying on subjective story points.",
    formula: "Throughput = Total Number of Work Items Resolved in the Time Window (e.g. 7 days)",
    benchmark: "Target: Stable throughput with low standard deviation. Used for Monte Carlo probabilistic forecasting.",
    roles: {
      "scrum-master": {
        status: "Mandated",
        reason: "Enables no-estimates probabilistic forecasting (Monte Carlo simulation) for roadmap planning."
      },
      "product-owner": {
        status: "Mandated",
        reason: "Directly calculates how many feature stories the team can deliver in the upcoming quarter."
      },
      "developer": {
        status: "Optional",
        reason: "Celebrates tangible delivery output and steady cadence."
      },
      "qa-tester": {
        status: "Optional",
        reason: "Helps gauge test automation throughput capacity."
      },
      "rte-delivery": {
        status: "Mandated",
        reason: "Validates aggregate delivery throughput across all release train teams."
      },
      "executive": {
        status: "Mandated",
        reason: "Objective, ungameable measure of organizational output volume."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND statusCategory = "Done" AND resolved >= startOfWeek("-4w") ORDER BY resolved DESC',
    dataCenterJql: 'project = "{{projectKey}}" AND status in ("Done", "Closed", "Resolved") AND resolved >= startOfWeek("-4w") ORDER BY resolved DESC',
    cloudVsDcNotes: 'Both Cloud and Data Center support startOfWeek() and date windows. Grouping by resolved date provides weekly throughput histograms.',
    recommendedGadgets: [
      {
        name: "Created vs Resolved Chart",
        type: "Throughput Curve",
        configuration: "Filter: All completed project issues; Days: 60; Period: Weekly; Cumulative: No.",
        dimensions: "Full Width"
      }
    ],
    antiPatterns: [
      "Equating higher throughput with higher value: delivering 100 trivial trivialities is worse than 3 high-impact features.",
      "Artificially inflating throughput by subdividing a 1-day task into ten 30-minute subtasks."
    ]
  },
  {
    id: "flow-efficiency-active-ratio",
    name: "Flow Efficiency (Active Touch Time vs Waiting Time)",
    framework: "Kanban",
    category: "Predictability & Flow",
    purpose: "Calculates the percentage of total lead time that work is actually being worked on versus sitting idle in queues.",
    formula: "Flow Efficiency (%) = (Active Working Time / Total Lead Time) * 100",
    benchmark: "Industry average is shockingly low: 5% - 15%. World-class agile teams reach 25% - 40%. Over 80% of delay is queue wait time, not slow typing.",
    roles: {
      "scrum-master": {
        status: "Mandated",
        reason: "Pinpoints where items spend time waiting (e.g., 'Ready for Review', 'Ready for QA', 'Pending Deployment')."
      },
      "product-owner": {
        status: "Optional",
        reason: "Demonstrates that speeding up delivery requires eliminating handoff queues, not pressuring developers."
      },
      "developer": {
        status: "Optional",
        reason: "Encourages immediate PR reviews and pairing to cut queue stagnation."
      },
      "qa-tester": {
        status: "Optional",
        reason: "Exposes test environment wait queues."
      },
      "rte-delivery": {
        status: "Mandated",
        reason: "Essential for Value Stream Mapping (VSM) workshops across the ART."
      },
      "executive": {
        status: "Mandated",
        reason: "Identifies systemic organizational delays (CAB approvals, security audits, vendor handoffs)."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND status in ("Ready for Review", "Ready for QA", "Blocked", "Waiting for Deployment") ORDER BY updated ASC',
    dataCenterJql: 'project = "{{projectKey}}" AND status in ("Ready for Review", "Ready for QA", "Blocked", "Waiting for Deployment") ORDER BY updated ASC',
    cloudVsDcNotes: 'To measure flow efficiency accurately, configure explicit "Queue / Buffer" statuses on the board (e.g. Ready for Test vs Testing) or use Jira Time in Status apps.',
    recommendedGadgets: [
      {
        name: "Two Dimensional Filter Statistics",
        type: "Queue Breakdown",
        configuration: "X-Axis: Status (Filter only buffer states); Y-Axis: Component.",
        dimensions: "1/2 Column"
      },
      {
        name: "Filter Results",
        type: "Queue Stagnation",
        configuration: "Filter: Items in buffer states updated > 3 days ago.",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Combining working and waiting into a single status (e.g. 'In QA' for both idle items and actively tested items), hiding the queue.",
      "Pushing developers to code faster when 85% of time is spent waiting in PR approval queues."
    ]
  },

  // ==========================================
  // 3. QUALITY & ENGINEERING HEALTH METRICS
  // ==========================================
  {
    id: "escaped-defects-production",
    name: "Escaped Defects (Post-Release / Production Incidents)",
    framework: "Hybrid",
    category: "Quality & Stability",
    purpose: "Tracks defects discovered in Production or UAT after release, reflecting the effectiveness of testing and Definition of Done rigor.",
    formula: "Defect Escape Rate (%) = (Production Defects / (In-Sprint Defects + Production Defects)) * 100",
    benchmark: "Target: Defect Escape Rate < 5%; Critical P1 Escaped Defects = 0. Any escaped P1 triggers an immediate Root Cause Analysis (RCA).",
    roles: {
      "scrum-master": {
        status: "Mandated",
        reason: "Drives retrospective RCA: why did sprint test automation and DoD fail to catch this defect?"
      },
      "product-owner": {
        status: "Mandated",
        reason: "Directly protects brand reputation, customer trust, and product availability."
      },
      "developer": {
        status: "Mandated",
        reason: "Signals missing unit tests, integration test gaps, or fragile architecture."
      },
      "qa-tester": {
        status: "Mandated",
        reason: "Core metric for test suite efficacy and test environment parity."
      },
      "rte-delivery": {
        status: "Mandated",
        reason: "Enforces CAB release compliance criteria and enterprise governance gates."
      },
      "executive": {
        status: "Mandated",
        reason: "Crucial operational risk indicator impacting SLA penalties and enterprise revenue."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND issuetype in ("Bug", "Defect", "Incident") AND (Environment ~ "Production" OR labels in ("escaped_bug", "prod_incident", "p1")) AND created >= startOfDay("-{{dateWindowDays}}d") ORDER BY priority ASC, created DESC',
    dataCenterJql: 'project = "{{projectKey}}" AND issuetype in ("Bug", "Defect", "Incident") AND (Environment ~ "Production" OR labels in ("escaped_bug", "prod_incident", "p1")) AND created >= -{{dateWindowDays}}d ORDER BY priority ASC, created DESC',
    cloudVsDcNotes: 'In Cloud, Jira Service Management (JSM) linked incidents can be queried via issueLinkType or Request Type. In Data Center, ensure standard Environment field or label taxonomy ("escaped_defect") is enforced.',
    recommendedGadgets: [
      {
        name: "Filter Results",
        type: "Production Incident Ticker",
        configuration: "Filter: Active Production Bugs. Columns: Key, Summary, Priority, Assignee, Created, Status.",
        dimensions: "Full Width"
      },
      {
        name: "Created vs Resolved Chart",
        type: "Defect Trend",
        configuration: "Filter: Production Bugs; Days: 90; Cumulative: Yes. Displays whether the bug backlog is shrinking.",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Labeling bugs found in production as 'User Enhancements' to conceal escaped defect rates.",
      "Fixing bugs with hotfixes directly in prod without linking a Jira defect and post-mortem."
    ]
  },
  {
    id: "defect-severity-distribution",
    name: "Defect Backlog Severity Distribution (P1 Blocker / P2 Critical)",
    framework: "Hybrid",
    category: "Quality & Stability",
    purpose: "Monitors the breakdown of active unresolved bugs by severity to prevent accumulating dangerous defect debt.",
    formula: "P1/P2 Defect Ratio = Count(P1 + P2 Open Defects) / Total Open Defects",
    benchmark: "Target: 0 open P1 defects > 24 hours; 0 open P2 defects > 7 days. Total open defects should not exceed 2x sprint velocity.",
    roles: {
      "scrum-master": {
        status: "Mandated",
        reason: "Guards sprint capacity: high defect debt drags down delivery velocity."
      },
      "product-owner": {
        status: "Mandated",
        reason: "Prioritizes defect fix tickets against new feature delivery in the backlog."
      },
      "developer": {
        status: "Mandated",
        reason: "Requires immediate swarming when P1/Blocker bugs are logged."
      },
      "qa-tester": {
        status: "Mandated",
        reason: "Primary daily dashboard view for defect triage and severity verification."
      },
      "rte-delivery": {
        status: "Mandated",
        reason: "Prevents releases from passing CAB quality gates with unresolved P1/P2 defects."
      },
      "executive": {
        status: "Mandated",
        reason: "High-level risk radar for customer system instability."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND issuetype in ("Bug", "Defect") AND statusCategory != "Done" AND priority in ("Highest", "High", "Blocker", "Critical") ORDER BY priority ASC, created ASC',
    dataCenterJql: 'project = "{{projectKey}}" AND issuetype in ("Bug", "Defect") AND status not in ("Done", "Closed", "Resolved") AND priority in ("Blocker", "Critical", "High") ORDER BY priority ASC, created ASC',
    cloudVsDcNotes: 'Jira Cloud default priorities are "Highest", "High", "Medium", "Low", "Lowest". Jira Data Center default priorities are "Blocker", "Critical", "Major", "Minor", "Trivial". Adjust priority names accordingly in the JQL.',
    recommendedGadgets: [
      {
        name: "Two Dimensional Filter Statistics",
        type: "Severity by Component",
        configuration: "X-Axis: Priority; Y-Axis: Component. Highlights which architectural module is most fragile.",
        dimensions: "Full Width"
      },
      {
        name: "Pie Chart",
        type: "Severity Share",
        configuration: "Filter: Open Defects. Stat Type: Priority.",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Downgrading bug priorities from 'Critical' to 'Minor' so they don't violate SLA thresholds.",
      "Leaving hundreds of minor bugs in the backlog indefinitely without triaging or closing as 'Won't Fix'."
    ]
  },
  {
    id: "mean-time-to-resolve-mttr",
    name: "Defect Resolution Time & MTTR (Mean Time to Resolve)",
    framework: "Hybrid",
    category: "Quality & Stability",
    purpose: "Measures the average duration from defect creation or triage to successful verification and resolution.",
    formula: "MTTR = Sum(Resolved Date - Created Date for All Defects) / Total Resolved Defects",
    benchmark: "Target: P1 MTTR < 4 hours; P2 MTTR < 48 hours; P3 MTTR < 10 business days.",
    roles: {
      "scrum-master": {
        status: "Optional",
        reason: "Surfaces bottlenecks in the bug fix turnaround pipeline."
      },
      "product-owner": {
        status: "Optional",
        reason: "Sets expectations for SLA response times with clients and stakeholders."
      },
      "developer": {
        status: "Mandated",
        reason: "Measures engineering response agility and debugging efficiency."
      },
      "qa-tester": {
        status: "Mandated",
        reason: "Audits whether re-testing and verification of bug fixes is occurring promptly."
      },
      "rte-delivery": {
        status: "Mandated",
        reason: "Key operational readiness indicator for ITIL / CAB compliance audits."
      },
      "executive": {
        status: "Mandated",
        reason: "Critical SLA metric included in contractual customer commitments."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND issuetype = "Bug" AND statusCategory = "Done" AND resolved >= startOfDay("-{{dateWindowDays}}d") ORDER BY resolved DESC',
    dataCenterJql: 'project = "{{projectKey}}" AND issuetype = "Bug" AND status in ("Done", "Closed", "Resolved") AND resolved >= -{{dateWindowDays}}d ORDER BY resolved DESC',
    cloudVsDcNotes: 'Use the Jira "Resolution Time Gadget" or "Average Age Chart" configured with this filter. In Cloud, SLA fields from Jira Service Management can also be queried with breached() functions.',
    recommendedGadgets: [
      {
        name: "Average Age Chart",
        type: "Defect Age Curve",
        configuration: "Filter: Open Bugs; Days: 60; Period: Daily. Rising curve means bugs are festering unresolved.",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Closing bugs before verifying the fix in a staging environment to stop the MTTR timer.",
      "Leaving bugs in 'Resolved' status unverified for weeks because QA is overloaded."
    ]
  },
  {
    id: "technical-debt-ratio",
    name: "Technical Debt Ratio & Paydown Allocation",
    framework: "Hybrid",
    category: "Engineering Health",
    purpose: "Tracks the proportion of the product backlog and team sprint capacity dedicated to paying down technical debt, refactoring, and updating dependencies.",
    formula: "Tech Debt Ratio (%) = (Tech Debt Story Points / Total Backlog Story Points) * 100",
    benchmark: "Target: Healthy teams dedicate 15% - 20% of every sprint to technical debt paydown. Tech debt > 30% of total backlog causes velocity stagnation.",
    roles: {
      "scrum-master": {
        status: "Mandated",
        reason: "Advocates for balanced sprint planning so teams don't sacrifice maintainability for short-term features."
      },
      "product-owner": {
        status: "Mandated",
        reason: "Negotiates investment allocation: explains to business why technical debt paydown is an investment in future speed."
      },
      "developer": {
        status: "Mandated",
        reason: "Empowers engineers to log architectural refactoring items and track their retirement."
      },
      "qa-tester": {
        status: "Optional",
        reason: "Highlights legacy subsystems that consistently generate regression bugs."
      },
      "rte-delivery": {
        status: "Mandated",
        reason: "Ensures Enabler Epics and Architectural Runway are funded across the ART in SAFe."
      },
      "executive": {
        status: "Mandated",
        reason: "Prevents technical bankruptcy that requires multi-million dollar full system rewrites down the line."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND (issuetype in ("Technical Debt", "Refactoring") OR labels in ("tech-debt", "refactor", "security-patch", "architectural-runway")) AND statusCategory != "Done"',
    dataCenterJql: 'project = "{{projectKey}}" AND (issuetype in ("Technical Debt", "Refactoring") OR labels in ("tech-debt", "refactor", "security-patch", "architectural-runway")) AND status not in ("Done", "Closed", "Resolved")',
    cloudVsDcNotes: 'Ensure a dedicated issue type "Technical Debt" or standardized label "tech-debt" is configured. In Cloud, custom taxonomy fields can be set as mandatory.',
    recommendedGadgets: [
      {
        name: "Pie Chart",
        type: "Debt Share",
        configuration: "Filter: Active Backlog. Stat Type: Issue Type (Feature vs Tech Debt vs Bug).",
        dimensions: "1/2 Column"
      },
      {
        name: "Filter Results",
        type: "Debt Backlog",
        configuration: "Columns: Key, Summary, Priority, Story Points, Created.",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Zero allocation: Product Owner refuses all tech debt work for 6 months, causing architecture decay.",
      "Hiding technical debt inside feature stories without transparent Jira tracking."
    ]
  },

  // ==========================================
  // 4. BACKLOG HEALTH & VALUE DELIVERY
  // ==========================================
  {
    id: "backlog-ready-depth",
    name: "Backlog Ready Depth (Definition of Ready Buffer)",
    framework: "Scrum",
    category: "Backlog & Value",
    purpose: "Measures whether the product backlog has a sufficient buffer of user stories refined and ready for sprint planning.",
    formula: "Backlog Ready Depth = Total Story Points in 'Ready for Sprint' / Average Sprint Velocity",
    benchmark: "Target: 1.5 to 2.5 sprints of work in 'Ready for Dev' / 'Ready for Sprint' status. Less than 1 sprint creates panic during Sprint Planning; More than 3 sprints risks requirements becoming stale.",
    roles: {
      "scrum-master": {
        status: "Mandated",
        reason: "Ensures Sprint Planning goes smoothly without debating incomplete requirements during planning."
      },
      "product-owner": {
        status: "Mandated",
        reason: "Core PO responsibility: keeping the refinement pipeline primed with clear Given/When/Then acceptance criteria."
      },
      "developer": {
        status: "Mandated",
        reason: "Guarantees stories arriving in sprint meet the Definition of Ready (DoR) with architectural clarity."
      },
      "qa-tester": {
        status: "Mandated",
        reason: "Confirms acceptance criteria are testable and test scenarios can be drafted prior to implementation."
      },
      "rte-delivery": {
        status: "Optional",
        reason: "Monitors upstream refinement health before PI planning events."
      },
      "executive": {
        status: "Optional",
        reason: "Indicates whether product management is keeping pace with development capacity."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND sprint is EMPTY AND status in ("Ready for Sprint", "Ready for Dev", "Refined", "Approved") AND issuetype in ("Story", "Feature", "Task") ORDER BY Rank ASC',
    dataCenterJql: 'project = "{{projectKey}}" AND sprint is EMPTY AND status in ("Ready for Sprint", "Ready for Dev", "Refined", "Approved") AND issuetype in ("Story", "Feature", "Task") ORDER BY Rank ASC',
    cloudVsDcNotes: 'In both Cloud and DC, use sprint is EMPTY to ensure only backlog items are counted. Story Points custom field can be totaled on the filter result.',
    recommendedGadgets: [
      {
        name: "Issue Statistics",
        type: "Ready Buffer",
        configuration: "Filter: Ready Backlog. Stat Type: Story Points or Issue Type.",
        dimensions: "1/2 Column"
      },
      {
        name: "Filter Results",
        type: "Refined Stories Ready for Pull",
        configuration: "Columns: Key, Summary, Story Points, Priority, Updated.",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Entering Sprint Planning with 0 refined stories, turning the planning meeting into an emergency backlog refinement session.",
      "Refining 6 months of backlog in advance, only to have 50% of the requirements become obsolete before work starts."
    ]
  },
  {
    id: "epic-release-burnup-forecast",
    name: "Epic / Release Burnup & Milestone Forecast",
    framework: "Hybrid",
    category: "Backlog & Value",
    purpose: "Tracks progress toward major quarterly releases, initiatives, or Epics, visualizing completed scope against changing total scope.",
    formula: "Release Burnup = Completed Story Points in Epic vs Total Story Points in Epic over time",
    benchmark: "Target: Completed burnup slope intersects the total scope line on or before the committed target release date.",
    roles: {
      "scrum-master": {
        status: "Optional",
        reason: "Helps team align sprint goals with epic delivery milestones."
      },
      "product-owner": {
        status: "Mandated",
        reason: "Primary release governance tool: shows roadmap trajectory and allows early scope vs date negotiation."
      },
      "developer": {
        status: "Optional",
        reason: "Provides big-picture context on which features contribute to the upcoming product release."
      },
      "qa-tester": {
        status: "Optional",
        reason: "Enables QA to schedule regression and end-to-end performance test windows."
      },
      "rte-delivery": {
        status: "Mandated",
        reason: "Mandatory for SAFe PI governance: tracks ART feature delivery across sprints."
      },
      "executive": {
        status: "Mandated",
        reason: "Executive board level metric: provides objective release date forecasts for go-to-market and sales alignment."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND (parentEpic = "{{projectKey}}-100" OR "Epic Link" = "{{projectKey}}-100" OR parent = "{{projectKey}}-100") ORDER BY statusCategory ASC, Rank ASC',
    dataCenterJql: 'project = "{{projectKey}}" AND "Epic Link" = "{{projectKey}}-100" ORDER BY status ASC, Rank ASC',
    cloudVsDcNotes: 'In Jira Cloud (Next-Gen and modern Jira), epic-story relationships use the "parent" or "parentEpic" field. In Jira Data Center, the standard field is "Epic Link". Ensure your query uses the appropriate hierarchy field.',
    recommendedGadgets: [
      {
        name: "Version Report Gadget",
        type: "Release Burnup",
        configuration: "Select Board and Target FixVersion. Visualizes projected completion date based on historical velocity.",
        dimensions: "Full Width"
      },
      {
        name: "Two Dimensional Filter Statistics",
        type: "Epic Progress Matrix",
        configuration: "X-Axis: Status Category; Y-Axis: Priority or Assignee.",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Total scope line climbing at the same rate as completed scope, meaning the release target date slips indefinitely.",
      "Marking an Epic as Done when several sub-stories are still open or deferred to 'Phase 2'."
    ]
  },
  {
    id: "cross-team-dependencies-art",
    name: "Cross-Team Dependency Blockers (ART Impediments)",
    framework: "Hybrid",
    category: "Execution & WIP",
    purpose: "Tracks work items dependent on other teams or third parties, identifying inter-team handoff bottlenecks in SAFe ARTs.",
    formula: "Dependency Index = Count of Unresolved Issues with Outward 'is blocked by' Links to Other Projects",
    benchmark: "Target: 0 critical cross-team dependencies unresolved within 2 weeks of scheduled sprint start.",
    roles: {
      "scrum-master": {
        status: "Mandated",
        reason: "Scrum of Scrums (SoS) daily sync item: coordinates handoffs with other Scrum Masters."
      },
      "product-owner": {
        status: "Mandated",
        reason: "Aligns roadmap sequencing with other Product Owners to prevent blocked sprint starts."
      },
      "developer": {
        status: "Optional",
        reason: "Alerts developer when a technical API contract from another team is pending."
      },
      "qa-tester": {
        status: "Optional",
        reason: "Flags end-to-end integrated environment dependencies."
      },
      "rte-delivery": {
        status: "Mandated",
        reason: "Core SAFe Program Board governance: dependencies represent the #1 cause of ART delivery failures."
      },
      "executive": {
        status: "Mandated",
        reason: "Highlights organizational silos and misaligned team structures that impede speed."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND issueLinkType in ("is blocked by", "depends on") AND statusCategory != "Done"',
    dataCenterJql: 'project = "{{projectKey}}" AND issueLinkType in ("is blocked by", "depends on") AND status not in ("Done", "Closed", "Resolved")',
    cloudVsDcNotes: 'Issue link type names vary across instances (e.g. "Blocks / is blocked by" vs "Depends on"). In Cloud, check Jira Settings -> Issue Linking to verify link type strings. Both platforms support issueLinkType filtering.',
    recommendedGadgets: [
      {
        name: "Filter Results",
        type: "Cross-Team Dependency Tracker",
        configuration: "Columns: Key, Summary, Linked Issues, Priority, Assignee, Status.",
        dimensions: "Full Width"
      }
    ],
    antiPatterns: [
      "Failing to link issues in Jira and relying solely on verbal agreements made during PI Planning.",
      "Treating cross-team dependencies as an excuse for team inaction instead of escalating to the RTE."
    ]
  },
  {
    id: "stale-backlog-items-rot",
    name: "Stale Backlog Items & Backlog Rot (> 90 Days Inactive)",
    framework: "Hybrid",
    category: "Backlog & Value",
    purpose: "Identifies work items lingering in the backlog without any comments, updates, or prioritization for over 90 or 180 days.",
    formula: "Backlog Rot (%) = (Backlog Items Inactive > 90 Days / Total Backlog Items) * 100",
    benchmark: "Target: Backlog Rot < 15%. A healthy backlog is a groomed tree, not a dumping ground for forgotten ideas.",
    roles: {
      "scrum-master": {
        status: "Optional",
        reason: "Facilitates periodic backlog pruning and archival sessions with the PO."
      },
      "product-owner": {
        status: "Mandated",
        reason: "Prunes obsolete tickets: if an idea has not been prioritized for 6 months, it should be closed as 'Won't Do'."
      },
      "developer": {
        status: "Optional",
        reason: "Reduces noise when searching Jira."
      },
      "qa-tester": {
        status: "Optional",
        reason: "Reduces stale defect noise."
      },
      "rte-delivery": {
        status: "Optional",
        reason: "Audits portfolio hygiene across teams."
      },
      "executive": {
        status: "Optional",
        reason: "Ensures reporting reflects genuine pipeline demand rather than historical clutter."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND sprint is EMPTY AND statusCategory = "To Do" AND updated <= startOfDay("-90d") ORDER BY created ASC',
    dataCenterJql: 'project = "{{projectKey}}" AND sprint is EMPTY AND status in ("Open", "Backlog", "To Do") AND updated <= -90d ORDER BY created ASC',
    cloudVsDcNotes: 'In Cloud, statusCategory = "To Do" filters unstarted tickets. In DC, verify initial status names. Run quarterly bulk closes on tickets inactive > 180 days.',
    recommendedGadgets: [
      {
        name: "Filter Results",
        type: "Stale Backlog Triage",
        configuration: "Columns: Key, Summary, Created, Updated, Reporter.",
        dimensions: "1/2 Column"
      },
      {
        name: "Issue Statistics",
        type: "Stale Age Distribution",
        configuration: "Stat Type: Component or Reporter.",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Keeping 1,500 unrefined issues in Jira because 'we might need this someday', slowing down board queries and demoralizing teams.",
      "Treating the Jira backlog as a bottomless customer wish list."
    ]
  },
  {
    id: "sprint-goal-success-rate",
    name: "Sprint Goal Completion Rate (Outcome vs Output)",
    framework: "Scrum",
    category: "Predictability & Flow",
    purpose: "Measures the percentage of sprints where the core business Sprint Goal agreed in Sprint Planning was achieved, regardless of minor ticket slippage.",
    formula: "Sprint Goal Success Rate (%) = (Sprints with Goal Achieved / Total Completed Sprints) * 100",
    benchmark: "Target: >= 85%. Missing sprint goals indicates fragmented sprint themes or lack of team commitment focus.",
    roles: {
      "scrum-master": {
        status: "Mandated",
        reason: "Protects the core Scrum principle: sprints exist to deliver a coherent valuable goal, not just clear tickets."
      },
      "product-owner": {
        status: "Mandated",
        reason: "Validates that the sprint delivered measurable business value to users and stakeholders."
      },
      "developer": {
        status: "Mandated",
        reason: "Focuses daily standup on what needs swarming to protect the sprint goal."
      },
      "qa-tester": {
        status: "Optional",
        reason: "Ensures goal-critical test paths are prioritized first."
      },
      "rte-delivery": {
        status: "Mandated",
        reason: "Correlates directly with SAFe PI Objective achievement."
      },
      "executive": {
        status: "Mandated",
        reason: "The truest measure of business outcome delivery vs raw ticket counting."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND sprint in openSprints() AND labels in ("sprint_goal", "core_goal") ORDER BY statusCategory ASC',
    dataCenterJql: 'project = "{{projectKey}}" AND sprint in openSprints() AND labels in ("sprint_goal", "core_goal") ORDER BY status ASC',
    cloudVsDcNotes: 'Jira Software active sprints allow writing a Sprint Goal text. To track individual issues tied to the sprint goal, teams tag stories with a standardized label like "sprint_goal" or use a custom checkbox field.',
    recommendedGadgets: [
      {
        name: "Sprint Health Gadget",
        type: "Goal & Health",
        configuration: "Select Board ID {{boardId}}.",
        dimensions: "1/2 Column"
      },
      {
        name: "Filter Results",
        type: "Goal Stories Tracker",
        configuration: "Filter: Issues labeled sprint_goal in active sprint.",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Defining 5 completely disconnected sprint goals for a 6-person team.",
      "Treating the sprint goal as 'Complete all tickets assigned to the sprint'."
    ]
  },
  {
    id: "reopened-defect-rate",
    name: "Reopened Defect Rate & Fix Rejection Ratio",
    framework: "Hybrid",
    category: "Quality & Stability",
    purpose: "Measures how often bug fixes resolved by developers are rejected and reopened by QA because the defect was not properly fixed.",
    formula: "Reopened Defect Rate (%) = (Count of Defects with Status Changed from 'Resolved' to 'In Progress' / Total Resolved Defects) * 100",
    benchmark: "Target: < 8%. Reopened rate > 15% indicates rushed bug fixes, inadequate local unit testing, or poor reproduction steps.",
    roles: {
      "scrum-master": {
        status: "Optional",
        reason: "Signals tension or communication breakdown between Dev and QA."
      },
      "product-owner": {
        status: "Optional",
        reason: "Warns of fragile code areas that delay sprint completion."
      },
      "developer": {
        status: "Mandated",
        reason: "Reflects first-time-right quality and thoroughness of debugging."
      },
      "qa-tester": {
        status: "Mandated",
        reason: "Tracks verification rigor and prevents prematurely closed defects from reaching production."
      },
      "rte-delivery": {
        status: "Optional",
        reason: "Quality gate compliance metric."
      },
      "executive": {
        status: "Optional",
        reason: "Indicates engineering discipline and craftsmanship."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND issuetype = "Bug" AND status changed from "Resolved" to ("In Progress", "Reopened", "Open") during (startOfDay("-{{dateWindowDays}}d"), now())',
    dataCenterJql: 'project = "{{projectKey}}" AND issuetype = "Bug" AND status changed from "Resolved" to ("In Progress", "Reopened", "Open") during (-{{dateWindowDays}}d, now())',
    cloudVsDcNotes: 'Requires status history tracking in Jira. If the team workflow uses a dedicated "Reopened" status, query: status = "Reopened" OR status changed to "Reopened".',
    recommendedGadgets: [
      {
        name: "Filter Results",
        type: "Reopened Bugs Watchlist",
        configuration: "Columns: Key, Summary, Assignee, Priority, Updated.",
        dimensions: "1/2 Column"
      },
      {
        name: "Issue Statistics",
        type: "Reopened by Assignee/Component",
        configuration: "Stat Type: Component.",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Marking bugs 'Resolved' without testing in an integrated environment to meet daily standup promises.",
      "Blaming QA for 'reopening too many tickets' instead of improving unit test coverage."
    ]
  },
  {
    id: "unplanned-work-interruptions",
    name: "Unplanned Emergency Interruptions & Firefighting Ratio",
    framework: "Hybrid",
    category: "Execution & WIP",
    purpose: "Tracks emergency, production hotfixes, and ad-hoc requests injected without notice that hijack engineering capacity.",
    formula: "Firefighting Ratio (%) = (Hours / Points spent on Unplanned Emergencies / Total Sprint Capacity) * 100",
    benchmark: "Target: < 10% of sprint capacity. > 25% firefighting means the team is stuck in a chronic reactive death-spiral.",
    roles: {
      "scrum-master": {
        status: "Mandated",
        reason: "Exposes systemic operational instability and protects team capacity from outside distractions."
      },
      "product-owner": {
        status: "Mandated",
        reason: "Explains why planned feature delivery is falling behind roadmap commitments."
      },
      "developer": {
        status: "Mandated",
        reason: "Validates developer complaints of severe context switching and cognitive burnout."
      },
      "qa-tester": {
        status: "Optional",
        reason: "Hotfixes bypass normal regression test cycles, introducing new defects."
      },
      "rte-delivery": {
        status: "Mandated",
        reason: "Aggregates firefighting cost across teams to lobby for operational stabilization investments."
      },
      "executive": {
        status: "Mandated",
        reason: "Reveals the true cost of legacy system instability on feature innovation."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND (labels in ("unplanned", "emergency", "hotfix", "escalation") OR priority in ("Highest", "Blocker")) AND created >= startOfDay("-{{dateWindowDays}}d") ORDER BY created DESC',
    dataCenterJql: 'project = "{{projectKey}}" AND (labels in ("unplanned", "emergency", "hotfix", "escalation") OR priority in ("Blocker", "Critical")) AND created >= -{{dateWindowDays}}d ORDER BY created DESC',
    cloudVsDcNotes: 'Create a standard Jira issue label "unplanned" or custom field "Work Origin: Planned vs Unplanned" across Cloud and DC.',
    recommendedGadgets: [
      {
        name: "Created vs Resolved Chart",
        type: "Firefighting Volume",
        configuration: "Filter: Emergency hotfixes and unplanned work; Days: 30; Period: Weekly.",
        dimensions: "1/2 Column"
      },
      {
        name: "Two Dimensional Filter Statistics",
        type: "Interruption Matrix",
        configuration: "X-Axis: Priority; Y-Axis: Component.",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Allowing stakeholders to bypass the Product Owner and drop emergency tasks directly onto individual developers via Slack or email.",
      "Accepting high firefighting as 'just the way things are' without conducting post-incident root cause fixes."
    ]
  },
  {
    id: "flow-distribution-work-types",
    name: "Flow Distribution (Features vs Tech Debt vs Defects vs Risks)",
    framework: "Kanban",
    category: "Predictability & Flow",
    purpose: "Tracks the proportion of total completed work allocated across the 4 Flow Framework categories: Features (Business Value), Defects (Quality), Technical Debt (Sustainability), and Risks (Security/Compliance).",
    formula: "Flow Distribution (%) = (Count of Category Items / Total Delivered Items) * 100",
    benchmark: "Healthy standard: 60% Features, 15% Technical Debt, 15% Defects, 10% Risk/Security. Heavy imbalance (< 10% debt) leads to future paralysis.",
    roles: {
      "scrum-master": {
        status: "Mandated",
        reason: "Maintains sustainability and guards against team burnout caused by perpetual feature grinding."
      },
      "product-owner": {
        status: "Mandated",
        reason: "Directs strategic product investment mix across maintenance vs innovation."
      },
      "developer": {
        status: "Optional",
        reason: "Provides visibility into work variety and architectural investment."
      },
      "qa-tester": {
        status: "Optional",
        reason: "Monitors defect allocation trend."
      },
      "rte-delivery": {
        status: "Mandated",
        reason: "Aligns ART capacity allocation with enterprise portfolio strategic themes."
      },
      "executive": {
        status: "Mandated",
        reason: "Answers the CEO question: 'What is our engineering organization actually spending its time and money on?'"
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND statusCategory = "Done" AND resolved >= startOfDay("-{{dateWindowDays}}d")',
    dataCenterJql: 'project = "{{projectKey}}" AND status in ("Done", "Closed", "Resolved") AND resolved >= -{{dateWindowDays}}d',
    cloudVsDcNotes: 'Configure Jira Pie Chart or Two Dimensional Filter Statistics grouped by Issue Type or custom field "Flow Type". Both Cloud and DC support native Pie Chart gadgets.',
    recommendedGadgets: [
      {
        name: "Pie Chart",
        type: "Work Breakdown",
        configuration: "Filter: Completed Work (Last 30 Days). Stat Type: Issue Type.",
        dimensions: "1/2 Column"
      },
      {
        name: "Two Dimensional Filter Statistics",
        type: "Distribution Matrix",
        configuration: "X-Axis: Issue Type; Y-Axis: FixVersion or Epic.",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Spending 95% on Features for 12 months, resulting in an unmaintainable codebase that causes production outages.",
      "Misclassifying bugs as features to make Flow Distribution appear more 'innovative' to executive management."
    ]
  },

  // ==========================================
  // 5. DORA METRICS (DEVOPS RESEARCH & ASSESSMENT)
  // ==========================================
  {
    id: "dora-deployment-frequency",
    name: "DORA: Deployment Frequency (DF)",
    framework: "DORA",
    category: "DevOps & Release Cadence",
    purpose: "Measures how frequently software changes are successfully deployed to production or staging environments.",
    formula: "Deployment Frequency = Total Successful Production Releases / Time Window (e.g., Deploys per Day/Week)",
    benchmark: "DORA 2024 Standards: 🚀 Elite: Multiple deploys per day (on-demand); 🟢 High: Once per day to once per week; 🟡 Medium: Once per week to once per month; 🔴 Low: Less than once every six months.",
    roles: {
      "scrum-master": {
        status: "Optional",
        reason: "Reflects team technical continuous delivery health and release pipeline friction."
      },
      "product-owner": {
        status: "Mandated",
        reason: "Directly determines the cadence of customer feedback loops and time-to-value for new product features."
      },
      "developer": {
        status: "Mandated",
        reason: "Encourages trunk-based development, small batch sizes, and automated CI/CD pipeline triggers."
      },
      "qa-tester": {
        status: "Optional",
        reason: "Informs QA test automation strategy: high frequency requires robust shift-left automated regression."
      },
      "rte-delivery": {
        status: "Mandated",
        reason: "Primary measure of continuous delivery pipeline maturity across all Agile Release Train teams."
      },
      "executive": {
        status: "Mandated",
        reason: "The definitive industry benchmark for organizational delivery velocity and competitive responsiveness."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND (issuetype = "Release" OR fixVersion in releasedVersions() OR labels in ("deployed_prod", "prod_release")) AND statusCategory = "Done" AND resolved >= startOfDay("-{{dateWindowDays}}d") ORDER BY resolved DESC',
    dataCenterJql: 'project = "{{projectKey}}" AND (issuetype = "Release" OR fixVersion in releasedVersions() OR labels in ("deployed_prod", "prod_release") OR "Deployment Environment" ~ "Production") AND status in ("Done", "Released", "Closed") AND resolved >= -{{dateWindowDays}}d ORDER BY resolved DESC',
    cloudVsDcNotes: 'In Jira Cloud, Jira Software connects natively to CI/CD pipelines (GitHub Actions, GitLab, Bitbucket Pipelines) to populate the Deployments feature. In Data Center, use dedicated Release issue types, custom field "Deployment Environment" = "Production", or the Jira DVCS connector.',
    recommendedGadgets: [
      {
        name: "Created vs Resolved Chart",
        type: "Deployment Cadence",
        configuration: "Filter: Production Releases; Period: Weekly; Cumulative: No. Visualizes release rhythm spikes.",
        dimensions: "Full Width"
      },
      {
        name: "Filter Results",
        type: "Production Releases List",
        configuration: "Columns: Key, Summary, FixVersion, Resolved, Assignee. Tracks latest deployed packages.",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Accumulating 3 months of finished stories into a single massive 'Big Bang' release batch.",
      "Treating manual CAB approval meetings as the primary gate instead of automated CI/CD quality tests."
    ]
  },
  {
    id: "dora-lead-time-for-changes",
    name: "DORA: Lead Time for Changes (LTTC)",
    framework: "DORA",
    category: "DevOps & Velocity",
    purpose: "Measures the elapsed duration from code commit (or development start) until that change is running successfully in production.",
    formula: "Lead Time for Changes = Production Deployment Timestamp - First Commit Timestamp (or Date Entered 'In Progress')",
    benchmark: "DORA Standards: 🚀 Elite: < 1 hour; 🟢 High: 1 day to 1 week; 🟡 Medium: 1 week to 1 month; 🔴 Low: > 1 month to 6 months.",
    roles: {
      "scrum-master": {
        status: "Mandated",
        reason: "Identifies systemic waste, handoff delays, long PR review queues, and test environment wait states."
      },
      "product-owner": {
        status: "Optional",
        reason: "Reveals the latency between 'Dev Done' and when the feature is actually in customers' hands."
      },
      "developer": {
        status: "Mandated",
        reason: "Drives small vertical slices, rapid peer code review turnaround, and trunk-based integration."
      },
      "qa-tester": {
        status: "Optional",
        reason: "Exposes long manual end-to-end regression testing phases that bottleneck deployment pipelines."
      },
      "rte-delivery": {
        status: "Mandated",
        reason: "Core Value Stream lead time indicator used in SAFe Value Stream Mapping (VSM) analysis."
      },
      "executive": {
        status: "Mandated",
        reason: "Defines overall engineering efficiency: how nimble the organization is at pushing new ideas to live customers."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND statusCategory = "Done" AND fixVersion in releasedVersions() AND resolved >= startOfDay("-{{dateWindowDays}}d") ORDER BY resolved DESC',
    dataCenterJql: 'project = "{{projectKey}}" AND status in ("Done", "Released", "Closed") AND fixVersion in releasedVersions() AND resolved >= -{{dateWindowDays}}d ORDER BY resolved DESC',
    cloudVsDcNotes: 'Jira Cloud captures development information via development[pullrequests].merged and development[deployments].state = "successful". In Data Center, calculate the delta between status changed to "In Progress" and status changed to "Released".',
    recommendedGadgets: [
      {
        name: "Average Age Chart",
        type: "Lead Time Trend",
        configuration: "Filter: Unreleased In-Progress Work; Period: Daily; Days: 60. Tracks whether lead time is ballooning.",
        dimensions: "1/2 Column"
      },
      {
        name: "Two Dimensional Filter Statistics",
        type: "Lead Time by Component",
        configuration: "X-Axis: Component; Y-Axis: Priority. Pinpoints slow architectural modules.",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Letting pull requests sit idle in 'Under Review' status for 4 business days before anyone looks at them.",
      "Running code-freezes and month-long manual regression cycles before every release."
    ]
  },
  {
    id: "dora-change-failure-rate",
    name: "DORA: Change Failure Rate (CFR)",
    framework: "DORA",
    category: "DevOps & Stability",
    purpose: "Measures the percentage of deployments to production that result in degraded service, outages, or subsequently require remediation (hotfixes, rollbacks, patches).",
    formula: "Change Failure Rate (%) = (Total Remediation Incidents + Hotfixes + Rollbacks) / (Total Production Deployments) * 100",
    benchmark: "DORA Standards: 🚀 Elite: 0% - 5% (Failures are rare anomalies); 🟢 High: 5% - 15%; 🟡 Medium: 16% - 30%; 🔴 Low: > 30% (High risk releases).",
    roles: {
      "scrum-master": {
        status: "Mandated",
        reason: "Triggers immediate retrospective root-cause investigation: why did testing fail to catch the release defect?"
      },
      "product-owner": {
        status: "Mandated",
        reason: "Guards customer experience, NPS, and brand trust by preventing unreliable software releases."
      },
      "developer": {
        status: "Mandated",
        reason: "Validates local testing rigor, pre-merge smoke tests, and comprehensive integration test suites."
      },
      "qa-tester": {
        status: "Mandated",
        reason: "Primary quality gate metric: proves whether test automation and staging parity are effective."
      },
      "rte-delivery": {
        status: "Mandated",
        reason: "Non-negotiable compliance and CAB governance gate: high CFR halts automated deployment promotions."
      },
      "executive": {
        status: "Mandated",
        reason: "Directly protects revenue, SLA penalty costs, customer retention, and brand reputation."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND ((issuetype in ("Incident", "Bug") AND (labels in ("prod_incident", "hotfix", "rollback", "escaped_defect") OR Environment ~ "Production")) OR priority in ("Highest", "Blocker")) AND created >= startOfDay("-{{dateWindowDays}}d") ORDER BY created DESC',
    dataCenterJql: 'project = "{{projectKey}}" AND ((issuetype in ("Incident", "Bug") AND (labels in ("prod_incident", "hotfix", "rollback", "escaped_defect") OR Environment ~ "Production")) OR priority in ("Blocker", "Critical")) AND created >= -{{dateWindowDays}}d ORDER BY created DESC',
    cloudVsDcNotes: 'In Jira Cloud, link production incidents to releases using issueLinkType = "causes" or "is caused by". In Jira Data Center, enforce a standard label "hotfix" or custom field "Root Cause Category" = "Production Release Failure".',
    recommendedGadgets: [
      {
        name: "Pie Chart",
        type: "Failure Severity Mix",
        configuration: "Filter: Production hotfixes and rollbacks. Stat Type: Priority.",
        dimensions: "1/2 Column"
      },
      {
        name: "Filter Results",
        type: "Active Hotfix & Outage Ticker",
        configuration: "Columns: Key, Summary, Priority, Assignee, Created, Status. Real-time incident alert tracker.",
        dimensions: "Full Width"
      }
    ],
    antiPatterns: [
      "Labeling production bugs as 'User Requests' or 'Design Enhancements' to artificially suppress the Change Failure Rate.",
      "Blaming individual developers for release failures rather than improving automated guardrails and deployment pipelines."
    ]
  },
  {
    id: "dora-time-to-restore-service",
    name: "DORA: Time to Restore Service (Failed Deployment Recovery / MTTR)",
    framework: "DORA",
    category: "DevOps & Resilience",
    purpose: "Measures the elapsed duration required to restore full service when an unplanned outage, service degradation, or defect occurs in production.",
    formula: "Time to Restore Service = Incident Resolved Timestamp - Incident Created / Alerted Timestamp",
    benchmark: "DORA Standards: 🚀 Elite: < 1 hour (Automated canary rollbacks / blue-green switches); 🟢 High: < 1 day; 🟡 Medium: 1 day to 1 week; 🔴 Low: > 1 week.",
    roles: {
      "scrum-master": {
        status: "Optional",
        reason: "Helps team run blameless post-mortems and incorporate preventive action items into upcoming sprints."
      },
      "product-owner": {
        status: "Optional",
        reason: "Manages customer communication and business impact notifications during service recovery."
      },
      "developer": {
        status: "Mandated",
        reason: "Measures observability, logging, runbook clarity, and automated rollback capability."
      },
      "qa-tester": {
        status: "Mandated",
        reason: "Confirms rapid verification and smoke-testing of emergency hotfix patches before production re-promotion."
      },
      "rte-delivery": {
        status: "Mandated",
        reason: "Ensures compliance with enterprise ITIL incident management SLAs and CAB requirements."
      },
      "executive": {
        status: "Mandated",
        reason: "The true measure of organizational operational resilience: disruptions happen, but how fast do you recover?"
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND issuetype in ("Incident", "Production Incident", "Outage") AND (Environment ~ "Production" OR labels in ("outage", "prod_incident", "p1")) AND statusCategory = "Done" AND resolved >= startOfDay("-{{dateWindowDays}}d") ORDER BY resolved DESC',
    dataCenterJql: 'project = "{{projectKey}}" AND issuetype in ("Incident", "Production Incident", "Outage") AND (Environment ~ "Production" OR labels in ("outage", "prod_incident", "p1")) AND status in ("Done", "Resolved", "Closed") AND resolved >= -{{dateWindowDays}}d ORDER BY resolved DESC',
    cloudVsDcNotes: 'Jira Service Management (JSM) Cloud includes native SLA timers ("Time to resolution") with breached() JQL query support. In Jira Data Center, query resolved >= -30d and track Created-to-Resolved duration in Jira Charting Gadget.',
    recommendedGadgets: [
      {
        name: "Average Age Chart",
        type: "Incident Resolution Duration",
        configuration: "Filter: Production P1/P2 Incidents; Period: Daily; Days: 60. Declining curve confirms faster recovery.",
        dimensions: "1/2 Column"
      },
      {
        name: "Filter Results",
        type: "High-Priority Outages List",
        configuration: "Columns: Key, Summary, Priority, Created, Resolved, Resolution. Historical recovery log.",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Manual live troubleshooting on production servers without rollback capability, prolonging downtime by hours.",
      "Closing Jira incident tickets before confirming system stabilization to manipulate SLA dashboards."
    ]
  },
  {
    id: "dora-operational-reliability-slo",
    name: "DORA: Operational Performance & Error Budget Burn Rate",
    framework: "DORA",
    category: "DevOps & Resilience",
    purpose: "Tracks system availability and uptime against defined Service Level Objectives (SLOs), calculating Error Budget consumption to govern release safety.",
    formula: "Error Budget Burn (%) = (Unplanned Downtime Minutes / Allowed Downtime Minutes per 30-Day SLO) * 100",
    benchmark: "Google SRE / DORA Standard: Healthy: Error budget burn < 50% per rolling month (99.9% - 99.99% uptime); ⚠️ Warning: 50% - 99% burn; 🛑 Exhausted: > 100% burn (Triggers immediate deployment freeze for new features to focus on stability).",
    roles: {
      "scrum-master": {
        status: "Optional",
        reason: "Protects team capacity when error budget exhaustion requires pausing feature sprints."
      },
      "product-owner": {
        status: "Mandated",
        reason: "Core Error Budget Policy agreement: PO agrees to halt feature velocity if reliability budget is exceeded."
      },
      "developer": {
        status: "Mandated",
        reason: "Directs engineering focus toward technical debt, automated testing, and fault-tolerant architecture."
      },
      "qa-tester": {
        status: "Optional",
        reason: "Guides chaos engineering, failover drills, and load testing on high-burn microservices."
      },
      "rte-delivery": {
        status: "Mandated",
        reason: "Enforces enterprise error budget policies across all trains: halts unsafe releases."
      },
      "executive": {
        status: "Mandated",
        reason: "Directly correlates with customer contract uptime SLAs, regulatory compliance, and business continuity."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND issuetype in ("Incident", "Problem") AND labels in ("slo_breach", "error_budget", "availability_incident") AND created >= startOfDay("-{{dateWindowDays}}d") ORDER BY priority ASC, created DESC',
    dataCenterJql: 'project = "{{projectKey}}" AND issuetype in ("Incident", "Problem") AND labels in ("slo_breach", "error_budget", "availability_incident") AND created >= -{{dateWindowDays}}d ORDER BY priority ASC, created DESC',
    cloudVsDcNotes: 'Connect monitoring platforms (Datadog, Dynatrace, New Relic, CloudWatch) via webhooks to auto-create Jira Incident tickets with label "slo_breach" whenever an SLO threshold triggers an alert.',
    recommendedGadgets: [
      {
        name: "Two Dimensional Filter Statistics",
        type: "SLO Breaches by Component",
        configuration: "X-Axis: Priority; Y-Axis: Component. Reveals which service is burning the error budget.",
        dimensions: "1/2 Column"
      },
      {
        name: "Filter Results",
        type: "Active SLO Breaches",
        configuration: "Columns: Key, Summary, Component, Priority, Created, Status.",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Ignoring exhausted error budgets and continuing to push risky features into production, resulting in catastrophic outages.",
      "Setting impossible 100% uptime SLO targets that paralyze product innovation."
    ]
  },

  // ==========================================
  // 6. DEVSECOPS & CYBERSECURITY METRICS
  // ==========================================
  {
    id: "sec-mttr-vulnerability-sla",
    name: "DevSecOps: Mean Time to Remediate Vulnerabilities (MTTR-V & SLA Breaches)",
    framework: "DevSecOps",
    category: "Vulnerability Management & SLAs",
    purpose: "Tracks the speed at which identified security flaws (SAST, DAST, SCA, Container vulnerabilities) are remediated, measuring compliance against regulatory CVSS remediation SLAs.",
    formula: "MTTR-V = Sum(Vulnerability Resolved Date - Detected Date) / Total Resolved; SLA Breach Rate (%) = (Vulnerabilities Closed Past SLA / Total Vulnerabilities) * 100",
    benchmark: "CVSS Enterprise SLAs: 🚨 Critical (CVSS 9.0-10.0): < 24-48 hours (0 breach tolerance); 🟠 High (CVSS 7.0-8.9): < 14 days; 🟡 Medium (CVSS 4.0-6.9): < 30 days; 🟢 Low (CVSS 0.1-3.9): < 90 days.",
    roles: {
      "scrum-master": {
        status: "Optional",
        reason: "Surfaces security blockers during daily standups and protects sprint capacity for mandatory patches."
      },
      "product-owner": {
        status: "Mandated",
        reason: "Required to allocate sprint capacity for security fixes before regulatory SLA breach fines occur."
      },
      "developer": {
        status: "Mandated",
        reason: "Direct measure of engineering response agility to security alerts before exploit code is weaponized."
      },
      "qa-tester": {
        status: "Mandated",
        reason: "Verifies security patch integrity without regressing application business functionality."
      },
      "rte-delivery": {
        status: "Mandated",
        reason: "Enforces enterprise release governance: any unpatched Critical CVE past SLA halts production deployment."
      },
      "executive": {
        status: "Mandated",
        reason: "Core audit compliance metric for CISO, SOC 2, ISO 27001, PCI-DSS, and Cyber Insurance underwriting."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND (issuetype in ("Vulnerability", "Security Finding") OR labels in ("security", "cve", "vulnerability")) AND statusCategory != "Done" AND ((priority in ("Highest", "Blocker") AND created <= startOfDay("-2d")) OR (priority = "High" AND created <= startOfDay("-14d")) OR (priority = "Medium" AND created <= startOfDay("-30d"))) ORDER BY priority ASC, created ASC',
    dataCenterJql: 'project = "{{projectKey}}" AND (issuetype in ("Vulnerability", "Security Finding") OR labels in ("security", "cve", "vulnerability")) AND status not in ("Done", "Closed", "Resolved") AND ((priority in ("Blocker", "Critical") AND created <= -2d) OR (priority = "High" AND created <= -14d) OR (priority in ("Medium", "Major") AND created <= -30d)) ORDER BY priority ASC, created ASC',
    cloudVsDcNotes: 'In Jira Cloud, integrate Snyk, Veracode, or GitHub Advanced Security to automatically log vulnerabilities with native severity mappings. In Jira Data Center, use custom field "CVSS Score" (e.g. cf[10200] >= 7.0) and issue-level security schemes to restrict confidential exploit details.',
    recommendedGadgets: [
      {
        name: "Filter Results",
        type: "Vulnerability SLA Breach Watchlist",
        configuration: "Display Key, Summary, Priority, Assignee, Created, Due Date. Highlights overdue vulnerabilities in red.",
        dimensions: "Full Width"
      },
      {
        name: "Two Dimensional Filter Statistics",
        type: "Breach Matrix",
        configuration: "X-Axis: Priority; Y-Axis: Component. Identifies which service has the most overdue security flaws.",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Downgrading vulnerability severity in Jira from 'Critical' to 'Medium' just to avoid triggering an SLA breach report.",
      "Granting perpetual 'Security Exception' waivers for months without active remediation plans."
    ]
  },
  {
    id: "sec-vulnerability-density-backlog",
    name: "DevSecOps: Open Vulnerability Flaw Backlog & Defect Density",
    framework: "DevSecOps",
    category: "Vulnerability Management & SLAs",
    purpose: "Monitors the overall volume, severity distribution, and accumulation rate of open security vulnerabilities across application components.",
    formula: "Security Flaw Density = Count(Open Vulnerabilities) / Total Code Base KLOC (or per Story Point); Flaw Rate = New Flaws Detected - Flaws Remediated per Sprint",
    benchmark: "Target: 0 Open Critical vulnerabilities; < 5 High vulnerabilities across train; Net Flaw Rate <= 0 (Security debt must shrink sprint-over-sprint).",
    roles: {
      "scrum-master": {
        status: "Mandated",
        reason: "Ensures sprint planning balances new feature work with burning down security technical debt."
      },
      "product-owner": {
        status: "Mandated",
        reason: "Guards against security bankruptcy: prevents technical debt from accumulating to unmanageable levels."
      },
      "developer": {
        status: "Mandated",
        reason: "Reflects overall code hygiene, defensive design patterns, and shift-left testing rigor."
      },
      "qa-tester": {
        status: "Mandated",
        reason: "Tracks whether security testing is keeping pace with functional feature delivery."
      },
      "rte-delivery": {
        status: "Mandated",
        reason: "Monitors cross-team security posture and enforces Architectural Runway security requirements."
      },
      "executive": {
        status: "Mandated",
        reason: "Macro-level risk indicator: shows the organization's aggregate cyber exposure and attack surface."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND (issuetype in ("Vulnerability", "Security Finding", "Security Defect") OR labels in ("security", "vulnerability", "cve", "owasp")) AND statusCategory != "Done" ORDER BY priority ASC, created DESC',
    dataCenterJql: 'project = "{{projectKey}}" AND (issuetype in ("Vulnerability", "Security Finding", "Security Defect") OR labels in ("security", "vulnerability", "cve", "owasp")) AND status not in ("Done", "Closed", "Resolved") ORDER BY priority ASC, created DESC',
    cloudVsDcNotes: 'Use Jira Issue Statistics gadget grouped by Component or Priority. Both Cloud and DC support grouping by Component to detect which microservice represents the highest risk.',
    recommendedGadgets: [
      {
        name: "Pie Chart",
        type: "Flaw Severity Mix",
        configuration: "Filter: Open Vulnerabilities. Stat Type: Priority.",
        dimensions: "1/2 Column"
      },
      {
        name: "Created vs Resolved Chart",
        type: "Security Flaw Burnup",
        configuration: "Filter: All Security Vulnerabilities; Days: 90; Cumulative: Yes. Confirms whether flaw backlog is shrinking.",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Running security scans only once a year before compliance audits, uncovering 500 flaws simultaneously.",
      "Closing vulnerabilities as 'False Positive' without formal verification by a Security Champion."
    ]
  },
  {
    id: "sec-sca-dependency-cve",
    name: "DevSecOps: Open Source & Third-Party Dependency Risk (SCA / Supply Chain)",
    framework: "DevSecOps",
    category: "Supply Chain & Dependency Security",
    purpose: "Tracks vulnerabilities introduced through external open-source packages, third-party libraries, container base images, and license compliance risks (e.g. Log4j, Spring4Shell).",
    formula: "Vulnerable Dependency Ratio (%) = (Dependencies with Known CVEs / Total Project Dependencies) * 100",
    benchmark: "Target: 0 Critical / High CVEs in production dependencies; 100% of open-source libraries kept within N-1 supported major/minor releases.",
    roles: {
      "scrum-master": {
        status: "Optional",
        reason: "Facilitates pairing sessions for Dependabot / Renovate automated dependency updates."
      },
      "product-owner": {
        status: "Optional",
        reason: "Provides visibility into third-party open-source risk and license compliance liabilities."
      },
      "developer": {
        status: "Mandated",
        reason: "Requires immediate dependency version bumping or patch application when a CVE is disclosed."
      },
      "qa-tester": {
        status: "Optional",
        reason: "Validates regression testing after major third-party library or framework upgrades."
      },
      "rte-delivery": {
        status: "Mandated",
        reason: "Core Software Bill of Materials (SBOM) compliance: guarantees software supply chain security across the ART."
      },
      "executive": {
        status: "Mandated",
        reason: "Shields the enterprise against supply-chain attacks and open-source license infringement lawsuits."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND (labels in ("sca", "dependency", "dependabot", "snyk-sca", "cve", "open-source") OR summary ~ "CVE-" OR summary ~ "dependency") AND statusCategory != "Done" ORDER BY priority ASC, created ASC',
    dataCenterJql: 'project = "{{projectKey}}" AND (labels in ("sca", "dependency", "dependabot", "snyk-sca", "cve", "open-source") OR summary ~ "CVE-" OR summary ~ "dependency") AND status not in ("Done", "Closed", "Resolved") ORDER BY priority ASC, created ASC',
    cloudVsDcNotes: 'Connect Snyk, Mend, or GitHub Dependabot to Jira Cloud / DC via webhooks to auto-populate Jira issues with label "sca" and CVE IDs in the issue summary.',
    recommendedGadgets: [
      {
        name: "Filter Results",
        type: "Supply Chain CVE Watchlist",
        configuration: "Columns: Key, Summary, Priority, Component, Assignee, Created. Real-time vulnerable dependency list.",
        dimensions: "Full Width"
      },
      {
        name: "Two Dimensional Filter Statistics",
        type: "Vulnerable Dependencies by Component",
        configuration: "X-Axis: Priority; Y-Axis: Component.",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Ignoring automated Dependabot pull requests until 47 security PRs pile up and become impossible to test.",
      "Pinning vulnerable library versions permanently because 'upgrading might break our tests'."
    ]
  },
  {
    id: "sec-secrets-credential-leaks",
    name: "DevSecOps: Hardcoded Secrets & Credential Exposure Rate",
    framework: "DevSecOps",
    category: "Secrets & Identity Governance",
    purpose: "Detects and tracks incidents where confidential API keys, SSH private keys, database passwords, or JWT secrets were committed to source code repositories.",
    formula: "Secrets Exposure Rate = Count of Hardcoded Secrets Incidents / Total Commits; Mean Time to Revoke / Invalidate Exposed Secrets (< 1 hour target)",
    benchmark: "Target: ZERO (0) hardcoded credentials committed. Any committed secret requires immediate token invalidation, rotation, and Git history purge within < 1 hour.",
    roles: {
      "scrum-master": {
        status: "Mandated",
        reason: "Leads immediate post-incident retro to ensure team members install pre-commit secret scanners locally."
      },
      "product-owner": {
        status: "Optional",
        reason: "Alerts PO to potential customer credential compromise and security disclosure requirements."
      },
      "developer": {
        status: "Mandated",
        reason: "Zero-tolerance engineering practice: all credentials must use .env, AWS Secrets Manager, or HashiCorp Vault."
      },
      "qa-tester": {
        status: "Optional",
        reason: "Ensures test environments use dummy credentials and never duplicate production tokens."
      },
      "rte-delivery": {
        status: "Mandated",
        reason: "Immediate security release gate: prevents code containing exposed credentials from being packaged into release builds."
      },
      "executive": {
        status: "Mandated",
        reason: "Major breach prevention: exposed credentials represent the #1 vector for cloud account takeovers."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND (labels in ("secret-leak", "credential-exposure", "gitleaks", "gitguardian", "trufflehog") OR summary ~ "secret" OR summary ~ "API key") AND created >= startOfDay("-{{dateWindowDays}}d") ORDER BY created DESC',
    dataCenterJql: 'project = "{{projectKey}}" AND (labels in ("secret-leak", "credential-exposure", "gitleaks", "gitguardian", "trufflehog") OR summary ~ "secret" OR summary ~ "API key") AND created >= -{{dateWindowDays}}d ORDER BY created DESC',
    cloudVsDcNotes: 'Enforce Jira Issue Security Scheme: tickets tagged with "secret-leak" must be set to Security Level = "Confidential / Security Leads Only" so token values are not visible to unauthorized Jira users.',
    recommendedGadgets: [
      {
        name: "Filter Results",
        type: "Secret Exposure Alerts",
        configuration: "Columns: Key, Summary, Priority, Reporter, Created, Status. Displays active secret rotation tickets.",
        dimensions: "1/2 Column"
      },
      {
        name: "Average Age Chart",
        type: "Secret Invalidation Turnaround",
        configuration: "Filter: Secret Exposure Tickets; Period: Daily; Days: 30. Tracks rotation turnaround speed.",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Committing an API key to Git and simply deleting it in a second commit, leaving the secret visible forever in Git history.",
      "Not invalidating the exposed token on the remote service immediately upon detection."
    ]
  },
  {
    id: "sec-cicd-security-gate-pass-rate",
    name: "DevSecOps: CI/CD Security Gate Pass Rate & Shift-Left Efficacy",
    framework: "DevSecOps",
    category: "DevSecOps & Application Security",
    purpose: "Measures the percentage of code commits and pull requests that pass automated security scans (SAST, secret scanning, container linting) without tripping a blocking CI/CD gate.",
    formula: "Security Gate Pass Rate (%) = (Builds Passing Security Scans on First Run / Total CI/CD Pipeline Runs) * 100",
    benchmark: "Target: >= 92% first-time security gate pass rate. Pass rate < 80% indicates developers need IDE security linters or secure coding training.",
    roles: {
      "scrum-master": {
        status: "Mandated",
        reason: "Flags developer friction when security gates fail frequently, indicating missing local developer tooling."
      },
      "product-owner": {
        status: "Optional",
        reason: "Prevents pull requests from being rejected late in the sprint by automated security gates."
      },
      "developer": {
        status: "Mandated",
        reason: "Encourages running IDE security plugins (SonarLint, Snyk IDE) before pushing code to remote CI."
      },
      "qa-tester": {
        status: "Mandated",
        reason: "Validates synchronization between automated functional test pipelines and static security gates."
      },
      "rte-delivery": {
        status: "Mandated",
        reason: "Automated compliance gate: enforces shift-left security policies without manual CAB delays."
      },
      "executive": {
        status: "Mandated",
        reason: "The definitive measure of organizational shift-left maturity: catching flaws at coding time rather than in production."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND (labels in ("security-gate-fail", "sast-blocked", "pipeline-security-blocker") OR issuetype = "Security Gate Failure") AND created >= startOfDay("-{{dateWindowDays}}d") ORDER BY created DESC',
    dataCenterJql: 'project = "{{projectKey}}" AND (labels in ("security-gate-fail", "sast-blocked", "pipeline-security-blocker") OR issuetype = "Security Gate Failure") AND created >= -{{dateWindowDays}}d ORDER BY created DESC',
    cloudVsDcNotes: 'Configure CI/CD runners (GitHub Actions, GitLab CI, Jenkins) to trigger Jira webhooks that auto-log a Jira issue when a PR trips a SonarQube or Checkmarx quality gate.',
    recommendedGadgets: [
      {
        name: "Created vs Resolved Chart",
        type: "Gate Failure Volume",
        configuration: "Filter: Security Gate Failures; Period: Weekly; Cumulative: No. Shows whether security gate failures are declining.",
        dimensions: "Full Width"
      },
      {
        name: "Two Dimensional Filter Statistics",
        type: "Gate Failures by Scanner Type",
        configuration: "X-Axis: Component; Y-Axis: Scanner Type (SAST vs SCA vs Secret).",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Adding 'bypass-security-scan' flags to CI/CD pipelines to push emergency features into production.",
      "Treating security scans as an advisory suggestion rather than a hard build-breaking gate."
    ]
  },
  {
    id: "sec-mttd-incident-containment",
    name: "Cybersecurity: Incident Mean Time to Detect (MTTD) & Breach Containment",
    framework: "DevSecOps",
    category: "Incident Response & SOC Integration",
    purpose: "Measures how quickly the organization detects security intrusions, unauthorized access attempts, or zero-day exploits and successfully establishes containment in production.",
    formula: "MTTD = Sum(Incident Triaged in Jira - Intrusion Timestamp) / Total Incidents; Containment Time = Incident Contained Timestamp - Triaged Timestamp",
    benchmark: "Industry Standard (Mandiant / CrowdStrike 1-10-60 Rule): 1 minute to detect, 10 minutes to investigate, 60 minutes to isolate and contain breach.",
    roles: {
      "scrum-master": {
        status: "Optional",
        reason: "Coordinates crisis communication and sprint backlog reprioritization during security emergencies."
      },
      "product-owner": {
        status: "Optional",
        reason: "Manages customer disclosure, SLA breach communication, and regulatory breach fallout."
      },
      "developer": {
        status: "Mandated",
        reason: "Directly executes emergency mitigations: firewall blocking, credential revocation, and zero-day patching."
      },
      "qa-tester": {
        status: "Optional",
        reason: "Verifies system operational integrity following emergency security containment actions."
      },
      "rte-delivery": {
        status: "Mandated",
        reason: "Coordinates crisis response across ART teams, legal counsel, and enterprise incident response teams."
      },
      "executive": {
        status: "Mandated",
        reason: "Highest-priority enterprise risk metric: governs legal liability, regulatory fines (GDPR, SEC), and business survival."
      }
    },
    cloudJql: 'project = "{{projectKey}}" AND (issuetype in ("Security Incident", "Security Breach") OR labels in ("cyber_incident", "soc_alert", "intrusion", "p0_security")) AND created >= startOfDay("-{{dateWindowDays}}d") ORDER BY priority ASC, created DESC',
    dataCenterJql: 'project = "{{projectKey}}" AND (issuetype in ("Security Incident", "Security Breach") OR labels in ("cyber_incident", "soc_alert", "intrusion", "p0_security")) AND created >= -{{dateWindowDays}}d ORDER BY priority ASC, created DESC',
    cloudVsDcNotes: 'Connect SIEM / SOC platforms (Splunk, Microsoft Sentinel, Datadog Security, CrowdStrike) to Jira Service Management. Automated alert ingestion creates P0/P1 Security Incident tickets with restricted Jira Security Levels.',
    recommendedGadgets: [
      {
        name: "Filter Results",
        type: "Cyber Incident Command Table",
        configuration: "Columns: Key, Summary, Priority, Assignee, Created, Updated, Status. Live security incident tracker.",
        dimensions: "Full Width"
      },
      {
        name: "Average Age Chart",
        type: "Incident Containment Duration",
        configuration: "Filter: Security Incidents; Period: Daily; Days: 60. Displays containment turnaround speed.",
        dimensions: "1/2 Column"
      }
    ],
    antiPatterns: [
      "Failing to conduct a blameless security root-cause analysis (RCA) and retrospective following containment.",
      "Attempting to cover up security incidents to avoid executive embarrassment, violating mandatory regulatory disclosure laws."
    ]
  }
];

module.exports = { METRICS };
