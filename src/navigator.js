import Routes from './routes'
import { getKey } from './utils'

export default (bus, moduleName, keyName) => {
  const forward = (name, toRoute, fromRoute) => {
    const to = { route: toRoute }
    const from = { route: fromRoute }
    const routes = Routes
    // if from does not exist, it will be set null
    from.name = routes[routes.length - 1] || null
    to.name = name
    routes.push(name)
    window.sessionStorage.VUE_NAVIGATION = JSON.stringify(routes)
    bus.$emit('forward', to, from)
  }
  const back = (count, toRoute, fromRoute) => {
    const to = { route: toRoute }
    const from = { route: fromRoute }
    const routes = Routes
    from.name = routes[routes.length - 1]
    to.name = routes[routes.length - 1 - count]
    routes.splice(Routes.length - count, count)
    window.sessionStorage.VUE_NAVIGATION = JSON.stringify(routes)
    bus.$emit('back', to, from)
  }
  const replace = (name, toRoute, fromRoute) => {
    const to = { route: toRoute }
    const from = { route: fromRoute }
    const routes = Routes
    // if from does not exist, it will be set null
    from.name = routes[routes.length - 1] || null
    to.name = name
    routes.splice(Routes.length - 1, 1, name)
    window.sessionStorage.VUE_NAVIGATION = JSON.stringify(routes)
    bus.$emit('replace', to, from)
  }
  const refresh = (toRoute, fromRoute) => {
    const to = { route: toRoute }
    const from = { route: fromRoute }
    const routes = Routes
    to.name = from.name = routes[routes.length - 1]
    bus.$emit('refresh', to, from)
  }
  const reset = () => {
    Routes.splice(0, Routes.length)
    window.sessionStorage.VUE_NAVIGATION = JSON.stringify([])
    bus.$emit('reset')
  }

  const record = (toRoute, fromRoute, replaceFlag) => {
    const name = getKey(toRoute, keyName)
    if (replaceFlag) {
      replace(name, toRoute, fromRoute)
    } else {
      const toIndex = Routes.lastIndexOf(name)
      if (toIndex === -1) {
        forward(name, toRoute, fromRoute)
      } else if (toIndex === Routes.length - 1) {
        refresh(toRoute, fromRoute)
      } else {
        back(Routes.length - 1 - toIndex, toRoute, fromRoute)
      }
    }
  }

  return {
    record, reset
  }
}
