import { TableTransferApp } from '@src/components/TableTransfer';
import I18N from '@src/lang/I18N';
import { PageInfoType } from '@src/router/type';
import { Button } from 'antd';

import styles from './index.module.less';
import {
  getSourceChooseList,
  getSourceUnselectedList,
  saveSelectSource,
} from '../../service';
import { AddSource } from '../addSource';

export const tableBottom =
  (refreshFun: () => void, updateComputationInfo: () => void) =>
  (item: {
    computationId: string;
    computationPeriod?: string;
    ghgClassify: string;
    ghgCategory: string;
    id: string;
    ghgCategoryName: string;
    name: string;
    isoClassify: string;
  }) => {
    const {
      computationId,
      computationPeriod,
      ghgClassify,
      ghgCategoryName,
      name,
      id,
      ghgCategory,
      isoClassify,
    } = item;

    return (
      <div className={styles.wrapper}>
        <TableTransferApp
          key={ghgCategory}
          getSourceChooseList={async () => {
            const data = await getSourceChooseList({
              computationId,
              ghgClassify,
              isoClassify,
              computationPeriod,
            });
            return data.data.data;
          }}
          getSourceUnselectedList={params =>
            getSourceUnselectedList({
              ...params,
              computationId,
              computationPeriod,
              ghgClassify,
              isoClassify,
            })
          }
          stringTitle={`${ghgCategoryName}/${name}`}
          saveSelectSource={async params => {
            await saveSelectSource({
              ...params,
              computationId: Number(computationId),
              computationPeriod,
            });
          }}
          {...item}
          addSuccess={() => {
            refreshFun();
            updateComputationInfo();
          }}
        >
          <Button type='link'>
            {/* <IconAlibaba type='icon-icon_choose' /> */}
            <span>{I18N.carbonFootprint3.selectingEmissionSources}</span>
          </Button>
        </TableTransferApp>

        <AddSource
          title={I18N.carbonFootprint.newEmissionSourcesAdded}
          id={id}
          computationId={computationId}
          computationPeriod={computationPeriod}
          addSuccess={() => {
            refreshFun();
            updateComputationInfo();
          }}
          initGhgClassify={ghgClassify}
          initGhgCategory={ghgCategory}
          pageInfoType={PageInfoType.add}
        >
          <Button type='link'>{I18N.carbonFootprint.newAddition}</Button>
        </AddSource>
      </div>
    );
  };
