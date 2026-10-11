#!/usr/bin/env python3
"""Run local quality checks and bind their results to the checked-out commit."""

import argparse
import hashlib
import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LAYERS = ("base", "derived-main", "main", "showcases")


def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT, text=True).strip()


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def identity():
    return {
        "commit": git("rev-parse", "HEAD"),
        "tree": git("rev-parse", "HEAD^{tree}"),
        "lockfiles": {p.name: digest(p) for p in sorted(ROOT.glob("*lock*")) if p.is_file()},
    }


def tool_version(command):
    try:
        return subprocess.check_output(command, cwd=ROOT, text=True, stderr=subprocess.STDOUT).strip()
    except (OSError, subprocess.CalledProcessError) as error:
        return f"unavailable: {error}"


def verify(path):
    record = json.loads(path.read_text())
    if record["identity"] != identity():
        raise ValueError("Evidence is stale: commit, tree, or lockfile changed")
    if git("status", "--porcelain"):
        raise ValueError("Working tree is dirty")
    if not record["checks"] or any(check["exit_code"] != 0 for check in record["checks"]):
        raise ValueError("Evidence contains failed or missing checks")
    expected = [(layer, check) for layer in LAYERS for check in ("lint", "typecheck", "test:coverage")]
    actual = [(check["layer"], check["name"]) for check in record["checks"]]
    if actual != expected:
        raise ValueError("Evidence does not cover the required checks")
    for check in record["checks"]:
        if digest(Path(check["log"])) != check["log_sha256"]:
            raise ValueError("A check log changed")
        artifact = check.get("artifact")
        if artifact and digest(Path(artifact["path"])) != artifact["sha256"]:
            raise ValueError("A coverage artifact changed")
    print(f"Valid local quality evidence for {record['identity']['commit']}")


def run(output):
    if git("status", "--porcelain"):
        raise ValueError("Commit changes before running checks so the result has an exact identity")
    output.mkdir(parents=True, exist_ok=True)
    record = {
        "identity": identity(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "platform": sys.platform,
        "tools": {"bun": tool_version(["bun", "--version"]), "node": tool_version(["node", "--version"]), "python": sys.version},
        "checks": [],
    }
    evidence = output / f"{record['identity']['commit']}.json"
    for layer in LAYERS:
        for name in ("lint", "typecheck", "test:coverage"):
            command = ["bun", "run", name]
            log = output / f"{record['identity']['commit']}-{layer}-{name.replace(':', '-')}.log"
            print(f"{layer}: {' '.join(command)}", flush=True)
            with log.open("wb") as stream:
                result = subprocess.run(command, cwd=ROOT / "layers" / layer, stdout=stream, stderr=subprocess.STDOUT, check=False)
            record["checks"].append({
                "layer": layer,
                "name": name,
                "command": command,
                "exit_code": result.returncode,
                "log": str(log),
                "log_sha256": digest(log),
            })
            if name == "test:coverage" and result.returncode == 0:
                artifact = ROOT / "layers" / layer / "coverage" / "coverage-final.json"
                if not artifact.is_file():
                    result.returncode = 1
                    record["checks"][-1]["exit_code"] = 1
                else:
                    record["checks"][-1]["artifact"] = {"path": str(artifact), "sha256": digest(artifact)}
            evidence.write_text(json.dumps(record, indent=2) + "\n")
            if result.returncode:
                print(f"Failed: {log}", file=sys.stderr)
                return result.returncode
    verify(evidence)
    print(evidence)
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--verify", type=Path, help="Verify an existing evidence JSON against the current checkout")
    parser.add_argument("--output", type=Path, default=ROOT.parent / "local-quality-evidence" / ROOT.name)
    args = parser.parse_args()
    try:
        sys.exit(verify(args.verify) if args.verify else run(args.output))
    except (ValueError, OSError, subprocess.CalledProcessError) as error:
        print(error, file=sys.stderr)
        sys.exit(1)
