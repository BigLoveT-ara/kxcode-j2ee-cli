import java.util.Collection;
import java.util.Map;

/**
 * 统一接口返回对象
 *
 * @author: yhsu
 * @createDate: 2020/6/18/018 11:06
 */
public class ServiceResponse<T> {

    private int code;

    private String msg;

    private T data;

    private ResponseDataType dataType;

    /**
     * 共有的对象属性集合
     */
    public enum ResponseDataType {
        //data 为T的一个对象
        SINGLE,
        //data 为T的集合对象
        COLLECTION,
        //data为Page的包装对象,
        PAGE,
        //data 为Map对象
        MAP;
    }

    public int getCode() {
        return code;
    }

    public ServiceResponse<T> setCode(int code) {
        this.code = code;
        return this;
    }

    public String getMsg() {
        return msg;
    }

    public ServiceResponse<T> setMsg(String msg) {
        this.msg = msg;
        return this;
    }

    public T getData() {
        return data;
    }

    public ServiceResponse<T> setData(T data) {
        this.data = data;
        return this;
    }

    public ResponseDataType getDataType() {
        return dataType;
    }

    public ServiceResponse<T> setDataType(ResponseDataType dataType) {
        this.dataType = dataType;
        return this;
    }


    /**
     * 构造返回请求
     *
     * @param code 错误码枚举对象
     * @param data 需要返回的数据对象
     * @param <T>  数据对象泛型
     * @return 指定泛型、错误码、错误信息的对象
     */
    public static <T> ServiceResponse<T> build(ResponseCode code, T data) {
        if (data == null) {
            return new ServiceResponse<T>().setCode(code.getCode()).setMsg(code.getMsg());
        }
        if (data instanceof Collection) {
            return new ServiceResponse<T>().setCode(code.getCode()).setMsg(code.getMsg()).setDataType(ResponseDataType.COLLECTION).setData(data);
        }
        if (data instanceof Map) {
            return new ServiceResponse<T>().setCode(code.getCode()).setMsg(code.getMsg()).setDataType(ResponseDataType.MAP).setData(data);
        }
        return new ServiceResponse<T>().setCode(code.getCode()).setMsg(code.getMsg()).setDataType(ResponseDataType.SINGLE).setData(data);
    }


    /**
     * 构建一个无返回数据的请求成功Response对象
     *
     * @return
     * @see com.kxjl.qetesh.common.response.ServiceResponse#buildSuccess(Object)
     */
    public static ServiceResponse buildSuccess() {
        return buildSuccess(null);
    }

    /**
     * 构建一个有返回数据的请求成功Response对象
     *
     * @param data 需要返回的数据对象
     * @param <T>  数据对象泛型
     * @return code为0的成功对象
     * @see com.kxjl.qetesh.common.response.ServiceResponse#build(ResponseCode, Object)
     */
    public static <T> ServiceResponse<T> buildSuccess(T data) {
        return build(BaseCodeEnum.OK, data);
    }

    /**
     * 构建一个无返回数据的请求失败Response对象
     *
     * @return
     * @see com.kxjl.qetesh.common.response.ServiceResponse#build(ResponseCode, Object)
     */
    public static ServiceResponse buildError() {
        return build(BaseCodeEnum.ERROR, null);
    }


    /**
     * 仅通过Code构建一个相关对象
     *
     * @param code Code对象
     * @return
     * @see com.kxjl.qetesh.common.response.ServiceResponse#build(ResponseCode, Object)
     */
    public static ServiceResponse build(ResponseCode code) {
        return build(code, null);
    }


    /**
     * 根据已有的ServiceResponse构造一个新的对象
     *
     * @param response
     * @return
     */
    public static ServiceResponse build(ServiceResponse response) {
        return new ServiceResponse(response.getCode(), response.getMsg());
    }


    /**
     * 根据已有的ServiceResponse构造一个新的不通泛型对象
     *
     * @param response
     * @param clazz
     * @param <T>
     * @return
     */
    public static <T> ServiceResponse<T> build(ServiceResponse response, Class<T> clazz) {
        return new ServiceResponse(response.getCode(), response.getMsg());
    }

    /**
     * 根据字面量定义的Code和Msg构造
     *
     * @param code
     * @param msg
     * @return
     */
    public static ServiceResponse build(int code, String msg) {
        return new ServiceResponse(code, msg);
    }

    /**
     * 判断当前请求是否成功
     *
     * @return
     */
    public boolean success() {
        return this.code == ServiceResponse.OK;
    }


    public ServiceResponse(int code, String msg, T data, ResponseDataType dataType) {
        this.code = code;
        this.msg = msg;
        this.data = data;
        this.dataType = dataType;
    }


    public ServiceResponse() {
    }

    public ServiceResponse(int code, String msg) {
        this.code = code;
        this.msg = msg;
    }

    public static final Integer OK = BaseCodeEnum.OK.getCode();
}
