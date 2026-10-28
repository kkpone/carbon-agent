import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getOperationReportDownloadAccess,
  OPERATION_DOWNLOAD_PATH,
  LEGACY_OPERATION_DOWNLOAD_PATH,
  operationReportCards,
} from './reportDownload';
import { getCbamFileBusinessType } from '../cbamFileBusiness';

const receipt = () => ({
  fileId: '9007199254740993',
  operationId: '42',
  fileName: '运营报告.docx',
  sourceDataVersion: 0,
  fileStatus: 'READY',
  downloadRegistered: true,
  access: {
    method: 'POST',
    path: OPERATION_DOWNLOAD_PATH,
    body: { sessionId: 's', resourceId: '9007199254740993' },
  },
});

test('published reports become standalone cards, deduplicated across nested tools and cards', () => {
  const file = receipt();
  const tool = {
    status: 'SUCCESS',
    messageId: 'm',
    orderNo: 3,
    payload: {
      result: { host_operations: [{ result: file }, { result: file }] },
    },
  };
  const cards = operationReportCards([], [tool, tool], 's');
  assert.equal(cards.length, 1);
  assert.equal(cards[0].cardType, 'cbam_operation_report');
  assert.equal(
    getOperationReportDownloadAccess(cards[0].card, 's')?.fileId,
    file.fileId,
  );
  assert.equal(operationReportCards(cards, [tool], 's').length, 1);
  assert.equal(
    operationReportCards([], [{ ...tool, status: 'FAILED' }], 's').length,
    0,
  );
  assert.equal(operationReportCards([], [tool], 'other').length, 0);
});

test('different published files in one tool remain separate report cards', () => {
  const second = receipt();
  second.fileId = '9007199254740994';
  second.access.body.resourceId = second.fileId;
  const cards = operationReportCards(
    [],
    [
      {
        status: 'COMPLETED',
        messageId: 'm',
        payload: { result: [receipt(), second] },
      },
    ],
    's',
  );
  assert.deepEqual(
    cards.map(card => card.card.fileId),
    [receipt().fileId, second.fileId],
  );
});

test('published file receipt retains large string ID and zero version', () => {
  const access = getOperationReportDownloadAccess(
    { data: { success: true, data: receipt() } },
    's',
  );
  assert.equal(access?.fileId, '9007199254740993');
  assert.deepEqual(access?.body, {
    sessionId: 's',
    resourceId: '9007199254740993',
  });
  assert.equal(access?.sourceDataVersion, 0);
  assert.equal(
    getCbamFileBusinessType({ module: 'cbam2', info: 'operation_report' }),
    'operation_report',
  );
  assert.equal(
    getCbamFileBusinessType({ module: 'cbam2', info: 'monitor_plan' }),
    'monitor_plan',
  );
  assert.equal(getCbamFileBusinessType({ module: 'cbam2' }), 'report');
});

test('failed or unpublished files and foreign sessions cannot produce download cards', () => {
  assert.equal(
    getOperationReportDownloadAccess({ success: false, data: receipt() }, 's'),
    undefined,
  );
  assert.equal(
    getOperationReportDownloadAccess(
      { ...receipt(), fileStatus: 'UPLOADED' },
      's',
    ),
    undefined,
  );
  assert.equal(
    getOperationReportDownloadAccess(
      { ...receipt(), downloadRegistered: false },
      's',
    ),
    undefined,
  );
  assert.equal(getOperationReportDownloadAccess(receipt(), 'other'), undefined);
  assert.equal(
    getOperationReportDownloadAccess({ args: receipt() }, 's'),
    undefined,
  );
});

test('arbitrary paths and mismatched file identity are rejected', () => {
  const wrongPath = receipt();
  wrongPath.access.path =
    'https://untrusted.test/file' as typeof OPERATION_DOWNLOAD_PATH;
  assert.equal(getOperationReportDownloadAccess(wrongPath, 's'), undefined);
  const wrongId = receipt();
  wrongId.access.body.resourceId = '9007199254740994';
  assert.equal(getOperationReportDownloadAccess(wrongId, 's'), undefined);
});

test('historical download entries remain usable without claiming registration', () => {
  const old = {
    method: 'POST',
    path: LEGACY_OPERATION_DOWNLOAD_PATH,
    body: { sessionId: 's', operationId: '42', dataVersion: 0, language: 'ZH' },
  };
  const access = getOperationReportDownloadAccess(
    { toolResult: { resultData: old } },
    's',
  );
  assert.equal(access?.path, LEGACY_OPERATION_DOWNLOAD_PATH);
  assert.equal(access?.fileId, undefined);
});
