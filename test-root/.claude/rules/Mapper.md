---
globs: src/**/mapper/**/*.java, src/**/mapper/**/*.xml, src/**/*Mapper.java, src/**/*Mapper.xml
---
 
# 数据持久层编码规范
 
## BaseMapper 优先原则
- 根据 ID 查询、单表条件查询、单表更新、单表删除、主键删除等操作，**必须优先使用 `BaseMapper` 中的内置方法**
- 方法速查表见 `docs/framework/mybatisplus-method.md`，编写前须读取确认
 
## Mapper XML 规范
- `*Mapper.xml` 中编写 SQL 时，**输出字段必须最小化**，禁止 `SELECT *`，不得查询未使用的字段
- **禁止**在 `*Mapper.xml` 中定义 DAO 对象的 `ResultMap`，使用框架自动映射即可
 
## 级联查询规范
- **1:1 关联查询**：在主表对应的 `*Mapper.xml` 中编写显式 SQL 实现
- **1:N 关联查询**：在 `Service` 方法中拆分为两次独立查询（一次主表、一次子表），再在代码中完成对象封装；禁止在 XML 中用嵌套查询实现