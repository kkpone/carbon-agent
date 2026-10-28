import AiIconImg from '@assets/svg/ai_green.svg';
import AiSvg from '@src/assets/icon/esg/ai.svg';
import upArrowSvg from '@src/assets/icon/esg/upArrow.svg';
import I18N from '@src/lang/I18N';
import { Button, Input, Modal, Select } from 'antd';
import moment from 'moment';
import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { RouteMaps } from '@/router/route-paths';
import { RootState } from '@/store';
import { getYear, Toast } from '@/utils';

import styles from './index.module.less';
import { checkCompanyTopics } from './service';

type AddAnalysisModalProps = {
  open: boolean;
  onCancel: () => void;
};

const AddAnalysisModal: FC<AddAnalysisModalProps> = ({ open, onCancel }) => {
  const [companyName, setCompanyName] = useState('');

  const [year, setYear] = useState(Number(moment().format('YYYY')));

  const [query, setQuery] = useState('');

  const [loading, setLoading] = useState(false);

  const { userInfo } = useSelector<RootState, RootState['companyUserInfo']>(
    state => state.companyUserInfo,
  );

  const userCompanyName = userInfo?.companyName || '';

  const history = useHistory();

  const submit = async () => {
    try {
      setLoading(true);
      if (!companyName.trim()) {
        Toast('warn', I18N.esg.pleaseEnterTheCompany);
        return;
      }
      const { data } = await checkCompanyTopics();

      if (!data.data) {
        Toast('warn', I18N.esg.thisOrganizationIsCurrentlyUnavailable);
        return;
      }
      history.push(
        `${RouteMaps.ESGImportanceAnalysisAdd}?companyName=${companyName}&year=${year}&query=${query}`,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && userCompanyName) {
      setCompanyName(userCompanyName);
    }
  }, [open, userCompanyName]);

  return (
    <Modal
      width={720}
      open={open}
      title={
        <>
          <span className={styles.modalTitleText}>
            {I18N.carbonFootprint3.apply}
          </span>
          <img className={styles.aiIcon} alt='' src={AiIconImg} />
          <span className={styles.modalTitleText}>
            {I18N.esg.quicklyCreateDuplicates}
          </span>
        </>
      }
      footer={null}
      onCancel={onCancel}
      onClose={onCancel}
    >
      <div className={styles.content}>
        <div className={styles.basicInfo}>
          <img className={styles.aiSvg} alt='' src={AiSvg} />
          <span>{I18N.esg.for}</span>
          <div className={styles.infoWrapper}>
            <Input
              className={styles.companyNameInput}
              value={companyName}
              variant='borderless'
              placeholder={I18N.cbam.corporateName}
              maxLength={20}
              onChange={e => setCompanyName(e.target.value)}
            />
          </div>
          <span>{I18N.esg.generateACopy}</span>
          <div className={styles.infoWrapper}>
            <Select
              value={year}
              variant='borderless'
              popupMatchSelectWidth={false}
              suffixIcon={null}
              options={getYear().map(yearVal => ({
                value: yearVal,
                label: yearVal.toString(),
              }))}
              onChange={setYear}
            />
          </div>
          <span>{I18N.esg.esgIsImportant}</span>
        </div>
        <Input.TextArea
          className={styles.descInput}
          variant='borderless'
          value={query}
          placeholder={I18N.esg.pleaseInputAnalysis}
          maxLength={200}
          onChange={e => setQuery(e.target.value)}
        />
        <div className={styles.contentFooter}>
          <Button
            className={styles.submitButton}
            type='primary'
            loading={loading}
            icon={<img alt='' src={upArrowSvg} />}
            onClick={submit}
          />
        </div>
      </div>
    </Modal>
  );
};

export default AddAnalysisModal;
