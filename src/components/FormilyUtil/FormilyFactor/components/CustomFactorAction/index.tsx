import { DownOutlined } from '@ant-design/icons';
import { IconAlibaba } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { Button, Dropdown } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { selectSavedFactorScope } from '../../customFactorReuse/scope';

import type {
  SavedCustomFactor,
  SavedFactorService,
} from '../../customFactorReuse/types';
import SavedFactorPicker from '../SavedFactorPicker';
import styles from './index.module.less';

type Props = {
  hasFactor: boolean;
  service: SavedFactorService;
  onEdit: () => void;
  onSelect: (record: SavedCustomFactor) => void;
};

export default function CustomFactorAction({
  hasFactor,
  service,
  onEdit,
  onSelect,
}: Props) {
  const scope = useSelector(selectSavedFactorScope);
  const [pickerScope, setPickerScope] = useState<string>();
  const text = I18N.customFactorReuse;

  useEffect(() => {
    setPickerScope(undefined);
  }, [scope]);

  return (
    <>
      <Dropdown
        trigger={['click']}
        placement='bottomLeft'
        overlayClassName={styles.menu}
        openClassName={styles.open}
        menu={{
          items: [
            { key: 'edit', label: hasFactor ? text.edit : text.add },
            { key: 'select', label: text.chooseSaved },
          ],
          onClick: ({ key }) => {
            if (key === 'edit') onEdit();
            if (key === 'select') setPickerScope(scope);
          },
        }}
      >
        <Button
          type='link'
          className={styles.trigger}
          icon={<IconAlibaba type='icon-icon_sdtx' className='m-r-6' />}
        >
          {text.customFactor}
          <DownOutlined className={styles.arrow} />
        </Button>
      </Dropdown>
      {pickerScope === scope && (
        <SavedFactorPicker
          service={service}
          onClose={() => setPickerScope(undefined)}
          onSelect={record => {
            onSelect(record);
            setPickerScope(undefined);
          }}
        />
      )}
    </>
  );
}
