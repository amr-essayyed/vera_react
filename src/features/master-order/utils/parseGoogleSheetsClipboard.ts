export async function parseGoogleSheetsClipboard(event) {
  // Get plain text from clipboard
  const text = event.clipboardData.getData('text/plain');
  
  // TSV parser (handles quoted cells with newlines)
  function parseTSV(text) {
    const rows = [];
    let row = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i + 1];

      if (c === '"') {
        if (inQuotes && next === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === '\t' && !inQuotes) {
        row.push(cell);
        cell = '';
      } else if ((c === '\n' || c === '\r') && !inQuotes) {
        row.push(cell);
        cell = '';
        if (row.length) rows.push(row);
        row = [];
        if (c === '\r' && text[i + 1] === '\n') i++;
      } else {
        cell += c;
      }
    }

    if (cell || row.length) row.push(cell);
    if (row.length) rows.push(row);

    return rows;
  }

  // If plain text exists, parse it
  if (text && text.trim()) {
    return parseTSV(text);
  }

  // Fallback: parse HTML table
  const html = event.clipboardData.getData('text/html');
  if (html && html.trim()) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const table = doc.querySelector('table');
    if (!table) return [];

    const rows = [];
    for (const tr of table.querySelectorAll('tr')) {
      const row = [];
      for (const td of tr.querySelectorAll('td')) {
        // Replace <br> with newline
        const cell = td.innerHTML.replace(/<br\s*\/?>/gi, '\n').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
        row.push(cell.trim());
      }
      rows.push(row);
    }
    return rows;
  }

  // Nothing found
  return [];
}
