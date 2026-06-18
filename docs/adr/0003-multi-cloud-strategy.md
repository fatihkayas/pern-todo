# ADR-0003: Multi-Cloud Strategy — Azure, AWS, and GCP

**Status:** Accepted

## Context
The platform runs live on Azure, AWS, and GCP. An alternative was narrowing
to Azure-only to align with on-prem-heavy regulated environments.

## Decision
Keep all three clouds live as the project's primary differentiator: the
same containerized app runs unmodified on three providers, with
cloud-specific concerns isolated to the IaC/adapter layer only.

## Consequences
More infrastructure surface (three IaC sets), mitigated by keeping the
application layer cloud-agnostic. The same Helm charts used across all
three clouds also underpin the Phase 9/10 Kubernetes and OpenShift
deployments, so this isn't a detour — it's the foundation those phases
test against.
