import { toggleTheme } from '@src/toggleTheme';
import type { IInitialSheet, ITableApproximationExtractionParam } from '@univer-clipsheet-core/table';
import { findApproximationTables, LazyLoadElements, LazyLoadTableElements } from '@univer-clipsheet-core/table';
// 该方法可以将table标签元素转换为IInitialSheet对象
function generateSheetByElement(element: HTMLTableElement) {
  return new LazyLoadTableElements([element]).getAllSheets();
}
// 该方法可以将ExtractionParams对象转换为IInitialSheet对象
function generateSheetByExtractionParams(params: ITableApproximationExtractionParam) {
  return new LazyLoadElements([params]).getAllSheets();
}

window.addEventListener('load', () => {
  const tableElements = document.querySelectorAll('table');
  // 从body自上往下查找可能包含表格的元素(例如ui、li等列表标签)，并生成ExtractionParams对象
  const extractionParamsList = findApproximationTables(document.body as HTMLBodyElement);

  const allInitialSheets: IInitialSheet[] = [];
  // 遍历table标签元素，生成IInitialSheet对象
  tableElements.forEach(element => {
    const sheets = generateSheetByElement(element as HTMLTableElement);
    allInitialSheets.push(...sheets);
  });
  // 遍历ExtractionParams对象，生成IInitialSheet对象
  extractionParamsList.forEach(params => {
    const sheets = generateSheetByExtractionParams(params);
    allInitialSheets.push(...sheets);
  });

  allInitialSheets
    // 过滤掉行数小于5的表格
    .filter(sheet => sheet.rows.length > 5)
    .forEach((sheet, sheetIndex) => {
      console.log(`Sheet ${sheetIndex + 1} :`, sheet, 'sheet rows: ', sheet.rows);
    });
});

void toggleTheme();
