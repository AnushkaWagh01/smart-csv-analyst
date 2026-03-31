import { CSVMeta, ColumnIssue } from './analyst-types';

function parseLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { result.push(current.trim()); current = ''; }
      else { current += ch; }
    }
  }
  result.push(current.trim());
  return result;
}

function detectType(values: string[]): string {
  let nums = 0, dates = 0;
  const sample = values.slice(0, 100);
  for (const v of sample) {
    if (v === '' || v === 'null' || v === 'NULL') continue;
    if (!isNaN(Number(v))) nums++;
    else if (!isNaN(Date.parse(v)) && v.length > 4) dates++;
  }
  const total = sample.filter(v => v !== '' && v !== 'null').length || 1;
  if (nums / total > 0.7) return 'numeric';
  if (dates / total > 0.5) return 'date';
  return 'string';
}

function countOutliers(values: number[]): number {
  if (values.length < 4) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  return values.filter(v => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr).length;
}

export function parseCSV(raw: string): CSVMeta {
  const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) throw new Error('CSV needs at least a header and one data row');

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  const colCount = headers.length;
  const rowCount = rows.length;

  const columns: string[][] = headers.map((_, ci) => rows.map(r => r[ci] ?? ''));
  const dtypes: Record<string, string> = {};
  const columnIssues: ColumnIssue[] = [];
  let totalNulls = 0, totalDups = 0, outlierCount = 0;

  headers.forEach((h, ci) => {
    const col = columns[ci];
    const dtype = detectType(col);
    dtypes[h] = dtype;

    const nullCount = col.filter(v => v === '' || v.toLowerCase() === 'null' || v.toLowerCase() === 'na').length;
    const seen = new Set<string>();
    let dups = 0;
    col.forEach(v => { if (v && seen.has(v)) dups++; seen.add(v); });

    let outs = 0;
    if (dtype === 'numeric') {
      const nums = col.map(Number).filter(n => !isNaN(n));
      outs = countOutliers(nums);
    }

    totalNulls += nullCount;
    totalDups += dups;
    outlierCount += outs;

    const suggestions: string[] = [];
    if (nullCount > 0) suggestions.push(`Fill ${nullCount} missing values`);
    if (outs > 0) suggestions.push(`Review ${outs} outliers`);

    columnIssues.push({
      column: h,
      nullCount,
      nullPercent: Math.round((nullCount / rowCount) * 100),
      duplicates: dups,
      outliers: outs,
      dtype,
      suggestion: suggestions.join('; ') || 'Looks clean',
    });
  });

  const totalCells = rowCount * colCount;
  const cleanCells = totalCells - totalNulls - outlierCount;
  const qualityScore = Math.round((cleanCells / totalCells) * 100);
  const potentialScore = Math.min(100, qualityScore + Math.round((totalNulls / totalCells) * 100 * 0.8));

  const sampleRows = rows.slice(0, 5);

  return { headers, rowCount, colCount, qualityScore, potentialScore, totalNulls, totalDups, outlierCount, sampleRows, columnIssues, dtypes };
}
