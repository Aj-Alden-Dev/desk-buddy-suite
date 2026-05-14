---
name: Security Review
about: Security governance and review template
title: "[SECURITY] "
labels: ["security","review"]
assignees: ""
---

**Parent deliverable:** #<issue-number> - <deliverable-title>

# Security Review

> Replace the below parent issue reference manually after creating the card.

**Parent deliverable:** #<parent-issue-number> - <parent-deliverable-title>

---

## Overview
<!-- Summarise the security review scope and impacted areas -->

---

## Security Review Checklist
- [ ] Threat model reviewed
- [ ] Authentication & authorisation controls verified
- [ ] Input validation and output encoding checked
- [ ] Sensitive data handling reviewed (storage, transit, logging)
- [ ] Encryption in transit verified (HTTPS/TLS)
- [ ] Encryption at rest verified
- [ ] Dependency vulnerabilities scanned (e.g. Dependabot / Snyk)
- [ ] Security-focused code review completed
- [ ] Secrets management reviewed — no hardcoded credentials
- [ ] Audit logging and monitoring verified
- [ ] Security alerts and monitoring configured
- [ ] Rate limiting / abuse prevention considered
- [ ] Security headers / CSP reviewed (if web-facing)
- [ ] Backup and recovery impact assessed
- [ ] Data retention obligations reviewed
- [ ] Privacy compliance requirements reviewed
- [ ] Penetration test required? If yes, scheduled and completed

---

## Findings

| # | Finding | Severity | Owner | Due Date | Status |
|---|---|---|---|---|---|

---

## Mitigations / Remediation
<!-- Describe remediation actions and planned fixes -->

---

## Residual Risks
<!-- Document accepted or unresolved risks -->

---

## Evidence Links
- Parent Issue:
- Related PR:
- Vulnerability Scan Results:
- Penetration Test Evidence:

---

## Approval Details

| Role | Name | Status |
|---|---|---|
| Security Reviewer |  | Pending |
| Engineering Lead |  | Pending |
| QA Lead |  | Pending |

---

## Sign-off
- [ ] Security review completed
- [ ] All critical/high findings resolved or formally accepted
