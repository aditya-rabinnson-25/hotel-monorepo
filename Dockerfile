# Dockerfile - placeholder, refine per app
FROM python:3.11-slim AS api-build
WORKDIR /app
COPY apps/api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY apps/api /app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
