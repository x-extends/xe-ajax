# xe-ajax

简体中文 | [English](https://github.com/xuliangzhan/xe-ajax/blob/master/README.en-US.md)

[![npm version](https://img.shields.io/npm/v/xe-ajax.svg?style=flat-square)](https://www.npmjs.org/package/xe-ajax)
[![npm downloads](https://img.shields.io/npm/dm/xe-ajax.svg?style=flat-square)](http://npm-stat.com/charts.html?package=xe-ajax)

基于 Promise 的异步请求函数，使用 fetch API，支持 node.js、browser 环境。

## Browser Support

xe-ajax 依赖原生的 ES6 Promise 实现。如果您的环境不支持 ES6 Promise，您可以使用 polyfill。

![IE](https://raw.github.com/alrra/browser-logos/master/src/archive/internet-explorer_7-8/internet-explorer_7-8_48x48.png) | ![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png) | ![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png)
--- | --- | --- | --- | --- | --- |
8+ ✔ | Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ | 6.1+ ✔ |

## CDN
使用 script 方式安装，XEAjax 会定义为全局变量  
生产环境请使用 xe-ajax.min.js，更小的压缩版本，可以带来更快的速度体验。
### cdnjs 获取最新版本
[点击浏览](https://cdn.jsdelivr.net/npm/xe-ajax/)已发布的所有 npm 包源码
``` shell
<script src="https://cdn.jsdelivr.net/npm/xe-ajax/dist/xe-ajax.js"></script>
```
### unpkg 获取最新版本
[点击浏览](https://unpkg.com/xe-ajax/)已发布的所有 npm 包源码
``` shell
<script src="https://unpkg.com/xe-ajax/dist/xe-ajax.js"></script>
```

## AMD
### require.js 安装示例
``` shell
// require 配置
require.config({
  paths: {
    // ...,
    'xe-ajax': './dist/xe-ajax.min'
  }
})
```

## NPM
``` shell
npm install xe-ajax --save
```

### NodeJS
``` shell
const XEAjax = require('xe-ajax')
```

### ES6 Module import
``` shell
import XEAjax from 'xe-ajax'
```

## API:
### 提供常用便捷方法:
* doAll ( iterable )
* ajax ( options )
* ~
* fetch ( url, options )
* fetchHead ( url, options )
* fetchDelete ( url, options )
* fetchJsonp ( url, params, options )
* fetchGet ( url, params, options )
* fetchPost ( url, body, options )
* fetchPut ( url, body, options )
* fetchPatch ( url, body, options )
* ~
* doHead ( url, options )
* doDelete ( url, options )
* doJsonp ( url, params, options )
* doGet ( url, params, options )
* doPost ( url, body, options )
* doPut ( url, body, options )
* doPatch ( url, body, options )
* ~
* headJSON ( url, options )
* deleteJSON ( url, options )
* jsonp ( url, params, options )
* getJSON ( url, params, options )
* postJSON ( url, body, options )
* putJSON ( url, body, options )
* patchJSON ( url, body, options )

### 入参
* url（字符串） 请求地址，可被自定义 options 属性覆盖
* params/body（可选，对象/数组） 要发送的数据，可被自定义 options 属性覆盖
* options （可选，对象） 参数

### options 参数

| 参数 | 类型 | 描述 | 默认值 |
|------|------|-----|----|
| url | String | 请求地址 |  |
| baseURL | String | 基础路径 | 默认上下文路径 |
| method | String | 请求方法 | 默认GET |
| params | Object/Array | 请求参数 |  |
| body | Object/Array | 提交参数 |  |
| bodyType | String | 提交参数方式，可以设置json-data,form-data | 默认json-data |
| mode | String | 请求的模式, 可以设置cors,no-cors,same-origin | 默认cors |
| cache | String | 处理缓存方式,可以设置default,no-store,no-cache,reload,force-cache,only-if-cached | 默认default |
| credentials | String |  设置 cookie 是否随请求一起发送,可以设置: omit,same-origin,include | 默认same-origin |
| *redirect* | String | 重定向模式, 可以设置follow,error,manual | 默认follow |
| *referrer* | String | 可以设置no-referrer,client或URL | 在原生支持fetch环境下才有效 |
| *referrerPolicy* | String | 可以设置: no-referrer,no-referrer-when-downgrade,origin,origin-when-cross-origin,unsafe-url | 在原生支持fetch环境下才有效 |
| integrity | String | 包括请求的subresource integrity值(例如：sha256-BpfBw7ivV8q2jLiT13fxDYAe2tJllusRSZ273h2nFSE=) | 在原生支持fetch环境下才有效 |
| jsonp | String | jsonp入参属性名 | 默认callback |
| jsonpCallback | String | jsonp响应结果的回调函数名 | 默认自动生成函数名 |
| timeout | Number | 设置超时 |  |
| headers | Object | 请求头 |  |
| transformParams | Function ( params, request ) | 用于改变URL参数 |  |
| paramsSerializer | Function ( params, request ) | 自定义URL序列化函数 |  |
| transformBody | Function ( body, request ) | 用于改变提交数据 |  |
| stringifyBody | Function ( body, request ) | 自定义转换提交数据的函数 |  |
| validateStatus | Function ( response ) | 自定义校验请求是否成功 | response.status >= 200 && response.status < 300 |

### Headers
| 属性 | 类型 | 描述 |
|------|------|-----|
| set | Function ( name, value ) | 添加 |
| append | Function ( name, value ) | 追加 |
| get | Function ( name ) | 根据 name 获取 |
| has | Function ( name ) | 检查 name 是否存在 |
| delete | Function ( name ) | 根据 name 删除 |
| keys | Function | 以迭代器的形式返回所有 name |
| values | Function | 以迭代器的形式返回所有 value |
| entries | Function | 以迭代器的形式返回所有 [name, value] |
| forEach | Function ( callback, context ) | 迭代器 |

### Response
| 属性 | 类型 | 描述 |
|------|------|-----|
| body | ReadableStream | 数据流 |
| bodyUsed | Boolean | 内容是否已被读取 |
| headers | Headers | 响应头 |
| status | Number | 状态码 |
| statusText | String | 状态信息 |
| url | String | 返回请求路径 |
| ok | Boolean | 请求完成还是失败 |
| redirected | Boolean | 是否重定向了 |
| type | String | 类型 |
| clone | Function | 返回一个新的 Response 对象 |
| json | Function | 获取 json 数据 |
| test | Function | 获取 text 数据 |
| blob | Function | 获取 Blob 对象 |
| arrayBuffer | Function | 获取 ArrayBuffer 对象 |
| formData | Function | 获取 FormData 对象 |

## 全局参数设置
``` shell
import XEAjax from 'xe-ajax'

// 示例
XEAjax.setup({
  baseURL: 'http://xuliangzhan.com',
  bodyType: 'json-data',
  credentials: 'include',
  log: false,
  headers: {
    'Accept': 'application/json, text/plain, \*/\*;'
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
    body.startTime = body.startDate.getTime()
    return body
  },
  stringifyBody (body, request) {
    // 自定义格式化提交数据函数
    return JSON.stringify(body)
  }
})
```

## 示例
### 完整调用
``` shell
import XEAjax from 'xe-ajax'

XEAjax.ajax({
  url: '/api/user/list',
  method: 'GET',
  params: {id: 1}
}).then(response => {
  // 请求完成
}).catch(e => {
  // 发生错误
})

```
### fetch 调用
``` shell
import XEAjax from 'xe-ajax'

XEAjax.fetch('/api/user/list', {
  method: 'POST',
  body: {name: 'test'}
}).then(response => {
  // 请求完成
}).catch(e => {
  // 发生错误
})

// Response Text
XEAjax.fetchGet('/api/user/list').then(response => {
  response.text().then(text => {
    // 获取 text
  })
})

// Response JSON
XEAjax.fetchGet('/api/user/list').then(response => {
  response.json().then(data => {
    // 获取 data
  })
})

// Response Blob
XEAjax.fetchGet('/api/user/list').then(response => {
  response.blob().then(blob => {
    // 获取 blob
  })
})

// Response ArrayBuffer
XEAjax.fetchGet('/api/user/list').then(response => {
  response.arrayBuffer().then(arrayBuffer => {
    // 获取 arrayBuffer
  })
})

// Response FormData
XEAjax.fetchGet('/api/user/list').then(response => {
  response.formData().then(formData => {
    // 获取 formData
  })
})

// 使用 application/json 方式提交，默认使用 JSON.stringify 序列化数据
XEAjax.fetchPost('/api/user/save', {name: 'test', password: '123456'}, {bodyType: 'json-data'})

// 使用 application/x-www-form-urlencoded 方式提交，默认使用 XEAjax.serialize 序列化数据
XEAjax.fetchPost('/api/user/save', {name: 'test', password: '123456'}, {bodyType: 'form-data'})

// 模拟表单 FormData 提交
const file = document.querySelector('#myFile').files[0]
const formBody = new FormData()
formBody.append('file', file)
XEAjax.fetchPost('/api/user/save', formBody)

// 查询参数和数据同时提交
XEAjax.fetchPost('/api/user/save', {name: 'test', password: '123456'}, {params: {id: 1}})
```
### 根据状态响应请求结果、包括状态信息
``` shell
import XEAjax from 'xe-ajax'

// 对请求的响应包含以下信息
// {data, status, statusText, headers}

// 根据 validateStatus 状态校验判断完成还是失败
XEAjax.doGet('/api/user/list').then(response => {
  // 请求成功
}).catch(response => {
  // 请求失败
})

XEAjax.doPost('/api/user/save', {name: 'test'})
XEAjax.doPost('/api/user/save', {name: 'test', password: '123456'}, {bodyType: 'json-data'})
XEAjax.doPost('/api/user/save', {name: 'test', password: '123456'}, {bodyType: 'form-data'})

const file = document.querySelector('#myFile').files[0]
const formBody = new FormData()
formBody.append('file', file)
XEAjax.doPost('/api/user/save', formBody)
```
### 根据状态响应 json 调用
``` shell
import XEAjax from 'xe-ajax'

// 根据 validateStatus 状态校验判断完成还是失败
XEAjax.getJSON('/api/user/list').then(data => {
  // 请求成功
}).catch(data => {
  // 请求失败
})

XEAjax.postJSON('/api/user/save', {name: 'test'})

XEAjax.postJSON('/api/user/save', {name: 'test', password: '123456'}, {bodyType: 'json-data'})

XEAjax.postJSON('/api/user/save', {name: 'test', password: '123456'}, {bodyType: 'form-data'})

const file = document.querySelector('#myFile').files[0]
const formBody = new FormData()
formBody.append('file', file)
XEAjax.postJSON('/api/user/save', formBody)

XEAjax.postJSON('/api/user/save', {name: 'test', password: '123456'}, {params: {id: 1}})
```
### jsonp 调用
``` shell
import XEAjax from 'xe-ajax'

// 例子1
// 服务地址: http://xuliangzhan.com/jsonp/user/message?callback=jsonp_xeajax_1521272815608_1
// 服务端返回结果: jsonp_xeajax_1521272815608_1({message: 'success'})
XEAjax.fetchJsonp('http://xuliangzhan.com/jsonp/user/message').then(response => {
  response.json().then(data => {
    // {message: 'success'}
  })
})

// 例子2
// 服务地址: http://xuliangzhan.com/jsonp/user/message?id=123&cb=jsonp_xeajax_1521272815608_2
// 服务端返回结果: jsonp_xeajax_1521272815608_2({message: 'success'})
XEAjax.fetchJsonp('http://xuliangzhan.com/jsonp/user/message', {id: 123}, {
  jsonp: 'cb'
}).then(response => {
  response.json().then(data => {
    // {message: 'success'}
  })
})

// 例子3
// 服务地址: http://xuliangzhan.com/jsonp/user/message?id=123&cb=custom3
// 服务端返回结果: custom3({message: 'success'})
XEAjax.fetchJsonp('http://xuliangzhan.com/jsonp/user/message', {id: 123}, {
  jsonp: 'cb', 
  jsonpCallback: 'custom3'
}).then(response => {
  response.json().then(data => {
    // {message: 'success'}
  })
})
```
### 并发多个请求
``` shell
import XEAjax from 'xe-ajax'

const iterable1 = []
iterable1.push(XEAjax.fetchGet('/api/user/list'))
iterable1.push(XEAjax.fetchGet('/api/user/message'), {id: 1})
Promise.all(iterable1).then(datas => {
  // 所有异步完成之后执行
}).catch(e => {
  // 请求失败时执行
})

// doAll 使用对象参数, 用法和 Promise.all 一致
const iterable2 = []
iterable2.push({url: '/api/user/list'})
iterable2.push({url: '/api/user/message', body: {id: 1}, method: 'POST'})
XEAjax.doAll(iterable2)
```
### 嵌套请求
``` shell
import XEAjax from 'xe-ajax'

// 相互依赖的嵌套请求(项目中应该避免这种情况)
XEAjax.fetchGet('/api/user/info').then(response => response.json()).then(data => {
  return fetchGet('/api/user/details', {id: data.id})
}).then(response => {
  response.json().then(data => {
    // 获取 data
  })
})
```
### AMD 使用方式
``` shell
define([
  'xe-ajax'
], function (XEAjax) {

  XEAjax.fetchGet('/api/user/list').then(response => {
    response.json().then(data => {
      // 获取 data
    })
  })

  XEAjax.fetchPost('/api/user/save', {name: 'test'})

  XEAjax.fetchPost('/api/user/save', {name: 'test'}, {bodyType: 'form-data'})

  var file = document.querySelector('#myFile').files[0]
  var formBody = new FormData()
  formBody.append('file', file)
  XEAjax.fetchPost('/api/user/save', formBody)

  XEAjax.fetchPost('/api/user/save', {name: 'test'}, {params: {id: 1}})
})
```

## 取消请求
### AbortController 控制器对象
允许控制一个或多个取消指令请求
``` shell
import XEAjax from 'xe-ajax'

// 创建一个控制器对象
const controller = new XEAjax.AbortController()
// 获取signal
const signal = controller.signal
// 给请求加入控制器 signal
XEAjax.fetchGet('/api/user/list', {id: 1}, {signal}).then(response => {
  // 请求成功
}).catch(function (e) {
  // 取消请求
})
setTimeout(() => {
  // 终止请求
  controller.abort()
}, 10)
```

## 拦截器
### Request 拦截器
use (before)
``` shell
import XEAjax from 'xe-ajax'

// 请求之前拦截器
XEAjax.interceptors.request.use((request, next) => {
  // 可以用于统一的权限拦截、设置请求头、Token 验证、参数等处理...

  // 设置参数
  request.params.version = 1
  // 设置 Token 验证，预防 XSRF/CSRF 攻击
  request.headers.set('X-Token', cookie('x-id'))

  // 调用 next(),继续执行下一个拦截器
  next()
})
```
### Response 拦截器
use (finish, failed)
``` shell
import XEAjax from 'xe-ajax'

// 请求完成之后拦截
XEAjax.interceptors.response.use((response, next) => {
  // 请求完成之后统一处理，例如校验登录是否失效、消息提示，特殊场景处理等...

  // 例子: 判断登录失效跳转
  if (response.status === 403) {
    router.replace({path: '/login'}) 
  } else {
    // 调用 next(),继续执行下一个拦截器
    next()
  }
}, (e, next) => {
  // 请求发生错误
  // 调用 next(),继续执行下一个拦截器
  next()
})

// 请求完成之后重置响应数据
XEAjax.interceptors.response.use((response, next) => {
  // 对所有请求返回统一的数据结构
  // 格式: {status: 200, statusText: 'OK', body: {}, headers: {}}

  // 例如，对所有请求结果进行处理，返回统一的结构
  response.json().then(data => {
    const body = {
      status: response.status === 200 ? 'success' : 'error', 
      result: data
    }
    // 重置响应数据并继续执行下一个拦截器
    next({status: response.status, body: body})
  })
}, (e, next) => {
  // 对所有请求错误返回统一的数据结构
  const body = {
    message: 'error', 
    result: null
  }
  // 重置响应数据并继续执行下一个拦截器
  next({status: 200, body: body})
})
```

## 混合函数
### ./customs.js
``` shell
import XEAjax from 'xe-ajax'

export function doGet () {
  return XEAjax.fetchGet.apply(this, arguments)
  .then(response => response.json())
  .then(body => {
    return {
      body: body, 
      status: response.status, 
      headers: response.headers
    }
  })
} 
export function getText () {
  return XEAjax.fetchGet.apply(this, arguments).then(response => response.text())
} 
```
### ./main.js
``` shell
import XEAjax from 'xe-ajax'
import customs from './customs'

XEAjax.mixin(customs)

// 调用自定义扩展函数
XEAjax.doGet('/api/user/list')
XEAjax.getText('/api/user/message')
```

## 插件
### Mock 虚拟服务
支持 MockJS、[XEAjaxMock](https://github.com/xuliangzhan/xe-ajax-mock) 等。

## 示例
[项目示例](https://github.com/xuliangzhan/examples)  

## License

Copyright (c) 2017-present, Xu Liangzhan