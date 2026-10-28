import { TableTransferApp } from '@src/components/TableTransfer';
import I18N from '@src/lang/I18N';
import { Button } from 'antd';

import styles from './index.module.less';
import {
  getSourceUnselectedList,
  getSourceChooseList,
  saveSelectSource,
} from '../../service';

export const tableBottom =
  (refreshFun: () => void) =>
  (item: {
    modelId: string;
    ghgClassify: string;
    id: string;
    ghgCategoryName: string;
    name: string;
  }) => {
    const { modelId, ghgClassify } = item;
    return (
      <div className={styles.wrapper}>
        <TableTransferApp
          getSourceUnselectedList={params =>
            getSourceUnselectedList({
              ...params,
              modelId,
              ghgClassify,
            })
          }
          getSourceChooseList={async () => {
            const data = await getSourceChooseList({
              modelId,
              ghgClassify,
            });
            return data.data.data.map(chooseItem => ({
              ...chooseItem,
              id: chooseItem.sourceCategoryMiddleId,
            }));
          }}
          saveSelectSource={async params => {
            await saveSelectSource({
              modelId: Number(modelId),
              addList: params.dictSourceList.map(source => ({
                dictSourceId: source.id,
              })),
              deleteList: params.deleteSourceList.map(deleteItem => ({
                sourceCategoryMiddleId: deleteItem.id,
              })),
            });
          }}
          stringTitle={`${item.ghgCategoryName}/${item.name}`}
          {...item}
          addSuccess={() => refreshFun()}
        >
          <Button type='link'>
            <span>
              {I18N.enterpriseCarbonAccount2.fromEmissionSourceRepository}
            </span>
          </Button>
        </TableTransferApp>
      </div>
    );
  };
