import { Button } from 'antd';
import { FormConsumer } from '@formily/react';
import I18N from '@/lang/I18N';
import { MODEL_EMISSION_MATCH_WAY } from '../../BusinessAccountingModel/constant';
import { QUICK_ACCOUNT_EMISSION } from '../../constant';

export const EmissionDescriptionMatch = ({
  loading,
  disabled,
  onMatch,
  buttonOnly = false,
}: {
  loading?: boolean;
  disabled?: boolean;
  onMatch: () => void;
  buttonOnly?: boolean;
}) => (
  <>
    {!buttonOnly && <div>{I18N.ilcd.emissionDescriptionMatchHint}</div>}
    <Button loading={loading} disabled={disabled} onClick={onMatch}>
      {I18N.ilcd.emissionDescriptionMatchLabel}
    </Button>
  </>
);

/** 主排放源沿用已有只读、匹配方式和运输分支的操作边界。 */
export const EmissionDescriptionMatchControls = ({
  readPretty,
  onlyCreateFactor,
  loading,
  onMatch,
  buttonOnly = false,
}: {
  readPretty?: boolean;
  onlyCreateFactor?: boolean;
  loading?: boolean;
  onMatch: () => void;
  buttonOnly?: boolean;
}) => (
  <FormConsumer>
    {form =>
      !readPretty &&
      !onlyCreateFactor &&
      form.values.type !== QUICK_ACCOUNT_EMISSION.TRANS &&
      Number(form.values.matchWay) === MODEL_EMISSION_MATCH_WAY.FACTOR &&
      Number(form.values.factorObj?.matchWay) !==
        MODEL_EMISSION_MATCH_WAY.FACTOR_CREATE ? (
        <EmissionDescriptionMatch
          buttonOnly={buttonOnly}
          loading={loading}
          disabled={!form.values.name}
          onMatch={onMatch}
        />
      ) : null
    }
  </FormConsumer>
);
