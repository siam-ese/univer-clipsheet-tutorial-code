import { toggleTheme } from '@src/toggleTheme';
import type { IInitialSheet, ITableApproximationExtractionParam, UnknownJson } from '@univer-clipsheet-core/table';
import {
  ajaxJsonToTable,
  checkElementApproximationTable,
  checkElementTable,
  findApproximationTables,
  LazyLoadElements,
  LazyLoadTableElements,
} from '@univer-clipsheet-core/table';
import { ElementInspectService } from '@univer-clipsheet-core/ui';

// 启动AJAX拦截器
function startAjaxIntercept(scriptSrc: string, onMessage: (message: unknown) => void) {
  const script = document.createElement('script');
  script.src = scriptSrc;
  script.onload = () => {
    window.addEventListener('message', event => {
      const message = event.data;
      if (message.type === 'AJAX_INTERCEPT_MESSAGE') {
        onMessage(message.response);
      }
    });
  };
  document.body.appendChild(script);
  return () => {
    script.remove();
  };
}

startAjaxIntercept(chrome.runtime.getURL('content/ajax-interceptor.js'), res => {
  if (res) {
    console.log('AJAX response', res);
    const sheets = ajaxJsonToTable([res as UnknownJson]);
    if (sheets.length > 0) {
      console.log('AJAX sheets from response', sheets);
    }
  }
});

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

const elementInspectService = new ElementInspectService();

const last = <T>(arr: T[]) => arr[arr.length - 1];
elementInspectService.shadowComponent.onInspectElement(element => {
  // 获取最近匹配到的table标签元素
  const tableElement = last(checkElementTable(element));
  // 获取最近匹配到的ExtractionParams对象
  const tableExtractionParams = last(checkElementApproximationTable(element));
  // 点击页面元素时，会触发该回调函数
  console.log('Inspect Element:', element);
  if (tableElement) {
    // 如果点击的元素是table标签，则生成IInitialSheet对象
    const sheet = generateSheetByElement(tableElement as HTMLTableElement);
    // 打印表格数据
    console.log('Inspect Table:', sheet);
    // 最近匹配到的类表格元素
    console.log('Inspect Table success with element:', tableElement);
  } else if (tableExtractionParams) {
    const sheet = generateSheetByExtractionParams(tableExtractionParams);
    // 打印表格数据
    console.log('Inspect Table:', sheet);
    // 最近匹配到的类表格元素
    console.log('Inspect Table success with element:', tableExtractionParams.element);
  } else {
    console.log('Not found table with element', element);
  }
});

// setTimeout(() => {
//   // 激活元素检查功能
//   elementInspectService.shadowComponent.activate();
// });

void toggleTheme();
