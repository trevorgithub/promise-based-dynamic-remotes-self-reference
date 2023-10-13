# Getting Started

```sh
yarn
yarn start
```

Three browser tabs will automatically open

**NOTE: This sample will fail to run properly as written, on the master branch at time of last commit.  That is the purpose of this sample: to demonstrate problems with using [promised based dynamic remotes](https://webpack.js.org/concepts/module-federation/#promise-based-dynamic-remotes) when having a self reference.  The problem is resolved on this branch**

# Original Problem description
The original sample code used remotes defined in this type of format:
```
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        app1: 'app1@http://localhost:3001/remoteEntry.js',
      },
    }),
  ],
};
```
For this sample code, you can see this typical format of URL within ``packages\home\webpack.config.js``, at line 51 (commented out):
```
// home: "home@http://localhost:3000/remoteEntry.js",
```
Note that the home is both exposed and consumed within the same webpack.config.js.  From lines 47-49:
```
new ModuleFederationPlugin({
      name: "home",
      filename: "remoteEntry.js",
      remotes: {
        // home: "home@http://localhost:3000/remoteEntry.js",
        home: remoteLoader("home", "http://localhost:3000"),
        profile: "profile@http://localhost:3001/remoteEntry.js",
        search: "search@http://localhost:3002/remoteEntry.js",
      },
      exposes: {
        "./Shell": "./src/Shell",
        "./Home": "./src/Home",
      },
```
In addition to this typical, hardcoded string format of remote URL, webpack also supports providing a promise to the remote, which can be resolved at runtime.  This is detailed in the official module federation [documentation](https://webpack.js.org/concepts/module-federation/#promise-based-dynamic-remotes) in the form of Promised Based Dynamic Remotes.

The official example is adopted here, and adjusted slightly to make it a little more generic and exposed as an export in ``packages\home\webpack.remoteLoader.config.js``.

In the webpack.config.js, the reference to the home remote is switched from a hardcoded string to instead use the promised based dynamic remotes:
```
      remotes: {
        // home: "home@http://localhost:3000/remoteEntry.js",
        home: remoteLoader("home", "http://localhost:3000"),
        profile: "profile@http://localhost:3001/remoteEntry.js",
        search: "search@http://localhost:3002/remoteEntry.js",
      },

```
In my experience (not demonstrated here) this works great until a module references itself (demonstrated here).  At that point in time, an infinite loop results due to the self reference.  Guidance on how to adjust webpack.remoteLoader.config.js so that it can handle a self reference would be greatly appreciated.


# Problem resolution
The problem is resolved by introducing a cache that is checked prior to fetching the same remote repeatedly.  The cached value is used to return the promised get/set object for subsequent calls

# Lineage
- Update of example code from [Practical Module Federation Book](https://module-federation.myshopify.com/products/practical-module-federation), from the Fully Federated Federated Site [example](https://github.com/jherr/practical-module-federation-20/tree/main/part3-advanced/full-site-federation)
- An upgrade of [WP5 Intro Video Code](https://github.com/jherr/wp5-intro-video-code) which was forked from [MFE Webpack Demo](https://github.com/mizx/mfe-webpack-demo)
