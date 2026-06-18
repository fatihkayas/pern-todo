# ADR-0002: Kubernetes Before OpenShift

**Status:** Accepted

## Context
Phase 9 deploys to vanilla Kubernetes; Phase 10 then deploys the same
platform to OpenShift 4. This can look like redundant work.

## Decision
Build on vendor-neutral Kubernetes first, then explicitly migrate to
OpenShift, documenting the delta: SecurityContextConstraints replacing Pod
Security Standards, Route replacing Ingress, BuildConfig/ImageStream for
OCP-native builds, DeploymentConfig migrated to upstream Deployment.

## Consequences
Two deployment targets instead of one, but this proves portability rather
than asserting it — demonstrating the specific adaptation skill OpenShift
shops need, not just generic K8s familiarity.
