import { LocaleType, LogLevel, Univer } from '@univerjs/core';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverRPCWorkerThreadPlugin } from '@univerjs/rpc';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsFilterUIWorkerPlugin } from '@univerjs/sheets-filter-ui';
import { UniverRemoteSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { zhCN, enUS } from 'univer:locales';

// Univer web worker is also a univer application.
const univer = new Univer({
    locale: LocaleType.ZH_CN,
    logLevel: LogLevel.VERBOSE,
    locales: {
        [LocaleType.ZH_CN]: zhCN,
        [LocaleType.EN_US]: enUS,
    },
});

univer.registerPlugin(UniverSheetsPlugin, { onlyRegisterFormulaRelatedMutations: true });
univer.registerPlugin(UniverFormulaEnginePlugin);
univer.registerPlugin(UniverRPCWorkerThreadPlugin);
univer.registerPlugin(UniverRemoteSheetsFormulaPlugin);
univer.registerPlugin(UniverSheetsFilterUIWorkerPlugin);