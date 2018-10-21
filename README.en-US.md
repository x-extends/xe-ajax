# xe-ajax

[简体中文](https://github.com/xuliangzhan/xe-ajax) | English

[![npm version](https://img.shields.io/npm/v/xe-ajax.svg?style=flat-square)](https://www.npmjs.org/package/xe-ajax)
[![npm downloads](https://img.shields.io/npm/dm/xe-ajax.svg?style=flat-square)](http://npm-stat.com/charts.html?package=xe-ajax)

The asynchronous fetch function based on [Promise API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), Support the nodejs、browser environment.

## Browser Support

xe-ajax Depends on a native Promise implementation to be supported. If your environment doesn't support Promises, you can babel-polyfill or bluebird.js.

![IE](https://raw.github.com/alrra/browser-logos/master/src/archive/internet-explorer_7-8/internet-explorer_7-8_48x48.png) | ![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png) | ![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png)
--- | --- | --- | --- | --- | --- |
7+ ✔ | Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ | 6.1+ ✔ |

## CDN

[All cdnjs package](https://cdn.jsdelivr.net/npm/xe-ajax/)

```HTML
<script src="https://cdn.jsdelivr.net/npm/xe-ajax/dist/xe-ajax.js"></script>
```

[All unpkg package](https://unpkg.com/xe-ajax/)

```HTML
<script src="https://unpkg.com/xe-ajax/dist/xe-ajax.js"></script>
```

## AMD

```JavaScript
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

## NPM

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

### Base functions

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

### Convenience function

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

### Arguments

* **url** Request interface contains the URL of the request.
* **params/body** The params/body contents to be sent.
* **options** Is an optional options object.

### Options

*: Only the highest version of the browser is supported.

| Name | Type | Description | default value |
|------|------|-----|----|
| url | String | Request interface contains the URL of the request. |  |
| baseURL | String | Request base URL | Context path |
| method | String | The method read-only property of the Request interface contains the request's method | 'GET' |
| params | Object | Request the params contents. |  |
| body | Object | Request the body contents. |  |
| bodyType | String | Submit type, You can set: json-data,form-data | 'json-data' |
| mode | String | The mode you want to use for the request, You can set: cors,no-cors,same-origin | 'cors' |
| cache | String | Handling cache mode, You can set: default,no-store,no-cache,reload,force-cache,only-if-cached | 'default' |
| credentials | String | Set the cookie to be sent along with the request, You can set: omit,same-origin,include | 'same-origin' |
| redirect | String | The redirect mode to use, You can set: follow,error,manual | 'follow' |
| * **referrer** | String | Specifies the value of the referer HTTP header. You can set: no-referrer,client,URL | 'client' |
| * **referrerPolicy** | String | You can set: no-referrer,no-referrer-when-downgrade,origin,origin-when-cross-origin,unsafe-url |  |
| * **keepalive** | String | The keepalive option can be used to allow the request to outlive the page. |  |
| * **integrity** | String | Contains the subresource integrity value of the request. |  |
| jsonp | String | set jsonp Callback parameter name. | 'callback' |
| jsonpCallback | String | Set jsonp callback function name. | Default is a random number with json_xeajax_ prefix |
| timeout | Number | Setting the request timeout. |  |
| headers | Object | Optional header fields. | {'Accept': 'application/json, text/plain, */*'} |
| transformParams | Function (params,request) | Change the URL parameter before sending the request. |  |
| paramsSerializer | Function (params,request) | The custom URL serialization function is finally spliced in the URL. | XEAjax.serialize |
| transformBody | Function (body,request) | Change the commit body before sending the request. |  |
| stringifyBody | Function (body,request) | Customize the body stringify function. | JSON.stringify |
| validateStatus | Function (response) | Verify that the request is successful. | 200-299 |

### Headers

| Name | Type | Description |
|------|------|-----|
| set | Function (name,value) | Sets a new value for an existing header inside a Headers object, or adds the header if it does not already exist. |
| append | Function (name,value) | Appends a new value onto an existing header inside a Headers object, or adds the header if it does not already exist. |
| get | Function (name) | Returns a ByteString sequence of all the values of a header within a Headers object with a given name. |
| has | Function (name) | Returns a boolean stating whether a Headers object contains a certain header. |
| delete | Function (name) | Deletes a header from a Headers object. |
| keys | Function | Returns an iterator allowing you to go through all keys of the key/value pairs contained in this object. |
| values | Function | Returns an iterator allowing you to go through all values of the key/value pairs contained in this object. |
| entries | Function | Returns an iterator allowing to go through all key/value pairs contained in this object. |
| forEach | Function (callback,context) | Executes a provided function once for each array element. |

### Response

| Name | Type | Description |
|------|------|-----|
| body | ReadableStream | The body read-only property of the Body mixin is a simple getter used to expose a ReadableStream of the body contents. |
| bodyUsed | Boolean | The bodyUsed read-only property of the Body mixin contains a Boolean that indicates whether the body has been read yet. |
| headers | Headers | The headers read-only property of the Response interface contains the Headers object associated with the response. |
| status | Number | The status read-only property of the Response interface contains the status code of the response. |
| statusText | String | The statusText read-only property of the Response interface contains the status message corresponding to the status code. |
| url | String | The url read-only property of the Response interface contains the URL of the response. The value of the url property will be the final URL obtained after any redirects.  |
| ok | Boolean | The ok read-only property of the Response interface contains a Boolean stating whether the response was successful. |
| redirected | Boolean | The read-only redirected property of the Response interface indicates whether or not the response is the result of a request you made which was redirected. |
| type | String | The type read-only property of the Response interface contains the type of the response. |
| clone | Function | Creates a clone of a Response object. |
| json | Function | Takes a Response stream and reads it to completion. It returns a promise that resolves with the result of parsing the body text as JSON. |
| test | Function | Takes a Response stream and reads it to completion. It returns a promise that resolves with a USVString (text). |
| blob | Function | Takes a Response stream and reads it to completion. It returns a promise that resolves with a Blob. |
| arrayBuffer | Function | Takes a Response stream and reads it to completion. It returns a promise that resolves with an ArrayBuffer. |
| formData | Function | Takes a Response stream and reads it to completion. It returns a promise that resolves with a FormData object. |

## Default Global Settings

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
    return response.status >= 200 && response.status < 300
  },
  transformParams (params, request) {
    if (request.method === 'GET') {
      params.queryDate = params.queryDate.getTime()
    }
    return params
  },
  paramsSerializer (params, request) {
    return XEUtils.serialize(params)
  }，
  transformBody (body, request) {
    body.startTime = body.startDate.getTime()
    return body
  },
  stringifyBody (body, request) {
    return JSON.stringify(body)
  }
})
```

## Examples

### ajax

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
      // success
    } else {
      // failed
    }
  }).catch(e => {
    // error
    console.log(e.message)
  })
```

### fetch to Response

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
      // success
    } else {
      // failed
    }
  }).catch(e => {
    // error
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
XEAjax.fetchGet('/api/test/message/list')
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

// Submit 'application/json', default uses JSON.stringify(request.body)
let body1 = {
  name: 'u111',
  password: '123456'
}
XEAjax.fetchPost('/api/test/message/save', body1, {bodyType: 'json-data'})

// Submit 'application/x-www-form-urlencoded', default uses XEAjax.serialize(request.body)
let body2 = {
  name: 'u222',
  password: '123456'
}
XEAjax.fetchPost('/api/test/message/save', body2, {bodyType: 'form-data'})

// Submit 'multipart/form-data'
let file = document.querySelector('#myFile').files[0]
let formBody = new FormData()
formBody.append('file', file)
XEAjax.fetchPost('/api/test/message/save', formBody)

// Submit body and query params.
XEAjax.fetchPost('/api/test/message/save', {name: 'u333',password: '123456'}, {params: {id: 111}})

XEAjax.fetchGet('/api/test/message/list')
XEAjax.fetchPut('/api/test/message/update', {name: 'u222'})
XEAjax.fetchDelete('/api/test/message/delete/1')
```

### fetch to Response Schema (v3.4.0+)

```JavaScript
import XEAjax from 'xe-ajax'

// The response for a request contains the following information.
// Result => {data, status, statusText, headers}

// The completion or failure is based on state check.
XEAjax.doGet('/api/test/message/list').then(result => {
  // success result.data
}).catch(result => {
  // failed
})

XEAjax.doGet('/api/test/message/list/page/15/1')
XEAjax.doPost('/api/test/message/save', {name: 'u111'})
XEAjax.doPut('/api/test/message/update', {name: 'u222'})
XEAjax.doDelete('/api/test/message/delete/1')
```

### fetch to JSON

```JavaScript
import XEAjax from 'xe-ajax'

// The completion or failure is based on state check.
XEAjax.getJSON('/api/test/message/list').then(data => {
  // success
}).catch(data => {
  // failed
})

XEAjax.getJSON('/api/test/message/list/page/15/1').then(({page, result}) => {
  // success
})

XEAjax.postJSON('/api/test/message/save', {name: 'test'})
XEAjax.postJSON('/api/test/message/save', {name: 'test', password: '123456'}, {bodyType: 'json-data'})
XEAjax.postJSON('/api/test/message/save', {name: 'test', password: '123456'}, {bodyType: 'form-data'})

let file = document.querySelector('#myFile').files[0]
let formBody = new FormData()
formBody.append('file', file)
XEAjax.postJSON('/api/test/message/save', formBody)
```

### jsonp

```JavaScript
import XEAjax from 'xe-ajax'

// Case 1:
// http://xuliangzhan.com/api/jsonp/public/message?callback=jsonp_xeajax_1521272815608_1
// jsonp_xeajax_1521272815608_1({message: 'success'})
XEAjax.fetchJsonp('/api/jsonp/public/message')
  .then(response => {
    if (response.ok) {
      response.json().then(data => {
        // data
      })
    }
  })

// Case 2:
// http://xuliangzhan.com/api/jsonp/public/message?cb=jsonp_xeajax_1521272815608_2
// jsonp_xeajax_1521272815608_2({message: 'success'})
XEAjax.doJsonp('/api/jsonp/public/message', null, {jsonp: 'cb'})
  .then(response => {
    // response.data
  })

// Case 3:
// http://xuliangzhan.com/api/jsonp/public/message?id=222&cb=func
// func({message: 'success'})
XEAjax.jsonp('/api/jsonp/public/message', {id: 222}, {jsonp: 'cb',jsonpCallback: 'func'})
  .then(data => {
    // data
  })
```

### Multiple Requests

```JavaScript
import XEAjax from 'xe-ajax'

Promise.all([
  XEAjax.fetchGet('/api/test/message/list'),
  XEAjax.doGet('/api/test/message/list'),
  XEAjax.postJSON('/api/test/message/save'), {name: 'n1'})
]).then(datas => {
  // all finish
}).catch(e => {
  // error
})

Promise.race([
  XEAjax.getJSON('/api/test/message/list'),
  XEAjax.getJSON('/api/test/message/list')
]).then(datas => {
  // finish
}).catch(e => {
  // error
})

// doAll Use object parameters, The use is consistent with that of Promise.
let iterable2 = []
iterable2.push({url: '/api/test/message/list'})
iterable2.push({url: '/api/test/message/save', body: {name: 'n1'}}, method: 'POST'})
XEAjax.doAll(iterable2).then(datas => {
  // all finish
}).catch(e => {
  // error
})
```

### Nested Requests

```JavaScript
import { fetchGet, doGet, getJSON } from 'xe-ajax'

// This should be avoided in the project.
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

## Promises, async/await

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

## Upload/Download (v3.4.9+)

| Name | Type | Description |
|------|------|-----|
| onUploadProgress | Function (event) | Upload progress |
| onDownloadProgress | Function (event) | Download progress |
| meanSpeed | Number | Default 0 off,Set the rate to equalization mode and calculate the average rate every millisecond. |
| fixed | Number | default 2 |

### Progress

| Name | Type | Description |
|------|------|-----|
| autoCompute | Boolean | Whether to automatically calculate. |
| value | Number | Current progress % |
| loaded | Object | Transmitted size {value, size, unit} |
| total | Object | Total size {value, size, unit} |
| speed | Object | Transmission speed/s {value, size, unit} |
| remaining | Number | RemainingTime/s |
| time | Number | timestamp |

Listener request progress.

```JavaScript
import XEAjax from 'xe-ajax'

var file = document.querySelector('#myFile').files[0]
var formBody = new FormData()
formBody.append('file', file)
XEAjax.fetchPost('/api/upload', formBody)
XEAjax.doPost('/api/upload', formBody)
XEAjax.postJSON('/api/upload', formBody)


// Upload
// Create a Progress.
let progress = new XEAjax.Progress()
progress.onUploadProgress = evnt => {
  console.log(`Progress:${progress.value}% ${progress.loaded.size}${progress.loaded.unit}${progress.total.size}/${progress.total.unit}; Speed:${progress.speed.size}/${progress.speed.unit}s; Remaining:${progress.remaining}s`)
}
var file = document.querySelector('#myFile').files[0]
var formBody = new FormData()
formBody.append('file', file)
XEAjax.fetchPost('/api/upload', formBody, {progress})
// Progress:1% 176KB/14.26MB; Speed:1.69MB/s; Remaining:8s
// Progress:3% 368KB/14.26MB; Speed:640KB/s; Remaining:22s
// Progress:8% 1.16MB/14.26MB; Speed:1.56MB/s; Remaining:8s
// ...
// Progress:99% 14.08MB/14.26MB; Speed:119.6KB/s; Remaining:2s
// Progress:100% 14.26MB/14.26MB; Speed:114.4KB/s; Remaining:0s


// Download
// Create Progress object.
let progress = new XEAjax.Progress()
progress.onDownloadProgress = evnt => {
  console.log(`Progress:${progress.value}% ${progress.loaded.size}${progress.loaded.unit}${progress.total.size}/${progress.total.unit}; Speed:${progress.speed.size}/${progress.speed.unit}s; Remaining:${progress.remaining}s`)
}
XEAjax.fetchGet('/api/download/file/1', {progress, method: 'GET'})
```

## Cancel request (v3.2.0+)

### AbortController

Allows control of one or more cancellation requests.

```JavaScript
import XEAjax from 'xe-ajax'

// Create a controller.
// If the current environment supports AbortController, native AbortController is used
let controller = new XEAjax.AbortController()
// let controller = new AbortController()
let signal = controller.signal
// Associate the signal and controller with the fetch request.
XEAjax.fetchGet('/api/test/message/list', {id: 1}, {signal})
  .then(response => {
    // finish
  }).catch(function (e) {
    // error
  })
setTimeout(() => {
  controller.abort()
}, 50)
```

## Interceptor (v3.0+)

### Request interceptor

XEAjax.interceptors.request.use(Function(request, next))

```JavaScript
import XEAjax from 'xe-ajax'

// Trigger before the request is sent.
XEAjax.interceptors.request.use((request, next) => {
  // Can be used for unified permission intercept, set request header, Token authentication, parameters, etc.

  // Set params
  // Request.params.version = Date.now()

  // Set Token validation to prevent XSRF/CSRF attacks.
  request.headers.set('X-Token', cookie('x-id'))

  // Call next(), execute the next interceptor.
  next()
})
```

### Response interceptor

XEAjax.interceptors.response.use(Function(response, next[, request]), Function(response, next))

next( [, newResponse] )

| Name | Type | Description |
|------|------|-----|
| status | Number | Setting the status code of the response. |
| statusText | String | Setting the status message corresponding to the status code. |
| body | Object | Setting the body contents. |
| headers | Headers、Object | Setting the Headers object associated with the response. |

```JavaScript
import XEAjax from 'xe-ajax'

// Intercept when the request is finish.
XEAjax.interceptors.response.use((response, next) => {
  // It can be used for unified processing after a request is finish, such as checking for invalidation, message prompt, special scenario processing, etc.

  // Example: check login failover.
  if (response.status === 403) {
    router.replace({path: '/login'})
    // Break up
  } else {
    // Call next(), execute the next interceptor.
    next()
  }
})

// Intercept and change the response data after the request is complete.
XEAjax.interceptors.response.use((response, next) => {
  response.json().then(data => {
    let { status, statusText, headers } = response
    let body = {
      message: status === 200 ? 'success' : 'error',
      result: data
    }
    // Change the response data and continue with the next interceptor.
    next({status, statusText, headers, body})
  })
}, (e, next) => {
  // Turn all the exception errors to finish.
  let body = {
    message: 'error',
    result: null
  }
  // Change the response data and continue with the next interceptor.
  next({status: 200, body})
})
```

## mixing

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