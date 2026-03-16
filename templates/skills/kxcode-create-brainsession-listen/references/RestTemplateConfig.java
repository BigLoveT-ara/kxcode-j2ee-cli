import com.google.common.base.Charsets;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.client.HttpClient;
import org.apache.http.impl.client.DefaultConnectionKeepAliveStrategy;
import org.apache.http.impl.client.DefaultHttpRequestRetryHandler;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.http.converter.FormHttpMessageConverter;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.DefaultResponseErrorHandler;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * RestTemplate配置类，配置重试次数，超时时间等
 * 类加载时会进行如下 配置项的读取，请保证在项目启动时能够在配置文件或配置中心上配置如下参数
 * （PS：如果没有读取到相关配置，那么会使用各个配置字段的默认值）
 * <p>
 * 配置项名称：spring.resttemplate.connect-time-out  默认值:500  单位:ms  描述:http请求的连接超时时
 * 配置项名称：spring.resttemplate.connect-max-wait  默认值:200  单位:ms  描述:http请求连接不够时的最大等待时间
 * 配置项名称：spring.resttemplateread-time-out      默认值:3000 单位:ms  描述:等待Response返回的最大时间
 * 配置项名称：spring.resttemplate.retry-times       默认值:0    单位:次  描述:失败时的重试次数 0代表不进行重试
 * <p>
 * * @author: yhsu
 * * @createDate: 2020/6/18/018 14:51
 */
@Configuration
@Slf4j
public class RestTemplateConfig {

    private static RestTemplate restTemplate;

    @Value("${spring.resttemplate.connect-time-out:500}")
    private int connectTimeOut;

    @Value("${spring.resttemplate.connect-max-wait:200}")
    private int connectMaxWaitTime;

    @Value("${spring.resttemplate.read-time-out:3000}")
    private int readTimeOut;

    @Value("${spring.resttemplate.retry-times:0}")
    private int retryTimes;

    @Bean
    public RestTemplate restTemplate(ClientHttpRequestFactory factory) {
        // 添加内容转换器
        if (log.isDebugEnabled()) {
            log.debug("RestTemplate 参数配置完成 connectTimeOut:{},connectMaxWaitTime:{},readTimeOut:{},retryTimes:{}", connectTimeOut, connectMaxWaitTime, readTimeOut, retryTimes);
        }
        List<HttpMessageConverter<?>> messageConverters = new ArrayList<>();
        messageConverters.add(new StringHttpMessageConverter(Charsets.UTF_8));
        messageConverters.add(new FormHttpMessageConverter());
        messageConverters.add(new MappingJackson2HttpMessageConverter());
        restTemplate = new RestTemplate(messageConverters);
        restTemplate.setRequestFactory(factory);
        restTemplate.setErrorHandler(new DefaultResponseErrorHandler());
        return restTemplate;
    }


    @Bean
    public ClientHttpRequestFactory simpleClientHttpRequestFactory() {
        // 长连接保持30秒
        PoolingHttpClientConnectionManager pollingConnectionManager = new PoolingHttpClientConnectionManager(30, TimeUnit.SECONDS);
        // 总连接数
        pollingConnectionManager.setMaxTotal(1000);
        // 同路由的并发数
        pollingConnectionManager.setDefaultMaxPerRoute(1000);

        HttpClientBuilder httpClientBuilder = HttpClients.custom();
        httpClientBuilder.setConnectionManager(pollingConnectionManager);
        // 重试次数，默认是3次，没有开启
        if (retryTimes > 0) {
            httpClientBuilder.setRetryHandler(new DefaultHttpRequestRetryHandler(retryTimes, true));
        }
        // 保持长连接配置，需要在头添加Keep-Alive
        httpClientBuilder.setKeepAliveStrategy(new DefaultConnectionKeepAliveStrategy());
        //这些地方是配置默认的Header信息，如果不需要不用打开
        //List<Header> headers = new ArrayList<>();
        //headers.add(new BasicHeader("Accept-Encoding", "gzip,deflate"));
        //headers.add(new BasicHeader("Accept-Language", "zh-CN"));
        //headers.add(new BasicHeader("Connection", "Keep-Alive"));

        //httpClientBuilder.setDefaultHeaders(headers);

        HttpClient httpClient = httpClientBuilder.build();

        // httpClient连接配置，底层是配置RequestConfig
        HttpComponentsClientHttpRequestFactory clientHttpRequestFactory = new HttpComponentsClientHttpRequestFactory(httpClient);
        // 连接超时
        clientHttpRequestFactory.setConnectTimeout(connectTimeOut);
        // 数据读取超时时间，即SocketTimeout
        clientHttpRequestFactory.setReadTimeout(readTimeOut);
        // 连接不够用的等待时间，不宜过长，必须设置，比如连接不够用时，时间过长将是灾难性的
        clientHttpRequestFactory.setConnectionRequestTimeout(connectMaxWaitTime);
        // 缓冲请求数据，默认值是true。通过POST或者PUT大量发送数据时，建议将此属性更改为false，以免耗尽内存。
        clientHttpRequestFactory.setBufferRequestBody(false);
        return clientHttpRequestFactory;
    }

}
