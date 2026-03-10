# Java 编码规范

> 版本：1.0 | 适用范围：所有 Java 后端项目

---

## 一、注释规范

### 1.1 类注释
每个类必须在类声明上方添加 Javadoc 注释，说明类的用途、作者和创建日期。

```java
/**
 * 用户服务类，提供用户注册、登录、信息查询等核心业务逻辑。
 *
 * @author yourname
 * @date 2024-01-01
 */
public class UserService {
}
```

### 1.2 方法注释
所有 **public / protected** 方法必须添加 Javadoc 注释，包含：
- `@param`：每个参数的含义和约束
- `@return`：返回值说明（void 方法除外）
- `@throws`：可能抛出的受检异常

```java
/**
 * 根据用户ID查询用户信息。
 *
 * @param userId 用户唯一标识，不能为 null
 * @param includeDeleted 是否包含已软删除的用户
 * @return 用户信息对象，查询不到时返回 null
 * @throws IllegalArgumentException 当 userId 格式非法时抛出
 */
public UserDTO getUserById(Long userId, boolean includeDeleted) {
    // ...
}
```

> **私有方法** 至少添加单行注释说明方法用途。

### 1.3 变量与参数注释
- **类成员变量**：使用 `/** */` 或行尾 `//` 注释说明字段含义及约束。
- **局部变量**：逻辑复杂处需在声明行或上方添加注释。
- **方法参数**：通过方法 `@param` 标签统一说明，无需在方法体内重复。

```java
/** 最大重试次数，超过后抛出异常 */
private static final int MAX_RETRY_COUNT = 3;

/** 用户昵称，长度不超过 50 个字符 */
private String nickName;
```

---

## 二、方法行数规范

### 2.1 单方法不超过 100 行
单个方法的有效代码行（不含注释、空行）**不得超过 100 行**。超过时须按职责拆分为多个私有方法。

```java
// ✅ 正确：主流程方法调用子方法
public OrderResult createOrder(OrderRequest request) {
    validateRequest(request);          // 参数校验
    deductInventory(request);          // 扣减库存
    return saveOrderAndReturn(request); // 保存并返回
}
```

### 2.2 修改入参对象须额外说明并返回
若方法内部**修改了入参对象的属性值**，必须：
1. 在方法 Javadoc 中用 `@apiNote` 或注释明确说明哪些字段被修改。
2. 将修改后的入参对象作为返回值返回（即使类型可为 void，也应改为返回修改后对象）。

```java
/**
 * 填充订单的创建时间与操作人信息。
 *
 * @param order 待处理的订单对象
 * @return 已填充 createTime、operatorId 字段的订单对象（入参对象被修改）
 * @apiNote 注意：该方法会直接修改入参 order 的 createTime 和 operatorId 字段
 */
public Order fillAuditFields(Order order) {
    // 修改入参对象的字段
    order.setCreateTime(LocalDateTime.now());
    order.setOperatorId(getCurrentUserId());
    // 返回修改后的对象
    return order;
}
```

> ❌ **禁止** 在方法内静默修改入参后不声明、不返回，避免调用方产生副作用困惑。

---

## 三、命名规范

### 3.1 静态常量：全大写 + 下划线
所有 `static final` 常量使用全大写字母，单词间以下划线分隔。

```java
// ✅ 正确
public static final int MAX_RETRY_COUNT = 3;
public static final String DEFAULT_CHARSET = "UTF-8";

// ❌ 错误
public static final int maxRetryCount = 3;
public static final String defaultCharset = "UTF-8";
```

### 3.2 方法名：小驼峰（lowerCamelCase）
方法名以小写字母开头，后续单词首字母大写，动词开头，清晰表达行为。

```java
// ✅ 正确
public UserDTO getUserById(Long userId) {}
public boolean isOrderValid(Order order) {}
public void sendNotificationEmail(String email) {}

// ❌ 错误
public UserDTO GetUserById(Long userId) {}   // 首字母大写
public UserDTO get_user_by_id(Long userId) {} // 使用下划线
```

### 3.3 属性名（字段名）：小驼峰（lowerCamelCase）
类成员属性与局部变量同样使用小驼峰，禁止使用下划线或全大写。

```java
// ✅ 正确
private String userName;
private LocalDateTime createTime;
private List<String> roleList;

// ❌ 错误
private String user_name;
private String UserName;
```

### 3.4 其他命名参考

| 元素   | 规范                   | 示例                              |
|------|----------------------|---------------------------------|
| 类名   | 大驼峰 `UpperCamelCase` | `UserService`、`OrderController` |
| 接口名  | 大驼峰，无需 `I` 前缀        | `PaymentGateway`                |
| 枚举类  | 大驼峰，枚举值全大写+下划线       | `OrderStatus.PENDING_PAY`       |
| 包名   | 全小写，点分隔              | `com.example.order.service`     |
| 测试类  | 被测类名 + `Test` 后缀     | `UserServiceTest`               |
| 数据库映射实体类 | 名称 +`DAO`后缀          | `UserDAO`                       |
| 数据传输类 | 名称 +`DTO`后缀          | `UserDTO`                       |
| 数据展示类 | 名称 +`VO`后缀           | `UserVO`                        |
---

## 四、其他基础规范

### 4.1 异常处理
- 不得吞掉异常（catch 后空实现）；至少打印日志。
- 业务异常使用自定义异常类，不直接抛出 `RuntimeException`。
- catch 块中须添加注释说明为何捕获该异常及处理逻辑。

```java
try {
    orderService.create(order);
} catch (InventoryShortageException e) {
    // 库存不足时返回业务错误码，不中断主流程
    log.warn("库存不足，orderId={}", order.getId(), e);
    return Result.fail(ErrorCode.INVENTORY_SHORTAGE);
}
```

### 4.2 日志规范
- 使用 SLF4J 接口，禁止直接使用 `System.out.println`。
- 日志占位符使用 `{}` 而非字符串拼接。
- 生产环境关键操作须打印 INFO 级别日志；异常打印 WARN/ERROR。

```java
// ✅ 正确
log.info("用户登录成功，userId={}", userId);

// ❌ 错误
System.out.println("用户登录成功，userId=" + userId);
log.info("用户登录成功，userId=" + userId); // 字符串拼接影响性能
```

### 4.3 空值处理
- 方法返回集合类型时，空结果返回空集合（`Collections.emptyList()`），不返回 `null`。
- 对外部入参须做非空校验，推荐使用 `Objects.requireNonNull` 或断言工具。

---

*本规范持续迭代，如有疑问或建议请提交 MR 至规范仓库。*
