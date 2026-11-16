// Modern Simplified Application Logic for Jira Agile, DORA & DevSecOps Metrics Hub

const state = {
  activeTab: "masterDetail",
  selectedFramework: "all",
  selectedRole: "all",
  selectedMandate: "all",
  searchQuery: "",
  environment: "cloud", // 'cloud' | 'datacenter'
  projectKey: "PROJ",
  boardId: "101",
  sprintField: "Sprint",
  dateWindowDays: 30,
  activeMetricId: "sprint-velocity-predictability",
  metrics: (typeof window !== "undefined" && window.INITIAL_METRICS) ? window.INITIAL_METRICS : [],
  roles: (typeof window !== "undefined" && window.INITIAL_ROLES) ? window.INITIAL_ROLES : [],
  gadgets: (typeof window !== "undefined" && window.INITIAL_GADGETS) ? window.INITIAL_GADGETS : []
};

// Cloud vs DC Comparison Data
const JIRA_COMPARISONS = [
  {
    feature: "Active Sprint Function",
    cloud: "sprint in openSprints() or sprint = openSprints()",
    dataCenter: "sprint in openSprints() (Requires Jira Software 7.0+); or cf[10001] in openSprints()",
    notes: "Cloud supports sprint in futureSprints() and closedSprints() uniformly. DC requires Jira Software add-on enabled for JQL functions."
  },
  {
    feature: "Status Category Mapping",
    cloud: 'statusCategory in ("To Do", "In Progress", "Done")',
    dataCenter: 'status in ("In Progress", "Development", "QA") or statusCategory in (...) in DC 8.x+',
    notes: 'Older Data Center 7.x instances do not index statusCategory reliably. Best practice in DC is to enumerate specific workflow statuses.'
  },
  {
    feature: "Custom Field Referencing",
    cloud: '"Story Points" or "Story point estimate" or cf[10016]',
    dataCenter: '"Story Points" or customfield_10002',
    notes: 'In Cloud Next-Gen projects, Story Points field ID is dynamically allocated. In DC Classic, custom field names can be accessed directly or by cf[ID].'
  },
  {
    feature: "Flagged / Impediment",
    cloud: 'Flagged is not EMPTY or Flagged = "[Impediment]"',
    dataCenter: 'Flagged is not EMPTY or cf[10100] is not EMPTY or status = "Blocked"',
    notes: 'Cloud provides a native visual yellow impediment flag on board cards. DC boards configure Card Colors based on Flagged custom field.'
  },
  {
    feature: "Epic & Hierarchy Linking",
    cloud: 'parent = "KEY-123" or parentEpic = "KEY-123"',
    dataCenter: '"Epic Link" = "KEY-123" or issueFunction in epicsOf("...")',
    notes: 'Jira Cloud unified the hierarchy under the "parent" field. Data Center relies on the classic "Epic Link" custom field or ScriptRunner JQL functions.'
  },
  {
    feature: "Vulnerability & Security Levels",
    cloud: 'issuetype in ("Vulnerability", "Security Finding") AND labels in ("cve", "sast")',
    dataCenter: 'issuetype in ("Vulnerability", "Security Bug") AND security = "Confidential"',
    notes: 'In Jira DC, issue security schemes restrict visibility of zero-day exploits. In Cloud, Snyk and GitHub Advanced Security integrate natively.'
  },
  {
    feature: "CI/CD & Deployment Triggers",
    cloud: 'development[deployments].state = "successful" or fixVersion in releasedVersions()',
    dataCenter: '"Deployment Environment" ~ "Production" or status = "Released"',
    notes: 'Jira Cloud captures pipeline deployments natively. Data Center relies on DVCS connectors or automated release transition webhooks.'
  }
];

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  initEventListeners();
  loadData();
});

/**
 * Attaches UI Event Listeners
 */
function initEventListeners() {
  // Navigation Links
  document.querySelectorAll(".nav-link").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-link").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.activeTab = btn.dataset.tab;
      renderActiveTab();
    });
  });

  // Target Dialect Switcher (Cloud vs DC)
  document.querySelectorAll(".env-switch-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".env-switch-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.environment = btn.dataset.env;
      renderActiveTab();
    });
  });

  // Global Parameter Inputs
  const projectInput = document.getElementById("inputProjectKey");
  if (projectInput) {
    projectInput.addEventListener("input", (e) => {
      state.projectKey = e.target.value.trim().toUpperCase() || "PROJ";
      debounceRefresh();
    });
  }

  const boardInput = document.getElementById("inputBoardId");
  if (boardInput) {
    boardInput.addEventListener("input", (e) => {
      state.boardId = e.target.value.trim() || "101";
      debounceRefresh();
    });
  }

  const daysInput = document.getElementById("inputDateDays");
  if (daysInput) {
    daysInput.addEventListener("input", (e) => {
      state.dateWindowDays = parseInt(e.target.value, 10) || 30;
      debounceRefresh();
    });
  }

  // Framework Dropdown
  const fwSelect = document.getElementById("selectFramework");
  if (fwSelect) {
    fwSelect.addEventListener("change", (e) => {
      state.selectedFramework = e.target.value;
      autoSelectFirstMatchingMetric();
      renderActiveTab();
    });
  }

  // Role Dropdown
  const roleSelect = document.getElementById("selectRole");
  if (roleSelect) {
    roleSelect.addEventListener("change", (e) => {
      state.selectedRole = e.target.value;
      autoSelectFirstMatchingMetric();
      renderActiveTab();
    });
  }

  // Mandate Dropdown
  const mandateSelect = document.getElementById("selectMandate");
  if (mandateSelect) {
    mandateSelect.addEventListener("change", (e) => {
      state.selectedMandate = e.target.value;
      autoSelectFirstMatchingMetric();
      renderActiveTab();
    });
  }

  // Search Input
  const searchInput = document.getElementById("inputQuickSearch");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      debounceRefresh();
    });
  }
}

let debounceTimer;
function debounceRefresh() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    autoSelectFirstMatchingMetric();
    renderActiveTab();
  }, 200);
}

/**
 * Loads data from embedded bundle or API
 */
async function loadData() {
  if (state.metrics.length > 0) {
    autoSelectFirstMatchingMetric();
    renderActiveTab();
  }

  try {
    const [rolesRes, metricsRes] = await Promise.all([
      fetch("/api/roles"),
      fetch("/api/metrics")
    ]);
    if (rolesRes.ok && metricsRes.ok) {
      const rolesData = await rolesRes.json();
      const metricsData = await metricsRes.json();
      state.roles = rolesData.roles;
      state.metrics = metricsData.metrics;
      autoSelectFirstMatchingMetric();
      renderActiveTab();
    }
  } catch (err) {
    console.info("Using embedded offline bundle.");
  }
}

/**
 * Automatically sets the activeMetricId to the first item matching current filters
 */
function autoSelectFirstMatchingMetric() {
  const filtered = getFilteredMetricsList();
  if (filtered.length > 0) {
    const stillPresent = filtered.some(m => m.id === state.activeMetricId);
    if (!stillPresent) {
      state.activeMetricId = filtered[0].id;
    }
  } else {
    state.activeMetricId = null;
  }
}

/**
 * Filters the metrics list based on active dropdowns and search
 */
function getFilteredMetricsList() {
  const query = state.searchQuery.toLowerCase().trim();

  return state.metrics.filter(m => {
    // Framework filter
    if (state.selectedFramework !== "all") {
      const sf = state.selectedFramework;
      const mf = m.framework.toLowerCase();
      if (sf === "dora") {
        if (mf !== "dora") return false;
      } else if (sf === "devsecops") {
        if (mf !== "devsecops") return false;
      } else {
        if (mf !== sf && mf !== "hybrid") return false;
      }
    }

    // Role & Mandate filter
    if (state.selectedRole !== "all") {
      const roleConfig = m.roles[state.selectedRole];
      if (!roleConfig || roleConfig.status === "N/A") return false;

      if (state.selectedMandate === "mandated" && roleConfig.status !== "Mandated") return false;
      if (state.selectedMandate === "optional" && roleConfig.status !== "Optional") return false;
    } else if (state.selectedMandate !== "all") {
      const matchesMandate = Object.values(m.roles).some(r =>
        state.selectedMandate === "mandated" ? r.status === "Mandated" : r.status === "Optional"
      );
      if (!matchesMandate) return false;
    }

    // Text search query
    if (query) {
      const targetText = `${m.name} ${m.purpose} ${m.category} ${m.formula} ${m.cloudJql} ${m.dataCenterJql}`.toLowerCase();
      if (!targetText.includes(query)) return false;
    }

    return true;
  });
}

/**
 * Renders the active tab
 */
function renderActiveTab() {
  const container = document.getElementById("mainWorkspaceContainer");
  const filterDeck = document.getElementById("filterDeckContainer");
  if (!container) return;

  // Show filter deck on masterDetail, hide or adjust on other tabs
  if (state.activeTab === "masterDetail") {
    if (filterDeck) filterDeck.style.display = "grid";
    renderMasterDetailView(container);
  } else if (state.activeTab === "blueprints") {
    if (filterDeck) filterDeck.style.display = "none";
    renderBlueprintsView(container);
  } else if (state.activeTab === "reference") {
    if (filterDeck) filterDeck.style.display = "none";
    renderReferenceView(container);
  }
}

/**
 * Renders the clean Master-Detail layout
 */
function renderMasterDetailView(container) {
  const filtered = getFilteredMetricsList();
  const isCloud = state.environment === "cloud";

  // Update counts in dropdown labels
  const fwHint = document.getElementById("frameworkCountHint");
  if (fwHint) fwHint.textContent = `(${filtered.length} found)`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="background: #ffffff; border: 1px dashed var(--border); border-radius: var(--radius); padding: 50px 20px; text-align: center;">
        <h3 style="font-size: 18px; color: #475569; margin-bottom: 8px;">No metrics match your current filter selection</h3>
        <p style="font-size: 14px; color: #64748b; margin-bottom: 16px;">
          Try selecting <strong>'All Frameworks'</strong> or <strong>'All Roles'</strong> from the dropdowns above.
        </p>
        <button id="btnResetAllFilters" class="btn-primary" style="background:#2563eb; color:white; border:none; padding:8px 18px; border-radius:6px; cursor:pointer; font-weight:600;">
          Reset All Dropdowns
        </button>
      </div>
    `;
    document.getElementById("btnResetAllFilters")?.addEventListener("click", () => {
      document.getElementById("selectFramework").value = "all";
      document.getElementById("selectRole").value = "all";
      document.getElementById("selectMandate").value = "all";
      document.getElementById("inputQuickSearch").value = "";
      state.selectedFramework = "all";
      state.selectedRole = "all";
      state.selectedMandate = "all";
      state.searchQuery = "";
      autoSelectFirstMatchingMetric();
      renderActiveTab();
    });
    return;
  }

  // Active metric
  const activeMetric = state.metrics.find(m => m.id === state.activeMetricId) || filtered[0];

  container.innerHTML = `
    <div class="workspace-grid">
      <!-- LEFT COLUMN: Metric Directory List -->
      <aside class="sidebar-panel">
        <div class="sidebar-header">
          <span>MATCHING METRICS DIRECTORY</span>
          <span class="sidebar-count-badge">${filtered.length}</span>
        </div>
        <div class="sidebar-list">
          ${filtered.map(m => {
            const isSelected = m.id === activeMetric.id;
            let mandateStatus = "Universal";
            if (state.selectedRole !== "all" && m.roles[state.selectedRole]) {
              mandateStatus = m.roles[state.selectedRole].status;
            }
            return `
              <div class="sidebar-item ${isSelected ? 'active' : ''}" data-metric-id="${m.id}">
                <div class="sidebar-item-header">
                  <span class="badge badge-${m.framework.toLowerCase()}">${m.framework}</span>
                  ${mandateStatus === 'Mandated' ? '<span class="badge badge-mandated">🔒 Mandated</span>' : ''}
                  ${mandateStatus === 'Optional' ? '<span class="badge badge-optional">⭐ Optional</span>' : ''}
                </div>
                <div class="sidebar-item-name">${escapeHtml(m.name)}</div>
                <div class="sidebar-item-meta">
                  <span>${escapeHtml(m.category)}</span>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </aside>

      <!-- RIGHT COLUMN: Deep-Dive Metric Dossier -->
      <section class="detail-stage" id="metricDetailStage">
        ${renderMetricDossier(activeMetric, isCloud)}
      </section>
    </div>
  `;

  // Attach sidebar item click listener
  container.querySelectorAll(".sidebar-item").forEach(item => {
    item.addEventListener("click", () => {
      state.activeMetricId = item.dataset.metricId;
      renderActiveTab();
      // Scroll to top of stage
      document.getElementById("metricDetailStage")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Attach copy listeners
  container.querySelectorAll(".copy-btn").forEach(btn => {
    btn.addEventListener("click", () => copyToClipboard(btn.dataset.jql, btn));
  });
}

/**
 * Generates the in-depth dossier for a single metric
 */
function renderMetricDossier(metric, isCloud) {
  const activeJql = isCloud ? interpolate(metric.cloudJql) : interpolate(metric.dataCenterJql);
  const altJql = !isCloud ? interpolate(metric.cloudJql) : interpolate(metric.dataCenterJql);

  // Role Governance Banner
  let governanceBannerHtml = "";
  if (state.selectedRole !== "all") {
    const roleInfo = metric.roles[state.selectedRole];
    const roleObj = state.roles.find(r => r.id === state.selectedRole);
    if (roleInfo) {
      const isMandated = roleInfo.status === "Mandated";
      governanceBannerHtml = `
        <div class="mandate-banner ${isMandated ? 'is-mandated' : 'is-optional'}">
          <span style="font-size: 20px;">${isMandated ? '🔒' : '⭐'}</span>
          <div>
            <strong>GOVERNANCE STATUS FOR ${escapeHtml(roleObj?.name.toUpperCase() || state.selectedRole.toUpperCase())}:</strong>
            <span class="badge ${isMandated ? 'badge-mandated' : 'badge-optional'}" style="margin-left: 8px;">
              ${isMandated ? 'MANDATED (REQUIRED)' : 'OPTIONAL (DIAGNOSTIC)'}
            </span>
            <p style="margin-top: 4px; line-height: 1.5;">${escapeHtml(roleInfo.reason)}</p>
          </div>
        </div>
      `;
    }
  } else {
    // Universal view: list breakdown across all roles
    const mandatedRoles = Object.entries(metric.roles)
      .filter(([_, r]) => r.status === "Mandated")
      .map(([id]) => state.roles.find(r => r.id === id)?.name || id);

    governanceBannerHtml = `
      <div class="mandate-banner is-universal">
        <span style="font-size: 18px;">👥</span>
        <div>
          <strong>Role Governance Breakdown:</strong>
          <span style="color:#dc2626; font-weight:700;"> Mandated for:</span> ${mandatedRoles.join(", ")}.
          <span style="color:#64748b;"> (Select a specific role in the dropdown above to view role-specific governance rationale).</span>
        </div>
      </div>
    `;
  }

  // Worked Example Generator
  const workedExample = generateWorkedExample(metric);

  return `
    <!-- 1. Dossier Header -->
    <div class="dossier-header">
      <div class="dossier-tag-row">
        <span class="badge badge-${metric.framework.toLowerCase()}">${metric.framework}</span>
        <span class="badge" style="background:#f1f5f9; color:#475569;">${escapeHtml(metric.category)}</span>
        <span style="font-size:12px; color:#64748b; margin-left:auto;">ID: <code>${metric.id}</code></span>
      </div>
      <h2 class="dossier-title">${escapeHtml(metric.name)}</h2>
      <p class="dossier-purpose-lead">${escapeHtml(metric.purpose)}</p>
    </div>

    <!-- Governance Highlight Banner -->
    ${governanceBannerHtml}

    <!-- 2. Detailed Business & Delivery Explanation -->
    <div class="section-card">
      <div class="section-card-title">📖 In-Depth Explanation & What This Measures</div>
      <p style="color: #334155; line-height: 1.7; font-size: 14px;">
        ${getDeepExplanation(metric)}
      </p>
    </div>

    <!-- 3. Mathematical Formula & Worked Example -->
    <div class="section-card">
      <div class="section-card-title">📐 Measurement Formula & Realistic Worked Example</div>
      <div class="formula-box">
        // Standard Formula Definition
        ${escapeHtml(metric.formula)}
      </div>
      <div class="worked-example-box">
        <strong>💡 Real-World Scenario & Calculation Walkthrough:</strong>
        <p style="margin-top: 4px; line-height: 1.6;">${workedExample}</p>
      </div>
    </div>

    <!-- 4. Health Benchmarks & Targets -->
    <div class="section-card">
      <div class="section-card-title">🎯 Health Thresholds & Industry Benchmarks</div>
      <div style="background: #ffffff; border: 1px solid var(--border-light); padding: 12px 16px; border-radius: 6px; font-size: 13px; line-height: 1.6; color: #1e293b;">
        ${escapeHtml(metric.benchmark)}
      </div>
    </div>

    <!-- 5. Dual JQL Query Workbench -->
    <div class="section-card" style="background: #ffffff;">
      <div class="section-card-title" style="justify-content: space-between;">
        <span>💻 Production Jira Query Language (JQL)</span>
        <span style="font-size: 11px; text-transform: none; color: #64748b;">
          Bound to Project: <strong>${state.projectKey}</strong> | Board: <strong>${state.boardId}</strong> | Lookback: <strong>${state.dateWindowDays}d</strong>
        </span>
      </div>

      <div class="jql-workbench">
        <div class="jql-workbench-header">
          <span class="jql-env-badge">
            ${isCloud ? '☁️ Jira Cloud Production JQL' : '🏢 Jira Data Center Production JQL'}
          </span>
          <button class="copy-btn" data-jql="${escapeHtml(activeJql)}">
            📋 Copy JQL Query
          </button>
        </div>
        <div class="jql-code-pane">${escapeHtml(activeJql)}</div>
      </div>

      <!-- Dialect Architecture Note -->
      <div class="dialect-note">
        <strong>💡 Jira Platform Dialect Nuance:</strong>
        <p style="margin-top: 2px;">${escapeHtml(metric.cloudVsDcNotes || "Compatible across Jira Cloud and Jira Data Center.")}</p>
        <div style="margin-top: 6px; font-size: 12px; color: #475569;">
          <strong>Alternative (${isCloud ? 'Data Center' : 'Cloud'}):</strong>
          <code style="background: #ffffff; padding: 2px 6px; border-radius: 4px; word-break: break-all;">${escapeHtml(altJql)}</code>
        </div>
      </div>
    </div>

    <!-- 6. Jira Dashboard Gadget Setup Guide -->
    <div class="section-card">
      <div class="section-card-title">🛠️ Step-by-Step Jira Dashboard & Gadget Blueprint</div>
      <p style="font-size: 13px; color: #64748b; margin-bottom: 8px;">
        To display this metric on your team or leadership dashboard in Jira:
      </p>
      ${(metric.recommendedGadgets || []).map((g, idx) => `
        <div class="gadget-card">
          <div class="gadget-name">Step ${idx + 1}: Add '${escapeHtml(g.name)}' (${escapeHtml(g.type)})</div>
          <div class="gadget-instruction">
            <strong>Configuration:</strong> ${escapeHtml(interpolate(g.configuration))} 
            <span style="color:#64748b; margin-left: 8px;">(Suggested Layout: ${escapeHtml(g.dimensions)})</span>
          </div>
        </div>
      `).join("")}
    </div>

    <!-- 7. Anti-Patterns & Pitfalls -->
    ${metric.antiPatterns && metric.antiPatterns.length > 0 ? `
      <div class="antipattern-list">
        <strong>⚠️ Anti-Patterns, Dysfunctions & Gaming Risks to Avoid:</strong>
        <ul>
          ${metric.antiPatterns.map(ap => `<li>${escapeHtml(ap)}</li>`).join("")}
        </ul>
      </div>
    ` : ''}
  `;
}

/**
 * Deep, thorough explanations for metrics
 */
function getDeepExplanation(metric) {
  const deepNotes = {
    "sprint-velocity-predictability": "Sprint Velocity and Say-Do ratio measure how effectively a Scrum team forecasts and executes on commitments. Rather than evaluating individual typing speed, this metric evaluates team estimation maturity, sprint boundary protection, and scope stability. When Say-Do ratio stabilizes between 85% and 100%, Product Owners and Release Train Engineers can forecast multi-quarter roadmap features with high statistical confidence.",
    "sprint-burndown-hours-points": "The Sprint Burndown is the operational pulse of the active sprint. It provides day-to-day visual telemetry comparing actual remaining story points or hours against the ideal linear guideline slope. An ideal burndown descends steadily throughout the iteration. Cliff-diving in the final 24 hours warns of large batch sizes and mini-waterfall testing bottlenecks, while upward slopes expose mid-sprint scope injection without team consent.",
    "cycle-time-percentile": "Cycle Time is the elapsed calendar time from when an engineer moves a ticket to 'In Progress' until it is verified 'Done'. Lean and Kanban principles mandate using the 85th and 95th percentiles rather than the average (mean), because averages conceal long-tail catastrophic delays. This percentile establishes the team's Service Level Expectation (SLE): e.g., '85% of our stories complete within 6 calendar days'.",
    "work-in-progress-wip-limits": "Work In Progress (WIP) directly governs delivery velocity via Little's Law (Cycle Time = WIP / Throughput). When teams multitask across 4 stories per person, context switching degrades delivery speed by up to 40%. Enforcing strict WIP limits on Kanban columns forces swarming, surfaces hidden impediments, and ensures work is finished before new tasks are started.",
    "dora-deployment-frequency": "Deployment Frequency is the primary DORA delivery cadence metric. It proves whether software delivery pipelines support continuous value delivery in small, testable increments or are constrained by painful, high-risk batch releases. Elite performers release multiple times per day on-demand via trunk-based CI/CD pipelines.",
    "dora-lead-time-for-changes": "Lead Time for Changes tracks the duration from code commit to running successfully in production. It exposes non-coding organizational friction: delayed pull-request reviews, manual CAB approval meetings, long-lived staging environments, and slow automated regression test suites. Elite engineering organizations achieve lead times under 1 hour.",
    "dora-change-failure-rate": "Change Failure Rate (CFR) reflects pre-release quality and automated testing validity. It measures what percentage of production releases trigger an outage, service degradation, hotfix, or rollback. Elite teams maintain CFR between 0% and 5% through automated canary analysis and comprehensive unit/integration test gates.",
    "sec-mttr-vulnerability-sla": "Vulnerability MTTR tracks how quickly detected security flaws (SAST, DAST, SCA, Cloud Misconfigurations) are patched and promoted to live environments. In regulated environments (SOC2, PCI-DSS, ISO27001), Critical CVSS 9.0+ vulnerabilities carry a mandatory 24-48 hour remediation SLA. Failure to meet this SLA halts automated release promotions.",
    "sec-secrets-credential-leaks": "Secret scanning detects instances where database passwords, API keys, or private SSH tokens were committed to source control. Hardcoded credentials represent the primary initial access vector for enterprise data breaches. Best practice mandates automated pre-commit hook prevention and instantaneous token invalidation within 60 minutes."
  };

  return deepNotes[metric.id] || `${metric.purpose} This metric provides non-negotiable delivery telemetry, ensuring engineering teams maintain continuous flow, adhere to architectural standards, and deliver reliable value to customers.`;
}

/**
 * Generates realistic numerical scenarios for the worked example
 */
function generateWorkedExample(metric) {
  const examples = {
    "sprint-velocity-predictability": "During Sprint Planning, the team commits to 40 Story Points across 8 stories. At sprint close, 7 stories totaling 34 Story Points are verified in 'Done' status, while 1 story (6 pts) is carried over. Calculation: Say-Do Ratio = (34 / 40) * 100 = 85.0% (Meets the healthy 85-100% predictability threshold).",
    "sprint-burndown-hours-points": "Total committed sprint scope is 50 Story Points on Day 1. By Day 5 (mid-sprint), the team has burned down 22 points, leaving 28 points remaining against an ideal guideline of 25 points. This 3-point delta indicates healthy flow with minor swarming recommended on older in-progress items.",
    "cycle-time-percentile": "A team resolves 20 user stories over 30 days. Their individual cycle times (sorted ascending) are: 2, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 8, 8, 9, 11, 14, 22 days. The 85th percentile (17th item) is 9 days. SLE Target: The team can promise stakeholders that 85% of standard user stories ship in <= 9 days.",
    "work-in-progress-wip-limits": "A Scrum team of 5 engineers has 12 stories in 'In Progress', 'In Code Review', and 'In QA'. WIP Ratio = 12 items / 5 engineers = 2.4 items/engineer (Exceeds the 1.5 limit). The team halts pulling new backlog stories and pairs to review and verify open PRs.",
    "dora-deployment-frequency": "Over a 30-day lookback window, the payments microservice deploys 24 successful production releases. Deployment Frequency = 24 / 30 = 0.8 deploys/day (Meets DORA 'High Performer' benchmark of once per day).",
    "dora-change-failure-rate": "A service executes 40 production deployments in a month. 2 deployments caused a P1 incident and required an emergency rollback hotfix. CFR = (2 / 40) * 100 = 5.0% (Meets DORA 'Elite Performer' tier of <= 5%).",
    "sec-mttr-vulnerability-sla": "A Snyk scan flags a Critical CVSS 9.8 remote code execution CVE in a package at 09:00 Monday. The team upgrades the library and deploys the fix to production at 15:30 the same day. Remediation turnaround = 6.5 hours (Within the mandatory 24-hour Critical SLA window)."
  };

  return examples[metric.id] || `Calculation: Input project parameters into the formula: ${metric.formula}. Compare the calculated outcome against the target benchmark: ${metric.benchmark}.`;
}

/**
 * Tab 2: Role Dashboard Blueprints View
 */
async function renderBlueprintsView(container) {
  const currentRoleId = state.selectedRole === "all" ? "scrum-master" : state.selectedRole;
  const isCloud = state.environment === "cloud";

  let blueprintData;
  try {
    const res = await fetch(`/api/dashboards/blueprint?roleId=${currentRoleId}&environment=${state.environment}&projectKey=${state.projectKey}&boardId=${state.boardId}`);
    if (res.ok) blueprintData = await res.json();
  } catch (e) {
    console.warn("Using offline blueprint compilation");
  }

  // Compile offline fallback blueprint if API unavailable
  if (!blueprintData) {
    const roleObj = state.roles.find(r => r.id === currentRoleId) || state.roles[0];
    const roleMetrics = state.metrics.filter(m => m.roles[currentRoleId] && m.roles[currentRoleId].status !== "N/A");
    roleMetrics.sort((a, b) => {
      const aMan = a.roles[currentRoleId].status === "Mandated";
      const bMan = b.roles[currentRoleId].status === "Mandated";
      return aMan === bMan ? 0 : aMan ? -1 : 1;
    });

    blueprintData = {
      roleId: roleObj.id,
      roleName: roleObj.name,
      environment: isCloud ? "Jira Cloud" : "Jira Data Center",
      dashboardTitle: `${roleObj.name} - Agile Observability Dashboard (${isCloud ? "Cloud" : "Data Center"})`,
      suggestedLayout: "Two Equal Columns (50% / 50%)",
      mandatedGadgets: roleMetrics.filter(m => m.roles[currentRoleId].status === "Mandated").length,
      optionalGadgets: roleMetrics.filter(m => m.roles[currentRoleId].status === "Optional").length,
      setupInstructions: [
        `1. Log into your ${isCloud ? "Jira Cloud" : "Jira Data Center"} instance.`,
        `2. Go to Dashboards -> 'Create Dashboard', name it: '${roleObj.name} - Observability Hub'.`,
        `3. Set the layout to 'Two Equal Columns'.`,
        `4. Add the gadgets listed below in priority sequence. Save the corresponding JQL as shared Jira Filters.`
      ],
      widgets: roleMetrics.map(m => ({
        metricName: m.name,
        category: m.category,
        governanceStatus: m.roles[currentRoleId].status,
        recommendedGadget: (m.recommendedGadgets && m.recommendedGadgets[0]?.name) || "Filter Results",
        filterJql: isCloud ? interpolate(m.cloudJql) : interpolate(m.dataCenterJql),
        gadgetConfig: (m.recommendedGadgets && m.recommendedGadgets[0]?.configuration) || "Default",
        benchmark: m.benchmark
      }))
    };
  }

  container.innerHTML = `
    <div style="background:#ffffff; border: 1px solid var(--border); border-radius: var(--radius); padding: 22px; margin-bottom: 20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
        <div>
          <h2 style="font-size: 20px; font-weight: 800; color: #0f172a;">📋 ${escapeHtml(blueprintData.dashboardTitle)}</h2>
          <p style="font-size: 13px; color: #64748b; margin-top: 4px;">
            Target Role: <strong>${escapeHtml(blueprintData.roleName)}</strong> • Contains <strong>${blueprintData.mandatedGadgets} Mandated</strong> & <strong>${blueprintData.optionalGadgets} Optional</strong> Gadgets
          </p>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn-primary" id="btnExportMarkdown" style="background:#2563eb; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:600;">
            📥 Export Markdown Blueprint
          </button>
          <button class="btn-primary" style="background:#334155; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:600;" onclick="window.print()">
            🖨️ Print Setup Sheet
          </button>
        </div>
      </div>
    </div>

    <!-- Setup Guide Card -->
    <div class="setup-guide-card" style="background:#ffffff; border:1px solid var(--border); border-radius:var(--radius); padding:16px 20px; margin-bottom:20px;">
      <h4 style="font-size:14px; font-weight:700; color:#1e293b; margin-bottom:8px;">🛠️ Jira Dashboard Setup Procedure</h4>
      <ol style="padding-left:20px; font-size:13px; color:#334155; line-height:1.7;">
        ${blueprintData.setupInstructions.map(s => `<li>${escapeHtml(s)}</li>`).join("")}
      </ol>
    </div>

    <!-- Blueprint Table -->
    <table class="blueprint-table">
      <thead>
        <tr>
          <th style="width: 50px;">Seq</th>
          <th style="width: 130px;">Governance</th>
          <th style="width: 220px;">Metric Name</th>
          <th style="width: 170px;">Target Gadget</th>
          <th>JQL Filter Query (${isCloud ? 'Cloud' : 'Data Center'})</th>
          <th style="width: 220px;">Benchmark Target</th>
        </tr>
      </thead>
      <tbody>
        ${blueprintData.widgets.map((w, idx) => `
          <tr>
            <td style="font-weight:700; color:#64748b;">#${idx + 1}</td>
            <td>
              <span class="badge ${w.governanceStatus === 'Mandated' ? 'badge-mandated' : 'badge-optional'}">
                ${w.governanceStatus === 'Mandated' ? '🔒 MANDATED' : '⭐ OPTIONAL'}
              </span>
            </td>
            <td><strong>${escapeHtml(w.metricName)}</strong></td>
            <td><span class="badge" style="background:#eff6ff; color:#1d4ed8;">${escapeHtml(w.recommendedGadget)}</span></td>
            <td>
              <div style="background:#0f172a; padding:8px 12px; border-radius:6px; position:relative;">
                <code style="color:#38bdf8; font-size:12px; word-break:break-all;">${escapeHtml(w.filterJql)}</code>
                <button class="copy-btn" data-jql="${escapeHtml(w.filterJql)}" style="margin-top:6px; font-size:11px; padding:2px 8px;">
                  📋 Copy Filter JQL
                </button>
              </div>
            </td>
            <td style="font-size:12px; color:#475569;">${escapeHtml(w.benchmark)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  // Attach copy listeners
  container.querySelectorAll(".copy-btn").forEach(btn => {
    btn.addEventListener("click", () => copyToClipboard(btn.dataset.jql, btn));
  });

  document.getElementById("btnExportMarkdown")?.addEventListener("click", () => {
    let md = `# ${blueprintData.dashboardTitle}\n\n`;
    md += `**Environment:** ${blueprintData.environment}\n`;
    md += `**Role:** ${blueprintData.roleName}\n\n`;
    md += `## Configuration Matrix\n\n`;
    md += `| Seq | Status | Metric | Gadget | Benchmark | JQL Query |\n`;
    md += `| :---: | :---: | :--- | :--- | :--- | :--- |\n`;
    blueprintData.widgets.forEach((w, idx) => {
      md += `| ${idx + 1} | ${w.governanceStatus} | ${w.metricName} | ${w.recommendedGadget} | ${w.benchmark} | \`${w.filterJql}\` |\n`;
    });
    downloadFile(`${blueprintData.roleId}-dashboard-blueprint.md`, md, "text/markdown");
  });
}

/**
 * Tab 3: Cloud vs DC Reference Guide View
 */
function renderReferenceView(container) {
  container.innerHTML = `
    <div style="background:#ffffff; border: 1px solid var(--border); border-radius: var(--radius); padding: 22px; margin-bottom: 20px;">
      <h2 style="font-size: 20px; font-weight: 800; color: #0f172a;">📘 Jira Cloud vs Jira Data Center: Technical Reference Guide</h2>
      <p style="font-size: 13px; color: #64748b; margin-top: 4px;">
        Architectural syntax variations, custom field ID schemas, and Lucene search differences across platforms.
      </p>
    </div>

    <table class="diff-table">
      <thead>
        <tr>
          <th style="width: 180px;">Capability</th>
          <th style="width: 320px;">☁️ Jira Cloud Dialect</th>
          <th style="width: 320px;">🏢 Jira Data Center Dialect</th>
          <th>Implementation Strategy & Notes</th>
        </tr>
      </thead>
      <tbody>
        ${JIRA_COMPARISONS.map(c => `
          <tr>
            <td><strong>${escapeHtml(c.feature)}</strong></td>
            <td><code>${escapeHtml(c.cloud)}</code></td>
            <td><code>${escapeHtml(c.dataCenter)}</code></td>
            <td>${escapeHtml(c.notes)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

/**
 * Helper: Interpolates parameters in JQL
 */
function interpolate(template) {
  if (!template) return "";
  return template
    .replace(/\{\{projectKey\}\}/g, state.projectKey)
    .replace(/\{\{boardId\}\}/g, state.boardId)
    .replace(/\{\{sprintField\}\}/g, state.sprintField)
    .replace(/\{\{dateWindowDays\}\}/g, state.dateWindowDays);
}

/**
 * Helper: Copies text to clipboard
 */
function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.innerHTML;
    btn.classList.add("copied");
    btn.innerHTML = "✓ Copied!";
    setTimeout(() => {
      btn.classList.remove("copied");
      btn.innerHTML = orig;
    }, 2000);
  });
}

/**
 * Helper: Downloads file
 */
function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * HTML Escaper
 */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
