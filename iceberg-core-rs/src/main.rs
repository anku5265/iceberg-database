mod bm25;
mod distance;
mod engine;
mod filter;
mod hnsw;
mod quantization;
mod storage;

use std::env;
use std::net::SocketAddr;
use std::path::PathBuf;
use std::sync::atomic::Ordering;
use std::sync::Arc;
use std::time::Instant;

use axum::extract::{DefaultBodyLimit, Path, State};
use axum::http::{header, StatusCode};
use axum::response::IntoResponse;
use axum::routing::{get, post};
use axum::{Json, Router};
use serde::Deserialize;
use serde_json::{json, Value};

use crate::engine::{CreateCollectionSpec, IcebergEngine, PointInput, SearchSpec};

#[derive(Deserialize)]
struct UpsertBody {
    points: Vec<PointInput>,
    #[serde(default)]
    sync_wal: bool,
    #[serde(default)]
    auto_create_dim: Option<usize>,
    #[serde(default)]
    metric: Option<String>,
    #[serde(default)]
    quantization: Option<String>,
}

#[derive(Deserialize)]
struct GetPointsBody {
    ids: Vec<String>,
    #[serde(default = "default_true")]
    with_vectors: bool,
}

fn default_true() -> bool {
    true
}

#[derive(Deserialize)]
struct DeletePointsBody {
    #[serde(default)]
    ids: Option<Vec<String>>,
    #[serde(default)]
    filter: Option<Value>,
    #[serde(default)]
    namespace: Option<String>,
    #[serde(default)]
    delete_all: bool,
}

#[derive(Deserialize)]
struct ScrollBody {
    #[serde(default = "default_scroll_limit")]
    limit: usize,
    #[serde(default)]
    offset: usize,
    #[serde(default)]
    with_vectors: bool,
    #[serde(default)]
    filter: Option<Value>,
    #[serde(default)]
    namespace: Option<String>,
}

fn default_scroll_limit() -> usize {
    100
}

#[derive(Deserialize)]
struct RenameBody {
    new_name: String,
}

fn json_err(code: StatusCode, msg: impl Into<String>) -> (StatusCode, Json<Value>) {
    (code, Json(json!({ "detail": msg.into() })))
}

async fn health_handler(State(engine): State<Arc<IcebergEngine>>) -> impl IntoResponse {
    let stats = engine.list_collections();
    let total_vecs: usize = stats.iter().map(|s| s.vector_count).sum();
    let uptime = (engine::now_unix_f64() - engine.started_at).max(0.0) as u64;
    (
        StatusCode::OK,
        Json(json!({
            "status": "ok",
            "engine": "iceberg-core-rs",
            "version": "1.0.0",
            "collections": stats.len(),
            "vectors": total_vecs,
            "uptime_seconds": uptime,
            "queries_served": engine.total_queries.load(Ordering::Relaxed),
            "upserts_served": engine.total_upserts.load(Ordering::Relaxed),
            "crc_wal_recoveries": engine.crc_wal_recoveries.load(Ordering::Relaxed),
        })),
    )
}

async fn metrics_handler(State(engine): State<Arc<IcebergEngine>>) -> impl IntoResponse {
    (
        StatusCode::OK,
        [(
            header::CONTENT_TYPE,
            "text/plain; version=0.0.4; charset=utf-8",
        )],
        engine.prometheus_metrics(),
    )
}

async fn create_collection_handler(
    State(engine): State<Arc<IcebergEngine>>,
    Json(spec): Json<CreateCollectionSpec>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, Json<Value>)> {
    let col_name = spec.name.trim().to_string();
    let dim = spec.dimension;
    let metric = spec.metric.clone();
    let quant = spec.quantization.clone();

    match engine.create_collection(spec) {
        Ok(created) => {
            let status = if created {
                StatusCode::CREATED
            } else {
                StatusCode::OK
            };
            Ok((
                status,
                Json(json!({
                    "name": col_name,
                    "created": created,
                    "dimension": dim,
                    "metric": metric.to_lowercase(),
                    "quantization": quant.to_lowercase(),
                })),
            ))
        }
        Err(e) => Err(json_err(StatusCode::BAD_REQUEST, e)),
    }
}

async fn list_collections_handler(State(engine): State<Arc<IcebergEngine>>) -> impl IntoResponse {
    let cols = engine.list_collections();
    (StatusCode::OK, Json(json!({ "collections": cols })))
}

async fn get_collection_handler(
    State(engine): State<Arc<IcebergEngine>>,
    Path(name): Path<String>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, Json<Value>)> {
    let Some(col_arc) = engine.get_collection(&name) else {
        return Err(json_err(
            StatusCode::NOT_FOUND,
            format!("Collection '{}' not found", name),
        ));
    };
    let stats = col_arc.read().stats();
    Ok((StatusCode::OK, Json(json!(stats))))
}

async fn delete_collection_handler(
    State(engine): State<Arc<IcebergEngine>>,
    Path(name): Path<String>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, Json<Value>)> {
    match engine.delete_collection(&name) {
        Ok(deleted) => Ok((
            StatusCode::OK,
            Json(json!({ "name": name, "deleted": deleted })),
        )),
        Err(e) => Err(json_err(StatusCode::INTERNAL_SERVER_ERROR, e)),
    }
}

async fn clear_collection_handler(
    State(engine): State<Arc<IcebergEngine>>,
    Path(name): Path<String>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, Json<Value>)> {
    let Some(col_arc) = engine.get_collection(&name) else {
        return Err(json_err(
            StatusCode::NOT_FOUND,
            format!("Collection '{}' not found", name),
        ));
    };
    col_arc
        .write()
        .clear_all()
        .map_err(|e| json_err(StatusCode::INTERNAL_SERVER_ERROR, e))?;
    Ok((
        StatusCode::OK,
        Json(json!({ "cleared": true, "collection": name })),
    ))
}

async fn rename_collection_handler(
    State(engine): State<Arc<IcebergEngine>>,
    Path(name): Path<String>,
    Json(body): Json<RenameBody>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, Json<Value>)> {
    match engine.rename_collection(&name, &body.new_name) {
        Ok(migrated) => Ok((
            StatusCode::OK,
            Json(json!({
                "renamed": true,
                "old_name": name,
                "new_name": body.new_name.trim(),
                "points_migrated": migrated,
            })),
        )),
        Err(e) => {
            let code = if e.to_lowercase().contains("not found") {
                StatusCode::NOT_FOUND
            } else if e.to_lowercase().contains("already exists") {
                StatusCode::CONFLICT
            } else {
                StatusCode::BAD_REQUEST
            };
            Err(json_err(code, e))
        }
    }
}

async fn flush_collection_handler(
    State(engine): State<Arc<IcebergEngine>>,
    Path(name): Path<String>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, Json<Value>)> {
    let Some(col_arc) = engine.get_collection(&name) else {
        return Err(json_err(
            StatusCode::NOT_FOUND,
            format!("Collection '{}' not found", name),
        ));
    };
    col_arc
        .write()
        .flush_snapshot()
        .map_err(|e| json_err(StatusCode::INTERNAL_SERVER_ERROR, e))?;
    Ok((
        StatusCode::OK,
        Json(json!({ "flushed": true, "collection": name })),
    ))
}

async fn flush_all_handler(
    State(engine): State<Arc<IcebergEngine>>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, Json<Value>)> {
    let count = engine
        .flush_all()
        .map_err(|e| json_err(StatusCode::INTERNAL_SERVER_ERROR, e))?;
    Ok((
        StatusCode::OK,
        Json(json!({ "flushed": true, "collections_flushed": count })),
    ))
}

async fn upsert_points_handler(
    State(engine): State<Arc<IcebergEngine>>,
    Path(name): Path<String>,
    Json(body): Json<UpsertBody>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, Json<Value>)> {
    let t0 = Instant::now();
    let mut col_opt = engine.get_collection(&name);
    if col_opt.is_none() {
        if let Some(dim) = body.auto_create_dim {
            let _ = engine
                .create_collection(CreateCollectionSpec {
                    name: name.clone(),
                    dimension: dim,
                    metric: body.metric.unwrap_or_else(|| "cosine".to_string()),
                    quantization: body.quantization.unwrap_or_else(|| "float32".to_string()),
                    m: 16,
                    ef_construction: 100,
                    ef_search: 64,
                })
                .map_err(|e| json_err(StatusCode::BAD_REQUEST, e))?;
            col_opt = engine.get_collection(&name);
        }
    }

    let Some(col_arc) = col_opt else {
        return Err(json_err(
            StatusCode::NOT_FOUND,
            format!("Collection '{}' not found", name),
        ));
    };

    let n = body.points.len();
    let (inserted, updated) = col_arc
        .write()
        .upsert_points(body.points, body.sync_wal)
        .map_err(|e| json_err(StatusCode::BAD_REQUEST, e))?;

    engine.total_upserts.fetch_add(n as u64, Ordering::Relaxed);
    let ms = t0.elapsed().as_secs_f64() * 1000.0;

    Ok((
        StatusCode::OK,
        Json(json!({
            "status": "completed",
            "upserted": n,
            "inserted": inserted,
            "updated": updated,
            "latency_ms": (ms * 1000.0).round() / 1000.0,
        })),
    ))
}

async fn get_points_handler(
    State(engine): State<Arc<IcebergEngine>>,
    Path(name): Path<String>,
    Json(body): Json<GetPointsBody>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, Json<Value>)> {
    let Some(col_arc) = engine.get_collection(&name) else {
        return Err(json_err(
            StatusCode::NOT_FOUND,
            format!("Collection '{}' not found", name),
        ));
    };
    let points = col_arc.read().get_points(&body.ids, body.with_vectors);
    Ok((StatusCode::OK, Json(json!({ "points": points }))))
}

async fn delete_points_handler(
    State(engine): State<Arc<IcebergEngine>>,
    Path(name): Path<String>,
    Json(body): Json<DeletePointsBody>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, Json<Value>)> {
    let Some(col_arc) = engine.get_collection(&name) else {
        return Err(json_err(
            StatusCode::NOT_FOUND,
            format!("Collection '{}' not found", name),
        ));
    };
    let count = col_arc
        .write()
        .delete_points(
            body.ids.as_deref(),
            body.filter.as_ref(),
            body.namespace.as_deref(),
            body.delete_all,
        )
        .map_err(|e| json_err(StatusCode::BAD_REQUEST, e))?;
    Ok((
        StatusCode::OK,
        Json(json!({ "deleted_count": count, "collection": name })),
    ))
}

async fn scroll_points_handler(
    State(engine): State<Arc<IcebergEngine>>,
    Path(name): Path<String>,
    Json(body): Json<ScrollBody>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, Json<Value>)> {
    let Some(col_arc) = engine.get_collection(&name) else {
        return Ok((
            StatusCode::OK,
            Json(json!({ "collection": name, "count": 0, "points": [] })),
        ));
    };
    let points = col_arc.read().scroll(
        body.limit,
        body.offset,
        body.with_vectors,
        body.filter.as_ref(),
        body.namespace.as_deref(),
    );
    Ok((
        StatusCode::OK,
        Json(json!({
            "collection": name,
            "count": points.len(),
            "points": points,
        })),
    ))
}

async fn search_points_handler(
    State(engine): State<Arc<IcebergEngine>>,
    Path(name): Path<String>,
    Json(spec): Json<SearchSpec>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, Json<Value>)> {
    let t0 = Instant::now();
    let Some(col_arc) = engine.get_collection(&name) else {
        return Err(json_err(
            StatusCode::NOT_FOUND,
            format!("Collection '{}' not found", name),
        ));
    };

    let results = col_arc
        .read()
        .search(&spec)
        .map_err(|e| json_err(StatusCode::BAD_REQUEST, e))?;

    let elapsed_us = t0.elapsed().as_micros() as u64;
    engine.total_queries.fetch_add(1, Ordering::Relaxed);
    engine
        .total_search_micros
        .fetch_add(elapsed_us, Ordering::Relaxed);

    let ms = (elapsed_us as f64) / 1000.0;
    Ok((
        StatusCode::OK,
        Json(json!({
            "results": results,
            "count": results.len(),
            "latency_ms": (ms * 1000.0).round() / 1000.0,
        })),
    ))
}

fn parse_cli() -> (String, u16, PathBuf) {
    let mut host = env::var("ICEBERG_CORE_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let mut port: u16 = env::var("ICEBERG_CORE_PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(6334);
    let mut data_dir = PathBuf::from(
        env::var("ICEBERG_CORE_DATA_DIR").unwrap_or_else(|_| "./data/iceberg_core_rs".to_string()),
    );

    let args: Vec<String> = env::args().collect();
    let mut i = 1;
    while i < args.len() {
        match args[i].as_str() {
            "--host" if i + 1 < args.len() => {
                host = args[i + 1].clone();
                i += 2;
            }
            "--port" if i + 1 < args.len() => {
                if let Ok(p) = args[i + 1].parse() {
                    port = p;
                }
                i += 2;
            }
            "--data-dir" if i + 1 < args.len() => {
                data_dir = PathBuf::from(&args[i + 1]);
                i += 2;
            }
            _ => {
                i += 1;
            }
        }
    }
    (host, port, data_dir)
}

#[tokio::main]
async fn main() {
    let (host, port, data_dir) = parse_cli();

    let engine = match IcebergEngine::open(data_dir.clone()) {
        Ok(e) => e,
        Err(err) => {
            eprintln!("[iceberg-core-rs] Fatal startup error: {}", err);
            std::process::exit(1);
        }
    };

    let app = Router::new()
        .route("/", get(health_handler))
        .route("/health", get(health_handler))
        .route("/metrics", get(metrics_handler))
        .route("/flush-all", post(flush_all_handler))
        .route(
            "/collections",
            post(create_collection_handler).get(list_collections_handler),
        )
        .route(
            "/collections/:name",
            get(get_collection_handler).delete(delete_collection_handler),
        )
        .route("/collections/:name/clear", post(clear_collection_handler))
        .route("/collections/:name/rename", post(rename_collection_handler))
        .route("/collections/:name/flush", post(flush_collection_handler))
        .route(
            "/collections/:name/points/upsert",
            post(upsert_points_handler),
        )
        .route("/collections/:name/points/get", post(get_points_handler))
        .route(
            "/collections/:name/points/delete",
            post(delete_points_handler),
        )
        .route(
            "/collections/:name/points/scroll",
            post(scroll_points_handler),
        )
        .route(
            "/collections/:name/points/search",
            post(search_points_handler),
        )
        .layer(DefaultBodyLimit::max(128 * 1024 * 1024))
        .with_state(engine.clone());

    let addr: SocketAddr = format!("{}:{}", host, port)
        .parse()
        .expect("Invalid host:port address");

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .unwrap_or_else(|e| {
            eprintln!("[iceberg-core-rs] Failed binding to {}: {}", addr, e);
            std::process::exit(1);
        });

    println!(
        "[iceberg-core-rs v1.0.0] Listening on http://{} | data_dir={:?}",
        addr, data_dir
    );

    let shutdown_engine = engine.clone();
    axum::serve(listener, app)
        .with_graceful_shutdown(async move {
            let _ = tokio::signal::ctrl_c().await;
            let _ = shutdown_engine.flush_all();
        })
        .await
        .expect("Server error");
}
