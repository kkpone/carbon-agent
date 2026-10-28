import I18N from '@src/lang/I18N';
import { PlusOutlined } from '@ant-design/icons';
import Permission from '@components/Permission';
import style from '@src/styles/global.module.scss';
import { ApiQueryActivityTimesDataType } from '@src/views/emission/organization/service';
import { Row, Col, Button } from 'antd';
import classnames from 'classnames';
import { FunctionComponent } from 'react';

interface TableTitleProps {
  title: string;
  addNewTitle?: string;
  onClickFn?: () => void;
  flag?: string;
  queryDegreeData?: ApiQueryActivityTimesDataType;
}

const TableTitle: FunctionComponent<TableTitleProps> = props => (
  <Row justify='space-between' align='middle' style={{ marginBottom: '14px' }}>
    <Col>
      <Button
        type='text'
        className={style.tableText}
        style={{ paddingLeft: '0' }}
      >
        {`${props.title}`}
      </Button>
    </Col>
    <Col
      className={classnames(
        style.textRight,
        style.text16,
        style.PingFangSCRegular,
        style.cursorPoint,
      )}
    >
      {props.flag && (
        <Permission flag={props.flag}>
          <Button
            type='primary'
            onClick={() => {
              if (props.onClickFn) {
                props.onClickFn();
              }
            }}
            icon={<PlusOutlined />}
          >
            {I18N.template(I18N.components.addPro, { val1: props.addNewTitle || props.title })}
          </Button>
        </Permission>
      )}
    </Col>
    {props.queryDegreeData &&
      Number(props.queryDegreeData.countsType) === 2 && (
        <Col style={{ paddingRight: '26px' }}>
          {I18N.components.remainingQueryTimes}{props.queryDegreeData.queryDegree}
        </Col>
      )}
  </Row>
);

export default TableTitle;
