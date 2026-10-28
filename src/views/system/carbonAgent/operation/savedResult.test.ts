import test from 'node:test';
import assert from 'node:assert/strict';
import { operationSavedResult } from './savedResult';
import type { AgentToolCall } from '../service';

const receipt = (version = 0) => ({
  businessResult: {
    module: 'cbam2',
    bizType: 'operation_report',
    operationId: '9007199254740993',
    dataVersion: version,
    eventId: `e-${version}`,
    action: 'created',
    success: true,
    persisted: true,
  },
});
const call = (toolName: string, payload: object, status = 'COMPLETED') =>
  ({ toolName, payload, status } as AgentToolCall);

test('real creation opens with zero version and exact string ID', () => {
  assert.equal(
    operationSavedResult(
      call('cbam_operation_report_create', { success: true, data: receipt() }),
    )?.dataVersion,
    0,
  );
  assert.equal(
    operationSavedResult(
      call('agent_cbam_operation_report_create', {
        success: true,
        data: receipt(),
      }),
    )?.operationId,
    '9007199254740993',
  );
});
test('a later host failure retains the successful creation receipt', () => {
  assert.ok(
    operationSavedResult(
      call(
        'prepareCbamOperationTask',
        {
          success: false,
          host_operations: [
            {
              tool_name: 'cbam_operation_report_create',
              success: true,
              result: receipt(),
            },
          ],
        },
        'FAILED',
      ),
    ),
  );
});
test('arguments and material facts cannot masquerade as successful writes', () => {
  assert.equal(
    operationSavedResult(
      call('cbam_operation_report_create', {
        arguments: receipt(),
        facts: [receipt()],
      }),
    ),
    undefined,
  );
  assert.equal(
    operationSavedResult(
      call('cbam_operation_report_create', receipt(), 'FAILED'),
    ),
    undefined,
  );
  assert.equal(
    operationSavedResult(
      call('prepareCbamOperationTask', {
        host_operations: [
          {
            tool_name: 'cbam_operation_report_create',
            success: false,
            result: receipt(),
          },
        ],
      }),
    ),
    undefined,
  );
});
test('host replay picks its newest durable version', () => {
  const payload = {
    host_operations: [0, 3, 1].map(version => ({
      tool_name: 'cbam_operation_general_patch',
      success: true,
      result: receipt(version),
    })),
  };
  assert.equal(
    operationSavedResult(call('applyCbamOperationCandidates', payload))
      ?.dataVersion,
    3,
  );
});
test('rounded numeric IDs are rejected', () => {
  const value = receipt();
  assert.equal(
    operationSavedResult(
      call('cbam_operation_report_create', {
        businessResult: {
          ...value.businessResult,
          operationId: Number('9007199254740993'),
        },
      }),
    ),
    undefined,
  );
});
