# XEAjax 是一个轻量级XHR处理函数，基于 Promise 实现，支持 Mock 虚拟服务

## 通过NPM安装最新版本

``` shell
npm install xe-ajax --save
```

### 部分引入
``` shell
import { doGet, getJSON, doPost, postJSON } from 'xe-ajax'

doGet ('services/user/list', {id: 1})
getJSON ('services/user/list', {id: 1})
doPost ('services/user/save', {id: 1})
postJSON ('services/user/save', {id: 1})
```

### 引入所有
``` shell
import XEAjax from 'xe-ajax'

XEAjax.doGet('services/user/list', {id: 1})
XEAjax.getJSON ('services/user/list', {id: 1})
XEAjax.doPost ('services/user/save', {id: 1})
XEAjax.postJSON ('services/user/save', {id: 1})
```

## XEAjax :
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
| transformParams | Function ( params, request ) | 用于改变URL参数 | |
| paramsSerializer | Function ( params, request ) | 自定义URL序列化函数 |  |
| transformBody | Function ( body, request ) | 用于改变提交数据 | |
| formatBody | Function ( body, request ) | 自定义格式化数据函数 | |

### 全局参数
``` shell
import XEAjax from 'xe-ajax'
import { dateToString } from 'xe-utils'

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
    body.startDate = dateToString(body.startDate, 'yyyy-MM-dd HH:mm:ss')
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
import { stringToDate } from 'xe-utils'

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
      startDate: stringToDate(item.startDate, 'yyyy-MM-dd HH:mm:ss')
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
const handle1 = cancelable()
doGet('services/user/list', null, {cancelable: handle1})
handle1.cancel() // {status: 0, response: ''}

// 中断XHR请求，执行承诺完成
const handle2 = cancelable()
doGet('services/user/list', null, {cancelable: handle2})
handle2.resolve()
// handle2.resolve({msg: 'cancel2'}) // 支持自定义响应数据 {status: 200, response: {msg: 'cancel2'}}

// 中断XHR请求，执行承诺失败
const handle3 = cancelable()
doGet('services/user/list', null, {cancelable: handle3})
doPost('services/user/save', {name: 'test', password: '123456'}, {cancelable: handle3, bodyType: 'FROM_DATA'})
setTimeout(() => {
  handle3.reject()
  // handle3.reject({msg: 'cancel3'}) // 支持自定义响应数据 {status: 500, response: {msg: 'cancel3'}}
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

## XEMock 虚拟服务
### 'xe-ajax/mock' 提供的便捷方法：
* XEMock( defines, options )
* XEMock( path, method, xhr, options )
* GET( path, xhr, options )
* POST( path, xhr, options )
* PUT( path, xhr, options )
* DELETE( path, xhr, options )
* PATCH( path, xhr, options )
* setup( options )

### 接受两个参数：
* defines（数组）定义多个
* options （可选，对象）参数
### 接受四个参数：
* path（字符串）请求地址 占位符{key}支持动态路径: 例如: services/list/{key1}/{key2} 匹配 services/list/10/1
* method（字符串）请求方法 | 默认GET
* xhr（对象/方法(request, xhr)）数据或返回数据方法 {status: 200, response: [], headers: {}}
* options （可选，对象）参数

### 参数说明
| 参数 | 类型 | 描述 | 值 |
|------|------|-----|----|
| baseURL | String | 基础路径 |  |
| timeout | String | 模拟请求时间 | 默认'20-400' |
| log | Boolean | 控制台输出 Mock 日志 | true |

### 全局参数
``` shell
import XEMock from 'xe-ajax/mock'

XEMock.setup({
  baseURL: 'http://xuliangzhan.com',
  timeout: '100-500'
})
```

### 示例1
``` shell
import { GET, POST, PUT, PATCH, DELETE } from 'xe-ajax/mock'

// 对象方式
GET('services/user/list', {status: 200, response: {msg: 'success'}})
// 动态路径
PUT('services/user/list/{pageSize}/{currentPage}', (request, xhr) => {
  // 获取路径参数 request.pathVariable
  // request.pathVariable.pageSize 10
  // request.pathVariable.currentPage 1
  xhr.status = 200
  xhr.headers = {'content-type': 'application/json;charset=UTF-8'}
  xhr.response = {pageVO: this.pathVariable, result: []}
  return xhr
})
// 函数方式
POST('services/user/save', (request, xhr) => {
  return {status: 200, response: {msg: 'success'}}
})
// 异步方式
PATCH('services/user/patch', (request, xhr) => {
  return new Promise( (resolve, reject) => {
    setTimeout(() = {
      xhr.status = 200
      xhr.response = {msg: 'success'}
      resolve(xhr)
    }, 100)
  })
})
// 函数方式,模拟后台校验
DELETE('services/user/del', (request, xhr) => {
  // 模拟后台逻辑 对参数进行校验
  if (request.params.id) {
    return {status: 200, response: {msg: 'success'}}
  }
  return {status: 500, response: {msg: 'error'}}
})
```

### 示例2
``` shell
import XEMock from 'xe-ajax/mock'

// 定义
XEMock.GET('services/user/list', {status: 200, response: {msg: 'success'}})
XEMock.POST('services/user/save', {status: 200, response: {msg: 'success'}})
XEMock.PUT('services/user/update', {status: 200, response: {msg: 'success'}})
XEMock.DELETE('services/user/delete', {status: 200, response: {msg: 'success'}})
XEMock.PATCH('services/user/patch', {status: 200, response: {msg: 'success'}})

// 定义单个
XEMock('services/user/list', 'GET', (request, xhr) => {
  xhr.response = {msg: 'success'}
  return xhr
})

// 定义多个
XEMock([{
  path: 'services/user',
  children: [{
    method: 'POST',
    path: 'submit',
    xhr: {status: 200, response: {msg: 'success'}},
  },
  {
    method: 'DELETE',
    path : 'del',
    xhr (request, xhr) {
      xhr.response = {status: 500, msg: 'error'}
      return xhr
    }
  ]
}])
```

### 正常调用,不需要任何改动
``` shell
import { doGet, getJSON, postJSON, deleteJSON } from 'xe-ajax'

doGet('services/user/list').then(response => {
  // response.status = 200
  // response.body = {msg: 'success'}
})
getJSON('services/user/list/10/1').then(data => {
  // data = {msg: 'success'}
})

postJSON('services/save', {id: 111}).then(data => {
  // data = {msg: 'success'}
})

postJSON('services/user/save').catch(data => {
  // data = {msg: 'error'}
})

patchJSON('services/user/patch').then(data => {
  // data = {msg: 'success'}
})

postJSON('services/user/submit').then(data => {
  // data = {msg: 'success'}
})

deleteJSON('services/user/del').catch(data => {
  // data = {msg: 'error'}
})
```

## License
Copyright (c) 2017-present, Xu Liangzhan