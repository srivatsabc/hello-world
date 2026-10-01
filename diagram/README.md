# diagram

The architecture explainer, kept apart from the main app so the app's own frontend stays simple.

- `backend/`: FastAPI service on 8440 exposing `GET /api/v1/diagram` and `GET /api/v1/health`. The diagram itself is data in `backend/diagram_app/data/diagram.json`. It also serves `frontend/`.
- `frontend/`: the page that fetches the diagram and draws it (plain HTML/JS/SVG, no build).
- Run with `./start.sh` / `./stop.sh` (conda env `lab`). Standalone at http://localhost:8440 (`?mode=ai` or `?mode=conventional` pre-selects a flow).
- The main frontend's Architecture tab only embeds this page in an iframe, through its dev proxy at `/diagram`.
