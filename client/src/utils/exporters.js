import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { dayjs, money, showDate } from './format';

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const stamp = () => dayjs().format('YYYY-MM-DD');

/** CSV opens in Excel, Google Sheets and Numbers. */
export function exportCsv(items) {
  const rows = items.map((t) => ({
    Date: showDate(t.date, 'YYYY-MM-DD'),
    Type: t.type,
    Category: t.category,
    Description: t.description,
    Amount: t.amount,
  }));
  download(new Blob([Papa.unparse(rows)], { type: 'text/csv;charset=utf-8' }), `expenso-transactions-${stamp()}.csv`);
}

export function exportPdf(items, { currency, title = 'Transactions' }) {
  const doc = new jsPDF();
  const income = items.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = items.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  doc.setFontSize(18);
  doc.text(`Expenso · ${title}`, 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(`Generated ${dayjs().format('MMM D, YYYY')} · ${items.length} transactions`, 14, 25);
  doc.text(
    `Income ${money(income, currency)}   Expenses ${money(expense, currency)}   Balance ${money(income - expense, currency)}`,
    14,
    31,
  );

  autoTable(doc, {
    startY: 37,
    head: [['Date', 'Category', 'Description', 'Type', 'Amount']],
    body: items.map((t) => [
      showDate(t.date),
      t.category,
      t.description || '',
      t.type === 'income' ? 'Income' : 'Expense',
      (t.type === 'income' ? '+' : '−') + money(t.amount, currency),
    ]),
    headStyles: { fillColor: [15, 118, 110] },
    styles: { fontSize: 9 },
    columnStyles: { 4: { halign: 'right' } },
  });
  doc.save(`expenso-report-${stamp()}.pdf`);
}

const HEADER_ALIASES = {
  date: ['date', 'transaction date', 'posted date', 'posting date'],
  description: ['description', 'details', 'memo', 'name', 'payee', 'merchant'],
  amount: ['amount', 'value', 'debit/credit'],
  category: ['category'],
  type: ['type', 'transaction type'],
  debit: ['debit', 'withdrawal', 'withdrawals'],
  credit: ['credit', 'deposit', 'deposits'],
};

function findColumn(headers, key) {
  const wanted = HEADER_ALIASES[key];
  return headers.find((h) => wanted.includes(h.trim().toLowerCase()));
}

/**
 * Reads a bank or spreadsheet CSV into transactions. Understands a signed
 * Amount column, or separate Debit/Credit columns. Rows it can't read are
 * returned in `skipped` with the reason.
 */
export function parseCsv(file, { defaultExpense = 'Other', defaultIncome = 'Other income' } = {}) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, meta }) => {
        const headers = meta.fields ?? [];
        const col = Object.fromEntries(Object.keys(HEADER_ALIASES).map((k) => [k, findColumn(headers, k)]));
        if (!col.date || (!col.amount && !col.debit && !col.credit)) {
          reject(new Error('The file needs a Date column and an Amount column (or Debit and Credit columns).'));
          return;
        }
        const rows = [];
        const skipped = [];
        const num = (v) => Number(String(v ?? '').replace(/[^0-9.-]/g, ''));
        // Bank exports use negative amounts for money out. A sheet with only
        // positive amounts and no Type column is treated as a list of expenses.
        const signed = col.amount && data.some((r) => num(r[col.amount]) < 0);
        data.forEach((r, i) => {
          const date = dayjs(r[col.date]);
          let amount;
          let type;
          if (col.amount) {
            amount = num(r[col.amount]);
            const typeText = String(r[col.type] ?? '').toLowerCase();
            if (/income|credit|deposit/.test(typeText)) type = 'income';
            else if (/expense|debit|withdraw/.test(typeText)) type = 'expense';
            else if (signed) type = amount < 0 ? 'expense' : 'income';
            else type = 'expense';
            amount = Math.abs(amount);
          } else {
            const debit = num(r[col.debit]);
            const credit = num(r[col.credit]);
            type = credit > 0 ? 'income' : 'expense';
            amount = credit > 0 ? credit : Math.abs(debit);
          }
          if (!date.isValid()) return skipped.push({ line: i + 2, reason: 'date not readable' });
          if (!amount) return skipped.push({ line: i + 2, reason: 'no amount' });
          rows.push({
            date: date.format('YYYY-MM-DD'),
            type,
            amount: Math.round(amount * 100) / 100,
            category: (col.category && r[col.category]?.trim()) || (type === 'income' ? defaultIncome : defaultExpense),
            description: String(r[col.description] ?? '').trim().slice(0, 200),
          });
        });
        resolve({ rows, skipped });
      },
      error: reject,
    });
  });
}
