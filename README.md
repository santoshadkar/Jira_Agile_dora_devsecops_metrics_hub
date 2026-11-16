# 🎯 Jira Agile Metrics & JQL Navigator Hub

> **A central, production-ready enterprise web portal providing exhaustive metrics for Scrum and Kanban projects in Jira, complete with role-wise governance (Mandated vs. Optional), dual Jira Cloud & Data Center JQL queries, and Jira Dashboard creation blueprints.**

---

## 🌟 Key Features

1. **Role-Wise Metrics & Governance Matrix**:
   - Filter metrics across 6 key Agile roles:
     - **Scrum Master / Agile Coach (SM)**
     - **Product Owner / Product Manager (PO)**
     - **Dev Team / Tech Lead / Engineers (DEV)**
     - **QA / Quality Analyst / Test Lead (QA)**
     - **Release Train Engineer / Delivery Manager (RTE)**
     - **Executive Leadership / PMO / Business Owners (EXEC)**
   - Clear classification: **🔒 Mandated** (core compliance/delivery signals) vs **⭐ Optional** (diagnostic/deep-dive metrics), with explicit governance rationales.

2. **Dual Jira Cloud & Jira Data Center JQL Engine**:
   - Simultaneous, verified JQL syntax generation for both **Jira Cloud** (e.g. `statusCategory`, `openSprints()`) and **Jira Data Center** (e.g. exact status lists, custom field ID references).
   - Real-time parameter binding: customize `Project Key`, `Board ID`, lookback days, and sprint fields across all queries in real-time.
   - 1-Click **Copy JQL** to clipboard.

3. **Jira Dashboard Blueprint Builder**:
   - Pre-assembled dashboard recipes for each role.
   - Recommended Jira Dashboard Gadgets (*Filter Results*, *Two-Dimensional Filter Statistics*, *Sprint Burndown*, *Created vs. Resolved Chart*, *Average Age Chart*, *Pie Chart*, etc.).
   - Exact configuration parameters, gadget dimensions, and layout recommendations.
   - 1-Click export to **Markdown** or **JSON**, plus print-friendly setup sheets.

4. **Interactive JQL Sandbox & Syntax Comparator**:
   - Side-by-side Cloud vs. Data Center query comparison.
   - Deep-dive architectural notes on Jira indexing and function variations.

5. **Exhaustive Agile, DORA & DevSecOps Metrics Repository**:
   - **Scrum Metrics**: Velocity & Say-Do Ratio, Sprint Burndown, Mid-Sprint Scope Creep, Sprint Spillover, Blocked/Flagged Items Age, Sprint Goal Completion Rate, Unplanned Emergencies.
   - **Kanban & Flow Metrics**: Cycle Time (85th/95th percentile), Work In Progress (WIP) vs Limits, Work Item Age (WIA), Throughput Cadence, Flow Efficiency (Active vs Wait time), Flow Distribution (Features vs Debt vs Bugs vs Risks).
   - **DORA Metrics**: Deployment Frequency (DF), Lead Time for Changes (LTTC), Change Failure Rate (CFR), Time to Restore Service (MTTR / TTRS), and Operational Reliability (SLO Error Budget Burn).
   - **DevSecOps & Cybersecurity Metrics**: Vulnerability MTTR-V & SLA Breaches (CVSS Critical < 48h), Open Flaw Density Backlog, Software Supply Chain / SCA Dependency CVEs, Hardcoded Secrets & Credential Exposure Rate, CI/CD Security Gate Pass Rate, and Cyber Incident Mean Time to Detect (MTTD) & Containment.
   - **Quality & Engineering Health**: Escaped Production Defects, Defect Severity Distribution (P1/P2), Mean Time to Resolve (MTTR), Reopened Defect Rate, Technical Debt Ratio.
   - **Backlog & Value Delivery**: Backlog Ready Depth (Definition of Ready Buffer), Epic/Release Burnup Forecast, Cross-Team ART Dependencies, Stale Backlog Rot (> 90 Days).

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+ or v24+)

### 2. Run the Portal Locally
Navigate to the project directory:
```bash
cd "C:\Users\anany\.gemini\antigravity\scratch\jira-metrics-hub"
```

Start the application:
```bash
npm start
```

Open your browser and navigate to:
```
http://localhost:3000
```

### 3. Run Automated Tests
```bash
npm test
```
*(Runs 14 automated unit and integration tests across data integrity, JQL generation, and REST API).*

### 4. Run Linter / Syntax Verification
```bash
npm run lint
```

---

## 📂 Project Directory Structure

```
jira-metrics-hub/
├── .env                          # Environment configuration (PORT, HOST, DEFAULTS)
├── .env.example                  # Environment template
├── package.json                  # Scripts & metadata
├── README.md                     # Documentation
├── docs/                         # Enterprise SAFe & Architecture Governance
│   ├── pi_planning_board.md      # RTE PI Planning Gate Document
│   ├── api_spec.json             # Solutions Architect OpenAPI 3.0 Specification
│   ├── qa_test_report.md         # QA Audit & CAB Compliance Approval (100% Pass)
│   └── retrospective.md          # Agile Coach Inspect & Adapt (I&A) Report
├── src/                          # Modular Backend & Business Logic
│   ├── server.js                 # REST API & Static Asset Server
│   ├── data/
│   │   ├── metricsData.js        # Comprehensive Agile Metrics Knowledge Base
│   │   ├── rolesData.js          # Role Governance Taxonomy & Focus Areas
│   │   └── gadgetsData.js        # Standard Jira Dashboard Gadgets Catalog
│   └── services/
│       ├── jqlService.js         # Cloud & DC JQL Interpolation Engine
│       └── metricService.js      # Filter, Search, & Dashboard Blueprint Generator
├── public/                       # Responsive Single-Page Web Portal
│   ├── index.html                # Modern semantic HTML5 layout
│   ├── app.css                   # Enterprise CSS styling
│   └── app.js                    # Reactive state, JQL live-bindings & exports
└── tests/                        # Automated Test Suites
    ├── metrics.test.js           # Domain & data integrity tests
    └── api.test.js               # REST API integration tests
```

---

## 🛡️ Enterprise SAFe & Engineering Compliance
- **Rule 01 - SAFe Governance**: Meets PI Planning Gate (`docs/pi_planning_board.md`), DoR Given/When/Then User Stories, DoD with 0 errors / 0 lint warnings, QA Audit (`docs/qa_test_report.md`), and Inspect & Adapt Retrospective (`docs/retrospective.md`).
- **Rule 02 - Engineering Standards**: Modular Clean Architecture, API First (`docs/api_spec.json`), Automated Test Coverage (`tests/`), and Zero-Hardcoding (`.env`).
