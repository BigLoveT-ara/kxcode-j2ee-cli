/**
 * 
 */
package com.kxjl.qetesh.dto;

import java.util.List;

import com.kxjl.qetesh.dto.BrainSessionDTO.Tag;

import lombok.Getter;
import lombok.Setter;

/**
 * @author yuzhong
 * @date 2022-12-30
 */
@Getter
@Setter
public class TraceDTO {
	private String traceType;// 交互节点类型枚举，NodeTrace/LinkTrace
	private String nodeGroupId;// 话术组id
	private String nodeGroupName;// 话术组名称
	private String id;// 节点or出口id
	private String name;// 节点or出口名称
	private String type;// 节点or出口类型
	private String alias;// 节点or出口别名
	private List<Tag> tags;// 节点or出口标签

	private Integer index;// 节点当前执行次数
	private String sceneCode;// 场景码
	private String command;// 节点命令
	private String event;// 节点事件
	private String content;// 收集内容
	private String contentId;// 收集内容id
	private String contentMode;// 收集内容模式 voice/key
	private Long playBeginTime;// 放音开始时间戳
	private Long playEndTime;// 放音结束时间戳
	private Long speakBeginTime;// 用户说话开始时间戳
	private Long speakEndTime;// 用户说话结束时间戳
	private Boolean interrupt;// 放音是否有被打断

	private boolean customJump;// 出口是否自定义跳转
	private boolean judge;// 出口是否命中
}
