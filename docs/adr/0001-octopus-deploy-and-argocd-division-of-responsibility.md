# ADR-0001: Octopus Deploy and ArgoCD GitOps — Division of Responsibility

**Status:** Accepted

## Context
Phase 8 introduces Octopus Deploy with a banking-standard DEV→TEST→UAT→PROD
lifecycle and CAB approval gates. Phase 9 introduces ArgoCD-driven GitOps for
the same environments. On the surface this looks like two competing CD tools
solving the same problem.

## Decision
The two tools own different layers and are not interchangeable:
- **Octopus Deploy** owns governance: who approved a release, deployment
  windows, audit trail, operational runbooks.
- **ArgoCD** owns execution: declarative, continuously-reconciled cluster
  state with drift detection.

An Octopus release updates the target environment's overlay in the GitOps
repo; ArgoCD syncs that change to the cluster. DEV/TEST auto-sync with
prune + self-heal; UAT/PROD require manual sync, RBAC-restricted to ops.

## Consequences
More moving parts than a single tool, but the boundary (Octopus writes to
Git, never to the cluster) separates "who is accountable" from "what is
actually running" — a pattern common in regulated environments.
