"""
Authentication for the Pipeline 1 upload endpoint.

Single-user v1: a Bearer token compared against PIPELINE1_API_KEY
read from /home/intel/miami-dade-intel/.env at startup.

For v2+ (multi-user), this would become per-user keys with
hashing + a key-management UI. v1 keeps it simple.
"""
import os
from functools import wraps
from flask import request, jsonify

# Read the API key once at module import.
# If unset, all requests will be rejected — fail-closed by default.
EXPECTED_API_KEY = os.environ.get("PIPELINE1_API_KEY", "").strip()


def require_api_key(view_func):
    """
    Flask decorator that checks for a valid Bearer token.

    Usage:
        @app.route("/upload")
        @require_api_key
        def upload():
            ...
    """

    @wraps(view_func)
    def wrapper(*args, **kwargs):
        if not EXPECTED_API_KEY:
            return jsonify({
                "error": "server_misconfigured",
                "detail": "PIPELINE1_API_KEY is not set on the droplet.",
            }), 500

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({
                "error": "unauthorized",
                "detail": "Missing or malformed Authorization header.",
            }), 401

        provided_key = auth_header[len("Bearer "):].strip()
        if provided_key != EXPECTED_API_KEY:
            return jsonify({
                "error": "unauthorized",
                "detail": "Invalid API key.",
            }), 401

        return view_func(*args, **kwargs)

    return wrapper