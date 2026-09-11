"""Deployment authority and recovery boundaries, without a running Docker daemon."""
import hashlib
import json
import os
import re
import shutil
import sqlite3
import subprocess
from pathlib import Path

import pytest

from test_recovery import Engine, installed, recovery, recovery_data

ROOT = Path(__file__).resolve().parents[1]


def compose_config(tmp_path):
    if not shutil.which("docker"):
        pytest.skip("Docker Compose CLI is required (the daemon is not)")
    names = set(re.findall(r"\$\{([A-Z_]+)", (ROOT / "docker-compose.yml").read_text()))
    versions = dict(line.split("=", 1) for line in (ROOT / "versions.env").read_text().splitlines()
                    if line and not line.startswith("#"))
    values = {name: name.lower() + "-fixture-" + "x" * 32 for name in names - versions.keys()}
    values.update(CONKER_PORT="8050", CONKER_BACKUP_DIR=tmp_path.as_posix(), GATEWAY_ORIGIN="https://localhost:8050",
                  CONKER_EMBEDDING_DIMENSION="1024", PI_GATEWAY_KEY_SHA256=hashlib.sha256(values["PI_GATEWAY_KEY"].encode()).hexdigest())
    fixture = tmp_path / "fixture.env"
    fixture.write_text("\n".join(f"{key}={value}" for key, value in values.items()))
    result = subprocess.run(["docker", "compose", "--env-file", str(ROOT / "versions.env"),
                             "--env-file", str(fixture), "-f", str(ROOT / "docker-compose.yml"),
                             "config", "--format", "json"], capture_output=True, text=True, timeout=30,
                            env={key: value for key, value in os.environ.items() if key not in names})
    assert result.returncode == 0, result.stderr
    return json.loads(result.stdout)


def test_compose_cannot_give_worker_owner_credentials_or_auth_storage(tmp_path):
    config = compose_config(tmp_path)
    services = config["services"]
    gateway, pi = services["gateway"], services["pi"]
    owner_key = gateway["environment"]["GATEWAY_TOOLGATE_OWNER_KEY"]
    runtime_key = gateway["environment"]["PI_GATEWAY_KEY"]
    assert owner_key != runtime_key
    assert pi["environment"]["PI_GATEWAY_KEY_SHA256"] == hashlib.sha256(runtime_key.encode()).hexdigest()
    assert owner_key not in json.dumps(pi) and runtime_key not in json.dumps(pi)
    assert not pi.get("ports")
    assert gateway["ports"][0]["host_ip"] == "127.0.0.1"
    assert "gateway" in gateway["command"]
    auth_volume = next(mount["source"] for mount in gateway["volumes"] if mount["target"] == "/auth")
    assert not any(mount["source"] == auth_volume for mount in pi["volumes"])
    assert not any("ADMIN_KEY" in key for key in gateway["environment"])


def test_missing_gateway_database_cannot_produce_success(installed):
    root, engine = installed
    (engine.volumes["original-gateway"] / "auth.db").unlink()
    with pytest.raises(recovery.RecoveryError, match="SQLite store"):
        recovery.backup(root, None, engine)


def test_manifest_cannot_hide_gateway_by_removing_image_and_archive(installed):
    root, engine = installed
    snapshot = recovery.backup(root, None, engine)
    manifest = json.loads((snapshot / "manifest.json").read_text())
    del manifest["images"]["gateway"]
    del manifest["stores"]["gateway"]
    (snapshot / "gateway.tar").unlink()
    manifest["files"] = recovery.inventory(snapshot)
    recovery.write_json(snapshot / "manifest.json", manifest)
    with pytest.raises(recovery.RecoveryError, match="services and image"):
        recovery.verify_snapshot(snapshot)


def test_pre_gateway_snapshot_still_restores_under_hold(installed, tmp_path, monkeypatch):
    root, engine = installed
    original_json = engine.json

    def legacy_json(*args):
        value = original_json(*args)
        if args[0] == "compose" and "config" in args:
            del value["services"]["gateway"]
        return value

    monkeypatch.setattr(engine, "json", legacy_json)
    snapshot = recovery.backup(root, None, engine)
    assert "gateway" not in recovery.verify_snapshot(snapshot)["stores"]
    state = recovery.restore(snapshot, tmp_path / "legacy-restored", engine)
    assert state["status"] == "held" and state["applications_started"] is False


def test_unknown_gateway_schema_fails_before_any_application_can_start(tmp_path):
    database = tmp_path / "auth.db"
    with sqlite3.connect(database) as db:
        db.execute("CREATE TABLE unexpected(x)")
    with pytest.raises(sqlite3.DatabaseError):
        recovery_data.invalidate_browser_sessions(database)
