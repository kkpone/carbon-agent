import {
  ArrayCollapse,
  Cascader,
  DatePicker,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  NumberPicker,
  Radio,
  Select,
} from '@formily/antd-v5';
import { createSchemaField } from '@formily/react';

import FormilyButtonSelect from '@/components/FormilyUtil/FormilyButtonSelect';
import FormilyFactor from '@/components/FormilyUtil/FormilyFactor';
import { CustomHeaderIndex } from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/components/CustomHeader';
import { ArrayRemove } from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/components/Remove';
import { TransportMileageInput } from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/components/TransportMileageInput';

import FormilyFileUpload from '../FormilyFileUpload';
import CarbonFootprint3UploadFile from '../uploadFile';

export const SchemaField = createSchemaField({
  components: {
    FormItem,
    FormGrid,
    FormLayout,
    Input,
    Select,
    Radio,
    Cascader,
    FormilyButtonSelect,
    DatePicker,
    CarbonFootprint3UploadFile,
    FormilyFileUpload,
    FormilyFactor,
    ArrayCollapse,
    CustomHeaderIndex,
    NumberPicker,
    ArrayRemove,
    TransportMileageInput,
  },
});
