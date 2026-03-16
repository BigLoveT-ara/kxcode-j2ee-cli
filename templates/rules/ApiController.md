---
globs: src/**/*Api.java, src/**/*Controller.java
---
 
# Controller/Api 层编码规范
 
## Spring注入规范
- 优先使用fianl定义变量与`@RequiredArgsConstructor`注解配合使用实现注入

## URL 设计
- 使用 RESTful 风格，**仅允许 `GET` 和 `POST`**，禁止使用 `DELETE`、`PUT`、`PATCH` 等方法
- 类级别 `@RequestMapping` 统一定义为 `/api/v1/<moduleName>`
- URL 命名使用 **snake_case**（如 `/get_user_list`），路径变量可使用 **lowerCamelCase**(如`/{documentId}/get_all_datas`)
 
## 注解规范
- 接口注解只使用 `@PostMapping` 或 `@GetMapping`，并**必须添加** `produces = MediaType.APPLICATION_JSON_VALUE`
- 接收 JSON 参数时必须使用对象接收并添加 `@RequestBody` 注解
- 使用`@PathVariable`注解时必须添加`value`属性定义
 
## 返回值规范
- 所有接口返回值**必须**使用 `com.kxjl.qetesh.common.response.ServiceResponse<T>`
- 禁止直接返回裸对象、Map 或其他自定义包装类,
 
## 接口参数规范
- 如果是支持分页查询Api的参数请使用`com.kxjl.aimp.label.bean.dto.BasePageDTO<T>`,检索的条件方法需要放到泛型对象T中
