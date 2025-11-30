#!/usr/bin/env python3
"""Convert SARIF v2.1.0 -> GitLab SAST report (version 15.2.3).

Usage: python tools/convert_sarif_to_gitlab_sast.py <input-sarif.json> <output-gl-sast.json>

This is a conservative converter that maps essential fields so GitLab can parse the report.
"""
import json
import sys
from pathlib import Path


def map_severity(sarif_level):
    if not sarif_level:
        return 'medium'
    lvl = sarif_level.lower()
    if lvl in ('error', 'critical'):
        return 'critical'
    if lvl in ('warning', 'warn', 'high'):
        return 'high'
    if lvl in ('note', 'info', 'medium'):
        return 'medium'
    if lvl in ('none', 'low'):
        return 'low'
    return 'medium'


def extract_location(result):
    # Prefer result.locations[0].physicalLocation
    file = 'unknown'
    start_line = 1
    locs = result.get('locations') or []
    if isinstance(locs, dict):
        locs = [locs]
    if locs:
        loc = locs[0]
        phys = loc.get('physicalLocation') or {}
        art = phys.get('artifactLocation') or {}
        if art.get('uri'):
            file = art.get('uri')
        region = phys.get('region') or {}
        if region.get('startLine'):
            start_line = region.get('startLine')
    else:
        # fallback to result.locations.physicalLocation
        phys = result.get('physicalLocation') or {}
        art = phys.get('artifactLocation') or {}
        if art.get('uri'):
            file = art.get('uri')
        region = phys.get('region') or {}
        if region.get('startLine'):
            start_line = region.get('startLine')
    return file, start_line


def main():
    if len(sys.argv) < 3:
        print('Usage: python convert_sarif_to_gitlab_sast.py <input-sarif.json> <output-gl-sast.json>')
        sys.exit(2)

    inp = Path(sys.argv[1])
    outp = Path(sys.argv[2])

    if not inp.exists():
        print(f'Input file not found: {inp}')
        sys.exit(3)

    sarif = json.loads(inp.read_text(encoding='utf8'))
    runs = sarif.get('runs') or []

    vulnerabilities = []

    for run in runs:
        tool = run.get('tool', {}).get('driver', {})
        tool_name = tool.get('name', 'sast-tool')
        tool_ver = tool.get('semanticVersion') or tool.get('version') or 'unknown'

        # build rules map
        rules_map = {}
        for r in tool.get('rules') or []:
            rid = r.get('id')
            if rid:
                rules_map[rid] = r

        for idx, result in enumerate(run.get('results') or []):
            rule_id = result.get('ruleId') or (result.get('rule') or {}).get('id') or f'rule-{idx}'
            rule = rules_map.get(rule_id) or result.get('rule') or {}

            message = ''
            if isinstance(result.get('message'), dict):
                message = result['message'].get('text') or result['message'].get('markdown') or ''
            elif isinstance(result.get('message'), str):
                message = result.get('message')
            if not message:
                message = (rule.get('shortDescription') or {}).get('text') or ''

            description = (rule.get('fullDescription') or {}).get('text') or message

            file, start_line = extract_location(result)

            severity = map_severity(result.get('level') or (result.get('properties') or {}).get('severity') or (rule.get('properties') or {}).get('severity'))

            vuln = {
                'id': f"{rule_id}-{idx}",
                'name': rule_id,
                'severity': severity,
                'confidence': 'unknown',
                'scanner': {
                    'id': tool_name,
                    'name': tool_name,
                    'version': tool_ver,
                },
                'location': {
                    'file': file,
                    'start_line': start_line
                },
                'details': description or message
            }

            vulnerabilities.append(vuln)

    # Build top-level scan metadata required by GitLab security report schema
    scan = {
        'scanner': {
            'id': tool_name,
            'name': tool_name,
            'version': tool_ver,
        },
        'type': 'sast',
    }

    gitlab_report = {
        'version': '15.2.3',
        'scan': scan,
        'vulnerabilities': vulnerabilities
    }

    outp.write_text(json.dumps(gitlab_report, indent=2), encoding='utf8')
    print(f'Converted SARIF -> GitLab SAST report: {outp} (vulnerabilities: {len(vulnerabilities)})')


if __name__ == '__main__':
    main()
