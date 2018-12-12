import Routes from '../routes'
import { getKey, matches, remove, pruneCacheEntry } from '../utils'

export default (keyName) => {
  return {
    name: 'navigation',
    abstract: true,
    props: {
      include: [String, Array],
      exclude: [String, Array],
      max: [String, Number]
    },
    data: () => ({
      routes: Routes
    }),
    computed: {},
    watch: {
      routes (val) {
        for (const key in this.cache) {
          if (!matches(val, key)) {
            const vnode = this.cache[key]
            vnode && vnode.componentInstance.$destroy()
            delete this.cache[key]
          }
        }
      }
    },
    created () {
      this.cache = {}
      this.keys = []
    },
    destroyed () {
      for (var key in this.cache) {
        pruneCacheEntry(this.cache, key, this.keys)
      }
    },
    render () {
      var vnode = this.$slots.default ? this.$slots.default[0] : null
      if (vnode) {
        vnode.key = vnode.key || (vnode.isComment ? 'comment' : vnode.tag)
        const { cache, keys } = this
        var key = getKey(this.$route, keyName)
        if (vnode.key.indexOf(key) === -1) {
          vnode.key = '__navigation-' + key + '-' + vnode.key
        }
        if (cache[key]) {
          if (vnode.key === cache[key].key) {
            vnode.componentInstance = cache[key].componentInstance
          } else {
            cache[key].componentInstance.$destroy()
            cache[key] = vnode
          }
          remove(keys, key)
          keys.push(key)
        } else {
          cache[key] = vnode
          keys.push(key)
          // prune oldest entry
          if (this.max && keys.length > parseInt(this.max)) {
            pruneCacheEntry(cache, keys[0], keys, this._vnode)
          }
        }
        vnode.data.keepAlive = true
      }
      return vnode
    }
  }
}
