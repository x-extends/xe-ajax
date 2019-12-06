export interface XEAjaxRequest<T> {
  /**
   * 请求地址
   */
  url?: string;
  /**
   * 基础路径
   */
  baseURL?: string;
  /**
   * 改变目标源
   */
  origin?: string;
  /**
   * 请求方法
   */
  method?: string;
  /**
   * 表单查询参数
   */
  params?: any;
  /**
   * 提交主体内容
   */
  body?: any;
  /**
   * 提交主体内容方式，可以设置json-data,form-data
   */
  bodyType?: string | 'json-data' | 'form-data';
  /**
   * 请求的模式, 可以设置cors,no-cors,same-origin
   */
  mode?: string;
  /**
   * 处理缓存方式,可以设置default,no-store,no-cache,reload,force-cache,only-if-cached
   */
  cache?: string;
  /**
   * 设置 cookie 是否随请求一起发送,可以设置: omit,same-origin,include
   */
  credentials?: string;
  /**
   * 重定向模式, 可以设置follow,error,manual
   */
  redirect?: string;
  /**
   * 可以设置no-referrer,client或URL
   */
  referrer?: string;
  /**
   * 可以设置: no-referrer,no-referrer-when-downgrade,origin,origin-when-cross-origin,unsafe-url
   */
  referrerPolicy?: string;
  /**
   * 选项可用于允许请求超过页面的生存时间
   */
  keepalive?: string;
  /**
   * integrity
   */
  integrity?: string;
  /**
   * jsonp入参属性名
   */
  jsonp?: string;
  /**
   * jsonp响应结果的回调函数名
   */
  jsonpCallback?: string;
  /**
   * 设置请求超时
   */
  timeout?: number;
  /**
   * 请求头包含信息
   */
  headers?: any;
  /**
   * 用于改变URL参数
   */
  transformParams?: (params: any) => any;
  /**
   * 自定义URL序列化函数
   */
  paramsSerializer?: (params: any) => string;
  /**
   * 用于改变提交数据
   */
  transformBody?: (body: any) => any;
  /**
   * 自定义转换提交数据的函数
   */
  stringifyBody?: (body: any) => any;
  /**
   * 自定义校验请求是否成功
   */
  validateStatus?: (response: Response) => boolean;
}

export interface XEAjaxResponseSchema<T> {
  /**
   * 响应的数据
   */
  data: any;
  /**
   * 响应的状态码
   */
  status: number;
  /**
   * 响应的状态信息
   */
  statusText: string;
  /**
   * 响应头信息
   */
  headers: any;
}

export interface XEProgress<T> {
  autoCompute: boolean;
  fixed: number;
  meanSpeed: number;
  onDownloadProgress: (event: Event) => any;
  onUploadProgress: (event: Event) => any;
  value: number;
  total: number;
  loaded: number;
}

export interface XERequestInterceptors {
  /**
   * 请求之前拦截器
   * @param resolve 请求发送之前执行
   */
  use(
    resolve: (
      /**
       * Request 对象
       */
      request: XEAjaxRequest<any>,
      /**
       * 继续执行下一个拦截器
       */
      next: () => void
    ) => void
  ): void;
}

export interface XEResponseInterceptors {
  /**
   * 响应之后拦截器
   * @param onRejected 请求完成之后执行
   * @param onRejectd 发生错误之后执行
   */
  use(
    onRejected: (
      /**
       * Response 对象
       */
      response: Response,
      /**
       * 继续执行下一个拦截器
       */
      next: (resp?: any) => void,
      request?: XEAjaxRequest<any>
    ) => void,
    onRejectd?: (
      /**
       * Error 对象
       */
      error: TypeError,
      /**
       * 继续执行下一个拦截器
       */
      next: (resp?: any) => void,
      /**
       * Request 对象
       */
      request?: XEAjaxRequest<any>
    ) => void
  ): void;
}

export interface PluginObject<T> {
  install(xAjax: typeof XEAjax): any;
}

export interface XEAjaxMethods {
  version: string;
  /**
   * 安装插件
   * @param plugin 插件
   * @param options 参数
   */
  use(plugin: PluginObject<any>, ...options: any[]): void;

  /**
   * 设置全局参数
   * @param options 全局参数
   */
  setup(options: XEAjaxRequest<any>): void;

  /**
   * 允许用您自己的实用函数扩展到 XEAjax
   * @param methods 扩展函数集
   */
  mixin(methods: any): void;

  /**
   * 将表单序列化为可以在 Ajax 请求中发送到服务器的查询字符串。
   * @param params 表单参数
   */
  serialize(params: any): string;

  /**
   * 请求之前、响应之后拦截器
   * @since 3.0.0
   */
  interceptors: {
    /**
     * 请求之前拦截器
     */
    request: XERequestInterceptors;
    /**
     * 响应之后拦截器
     */
    response: XEResponseInterceptors;
  };

  /**
   * 上传、下载进度监听
   * @since 3.4.9
   */
  Progress: XEProgress<any>;

  /**
   * 取消控制器
   * @since 3.2.0
   */
  AbortController: typeof AbortController;

  /**
   * @param options 请求参数
   */
  ajax(options: XEAjaxRequest<any>): Promise<Response>;

  /**
   * doAll 使用对象参数, 用法和 Promise.all 一致
   * @param iterable 对象数组 或 Promise 数组
   */
  doAll(iterable: any[]): Promise<any[]>;

  /**
   * 发送 Jsonp 请求，返回一个结果为 Response 的 Promise 对象
   * @param url 请求地址
   * @param params 表单查询参数
   * @param options 可选参数
   */
  fetchJsonp(url: string, params?: any, options?: XEAjaxRequest<any>): Promise<Response>;

  /**
   * 发送 GET 请求，返回一个结果为 Response 的 Promise 对象
   * @param url 请求地址
   * @param params 表单查询参数
   * @param options 可选参数
   */
  fetchGet(url: string, params?: any, options?: XEAjaxRequest<any>): Promise<Response>;

  /**
   * 发送 POST 请求，返回一个结果为 Response 的 Promise 对象
   * @param url 请求地址
   * @param body 表单提交参数
   * @param options 可选参数
   */
  fetchPost(url: string, body?: any, options?: XEAjaxRequest<any>): Promise<Response>;

  /**
   * 发送 PUT 请求，返回一个结果为 Response 的 Promise 对象
   * @param url 请求地址
   * @param body 表单提交参数
   * @param options 可选参数
   */
  fetchPut(url: string, body?: any, options?: XEAjaxRequest<any>): Promise<Response>;

  /**
   * 发送 DELETE 请求，返回一个结果为 Response 的 Promise 对象
   * @param url 请求地址
   * @param options 可选参数
   */
  fetchDelete(url: string, options?: XEAjaxRequest<any>): Promise<Response>;

  /**
   * 发送 PATCH 请求，返回一个结果为 Response 的 Promise 对象
   * @param url 请求地址
   * @param options 可选参数
   */
  fetchPatch(url: string, options?: XEAjaxRequest<any>): Promise<Response>;

  /**
   * 发送 HEAD 请求，返回一个结果为 Response 的 Promise 对象
   * @param url 请求地址
   * @param options 可选参数
   */
  fetchHead(url: string, options?: XEAjaxRequest<any>): Promise<Response>;

  /**
   * 发送请求，返回一个结果为 Response 的 Promise 对象
   * @param url 请求地址
   * @param options 可选参数
   */
  fetch(url: string, options?: XEAjaxRequest<any>): Promise<Response>;

  /**
   * 发送 Jsonp 请求，返回一个包含响应信息的 Peomise 对象
   * @param url 请求地址
   * @param params 表单查询参数
   * @param options 可选参数
   * @since 3.4.0
   */
  doJsonp(url: string, params?: any, options?: XEAjaxRequest<any>): Promise<XEAjaxResponseSchema<any>>;

  /**
   * 发送 GET 请求，返回一个包含响应信息的 Peomise 对象
   * @param url 请求地址
   * @param params 表单查询参数
   * @param options 可选参数
   * @since 3.4.0
   */
  doGet(url: string, params?: any, options?: XEAjaxRequest<any>): Promise<XEAjaxResponseSchema<any>>;

  /**
   * 发送 POST 请求，返回一个包含响应信息的 Peomise 对象
   * @param url 请求地址
   * @param body 表单提交参数
   * @param options 可选参数
   * @since 3.4.0
   */
  doPost(url: string, body?: any, options?: XEAjaxRequest<any>): Promise<XEAjaxResponseSchema<any>>;

  /**
   * 发送 PUT 请求，返回一个包含响应信息的 Peomise 对象
   * @param url 请求地址
   * @param body 表单提交参数
   * @param options 可选参数
   * @since 3.4.0
   */
  doPut(url: string, body?: any, options?: XEAjaxRequest<any>): Promise<XEAjaxResponseSchema<any>>;

  /**
   * 发送 DELETE 请求，返回一个包含响应信息的 Peomise 对象
   * @param url 请求地址
   * @param options 可选参数
   * @since 3.4.0
   */
  doDelete(url: string, options?: XEAjaxRequest<any>): Promise<XEAjaxResponseSchema<any>>;

  /**
   * 发送 PATCH 请求，返回一个包含响应信息的 Peomise 对象
   * @param url 请求地址
   * @param options 可选参数
   * @since 3.4.0
   */
  doPatch(url: string, options?: XEAjaxRequest<any>): Promise<XEAjaxResponseSchema<any>>;

  /**
   * 发送 HEAD 请求，返回一个包含响应信息的 Peomise 对象
   * @param url 请求地址
   * @param options 可选参数
   * @since 3.4.0
   */
  doHead(url: string, options?: XEAjaxRequest<any>): Promise<XEAjaxResponseSchema<any>>;

  /**
   * 发送 Jsonp 请求，返回响应结果为 JSON 的 Peomise 对象
   * @param url 请求地址
   * @param params 表单查询参数
   * @param options 可选参数
   */
  jsonp(url: string, params?: any, options?: XEAjaxRequest<any>): Promise<any>;

  /**
   * 发送 GET 请求，返回响应结果为 JSON 的 Peomise 对象
   * @param url 请求地址
   * @param params 表单查询参数
   * @param options 可选参数
   */
  getJSON(url: string, params?: any, options?: XEAjaxRequest<any>): Promise<any>;

  /**
   * 发送 POST 请求，返回响应结果为 JSON 的 Peomise 对象
   * @param url 请求地址
   * @param body 表单提交参数
   * @param options 可选参数
   */
  postJSON(url: string, body?: any, options?: XEAjaxRequest<any>): Promise<any>;

  /**
   * 发送 PUT 请求，返回响应结果为 JSON 的 Peomise 对象
   * @param url 请求地址
   * @param body 表单提交参数
   * @param options 可选参数
   */
  putJSON(url: string, body?: any, options?: XEAjaxRequest<any>): Promise<any>;

  /**
   * 发送 DELETE 请求，返回响应结果为 JSON 的 Peomise 对象
   * @param url 请求地址
   * @param options 可选参数
   */
  deleteJSON(url: string, options?: XEAjaxRequest<any>): Promise<any>;

  /**
   * 发送 PATCH 请求，返回响应结果为 JSON 的 Peomise 对象
   * @param url 请求地址
   * @param options 可选参数
   */
  patchJSON(url: string, options?: XEAjaxRequest<any>): Promise<any>;

  /**
   * 发送 HEAD 请求，返回响应结果为 JSON 的 Peomise 对象
   * @param url 请求地址
   * @param options 可选参数
   */
  headJSON(url: string, options?: XEAjaxRequest<any>): Promise<any>;
  
  /**
   * 发送 GET 请求，返回响应结果为 JSON 的 Peomise 对象
   * @param url 请求地址
   * @param params 表单查询参数
   * @param options 可选参数
   */
  get(url: string, params?: any, options?: XEAjaxRequest<any>): Promise<any>;

  /**
   * 发送 POST 请求，返回响应结果为 JSON 的 Peomise 对象
   * @param url 请求地址
   * @param body 表单提交参数
   * @param options 可选参数
   */
  post(url: string, body?: any, options?: XEAjaxRequest<any>): Promise<any>;

  /**
   * 发送 PUT 请求，返回响应结果为 JSON 的 Peomise 对象
   * @param url 请求地址
   * @param body 表单提交参数
   * @param options 可选参数
   */
  put(url: string, body?: any, options?: XEAjaxRequest<any>): Promise<any>;

  /**
   * 发送 DELETE 请求，返回响应结果为 JSON 的 Peomise 对象
   * @param url 请求地址
   * @param options 可选参数
   */
  delete(url: string, options?: XEAjaxRequest<any>): Promise<any>;

  /**
   * 发送 PATCH 请求，返回响应结果为 JSON 的 Peomise 对象
   * @param url 请求地址
   * @param options 可选参数
   */
  patch(url: string, options?: XEAjaxRequest<any>): Promise<any>;

  /**
   * 发送 HEAD 请求，返回响应结果为 JSON 的 Peomise 对象
   * @param url 请求地址
   * @param options 可选参数
   */
  head(url: string, options?: XEAjaxRequest<any>): Promise<any>;
}

/**
 * 异步请求库，用于浏览器和 node.js 的 HTTP 客户端
 */
declare var XEAjax: XEAjaxMethods;

export default XEAjax;