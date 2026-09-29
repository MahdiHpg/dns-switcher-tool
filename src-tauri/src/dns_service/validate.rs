//! اعتبارسنجی آدرس IPv4 (معادل `isValidIp` نسخه‌ی Electron)

pub fn is_valid_ip(ip: &str) -> bool {
    let parts: Vec<&str> = ip.trim().split('.').collect();
    if parts.len() != 4 {
        return false;
    }
    parts.iter().all(|part| {
        !part.is_empty()
            && part.len() <= 3
            && part.chars().all(|c| c.is_ascii_digit())
            && part.parse::<u16>().map(|value| value <= 255).unwrap_or(false)
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_real_addresses() {
        assert!(is_valid_ip("8.8.8.8"));
        assert!(is_valid_ip(" 178.22.122.100 "));
        assert!(is_valid_ip("255.255.255.255"));
    }

    #[test]
    fn rejects_broken_addresses() {
        assert!(!is_valid_ip("8.8.8"));
        assert!(!is_valid_ip("8.8.8.256"));
        assert!(!is_valid_ip("hello"));
        assert!(!is_valid_ip(""));
        assert!(!is_valid_ip("8.8.8.8.8"));
    }
}
