# navigation
#### 前进刷新，返回不刷新
1. A forward to B, then forward to C;
2. C back to B, B will **recover from cache**;
3. B forward to C again, C will **rebuild, not recover from cache**;
4. C forward to A, A will **build, now the route contains two A instance**.
#### 支持设置最大缓存数
- max属性取值表示最大缓存数
- **!important: navigation adds a key to the url to distinguish the route. The default name of the key is VNK, which can be modified.**

### DEMO

[DEMO](https://h5.baike.qq.com/mobile/home.html?VNK=80c0b23a)



```

## Usage

### Basic Usage

入口js引入dist目录下的vue-navigation.esm或者将src目录下面代码作为组件直接引用

```javascript
import Vue from 'vue'
import router from './router' // vue-router instance
import Navigation from './dist/vue-navigation.esm'

Vue.use(Navigation, {router})
// bootstrap your app...
```
App.vue

```vue
<template>
  <navigation max='10'>
    <router-view></router-view>
  </navigation>
</template>
```
