---
paths: "**/*.{java}"
desc: Ptah电话机器人平台的对话详情交互参数详情
---

# 相关对象的定义与使用

`qetesh-commons`的jar包中对交互中使用到的数据结构对象进行了定义和封装，在使用这jar包的前提下可直接使用对应类进行

# 交互详情

对应java类为`com.kxjl.qetesh.dto.BrainSessionDTO`
请求参数结构和含义如下（已JSON类型展示，对象类型的请自行对比）
```json
{
    "calluuid": "583ceeec-3593-11ed-a8cb-a75c84759a56", //Ptah电话机器人平台会话唯一标识
    "businessId": "0", //Ptah电话机器人平台企业主键
    "businessName": "xxxx",//Ptah电话机器人平台企业名称
    "speechSkillId": "0",//Ptah电话机器人平台流程话术id
    "speechSkillName": "xxxx",//Ptah电话机器人平台流程话术名称
    "taskId": "",//外呼任务ID
    "taskDataId": "",//外呼数据ID
    "caller": "xxxx",//主叫号码
    "callee": "xxxx",//被叫号码
    "submitType": 0,//提交类型
    "direction": 1,//呼叫方向
    "speaker": "65580-2",//发音人参数
    "speed": "0",//发音人语速
    "originalAni": "15308624958",//原始主叫
    "originalDnis": "69101338",//原始被叫
    "startTime": 1663314247541,//会话开始日期
    "endTime": 1663314262402,//会话结束时间
    "endEvent": 202,
    "context": {},//上下文变量，使用key-value存储
    "traces": [	//从会话开始到现在的跟踪记录（包含所有交互参数详情）
        {
            "nodeGroupId": "4936", 
            "nodeGroupName": "xx",	//话术节点组名称
            "id": "word_node_1ab24bdd-", //话术节点id
            "name": "开场白", //话术节点名称
            "type": "VoiceNode",//节点类型
            "tags": [
                {
                    "tagGroupContextId": "971ddd82-8bdd-43ce-b9eb-66aa51fa7540",
                    "tagId": "fec313a4-a899-4ff8-a7de-e69cefe01574"
                }
            ],
            "index": 0, //序号
            "command": { //节点指令详情
                "type": "CollectVoiceCommand",   //指令类型
                "description": "你已经告诉我们好分期你要还款多少次了，你怎么还没有还，什么情况啊？\n\n" //指令内容
            },
            "event": "COLLECT_COMPLETE",
            "content": "转人工",//人机交互，用户输入内容
            "contentId": "46c09gfIc1f71a0d13ac00s",
            "contentMode": "voice",//人机交互，用户输入类型
            "playBeginTime": 1663314247553,//人机交互，机器人开始播报时间
            "playEndTime": 1663314252433,//人机交互，机器人结束播报时间
            "speakBeginTime": 1663314253713,//人机交互，用户开始回答时间
            "speakEndTime": 1663314256033,//人机交互，用户结束回答时间
            "interrupt": false,//人机交互，用户是否打断机器人播报
            "traceType": "NodeTrace" //交互跟踪类型（节点跟踪、跳转跟踪、链接跟踪）
        },
        {
            "nodeGroupId": "4936",
            "nodeGroupName": "xx",
            "id": "judge_node_8b58ae4f-",
            "name": "需求人工客服",
            "type": "ExpressionLink",
            "tags": [],
            "customJump": false,
            "judge": true,
            "traceType": "LinkTrace"
        }
      
    ],
    "tags": [
        {
            "tagGroupId": "1925",
            "tagGroupName": "标签",
            "tagGroupCode": "默认标签组",
            "tagGroupContextId": "971ddd82-8bdd-43ce-b9eb-66aa51fa7540",
            "tagId": "fec313a4-a899-4ff8-a7de-e69cefe01574",
            "tagName": "无应答"
        }
      
    ]
}
```
中文对照结构如下

| 中文术语 | JSON字段路径 | 数据类型 | 示例值 | 说明 |
|---------|-------------|----------|--------|------|
| **节点相关** | | | | |
| 节点名称 | `traces[i].name` (当 `traceType == "NodeTrace"`) | String | "95059热线" | 节点在话术中配置的名称 |
| 节点别名 | `traces[i].alias` | String | "" | 节点设置的别名 |
| 节点类型 | `traces[i].type` (当 `traceType == "NodeTrace"`) | String | "VoiceNode" | VoiceNode, AgentNode, ButtonNode等 |
| 节点播报内容 | `traces[i].command.description` | String | "您好，欢迎致电..." | 机器人播报给用户的内容 |
| 节点用户回答 | `traces[i].content` | String | "物业上班时间" | 用户回答的内容 |
| 节点是否被打断 | `traces[i].interrupt` | Boolean | true/false | 播报是否被用户打断 |
| 节点执行轮次 | `traces[i].index` | Integer | 0, 1, 2... | 0=首次，1=第二次执行 |
| 节点播报次数 | 统计相同 `id` 的 `NodeTrace` 出现次数 | Integer | 3 | 节点被执行的次数 |
| 话术组名称 | `traces[i].nodeGroupName` | String | "大模型" | 节点所属的话术组 |
| **出口相关** | | | | |
| 出口名称 | `traces[i].name` (当 `traceType == "LinkTrace"`) | String | "成功" | 出口配置的名称 |
| 出口是否命中 | `traces[i].judge` (当 `traceType == "LinkTrace"`) | Boolean | true/false | 出口是否被触发 |
| 出口类型 | `traces[i].type` (当 `traceType == "LinkTrace"`) | String | "DoubleExpressionLink" | 出口的类型 |
| **变量相关** | | | | |
| 变量名称/变量/全局变量 | `context` 对象中的键名 | String | "车牌号码" | 存储数据的变量名 |
| 变量值/变量结果 | `context` 对象中对应键的值 | String | "沪B076HH" | 变量的具体内容 |
| 变量是否为空 | 检查 `context` 中值是否为空字符串或为"未知" | Boolean | true/false | 判断变量是否有值 |