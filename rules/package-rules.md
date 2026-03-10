# 包路径以及相关存放内容

com.example.project (root)
├── Application.java
├── common
│   ├── enums
│   ├── utils
│   ├── properties
│   └── Constants.java
├── core
│   ├── config
│   ├── task
│   ├── filter
│   └── listener
├── bean
│   ├── dao
│   ├── dto
│   ├── vo
│   └── pojo
├── service
│   ├── impl
│   └── (interfaces directly in service)
├── mapper
├── api
└── mvc

说明：

根包下直接放置 Spring Boot 启动类。
common 包存放公共工具类、配置属性类、枚举类及常量。
core 包存放框架配置、多线程任务、过滤器、监听器等核心支撑组件，三方能力的调用也可以写在这个下面。
bean 包下按对象类型细分为 dao、dto、vo、pojo 等子包。
service 包存放业务接口，service.impl 存放接口的实现类。
mapper 包存放 ORM 框架（如 MyBatis）的数据持久层接口。
api 包存放对外提供的 API 接口（如 RESTful 接口）。
mvc 包存放处理页面请求的控制器（如 Spring MVC 的 Controller）。