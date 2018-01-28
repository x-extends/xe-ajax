# XEAjax 轻量级XHR请求函数，基于 Promise 实现，支持 Mock 虚拟服务

XEAjax 是一个不依赖于任何框架、开源的XHR请求函数，支持XHR、jsonp以及mock等常用函数。对于前后端分离开发模式，使用 ajax+mock 就非常有必要，其特点是高易用性、高扩展性及完善的API，基于ES6 Promise实现，运行环境 ES5+。

### 直接引用 script 全局安装，XEAjax 会定义为全局变量
``` shell
<script src="./dist/xe-ajax.min.js" type="text/javascript"></script>

// 全局调用
XEAjax.getJSON ('services/user/list', {id: 1})
```

### AMD 安装， 以 require.js 为例
``` shell
// require 配置
require.config({
  paths: {
    // ...,
    'xe-ajax': './dist/xe-ajax.min'
  }
})

// ./app,js 调用
define(['xe-ajax'], function (XEAjax) {
  XEAjax.getJSON ('services/user/list', {id: 1})
})
```

### ES6 Module 安装方式
``` shell
npm install xe-ajax --save
```

### 部分导入
``` shell
import { doGet, getJSON, doPost, postJSON } from 'xe-ajax'

doGet ('services/user/list', {id: 1})
getJSON ('services/user/list', {id: 1})
doPost ('services/user/save', {id: 1})
postJSON ('services/user/save', {id: 1})
```

### 导入所有
``` shell
import XEAjax from 'xe-ajax'

XEAjax.doGet('services/user/list', {id: 1})
XEAjax.getJSON ('services/user/list', {id: 1})
XEAjax.doPost ('services/user/save', {id: 1})
XEAjax.postJSON ('services/user/save', {id: 1})
```

### 混合函数
#### 文件 ./customs.js
``` shell
export function custom1 () {
  console.log('自定义的函数')
} 
```
#### 示例
``` shell
import Vue from 'vue'
import XEAjax from 'xe-ajax'

import customs from './customs'

XEAjax.mixin(customs)

// 调用自定义扩展函数
XEAjax.custom1()
```

## XEAjax API:
### 'xe-ajax' 提供的便捷方法：
* ajax( options )
* doAll (iterable)
* doGet ( url, params, options )
* getJSON ( url, params, options )
* doPost ( url, body, options )
* postJSON ( url, body, options )
* doPut ( url, body, options )
* putJSON ( url, body, options )
* doPatch ( url, body, options )
* patchJSON ( url, body, options )
* doDelete ( url, body, options )
* deleteJSON ( url, body, options )
* jsonp ( url, params, options )

### 接受三个参数：
* url（字符串），请求地址。可被options属性覆盖。
* params/body（可选，对象/数组），要发送的数据。可被options属性覆盖。
* options （可选，对象）参数

### 参数说明
| 参数 | 类型 | 描述 | 默认值 |
|------|------|-----|----|
| url | String | 请求地址 |  |
| baseURL | String | 基础路径 |  |
| method | String | 请求方法 | 默认GET |
| params | Object/Array | 请求参数 |  |
| body | Object/Array | 提交参数 |  |
| bodyType | String | 提交参数方式，如果要以表单方式提交改为FROM_DATA | 默认JSON_DATA |
| jsonp | String | 调用jsonp服务,回调属性默认callback | 默认callback |
| jsonpCallback | String | jsonp回调函数名 | 默认从window获取该函数 |
| async | Boolean | 是否异步 | 默认true |
| timeout | Number | 设置超时 |  |
| headers | Object | 请求头 | {Accept: 'application/json, text/plain, \*/\*;'} |
| interceptor | Function ( request, next ) | 局部拦截器 |  |
| transformParams | Function ( params, request ) | 用于改变URL参数 |  |
| paramsSerializer | Function ( params, request ) | 自定义URL序列化函数 |  |
| transformBody | Function ( body, request ) | 用于改变提交数据 |  |
| stringifyBody | Function ( body, request ) | 自定义转换提交数据的函数 |  |

### 全局参数
``` shell
import XEAjax from 'xe-ajax'
import XEUtils from 'xe-utils'

XEAjax.setup({
  baseURL: 'http://xuliangzhan.com',
  bodyType: 'JSON_DATA',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  transformParams (params, request) {
    // 用于在请求发送之前改变URL参数
    params.id = 123
    return params
  },
  paramsSerializer (params, request) {
    // 自定义URL序列化函数,最终拼接在url
    return 'id=1&name=2'
  }，
  transformBody (body, request) {
    // 用于在请求发送之前改变提交数据
    body.startDate = XEUtils.dateToString(body.startDate, 'yyyy-MM-dd HH:mm:ss')
    return body
  },
  bodyFormat (body, request) {
    // 自定义格式化数据函数,除了GET之外都支持提交数据
    return JSON.stringify(body)
  }
})
```

### 示例
``` shell
import { ajax, doAll, doGet, getJSON, doPost, postJSON } from 'xe-ajax'
import XEUtils from 'xe-utils'

// 参数调用，返回 response 对象
ajax({
  url: 'services/user/list',
  method: 'GET',
  params: {}
})
ajax({
  url: 'services/user/submit',
  method: 'POST',
  body: {}
})

// 返回 response 对象
doGet('services/user/list').then(response => {
  // response.body
  // response.status
  // response.headers
})
// 直接返回请求结果
getJSON('services/user/list').then(data => {
  // data
  // 对数据进行处理
  data.map(item => {
    return Object.assign(item, {
      startDate: XEUtils.stringToDate(item.startDate, 'yyyy-MM-dd HH:mm:ss')
    })
  })
})

// 提交数据
doPost('services/user/save', {name: 'aaa'})
postJSON('services/user/save', {name: 'aaa'})

// 以formData方式提交数据
doPost('services/user/save', {name: 'test', password: '123456'}, {bodyType: 'FROM_DATA'})
postJSON('services/user/save', {name: 'test', password: '123456'}, {bodyType: 'FROM_DATA'})

// 查询参数和数据同时提交
doPost('services/user/save', {name: 'test', password: '123456'}, {params: {id: 1}})
postJSON('services/user/save', {name: 'test', password: '123456'}, {params: {id: 1}})

// 在所有的异步操作执行完, doAll 和 Promise.all 用法一致
const iterable1 = []
iterable1.push(getJSON('services/user/list'))
iterable1.push(getJSON('services/user/save'), {id: 1})
Promise.all(iterable1).then(datas => {
  // datas 数组
}).catch(data => {
  // data 
})
// doAll 支持对象参数
const iterable2 = []
iterable2.push({url: 'services/user/list', method: 'GET'})
iterable2.push(postJSON('services/user/save', {id: 1}))
doAll(iterable2).then(datas => {
  // datas 数组
}).catch(data => {
  // data
})

```

### 取消操作
| 属性 | 类型 | 描述 |
|------|------|-----|
| cancel | Function () | 取消请求 |
| resolve | Function (response) | 取消请求，承诺完成 |
| reject | Function (response) | 取消请求，承诺失败 |

### 示例
``` shell
import { cancelable, doGet, doPost } from 'xe-ajax'

// 中断XHR请求之前如果承诺已经完成了，则调用无效

// 中断XHR请求
const ajaxHandle = cancelable()
doGet('services/user/list', null, {cancelable: ajaxHandle})
ajaxHandle.cancel() // {status: 0, response: ''}

// 中断XHR请求，执行承诺完成
const ajaxHandle2 = cancelable()
doGet('services/user/list', null, {cancelable: ajaxHandle2})
ajaxHandle2.resolve()
// ajaxHandle2.resolve({msg: 'cancel2'}) // 支持自定义响应数据 {status: 200, response: {msg: 'cancel2'}}

// 中断XHR请求，执行承诺失败
const ajaxHandle3 = cancelable()
doGet('services/user/list', null, {cancelable: ajaxHandle3})
doPost('services/user/save', {name: 'test', password: '123456'}, {cancelable: ajaxHandle3, bodyType: 'FROM_DATA'})
setTimeout(() => {
  ajaxHandle3.reject()
  // ajaxHandle3.reject({msg: 'cancel3'}) // 支持自定义响应数据 {status: 500, response: {msg: 'cancel3'}}
}, 20)

```

### 拦截器
``` shell
import XEAjax from 'xe-ajax'

// 支持局部拦截器
XEAjax.ajax({
  url: 'services/user/list',
  interceptor (request, next) {
    next()
  }
})

// 请求之前拦截和请求之后拦截
XEAjax.interceptor.use( (request, next) => {
  // 请求之前处理
  next( (response) => {
    / 请求之后处理
    return response
  })
})
// 请求之前拦截
XEAjax.interceptor.use( (request, next) => {
  // 更改请求类型为POST
  request.method = 'POST'
  // 继续执行,如果不调用next则不会往下走
  next()
})
// 请求之前拦截和请求之后拦截
XEAjax.interceptor.use( (request, next) => {
  // 例如，是否登录权限拦截
  if (isLogin()) {
    next()
  } else {
    location.href = 'http://xuliangzhan.com/login'
  }
})
// 请求之前拦截和请求之后拦截
XEAjax.interceptor.use( (request, next) => {
  // 继续执行
  next( (response) => {
    // 更改状态
    response.status = 403
    // 更改数据
    response.body = {}
  })
})
// 请求之前拦截中断请求并直接返回结果
XEAjax.interceptor.use( (request, next) => {
  // 继续执行,如果希望直接返回数据
  next({response: [{id: 1}, {id: 2}], status: 200})
})
// 请求之前拦截中断请求并异步返回结果
XEAjax.interceptor.use( (request, next) => {
  // 异步操作
  new Promise( (resolve, reject) => {
    setTimeout(() => {
      next({response: {text: '成功'}, status: 200})
      // next({response: {text: '失败'}, status: 500})
    }, 100)
  })
})
```

### Mock 虚拟服务
支持常用 MockJS、[XEAjaxMock](https://github.com/xuliangzhan/xe-ajax-mock) 等插件..
``` shell
import XEAjax from 'xe-ajax'
import XEAjaxMock from 'xe-ajax-mock'
XEAjax.use(XEAjaxMock)
```

请参考 [mock-demo](https://github.com/xuliangzhan/xe-ajax-mock/tree/master/examples/mock-demo) 示例

## License
Copyright (c) 2017-present, Xu Liangzhan