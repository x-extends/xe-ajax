# xe-ajax 使用Promise提供便捷http调用函数

## 通过NPM安装最新版本

``` shell
npm install xe-ajax --save
```

### 按需引入
``` shell
import { get, getJSON, post, postJSON } from 'xe-ajax'

get ('url').then().then(response => {
  response.body
}).catch(response => {
  response.body
})
getJSON ('url', {id: 1}).then(data => {
  data
}).catch(data => {
  data
})
```

### 引入所有
``` shell
import XEAjax from 'xe-ajax'

XEAjax.post ('url').then().then(response => {
  response.body
}).catch(response => {
  response.body
})
XEAjax.postJSON ('url', {id: 1}).then(data => {
  data
}).catch(data => {
  data
})
```

### Vue全局安装，通过实例调用this.$ajax函数this默认指向当前vue实例
``` shell
import Vue from 'vue'
import XEAjax from 'xe-ajax'
import VXEAjax from 'vxe-ajax'

Vue.use(VXEAjax, XEAjax)

// 在Vue实例中使用
this.$ajax.getJSON ('url', {id: 1}).then(data => {
  data
}).catch(data => {
  data
})
```

### 支持自定义扩展
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

## API :
### vxe-ajax 提供的便捷方法：
* ajax( options )
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
| iterators | Function | 局部拦截器 |  |

### 设置默认参数
``` shell
Vue.ajax.defaults = {
  baseURL: 'xxx.com',
  bodyMode: 'formData',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
}
```

### 使用例子
``` shell
// 返回response对象
this.get('url').then(response => {
  // this 指向当前vue实例
  response.body
}).catch(response => {
  // this 指向当前vue实例
  response.body
  response.status
})
// 直接返回数据
this.getJSON('url').then(data => {
  // this 指向当前vue实例
}).catch(data => {
  // this 指向当前vue实例
})
// url参数和数据同时提交
this.postJSON('url', {name: 'aaa'}, {params: {id: 1}}).then(data => {
  // this 指向当前vue实例
}).catch(data => {
  // this 指向当前vue实例
})
```

### 设置拦截器
``` shell
Vue.ajax.oninterceptor = (request, next) => {
  // 请求之前处理

  // 更改请求类型为POST
  request.method = 'post'

  // 继续执行,如果不调用next则不会往下走
  next()
}
Vue.ajax.oninterceptor = (request, next) => {
  // 请求之前处理

  // 继续执行
  next( (response) => {
    // 请求之后处理

    // 更改请求结果数据
    response.body = {}
  })
}
Vue.ajax.oninterceptor = (request, next) => {
  // 请求之前处理

  // 继续执行,如果希望直接返回数据,结束请求

  // 直接返回
  // next({response: [{id: 1}, {id: 2}], status: 500})
  // 异步返回
  new Promise( (resolve, reject) => {
    setTimeout( () => {
      next({response: {a: 1, b: 2}, status: 200})
    }, 10)
  })
  
}
```

## License
Copyright (c) 2017-present, Xu Liangzhan