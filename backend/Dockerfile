FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . .

# Railway injects $PORT at runtime; default to 8000 for local dev
ENV PORT=8000

# Start application — bind to $PORT (required by Railway)
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
