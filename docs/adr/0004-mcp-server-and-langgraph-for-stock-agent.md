# ADR-0004: MCP Server and LangGraph for the Autonomous Stock Agent

**Status:** Accepted

## Context
Phase 12.3's stock agent currently runs a flat sequence of Claude Tool Use
calls (query_db → calculate_reorder → notify_supplier → log_decision).

## Decision
Add exactly two things, each justified by an existing project pattern:
1. **MCP server** wrapping the existing tool functions as MCP tools instead
   of ad-hoc function calls.
2. **LangGraph** to model the agent as a state graph with two real
   branches: a human-approval branch when reorder value exceeds a
   threshold (mirrors the Phase 8 CAB approval gate), and a retry/backoff
   branch on supplier notification failure (mirrors the Phase 6.4 circuit
   breaker pattern).

## Explicitly not added
CrewAI/AutoGen (redundant with LangGraph), Qdrant/Weaviate/Pinecone
(redundant with existing pgvector), LangSmith/Langfuse (redundant with the
existing Jaeger + Prometheus + Grafana stack — agent traces go through the
same OpenTelemetry pipeline, token cost reported as a Prometheus metric).

## Consequences
One new orchestration framework and one new protocol-level interface, both
tied to existing patterns (approval gates, retry/circuit-breaker) rather
than a separate, unconnected AI tool stack.
