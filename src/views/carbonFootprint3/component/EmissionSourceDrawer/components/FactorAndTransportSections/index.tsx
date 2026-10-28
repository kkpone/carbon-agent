import useFieldSetValueByLabel from '@src/hooks/useFieldSetValueByLabel';
import useFieldUnitDictSource from '@src/hooks/useFieldUnitDictSource';
import I18N from '@src/lang/I18N';
import { Spin } from 'antd';
import classNames from 'classnames';

import {
  AdditionalFormItemMaps,
  genEmissionFileSchema,
  getNewEmissionFactorSchema,
  transportSchema,
  useFactorObjReaction,
  useFactorObjUnitStringReaction,
  useFieldDataSourceReaction,
  useNeedTransportReaction,
  useUnitDataSourceReaction,
} from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/transportSchema';

import { SchemaField } from '../../schemaField';
import type { EmissionSourceDrawerProps } from '../../type';
import { TransportReuseRuntime } from '../TransportReuseRuntime';

import styles from './index.module.less';

type FactorAndTransportSectionsProps = Pick<
  EmissionSourceDrawerProps,
  | 'accountId'
  | 'apiExtraParams'
  | 'emissionAiFlag'
  | 'emissionSourceId'
  | 'enableFactorSourceRange'
  | 'factorPrefId'
  | 'onlyCreateFactor'
  | 'onTransportReuseSuccess'
  | 'visible'
> & {
  autoMatchFactorLoading: boolean;
  effectiveReadPretty: boolean;
  onBasicNameChange: () => void | Promise<void>;
  productWeightDecimalPlace: number;
  showFactorEvaluationCard: boolean;
  transportReuseEnabled: boolean;
  useModelEmissionApi: boolean;
};

export const FactorAndTransportSections = ({
  accountId,
  apiExtraParams,
  autoMatchFactorLoading,
  effectiveReadPretty,
  emissionAiFlag,
  emissionSourceId,
  enableFactorSourceRange,
  factorPrefId,
  onBasicNameChange,
  onlyCreateFactor,
  onTransportReuseSuccess,
  productWeightDecimalPlace,
  showFactorEvaluationCard,
  transportReuseEnabled,
  useModelEmissionApi,
  visible,
}: FactorAndTransportSectionsProps) => (
  <>
    <Spin spinning={autoMatchFactorLoading}>
      <SchemaField
        schema={getNewEmissionFactorSchema(
          undefined,
          undefined,
          onBasicNameChange,
          onlyCreateFactor,
          useModelEmissionApi,
          showFactorEvaluationCard,
          enableFactorSourceRange,
          factorPrefId,
        )}
        scope={{ AdditionalFormItemMaps }}
      />
    </Spin>

    <div className={classNames(styles.titleContainer, 'm-t-16')}>
      <div className={styles.title}>
        {I18N.carbonFootprint3.supportingMaterials}
      </div>
    </div>
    <div className={styles.fileContainer}>
      <SchemaField schema={genEmissionFileSchema(effectiveReadPretty)} />
    </div>
    <div className={classNames(styles.titleContainer, styles.transTitle)}>
      <div className={styles.title}>
        {I18N.carbonFootprint3.transportationInformation}
      </div>
    </div>
    <div className={styles.collWrapper}>
      <TransportReuseRuntime
        accountId={accountId}
        apiExtraParams={apiExtraParams}
        emissionAiFlag={emissionAiFlag}
        emissionSourceId={emissionSourceId}
        enabled={transportReuseEnabled}
        visible={visible}
        onApplied={() => onTransportReuseSuccess?.()}
      >
        <SchemaField
          schema={transportSchema({
            onlyCreateFactor,
            showFactorEvaluationCard,
            enableFactorSourceRange,
            enableTransportReuse: transportReuseEnabled,
            factorPrefId,
            productWeightDecimalPlace,
          })}
          scope={{
            useNeedTransportReaction,
            AdditionalFormItemMaps,
            useFieldUnitDictSource,
            useFieldSetValueByLabel,
            useFactorObjReaction,
            useFieldDataSourceReaction,
            useFactorObjUnitStringReaction,
            useUnitDataSourceReaction,
          }}
        />
      </TransportReuseRuntime>
    </div>
  </>
);
