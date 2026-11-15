//! تست دسترسی و دورزدن تحریم‌های سرویس‌های کلیدی (Docker, OpenAI, Epic Games, ...)

use serde::Serialize;
use std::time::Duration;
use tokio::net::TcpStream;
use tokio::time::timeout;

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ServiceCheck {
    pub id: String,
    pub name: String,
    pub host: String,
    pub port: u16,
    pub category: String,
    pub ok: bool,
    pub latency_ms: Option<u64>,
}

pub async fn check_single_service(
    id: &str,
    name: &str,
    host: &str,
    port: u16,
    category: &str,
) -> ServiceCheck {
    let addr = format!("{}:{}", host, port);
    let start = std::time::Instant::now();
    let res = timeout(Duration::from_millis(3000), TcpStream::connect(&addr)).await;

    match res {
        Ok(Ok(_stream)) => ServiceCheck {
            id: id.to_string(),
            name: name.to_string(),
            host: host.to_string(),
            port,
            category: category.to_string(),
            ok: true,
            latency_ms: Some(start.elapsed().as_millis() as u64),
        },
        _ => ServiceCheck {
            id: id.to_string(),
            name: name.to_string(),
            host: host.to_string(),
            port,
            category: category.to_string(),
            ok: false,
            latency_ms: None,
        },
    }
}

pub async fn check_all_services() -> Vec<ServiceCheck> {
    let targets = [
        ("docker", "Docker Hub", "hub.docker.com", 443, "dev"),
        ("openai", "OpenAI / ChatGPT", "api.openai.com", 443, "dev"),
        ("epic", "Epic Games Store", "launcher.store.epicgames.com", 443, "gaming"),
        ("spotify", "Spotify", "api.spotify.com", 443, "general"),
        ("npm", "npm Registry", "registry.npmjs.org", 443, "dev"),
        ("discord", "Discord", "discord.com", 443, "gaming"),
        ("github", "GitHub API", "api.github.com", 443, "dev"),
        ("gemini", "Google Gemini AI", "generativelanguage.googleapis.com", 443, "dev"),
    ];

    let mut tasks = Vec::new();
    for (id, name, host, port, cat) in targets {
        tasks.push(tokio::spawn(check_single_service(id, name, host, port, cat)));
    }

    let mut results = Vec::new();
    for task in tasks {
        if let Ok(item) = task.await {
            results.push(item);
        }
    }
    results
}
