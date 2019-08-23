export interface XEAjaxRequest<T> {
  url?: string;
  baseURL?: string;
  origin?: string;
  method?: string;
  params?: any;
  body?: any;
  bodyType?: string | 'json-data' | 'form-data';
  mode?: string;
  cache?: string;
  credentials?: string;
  redirect?: string;
  referrer?: string;
  referrerPolicy?: string;
  keepalive?: string;
  integrity?: string;
  jsonp?: string;
  jsonpCallback?: string;
  timeout?: number;
  headers?: Headers | object;
  transformParams?: (params: any) => any;
  paramsSerializer?: (params: any) => string;
  transformBody?: (body: any) => any;
  stringifyBody?: (body: any) => any;
  validateStatus?: (response: Response) => boolean;
}

export interface XEAjaxResponseSchema<T> {
  data: any;
  status: number;
  statusText: string;
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
      request: XEAjaxRequest<any>,
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
      response: Response,
      next: (resp?: object) => void,
      request?: XEAjaxRequest<any>
    ) => void,
    onRejectd?: (
      error: TypeError,
      next: (resp?: object) => void,
      request?: XEAjaxRequest<any>
    ) => void
  ): void;
}

export interface XEAjaxMethods {
  version: string;
  use(plugin: (XEAjax: any) => void): void;

  /**
   * 设置全局参数
   * @param options 全局参数
   */
  setup(options: XEAjaxRequest<any>): void;

  /**
   * 允许用您自己的实用函数扩展到 XEAjax
   * @param methods 扩展函数集
   */
  mixin(methods: object): void;

  /**
   * 将表单序列化为可以在 Ajax 请求中发送到服务器的查询字符串。
   * @param params 表单参数
   */
  serialize(params: object): string;

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
  AbortController: AbortController;

  /**
   * @param options 请求参数
   */
  ajax(options: XEAjaxRequest<any>): Promise<Response>;

  /**
   * doAll 使用对象参数, 用法和 Promise.all 一致
   * @param iterable 对象数组 或 Promise 数组
   */
  doAll(iterable: (object | Promise<any>)[]): Promise<any[]>;

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
}

/**
 * Using the Fetch API,Support the Node.js and browser environment.
 */
declare var XEAjax: XEAjaxMethods;

export default XEAjax;