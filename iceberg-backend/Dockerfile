# Stage 1: Compile Native Multi-Threaded Rust Engine (IcebergCore v1.0.0)
# Both stages use Debian Bookworm (`-slim-bookworm`) to guarantee 100% identical glibc ABI.
FROM rust:slim-bookworm AS rust-builder

WORKDIR /build/iceberg-core-rs
ENV CARGO_BUILD_JOBS=2
COPY iceberg-core-rs/Cargo.toml iceberg-core-rs/Cargo.lock ./
COPY iceberg-core-rs/src ./src
RUN cargo build --release --locked

# Stage 2: Production FastAPI + IcebergCore Native Runtime
FROM python:3.11-slim-bookworm

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps first (layer cache)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy compiled ~2MB native Rust Engine binary from builder stage (zero compiler bloat)
COPY --from=rust-builder /build/iceberg-core-rs/target/release/iceberg-core-rs /usr/local/bin/iceberg-core-rs
RUN chmod +x /usr/local/bin/iceberg-core-rs

# Copy backend source
COPY . .

# Create runtime data directories
RUN mkdir -p /app/data/qdrant/primary /app/data/qdrant/rust_core /app/data/backups

# Pre-download CPU embedding model so first request has zero cold-start download
RUN python -c "from fastembed import TextEmbedding; TextEmbedding(model_name='sentence-transformers/all-MiniLM-L6-v2')" || true

EXPOSE 8000
ENV PYTHONUNBUFFERED=1
ENV RAYON_NUM_THREADS=2
ENV ICEBERG_RUST_BIN=/usr/local/bin/iceberg-core-rs
ENV ICEBERG_ENGINE=rust

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1"]
