import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Stack;

import lombok.Getter;
import lombok.Setter;

/**
 * @author yuzhong
 * @date 2022-12-30
 */
@Getter
@Setter
public class BrainSessionDTO {
	/**
	 * 通话uuid
	 */
	private String calluuid;
	/**
	 * 企业id
	 */
	private String businessId;
	/**
	 * 企业名称
	 */
	private String businessName;
	/**
	 * 话术id
	 */
	private String speechSkillId;
	/**
	 * 话术名称
	 */
	private String speechSkillName;
	/**
	 * 任务id
	 */
	private String taskId;
	/**
	 * 任务名称
	 */
	private String taskName;
	/**
	 * 任务数据id
	 */
	private String taskDataId;
	/**
	 * 客户id
	 */
	private String customerId;
	/**
	 * 主叫号码
	 */
	private String caller;
	/**
	 * 被叫号码
	 */
	private String callee;
	/**
	 * 客户号码（呼入取主叫号码，呼出取被叫号码）归属地省份
	 */
	private String ownershipProvince;
	/**
	 * 客户号码（呼入取主叫号码，呼出取被叫号码）归属地城市
	 */
	private String ownershipCity;
	/**
	 * 提交类型 0=普通流程 1=预览流程
	 */
	private Integer submitType;
	/**
	 * 预览话术组id
	 */
	private String submitNodeGroupId;
	/**
	 * 预览节点id
	 */
	private String submitNodeId;
	/**
	 * 呼叫方向 1=呼入 2=外呼
	 */
	private Integer direction;
	/**
	 * 发音人
	 */
	private String speaker;
	/**
	 * 语速
	 */
	private String speed;
	/**
	 * 静默坐席会议室 id
	 */
	private String room;
	/**
	 * 驱动名称
	 */
	private String flowName;
	/**
	 * 当前路由点
	 */
	private String currentRP;
	/**
	 * Genesys平台会话id
	 */
	private String gvpSid;
	/**
	 * 原始主叫
	 */
	private String originalAni;
	/**
	 * 原始被叫
	 */
	private String originalDnis;
	/**
	 * 流程发起者
	 */
	private String from;
	/**
	 * 会话开始时间
	 */
	private Long startTime;
	/**
	 * 会话结束时间
	 */
	private Long endTime;
	/**
	 * 结束事件 200=正常结束 201=APP_END触发结束 202=流程转人工结束 500=流程异常结束 501=会话超时结束 502=全局语境异常结束
	 */
	private Integer endEvent;
	/**
	 * 全局变量表
	 */
	private Map<String, String> context;
	/**
	 * 跳转列表
	 */
	private List<Jump> jumpQueue;
	/**
	 * 节点执行追踪器列表
	 */
	private Stack<TraceDTO> traces;
	/**
	 * 脚本日志
	 */
	private StringBuilder jythonLog;
	/**
	 * 标签配置
	 */
	private Map<String, TagSchema> tagSchemaMap;
	/**
	 * 会话标签
	 */
	private List<Tag> tags;

	@lombok.Getter
	@lombok.Setter
	public static class Jump {
		/**
		 * 自定义跳转话术组名称
		 */
		private String nodeGroupName;
		/**
		 * 自定义跳转后场景码切换
		 */
		private String sceneCode;
	}

	@lombok.Getter
	@lombok.Setter
	public static class TagSchema {
		/**
		 * 标签组id
		 */
		private String id;
		/**
		 * 标签组名称
		 */
		private String name;
		/**
		 * 标签组code
		 */
		private String code;
		/**
		 * 标签组contextId
		 */
		private String contextId;
		/**
		 * 最终标签计算逻辑类型 0=取最高优先级 1=取最后命中 2=全部记录
		 */
		private String type;
		/**
		 * 标签map，排序越靠前的优先级越高
		 */
		private LinkedHashMap<String, TagPO> tagPOMap = new LinkedHashMap<>();
	}

	@lombok.Getter
	@lombok.Setter
	public static class TagPO {
		/**
		 * 标签id
		 */
		private String id;
		/**
		 * 标签名称
		 */
		private String label;
		/**
		 * 知识库交互次数标签阈值配置
		 */
		private Map<String, Integer> knowledgeConf = new HashMap<>();
	}

	@lombok.Getter
	@lombok.Setter
	public static class Tag {
		/**
		 * 标签组id
		 */
		private String tagGroupId;
		/**
		 * 标签组名称
		 */
		private String tagGroupName;
		/**
		 * 标签组code
		 */
		private String tagGroupCode;
		/**
		 * 标签组唯一标识
		 */
		private String tagGroupContextId;
		/**
		 * 标签id
		 */
		private String tagId;
		/**
		 * 标签名称
		 */
		private String tagName;
	}
}
