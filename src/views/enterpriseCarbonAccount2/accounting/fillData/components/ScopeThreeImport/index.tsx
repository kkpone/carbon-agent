import I18N from '@src/lang/I18N';
import { Dropdown } from 'antd';
import { FC } from 'react';

import { IconAlibabaNew } from '@/components/iconfont';

import styles from './index.module.less';
import CommuteImport from '../CommuteImport';
import TravelImport from '../TravelImport';

const ScopeThreeImport: FC<{
  computationId: string;
  computationPeriod?: string;
  onImportSuccess: () => void;
}> = ({ computationId, computationPeriod, onImportSuccess }) => (
  <div
    onClick={e => {
      e.stopPropagation();
    }}
  >
    <Dropdown
      trigger={['click']}
      placement='bottomRight'
      menu={{
        items: [
          {
            key: 'travel',
            label: (
              <TravelImport
                computationId={computationId}
                computationPeriod={computationPeriod}
                onImportSuccess={onImportSuccess}
              >
                <div>{I18N.enterpriseCarbonAccount2.numberOfBusinessTrips}</div>
              </TravelImport>
            ),
          },
          {
            key: 'commute',
            label: (
              <CommuteImport
                computationId={computationId}
                computationPeriod={computationPeriod}
                onImportSuccess={onImportSuccess}
              >
                <div>
                  {I18N.enterpriseCarbonAccount2.numberOfEmployeesCommuting}
                </div>
              </CommuteImport>
            ),
          },
        ],
      }}
    >
      <div>
        <div className={styles.importBtn}>
          <IconAlibabaNew type='icon-shujudaochu' />
          <div>{I18N.enterpriseCarbonAccount2.dataImport}</div>
        </div>
      </div>
    </Dropdown>
  </div>
);

export default ScopeThreeImport;
