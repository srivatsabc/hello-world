# hello-world

Two tabs, one backend. **Conventional** calls FastAPI endpoints directly (add, subtract, weather). **AI** sends plain English to a LangChain agent that can only use add, subtract and weather tools.

- Backend: `backend/` FastAPI on 8430 (routers -> services -> models), agent in `services/ai/`
- Frontend: `frontend/` React + Vite + Tailwind on 5430, same style as `jev/app/frontend`
- Config: `.env` (Azure AI Foundry endpoint/key/deployment, see `.env.example`)
- Conda env: `lab`; start/stop with `scripts/start-all.sh` / `scripts/stop-all.sh`
- Weather: Open-Meteo (free, no key)
