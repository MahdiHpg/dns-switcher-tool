//! استخراج آدرس‌های DNS از فایل‌های `.bat` کاربر
//!
//! الگوهای پشتیبانی‌شده (بی‌توجه به بزرگی/کوچکی حروف):
//! `netsh interface ipv4 set dns name="X" source=static address=IP`
//! `netsh interface ipv4 add dns name="X" address=IP index=2`

/// نتیجه‌ی خواندن یک فایل `.bat`
#[derive(Debug, Default, PartialEq, Eq)]
pub struct BatDns {
    pub primary: String,
    pub secondary: String,
}

fn eq_word(token: &str, word: &str) -> bool {
    token.eq_ignore_ascii_case(word)
}

/// مقدار بعد از کلید را برمی‌گرداند؛ برای `address=1.2.3.4` می‌شود `1.2.3.4`
fn token_value(token: &str, key: &str) -> Option<String> {
    let lower = token.to_ascii_lowercase();
    if !lower.starts_with(key) {
        return None;
    }
    let rest = &token[key.len()..];
    let value: String = rest
        .chars()
        .take_while(|c| c.is_ascii_digit() || *c == '.')
        .collect();
    if value.is_empty() {
        None
    } else {
        Some(value)
    }
}

fn has_dns_name(tokens: &[&str]) -> bool {
    tokens.iter().any(|t| {
        t.to_ascii_lowercase().starts_with("name=\"") || t.to_ascii_lowercase().starts_with("name=")
    })
}

fn is_dns_line(tokens: &[&str]) -> bool {
    tokens.len() >= 6
        && eq_word(tokens[0], "netsh")
        && eq_word(tokens[1], "interface")
        && eq_word(tokens[2], "ipv4")
        && eq_word(tokens[4], "dns")
}

pub fn parse_bat(text: &str) -> BatDns {
    let mut result = BatDns::default();
    for raw in text.split('\n') {
        let tokens: Vec<&str> = raw.split_whitespace().collect();
        if !is_dns_line(&tokens) || !has_dns_name(&tokens) {
            continue;
        }
        let is_set = eq_word(tokens[3], "set");
        let is_add = eq_word(tokens[3], "add");
        if !is_set && !is_add {
            continue;
        }
        if is_set && !tokens.iter().any(|t| eq_word(t, "source=static")) {
            continue;
        }
        let Some(address) = tokens.iter().find_map(|t| token_value(t, "address=")) else {
            continue;
        };
        if is_set && result.primary.is_empty() {
            result.primary = address;
        } else if is_add && result.secondary.is_empty() {
            result.secondary = address;
        }
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE: &str = "@echo off\r\n\
netsh interface ipv4 set dns name=\"Ethernet\" source=static address=178.22.122.100\r\n\
netsh interface ipv4 add dns name=\"Ethernet\" address=185.51.200.2 index=2\r\n\
netsh interface ipv4 set dns name=\"Wi-Fi\" source=static address=178.22.122.100\r\n\
netsh interface ipv4 add dns name=\"Wi-Fi\" address=185.51.200.2 index=2\r\n\
echo done";

    #[test]
    fn reads_set_and_add_lines() {
        let parsed = parse_bat(SAMPLE);
        assert_eq!(parsed.primary, "178.22.122.100");
        assert_eq!(parsed.secondary, "185.51.200.2");
    }

    #[test]
    fn reads_single_set_line() {
        let parsed =
            parse_bat("netsh interface ipv4 set dns name=\"X\" source=static address=193.186.32.32");
        assert_eq!(parsed.primary, "193.186.32.32");
        assert_eq!(parsed.secondary, "");
    }

    #[test]
    fn ignores_unrelated_lines() {
        assert_eq!(parse_bat("echo nothing here"), BatDns::default());
    }

    #[test]
    fn requires_static_source_for_set() {
        let parsed = parse_bat("netsh interface ipv4 set dns name=\"X\" address=1.2.3.4");
        assert_eq!(parsed.primary, "");
    }
}
