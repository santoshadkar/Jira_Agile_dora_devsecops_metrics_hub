# Program Increment (PI) Planning Board: Jira Agile Metrics & JQL Navigator Hub
**Program Increment:** PI-2026.1  
**Agile Release Train (ART):** Agile Enterprise Tooling & Observability ART  
**Release Train Engineer (RTE):** Enterprise RTE  
**Status:** Approved & Gate Passed  
**Date:** November 16, 2026  

---

## 1. Executive Summary & Vision
The **Jira Agile Metrics Hub** is a single pane-of-glass reference portal designed for Scrum Masters, Product Owners, Engineering Teams, QA Leads, Release Train Engineers, and Executive Leadership. It centralizes all industry-standard metrics for Scrum and Kanban frameworks, provides explicit role-based categorization (Mandated vs Optional), and delivers production-grade, copy-pasteable JQL queries and Dashboard Gadget blueprints tailored specifically for **Jira Cloud** and **Jira Data Center (DC)**.

---

## 2. PI Objectives & Business Value

| Objective ID | PI Objective | Business Value (1-10) | Target Delivery |
| :--- | :--- | :---: | :--- |
| **OBJ-01** | Standardize role-based Scrum, Kanban, and DORA DevOps metrics catalog with Mandated vs. Optional designations. | 10 | Sprint 1 |
| **OBJ-02** | Provide verified, copy-ready JQL strings for both Jira Cloud and Data Center environments with interactive parameter binding (Project Key, Sprint, Status). | 10 | Sprint 1 |
| **OBJ-03** | Deliver step-by-step Jira Dashboard creation blueprints with exact Gadget configs for all key roles. | 9 | Sprint 2 |
| **OBJ-04** | Implement an interactive Web Portal with responsive UI, real-time filtering, search, and blueprint export. | 9 | Sprint 2 |

---

## 3. ART Program Board (Features & Milestones)

```
+-----------------------------------------------------------------------------------------------------------+
| FEATURE                                      | SPRINT 1 (Foundation & API) | SPRINT 2 (UI & Blueprints)   |
+-----------------------------------------------------------------------------------------------------------+
| FEAT-01: Metrics Knowledge Base Engine       | [X] Done (Schema & Data)    |                              |
| FEAT-02: Dual Cloud/DC JQL Generator Service | [X] Done (JQL Logic)        |                              |
| FEAT-03: Role Matrix & Mandated/Optional     | [X] Done (Role Taxonomy)    |                              |
| FEAT-04: Interactive Web UI & Dashboard Hub  |                             | [X] Done (Web App Delivery)  |
| FEAT-05: Automated Test Suite & QA Audit     |                             | [X] Done (Tests & CAB Audit) |
+-----------------------------------------------------------------------------------------------------------+
```

---

## 4. User Stories & Definition of Ready (DoR) Matrix

### User Story US-01: Role-Wise Metrics Classification & Filtering
- **As a** Scrum Master or Product Owner  
- **I want to** filter metrics based on my role and see which metrics are mandated by governance vs. which are optional  
- **So that** I focus on non-negotiable delivery signals without getting overwhelmed by vanity metrics.  
- **Acceptance Criteria (DoR):**
  - **Given** an authenticated or guest user viewing the metrics hub,  
  - **When** the user selects a role (e.g. "Scrum Master", "Product Owner", "QA / Test Lead"),  
  - **Then** the portal displays all associated metrics labeled with explicit "Mandated" or "Optional" tags and governance rationale.

### User Story US-02: Dual Jira Cloud & Data Center JQL Query Generation
- **As a** Jira Administrator or Project Lead  
- **I want to** view and customize JQL queries for any metric with my project key and sprint fields for both Cloud and Data Center  
- **So that** I can instantly copy working queries that account for Cloud vs DC syntax differences (e.g., `openSprints()`, custom field IDs, and status categories).  
- **Acceptance Criteria (DoR):**
  - **Given** a selected metric and input parameters (Project Key: "PRJ", Board ID: "12"),  
  - **When** the user toggles between "Jira Cloud" and "Jira Data Center",  
  - **Then** the generated JQL dynamically updates, reflecting valid syntax for the selected target platform with 1-click copy capability.

### User Story US-03: Dashboard Blueprint & Gadget Configuration Guide
- **As a** Delivery Manager / Agile Coach  
- **I want** exact instructions on which Jira Dashboard Gadgets to add, including dimensions and filter bindings,  
- **So that** teams can set up standardized Jira dashboards in under 5 minutes without trial-and-error.  
- **Acceptance Criteria (DoR):**
  - **Given** a user viewing a metric or role dashboard blueprint,  
  - **When** the gadget section is inspected,  
  - **Then** it specifies Gadget Name, Target Layout, Filter JQL, X/Y axes configuration, and refresh frequency.

---

## 5. ROAM Risk Management

| Risk ID | Description | Impact | Likelihood | Action (R/O/A/M) | Status |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **RSK-01** | Jira Cloud vs DC JQL syntax discrepancies (e.g., `cf[10020]` vs named fields, `development[pullrequests]` functions). | High | High | **Mitigated**: Separate Cloud vs DC JQL tabs and explicit syntax notes documented for each metric. | Closed |
| **RSK-02** | Conflicting definitions of Mandated vs Optional across organizations. | Med | Low | **Resolved**: Provided industry-standard SAFe/Scrum.org baseline with customization rationale. | Closed |
| **RSK-03** | Cross-browser compatibility and responsive performance. | Low | Med | **Owned**: Tested across mobile, tablet, and desktop layouts. | Closed |

---
*Signed and Approved by:*  
**Enterprise Release Train Engineer (RTE)** | *PI-2026.1 Gate Cleared for Execution*
