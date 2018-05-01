# xe-ajax

[![npm version](https://img.shields.io/npm/v/xe-ajax.svg?style=flat-square)](https://www.npmjs.org/package/xe-ajax)
[![npm downloads](https://img.shields.io/npm/dm/xe-ajax.svg?style=flat-square)](http://npm-stat.com/charts.html?package=xe-ajax)

The asynchronous request function based on Promise, Support xhr、fetch、jsonp and Mock，Simple API, lightweight encapsulation, high expansion.

## Browser Support
xe-ajax depends on a native ES6 Promise implementation to be supported. If your environment doesn't support ES6 Promises, you can polyfill.

![IE](https://raw.github.com/alrra/browser-logos/master/src/archive/internet-explorer_7-8/internet-explorer_7-8_48x48.png) | ![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png) | ![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png)
--- | --- | --- | --- | --- | --- |
8+ ✔ | Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ | 6.1+ ✔ |

## CDN
[All cdnjs package](https://cdn.jsdelivr.net/npm/xe-ajax/)
``` shell
<script src="https://cdn.jsdelivr.net/npm/xe-ajax/dist/xe-ajax.js"></script>
```
[All unpkg package](https://unpkg.com/xe-ajax/)
``` shell
<script src="https://unpkg.com/xe-ajax/dist/xe-ajax.js"></script>
```
## AMD
``` shell
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
* doAll ( iterable )
* ajax ( options )
* 
* fetch ( url, options )
* fetchHead ( url, options )
* fetchDelete ( url, options )
* fetchJsonp ( url, params, options )
* fetchGet ( url, params, options )
* fetchPost ( url, body, options )
* fetchPut ( url, body, options )
* fetchPatch ( url, body, options )
* 
* doHead ( url, options )
* doDelete ( url, options )
* doJsonp ( url, params, options )
* doGet ( url, params, options )
* doPost ( url, body, options )
* doPut ( url, body, options )
* doPatch ( url, body, options )
* 
* headJSON ( url, options )
* deleteJSON ( url, options )
* jsonp ( url, params, options )
* getJSON ( url, params, options )
* postJSON ( url, body, options )
* putJSON ( url, body, options )
* patchJSON ( url, body, options )

### Arguments
* **url** is the url to fetch
* **params/body** the data to be sent.
* **options** is an optional options object

### Options
| Name | Type | Description | default value |
|------|------|-----|----|
| url | String | is the url to fetch |  |
| baseURL | String | base URL | defaults to context path |
| method | String | request method | defaults to 'GET' |
| params | Object | request params |  |
| body | Object | request body |  |
| bodyType | String | submit type, You can set [**'json-data'**,**'form-data'**] | defaults to 'json-data' |
| cache | String | handling cache mode, You can set [**'default'**,**'no-store'**,**'no-cache'**,**'reload'**,**'force-cache'**,**'only-if-cached'**] | defaults to 'default' |
| credentials | String | set the cookie to be sent along with the request, You can set [**'omit'**,**'same-origin'**,**'include'**] | defaults to 'same-origin' |
| jsonp | String | set jsonp callback parameter name | defaults to 'callback' |
| jsonpCallback | String | set jsonp callback function name | default is a random number with json_xeajax_ prefix |
| timeout | Number | set a timeout in ms |  |
| headers | Object | optional header fields |  |
| transformParams | Function ( params, request ) | change the URL parameter before sending the request. |  |
| paramsSerializer | Function ( params, request ) | the custom URL serialization function is finally spliced in the URL. |  |
| transformBody | Function ( body, request ) | change the commit body before sending the request. |  |
| stringifyBody | Function ( body, request ) | customize the body stringify function. |  |
| validateStatus | Function ( response ) | verify that the request is successful. | response.status >= 200 && response.status < 300 |

### Headers
| Name | Type | Description |
|------|------|-----|
| set | Function ( name, value ) | Sets a new value for an existing header inside a Headers object, or adds the header if it does not already exist. |
| append | Function ( name, value ) | Appends a new value onto an existing header inside a Headers object, or adds the header if it does not already exist. |
| get | Function ( name ) | Returns a ByteString sequence of all the values of a header within a Headers object with a given name. |
| has | Function ( name ) | Returns a boolean stating whether a Headers object contains a certain header. |
| delete | Function ( name ) | Deletes a header from a Headers object. |
| keys | Function | Returns an iterator allowing you to go through all keys of the key/value pairs contained in this object. |
| values | Function | Returns an iterator allowing you to go through all values of the key/value pairs contained in this object. |
| entries | Function | Returns an iterator allowing to go through all key/value pairs contained in this object. |
| forEach | Function ( callback, context ) | Executes a provided function once for each array element. |

### Response
| Name | Type | Description |
|------|------|-----|
| body | ReadableStream | A simple getter used to expose a ReadableStream of the body contents. |
| bodyUsed | Boolean | Stores a Boolean that declares whether the body has been used in a response yet. |
| headers | Headers | Contains the Headers object associated with the response. |
| status | Number | HTTP status code |
| statusText | String | Contains the status message corresponding to the status code |
| url | String | Contains the URL of the response. |
| ok | Boolean | Contains a boolean stating whether the response was successful (status in the range 200-299) or not. |
| redirected | Boolean | Indicates whether or not the response is the result of a redirect; that is, its URL list has more than one entry. |
| type | String | Contains the type of the response |
| clone | Function | Creates a clone of a Response object. |
| json | Function | Takes a Response stream and reads it to completion. It returns a promise that resolves with the result of parsing the body text as JSON. |
| test | Function | Takes a Response stream and reads it to completion. It returns a promise that resolves with a USVString (text). |
| blob | Function | Takes a Response stream and reads it to completion. It returns a promise that resolves with a Blob. |
| arrayBuffer | Function | Takes a Response stream and reads it to completion. It returns a promise that resolves with an ArrayBuffer. |
| formData | Function | Takes a Response stream and reads it to completion. It returns a promise that resolves with a FormData object. |

## Default global settings
``` shell
import XEAjax from 'xe-ajax'

XEAjax.setup({
  baseURL: 'http://xuliangzhan.com',
  bodyType: 'json-data',
  credentials: 'include',
  log: false,
  headers: {
    'Accept': 'application/json, text/plain, \*/\*;'
  },
  transformParams (params, request) {
    params.id = 123
    return params
  },
  paramsSerializer (params, request) {
    return 'id=123&name=2'
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
``` shell
import XEAjax from 'xe-ajax'

XEAjax.ajax({
  url: '/api/user/list',
  method: 'GET',
  params: {id: 1}
}).then(response => {
  // finish
}).catch(e => {
  // error
})

```
### fetch to Response
``` shell
import XEAjax from 'xe-ajax'

XEAjax.fetch('/api/user/list', {
  method: 'POST',
  body: {name: 'test'}
}).then(response => {
  // finish
}).catch(e => {
  // error
})

// Response Text
XEAjax.fetchGet('/api/user/list').then(response => response.text()).then(text => {
  // get text
})

// Response JSON
XEAjax.fetchGet('/api/user/list').then(response => response.json()).then(json => {
  // get json
})

// Response Blob
XEAjax.fetchGet('/api/user/list').then(response => response.blob()).then(blob => {
  // get blob
})

// Response ArrayBuffer
XEAjax.fetchGet('/api/user/list').then(response => response.arrayBuffer()).then(arrayBuffer => {
  // get arrayBuffer
})

// Response FormData
XEAjax.fetchGet('/api/user/list').then(response => response.formData()).then(formData => {
  // get formData
})

// Submit application/json, default uses JSON.stringify(request.body)
XEAjax.fetchPost('/api/user/save', {name: 'test', password: '123456'}, {bodyType: 'json-data'})

// Submit application/x-www-form-urlencoded, default uses XEAjax.serialize(request.body)
XEAjax.fetchPost('/api/user/save', {name: 'test', password: '123456'}, {bodyType: 'form-data'})

// Submit FormData
const file = document.querySelector('#myFile').files[0]
const formBody = new FormData()
formBody.append('file', file)
XEAjax.fetchPost('/api/user/save', formBody)
```
### fetch to Response Schema
``` shell
import XEAjax from 'xe-ajax'

// The response for a request contains the following information.
// {ok, data, status, statusText, headers}

// The completion or failure is based on state check.
XEAjax.doGet('/api/user/list').then(response => {
  // success
}).catch(response => {
  // failed
})

XEAjax.doPost('/api/user/save', {name: 'test'})
XEAjax.doPost('/api/user/save', {name: 'test', password: '123456'}, {bodyType: 'json-data'})
XEAjax.doPost('/api/user/save', {name: 'test', password: '123456'}, {bodyType: 'form-data'})

const file = document.querySelector('#myFile').files[0]
const formBody = new FormData()
formBody.append('file', file)
XEAjax.doPost('/api/user/save', formBody)
```
### fetch to JSON
``` shell
import XEAjax from 'xe-ajax'

// The completion or failure is based on state check.
XEAjax.getJSON('/api/user/list').then(data => {
  // success
}).catch(data => {
  // failed
})

XEAjax.postJSON('/api/user/save', {name: 'test'})
XEAjax.postJSON('/api/user/save', {name: 'test', password: '123456'}, {bodyType: 'json-data'})
XEAjax.postJSON('/api/user/save', {name: 'test', password: '123456'}, {bodyType: 'form-data'})

const file = document.querySelector('#myFile').files[0]
const formBody = new FormData()
formBody.append('file', file)
XEAjax.postJSON('/api/user/save', formBody)
```
### jsonp
``` shell
import XEAjax from 'xe-ajax'

// Case 1:
// Set jsonp callback parameter name, default is 'callback'
// http://xuliangzhan.com/jsonp/user/message?callback=jsonp_xeajax_1521272815608_1
// jsonp_xeajax_1521272815608_1({message: 'success'})
XEAjax.fetchJsonp('http://xuliangzhan.com/jsonp/user/message')
.then(response => response.json())
.then(data => {
  // {message: 'success'}
})

// Case 2:
// Set jsonp callback function name, default is a random number with jsonp_xeajax_ prefix
// http://xuliangzhan.com/jsonp/user/message?id=123&cb=jsonp_xeajax_1521272815608_2
// jsonp_xeajax_1521272815608_2({message: 'success'})
XEAjax.fetchJsonp('http://xuliangzhan.com/jsonp/user/message', {id: 123}, {
  jsonp: 'cb'
})
.then(response => response.json())
.then(data => {
  // {message: 'success'}
})

// Case 3:
// Set jsonp callback parameter name and callback function name
// http://xuliangzhan.com/jsonp/user/message?id=123&cb=customCallback
// customCallback({message: 'success'})
XEAjax.fetchJsonp('http://xuliangzhan.com/jsonp/user/message', {id: 123}, {
  jsonp: 'cb', 
  jsonpCallback: 'customCallback'
})
.then(response => response.json())
.then(data => {
  // {message: 'success'}
})
```
### Multiple requests
``` shell
import XEAjax from 'xe-ajax'

const iterable1 = []
iterable1.push(XEAjax.fetchGet('/api/user/list'))
iterable1.push(XEAjax.fetchGet('/api/user/message'), {id: 1})
Promise.all(iterable1).then(datas => {
  // all finish
}).catch(e => {
  // error
})

// doAll Use object parameters, The use is consistent with that of Promise.
const iterable2 = []
iterable2.push({url: '/api/user/list'})
iterable2.push({url: '/api/user/message', body: {id: 1}, method: 'POST'})
XEAjax.doAll(iterable2)
```
### Nested requests
``` shell
import XEAjax from 'xe-ajax'

// This should be avoided in the project.
XEAjax.fetchGet('/api/user/info')
.then(response => response.json())
.then(data => {
  return fetchGet('/api/user/details', {id: data.id})
}).then(response => {
  // finish
})
```
### AMD
``` shell
define([
  'xe-ajax'
], function (XEAjax) {

  XEAjax.fetchGet('/api/user/list').then(response => {
    // finish
  })

  XEAjax.fetchPost('/api/user/save', {name: 'test'}, {bodyType: 'json-data'})
  XEAjax.fetchPost('/api/user/save', {name: 'test'}, {bodyType: 'form-data'})

  var file = document.querySelector('#myFile').files[0]
  var formBody = new FormData()
  formBody.append('file', file)
  XEAjax.fetchPost('/api/user/save', formBody)
})
```

## Cancel request
### AbortController
Allows control of one or more cancellation requests.
``` shell
import XEAjax from 'xe-ajax'

// Create a controller.
const controller = new XEAjax.AbortController()
// get signal
const signal = controller.signal
// Associate the signal and controller with the fetch request.
XEAjax.fetchGet('/api/user/list', {id: 1}, {signal}).then(response => {
  // finish
}).catch(function (e) {
  // error
})
setTimeout(() => {
  controller.abort()
}, 100)
```

## Interceptor
### Request interceptor
use (finish)
``` shell
import XEAjax from 'xe-ajax'

// Trigger before the request is sent.
XEAjax.interceptors.request.use((request, next) => {
  // Can be used for unified permission intercept, set request header, Token authentication, parameters, etc.

  // Set params
  // request.params.version = Date.now()

  // Set Token validation to prevent XSRF/CSRF attacks.
  request.headers.set('X-Token', cookie('x-id'))

  // Call next(), execute the next interceptor.
  next()
})
```
### Response interceptor
use (finish, failed)
``` shell
import XEAjax from 'xe-ajax'

// Intercept when the request is finish.
XEAjax.interceptors.response.use((response, next) => {
  // It can be used for unified processing after a request is finish, such as checking for invalidation, message prompt, special scenario processing, etc.

  // Example: check login failover.
  if (response.status === 403) {
    router.replace({path: '/login'}) 
    // break up
  } else {
    // Call next(), execute the next interceptor.
    next()
  }
}, (e, next) => {
  // failed
  // Call next(), execute the next interceptor.
  next()
})

// Intercept and reset the response data after the request is complete.
// Format: {status: 200, statusText: 'OK', body: {}, headers: {}}
XEAjax.interceptors.response.use((response, next) => {
  response.json().then(data => {
    const body = {
      status: response.status === 200 ? 'success' : 'error', 
      result: data
    }
    // Reset the response data and continue with the next interceptor.
    next({status: 200, body: body})
  })
}, (e, next) => {
  // Turn all the exception errors to finish.
  const body = {
    status: 'error', 
    result: null
  }
  // Reset the response data and continue with the next interceptor.
  next({status: 200, body: body})
})
```

## Functions of mixing
### ./customs.js
``` shell
import XEAjax from 'xe-ajax'

export function getText () {
  return XEAjax.fetchGet.apply(this, arguments).then(response => response.text())
} 
```
### ./main.js
``` shell
import XEAjax from 'xe-ajax'
import customs from './customs'

XEAjax.mixin(customs)

XEAjax.getText('/api/user/message')
```

## Plugin
### Mock services
MockJS、[XEAjaxMock](https://github.com/xuliangzhan/xe-ajax-mock)

## Project Demos
[project examples.](https://github.com/xuliangzhan/examples)  

## License
Copyright (c) 2017-present, Xu Liangzhan