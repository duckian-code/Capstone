use openai_rust_sdk::{
    error::OpenAIError,
    models::responses_v2::ResponseError,
};
use serde::Serialize;
use serde_json::Value;

#[derive(Debug, Clone, Serialize)]
pub(crate) struct CommandError {
    pub kind: &'static str,
    pub code: &'static str,
    pub message: String,
}

impl CommandError {
    pub(crate) fn app(message: impl Into<String>) -> Self {
        Self {
            kind: "app",
            code: "system_failure",
            message: message.into(),
        }
    }

    pub(crate) fn openai(_message: impl Into<String>) -> Self {
        Self::coded("api_failure")
    }

    pub(crate) fn coded(code: &'static str) -> Self {
        let (kind, message) = match code {
            "api_key_missing" =>
                ("app", "Add an API key before using AI features."),
            "api_key_invalid" =>
                ("openai", "OpenAI rejected the configured API key."),
            "api_authentication" =>
                ("openai", "OpenAI could not authenticate this request."),
            "api_access_denied" =>
                ("openai", "This request does not have the required access."),
            "api_credits_exhausted" =>
                ("openai", "The API account has no credits remaining."),
            "api_spend_limit" =>
                ("openai", "The API account or project reached a spending limit."),
            "api_quota_exceeded" =>
                ("openai", "The API account reached a quota or usage limit."),
            "api_rate_limited" =>
                ("openai", "Requests are being sent too quickly."),
            "api_limit_unknown" =>
                ("openai", "OpenAI rejected the request because of an account or rate limit."),
            "connection_failed" =>
                ("openai", "Causerie could not connect to the service."),
            "request_timed_out" =>
                ("openai", "The request took too long to finish."),
            "service_unavailable" =>
                ("openai", "The AI service is temporarily unavailable."),
            "credential_store_unavailable" =>
                ("app", "Causerie could not access its secure credential storage."),
            "storage_failure" =>
                ("app", "Causerie could not complete a local storage operation."),
            "request_cancelled" =>
                ("app", "The request was cancelled."),
            _ =>
                ("openai", "The AI request could not be completed."),
        };

        Self {
            kind,
            code,
            message: message.to_owned(),
        }
    }

    pub(crate) fn provider(
        status: Option<u16>,
        code: Option<&str>,
        error_type: Option<&str>,
    ) -> Self {
        let classified = match code {
            Some("invalid_api_key") => "api_key_invalid",

            Some("credit_balance_exhausted") => "api_credits_exhausted",

            Some("organization_spend_limit_exceeded")
            | Some("project_spend_limit_exceeded") => "api_spend_limit",

            Some("insufficient_quota")
            | Some("organization_usage_limit_exceeded") => "api_quota_exceeded",

            Some("rate_limit_exceeded")
            | Some("slow_down") => "api_rate_limited",

            Some("server_is_overloaded")
            | Some("server_error") => "service_unavailable",

            _ if error_type == Some("insufficient_quota") => "api_quota_exceeded",
            _ if error_type == Some("rate_limit_error") => "api_rate_limited",

            _ => match status {
                Some(401) => "api_authentication",
                Some(403) => "api_access_denied",
                Some(408) | Some(504) => "request_timed_out",

                // Status alone cannot distinguish billing from throttling
                Some(429) => "api_limit_unknown",

                Some(500..=599) => "service_unavailable",
                _ => "api_failure",
            },
        };

        Self::coded(classified)
    }

    pub(crate) fn response(error: &ResponseError) -> Self {
        Self::provider(
            None,
            error.code.as_deref(),
            error.error_type.as_deref(),
        )
    }

    pub(crate) fn sdk(error: OpenAIError) -> Self {
        match error {
            OpenAIError::Api { status_code, message } => {
                Self::api_body(status_code, &message)
            }
            OpenAIError::ApiError { status, message } => {
                Self::api_body(status, &message)
            }
            OpenAIError::Authentication(_) => Self::coded("api_authentication"),
            OpenAIError::Timeout(_) => Self::coded("request_timed_out"),

            OpenAIError::Request(error) if error.is_timeout() => {
                Self::coded("request_timed_out")
            }
            OpenAIError::Request(error) if error.is_connect() => {
                Self::coded("connection_failed")
            }
            OpenAIError::Request(error) => {
                Self::provider(
                    error.status().map(|status| status.as_u16()),
                    None,
                    None,
                )
            }

            // Do not guess from arbitrary SDK prose
            _ => Self::coded("api_failure"),
        }
    }

    fn api_body(status: u16, body: &str) -> Self {
        let parsed: Option<Value> = serde_json::from_str(body).ok();

        let details = parsed
            .as_ref()
            .and_then(|value| value.get("error"))
            .or(parsed.as_ref());

        Self::provider(
            Some(status),
            details.and_then(|value| value.get("code")).and_then(Value::as_str),
            details.and_then(|value| value.get("type")).and_then(Value::as_str),
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn quota_is_not_a_temporary_rate_limit() {
        let error = CommandError::provider(
            Some(429),
            Some("insufficient_quota"),
            None,
        );

        assert_eq!(error.code, "api_quota_exceeded");
    }

    #[test]
    fn unknown_429_does_not_guess() {
        assert_eq!(
            CommandError::provider(Some(429), None, None).code,
            "api_limit_unknown",
        );
    }

    #[test]
    fn generic_authentication_does_not_claim_invalid_key() {
        assert_eq!(
            CommandError::provider(Some(401), None, None).code,
            "api_authentication",
        );
    }

    #[test]
    fn structured_invalid_key_is_recognized() {
        assert_eq!(
            CommandError::api_body(
                401,
                r#"{"error":{"code":"invalid_api_key","message":"secret omitted"}}"#,
            ).code,
            "api_key_invalid",
        );
    }
}