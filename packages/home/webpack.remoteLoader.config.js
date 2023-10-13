const remoteLoaderHelper = (remoteName, remoteModuleUrl, customErrorLogger) => {
  const logError = (message) => {
    console.info(message);
  };

  const errorFormatter = (e) => (e instanceof Error ? `(${e.message})` : "");

  const getCommon = (request) => {
    try {
      return window[remoteName].get(request);
    } catch (e) {
      logError(
        `Unable to get ${request} for ${remoteName} ${errorFormatter(e)}`
      );
      return undefined;
    }
  };

  const successProxy = () => ({
    get: (request) => getCommon(request),
    init: (arg) => {
      const url = remoteModuleUrl;
      const remoteUrl = `${url}/remoteEntry.js`;
      const componentCacheKey = `${remoteUrl}-${remoteName}`;
      try {
        if (!window.__gr_component_cache__[componentCacheKey]) {
          window.__gr_component_cache__[componentCacheKey] = {
            get: (request) => getCommon(request),
            init: (arg) => undefined
          }
          return window[remoteName].init(arg);
        } else {
          return undefined;
        } 
      } catch (e) {
        logError(
          `Remote container ${remoteName} may already be initialized ${errorFormatter(
            e
          )}`
        );
        return undefined;
      }
    },
  });

  return (resolve, reject) => {
    window.__gr_component_cache__ = window.__gr_component_cache__ || {};
    const url = remoteModuleUrl;
    const remoteUrl = `${url}/remoteEntry.js`;
    const componentCacheKey = `${remoteUrl}-${remoteName}`;
    if (window.__gr_component_cache__[componentCacheKey]) {
      resolve(window.__gr_component_cache__[componentCacheKey]);
      return;
    }

    const script = document.createElement("script");
    script.src = remoteUrl;
    script.onload = () => {
      resolve(successProxy());
    };
    script.onerror = () => {
      const message = `Unable to load ${remoteName} at ${remoteUrl}`;
      logError(message);
      reject(message);
    };
    document.head.appendChild(script);
  };
};

const remoteLoader = (remoteName, remoteModuleUrl) =>
  `promise new Promise((${remoteLoaderHelper})('${remoteName}','${remoteModuleUrl}'))`;

module.exports = {
  remoteLoader,
};
