#!/usr/bin/env python3
"""
Simple JaCoCo XML -> Cobertura XML converter.

This is a minimal converter that reads a JaCoCo report XML (one file) and
produces a Cobertura-format XML containing per-file line hits. It's
intentionally small and dependency-free so it can run in CI without pip.

Usage: python jacoco_to_cobertura.py -i path/to/jacoco.xml -o path/to/cobertura.xml

If you want to merge multiple jacoco.xml files, call this script multiple
times and merge outputs externally (or extend this script later).
"""
import argparse
import xml.etree.ElementTree as ET
import sys
import os
from datetime import datetime, timezone


def parse_jacoco(jacoco_path):
    tree = ET.parse(jacoco_path)
    root = tree.getroot()
    # root is <report>
    packages = []
    total_lines = 0
    covered_lines = 0
    for pkg in root.findall('package'):
        pkg_name = pkg.get('name')
        files = []
        for sourcefile in pkg.findall('sourcefile'):
            fname = sourcefile.get('name')
            # collect lines
            lines = []
            for line in sourcefile.findall('line'):
                nr = int(line.get('nr'))
                # JaCoCo uses 'ci' for covered instructions on that line;
                # treat any ci>0 as a hit
                ci = line.get('ci')
                try:
                    ci_val = int(ci) if ci is not None else 0
                except ValueError:
                    ci_val = 0
                hits = 1 if ci_val > 0 else 0
                lines.append((nr, hits))
                total_lines += 1
                if hits:
                    covered_lines += 1
            if lines:
                files.append((fname, lines))
        if files:
            packages.append((pkg_name, files))
    return packages, total_lines, covered_lines


def make_cobertura(packages, total_lines, covered_lines, out_path):
    coverage = ET.Element('coverage')
    line_rate = 0.0
    if total_lines > 0:
        line_rate = float(covered_lines) / float(total_lines)
    coverage.set('line-rate', '{:.4f}'.format(line_rate))
    coverage.set('branch-rate', '0')
    coverage.set('version', '0.1')
    coverage.set('timestamp', str(int(datetime.now(timezone.utc).timestamp())))

    packages_el = ET.SubElement(coverage, 'packages')
    for pkg_name, files in packages:
        pkg_el = ET.SubElement(packages_el, 'package')
        pkg_el.set('name', pkg_name)
        classes_el = ET.SubElement(pkg_el, 'classes')
        for fname, lines in files:
            class_el = ET.SubElement(classes_el, 'class')
            class_el.set('name', fname.replace('.','_'))
            # filename: include package path if package name present
            filename = os.path.join(pkg_name.replace('.', os.sep), fname) if pkg_name else fname
            class_el.set('filename', filename)
            lines_el = ET.SubElement(class_el, 'lines')
            for nr, hits in sorted(lines):
                line_el = ET.SubElement(lines_el, 'line')
                line_el.set('number', str(nr))
                line_el.set('hits', str(hits))

    # write XML header
    tree = ET.ElementTree(coverage)
    ET.indent(tree, space="  ")
    os.makedirs(os.path.dirname(out_path) or '.', exist_ok=True)
    tree.write(out_path, encoding='utf-8', xml_declaration=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-i', '--input', required=True, help='Path to jacoco.xml')
    parser.add_argument('-o', '--output', required=True, help='Path to output cobertura xml')
    args = parser.parse_args()

    if not os.path.isfile(args.input):
        print('jacoco xml not found:', args.input, file=sys.stderr)
        sys.exit(2)

    packages, total_lines, covered_lines = parse_jacoco(args.input)
    make_cobertura(packages, total_lines, covered_lines, args.output)
    pct = (float(covered_lines) / total_lines * 100) if total_lines else 0.0
    print('Converted jacoco -> cobertura: {:.2f}% ({} of {} lines)'.format(pct, covered_lines, total_lines))


if __name__ == '__main__':
    main()
