---
paths: "**/*ServiceImpl.{java}"
desc: 业务层需要对数据库进行操作时，可以参考该文档进行API速查
---

# BaseMapper 对象操作方法速查

| 方法名                             | 描述                                                         |
| :--------------------------------- | :----------------------------------------------------------- |
| insert(obj)                        | 插入一条记录                                                 |
| deleteById(seri)                   | 根据 ID 删除                                                 |
| deleteById(obj, bool)              | 根据 ID 删除，支持逻辑删除填充                               |
| deleteById(obj)                    | 根据实体(ID)删除                                             |
| deleteByMap(map)                   | 根据 columnMap 条件，删除记录                                |
| delete(wrapper)                    | 根据 entity 条件，删除记录                                   |
| deleteBatchIds(coll)               | 删除（根据ID或实体 批量删除）【已废弃】                      |
| deleteByIds(coll)                  | 删除（根据ID或实体 批量删除）                                |
| deleteByIds(coll, bool)            | 删除（根据ID或实体 批量删除），逻辑删除下是否填充            |
| updateById(obj)                    | 根据 ID 修改                                                 |
| update(obj, wrapper)               | 根据 whereEntity 条件，更新记录                              |
| update(wrapper)                    | 根据 Wrapper 更新记录（无法自动填充）                        |
| selectById(seri)                   | 根据 ID 查询                                                 |
| selectByIds(coll)                  | 查询（根据ID 批量查询）                                      |
| selectBatchIds(coll)               | 查询（根据ID 批量查询）【已废弃】                            |
| selectByIds(coll, handler)         | 查询（根据ID 批量查询），使用结果处理器                      |
| selectBatchIds(coll, handler)      | 查询（根据ID 批量查询），使用结果处理器【已废弃】            |
| selectByMap(map)                   | 查询（根据 columnMap 条件）                                  |
| selectByMap(map, handler)          | 查询（根据 columnMap 条件），使用结果处理器                  |
| selectOne(wrapper)                 | 根据 entity 条件，查询一条记录                               |
| selectOne(wrapper, bool)           | 根据 entity 条件，查询一条记录，指定是否抛异常               |
| exists(wrapper)                    | 根据 Wrapper 条件，判断是否存在记录                          |
| selectCount(wrapper)               | 根据 Wrapper 条件，查询总记录数                              |
| selectList(wrapper)                | 根据 entity 条件，查询全部记录                               |
| selectList(wrapper, handler)       | 根据 entity 条件，查询全部记录，使用结果处理器               |
| selectList(page, wrapper)          | 根据 entity 条件，查询全部记录（并翻页）                     |
| selectList(page, wrapper, handler) | 根据 entity 条件，查询全部记录（并翻页），使用结果处理器     |
| selectMaps(wrapper)                | 根据 Wrapper 条件，查询全部记录（返回 Map 列表）             |
| selectMaps(wrapper, handler)       | 根据 Wrapper 条件，查询全部记录（返回 Map 列表），使用结果处理器 |
| selectMaps(page, wrapper)          | 根据 Wrapper 条件，查询全部记录（并翻页，返回 Map 列表）     |
| selectMaps(page, wrapper, handler) | 根据 Wrapper 条件，查询全部记录（并翻页，返回 Map 列表），使用结果处理器 |
| selectObjs(wrapper)                | 根据 Wrapper 条件，查询全部记录（只返回第一个字段的值）      |
| selectObjs(wrapper, handler)       | 根据 Wrapper 条件，查询全部记录（只返回第一个字段的值），使用结果处理器 |
| selectPage(page, wrapper)          | 根据 entity 条件，查询全部记录（并翻页），返回分页对象       |
| selectMapsPage(page, wrapper)      | 根据 Wrapper 条件，查询全部记录（并翻页，返回 Map 列表），返回分页对象 |
| insertOrUpdate(obj)                | 主键存在更新记录，否则插入一条记录                           |
| insert(coll)                       | 插入（批量）                                                 |
| insert(coll, int)                  | 插入（批量），指定批次大小                                   |
| updateById(coll)                   | 根据ID 批量更新                                              |
| updateById(coll, int)              | 根据ID 批量更新，指定批次大小                                |
| insertOrUpdate(coll)               | 批量修改或插入                                               |
| insertOrUpdate(coll, int)          | 批量修改或插入，指定批次大小                                 |
| insertOrUpdate(coll, pred)         | 批量修改或插入，使用自定义判断条件                           |
| insertOrUpdate(coll, pred, int)    | 批量修改或插入，使用自定义判断条件和批次大小                 |


# Wrapper的使用
## LambdaQueryWrapper / LambdaUpdateWrapper 使用指南
基于Lambda表达式的条件构造器，提供类型安全的字段引用，避免硬编码字段名，提升代码可维护性。
### LambdaQueryWrapper
用于构建查询条件，通过实体类的getter方法引用字段：

```java
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getName, "张三")
       .like(User::getEmail, "test")
       .ge(User::getAge, 18)
       .orderByDesc(User::getCreateTime);
```
常用方法：eq、ne、gt、ge、lt、le、like、notLike、in、notIn、isNull、isNotNull、between、notBetween、orderByAsc、orderByDesc、last（拼接SQL片段）、exists、notExists等。

### LambdaUpdateWrapper
用于构建更新操作，可设置更新字段和条件：
```java
LambdaUpdateWrapper<User> wrapper = new LambdaUpdateWrapper<>();
wrapper.set(User::getAge, 20)
       .setSql("email = 'test@example.com'")
       .eq(User::getId, 1)
       .like(User::getName, "李");
```
常用方法：set（设置字段值）、setSql（直接拼接SQL片段），以及上述所有条件方法。执行更新时需配合mapper.update方法使用。
注意：UpdateWrapper也可用于删除操作的条件构建。