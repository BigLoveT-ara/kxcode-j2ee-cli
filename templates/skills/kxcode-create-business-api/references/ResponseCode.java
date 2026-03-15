package com.kxjl.qetesh.common.response;

/**
 * ResponseCode的接口，供ServiceResponse使用。
 * 提供code编码和Msg内容
 *
 * @author: yhsu
 * @createDate: 2020/6/20/020 15:58
 */
public interface ResponseCode {



    /**
     * 获取Code编码
     *
     * @return 错误编码
     */
    int getCode();

    /**
     * 获取 提示信息
     *
     * @return 提示信息
     */
    String getMsg();

}
