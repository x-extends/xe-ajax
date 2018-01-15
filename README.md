# XExtends ajax 提供一套基于 Promise XHR请求函数

## 通过NPM安装最新版本

``` shell
npm install xe-ajax --save
```

### 部分引入
``` shell
import { get, getJSON, post, postJSON } from 'xe-ajax'

get ('url', {id: 1})
getJSON ('url', {id: 1})
post ('url', {id: 1})
postJSON ('url', {id: 1})
```

### 引入所有
``` shell
import XEAjax from 'xe-ajax'

XEAjax.post('url', {id: 1})
XEAjax.postJSON ('url', {id: 1})
XEAjax.post ('url', {id: 1})
XEAjax.postJSON ('url', {id: 1})
```

### Vue全局安装
``` shell
import Vue from 'vue'
import XEAjax from 'xe-ajax'
import VXEAjax from 'vxe-ajax'

Vue.use(VXEAjax, XEAjax)

// 通过vue实例的调用方式
this.$ajax.get('url', {id: 1})
.then(response => {
  // response.body
})
this.$ajax.getJSON('url', {id: 1})
.then(data => {
  // data
})
```

## XEAjax API :
### xe-ajax 提供的便捷方法：
* ajax( options )
* all (iterable, context)
* get ( url, params, options )
* getJSON ( url, params, options )
* post ( url, body, options )
* postJSON ( url, body, options )
* put ( url, body, options )
* putJSON ( url, body, options )
* patch ( url, body, options )
* patchJSON ( url, body, options )
* del ( url, body, options )
* delJSON ( url, body, options )
* jsonp ( url, params, options )

### 接受三个参数：
* url（字符串），请求地址。可被options属性覆盖。
* params/body（可选，对象/数组），要发送的数据。可被options属性覆盖。
* options （可选，对象）参数

### 调用参数
| 参数 | 类型 | 描述 | 值 |
|------|------|-----|----|
| url | String | 请求地址 |  |
| baseURL | String | 基础路径 |  |
| method | String | 请求方法 | 默认get |
| params | Object/Array | 请求参数 |  |
| body | Object/Array | 提交参数 |  |
| bodyMode | String | 提交参数方式 | 默认json，如果要以表单方式提交改为'formData' |
| jsonp | String | 调用jsonp服务,回调属性默认callback | 默认callback |
| jsonpCallback | String | jsonp回调函数名 | 默认从window取值 |
| async | Boolean | 是否异步 | true |
| timeout | Number | 设置超时 |  |
| headers | Object | 请求头 |  |
| interceptor | Function ( request, next ) | 局部拦截器 |  |
| paramsSerializer | Function ( request ) | 自定义序列化函数 |  |
| transformBody | Function ( body, request ) | 改变提交参数 | |

### 设置默认参数
``` shell
import XEAjax from 'xe-ajax'

XEAjax.setup({
  baseURL: 'xxx.com',
  bodyMode: 'formData',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  paramsSerializer (request) {
    // 重写序列化函数
    return 'id=1&type=2'
  }，
  transformBody (body) {
    // 改变提交参数
    return body
  }
})
```

### 使用例子
``` shell
import { all, get, getJSON, postJSON } from 'xe-ajax'

// 返回response对象
get('url').then(response => {
  // response.body
}).catch(response => {
  // response.body
  // response.status
})
// 直接返回数据
getJSON('url').then(data => {
  // data
}).catch(data => {
  // data
})
// url参数和数据同时提交
postJSON('url', {name: 'aaa'}, {params: {id: 1}})
.then(data => {
  // data
}).catch(data => {
  // data
})
// 在所有的异步操作执行完
let iterable = [getJSON('url'), postJSON('url')]
all(iterable).then(datas => {
  // datas
}).catch(datas => {
  // datas
})
```

### 设置拦截器
``` shell
import XEAjax from 'xe-ajax'

XEAjax.interceptor.use((request, next) => {
  // 请求之前处理

  // 更改请求类型为POST
  request.method = 'post'

  // 继续执行,如果不调用next则不会往下走
  next()
})
XEAjax.interceptor.use((request, next) => {
  // 请求之前处理

  // 继续执行
  next( (response) => {
    // 请求之后处理

    // 更改请求结果数据
    response.body = {}
  })
})
XEAjax.interceptor.use((request, next) => {
  // 请求之前处理

  // 继续执行,如果希望直接返回数据
  // next({response: [{id: 1}, {id: 2}], status: 500})

  // 异步操作
  new Promise((resolve, reject) => {
    setTimeout(() => next({response: {a: 1, b: 2}, status: 200}), 100)
  })
  
})
```

### 自定义扩展
``` shell
import Vue from 'vue'
import XEAjax from 'xe-ajax'
import VXEAjax from 'vxe-ajax'
import customs from './customs' // ./customs.js export function custom1 () {} 

XEAjax.mixin(customs)
Vue.use(VXEAjax, XEAjax)

// 调用自定义扩展函数
this.$ajax.custom1()
```

### Mock虚拟服务
``` shell
import { getJSON, postJSON, delJSON } from 'xe-ajax'
import { Mock } from 'xe-ajax/mock'

// 对象方式
Mock('/services/test1/list', 'GET', {status: 200, response: {msg: 'success'}})
// 函数方式
Mock.GET('services/test2/list', (request, xhr) => {
  // 模拟后台逻辑
  if (request.params.id) {
    return {status: 200, response: {msg: 'success'}}
  }
  return {status: 500, response: {msg: 'error'}}
})
// 异步方式
Mock.GET('services/test2/list', (request, xhr) => {
  return new Promise( (resolve, reject) => {
    setTimeout(() = {
      xhr.status = 200
      xhr.response = {msg: 'success'}
      resolve(xhr)
    }, 100)
  })
})
// 动态路径
Mock.GET('/services/test1/list/{pageSize}/{currentPage}', (request, xhr) => {
  // 获取路径参数 request.pathVariable
  // request.pathVariable.pageSize 10
  // request.pathVariable.currentPage 1
  xhr.status = 200
  xhr.response = {pageVO: this.pathVariable, result: []}
  return xhr
})
// 定义多个
Mock([{
  path: 'services/test3',
  children: [{
    method: 'GET',
    path: 'list',
    xhr (request, xhr) {
      xhr.response = {msg: 'success'}
      return xhr
    }
  }, {
    method: 'POST',
    path: 'submit',
    xhr: {status: 200, response: {msg: 'success'}},
    children : [{
      path : 'deletelist',
      method: 'DELETE',
      xhr (request, xhr) {
        xhr.response = {status: 500, msg: 'error'}
        return xhr
      },
    }]
  }]
}])

// 调用
getJSON('/services/test1/list').then(data => {
  // data = {msg: 'success'}
})
getJSON('/services/test1/list/10/1').then(data => {
  // data = {msg: 'success'}
})

getJSON('services/test2/list', {id: 111}).then(data => {
  // data = {msg: 'success'}
})

getJSON('services/test2/list').catch(data => {
  // data = {msg: 'error'}
})

getJSON('services/test3/list').then(data => {
  // data = {msg: 'success'}
})

postJSON('services/test3/submit').then(data => {
  // data = {msg: 'success'}
})

delJSON('services/test3/submit/deletelist').catch(data => {
  // data = {msg: 'error'}
})

```

## XEAjaxMock API :
### xe-ajax/mock 提供的便捷方法：
* Mock( defines, options )
* Mock( path, method, xhr, options )
* Mock.GET( path, xhr, options )
* Mock.POST( path, xhr, options )
* Mock.PUT( path, xhr, options )
* Mock.DELETE( path, xhr, options )
* Mock.PATCH( path, xhr, options )
* setup( options )

### 接受两个参数：
* defines（数组）定义多个
* options （可选，对象）参数
### 接受四个参数：
* path（字符串）请求地址 占位符{key}支持动态路径: 例如: services/list/{key1}/{key2} 匹配 services/list/10/1
* method（字符串）请求方法 | 默认GET
* xhr（对象/方法(request, xhr)）数据或返回数据方法 {status: 200, response: []}
* options （可选，对象）参数

### 调用参数
| 参数 | 类型 | 描述 | 值 |
|------|------|-----|----|
| baseURL | String | 基础路径 |  |
| timeout | String | 模拟请求时间 | 默认'20-400' |

### 设置默认参数
``` shell
import XEAjaxMock from 'xe-ajax/mock'

XEAjaxMock.setup({
  timeout: '100-500'
})
```

## License
Copyright (c) 2017-present, Xu Liangzhan