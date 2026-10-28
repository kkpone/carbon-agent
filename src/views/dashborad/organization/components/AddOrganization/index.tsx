import I18N from '@src/lang/I18N';
import { PageInfoType } from '@src/router/type';
import { FC, PropsWithChildren, useState } from 'react';

import { CustomDrawer } from '@/components/CustomDrawer';

import { OrgInfo, OrgType } from '../../services';
import { InfoForm } from '../InfoForm';

interface AddOrganizationProps {
  treeData: OrgInfo[];
  orgType: OrgType;
  initPid?: number;
  refresh: () => void;
  initOrgIndustry?: string;
}

const titleMap = {
  [OrgType.accounting]: I18N.dashborad.accountingEntity,
  [OrgType.group]: I18N.dashborad.grouping,
};

export const AddOrganization: FC<
  PropsWithChildren<AddOrganizationProps>
> = props => {
  const { children, ...otherProps } = props;
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <CustomDrawer
        width={708}
        open={visible}
        onClose={() => setVisible(false)}
        destroyOnClose
        title={`${I18N.carbonFootprint.newAddition}${
          titleMap[otherProps.orgType]
        }`}
      >
        <InfoForm
          pageType={PageInfoType.add}
          {...otherProps}
          onHide={() => setVisible(false)}
        />
      </CustomDrawer>
      <div onClick={() => setVisible(true)}>{children}</div>
    </div>
  );
};
