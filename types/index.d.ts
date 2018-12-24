export interface XEAjaxRequest<T> {
  url?: string;
  baseURL?: string;
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
   * 使用
   * @param resolve 请求发送之前执行
   * @example 
    ```javascript
    XEAjax.interceptors.request.use((request, next) => {
      next()
    })
    ```
   */
  use(
    resolve: (
      request: XEAjaxRequest<any>,
      next: () => void
    ) => void
  );
}

export interface XEResponseInterceptors {
  /**
   * 使用
   * @param onRejected 请求完成之后执行
   * @param onRejectd 发生错误之后执行
   * @example 
    ```javascript
    XEAjax.interceptors.response.use((response, next) => {
      next()
    }, (e, next) => {
      next()
    })
    // 改变响应结果
    XEAjax.interceptors.response.use((response, next) => {
      response.json().then(data => {
        let { status, statusText, headers } = response
        let body = {
          message: status === 200 ? 'success' : 'error',
          result: data
        }
        next({status, statusText, headers, body})
      })
    }, (e, next) => {
      let body = {
        message: 'error',
        result: null
      }
      next({status: 200, body})
    })
    ```
   */
  use(
    onRejected: (
      response: Response,
      next: (resp?: object) => void,
      request?: XEAjaxRequest<any>
    ) => void,
    onRejectd: (
      error: TypeError,
      next: (resp?: object) => void
    ) => void
  );
}

export interface XEAjaxMethods {
  version: string;
  use(plugin: (XEAjax: any) => void): void;

  /**
   * 设置全局参数
   * @param options 全局参数
   * @example 
    ```javascript
    XEAjax.setup({
      baseURL: 'https://xuliangzhan.com',
      bodyType: 'json-data',
      credentials: 'include',
      headers: {
        'Accept': 'application/json, text/plain, \*\/\*;'
      },
      validateStatus (response) {
        return response.status >= 200 && response.status < 300
      },
      transformParams (params, request) {
        return params
      },
      paramsSerializer (params, request) {
        return XEAjax.serialize(params)
      }，
      transformBody (body, request) {
        return body
      },
      stringifyBody (body, request) {
        return JSON.stringify(body)
      }
    })
    ```
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
   * @example 
    ```javascript
    let param = XEAjax.serialize({id: 1, name: 'u2'})
    // 'id=1&name=u2'
    ```
   */
  serialize(params: object): string;

  /**
   * 请求之前、响应之后拦截器
   * @since 3.0.0
   * @example 
    ```javascript
    // 请求之前
    XEAjax.interceptors.request.use((request, next) => {
      next()
    })
    // 响应之后
    XEAjax.interceptors.response.use((response, next) => {
      next()
    }, (e, next) => {
      next()
    })
    ```
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
   * @example 
    ```javascript
    let progress = new XEAjax.Progress()
      progress.onUploadProgress = evnt => {
        console.log(`进度：${progress.value}%`)
      }
      var file = document.querySelector('#myFile').files[0]
      var formBody = new FormData()
      formBody.append('file', file)
      XEAjax.fetchPost('/api/upload', formBody, {progress})
    ```
   */
  Progress: XEProgress<any>;

  /**
   * 取消控制器
   * @since 3.2.0
   * @example 
    ```javascript
    let controller = new XEAjax.AbortController()
    let signal = controller.signal
    let body = {
      name: 'u111',
      content: '123456'
    }
    XEAjax.fetchPost('/api/test/message/save', body, {signal})
    setTimeout(() => {
      controller.abort()
    }, 50)
    ```
   */
  AbortController: AbortController;

  /**
   * @param options 请求参数
   * @example 
    ```javascript
    XEAjax.ajax({
      url: '/api/test/message/save',
      method: 'POST',
      body: {
        id: 1,
        name: 'u2'
      }
    }).then(response => {
      response.json().then(data => {
          console.log(result.data)
        })
      }).catch(e => {
        console.log(e)
      })
    ```
   */
  ajax(options: XEAjaxRequest<any>): Promise<Response>;

  /**
   * doAll 使用对象参数, 用法和 Promise.all 一致
   * @param iterable 对象数组 或 Promise 数组
   * @example 
    ```javascript
    XEAjax.doAll([
      {
        url: '/api/test/message/list',
        method: 'GET'
      }
    ]).then(datas => {
      // 所有异步完成之后执行
    }).catch(e => {
      console.log(e)
    })
    ```
   */
  doAll(iterable: (object | Promise<any>)[]): Promise<any[]>;

  /**
   * 发送 Jsonp 请求，返回一个结果为 Response 的 Promise 对象
   * @param url 请求地址
   * @param params 表单查询参数
   * @param options 可选参数
   * @example 
    ```javascript
    XEAjax.fetchJsonp('/jsonp/test/message/list')
      .then(response => {
        response.json().then(data => {
          console.log(result.data)
        })
      })
    ```
   */
  fetchJsonp(url: string, params?: any, options?: XEAjaxRequest<any>): Promise<Response>;

  /**
   * 发送 GET 请求，返回一个结果为 Response 的 Promise 对象
   * @param url 请求地址
   * @param params 表单查询参数
   * @param options 可选参数
   * @example 
    ```javascript
    XEAjax.fetchGet('/api/test/message/list')
      .then(response => {
        response.json().then(data => {
          console.log(result.data)
        })
      })
    ```
   */
  fetchGet(url: string, params?: any, options?: XEAjaxRequest<any>): Promise<Response>;

  /**
   * 发送 POST 请求，返回一个结果为 Response 的 Promise 对象
   * @param url 请求地址
   * @param body 表单提交参数
   * @param options 可选参数
   * @example 
    ```javascript
    // 使用 "application/json" 方式提交，默认使用 JSON.stringify 序列化数据
    let body1 = {
      name: 'u222',
      content: '123456'
    }
    XEAjax.fetchPost('/api/test/message/save', body1)

    // 使用 "application/x-www-form-urlencoded" 方式提交，默认使用 XEAjax.serialize 序列化数据
    let body2 = {
      name: 'u222',
      content: '123456'
    }
    XEAjax.fetchPost('/api/test/message/save', body2, {bodyType: 'form-data'})

    // 模拟表单 "multipart/form-data" 提交
    let file = document.querySelector('#myFile').files[0]
    let formBody = new FormData()
    formBody.append('file', file)
    XEAjax.fetchPost('/api/test/message/save', formBody)
    ```
   */
  fetchPost(url: string, body?: any, options?: XEAjaxRequest<any>): Promise<Response>;

  /**
   * 发送 PUT 请求，返回一个结果为 Response 的 Promise 对象
   * @param url 请求地址
   * @param body 表单提交参数
   * @param options 可选参数
   * @example 
    ```javascript
    let body = {
      id: 1,
      name: 'u222',
      content: '123456'
    }
    XEAjax.fetchPut('/api/test/message/update', body)
      .then(response => {
        response.json().then(data => {
          console.log(result.data)
        })
      })
    ```
   */
  fetchPut(url: string, body?: any, options?: XEAjaxRequest<any>): Promise<Response>;

  /**
   * 发送 DELETE 请求，返回一个结果为 Response 的 Promise 对象
   * @param url 请求地址
   * @param options 可选参数
   * @example 
    ```javascript
    XEAjax.fetchDelete('/api/test/message/delete/1')
      .then(response => {
        response.json().then(data => {
          console.log(result.data)
        })
      })
    ```
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
   * @example 
    ```javascript
    XEAjax.fetch('/api/test/message/list')
      .then(response => {
        response.json().then(data => {
          console.log(result.data)
        })
      })
    ```
   */
  fetch(url: string, options?: XEAjaxRequest<any>): Promise<Response>;

  /**
   * 发送 Jsonp 请求，返回一个包含响应信息的 Peomise 对象
   * @param url 请求地址
   * @param params 表单查询参数
   * @param options 可选参数
   * @since 3.4.0
   * @example 
    ```javascript
    XEAjax.doJsonp('/jsonp/test/message/list')
      .then(result => {
        console.log(result.data)
      })
    ```
   */
  doJsonp(url: string, params?: any, options?: XEAjaxRequest<any>): Promise<XEAjaxResponseSchema<any>>;

  /**
   * 发送 GET 请求，返回一个包含响应信息的 Peomise 对象
   * @param url 请求地址
   * @param params 表单查询参数
   * @param options 可选参数
   * @since 3.4.0
   * @example 
    ```javascript
    XEAjax.doGet('/api/test/message/list')
      .then(result => {
        console.log(result.data)
      }).catch(e => {
        
      })
    ```
   */
  doGet(url: string, params?: any, options?: XEAjaxRequest<any>): Promise<XEAjaxResponseSchema<any>>;

  /**
   * 发送 POST 请求，返回一个包含响应信息的 Peomise 对象
   * @param url 请求地址
   * @param body 表单提交参数
   * @param options 可选参数
   * @since 3.4.0
   * @example 
    ```javascript
    // 使用 "application/json" 方式提交，默认使用 JSON.stringify 序列化数据
    let body1 = {
      name: 'u222',
      content: '123456'
    }
    XEAjax.doPost('/api/test/message/save', body1)

    // 使用 "application/x-www-form-urlencoded" 方式提交，默认使用 XEAjax.serialize 序列化数据
    let body2 = {
      name: 'u222',
      content: '123456'
    }
    XEAjax.doPost('/api/test/message/save', body2, {bodyType: 'form-data'})

    // 模拟表单 "multipart/form-data" 提交
    let file = document.querySelector('#myFile').files[0]
    let formBody = new FormData()
    formBody.append('file', file)
    XEAjax.doPost('/api/test/message/save', formBody)
    ```
   */
  doPost(url: string, body?: any, options?: XEAjaxRequest<any>): Promise<XEAjaxResponseSchema<any>>;

  /**
   * 发送 PUT 请求，返回一个包含响应信息的 Peomise 对象
   * @param url 请求地址
   * @param body 表单提交参数
   * @param options 可选参数
   * @since 3.4.0
   * @example 
    ```javascript
    let body = {
      id: 1,
      name: 'u222',
      content: '123456'
    }
    XEAjax.doPut('/api/test/message/update', body)
      .then(result => {
        console.log(result.data)
      }).catch(e => {

      })
    ```
   */
  doPut(url: string, body?: any, options?: XEAjaxRequest<any>): Promise<XEAjaxResponseSchema<any>>;

  /**
   * 发送 DELETE 请求，返回一个包含响应信息的 Peomise 对象
   * @param url 请求地址
   * @param options 可选参数
   * @since 3.4.0
   * @example 
    ```javascript
    XEAjax.doDelete('/api/test/message/delete/1')
      .then(result => {
        console.log(result.data)
      }).catch(e => {
        
      })
    ```
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
   * @example 
    ```javascript
    XEAjax.jsonp('/jsonp/test/message/list')
      .then(data => {
        console.log(data)
      }).catch(e => {

      })
    ```
   */
  jsonp(url: string, params?: any, options?: XEAjaxRequest<any>): Promise<any>;

  /**
   * 发送 GET 请求，返回响应结果为 JSON 的 Peomise 对象
   * @param url 请求地址
   * @param params 表单查询参数
   * @param options 可选参数
   * @example 
    ```javascript
    XEAjax.getJSON('/api/test/message/list')
      .then(data => {
        console.log(data)
      }).catch(e => {
        
      })
    ```
   */
  getJSON(url: string, params?: any, options?: XEAjaxRequest<any>): Promise<any>;

  /**
   * 发送 POST 请求，返回响应结果为 JSON 的 Peomise 对象
   * @param url 请求地址
   * @param body 表单提交参数
   * @param options 可选参数
   * @example 
    ```javascript
    // 使用 "application/json" 方式提交，默认使用 JSON.stringify 序列化数据
    let body1 = {
      name: 'u222',
      content: '123456'
    }
    XEAjax.postJSON('/api/test/message/save', body1)

    // 使用 "application/x-www-form-urlencoded" 方式提交，默认使用 XEAjax.serialize 序列化数据
    let body2 = {
      name: 'u222',
      content: '123456'
    }
    XEAjax.postJSON('/api/test/message/save', body2, {bodyType: 'form-data'})

    // 模拟表单 "multipart/form-data" 提交
    let file = document.querySelector('#myFile').files[0]
    let formBody = new FormData()
    formBody.append('file', file)
    XEAjax.postJSON('/api/test/message/save', formBody)
    ```
   */
  postJSON(url: string, body?: any, options?: XEAjaxRequest<any>): Promise<any>;

  /**
   * 发送 PUT 请求，返回响应结果为 JSON 的 Peomise 对象
   * @param url 请求地址
   * @param body 表单提交参数
   * @param options 可选参数
   * @example 
    ```javascript
    let body = {
      id: 1,
      name: 'u222',
      content: '123456'
    }
    XEAjax.putJSON('/api/test/message/update', body)
      .then(data => {
        console.log(data)
      }).catch(e => {
        
      })
    ```
   */
  putJSON(url: string, body?: any, options?: XEAjaxRequest<any>): Promise<any>;

  /**
   * 发送 DELETE 请求，返回响应结果为 JSON 的 Peomise 对象
   * @param url 请求地址
   * @param options 可选参数
   * @example 
    ```javascript
    XEAjax.deleteJSON('/api/test/message/delete/1')
      .then(data => {
        console.log(data)
      }).catch(e => {
        
      })
    ```
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
 * 基于 Promise API 的异步请求函数，支持 nodejs、browser 环境
 * @example 
 ```javascript
 XEAjax.ajax({url: '/api/test/message/list'})
  .then(response => {
    // Success
  }).catch(e => {
    // Failure
  })
 ```
 */
declare var XEAjax: XEAjaxMethods;

export default XEAjax;