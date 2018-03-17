import { doAll, ajax, fetchGet, fetchPost, fetchPut, fetchDelete, fetchPatch, fetchHead, fetchJsonp, getJSON, postJSON, putJSON, deleteJSON, patchJSON, headJSON, jsonp } from './index'

function ajaxFetch (url, options) {
  return fetchGet(url, null, options)
}

export var exportMethods = {
  doAll: doAll,
  ajax: ajax,
  fetch: ajaxFetch,
  fetchGet: fetchGet,
  fetchPost: fetchPost,
  fetchPut: fetchPut,
  fetchDelete: fetchDelete,
  fetchPatch: fetchPatch,
  fetchHead: fetchHead,
  fetchJsonp: fetchJsonp,
  getJSON: getJSON,
  postJSON: postJSON,
  putJSON: putJSON,
  deleteJSON: deleteJSON,
  patchJSON: patchJSON,
  headJSON: headJSON,
  jsonp: jsonp
}
