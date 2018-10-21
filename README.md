# xe-ajax

简体中文 | [English](https://github.com/xuliangzhan/xe-ajax/blob/master/README.en-US.md)

[![npm version](https://img.shields.io/npm/v/xe-ajax.svg?style=flat-square)](https://www.npmjs.org/package/xe-ajax)
[![npm downloads](https://img.shields.io/npm/dm/xe-ajax.svg?style=flat-square)](http://npm-stat.com/charts.html?package=xe-ajax)

基于 [Promise API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) 的异步请求函数，支持 nodejs、browser 环境。

## 兼容性

xe-ajax 依赖 Promise。如果您的环境不支持 Promise，使用 babel-polyfill 或者 bluebird.js

![IE](https://raw.github.com/alrra/browser-logos/master/src/archive/internet-explorer_7-8/internet-explorer_7-8_48x48.png) | ![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png) | ![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png)
--- | --- | --- | --- | --- | --- |
7+ ✔ | Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ | 6.1+ ✔ |

## CDN 安装

### cdnjs 获取最新版本

[点击浏览](https://cdn.jsdelivr.net/npm/xe-ajax/)

```JavaScript
<script src="https://cdn.jsdelivr.net/npm/xe-ajax/dist/xe-ajax.js"></script>
```

### unpkg 获取最新版本

[点击浏览](https://unpkg.com/xe-ajax/)

```JavaScript
<script src="https://unpkg.com/xe-ajax/dist/xe-ajax.js"></script>
```

## AMD 安装

### require.js 安装示例

```JavaScript
// require 配置
require.config({
  paths: {
    // ...,
    'xe-ajax': './dist/xe-ajax.min'
  }
})
define(['xe-ajax'], function (XEAjax) {
  // XEAjax.fetch(url)
})
```

## NPM 安装

```JavaScript
npm install xe-ajax --save
```

### NodeJS

```JavaScript
const XEAjax = require('xe-ajax')

XEAjax.getJSON('https://xuliangzhan.com/api/test/message/list/page/15/1').then(({page, result}) => {
  console.log(result)
})
```

## API

### 提供三种常用的便捷函数

* doAll ( iterable )
* ajax ( options )
* ~
* fetch ( url[, options] )
* fetchHead ( url[, options] )
* fetchDelete ( url[, options] )
* fetchJsonp ( url[, params, options] )
* fetchGet ( url[, params, options] )
* fetchPost ( url[, body, options] )
* fetchPut ( url[, body, options] )
* fetchPatch ( url[, body, options] )
* ~
* doHead ( url[, options] )
* doDelete ( url[, options] )
* doJsonp ( url[, params, options] )
* doGet ( url[, params, options] )
* doPost ( url[, body, options] )
* doPut ( url[, body, options] )
* doPatch ( url[, body, options] )
* ~
* headJSON ( url[, options] )
* deleteJSON ( url[, options] )
* jsonp ( url[, params, options] )
* getJSON ( url[, params, options] )
* postJSON ( url[, body, options] )
* putJSON ( url[, body, options] )
* patchJSON ( url[, body, options] )

### 入参

* url（字符串） 请求地址，可被自定义 options 属性覆盖
* params/body（可选，对象/数组） 要发送的数据，可被自定义 options 属性覆盖
* options （可选，对象） 参数

### options 参数

*: 只支持最高版本的浏览器。

| 参数 | 类型 | 描述 | 默认值 |
|------|------|-----|----|
| url | String | 请求地址 |  |
| baseURL | String | 基础路径 | 默认上下文路径 |
| method | String | 请求方法 | 'GET' |
| params | Object | 表单查询参数 |  |
| body | Object | 提交主体内容 |  |
| bodyType | String | 提交主体内容方式，可以设置json-data,form-data | 'json-data' |
| mode | String | 请求的模式, 可以设置cors,no-cors,same-origin | 'cors' |
| cache | String | 处理缓存方式,可以设置default,no-store,no-cache,reload,force-cache,only-if-cached | 'default' |
| credentials | String |  设置 cookie 是否随请求一起发送,可以设置: omit,same-origin,include | 'same-origin' |
| * **redirect** | String | 重定向模式, 可以设置follow,error,manual | 'follow' |
| * **referrer** | String | 可以设置no-referrer,client或URL | 'client' |
| * **referrerPolicy** | String | 可以设置: no-referrer,no-referrer-when-downgrade,origin,origin-when-cross-origin,unsafe-url |  |
| * **keepalive** | String | 选项可用于允许请求超过页面的生存时间 |  |
| * **integrity** | String | 包括请求的subresource integrity值 |  |
| jsonp | String | jsonp入参属性名 | 'callback' |
| jsonpCallback | String | jsonp响应结果的回调函数名 | 默认自动生成函数名 |
| timeout | Number | 设置请求超时 |  |
| headers | Object | 请求头包含信息 |  |
| transformParams | Function (params,request) | 用于改变URL参数 |  |
| paramsSerializer | Function (params,request) | 自定义URL序列化函数 |  |
| transformBody | Function (body,request) | 用于改变提交数据 |  |
| stringifyBody | Function (body,request) | 自定义转换提交数据的函数 |  |
| validateStatus | Function (response) | 自定义校验请求是否成功 | 默认200-299 |

### Headers

| 属性 | 类型 | 描述 |
|------|------|-----|
| set | Function (name,value) | 添加 |
| append | Function (name,value) | 追加 |
| get | Function (name) | 根据 name 获取 |
| has | Function (name) | 检查 name 是否存在 |
| delete | Function (name) | 根据 name 删除 |
| keys | Function | 以迭代器的形式返回所有 name |
| values | Function | 以迭代器的形式返回所有 value |
| entries | Function | 以迭代器的形式返回所有 [name, value] |
| forEach | Function (callback,context) | 迭代器 |

### Response

| 属性 | 类型 | 描述 |
|------|------|-----|
| body | ReadableStream | 返回一个只读的数据流 |
| bodyUsed | Boolean | 返回一个只读的布尔值，表示内容是否已被读取 |
| headers | Headers | 返回一个只读的响应头对象 |
| status | Number | 返回一个只读的响应状态码 |
| statusText | String | 返回一个只读的与状态码相对应的状态消息 |
| url | String | 返回一个只读的请求路径 |
| ok | Boolean | 返回一个只读的布尔值，表示响应是否成功 |
| redirected | Boolean | 返回一个只读的布尔值，表示响应是否为重定向请求的结果 |
| type | String | 返回一个只读的响应的类型 |
| clone | Function | 复制一个新的 Response 对象 |
| json | Function | 返回一个内容为 JSON 的 Promise 对象 |
| test | Function |返回一个内容为 Test 的 Promise 对象 |
| blob | Function | 返回一个内容为 Blob 的 Promise 对象 |
| arrayBuffer | Function | 返回一个内容为 ArrayBuffer 的 Promise 对象 |
| formData | Function | 返回一个内容为 FormData 的 Promise 对象 |

## 全局参数设置

```JavaScript
import XEAjax from 'xe-ajax'

XEAjax.setup({
  baseURL: 'https://xuliangzhan.com',
  bodyType: 'json-data',
  credentials: 'include',
  headers: {
    'Accept': 'application/json, text/plain, \*/\*;'
  },
  validateStatus (response) {
    // 注：如何需要实现复杂的场景判断，请使用拦截器
    //
    // 如果是 fetch 函数，则会将状态赋值给 ok 属性
    // 如果 do* 和 *JSON 函数，如果状态返回 false 则会进入 catch
    return response.status >= 200 && response.status < 300
  },
  transformParams (params, request) {
    // 用于在请求发送之前改变URL参数
    if (request.method === 'GET') {
      params.queryDate = params.queryDate.getTime()
    }
    return params
  },
  paramsSerializer (params, request) {
    // 自定义URL序列化函数,最终拼接在url
    // 执行顺序 transformParams > paramsSerializer
    return XEAjax.serialize(params)
  }，
  transformBody (body, request) {
    // 用于在请求发送之前改变提交数据
    body.startTime = body.startDate.getTime()
    return body
  },
  stringifyBody (body, request) {
    // 自定义格式化提交数据函数
    // 执行顺序 transformBody > stringifyBody
    return JSON.stringify(body)
  }
})
```

## 示例

### 基本使用

```JavaScript
const XEAjax = require('xe-ajax')

XEAjax.ajax({
  url: '/api/test/message/list',
  method: 'GET',
  params: {
    id: 1
  }
})
  .then(response => {
    if (response.ok) {
      // 请求成功
    } else {
      // 请求失败
    }
  })
  .catch(e => {
    // 发生错误
    console.log(e.message)
  })
```

### fetch 调用，返回一个结果为 Response 的 Promise 对象

```JavaScript
import XEAjax from 'xe-ajax'

XEAjax.fetch('/api/test/message/save', {
  method: 'POST',
  body: {
    name: 'test'
  }
})
  .then(response => {
    if (response.ok) {
      // 请求成功
    } else {
      // 请求失败
    }
  }).catch(e => {
    // 发生错误
    console.log(e.message)
  })

// Response Text
XEAjax.fetch('/api/test/message/list')
  .then(response => {
    response.text().then(text => {
      // text
    })
  })

// Response JSON
XEAjax.fetch('/api/test/message/list')
  .then(response => {
    response.json().then(data => {
      // data
    })
  })

// Response Blob
XEAjax.fetch('/api/test/message/list')
  .then(response => {
    response.blob().then(blob => {
      // blob
    })
  })

// Response ArrayBuffer
XEAjax.fetch('/api/test/message/list')
  .then(response => {
    response.arrayBuffer().then(arrayBuffer => {
      // arrayBuffer
    })
  })

// Response FormData
XEAjax.fetch('/api/test/message/list')
  .then(response => {
    response.formData().then(formData => {
      // formData
    })
  })

// 使用 "application/json" 方式提交，默认使用 JSON.stringify 序列化数据
let body1 = {
  name: 'u111',
  content: '123456'
}
XEAjax.fetchPost('/api/test/message/save', body1, {bodyType: 'json-data'})

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

// 查询参数和数据同时提交
XEAjax.fetchPost('/api/test/message/save', {name: 'u333', content: '123456'}, {params: {id: 111}})

XEAjax.fetchGet('/api/test/message/list')
XEAjax.fetchPut('/api/test/message/update', {name: 'u222'})
XEAjax.fetchDelete('/api/test/message/delete/1')
```

### 根据请求状态码（成功或失败），返回一个包含响应信息的 Peomise 对象 (v3.4.0+)

```JavaScript
import XEAjax from 'xe-ajax'

// 对请求的响应包含以下信息
// result => {data, status, statusText, headers}

// 根据 validateStatus 状态校验判断完成还是失败
XEAjax.doGet('/api/test/message/list').then(result => {
  // 请求成功 result.data
}).catch(result => {
  // 请求失败
})

XEAjax.doGet('/api/test/message/list/page/15/1')
XEAjax.doPost('/api/test/message/save', {name: 'u111'})
XEAjax.doPut('/api/test/message/update', {name: 'u222'})
XEAjax.doDelete('/api/test/message/delete/1')
```

### 根据请求状态码（成功或失败），返回响应结果为 JSON 的 Peomise 对象

```JavaScript
import XEAjax from 'xe-ajax'

// 根据 validateStatus 状态校验判断完成还是失败,直接可以获取响应结果
XEAjax.getJSON('/api/test/message/list').then(data => {
  // 请求成功 data
}).catch(data => {
  // 请求失败
})

XEAjax.getJSON('/api/test/message/list/page/15/1')
XEAjax.postJSON('/api/test/message/save', {name: 'u111'})
XEAjax.putJSON('/api/test/message/update', {name: 'u222'})
XEAjax.deleteJSON('/api/test/message/delete/1')
```

### jsonp 调用

```JavaScript
import XEAjax from 'xe-ajax'

// 例子1
// 请求路径: https://xuliangzhan.com/jsonp/test/message/list?callback=jsonp_xeajax_1521272815608_1
// 服务端返回结果: jsonp_xeajax_1521272815608_1([...])
XEAjax.fetchJsonp('/jsonp/test/message/list')
  .then(response => {
    if (response.ok) {
      response.json().then(data => {
        // data
      })
    }
  })

// 例子2
// 请求路径: https://xuliangzhan.com/jsonp/test/message/list?cb=jsonp_xeajax_1521272815608_2
// 服务端返回结果: jsonp_xeajax_1521272815608_2([...])
XEAjax.doJsonp('/jsonp/test/message/list', null, {jsonp: 'cb'})
  .then(response => {
    // response.data
  })

// 例子3
// 请求路径: https://xuliangzhan.com/jsonp/test/message/list/page/10/1?id=222&cb=func
// 服务端返回结果: func({page: {...}, result: [...])
XEAjax.jsonp('/jsonp/test/message/list/page/10/1', {id: 222}, {jsonp: 'cb',jsonpCallback: 'func'})
  .then(data => {
    // data
  })
```

### 并发多个请求

```JavaScript
import XEAjax from 'xe-ajax'

// 并发多个
Promise.all([
  XEAjax.fetchGet('/api/test/message/list'),
  XEAjax.doGet('/api/test/message/list'),
  XEAjax.postJSON('/api/test/message/save'), {name: 'n1'})
]).then(datas => {
  // 所有异步完成之后执行
}).catch(e => {
  // 发生异常
})

// 竞速，哪个先请求完成执行哪个
Promise.race([
  XEAjax.getJSON('/api/test/message/list'),
  XEAjax.getJSON('/api/test/message/list')
]).then(datas => {
  // 任意一个请求完成后执行
}).catch(e => {
  // 发生异常
})

// doAll 使用对象参数, 用法和 Promise.all 一致
let iterable2 = []
iterable2.push({url: '/api/test/message/list'})
iterable2.push({url: '/api/test/message/save', body: {name: 'n1'}}, method: 'POST'})
XEAjax.doAll(iterable2).then(datas => {
  // 所有异步完成之后执行
}).catch(e => {
  // 发生异常
})
```

### 嵌套请求

```JavaScript
import { fetchGet, doGet, getJSON } from 'xe-ajax'

// 相互依赖的嵌套请求
fetchGet('/api/test/message/info', {id: 3})
  .then(response => response.json())
  .then(data => fetchGet(`/api/test/message/delete/${data.id}`))
  .then(response => {
    if (response.ok) {
      response.json().then(data => {
        // data
      })
    }
  })
doGet('/api/test/message/info', {id: 3})
  .then(result => doGet(`/api/test/message/delete/${result.data.id}`))
  .then(result => {
    // result.data
  })
getJSON('/api/test/message/info', {id: 3})
  .then(data => getJSON(`/api/test/message/delete/${data.id}`))
  .then(data => {
    // data
  })
```

## 使用 async/await 处理异步

```JavaScript
import { getJSON } from 'xe-ajax'

async function init() {
  let list = await getJSON('/api/test/message/list')
  let data = await getJSON('/api/test/message/info', {id: list[0].id})
  console.log(list)
  console.log(data)
}

init()
```

## 上传/下载 (v3.4.9+)

### 参数

| 属性 | 类型 | 描述 |
|------|------|-----|
| onUploadProgress | Function (event) | 上传进度监听 |
| onDownloadProgress | Function (event) | 下载进度监听 |
| meanSpeed | Number | 默认0关闭，设置速率为均衡模式，每隔多少毫秒内计算平均速率 |
| fixed | Number | 默认2位数 |

### Progress 对象

| 属性 | 类型 | 描述 |
|------|------|-----|
| autoCompute | Boolean | 是否自动计算进度,默认true |
| value | Number | 当前进度 % |
| loaded | Object | 已传输大小 {value: 原始大小B, size: 转换后大小, unit: 转换后单位} |
| total | Object | 总大小 {value: 原始大小B, size: 转换后大小, unit: 转换后单位} |
| speed | Object | 传输速度/秒 {value: 原始大小B, size: 转换后大小, unit: 转换后单位} |
| remaining | Number | 剩余时间/秒 |
| time | Number | 时间戳 |

```JavaScript
import XEAjax from 'xe-ajax'

// 上传、下载
var file = document.querySelector('#myFile').files[0]
var formBody = new FormData()
formBody.append('file', file)
XEAjax.fetchPost('/api/upload', formBody)
XEAjax.doPost('/api/upload', formBody)
XEAjax.postJSON('/api/upload', formBody)


// 上传进度
// 创建一个进度监听对象
let progress = new XEAjax.Progress()
// 监听上传进度
progress.onUploadProgress = evnt => {
  console.log(`进度：${progress.value}% ${progress.loaded.size}${progress.loaded.unit}${progress.total.size}/${progress.total.unit}; 速度：${progress.speed.size}/${progress.speed.unit}秒; 剩余：${progress.remaining}秒`)
}
var file = document.querySelector('#myFile').files[0]
var formBody = new FormData()
formBody.append('file', file)
XEAjax.fetchPost('/api/upload', formBody, {progress})
// 进度：1% 176KB/14.26MB; 速度：1.69MB/秒; 剩余：8秒
// 进度：3% 368KB/14.26MB; 速度：640KB/秒; 剩余：22秒
// 进度：8% 1.16MB/14.26MB; 速度：1.56MB/秒; 剩余：8秒
// ...
// 进度：99% 14.08MB/14.26MB; 速度：119.6KB/秒; 剩余：2秒
// 进度：100% 14.26MB/14.26MB; 速度：114.4KB/秒; 剩余：0秒


// 下载进度
// 创建一个进度监听对象
let progress = new XEAjax.Progress()
// 监听下载进度
progress.onDownloadProgress = evnt => {
  console.log(`进度：${progress.value}% ${progress.loaded.size}${progress.loaded.unit}${progress.total.size}/${progress.total.unit}; 速度：${progress.speed.size}/${progress.speed.unit}秒; 剩余：${progress.remaining}秒`)
}
XEAjax.fetchGet('/api/download/file/1', {progress, method: 'GET'})
```

## 取消请求 (v3.2.0+)

### AbortController 控制器对象

允许控制一个或多个取消指令请求

```JavaScript
import XEAjax from 'xe-ajax'

// 创建一个控制器对象
// 如果当前环境支持 AbortController，则使用原生的 AbortController
let controller = new XEAjax.AbortController()
// let controller = new AbortController() // 或者使用原生
// 获取signal
let signal = controller.signal
// 给请求加入控制器 signal
XEAjax.fetchGet('/api/test/message/list', {id: 1}, {signal})
  .then(response => {
    // 请求成功
  }).catch(e => {
    // 请求被取消
  })
setTimeout(() => {
  // 终止请求
  controller.abort()
}, 50)
```

## 拦截器 (v3.0+)

拦截器可以对请求之前和请求之后的任何参数以及数据做处理，注意要调用next执行下一步，否则将停止执行。

### Request 拦截器

XEAjax.interceptors.request.use(Function(request, next))

```JavaScript
import XEAjax from 'xe-ajax'

// 请求之前拦截器
XEAjax.interceptors.request.use((request, next) => {
  // 用于请求的权限拦截、设置请求头、Token 验证、参数等处理...

  // 设置参数
  request.params.version = 1
  // 设置 Token 验证，预防 XSRF/CSRF 攻击
  request.headers.set('X-Token', cookie('x-id'))

  // 调用 next(),继续执行下一个拦截器
  next()
})
```

### Response 拦截器

XEAjax.interceptors.response.use(Function(response, next[, request]), Function(response, next))

next( [, newResponse] )

| 属性 | 类型 | 描述 |
|------|------|-----|
| status | Number | 设置响应的状态码 |
| statusText | String | 设置与状态码对应的状态消息 |
| body | Object | 设置响应主体内容 |
| headers | Headers、Object | 设置响应的头信息 |

```JavaScript
import XEAjax from 'xe-ajax'

// 请求完成之后拦截
XEAjax.interceptors.response.use((response, next) => {
  // 请求完成之后统一处理，例如校验登录是否失效、消息提示，特殊场景处理等...

  // 例子: 判断登录失效跳转
  if (response.status === 403) {
    router.replace({path: '/login'})
  } else {
    next()
  }
})

// 请求完成之后改变响应结果
XEAjax.interceptors.response.use((response, next) => {
  // 例如，对所有请求结果进行处理，返回统一的数据
  response.json().then(data => {
    let { status, statusText, headers } = response
    let body = {
      message: status === 200 ? 'success' : 'error',
      result: data
    }
    // 改变响应结果并继续执行下一个拦截器
    next({status, statusText, headers, body})
  })
}, (e, next) => {
  // 对所有请求错误返回统一的数据
  let body = {
    message: 'error',
    result: null
  }
  // 改变响应结果并继续执行下一个拦截器
  next({status: 200, body})
})
```

## 扩展函数

允许用您自己的实用函数扩展到 XEAjax

### ./ajax.js

```JavaScript
import XEAjax from 'xe-ajax'

export function fn1 () {}
export function fn2 () {}
// ...
```

### ./main.js

```JavaScript
import XEAjax from 'xe-ajax'
import ajaxFns from './ajax'

XEAjax.mixin(ajaxFns)

XEAjax.fn1()
XEAjax.fn2()
```

## License

Copyright (c) 2017-present, Xu Liangzhan