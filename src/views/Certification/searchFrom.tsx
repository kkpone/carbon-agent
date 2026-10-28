import I18N from '@src/lang/I18N';
import { Button, Form } from 'antd';
import IconFont from '@src/components/iconfont';
import { SaerchFrom } from './indexjson';
import style from './Enterprise/index.module.scss';

interface Props {
  searchFrom: SaerchFrom[];
  handlefinlist: (e) => void;
}
const CertificationSearchForm = (Props: Props) => {
  const { searchFrom, handlefinlist } = Props;
  const [form] = Form.useForm();
  return (
    <Form
      form={form}
      className={style.searchFormlist}
      onFinish={e => handlefinlist(e)}
    >
      {searchFrom.map((item: SaerchFrom) => (
        <div className={style.chanageitem}>
          <Form.Item name={item.name} label={item.label}>
            {item.hml}
          </Form.Item>
          {item.label === I18N.carbonFootprint.state ? (
            <span className={style.flexsub}>
              <Button
                htmlType='submit'
                className={style.btn_style}
                icon={<IconFont type='icon-icon-xiaosuo' />}
              >
                {I18N.carbonNeutral.query}
              </Button>
              <Button
                htmlType='reset'
                className={style.btn_style}
                onClick={() => handlefinlist({})}
              >
                {I18N.carbonFootprint3.reset}
              </Button>
            </span>
          ) : (
            ''
          )}
        </div>
      ))}
    </Form>
  );
};
export default CertificationSearchForm;
