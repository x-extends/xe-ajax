# XEAjax 基于 Promise API 的请求函数，支持 Mock 虚拟服务

[![npm version](https://img.shields.io/npm/v/xe-ajax.svg?style=flat-square)](https://www.npmjs.org/package/xe-ajax)
[![npm downloads](https://img.shields.io/npm/dm/xe-ajax.svg?style=flat-square)](http://npm-stat.com/charts.html?package=xe-ajax)

XEAjax 一个不依赖于任何框架、开源的请求函数，支持xhr、jsonp以及mock，其特点是高易用性、高扩展性、向后兼容 fetch 及完善的API

### 兼容性
任何支持 Promise 的环境都能运行，低版本浏览器使用 polyfill<br/>
支持 IE8+、Edge、Chrome、Firefox、Opera、Safari等...

### CDN 安装
使用 script 方式安装，XEAjax 会定义为全局变量<br/>
生产环境请使用 xe-ajax.min.js，更小的压缩版本，可以带来更快的速度体验。
#### cdnjs 获取最新版本, [点击浏览](https://cdn.jsdelivr.net/npm/xe-ajax/)已发布的所有 npm 包的源代码。
``` shell
<script src="https://cdn.jsdelivr.net/npm/xe-ajax@3.1.0/dist/xe-ajax.js"></script>
```
#### unpkg 获取最新版本, [点击浏览](https://unpkg.com/xe-ajax@3.1.0/)已发布的所有 npm 包的源代码
``` shell
<script src="https://unpkg.com/xe-ajax@3.1.0/dist/xe-ajax.js"></script>
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
  XEAjax.getJSON('/api/user/list', {id: 1})
})
```

### ES6 Module 安装方式
``` shell
npm install xe-ajax --save
```

### 部分导入
``` shell
import { fetchGet, getJSON, fetchPost, postJSON } from 'xe-ajax'

fetchGet('/api/user/list', {id: 1})
fetchPost('/api/user/save', {id: 1})

getJSON('/api/user/list', {id: 1})
postJSON('/api/user/save', {id: 1})
```

### 导入所有
``` shell
import XEAjax from 'xe-ajax'

XEAjax.fetchGet('/api/user/list', {id: 1})
XEAjax.fetchPost ('/api/user/save', {id: 1})

XEAjax.getJSON('/api/user/list', {id: 1})
XEAjax.postJSON('/api/user/save', {id: 1})
```

### 混合函数
#### 文件 ./customs.js
``` shell
export function get1 () {
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
XEAjax.get1()
```

## XEAjax API:
* doAll (iterable)
* ajax ( options )
### 'xe-ajax' 提供常用便捷方法：
### fetch 响应,无论请求成功或失败都是完成，返回 Response 对象
* fetchGet ( url, params, options )
* fetchPost ( url, body, options )
* fetchPut ( url, body, options )
* fetchPatch ( url, body, options )
* fetchDelete ( url, body, options )
### 根据请求状态决定完成或失败，直接返回 json 数据
* getJSON ( url, params, options )
* postJSON ( url, body, options )
* putJSON ( url, body, options )
* deleteJSON ( url, body, options )
* patchJSON ( url, body, options )
* jsonp ( url, params, options )

### 接受三个参数：
* url（字符串），请求地址。可被自定义 options 属性覆盖。
* params/body（可选，对象/数组），要发送的数据。可被自定义 options 属性覆盖。
* options （可选，对象）参数

### Response 对象说明
| 属性 | 类型 | 描述 |
|------|------|-----|
| json | Function | 返回 Promise 对象，结果得到 json 数据,只能读取一次 |
| test | Function | 返回 Promise 对象，结果得到 text 数据,只能读取一次 |
| body | ReadableStream | 数据流 |
| bodyUsed | Boolean | 内容是否已被读取 |
| headers | Headers | 返回响应头 |
| status | Number | 返回状态码 |
| statusText | String | 状态 |
| url | String | 返回请求路径 |
| ok | Boolean | 根据状态判断完成还是失败 |
| redirected | Boolean | 是否重定向了 |
| type | String | 类型 |

### options 参数说明
| 参数 | 类型 | 描述 | 默认值 |
|------|------|-----|----|
| url | String | 请求地址 |  |
| baseURL | String | 基础路径 | 默认上下文路径 |
| method | String | 请求方法 | 默认GET |
| params | Object/Array | 请求参数 |  |
| body | Object/Array | 提交参数 |  |
| bodyType | String | 提交参数方式，如果要以表单方式提交改为FORM_DATA | 默认JSON_DATA |
| jsonp | String | 调用jsonp服务,属性名默认callback | 默认callback |
| async | Boolean | 是否异步 | 默认true(XEAjax虽然不做异步限制，但是建议必须异步) |
| credentials | String |  设置 cookie 是否随请求一起发送,可以设置: omit,same-origin,include | 默认same-origin |
| timeout | Number | 设置超时 |  |
| headers | Object | 请求头 | {Accept: 'application/json, text/plain, \*/\*;'} |
| transformParams | Function ( params, request ) | 用于改变URL参数 |  |
| paramsSerializer | Function ( params, request ) | 自定义URL序列化函数 |  |
| transformBody | Function ( body, request ) | 用于改变提交数据 |  |
| stringifyBody | Function ( body, request ) | 自定义转换提交数据的函数 |  |
| getXMLHttpRequest | Function ( request ) | 自定义 XMLHttpRequest 的函数 |  |

### 全局参数设置
``` shell
import XEAjax from 'xe-ajax'
import XEUtils from 'xe-utils'

// 示例
XEAjax.setup({
  baseURL: 'http://xuliangzhan.com',
  bodyType: 'FORM_DATA',
  credentials: 'include',
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
    return 'id=123&name=2'
  }，
  transformBody (body, request) {
    // 用于在请求发送之前改变提交数据
    body.startDate = XEUtils.dateToString(body.startDate, 'yyyy-MM-dd HH:mm:ss')
    return body
  },
  stringifyBody (body, request) {
    // 自定义格式化数据函数,除了GET之外都支持提交数据
    return JSON.stringify(body)
  }
})
```

### 示例
``` shell
import { ajax, doAll, fetchGet, getJSON, postJSON, jsonp } from 'xe-ajax'
import XEUtils from 'xe-utils'

// 参数调用，返回 response 对象
ajax({url: '/api/user/list', method: 'GET', params: {id: 1}})
ajax({url: '/api/user/submit', method: 'POST', body: {id: 1}})

// 返回 Response 对象,无论请求成功或失败都是完成
fetchGet('/api/user/list').then(response >= response.json()).then(data => {
  // 获取 data
})

fetchGet('/api/user/list').then(response => {
  // response.ok 请求成功或失败
  // response.status
  // response.headers
  response.json().then(data => {
    // 获取 data
  })
  // response.text().then(text => {
  //   // 获取 text
  // })
})

// 直接返回请求结果
getJSON('/api/user/list').then(data => {
  // data
  // 对数据进行处理
  data.map(item => {
    return Object.assign(item, {
      startDate: XEUtils.stringToDate(item.startDate, 'yyyy-MM-dd HH:mm:ss')
    })
  })
}).catch(data => {
  // data
})

// 提交数据
postJSON('/api/user/save', {name: 'test'})

// 以formData方式提交数据
postJSON('/api/user/save', {name: 'test', password: '123456'}, {bodyType: 'FORM_DATA'})

// 查询参数和数据同时提交
postJSON('/api/user/save', {name: 'test', password: '123456'}, {params: {id: 1}})

// Promise.all 在所有异步完成之后执行
const iterable1 = []
iterable1.push(getJSON('/api/user/list'))
iterable1.push(getJSON('/api/user/save'), {id: 1})
Promise.all(iterable1).then(datas => {
  // datas 数组
}).catch(data => {
  // data 
})

// doAll 在所有异步完成之后执行 支持对象参数
const iterable2 = []
iterable2.push({url: '/api/user/list', method: 'GET'})
iterable2.push(postJSON('/api/user/save', {id: 1}))
doAll(iterable2)

// jsonp 跨域调用,请求完成或失败,jsonp只能获取数据
jsonp('http://xuliangzhan.com/jsonp/user/message', {params: {id: 1}}).then(data => {
  // {msg: 'success'}
}).catch(data => {
  // {msg: 'error'}
})
```

### AjaxController 控制器对象，允许控制一个或多个取消指令请求
### 通过设置 signal
### 示例
``` shell
import { AjaxController, getJSON, fetchPost } from 'xe-ajax'

const controller = new AjaxController() // 创建一个控制器对象
const signal = controller.signal // 获取signal
fetchGet('/api/user/list', {id: 1}, {signal}).then(response => {
  // response.ok = false
  // response.status = 0
  response.json().then(data => {
    // 获取 data 数据
  })
})
let isCancel = true
setTimeout(() => {
  if (isCancel) {
    controller.abort() // 如果还没请求完成，则终止请求、如果已请求完成，则调用无效
  }
}, 10)
```

### 拦截器
``` shell
import XEAjax from 'xe-ajax'

// Request 请求之前拦截器
XEAjax.interceptors.request.use((request, next) => {
  // 请求之前拦截器,一般用于统一的权限拦截、设置头、参数处理等...

  // request.method = 'POST' // 修改 method
  // request.params.id = 1 // 修改参数
  // request.setHeader('X-Token', 123) // 设置请求头

  // 调用 next(),继续执行下一个拦截器
  next()
})

// Response 响应之后拦截器
XEAjax.interceptors.response.use((response, next) => {
  // 响应之后拦截器,可以用于响应之后校验session是否失效做处理、统一的错误消息提示处理等...

  // 例子: 判断登录失效跳转
  if (response.status === 403) {
    router.replace({path: '/login'}) 
  } else {
    // 调用 next(),继续执行下一个拦截器
    next()
  }
})

// 支持重置响应数据
XEAjax.interceptors.response.use((response, next) => {
  // 响应之后拦截器,可以用于响应之后对所有返回的数据进行统一的处理...
  // 格式: {status: 200, body: {}, headers: {}}

  // 例如，对所有请求结果进行处理，返回统一的结构
  response.json().then(data => {
    // 重置响应数据并继续执行下一个拦截器
    next({status: response.status, body: {result: data}})
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

ES6 + XEAjax + Mock 项目例子1 请参考 [vue-mock1](https://github.com/xuliangzhan/xe-ajax-mock/tree/master/examples/vue-mock1) 示例<br/>
RequireJS + XEAjax + Mock 项目例子2 请参考 [vue-mock2](https://github.com/xuliangzhan/xe-ajax-mock/tree/master/examples/vue-mock2) 示例<br/>
RequireJS + VXEAjax + Mock 项目例子3 请参考 [vue-mock3](https://github.com/xuliangzhan/xe-ajax-mock/tree/master/examples/vue-mock3) 示例<br/>
更多详细说明请查看 [Mock插件文档](https://github.com/xuliangzhan/xe-ajax-mock)

## License
Copyright (c) 2017-present, Xu Liangzhan