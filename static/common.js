(() => {
  let onDomReadyFunctions = [];
  let isDomReady = false;
  window.onDomReady = function onDomReady(fn) {
    if (isDomReady) {
      fn();
    } else{
      onDomReadyFunctions.push(fn);
    }
  }
  document.addEventListener('DOMContentLoaded', () => {
    isDomReady = true;
    onDomReadyFunctions.forEach(fn => fn());
    onDomReadyFunctions = null;
  });
  
  window.getSearchParams = function getSearchParams() {
    const output = {};
    window.location.search.replace(/^\?/, '').split('&').filter(str => str !== '').map(str => str.split('=')).forEach(([key, value]) => {
      output[key] = decodeURIComponent(value);
    })
    return output;
  }
  
  window.$ = function $(selector, parent = document) {
    return parent.querySelector(selector);
  }
  
  window.$$ = function $$(selector, parent = document) {
    return parent.querySelectorAll(selector);
  }

  function serializeForm(form) {
    const formData = new FormData(form);
    const output = {}
    formData.forEach((value, key) => {
      output[key] = value;
    });
    return output;
  }
  
  async function api(method, route, params ) {
    const fetchParams = {
      method,
      credentials: 'same-origin'
    }
    if (method !== 'GET' && params !== undefined){
      const body = JSON.stringify(params);
      const contentLength = Buffer.byteLength(body);
      fetchParams.body = body;
      fetchParams.headers = new Headers({
        'Content-Type': 'application/json',
        'Content-Length': contentLength.toString()
      });
    }
    const response = await fetch(route, fetchParams);
    if (response.ok) {
      return await response.json();
    } else {
      let errorMsg;
      try {
        errorMsg = await response.json();
      }catch(error){
        errorMsg = 'Invalid server response';
      }
      throw Error(errorMsg || 'Unknown error');
      
    }
  
  }
  
  window.submitForm = function submitForm(callback) {
    return async function onSubmit(event) {
      event.preventDefault();
      const form = event.target;
      const { method, action } = form;
      const payload = serializeForm(form);
      try {
        const response = await api(method, action, payload);
        callback(true, response);
      }catch(error){
        callback(false, error);
      }
    }
  }

  window.showMessage = function showMessage(message, error = false){
    const $msg = $('#message');
    if (error) {
      $msg.classList.remove("bg-lime-600");
      $msg.classList.add("bg-red-600");
    } else {
      $msg.classList.remove("bg-red-600");
      $msg.classList.add("bg-lime-600");
    }
    $msg.classList.remove("hidden");
    $msg.textContent = message;
  }

})();  
