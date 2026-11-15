//! تست پینگ و تأخیر سرورهای DNS از طریق ارسال پکت استاندارد DNS Query روی پورت ۵۳

use std::collections::HashMap;
use std::net::SocketAddr;
use std::time::Duration;
use tokio::net::UdpSocket;
use tokio::time::timeout;

/// ساخت پکت ساده و استاندارد DNS Query برای رکورد A دامنه‌ی google.com
fn make_dns_query_packet() -> [u8; 28] {
    [
        // Transaction ID
        0x12, 0x34,
        // Flags: Standard query, recursion desired (0x0100)
        0x01, 0x00,
        // Questions: 1
        0x00, 0x01,
        // Answer RRs: 0
        0x00, 0x00,
        // Authority RRs: 0
        0x00, 0x00,
        // Additional RRs: 0
        0x00, 0x00,
        // Query name: \x06google\x03com\x00
        0x06, b'g', b'o', b'o', b'g', b'l', b'e',
        0x03, b'c', b'o', b'm',
        0x00,
        // Type: A (0x0001)
        0x00, 0x01,
        // Class: IN (0x0001)
        0x00, 0x01,
    ]
}

pub async fn ping_single_dns(ip: &str, timeout_ms: u64) -> Option<u64> {
    let clean_ip = ip.trim();
    if clean_ip.is_empty() {
        return None;
    }

    let addr_str = if clean_ip.contains(':') {
        format!("[{}]:53", clean_ip)
    } else {
        format!("{}:53", clean_ip)
    };

    let Ok(dest_addr) = addr_str.parse::<SocketAddr>() else {
        return None;
    };

    let bind_addr = if dest_addr.is_ipv4() {
        "0.0.0.0:0"
    } else {
        "[::]:0"
    };

    let Ok(socket) = UdpSocket::bind(bind_addr).await else {
        return None;
    };

    let packet = make_dns_query_packet();
    let start = std::time::Instant::now();

    if socket.send_to(&packet, dest_addr).await.is_err() {
        return None;
    }

    let mut buf = [0u8; 512];
    let recv = timeout(Duration::from_millis(timeout_ms), socket.recv_from(&mut buf));

    match recv.await {
        Ok(Ok((bytes_read, from_addr))) if bytes_read >= 12 && from_addr.ip() == dest_addr.ip() => {
            // بررسی مطابقت Transaction ID
            if buf[0] == 0x12 && buf[1] == 0x34 {
                let elapsed = start.elapsed().as_millis() as u64;
                Some(elapsed.max(1))
            } else {
                None
            }
        }
        _ => None,
    }
}

pub async fn benchmark_dns_list(ips: Vec<String>) -> HashMap<String, Option<u64>> {
    let mut tasks = Vec::new();

    for ip in ips {
        let ip_clone = ip.clone();
        tasks.push(tokio::spawn(async move {
            let latency = ping_single_dns(&ip_clone, 1500).await;
            (ip_clone, latency)
        }));
    }

    let mut results = HashMap::new();
    for task in tasks {
        if let Ok((ip, latency)) = task.await {
            results.insert(ip, latency);
        }
    }

    results
}
