---
name: kxcode-create-brainsession-listen
description: Brain 交互详情的 Kafka 消费者开发工作流。仅当用户明确提到为 Brain 交互详情创建 Kafka 监听与数据处理逻辑时，才触发此 Skill。触发关键词示例："给 Brain交互 加监听"、"消费 Brain 交互详情的消息"、"Brain交互详情kafka 入库"。不适用于其他业务模块的 Kafka 开发。
---
 
# Brain 交互详情 Kafka 消费者开发工作流
 
本 Skill 专用于 **Brain 交互详情** 业务数据的 Kafka 消息监听与处理开发，定义了 Claude 必须严格遵守的**需求澄清流程**与**编码规范**。
 
> 适用范围：仅限 Brain 交互详情相关的消费者开发，其他业务模块的 Kafka 需求不使用本 Skill。
 
---
 
## 一、工作流阶段总览
 
```
[需求澄清] → [详细设计澄清] → [字段映射澄清] → [逻辑确认] → [代码输出] → [代码校验] → [更新 claude.md]
```
 
Claude 在任何编码任务开始前，**必须按顺序走完以下每个阶段**，不得跳过。
 
---
 
## 二、阶段详细说明
 
### 阶段 1：确定数据处理需求
 
首先确认本次需求的处理方式：
 
- **数据入库**：将消息数据持久化到数据库表
- **调用外部接口**：将消息数据转发或推送至第三方 HTTP 接口
 
> 必须询问：
> 1. 处理失败时，是否需要重试？重试策略是什么？
> 2. 失败时是否使用表来记录失败数据？
 
---
 
### 阶段 2：详细设计澄清
 
根据阶段 1 的结论，分别针对数据库和外部接口进行详细澄清。
 
#### 2.1 数据入库 — 表结构确认
 
- 若**已有表**：请用户提供表结构说明（支持以下方式之一）：
  - 提供 HTTP 文档地址（Claude 会使用 `web_fetch` 拉取内容）
  - 提供本地 `.md` 文件（Claude 会读取文件内容）
  - 直接在对话中粘贴字段说明
 
- 若**表不存在**，需进行表结构设计，并**必须同时输出以下三件套**：
 
##### ① 字段说明文档

| 字段名 | 类型 | 是否必填 | 说明 |
|--------|------|----------|------|
| id | BIGINT | 是 | 主键，自增 |
| ... | ... | ... | ... |

字段说明在确认后需要输出到`docs/design/table-design.md`文件下进行存储，

##### ② 建表 SQL

```sql
CREATE TABLE `表名` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  -- 其他字段
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='表说明';
```
建表SQL在确认后需要输出到`docs/design/tb_create.sql`文件下进行存储，

##### ③ 数据持久层对象创建

在`bean.dao`下创建实体类`*DAO.java`
```java
/**
 * 原始数据表 DAO
 *
 * @author suyuh
 * @date 2026-03-10
 */
@Data
@TableName(value = "tb_original_data")
public class OriginalDataDAO {

    /**
     * 主键 ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 原始数据名称
     */
    private String dataName;

    /**
     * 逻辑删除标识
     */
    @TableLogic
    private Integer deleted;

    /**
     * 自动填充创建时间
     */
    @TableField(fill = com.baomidou.mybatisplus.annotation.FieldFill.INSERT)
    private LocalDateTime createTimeAuto;

}
```

在`mapper`包下创建数据持久层接口
```java
/**
 * 原始数据表持久层接口
 *
 * @author suyuh
 * @date 2026-03-12
 */
@Mapper
public interface OriginalDataMapper extends BaseMapper<OriginalDataDAO> {
}
```
在`src/main/mapper`文件夹下创建 `*Mapper.xml`的mybatisxml文件。

---

#### 2.2 调用外部接口失败记录入库-表结构确认（可选）
在需要对推送失败记录进行数据库存储的情况下，请参考2.1步骤完成接口调用表结构设计。
- 若**数据入库**也需要进行，请优先通过使用同一张表添加字段的形式来实现本功能的表结构设计，如添加`push_success`、`push_fail_reason`等字段。
- 要求调用外部接口失败记录表需要包含如下信息 通话唯一标识（calluuid）、失败原因（接口返回状态与原因）、

#### 2.3 调用外部接口 — 接口详情确认
 
- 若**已有接口文档**：请用户提供（支持以下方式之一）：
  - 提供 HTTP 文档地址（Claude 会使用 `web_fetch` 拉取内容）
  - 提供本地 `.md` 文件（Claude 会读取文件内容）
  - 直接在对话中粘贴接口说明
 
- 至少需要确认以下信息：
  - 接口地址、HTTP 方法（GET / POST）
  - 请求 Header（是否需要鉴权，Token 如何获取）
  - 请求体结构（入参字段名、类型、是否必填）
  - 响应结构（如何判断调用成功/失败）
  - 接口调用是否有超时要求或重试机制
 
---
 
### 阶段 3：字段映射与生成逻辑澄清
 
在清楚了消息格式和目标结构（表字段 / 接口入参）后，逐一分析映射关系：
 
> 对于**不能直接映射**的字段，必须向用户明确以下问题：
> - 该字段的值从哪里来？（消息字段 / 配置文件 / 数据库查询 / 计算逻辑）
> - 是否存在格式转换？（时间戳转日期、枚举值映射、单位换算等）
> - 是否需要做空值处理或默认值兜底？
 
建议以表格形式呈现映射关系供用户确认，例如：
 
| 目标字段 | 来源 | 转换逻辑 | 待确认 |
|----------|------|----------|--------|
| `deviceId` | 消息 `device_id` | 直接映射 | 否 |
| `reportTime` | 消息 `ts`（毫秒时间戳） | 转换为 `LocalDateTime` | 否 |
| `status` | 固定值 | 默认写入 `1` | 是 ✋ |
 
---
 
### 阶段 4：逻辑实现确认
 
在编写代码前，**必须与用户确认完整的处理流程**：
 
> "我理解的消费逻辑是这样的：
> 1. 监听 Topic `xxx`，反序列化消息为 `BrainSessionDTO`
> 2. 校验消息合法性（如必填字段）
> 3. [入库]：构造 DAO 并调用 Mapper 保存
> 4. [调用接口]：构造请求体，调用 `XxxClient#post` 方法
> 5. 处理异常，记录日志
>
> 请确认逻辑是否正确，或有需要调整的地方？"
 
只有用户确认后，才进入代码输出阶段。
 
---
 
### 阶段 5：代码输出
 
#### 5.1 Kafka 依赖与配置检查
 
在输出业务代码前，**必须先检查**项目中是否已引入 Kafka 依赖和配置：
 
**检查 `pom.xml` 是否包含：**
 
```xml
<dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
</dependency>
```
 
**检查 `application.yml` / `application.properties` 是否包含 Kafka 配置：**
 
```yaml
spring:
  kafka:
    bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS:localhost:9092}
    consumer:
      group-id: ${spring.application.name}
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      enable-auto-commit: false
    listener:
      ack-mode: manual_immediate
```
 
若缺少依赖或配置，**必须先补充后再输出业务代码**，并告知用户需要同步修改。
 
#### 5.2 代码输出内容
 
按顺序输出以下内容（根据实际需要取舍）：
 
1. **消息接收参数规范**：
 
   Kafka 监听方法的入参**必须使用 `BrainSessionDTO` 进行封装**，不得自定义其他消息 DTO 类。
   `BrainSessionDTO` 的字段定义详见 `references/BrainSessionDTO.java`，使用前须读取该文件确认字段结构。
 
   > ⚠️ 禁止自行新建消息接收 DTO，所有消息均通过 `BrainSessionDTO` 反序列化。
 
2. **Consumer 类**：监听器主体
 
   ```java
   @Slf4j
   @Component
   public class XxxConsumer {

      private final 
 
       // Topic 配置项命名规范：${kafka.topic.brain-session} 或 ${kafka.topic.brain-interaction}
       @KafkaListener(topics = "${kafka.topic.brain-session}", groupId = "${spring.application.name}")
       public void consume(ConsumerRecord<String, String> record, Acknowledgment ack) {
           try {
               // 固定使用 BrainSessionDTO 接收消息，字段参考 references/BrainSessionDTO.java
               BrainSessionDTO msg = JSON.parseObject(record.value(), BrainSessionDTO.class);
               // 处理逻辑
               ack.acknowledge();
           } catch (Exception e) {
               log.error("[XxxConsumer] 消息处理异常, offset={}, value={}", record.offset(), record.value(), e);
               // 视业务决定是否 ack，防止死循环
               ack.acknowledge();
           }
       }
   }
   ```
 
3. **Service 层**：数据处理逻辑（入库 / 调用接口）
 
4. **外部接口调用规范**（若需要）：
 
   - 必须使用 Spring Boot 框架提供的 **`RestTemplate`** 进行 HTTP 调用，不得使用 OkHttp、Feign、HttpClient 等其他方式
   - 接口相关的 URL **必须提取到配置文件**中，禁止硬编码在代码里
   - 配置项命名规范：`brain.api.xxx-url`，例如：
 
   **`application.yml` 配置示例：**
 
   ```yaml
   brain:
     api:
       session-report-url: ${BRAIN_SESSION_REPORT_URL:http://localhost:8080/api/session/report}
   ```
 
   **Service 层调用示例：**
 
   ```java
   @Slf4j
   @Service
   @RequiredArgsConstructor
   public class XxxService {
 
       @Value("${brain.api.session-report-url}")
       private String sessionReportUrl;
 
       private final RestTemplate restTemplate;
 
       /**
        * 调用外部接口上报数据
        */
       public void reportToExternal(XxxRequestDTO requestDTO) {
           try {
               HttpHeaders headers = new HttpHeaders();
               headers.setContentType(MediaType.APPLICATION_JSON);
               HttpEntity<XxxRequestDTO> entity = new HttpEntity<>(requestDTO, headers);
 
               ResponseEntity<String> response = restTemplate.postForEntity(sessionReportUrl, entity, String.class);
               if (!response.getStatusCode().is2xxSuccessful()) {
                   log.error("[XxxService] 外部接口调用失败, statusCode={}, body={}", response.getStatusCode(), response.getBody());
               }
           } catch (Exception e) {
               log.error("[XxxService] 外部接口调用异常, url={}", sessionReportUrl, e);
           }
       }
   }
   ```
 
   > ⚠️ 若项目中尚未注册 `RestTemplate` Bean，需在配置类中补充(可参考`./references/RestTemplateConfig.java`)：
  
 
5. **Mapper**（若需要）：Mybatisplus数据访问层
 
---
 
### 阶段 6：代码校验
 
代码输出完毕后，参考项目 `rules` 文件和 `CLAUDE.md` 中的规范要求，对生成的代码进行以下自查：
 
- [ ] 包名是否符合项目规范
- [ ] 类名、方法名命名是否符合规范
- [ ] 日志格式是否统一（是否带有模块标识前缀，如 `[XxxConsumer]`）
- [ ] 异常处理是否完善，是否有遗漏的 try-catch
- [ ] 是否使用了项目统一的 JSON 工具类
- [ ] 消息接收参数是否统一使用 `BrainSessionDTO`，未自行新建消息 DTO
- [ ] 外部接口调用是否使用 `RestTemplate`，未使用其他 HTTP 客户端
- [ ] 外部接口 URL 是否已提取到配置文件，未在代码中硬编码
- [ ] 幂等逻辑是否已实现（如需要）
- [ ] 外部接口调用是否有异常捕获与日志记录
 
发现不符合规范之处，**直接修正后输出最终版本**，并告知用户修改了哪些地方。
 
---
 
### 阶段 7：更新 claude.md 消息队列章节
 
代码校验通过后，更新项目 `claude.md` 文档中的 **`消息队列`** 章节，追加本次新增的生产者/消费者描述。
 
**格式要求如下：**
 
```markdown
## 消息队列
 
如果项目集成了消息中间件，请逐个分析生产者和消费者的相关代码位置和逻辑：
- 分析生产者的业务和消息格式与具体代码位置（完整类名）
- 分析消费者的业务和消息格式，并给出核心数据处理方法的具体位置（完整类名与方法名，如 `com.kxjl.demo.core.ReportTask#consume`）
 
| 角色 | Topic | 业务 | 消息格式 | 代码位置 |
|------|-------|------|----------|----------|
| 生产者 | `${kafka.topic.brain-session}` | Brain 会话状态上报 | `BrainSessionDTO` JSON 字符串 | 外部 Brain 服务 |
| 消费者 | `${kafka.topic.brain-session}` | 消费 Brain 会话消息，保存至数据库 | `BrainSessionDTO` JSON 字符串 | `com.kxjl.xxx.BrainSessionConsumer#consume` |
```
 
> ⚠️ 若 `CLAUDE.md` 中已存在 `消息队列` 章节，只追加新增的行，**不得删除已有记录**。
 
---
 
## 三、Claude 行为要求
 
1. **不得跳过任何阶段**，每个阶段必须等待用户确认后再推进
2. **阶段 2 中，表结构三件套（字段文档、建表 SQL、Entity）必须同时输出**
3. **阶段 3 中，所有不明确的字段映射必须逐一澄清，不得自行假设**
4. **阶段 4 中，必须以结构化方式向用户陈述完整逻辑并等待确认**
5. **阶段 5.1 中，Kafka 依赖和配置检查不可省略**
6. **阶段 7 中，更新 claude.md 时只追加不覆盖**
7. 文档地址（HTTP 或本地 `.md` 文件）由用户提供后，Claude 必须主动读取，不得让用户重复粘贴内容
8. **消息接收参数必须使用 `BrainSessionDTO`**，输出代码前须读取 `references/BrainSessionDTO.java` 确认字段，不得自行定义消息 DTO
9. **外部接口调用必须使用 `RestTemplate`**，URL 必须配置在 `application.yml` 中，禁止硬编码