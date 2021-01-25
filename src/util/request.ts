import router from '@/router'
import store from '@/store'
import axios from 'axios'
import { Message } from 'element-ui'
import qs from 'qs'

const request = axios.create({
  // 配置选项
  // baseURL,
  // timeout
})
function redirectLogin () {
  router.push({
    name: 'login',
    query: {
      redirect: router.currentRoute.fullPath
    }
  })
}

function refreshToken () {
  return axios.create ()({
    method: 'POST',
    url: '/front/user/refresh_token',
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    data: qs.stringify({
      refreshtoken: store.state.user.refresh_token
    })
  })
}
let isRefreshing = false
let requests: any[] = []
// 请求拦截器
request.interceptors.request.use(function (config) {
  console.log('req api comes', config)
  const { user } = store.state
  if (user && user.access_token) config.headers.Authorization = user.access_token
  return config
}, function (error) {
  return Promise.reject(error)
})
// 响应拦截器
request.interceptors.response.use(function (response) {
  console.log('response comes', response)
  return response
}, async function (error) {
  console.log('response failed', error)
  if (error.response) {
    console.log(error.response.data)
    const { status } = error.response
    if (status === 400) {
      Message.error('Req params error')
    } else if (status === 401) {
      if (!store.state.user) {
        redirectLogin()
        return Promise.reject(error)
      }
      if (!isRefreshing) {
        isRefreshing = true
        return refreshToken().then(res => {
          if (!res.data.success) {
            throw new Error('Refresh Token Failed');
          }
          store.commit('setUser', res.data.content)
          requests.forEach(cb => cb())
          return request(error.config)
        }).catch(err => {
          store.commit('setUser', null)
          redirectLogin()
          return Promise.reject(err)
        }).finally(() => {
          isRefreshing = false;
        })
      }
      // refreshing state
      return new Promise(resolve => {
        requests.push(() => {
          resolve(request(error.config))
        })
      })
    } else if (status === 403) {
      Message.error('No access, pls contact admin')
    } else if (status === 404) {
      Message.error('Requested resrc not existed')
    } else if (status >= 500) {
      Message.error('Server error, pls contact admin')
    }
  } else if (error.request) {
    console.log(error.request)
  } else {
    console.log('Error', error.message)
  }
  console.dir(error)

  return Promise.reject(error)
})
export default request
