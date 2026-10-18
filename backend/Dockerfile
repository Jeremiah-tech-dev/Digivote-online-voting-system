FROM python:3.11.9-slim

# Don't write .pyc files, and show logs immediately
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run as an unprivileged user
RUN useradd --create-home appuser && mkdir -p instance && chown -R appuser /app
USER appuser

EXPOSE 5000

# Database migrations and seeding run automatically when the app starts
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
