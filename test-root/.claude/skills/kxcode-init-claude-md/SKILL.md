---
name: "kxcode-init-claude-md"
description: 初始化j2ee项目Claude的CLAUDE.md文件
---

初始化j2ee项目Claude的CLAUDE.md文件

**Input**: 对一个已经完成版本发布或者仅完成脚手架搭建的项目进行Claude Code和openspec相关配置的初始化.

**Steps**

1. **判断能否执行**

   如果项目中`CLAUDE.md`已经存在需要向用户确认此操作将会覆盖原有的文件，用户同意后继续执行否则立即退出流程。

2. **解析项目的技术栈**

   通过读取项目的`pom.xml`文件中引入的相关框架引入确定项目使用的技术栈和涉及到的项目框架,请核心关注以下几点
    - JDK版本、springBoot 、spring cloud 、mybatis、mybatisplus、hibernate等相关orm框架的使用情况和版本
    - 扫描关系型数据库驱动确定使用的数据库选型
    - 消息队列的使用情况，如Kafka、RabbitMq、RocketMQ
    - NoSQL的技术选型，如redis、mongdb等
    - 其他中间件的判断如`ES`、`OSS`
      输出格式模板如下，不不需要输出具体的版本号和其他信息
```
- **技术栈**：springboot4.0、mybatis、mybatisplus、mysql、jdk17
- **项目架构**：采用前后端分离技术，本项目仅提供后端服务接口
- **基础包名**: `com.kxjl.aimp.label`
- **数据隔离**: 多租户架构，通过 `biz_id` 隔离，通过`com.kxjl.aimp.label.common.utils.AuthUtils.getCurrentBizId()`方法获取
- **开发环境**：windows 、 Intellij
```


3. **解析项目的包结构描述**
   输出项目的包路径结构与作用，格式参考下面
   **禁止**输出具体的java文件名和类名
```
com.kxjl.aimp.label (root)
├── AimpLabelApplication.java      # Spring Boot 启动类
├── api/                           # API 接口层（RESTful）
├── bean/
│   ├── dao/                       # 数据库映射对象（与表一一对应）
│   ├── dto/                       # 数据传输对象
│   └── vo/                        # 视图对象
├── common/
│   ├── enums/                     # 枚举类
│   └── utils/                     # 工具类
├── core/                          # 核心支撑组件（配置、任务、过滤器等）
├── mapper/                        # MyBatis 数据持久层接口
└── service/
├── impl/                      # Service 实现类
└── (interfaces)               # Service 接口
```

4. **扫描数据库实体类**

   如果项目使用了数据库与ORM框架，扫描相关类的属性与注解，生成关于数据库的详细描述并输出至`docs/design/table-design.md`文件中。

4.1. **表结构分析**
模板可以参考下面的格式，使用md的表格来展示数据库的相关设计，不能用使用SQL文件来表示
```markdown
### 1. 企业表 (tb_enterprise)

| 字段名 | 字段备注 | 字段类型 | 非空 | 唯一约束 |
|--------|----------|----------|------|----------|
| id | 主键 ID | Int | 是 | 是 |
| enterprise_name | 企业名称 | String | 是 | 否 |
| description | 企业描述 | String | 否 | 否 |
| contact_person | 联系人姓名 | String | 否 | 否 |
| contact_phone | 联系人电话 | String | 否 | 否 |
| contact_email | 联系人邮箱 | String | 否 | 否 |
| enterprise_status | 企业状态 (1:active 正常，0:inactive 停用) | Int | 是 | 否 |
| biz_id | 企业 ID | String | 是 | 是 |
| create_time | 创建时间 | DateTime | 是 | 否 |
| create_by | 创建人 | String | 是 | 否 |
| update_time | 更新时间 | DateTime | 是 | 否 |
| update_by | 更新人 | String | 是 | 否 |
| is_deleted | 逻辑删除标识 | Boolean | 是 | 否 |

**枚举说明：**
- enterprise_status: 1(active 正常), 0(inactive 停用)

**表说明：** 存储企业相关信息，实现多租户架构的基础。
```

4.2. **表关联分析**
通过字段名称分析表之间可能存在的关联性
   ```
   ## 表关联
   ### 用户管理模块
   - tb_enterprise.id → tb_team.biz_id (1:n)
   - tb_enterprise.id → tb_user.biz_id (1:n)
   - tb_team.id → tb_user.team_id (1:n)
   ```


5. **扫描工具类并输出**

   扫描项目（如果serena存在使用serena），扫描`*Utils.java`或`*Util.java`文件与方法
   生成Api使用的速查表输出到`docs/framework/project-utils-mehtod.md`文件中,格式如下

```
| 方法名 | 方法说明 | 参数列表 | 参数值说明|返回值说明|
|-----|-----|-----|-----|-----|
|com.kxjl.qetesh.common.utils.StringUtils#isBlank|判断字符串是否为空|String|待判断字符串|boolean true:为空 false:不为空|
```

6. **消息队列分析**

   如果项目继承了消息中间件，请逐个分析生产者和消费者的相关代码位置和逻辑
    - 分析生产者的业务和消息格式与具体代码位置（完成类名）
    - 分析消费者的业务和消息格式，并给出核心数据处理方法的具体位置（完成类名与方法名如`com.kxjl.demo.core.ReportTask#consume`）;
      格式如下：
```
| 角色 | Topic | 业务 | 消息格式 | 代码位置 |
|------|-------|------|----------|----------|
| 生产者 | `${rocketmq.gwlog.topic}` | 网关日志上报 | `GwLog` JSON 字符串 | 外部网关服务 |
| 消费者 | `${rocketmq.gwlog.topic}` | 消费网关日志，保存至数据库 | `GwLog` JSON 字符串 | `com.kxjl.aimp.report.core.GwLogONSConsumer#consume` |
```

7. **定时任务分析**

   如果项目中`@Schema`等定时任务的方法，请分析并输出，输出格式如下：
   ```
   |定时任务|触发频率|完整方法名|
   |---|---|---|
   |定时清理数据库逻辑删除数据|每秒|com.kxjl.demo.core.ClearTask#clear|
   ```

8. **业务包标准接口功能描述（可选）**
    如果项目类型为Ptah电话机器人平台业务包（可通过`./kxcode/config.json`中`projectType`字段获取），执行该步骤
    解析项目实现的Ptah电话机器人平台业务接口,并进行分析，输出格式如下：
    ```
    |接口URL|接口功能说明（100字以内）|是否返回上下文变量|上下文变量KEY以及含义|
    |-----|-----|-----|-----|
    |/api/v1/get_callin_count|根据用户主叫号码判断当前进线次数|是|call_in_count：进线次数|
    ```

9. **CLAUDE文件输出**

   读取`./references/CLAUDE_TEMPLATE.md`文件已文件内容作为模板，结合上述步骤中的输出部分替换模板中的描述。
   **禁止**对模块中非[这里填充**相关内容]的部分进行任何改动
   未标明需要填充的模块请不要私自添加
   将最终的产物输出至`CLAUDE.md`中文件

**Output During Implementation**
```
### 正在分析项目结构与内容
当前任务 1/5 [分析技术栈中]
[...等待完成...]
✓ 任务完成
```

**Output On Completion**

```
### 任务完成

- [x] 任务 1
- [x] 任务 2
...

所有任务已完成，请查看CLAUDE.md文件查看项目分析情况
```

**Guardrails**

- 持续执行任务，直到完成或因为判断退吹。
- 开始前始终读取上下文文件（从应用指令输出）
- 如果任务不明确，请在实施前暂停并询问
- 如果实现发现问题，请暂停并建议进行工件更新
- 完成每个任务后立即更新任务复选框
- 询问错误或不明确的要求-不要猜测
- 使用CLI输出中的contextFile，不要假设特定的文件名
