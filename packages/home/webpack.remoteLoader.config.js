const remoteLoaderHelper = (remoteName, remoteModuleUrl, customErrorLogger) => {
  const logError = (message) => {
    console.info(message);
  };

  const errorFormatter = (e) => (e instanceof Error ? `(${e.message})` : "");

  const successProxy = () => ({
    get: (request) => {
      try {
        return window[remoteName].get(request);
      } catch (e) {
        logError(
          `Unable to get ${request} for ${remoteName} ${errorFormatter(e)}`
        );
        return undefined;
      }
    },
    init: (arg) => {
      try {
        return window[remoteName].init(arg);
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
    const url = remoteModuleUrl;
    const remoteUrl = `${url}/remoteEntry.js`;

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
