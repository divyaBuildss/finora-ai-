/**
 * Exports data to a CSV file and triggers a browser download.
 * @param {Array<Object>|string} data - JSON array to convert or pre-formatted CSV string
 * @param {string} filename - Download filename
 */
export const exportToCSV = (data, filename) => {
  let csvContent = '';

  if (typeof data === 'string') {
    csvContent = data;
  } else if (Array.isArray(data)) {
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      const rows = [
        headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','),
        ...data.map(row =>
          headers.map(header => {
            const val = row[header];
            const stringVal = val === null || val === undefined ? '' : String(val);
            return `"${stringVal.replace(/"/g, '""')}"`;
          }).join(',')
        )
      ];
      csvContent = rows.join('\n');
    }
  } else {
    console.error('Invalid data format for CSV export');
    return;
  }

  // Handle empty data case
  if (!csvContent) {
    csvContent = 'No data available';
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
