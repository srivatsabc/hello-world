# Date: October 1, 2026
# Name: Sri
# Desc: Single-container build for Azure App Service. Stage 1 builds the Vite
#       frontend; stage 2 is the FastAPI app, laid out like the repo (backend/,
#       frontend/dist) so main.py resolves paths the same as in local dev and
#       serves the built frontend alongside /api.
FROM node:24-slim AS frontend-build
WORKDIR /repo/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim AS backend
WORKDIR /repo
COPY backend/requirements.txt backend/requirements.txt
RUN pip install -r backend/requirements.txt
COPY backend/app backend/app
COPY --from=frontend-build /repo/frontend/dist frontend/dist
WORKDIR /repo/backend
ENV PYTHONUNBUFFERED=1
EXPOSE 8430
CMD ["python", "-m", "app.main"]
