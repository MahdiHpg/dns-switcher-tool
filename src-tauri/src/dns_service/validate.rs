//! اعتبارسنجی آدرس‌های IP (شامل IPv4 و IPv6)

use std::net::IpAddr;

/// بررسی معتبر بودن آدرس IP (IPv4 یا IPv6)
pub fn is_valid_ip(ip: &str) -> bool {
    let trimmed = ip.trim();
    if trimmed.is_empty() {
        return false;
    }
    trimmed.parse::<IpAddr>().is_ok()
}

/// بررسی اینکه آیا آدرس دقیقاً IPv4 معتبر است یا خیر
pub fn is_ipv4(ip: &str) -> bool {
    match ip.trim().parse::<IpAddr>() {
        Ok(IpAddr::V4(_)) => true,
        _ => false,
    }
}

/// بررسی اینکه آیا آدرس دقیقاً IPv6 معتبر است یا خیر
pub fn is_ipv6(ip: &str) -> bool {
    match ip.trim().parse::<IpAddr>() {
        Ok(IpAddr::V6(_)) => true,
        _ => false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_real_addresses() {
        assert!(is_valid_ip("8.8.8.8"));
        assert!(is_valid_ip(" 178.22.122.100 "));
        assert!(is_valid_ip("255.255.255.255"));
        assert!(is_valid_ip("2001:4860:4860::8888"));
        assert!(is_valid_ip("2606:4700:4700::1111"));
        assert!(is_ipv4("8.8.8.8"));
        assert!(is_ipv6("2001:4860:4860::8888"));
    }

    #[test]
    fn rejects_broken_addresses() {
        assert!(!is_valid_ip("8.8.8"));
        assert!(!is_valid_ip("8.8.8.256"));
        assert!(!is_valid_ip("hello"));
        assert!(!is_valid_ip(""));
        assert!(!is_valid_ip("8.8.8.8.8"));
        assert!(!is_valid_ip("2001:xyz::1"));
    }
}
