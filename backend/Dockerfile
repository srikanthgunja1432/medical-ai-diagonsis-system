# ============================================
# Multi-stage Dockerfile for Medical AI Backend
# Uses uv package manager for fast dependency installation
# ============================================

# Stage 1: Build stage - Install dependencies
FROM python:3.12-slim AS builder

# Install uv package manager
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set work directory
WORKDIR /app

# Set Python version for uv to use the system Python (3.12)
ENV UV_PYTHON_PREFERENCE=only-system

# Copy dependency files first for better caching
COPY pyproject.toml uv.lock ./

# Install dependencies using uv with system Python
RUN uv sync --frozen --no-dev --no-install-project

# Copy the rest of the application
COPY . .

# Install the project itself
RUN uv sync --frozen --no-dev


# ============================================
# Stage 2: Runtime stage - Lean production image
# ============================================
FROM python:3.12-slim AS runtime

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH"

# Set work directory
WORKDIR /app

# Copy the virtual environment from builder
COPY --from=builder /app/.venv /app/.venv

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Create entrypoint script - only seeds when SEED_DB=true
RUN echo '#!/bin/bash\n\
    set -e\n\
    if [ "$SEED_DB" = "true" ]; then\n\
    echo "🌱 Seeding database..."\n\
    python seed_data.py\n\
    echo "✅ Database seeded successfully!"\n\
    fi\n\
    echo "🚀 Starting application..."\n\
    exec python run.py\n\
    ' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Run the entrypoint script
CMD ["/app/entrypoint.sh"]
