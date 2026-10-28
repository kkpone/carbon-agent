import I18N from '@src/lang/I18N';
import { IconAlibaba } from '@src/components/iconfont';
import { PageInfoType } from '@src/router/type';
import { Toast } from '@src/utils/Toast';
import { Spin, Tooltip } from 'antd';
import copyToClipboard from 'copy-to-clipboard';
import { useEffect, useState } from 'react';

import company from './assets/company.svg';
import copy from './assets/copy.svg';
import { CompanyInfo } from './components/CompanyInfo';
import { InfoForm } from './components/InfoForm';
import { useOrgTreeData } from './components/hooks';
import { Introduction } from './components/introduction';
import { OrganizationTree } from './components/organizationTree';
import styles from './index.module.less';
import { OrgInfo, OrgType } from './services';

export const Organization = () => {
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [selectedNode, setSelectedNode] = useState<
    | { orgCode: string; name: string; orgType: OrgType; code: number }
    | undefined
  >(undefined);

  const [treeData, refresh, loading] = useOrgTreeData();
  const onCopy = () => {
    const copySuccess = copyToClipboard(selectedNode?.orgCode!);
    if (copySuccess) {
      Toast('success', I18N.carbonFootprint3.copySuccessful);
    } else {
      Toast('error', I18N.dashborad.copyFailed);
    }
  };
  // tranData 更新是需要更新 selectedNode
  useEffect(() => {
    function depthGetSelectedNodeInfo(
      transTreeData: OrgInfo[],
      transSelectedKeys: React.Key[],
    ) {
      let selectedNodeInfo: any;
      transTreeData.forEach(item => {
        if (item.code === transSelectedKeys[0]) {
          selectedNodeInfo = item;
        } else if (item.children.length > 0) {
          const result = depthGetSelectedNodeInfo(
            item.children,
            transSelectedKeys,
          );
          if (result) {
            selectedNodeInfo = result;
          }
        }
      });
      return selectedNodeInfo;
    }
    const node = depthGetSelectedNodeInfo(treeData, selectedKeys);
    if (selectedKeys) {
      setSelectedNode(node);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeData]);
  return (
    <div className={styles.wrapper}>
      <div className={styles.treeWrapper}>
        <Spin spinning={loading}>
          <OrganizationTree
            treeData={treeData}
            refresh={() => {
              refresh();
            }}
            selectedKeys={selectedKeys}
            onSelect={(keys, info: { selected: boolean; node: any }) => {
              if (info.selected) {
                setSelectedNode(info.node);
              } else {
                setSelectedNode(undefined);
              }
              setSelectedKeys(keys);
            }}
          />
        </Spin>
      </div>
      <div className={styles.contentWrapper}>
        {!selectedNode && <Introduction />}
        {selectedNode && selectedNode?.orgType !== OrgType.company && (
          <>
            <div className={styles.inoTitleWrapper}>
              <div>
                <IconAlibaba
                  className={styles.img}
                  type={
                    selectedNode.orgType === OrgType.accounting
                      ? 'icon-icon_hesuanzhuti'
                      : 'icon-icon_hesuanfenzu'
                  }
                />
              </div>
              <div className={styles.infoTitle}>
                <div className={styles.title}>{selectedNode.name}</div>
                <div className={styles.orgCode}>
                  {I18N.dashborad.organizationNumber}{selectedNode.orgCode}
                  <Tooltip overlay={I18N.carbonFootprint.copy} placement='top'>
                    <div
                      className={styles.copyWrapper}
                      onClick={() => onCopy()}
                    >
                      <img src={copy} alt='' className={styles.copy} />
                    </div>
                  </Tooltip>
                </div>
              </div>
            </div>
            <InfoForm
              refresh={refresh}
              pageType={PageInfoType.edit}
              orgId={selectedNode?.code?.toString()}
              orgType={selectedNode?.orgType}
            />
          </>
        )}
        <div>
          {selectedNode?.orgType === OrgType.company && (
            <>
              <div className={styles.inoTitleWrapper}>
                <div>
                  <img src={company} alt='' className={styles.companyImg} />
                </div>
                <div className={styles.infoTitle}>
                  <div className={styles.title}>{selectedNode.name}</div>
                  <div className={styles.orgCode}>
                    {I18N.dashborad.organizationNumber}{selectedNode.orgCode}
                    <Tooltip overlay={I18N.carbonFootprint.copy} placement='top'>
                      <div
                        className={styles.copyWrapper}
                        onClick={() => onCopy()}
                      >
                        <img src={copy} alt='' className={styles.copy} />
                      </div>
                    </Tooltip>
                  </div>
                </div>
              </div>
              <CompanyInfo refresh={refresh} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Organization;
