# ── Stage 1: Build Vite / React Frontend ─────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ── Stage 2: Unified Python FastAPI Runtime & Static SPA Server ───────────────
FROM python:3.11-slim
WORKDIR /app

ENV PYTHONPATH=/app/antigravity_backend:/app
ENV PORT=5000

COPY antigravity_backend/requirements.txt ./antigravity_backend/requirements.txt
RUN pip install --no-cache-dir -r antigravity_backend/requirements.txt

COPY antigravity_backend/ ./antigravity_backend/
COPY --from=frontend-builder /app/dist ./dist

EXPOSE 5000

CMD ["sh", "-c", "uvicorn antigravity_backend.main:app --host 0.0.0.0 --port ${PORT}"]
