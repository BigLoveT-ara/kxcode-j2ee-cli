---
globs: src/**/*Service.java, src/**/*ServiceImpl.java
---
 
# Service 层编码规范

## Spring注入规范
- 优先使用final定义变量与`@RequiredArgsConstructor`注解配合使用实现注入
 
## 继承与实现约束
- **禁止**在 `*Service.java` 或 `*ServiceImpl.java` 中继承或实现 MyBatis-Plus 的 `IService` 及其相关接口
 
## 事务规范
- Service 层方法中凡涉及数据库**增、删、改**操作，必须添加 `@Transactional` 注解
 
## 返回值规范
- Service 层方法返回值统一使用 `com.kxjl.qetesh.common.response.ServiceResponse<T>`
 
## 参数校验
- 接收到的参数必须根据业务进行**非空校验**，不得直接使用未校验的入参
 
## 异常处理
- Service 层方法体必须使用 `try-catch` 包裹，catch 中**打印详细错误日志**并返回 `ServiceResponse` 错误响应
- 禁止吞掉异常（空 catch）或仅打印堆栈而不返回响应
 
## 持久层方法使用规范
- 根据ID查询、单表条件、单表更新、单表删除、逐渐删除等数据操作使用`*Mapper`中的相关方法，方法速查表在`docs/framework/mybatisplus-method.md`中，需要的时候可以查看。
- 使用`selectById`方法时，如果对象中又逻辑删除字段，不需要特殊指定，使用框架内置处理即可。

## 分页查询规范
分页查询统一使用以下模式，不得自行封装其他分页方式：
 
```java
public IPage<XxxDAO> getPagedList(PageParamsDTO<XxxDAO> page) {
    IPage<XxxDAO> iPage = new Page<>(page.getCurrent(), page.getSize());
    LambdaQueryWrapper<XxxDAO> queryWrapper = new LambdaQueryWrapper<>();
    // 固定条件
    queryWrapper.eq(XxxDAO::getBizId, AuthUtils.getCurrentBizId());
    // 动态条件（来自 page.getSearch()）
    if (Objects.nonNull(page.getSearch())) {
        XxxDAO search = page.getSearch();
        // 按需添加条件...
    }
    return xxxMapper.selectPage(iPage, queryWrapper);
}
```

## 