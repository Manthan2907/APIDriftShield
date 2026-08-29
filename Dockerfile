FROM python:3.11-slim

WORKDIR /app

COPY antigravity_backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY antigravity_backend/ ./antigravity_backend/

EXPOSE 5000

ENV PORT=5000

CMD ["sh", "-c", "uvicorn antigravity_backend.main:app --host 0.0.0.0 --port ${PORT}"]
