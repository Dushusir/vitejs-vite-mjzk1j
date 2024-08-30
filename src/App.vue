<template>
  <div class="excel-design">
    <a-spin :spinning="spinning" tip="加载中...">
      <div class="excel-design-top">
        <div class="top-buttons">
          <a-button type="primary" :loading="saveing" @click="handleSave"
            >保存</a-button
          >
        </div>
      </div>
      <div ref="container" class="excel-design-container" />
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, toRaw, h } from 'vue';
import { message, Modal } from 'ant-design-vue';
import '@univerjs/sheets-conditional-formatting-ui/lib/index.css';
import '@univerjs/sheets-data-validation/lib/index.css';
import '@univerjs/sheets-numfmt/lib/index.css';
//筛选
import '@univerjs/sheets-filter-ui/lib/index.css';
//查找&替换
import '@univerjs/find-replace/lib/index.css';
//导入导出
import '@univerjs-pro/exchange-client/lib/index.css';

import {
  Univer,
  UniverInstanceType,
  Workbook,
  LocaleType,
  type IWorkbookData,
  LogLevel,
  type ICellData,
  ObjectMatrix,
  type IWorksheetData,
  type IRange,
  type IObjectMatrixPrimitiveType,
  PermissionService,
  IPermissionService,
} from '@univerjs/core';
import { defaultTheme } from '@univerjs/design';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import {
  CalculateFormulaService,
  UniverFormulaEnginePlugin,
  type ISheetData,
} from '@univerjs/engine-formula';
import {
  DeviceInputEventType,
  UniverRenderEnginePlugin,
} from '@univerjs/engine-render';
import {
  UniverSheetsPlugin,
  type IAddRangeProtectionCommandParams,
} from '@univerjs/sheets';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { IProgressService, UniverUIPlugin } from '@univerjs/ui';
//import { FUniver } from "@univerjs/facade";
import { FUniver } from '@univerjs-pro/facade';
import { UniverDataValidationPlugin } from '@univerjs/data-validation';
import {
  SheetsDataValidationValidatorService,
  UniverSheetsDataValidationPlugin,
} from '@univerjs/sheets-data-validation';
import { UniverSheetsConditionalFormattingPlugin } from '@univerjs/sheets-conditional-formatting';
import { UniverSheetsConditionalFormattingUIPlugin } from '@univerjs/sheets-conditional-formatting-ui';
import type { IdentifierDecorator } from 'node_modules/@wendellhu/redi/esm/dependencyIdentifier';
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt';
//筛选
import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { UniverSheetsFilterUIPlugin } from '@univerjs/sheets-filter-ui';
//查找&替换
import { UniverFindReplacePlugin } from '@univerjs/find-replace';
import { UniverSheetsFindReplacePlugin } from '@univerjs/sheets-find-replace';
//导入导出
import { UniverSheetsExchangeClientPlugin } from '@univerjs-pro/sheets-exchange-client';
import { UniverRPCMainThreadPlugin } from '@univerjs/rpc';

import { zhCN, enUS } from 'univer:locales';

import { mock_data } from '@/assets/mock';
import { testDataValidation } from './assets/snapshot';

//注册自定义命令
/*import RegisterCustomCommandPlugin from "@/plugins/RegisterCustomCommandPlugin";

  import {getExcelData, submitExcelData } from '@/api/excel';
  import { downloadFile, getExcelCellName, pakoGzip, parseQuery } from '@/utils';
  import { mock_datas,mock_datas1 } from "@/assets/mock";
  import type { ICustomSetBorderCommandParams, ICustomSetSelectionFrozenCommandParams } from "@/types/univer";*/

const univerRef = ref<Univer | null>(null);
const workbook = ref<Workbook | null>(null);
const univerAPI = ref<any>(null);
const container = ref<HTMLElement | null>(null);
const spinning = ref<boolean>(true);
const submiting = ref<boolean>(false);
const saveing = ref<boolean>(false);

onMounted(() => {
  init();
});

onBeforeUnmount(() => {
  destroyUniver();
});

const init = async () => {
  const univer = new Univer({
    theme: defaultTheme,
    locale: LocaleType.ZH_CN,
    locales: {
      [LocaleType.ZH_CN]: zhCN,
      [LocaleType.EN_US]: enUS,
    },
    //logLevel: LogLevel.VERBOSE,
  });
  univerRef.value = univer;

  // core plugins
  univer.registerPlugin(UniverRenderEnginePlugin);
  univer.registerPlugin(UniverFormulaEnginePlugin, { notExecuteFormula: true });
  univer.registerPlugin(UniverUIPlugin, {
    container: container.value!,
  });

  // doc plugins
  univer.registerPlugin(UniverDocsPlugin, {
    hasScroll: false,
  });
  univer.registerPlugin(UniverDocsUIPlugin);

  // sheet plugins
  univer.registerPlugin(UniverSheetsPlugin, { notExecuteFormula: true });
  univer.registerPlugin(UniverSheetsUIPlugin, {
    menu: {
      ['sheet.command.add-range-protection-from-toolbar']: {
        hidden: true,
      },
    },
  });
  univer.registerPlugin(UniverSheetsFormulaPlugin, { notExecuteFormula: true });
  //数据校验
  univer.registerPlugin(UniverDataValidationPlugin);
  univer.registerPlugin(UniverSheetsDataValidationPlugin);

  //univer.registerPlugin(UniverSheetsConditionalFormattingPlugin);
  univer.registerPlugin(UniverSheetsConditionalFormattingUIPlugin);

  //数值处理
  univer.registerPlugin(UniverSheetsNumfmtPlugin);
  //筛选
  univer.registerPlugin(UniverSheetsFilterPlugin);
  univer.registerPlugin(UniverSheetsFilterUIPlugin);
  //查找&替换
  univer.registerPlugin(UniverFindReplacePlugin);
  univer.registerPlugin(UniverSheetsFindReplacePlugin);

  univer.registerPlugin(UniverRPCMainThreadPlugin, {
      workerURL: new Worker(new URL('./worker.js', import.meta.url), {
      type: 'module'
    }),
  } as IUniverRPCMainThreadConfig);
  

  //注册自定义命令
  //univer.registerPlugin(RegisterCustomCommandPlugin);
  //导入导出
  //univer.registerPlugin(UniverSheetsExchangeClientPlugin);

  univerAPI.value = FUniver.newAPI(univer);
  //请求Excel数据
  let workbookData = testDataValidation;
  workbook.value = univer.createUnit<IWorkbookData, Workbook>(
    UniverInstanceType.UNIVER_SHEET,
    workbookData
  );

  const formula = univerAPI.value.getFormula();
  formula.calculationEnd((functionsExecutedState) => {
    //执行自定义命令
    spinning.value = false;

    // 暂时处理进度条不消失问题
    univer.__getInjector().get(IProgressService).stop();
  });
};
//保存
const handleSave = () => {
  if (!workbook.value) {
    throw new Error('Workbook is not initialized');
  }
  const activeWorkbook = univerAPI.value.getActiveWorkbook();
  const univerData: IWorkbookData = toRaw(activeWorkbook?.getSnapshot());
  console.log('univerData-->', univerData);
};

const destroyUniver = () => {
  toRaw(univerRef.value)?.dispose();
  univerRef.value = null;
  workbook.value = null;
  univerAPI.value = null;
};
</script>
<style scoped>
.excel-design {
  widows: 100%;
  height: 100%;
  overflow: hidden;
}
.excel-design .excel-design-top {
  height: 46px;
  display: flex;
  align-items: center;
  padding: 0 30px;
  justify-content: end;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eaeaea;
  position: relative;
}
.excel-design-top .top-buttons .ant-btn {
  margin-left: 8px;
}
.excel-design-container {
  width: 100%;
  height: calc(100vh - 46px);
  overflow: hidden;
}

/* Also hide the menubar */
:global(.univer-menubar) {
  display: none;
}
</style>
