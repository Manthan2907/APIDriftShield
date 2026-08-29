FROM python:3.11-slim

WORKDIR /app

# Set PYTHONPATH so antigravity_backend modules can be imported directly
ENV PYTHONPATH=/app/antigravity_backend:/app
ENV PORT=5000

COPY antigravity_backend/requirements.txt ./antigravity_backend/requirements.txt
RUN pip install --no-cache-dir -r antigravity_backend/requirements.txt

COPY antigravity_backend/ ./antigravity_backend/

EXPOSE 5000

CMD ["sh", "-c", "uvicorn antigravity_backend.main:app --host 0.0.0.0 --port ${PORT}"]
