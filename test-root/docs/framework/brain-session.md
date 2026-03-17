---
paths: "**/*.{java}"
desc: Ptah电话机器人平台的对话详情交互参数详情
---

# 相关对象的定义与使用

`qetesh-commons`的jar包中对交互中使用到的数据结构对象进行了定义和封装，在使用这jar包的前提下可直接使用对应类进行

# 交互详情

请求参数结构和含义如下（已JSON类型展示，对象类型的请自行对比，对应java类为`BrainSessionDTO`）
```json
{
    "calluuid": "583ceeec-3593-11ed-a8cb-a75c84759a56", //Ptah电话机器人平台会话唯一标识
    "businessId": "0", //Ptah电话机器人平台企业主键
    "businessName": "xxxx",//Ptah电话机器人平台企业名称
    "speechSkillId": "0",//Ptah电话机器人平台流程话术id
    "speechSkillName": "xxxx",//Ptah电话机器人平台流程话术名称
    "input":"xxxxxx",//本节点用户的输入（非必填）
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
            "tags": [            //本次跟踪记录中节点的标签命中情况
                {
                    "tagGroupContextId": "971ddd82-8bdd-43ce-b9eb-66aa51fa7540",
                    "tagId": "fec313a4-a899-4ff8-a7de-e69cefe01574"
                }
            ],
            "index": 0, //跟踪记录序号
            "command": { //节点指令详情
                "type": "CollectVoiceCommand",   //指令类型
                "description": "你已经告诉我们好分期你要还款多少次了，你怎么还没有还，什么情况啊？\n\n" //指令内容
            },
            "event": "COLLECT_COMPLETE",
            "content": "转人工",//人机交互，用户输入内容
            "contentId": "46c09gfIc1f71a0d13ac00s",////人机交互，用户输入内容的id
            "contentMode": "voice",//人机交互，用户输入类型
            "playBeginTime": 1663314247553,//人机交互，机器人开始播报时间
            "playEndTime": 1663314252433,//人机交互，机器人结束播报时间
            "speakBeginTime": 1663314253713,//人机交互，用户开始回答时间
            "speakEndTime": 1663314256033,//人机交互，用户结束回答时间
            "interrupt": false,//人机交互，用户是否打断机器人播报
            "traceType": "NodeTrace" //交互跟踪类型（节点跟踪NodeTrace、大模型回复节点LMRespondTrace、回答命中情况跟踪节点LinkTrace）
        },
        {
            "nodeGroupId": "4936", //节点组id
            "nodeGroupName": "xx", //节点组名称
            "id": "judge_node_8b58ae4f-", //回答节点id
            "name": "需求人工客服", //回答节点名称
            "type": "ExpressionLink", //回答节点类型（）
            "tags": [], //本节点命中的标签情况
            "customJump": false, //节点类型是否为用户自定义跳转
            "judge": true,  //是否跳转
            "traceType": "LinkTrace" //跟踪类型（回答命中情况跟踪节点）
        }
      
    ],
    "tags": [         //整通会话命中的标签情况
        {
            "tagGroupId": "1925",  //标签组id
            "tagGroupName": "标签", //标签组名称
            "tagGroupCode": "默认标签组", //标签组编码
            "tagGroupContextId": "971ddd82-8bdd-43ce-b9eb-66aa51fa7540",
            "tagId": "fec313a4-a899-4ff8-a7de-e69cefe01574", //标签id
            "tagName": "无应答" //标签名称
        }
      
    ]
}
```
| 字段 | 类型 | 描述 |
|------|------|------|
| calluuid | string | Ptah电话机器人平台会话唯一标识 |
| businessId | string | Ptah电话机器人平台企业主键 |
| businessName | string | Ptah电话机器人平台企业名称 |
| speechSkillId | string | Ptah电话机器人平台流程话术id |
| speechSkillName | string | Ptah电话机器人平台流程话术名称 |
| input | string | 本节点用户的输入（非必填） |
| taskId | string | 外呼任务ID |
| taskDataId | string | 外呼数据ID |
| caller | string | 主叫号码 |
| callee | string | 被叫号码 |
| submitType | number | 提交类型 |
| direction | number | 呼叫方向 |
| speaker | string | 发音人参数 |
| speed | string | 发音人语速 |
| originalAni | string | 原始主叫 |
| originalDnis | string | 原始被叫 |
| startTime | number | 会话开始日期（毫秒时间戳） |
| endTime | number | 会话结束时间（毫秒时间戳） |
| endEvent | number | 结束事件代码（示例值为202） |
| context | object | 上下文变量，使用key-value存储 |
| traces | array | 从会话开始到现在的跟踪记录（包含所有交互参数详情） |
| traces[].nodeGroupId | string | 节点组ID |
| traces[].nodeGroupName | string | 话术节点组名称 |
| traces[].id | string | 话术节点id |
| traces[].name | string | 话术节点名称 |
| traces[].type | string | 节点类型（例如VoiceNode、ExpressionLink等） |
| traces[].tags | array | 本次跟踪记录中节点的标签命中情况 |
| traces[].tags[].tagGroupContextId | string | 标签组上下文ID |
| traces[].tags[].tagId | string | 标签ID |
| traces[].index | number | 跟踪记录序号 |
| traces[].command | object | 节点指令详情 |
| traces[].command.type | string | 指令类型（例如CollectVoiceCommand） |
| traces[].command.description | string | 指令内容 |
| traces[].event | string | 事件类型（例如COLLECT_COMPLETE） |
| traces[].content | string | 人机交互，用户输入内容 |
| traces[].contentId | string | 人机交互，用户输入内容的id |
| traces[].contentMode | string | 人机交互，用户输入类型（例如voice） |
| traces[].playBeginTime | number | 人机交互，机器人开始播报时间（毫秒时间戳） |
| traces[].playEndTime | number | 人机交互，机器人结束播报时间（毫秒时间戳） |
| traces[].speakBeginTime | number | 人机交互，用户开始回答时间（毫秒时间戳） |
| traces[].speakEndTime | number | 人机交互，用户结束回答时间（毫秒时间戳） |
| traces[].interrupt | boolean | 人机交互，用户是否打断机器人播报 |
| traces[].traceType | string | 交互跟踪类型（节点跟踪NodeTrace、大模型回复节点LMRespondTrace、回答命中情况跟踪节点LinkTrace） |
| traces[].customJump | boolean | （可能仅在LinkTrace中出现）节点类型是否为用户自定义跳转 |
| traces[].judge | boolean | （可能仅在LinkTrace中出现）是否跳转 |
| tags | array | 整通会话命中的标签情况 |
| tags[].tagGroupId | string | 标签组id |
| tags[].tagGroupName | string | 标签组名称 |
| tags[].tagGroupCode | string | 标签组编码 |
| tags[].tagGroupContextId | string | 标签组上下文ID |
| tags[].tagId | string | 标签id |
| tags[].tagName | string | 标签名称 |


# 常见的数据需求的解析方式

## 完整的人机输入输出对话内容
 - 遍历`traces`节点中traceType=="NodeTrace"的节点其中command属性的description字段为机器人输出内容，content为用户输入内容

