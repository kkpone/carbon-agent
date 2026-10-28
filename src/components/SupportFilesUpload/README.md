# 组件 (点击选择文件弹窗的打开后调用接口，无二次确认)
`RecordType` 接受一个泛型参数，表示文件的类型(需要白包含name、url、uid类型).


Props [如下](./index.tsx)：

- buttonType 上传按钮的类型，对应antd Button的type枚举值(https://ant-design.antgroup.com/components/button-cn#api)
- maxSize 上传允许的最大值(传入的值需要 * 1024的)
- errorTipsForSize 上传的文件超过允许上传的最大值的提示
- maxCount 允许上传的最大值
- multiple 上传时是否允许多选
- fileList 已经上传的文件列表
- onChange 点击选择文件弹窗的打开后的方法
  

基础使用方式可以参考（注意onchange方法里面的逻辑处理）
- 允许多选[行业版企业碳核算-填报-支撑材料类型](/src/views/industryCarbonAccounting/components/SupportFiles/columns.tsx)
  
- 不允许多选[产品碳足迹LCA-过程管理-支撑材料](/src/views/carbonFootPrintLCA/components/SupportFiles/index.tsx)