---
name: kxcode-create-brainsession-listen
description: Ptah电话机器人平台业务包接口编码工作流规范。当用户提出任何关于项目的业务包编码需求、功能开发、接口设计、业务逻辑实现时，必须触发此 Skill。注意：仅在用户明确表明需要新增一个业务包接口时才需要遵循并触发本Skill。
---

# Ptah电话机器人平台业务包说明
人机交互系统会在需要时调用本项目接口，接口中携带历史人机交互信息、上下文变量信息等，当你需要更新人机交互系统的上下文变量信息时可以通过接口返回来实现。
机器人系统会使用上下文变量信息来实现动态回复内容的拼装或者是人机交互流程的走向判断。
Api 接口的入参与返回参数均已设计完成，请参考 `docs/framework/business-interface.md` 进行开发。


# 业务包接口编码工作流 Skill

本 Skill 定义了在Ptah电话机器人的业务包类型项目中进行功能开发时，Claude 必须严格遵守的**需求澄清流程**和**编码规范**。

---

## 一、工作流阶段总览

```
[需求澄清] → [返回值确认] → [数据库设计（按需）] → [逻辑实现] → [代码输出]
```

Claude 在任何编码任务开始前，**必须按顺序走完以下每个阶段**，不得跳过。

---

## 二、阶段详细说明

### 阶段 0：需求澄清（自然对话）

- 与用户正常沟通，理解业务背景
- 确认功能边界、输入输出的业务含义
- **不需要用户主动说完所有细节**，Claude 应主动提问直到需求清晰

---

### 阶段 1：确认返回值

需求澄清后，**必须明确询问**：

> "你需要这个接口返回什么变量值，供Ptah电话机器人使用？他是什么类型"

- 如果有返回值 → 确认用户希望返回的变量的类型和Key，并在最终返回时已`ServiceResponse<BrainResult[]>`进行构建
- 如果无返回值 → 返回类型为 `ServiceResponse<Void>`

---

### 阶段 2：数据库设计（按需）

根据需求判断是否涉及数据持久化。**若需要新建或修改表**，进入本阶段：

**2.1 与用户确认字段设计**
- 主动列出建议字段，询问用户是否需要增删改
- 确认主键策略、索引需求、是否需要逻辑删除字段（如 `is_deleted`）

**2.2 输出以下三项内容（缺一不可）：**

#### ① 字段说明文档

| 字段名 | 类型 | 是否必填 | 说明 |
|--------|------|----------|------|
| id | BIGINT | 是 | 主键，自增 |
| ... | ... | ... | ... |

字段说明在确认后需要输出到`docs/design/table-design.md`文件下进行存储，

#### ② 建表 SQL

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
建表SQL在确认后需要输出到`docs/design/<databaseName>.sql`文件下进行存储，

#### ③ 数据持久层对象创建

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

其他细则请参考`Api/Service/Mapper/bean 对象设计规范`

---

### 阶段 3：确认实现逻辑

在编写代码前，**必须与用户确认核心逻辑**：

> "我理解的实现逻辑是这样的：[逐条列出步骤]，请确认是否正确，或有需要调整的地方？"

只有用户确认后，才进入代码输出阶段。

---

### 阶段 4：代码输出

**4.1 接口签名规范相关类的引入确认**
判断项目是否引入了`qetesh-commons`的jar包，并确定`com.kxjl.qetesh.dto.BrainSessionDTO`,`com.kxjl.qetesh.dto.TraceDTO`，`com.kxjl.qetesh.common.response.ServiceResponse<T>`是否引入。
如果未引入，可以参考`references`中的java对象进行代码生成和输出。

**4.2 代码最终输出**
按照以下规范生成代码。

---

## 三、编码规范



### 3.2 接口签名规范（必须严格遵守）

**请求参数**：统一使用 `com.kxjl.qetesh.dto.BrainSessionDTO`

**返回值**：统一使用 `com.kxjl.qetesh.common.response.ServiceResponse<T>`
- 有数据返回时，泛型 `T` 为 `BrainResult[]`（数组结构）
- 无数据返回时，使用 `ServiceResponse<Void>`

**Controller 方法签名示例：**

```java
@PostMapping("/xxx")
public ServiceResponse<BrainResult[]> doSomething(@RequestBody BrainSessionDTO brainSessionDTO) {
    // ...
}
```

**Service 接口方法签名示例：**

```java
ServiceResponse<BrainResult[]> doSomething(BrainSessionDTO brainSessionDTO);
```

---

### 3.3 ServiceResponse 使用约定

```java
// 成功，有数据
return ServiceResponse.buildSuccess(results);

// 成功，无数据
return ServiceResponse.buildSuccess();

// 失败
return ServiceResponse.build(-1,"错误信息");
```

> ⚠️ 若项目中 `ServiceResponse` 的静态方法名不同，以用户提供的实际实现为准。

---

### 3.4 代码风格要求

- 使用 Lombok（`@Data`, `@RequiredArgsConstructor` 等），避免手写 getter/setter
- Api 层不写业务逻辑，只做参数校验和调用 Service
- 注释使用中文，方法级别必须有 Javadoc
- 字段命名使用小驼峰，数据库字段使用下划线命名

---

## 四、Claude 行为要求

1. **不得在用户未确认逻辑前就输出完整代码**
2. **每个阶段结束后，等待用户回复再进入下一阶段**
3. **数据库设计三件套（字段文档、SQL、Entity）必须同时输出**
4. **接口签名必须严格使用 `BrainSessionDTO` 和 `ServiceResponse<BrainResult[]>`，不得自行替换**
5. 对于`BrainSessionDTO`的字段和内容不理解时可以参考`docs/framework/brain-session.md`文档进行理解
6. 需求模糊时，主动提问，不得假设需求后直接编码