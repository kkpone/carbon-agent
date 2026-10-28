/* eslint-disable @typescript-eslint/no-unused-vars */
import I18N from '@src/lang/I18N';
import VerifyUtils from '@src/utils/verifty';
import { Button } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import styles from './apply.module.scss';
import { OptionType, ItemType } from './applyjson';
import {
  apiQueryByPageType,
  apiAddProjectInspect,
  apiEditProjectInspect,
} from '../service';

const Apply = () => {
  const layoutDom: HTMLDivElement | any =
    document.querySelector('.layout__container');
  layoutDom && (layoutDom.style.height = 'calc(100% - 32px)');
  const [isEdit, setIsEdit] = useState(false);
  const history = useHistory();
  const projectId = new URLSearchParams(window.location.search).get('id');
  const local = JSON.parse(localStorage.getItem('initSelect') || '');
  const projectName = local.productName;
  const initSelect = local.list;

  const path = location.pathname;
  const [pageInfo, setPageInfo] = useState<any>({});
  const [pageType, setPageType] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const initPage = type => {
    apiQueryByPageType({ type }).then((res: any) => {
      // const sgs = [];
      // sgs['权威认证机构'] = [{ id: 1, flag: 'SGS', amount: 5000 }];
      const allData = { ...res.data.data };
      Object.keys(allData)?.forEach(key => {
        allData[key].forEach(item => {
          initSelect.forEach(ite => {
            if (item.classifyName === ite.key && item.flag === ite.value) {
              allData[key].curFlag = ite.value;
              allData[key].curAmount = item.amount;
            }
          });
        });

        allData[key].list = allData[key];
      });

      setTotalPrice(computPrice(allData));

      setPageInfo({ ...allData });
    });
  };
  const aroundUp = (num): number => {
    // const fixedTwo = Number(num).toFixed(2);
    const avgArr = num.toString().split('.');
    if (avgArr[1].length > 1) {
      let first = Number(avgArr[1].substring(0, 1)) + 1;

      if (first === 10) {
        first = Number(avgArr[0]) + 1;
      } else {
        first = Number(`${Number(avgArr[0])}.${first}`);
      }
      return Number(first);
    }
    return Number(`${avgArr[0]}.${avgArr[1]}`);
  };
  useEffect(() => {
    if (path.includes('Enterprise')) {
      initPage(0);
      setPageType('Enterprise');
    } else if (path.includes('Product')) {
      initPage(1);
      setPageType('Product');
    }
    if (path.includes('EditApply')) {
      setIsEdit(true);
    }
  }, []);
  const computPrice = (infoObj): number => {
    let total = 0;
    let addArr: string[] = [];
    if (path.includes('Enterprise')) {
      // 企业碳核查总价算法
      addArr = [
        I18N.Certification.industryType,
        I18N.Certification.numberOfEmployeesInTheEnterprise,
        I18N.Certification.onSiteInvestigationSurface,
        I18N.Certification.officeBuildingsAndFactories,
        I18N.Certification.greenhouseGasEmissions,
        I18N.Certification.usedByTheCompany,
      ];
    } else {
      // 产品碳核查总价算法
      addArr = [
        I18N.Certification.industryType,
        I18N.Certification.numberOfEmployeesInTheEnterprise,
        I18N.Certification.onSiteInvestigationSurface,
        I18N.Certification.typesOfRawMaterials,
        I18N.Certification.theHierarchyOfTraceability,
        I18N.Certification.productLifecycle,
      ];
    }
    let tmpAmount = 0;
    let purpose = 0;
    let method = 0;
    const organizationName = 5000;
    Object.keys(infoObj)?.forEach(key => {
      if (addArr.includes(key)) {
        tmpAmount += infoObj[key].curAmount;
      }
      if (key === I18N.Certification.scopeThreeIncludes) {
        method = infoObj[key].curAmount;
      }
      if (key === I18N.Certification.companysProducts) {
        method = infoObj[key].curAmount;
      }
      if (key === I18N.Certification.isItTheFirstTimeToVerify) {
        purpose = infoObj[key].curAmount;
      }
      // if (key === '权威认证机构') {
      //   organizationName = infoObj[key].curAmount;
      // }
    });

    if (
      infoObj[I18N.Certification.industryType].curFlag ===
      I18N.Certification.office
    ) {
      total = aroundUp((3 + method) * purpose) * organizationName;
    } else {
      total =
        aroundUp(
          (Number(((tmpAmount / 6) * 5).toFixed(2)) + method) * purpose,
        ) * organizationName;
    }

    return total;
  };
  const selectItem = (key, ite) => {
    pageInfo[key].curFlag = ite.flag;
    pageInfo[key].curAmount = ite.amount;
    setTotalPrice(computPrice(pageInfo));
    setPageInfo({ ...pageInfo });
  };
  const toApply = () => {
    const data: any = {};
    let userInfo = JSON.parse(
      JSON.stringify(localStorage.getItem('SET_COMPANY_USER_INFO')),
    );
    userInfo = JSON.parse(userInfo).userInfo;
    if (pageType === 'Enterprise') {
      // eslint-disable-next-line array-callback-return
      Object.keys(pageInfo).map(key => {
        switch (key) {
          case I18N.Certification.certificationBodies:
            data.organizationName = pageInfo[key].curFlag;
            break;
          case I18N.Certification.scopeThreeIncludes:
            data.method = pageInfo[key].curFlag;
            break;
          case I18N.Certification.officeBuildingsAndFactories:
            data.building = pageInfo[key].curFlag;
            break;
          case I18N.Certification.industryType:
            data.industryType = pageInfo[key].curFlag;
            break;
          case I18N.Certification.greenhouseGasEmissions:
            data.emission = pageInfo[key].curFlag;
            break;
          case I18N.Certification.onSiteInvestigationSurface:
            data.coveredArea = pageInfo[key].curFlag;
            break;
          case I18N.Certification.usedByTheCompany:
            data.cycleDate = pageInfo[key].curFlag;
            break;
          case I18N.Certification.numberOfEmployeesInTheEnterprise:
            data.employee = pageInfo[key].curFlag;
            break;
          case I18N.Certification.isItTheFirstTimeToVerify:
            data.purpose = pageInfo[key].curFlag;
            break;
          default:
            break;
        }
      });
    } else {
      // eslint-disable-next-line array-callback-return
      Object.keys(pageInfo).map(key => {
        switch (key) {
          case I18N.Certification.certificationBodies:
            data.organizationName = pageInfo[key].curFlag;
            break;
          case I18N.Certification.companysProducts:
            data.cycleDate = pageInfo[key].curFlag;
            break;
          case I18N.Certification.industryType:
            data.industryType = pageInfo[key].curFlag;
            break;
          case I18N.Certification.productLifecycle:
            data.method = pageInfo[key].curFlag;
            break;
          case I18N.Certification.onSiteInvestigationSurface:
            data.coveredArea = pageInfo[key].curFlag;
            break;
          case I18N.Certification.numberOfEmployeesInTheEnterprise:
            data.employee = pageInfo[key].curFlag;
            break;
          case I18N.Certification.isItTheFirstTimeToVerify:
            data.purpose = pageInfo[key].curFlag;
            break;
          case I18N.Certification.typesOfRawMaterials:
            data.emission = pageInfo[key].curFlag;
            break;
          case I18N.Certification.theHierarchyOfTraceability:
            data.building = pageInfo[key].curFlag;
            break;
          default:
            break;
        }
      });
    }

    // data.identifyServe = '?';
    // data.principal = '?';
    // data.responsibility = '?';
    // data.actualExpenses = '?';
    // data.operatingType = '?';
    // data.organizationId = '?';

    const time = `${moment(new Date()).format('YYYY.MM.DD-HH:mm:SS')}-`;

    data.expenses = totalPrice;
    data.status = 1;
    data.projectName = isEdit ? projectName : time + projectName;
    data.type = pageType === 'Enterprise' ? 0 : 1;
    data.userId = userInfo.userId;
    data.companyName = userInfo.companyName;
    data.userName = userInfo.username;
    data.identifyServe =
      pageType === 'Enterprise'
        ? I18N.Certification.enterpriseCarbonVerification2
        : I18N.Certification.carbonFootprintVerification3;
    data.operatingRecordList = [
      {
        userId: userInfo.userId,
        operating: 0,
        operatingType: 1,
        operatingFlag: I18N.carbonFootprint3.submitApplication,
        status: 1,
        type: pageType === 'Enterprise' ? 0 : 1,
        platform: 1,
        companyId: userInfo.companyId,
        userName: userInfo.username,
      },
    ];
    const api = isEdit ? apiEditProjectInspect : apiAddProjectInspect;
    if (isEdit) {
      data.projectId = projectId;
    }
    api(data).then(res => {
      VerifyUtils.Toast('success', I18N.carbonFootprint.operationSuccessful);
      // history.go(-1);
      history.push(
        pageType === 'Enterprise'
          ? '/Certification/Enterprise/product'
          : '/Certification/Product/product',
      );
    });
  };
  return (
    <div className={styles.applycon}>
      <section className={styles.applyBox}>
        <h2 className={styles.title}>
          {I18N.Certification.productSpecifications}
        </h2>
        {Object.keys(pageInfo)?.map((itemKey: string, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div className={styles.row} key={index}>
            <p className={styles.tit}>{itemKey}：</p>
            <div className={styles.listBox}>
              {pageInfo[itemKey].list?.map((ite: any) => (
                <div
                  className={
                    pageInfo[itemKey].curFlag === ite.flag
                      ? styles.active
                      : styles.itemBox
                  }
                  onClick={() => selectItem(itemKey, ite)}
                  key={ite.id}
                >
                  {ite.flag}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
      <div className={styles.priceBox}>
        <div className={styles.price}>
          <span>{I18N.Certification.estimatedCost}</span>
          <span>¥ {totalPrice.toFixed(2)}</span>
        </div>
        <div
          className={styles.btnBox}
          onClick={() => {
            toApply();
          }}
        >
          {I18N.Certification.applyNow}
        </div>
      </div>
    </div>
  );
};
export default Apply;
