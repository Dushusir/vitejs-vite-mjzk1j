import { sheet1_data, sheet2_data } from './sheet_data.ts';
export const mock_data = {
  appVersion: '1.0.1',
  id: 'workbook-01',
  locale: 'zhCN',
  name: 'workbook',
  sheets: {
    'sheet-1': {
      id: 'sheet-1',
      name: 'sheet1',
      ...sheet1_data,
      rowCount: 90,
      columnCount: 209,
    },
    'sheet-2': {
      id: 'sheet-2',
      name: 'sheet2',
      ...sheet2_data,
      rowCount: 15,
      columnCount: 25,
    },
  },
  resources: [],
  sheetOrder: ['sheet-1', 'sheet-2'],
  styles: {
    pattern0: {
      n: { pattern: '0' },
    },
    pattern1: {
      n: { pattern: '0.0' },
    },
    pattern2: {
      n: { pattern: '0.00' },
    },
    pattern3: {
      n: { pattern: '0.000' },
    },
    pattern4: {
      n: { pattern: '0.0000' },
    },
    pattern5: {
      n: { pattern: '0.00000' },
    },
  },
};
