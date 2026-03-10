---
paths: "**/*.{java}"
---

## java工具类的试用规则
使用 Apache Commons 系列库（commons-lang3、commons-codec、commons-io）

###依赖版本

### 依赖版本（统一在父 pom 中声明）

```xml
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-lang3</artifactId>
    <version>3.14.0</version>
</dependency>
<dependency>
    <groupId>commons-codec</groupId>
    <artifactId>commons-codec</artifactId>
    <version>1.16.1</version>
</dependency>
<dependency>
    <groupId>commons-io</groupId>
    <artifactId>commons-io</artifactId>
    <version>2.16.1</version>
</dependency>
```

### 文件相关工具类的API速查
| 场景 | 推荐 API | 注意 |
|------|---------|------|
| 读取小文件为字符串 | `FileUtils.readFileToString(f, UTF_8)` | 自动关闭流 |
| 按行读取小文件 | `FileUtils.readLines(f, UTF_8)` | 返回 `List<String>` |
| **大文件**流式读取 | `FileUtils.lineIterator(f, "UTF-8")` | 必须 `closeQuietly` |
| 写入文本文件 | `FileUtils.writeStringToFile(f, str, UTF_8, append)` | 自动建父目录 |
| 写入二进制文件 | `FileUtils.writeByteArrayToFile(f, bytes)` | — |
| 流 → 字符串 | `IOUtils.toString(stream, UTF_8)` | 调用方关闭流 |
| 大流复制 | `IOUtils.copyLarge(in, out)` | 内部 4KB 缓冲 |
| 路径拼接 | `FilenameUtils.concat(dir, file)` | 跨平台安全 |
| 获取扩展名 | `FilenameUtils.getExtension(name)` | null 安全 |
| 安全删除 | `FileUtils.deleteQuietly(file)` | 不存在不抛异常 |
| 可读大小 | `FileUtils.byteCountToDisplaySize(bytes)` | "1.5 MB" 格式 |

### 字符串行相关工具类的API速查
#### 非空判断
| 方法 | 含义 | null | `""` | `"  "` |
|------|------|------|------|--------|
| `StringUtils.isBlank(s)` | 空/空白 | true | true | true |
| `StringUtils.isEmpty(s)` | 空 | true | true | false |
| `StringUtils.isNotBlank(s)` | 非空非空白 | false | false | false |

#### 字符串截取与填充
| 方法                 |含义|
|--------------------|----------|
| `StringUtils.substring(s,i,i)` |安全截取（越界不抛异常）|
| `StringUtils.leftPad(s,i,c)`   |左补零（如订单号格式化）|
| `StringUtils.rightPad(s,i,c)`   |右填充（固定宽度列对齐）|

#### 分割与合并
| 方法                |含义|
|-------------------|----------|
| `StringUtils.split(s,c)`      |分割（null 安全，自动忽略连续分隔符产生的空串）|
| `StringUtils.join(s...)`      |合并（过滤空元素后再 join）|

#### 替换与清理
| 方法                          | 含义        |
|-----------------------------|-----------|
| `StringUtils.replace(s,s,s)`            | null 安全替换 |
| `StringUtils.removeEnd(s,s)`            | 移除后缀      |
| `StringUtils.removeStart(s,s)`            | 移除前缀      |
| `StringUtils.deleteWhitespace(s)`            | 删除所有空白字符      |

#### 数字字符串判断
| 方法                          | 支持负数      | 支持小数 | 适用场景 |
| ------                      | --------- |---------|---------|
| `StringUtils.isNumeric(s)`  | ❌         | ❌ | 纯正整数：年龄、ID、验证码 |
| `NumberUtils.isParsable(s)` | ✅         | ✅ | 金额、坐标、通用数值 |
| `NumberUtils.isDigits(s)`   | ❌         | ❌ | 同 isNumeric，推荐前者 |


#### 比较与查找
| 方法                            | 含义        |
|-------------------------------|-----------|
| `StringUtils.equals(s,s)`     |null 安全比较（两者都 null → true） |
| `StringUtils.equalsIgnoreCase(s,s)`       | null 安全比较（两者都 null → true）      |
| `StringUtils.containsIgnoreCase(s,s)`     | 包含检查（null 安全）      |
| `StringUtils.equalsAny(s,s...)`           | 多值匹配      |
| `StringUtils.equalsAnyIgnoreCase(s,s...)` | 多值匹配      |

### 编解码API速查
#### Base64
| 方法                               | 含义        |
|----------------------------------|-----------|
| `Base64.encodeBase64String(b[])` | 字节数组 → Base64      |
| `Base64.encodeBase64URLSafeString(b[])` | URL-Safe Base64（用于 URL 参数、JWT、Cookie）    |
| `Base64.decodeBase64(s)`                | Base64 → 字节数组      |

#### M摘要
| 方法                                           | 含义        |
|----------------------------------------------|-----------|
| `DigestUtils.md5Hex(s)`                      | 字符串 MD5（32 位小写十六进制）   |
| `DigestUtils.md5Hex(b[])` |字节数组 MD5 |
| `DigestUtils.sha256Hex()` |HA-256（安全场景首选，64 位十六进制）|
| `DigestUtils.sha512Hex()` |SHA-512（最高安全需求，128 位十六进制） |


#### HMAC消息验证
```java
// ✅ 生成 HMAC-SHA256 签名（返回 64 位十六进制）
HmacUtils hmac = new HmacUtils(
    HmacAlgorithms.HMAC_SHA_256,
    secretKey.getBytes(StandardCharsets.UTF_8)  // 密钥必须显式 UTF-8
);
String signature = hmac.hmacHex(message.getBytes(StandardCharsets.UTF_8));

// ✅ 验签：时间恒定比较，防止时序攻击
boolean verify(String secretKey, String message, String expectedSig) {
    HmacUtils hmac = new HmacUtils(
        HmacAlgorithms.HMAC_SHA_256,
        secretKey.getBytes(StandardCharsets.UTF_8)
    );
    String actual = hmac.hmacHex(message.getBytes(StandardCharsets.UTF_8));
    // ✅ isEqual 是时间恒定比较，防止攻击者通过响应时间猜测签名
    return MessageDigest.isEqual(
        actual.getBytes(StandardCharsets.UTF_8),
        expectedSig.trim().toLowerCase().getBytes(StandardCharsets.UTF_8)
    );
}

// ⚠️ 密钥规范：
//   - 长度 ≥ 256 bit（32 字节）
//   - 从配置中心（Vault/Nacos）安全获取
//   - 禁止硬编码在代码或配置文件中
//   - 定期轮换
```

#### HEX 十六进制
```java
// ✅ 字节数组 → 十六进制字符串（小写）
String hex = Hex.encodeHexString(bytes);  // 默认小写
String hexUpper = Hex.encodeHexString(bytes, false);  // 大写

// ✅ 十六进制字符串 → 字节数组
try {
    byte[] bytes = Hex.decodeHex(hexString);
} catch (DecoderException e) {
    throw new IllegalArgumentException("无效的十六进制字符串: " + hexString, e);
}

// ✅ 解码前校验
if (hexString.length() % 2 != 0) {
    throw new IllegalArgumentException("十六进制字符串长度必须为偶数");
}
```

#### 算法选型矩阵

| 算法 | 输出长度 | 推荐场景 | 禁止场景 |
|------|---------|---------|---------|
| MD5 | 32 位 Hex | 文件指纹、去重、缓存 Key | 密码存储、安全签名 |
| SHA-1 | 40 位 Hex | 仅遗留系统兼容 | 新项目全面禁用 |
| SHA-256 | 64 位 Hex | 签名摘要、Token、安全完整性 | 密码存储 |
| SHA-512 | 128 位 Hex | 最高安全摘要需求 | 密码存储 |
| HMAC-SHA256 | 64 位 Hex | 接口鉴权、消息认证 | 替代密码哈希 |
| BCrypt | 60 位字符串 | **用户密码存储**（唯一正确选择） | 非密码场景（性能差） |
| Base64（标准） | — | 二进制文本化、HTTP Auth | URL 参数、文件名 |
| Base64（URL-Safe） | — | URL 参数、JWT、Cookie | 需要填充 = 的场景 |