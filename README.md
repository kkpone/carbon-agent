# 新碳迹云

## 账号
前台sass登陆账号：15535432982
前台sass登陆密码：123456
新版运营后台登陆账号：admin
新版运营后台登陆密码：Carbon123
## 项目地址1
### 正式

碳云SAAS：saas.carbonstop.net
碳阻迹运营平台：boss.carbonstop.net

### tag

tag-release-20220125(日期)-v1.1.1(项目版本号)-01(当日发版次数)
tag-release-20220125-v0.12.0-01
上传代码：
  1.git tag -a tag-release-日期-v0.13.6-01 -m '描述'
  2.git push --tags
项目整体架构
```js
├── README.md
├── build   // 打包后的文件 
├── src   // 主要编辑的文件
|  ├── App.module.css  
|  ├── App.test.tsx 
|  ├── App.tsx  // 后台页登陆后页面的嵌套
|  ├── AppState.tsx 
|  ├── assets   // 项目的静态文件
|  ├── typings // 声明的类型文件
|  ├── http   // 接口请求的封装 API这里
|  ├── store //  Redux
|  ├── router  //  项目路由文件
|  ├── layout   // 登陆页面的整体样式
|  ├── components // 页面整体组件
|  ├── assets // 静态资源
|  ├── route  // 路由导航文件
|  ├── views // 页面目录 
|  ├── api // http 初始化 
|  └── utils // 项目的工具文件
├── tsconfig.json
└── yarn.lock
```

page 页面结构

```js
├── system //登陆页面
|  └── account // 账户
    └── index.tsx //  react 文件
    └── style.module.scss //  样式文件
    └── type.ts //  类型文件
    └── sever.ts //  请求api 文件
    └── argument // 协议
    └── login // 登陆页面
├── dashborad //概述页面
|  └── department // 部门
   └── intro // 首页
   └── organization // 组织  
   └── orgstaff // 员工   
   └── role // 角色

├── product-list === 产品碳足迹
    └──production ==产品模型
├── notOrder// 没有订阅页面
├── error// 错误页面
notOrder
```
## Redux 使用
 进入Redux 

````js
import { setUserInfo, UserState } from '../../store/module/user';
````
````js
export default connect(
  ({ user: { avatar, account } }: IStoreState) => ({ avatar, account }),
  {
    clearSideBarRoutes,
    setUserInfo,
  },
)(memo(AvatarDropdown));
````
使用
````js
  props.setUserInfo({
            token: '',
            account: '',
            avatar: '',
            mobile: '',
            id: 0,
            role: 0,
          });
````
store 定义
````js
export const setUserInfo: (user: UserState) => IAction<UserState> = (
  user: UserState,
) => ({
  type: git
  ,
  payload: user,
});
````
### Redux的数据 介绍
````
currentIndex：表示当前栏目点击第几个产品
      使用地方：左侧导航的权限可能会用到
````
### java 后端 状态码
````js
package com.carbonstop.common.core.constant;

/**
 * 返回状态码
 * 
 * @author zzh
 */
public class HttpStatus
{
    /**
     * 操作成功
     */
    public static final int SUCCESS = 200;

    /**
     * 对象创建成功
     */
    public static final int CREATED = 201;

    /**
     * 请求已经被接受
     */
    public static final int ACCEPTED = 202;

    /**
     * 操作已经执行成功，但是没有返回数据
     */
    public static final int NO_CONTENT = 204;

    /**
     * 资源已被移除
     */
    public static final int MOVED_PERM = 301;

    /**
     * 重定向
     */
    public static final int SEE_OTHER = 303;

    /**
     * 资源没有被修改
     */
    public static final int NOT_MODIFIED = 304;

    /**
     * 参数列表错误（缺少，格式不匹配）
     */
    public static final int BAD_REQUEST = 400;

    /**
     * 未授权
     */
    public static final int UNAUTHORIZED = 401;

    /**
     * 访问受限，授权过期
     */
    public static final int FORBIDDEN = 403;

    /**
     * 资源，服务未找到
     */
    public static final int NOT_FOUND = 404;

    /**
     * 不允许的http方法
     */
    public static final int BAD_METHOD = 405;

    /**
     * 资源冲突，或者资源被锁
     */
    public static final int CONFLICT = 409;

    /**
     * 不支持的数据，媒体类型
     */
    public static final int UNSUPPORTED_TYPE = 415;

    /**
     * 系统内部错误
     */
    public static final int ERROR = 500;

    /**
     * 接口未实现
     */
    public static final int NOT_IMPLEMENTED = 501;
}
````

## 导航配置

文件路径 src/components/LayoutHeader/index.tsx LayoutNavBar

## 接口
````
目前是无token的测试，正式的使用，端口号可以统一为8080.就没有9200和9201的区分了.
9200/token 换成 8880/token
/ 9201/ 换成 8880/management/
/9300/ 换成 8880/file
````
### 备份开发环境 用到的环境变量
````
REACT_APP_API_URL=http://192.168.1.70:9201
REACT_APP_API_URL_NO=http://192.168.1.70:9200
REACT_APP_API_URL_PYTHON=http://192.168.1.67:8000
REACT_APP_API_URL_FILE=http://192.168.1.70:9300
GENERATE_SOURCEMAP=false
````

===========================================================项目开发日期

### 12月10 项目 初始上线
    实现功能：基础模块 产品和导航权限功能齐全

测试地址
http://new-carbon-cloud-basic-admin.carboncloud.com/ 碳云SAAS测试环境 
http://carbon-trace-cloud-admin-base-admin.carboncloud.com/ 运营平台测试环境 

减租碳核算 相关字段
```java
/*
SQLyog Ultimate v12.09 (64 bit)
MySQL - 5.7.36 : Database - carbonstop_architecture_computation
*********************************************************************
*/


/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`carbonstop_architecture_computation` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `carbonstop_architecture_computation`;

/*Table structure for table `architecture` */

DROP TABLE IF EXISTS `architecture`;

CREATE TABLE `architecture` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '建筑主键id',
  `company_id` bigint(20) NOT NULL DEFAULT '0' COMMENT '组织id',
  `name` varchar(64) NOT NULL DEFAULT '' COMMENT '项目名称',
  `place` varchar(64) NOT NULL DEFAULT '' COMMENT '项目所在地',
  `predict_time` date NOT NULL DEFAULT '2023-01-01' COMMENT '预计建设时间',
  `architecture_type` varchar(32) NOT NULL DEFAULT '' COMMENT '建筑类型',
  `structure_type` varchar(32) NOT NULL DEFAULT '' COMMENT '结构类型',
  `use_age` varchar(32) NOT NULL DEFAULT '' COMMENT '使用年限',
  `architecture_area` varchar(32) NOT NULL DEFAULT '' COMMENT '建筑面积',
  `afforest_area` varchar(32) DEFAULT NULL COMMENT '绿化面积',
  `design_stage` varchar(64) DEFAULT NULL COMMENT '设计阶段',
  `tier_num` int(11) NOT NULL DEFAULT '0' COMMENT '建筑层数',
  `create_way` tinyint(2) NOT NULL DEFAULT '0' COMMENT '0手动创建/1复制',
  `deleted` tinyint(3) NOT NULL DEFAULT '0' COMMENT '删除标记 0 未删除/1 已删除',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` varchar(64) NOT NULL DEFAULT '' COMMENT '创建者',
  `update_by` varchar(64) NOT NULL DEFAULT '' COMMENT '更新者',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8 COMMENT='建筑表';

/*Table structure for table `computation` */

DROP TABLE IF EXISTS `computation`;

CREATE TABLE `computation` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `architectur_id` bigint(20) NOT NULL DEFAULT '0' COMMENT '建筑id',
  `carbon_total` double(20,2) NOT NULL DEFAULT '0.00' COMMENT '总排放量',
  `intension` double(20,2) NOT NULL DEFAULT '0.00' COMMENT '总排放强度',
  `create_way` tinyint(2) NOT NULL DEFAULT '0' COMMENT '0手动创建/1复制',
  `deleted` tinyint(2) NOT NULL DEFAULT '0' COMMENT '0未删除/1已删除',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '修改时间',
  `create_by` bigint(20) NOT NULL DEFAULT '0' COMMENT '创建者',
  `updatet_by` bigint(20) NOT NULL DEFAULT '0' COMMENT '修改者',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='建筑核算表';

/*Table structure for table `computation_detail` */

DROP TABLE IF EXISTS `computation_detail`;

CREATE TABLE `computation_detail` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `computation_id` bigint(2) NOT NULL DEFAULT '0' COMMENT '核算id',
  `model_stage_id` bigint(20) NOT NULL DEFAULT '0' COMMENT '模型S阶段id',
  `model_id` bigint(20) NOT NULL DEFAULT '0' COMMENT '模型W方式id',
  `carbon_total` double(20,2) NOT NULL DEFAULT '0.00' COMMENT '排放总量',
  `intension` double(20,2) NOT NULL DEFAULT '0.00' COMMENT '排放强度',
  `deleted` tinyint(2) NOT NULL DEFAULT '0' COMMENT '0未删除/1删除',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` bigint(20) NOT NULL DEFAULT '0' COMMENT '创建者',
  `update_by` bigint(20) NOT NULL DEFAULT '0' COMMENT '更新者',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='建筑核算明细表';

/*Table structure for table `computation_model` */

DROP TABLE IF EXISTS `computation_model`;

CREATE TABLE `computation_model` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `model_name` varchar(50) DEFAULT NULL COMMENT '名称',
  `parent_id` bigint(20) NOT NULL DEFAULT '0' COMMENT '父级id',
  `model_type` varchar(32) NOT NULL DEFAULT 'S' COMMENT 'S阶段/C过程/W方式',
  `path` varchar(200) NOT NULL DEFAULT '' COMMENT '路由地址',
  `deleted` tinyint(2) NOT NULL DEFAULT '0' COMMENT '0未删除/1已删除',
  `order` int(11) NOT NULL DEFAULT '0' COMMENT '排序',
  `hide` tinyint(2) NOT NULL DEFAULT '0' COMMENT '0显示/1隐藏',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8 COMMENT='核算阶段配置表';

/*Table structure for table `computation_operation_heating` */

DROP TABLE IF EXISTS `computation_operation_heating`;

CREATE TABLE `computation_operation_heating` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `computation_detail_id` bigint(20) NOT NULL DEFAULT '0',
  `load` double(20,2) NOT NULL DEFAULT '0.00' COMMENT '负荷',
  `day_num` int(11) NOT NULL DEFAULT '0' COMMENT '采暖天数',
  `way` varchar(64) NOT NULL DEFAULT '' COMMENT '采暖方式',
  `cop` varchar(64) NOT NULL DEFAULT '' COMMENT '采暖效率或(COP)',
  `
  ` tinyint(2) NOT NULL DEFAULT '0' COMMENT '估算类型 0精确采暖/1大致采暖/2精确制冷/3大致制冷',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `create_by` varchar(64) NOT NULL DEFAULT '',
  `update_by` varchar(64) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='建筑运行采暖制冷记录表';

/*Table structure for table `computation_operation_heating_roughly` */

DROP TABLE IF EXISTS `computation_operation_heating_roughly`;

CREATE TABLE `computation_operation_heating_roughly` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `computation_operation_heating_id` bigint(20) NOT NULL DEFAULT '0',
  `room_type` varchar(64) NOT NULL DEFAULT '' COMMENT '房间类型',
  `room_area` varchar(64) NOT NULL DEFAULT '' COMMENT '房间面积',
  `heating_day` int(11) NOT NULL DEFAULT '0' COMMENT '采暖天数',
  `type` tinyint(2) NOT NULL DEFAULT '0' COMMENT '0采暖/1制冷',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `create_by` varchar(64) NOT NULL DEFAULT '',
  `update_by` varchar(64) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='采暖/制冷 大致估算集合记录表';

/*Table structure for table `computation_operation_hvac_other` */

DROP TABLE IF EXISTS `computation_operation_hvac_other`;

CREATE TABLE `computation_operation_hvac_other` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `computation_detail_id` binary(20) NOT NULL DEFAULT '0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0',
  `power` varchar(64) NOT NULL DEFAULT '' COMMENT '功率',
  `quantity` int(11) NOT NULL DEFAULT '0' COMMENT '数量',
  `run_time` varchar(64) NOT NULL DEFAULT '' COMMENT '运行时间',
  `cool_type` varchar(64) NOT NULL DEFAULT '‘’' COMMENT '制冷剂类型',
  `add_potentiality` varchar(64) NOT NULL DEFAULT '' COMMENT '增温潜势',
  `loading_level` varchar(64) NOT NULL DEFAULT '' COMMENT '填充量',
  `lifetime` varchar(64) NOT NULL DEFAULT '' COMMENT '寿命',
  `type` tinyint(2) NOT NULL DEFAULT '0' COMMENT '0输配/1末端空气处理/2制冷剂逸散',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `create_by` varchar(64) NOT NULL DEFAULT '',
  `update_by` varchar(64) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='输配末端空气制冷剂逸散记录表';

/*Table structure for table `computation_operation_illumination_elevator` */

DROP TABLE IF EXISTS `computation_operation_illumination_elevator`;

CREATE TABLE `computation_operation_illumination_elevator` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `computation_detail_id` bigint(20) NOT NULL DEFAULT '0',
  `room_type` varchar(64) NOT NULL DEFAULT '' COMMENT '房间类型',
  `room_area` varchar(32) NOT NULL DEFAULT '' COMMENT '房间面积',
  `power_density` varchar(64) NOT NULL DEFAULT '' COMMENT '照明功率密度',
  `illumination_time` int(11) NOT NULL DEFAULT '0' COMMENT '全年照明时间',
  `elevator_energy_consumption` varchar(64) NOT NULL DEFAULT '' COMMENT '电梯能耗',
  `elevator_quantity` int(11) NOT NULL DEFAULT '0' COMMENT '电梯数量',
  `frequency` varchar(64) NOT NULL DEFAULT '' COMMENT '使用频率',
  `load` double(20,2) NOT NULL DEFAULT '0.00' COMMENT '额定载重',
  `crowd` varchar(64) NOT NULL DEFAULT '' COMMENT '平均拥挤程度',
  `speed` varchar(64) NOT NULL DEFAULT '' COMMENT '电梯速度',
  `standby_energy_consumption` varchar(64) NOT NULL DEFAULT '' COMMENT '待机能耗',
  `type` tinyint(2) NOT NULL DEFAULT '0' COMMENT '0照明/1电梯',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `create_by` varchar(64) NOT NULL DEFAULT '',
  `update_by` varbinary(64) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='建筑运行 照明电梯记录表';

/*Table structure for table `computation_operation_renewable_energy` */

DROP TABLE IF EXISTS `computation_operation_renewable_energy`;

CREATE TABLE `computation_operation_renewable_energy` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `computation_detail_id` bigint(20) NOT NULL DEFAULT '0',
  `sun_area` varchar(64) NOT NULL DEFAULT '' COMMENT '太阳能光照面积',
  `hot_loss` varchar(64) NOT NULL DEFAULT '' COMMENT '热损失率',
  `set_efficiency` varchar(64) NOT NULL DEFAULT '' COMMENT '集热效率',
  `photovoltaic_area` varchar(64) NOT NULL DEFAULT '' COMMENT '光伏面积',
  `photovoltaic_convert` varchar(64) NOT NULL DEFAULT '' COMMENT '光伏转换率',
  `photovoltaic_loss` varchar(64) NOT NULL DEFAULT '' COMMENT '光伏损失率',
  `wind_quantity` int(11) NOT NULL DEFAULT '0' COMMENT '全年风力发电量',
  `type` tinyint(3) NOT NULL DEFAULT '0' COMMENT '0太阳能热水系统/1光伏发电/2风力发电',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `create_by` varchar(64) NOT NULL DEFAULT '',
  `update_by` varchar(64) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='可再生能源记录表';

/*Table structure for table `computation_operation_water` */

DROP TABLE IF EXISTS `computation_operation_water`;

CREATE TABLE `computation_operation_water` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `computation_detail_id` bigint(20) NOT NULL DEFAULT '0',
  `use_num` int(11) NOT NULL DEFAULT '0' COMMENT '使用人数',
  `water_temperature` varchar(32) NOT NULL DEFAULT '' COMMENT '设计热水温度',
  `cool_water_temperature` varchar(32) NOT NULL DEFAULT '' COMMENT '设计冷水温度',
  `hot_water_quota` varchar(64) NOT NULL DEFAULT '' COMMENT '热水定额',
  `hot_water_density` varchar(64) NOT NULL DEFAULT '' COMMENT '热水密度',
  `hot_water_efficiency` varchar(64) NOT NULL DEFAULT '' COMMENT '生活热水输配效率',
  `use_efficiency` varchar(64) NOT NULL DEFAULT '' COMMENT '设备年平均使用效率',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `create_by` varchar(64) NOT NULL DEFAULT '',
  `update_by` varchar(64) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='建筑运行生活热水记录表';

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

```

/* eslint-disable @typescript-eslint/no-unused-vars */
### 碳中和

  文件目录CarbonNeutral