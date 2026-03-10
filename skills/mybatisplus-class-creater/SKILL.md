---
name: mybatisplus-class-creater
description: 使用本地工具，基于项目已经创建好的DAO对象，生成service、mapper、api层相关代码
license: MIT
compatibility: Requires mp-class-creater CLI.
metadata:
  author: kxjl
  version: "1.0"
  generatedBy: "1.0.0"
---

创建mybatisplus相关的mapper接口、xml文件、api、service、等文件

可以使用`mp-class-creater -V`判断是否安装工具了，如果没有安装可以使用`npm install -g https://github.com/BigLoveT-ara/mybatisplus-class-creater/archive/refs/heads/main.tar.gz`


**Input**: 已经定义好的实体类所在的文件夹路径，通常在项目的 src/java/main/{basePackage}.bean.dao下面。

**Steps**

1. **向用户确定覆盖逻辑**

- 在生成过程中可能存在已经有的文件会被覆盖的情况，如果希望强制覆盖已有文件需要添加执行指令

2. **扫描并让用户选择需要处理的DAO对象**

-  优先判断项目src/main/java/**/*/bean/dao文件夹下是否有文件，然后将所有类展示为列表给用户选择（支持多选）需要生成的对象. 
-  如果没有找到，请在java下扫描相关类，将找到具有 @TableName注解或者已 DAO结尾的类让用户选择。

3. **执行工具**

- 执行`mp-class-creater generate <daoClassFilePath> <options>`生成文件, daoClassFilePath就是上述步骤中选择的文件()
- 该指令仅支持单个文件的调用，所以在用户选择多个文件的时候请重复调用。 
- options 如下

| 参数                      | 类型 | 必填 | 默认值 | 说明 |
|-------------------------|------|------|--------|------|
| `<input>`               | string | 是 | - | 输入的 Java 文件或目录路径 |
| `-a, --author <author>` | string | 否 | `Auto Generated` | 作者名 |
| `--no-mapper`           | boolean | 否 | false | 不生成 Mapper 接口 |
| `--no-service`          | boolean | 否 | false | 不生成 Service 接口 |
| `--no-api`              | boolean | 否 | false | 不生成 Controller 类 |
| `--overwrite`           | boolean | 否 | false | 覆盖已存在的文件 |


4. **迁移与验证**
   文件生成后可能路径不是希望的路径，需要根据项目真实路径进行迁移
   文件生成完成后需要进行build，来判断生成的代码是否能够编译通过