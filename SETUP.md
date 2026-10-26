# SETUP.md
## Prereqs
Python 3.12, uv, Node 22+, Docker.
## First run
cp .env.example .env          # synthetic keys only; never real PHI or payer creds
make up                       # postgres, hapi-fhir, payer-mock, litellm
make seed                     # Synthea patients + synthetic 837/835
make test && make e2e
## Agents
Read AGENTS.md first. Claude Code also reads CLAUDE.md. Check Grok with `grok inspect`.
