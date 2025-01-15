'use strict';
(() => {
  // src/ajax-interceptor.ts
  function interceptRequest(onResponse) {
    const XHR = XMLHttpRequest;
    const _fetch = fetch;
    const onReadyStateChange = async function () {
      if (this.readyState === 4) {
        onResponse(this.response);
      }
    };
    const innerXHR = function () {
      const xhr = new XHR();
      xhr.addEventListener('readystatechange', onReadyStateChange.bind(xhr), false);
      return xhr;
    };
    innerXHR.prototype = XHR.prototype;
    Object.entries(XHR).forEach(([key, val]) => {
      innerXHR[key] = val;
    });
    const innerFetch = async (resource, initOptions) => {
      const getOriginalResponse = () => _fetch(resource, initOptions);
      const fetchedResponse = getOriginalResponse();
      fetchedResponse.then(response => {
        if (response instanceof Response) {
          try {
            response
              .clone()
              .json()
              .then(res => onResponse(res))
              .catch(() => {});
          } catch (err) {}
        }
      });
      return fetchedResponse;
    };
    window.XMLHttpRequest = innerXHR;
    window.fetch = innerFetch;
  }
  function serializeToJSON(response) {
    try {
      return JSON.parse(JSON.stringify(response));
    } catch {
      return null;
    }
  }
  interceptRequest(res => {
    postMessage({
      type: 'AJAX_INTERCEPT_MESSAGE',
      response: serializeToJSON(res),
    });
  });
})();
