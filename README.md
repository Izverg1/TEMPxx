# Frontier Relay

Frontier Relay is an early C++ desktop-core prototype for local-first AI coding delegation. The current vertical slice routes a bounded task by capability to a deterministic local adapter, creates an isolated temporary artifact, validates it, computes evidence-based confidence, and returns `ACCEPT` or an escalation action.

The adapter is deliberately a **test double**, not a real language model. See [the reference architecture](docs/REFERENCE_ARCHITECTURE.md) for the production boundaries, PGlite decision, risks, and phased plan.

## Build and run

```sh
cmake -S . -B build
cmake --build build
ctest --test-dir build --output-on-failure
./build/frontier-relay "Create a documented configuration option"
```

The unrelated pre-existing Vite demonstration remains available through `npm run dev`; it is not yet integrated with the C++ core and is not the planned Dear ImGui UI.
