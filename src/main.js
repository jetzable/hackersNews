import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { ApolloLink } from 'apollo-link'
import { InMemoryCache } from 'apollo-cache-inmemory'
import 'tachyons'
import Vue from 'vue'
import VueApollo from 'vue-apollo'
import { GC_USER_ID, GC_AUTH_TOKEN } from './constants/settings'
import App from './App'
import router from './router'
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'



Vue.config.productionTip = false

// 3
const httpLink = new HttpLink({
  // You should use an absolute URL here
  uri: 'https://api.graph.cool/simple/v1/cjrtjtt6g1hht0158o5iwpxuz'
})

const wsClient = new SubscriptionClient('wss://subscriptions.graph.cool/v1/cjrtjtt6g1hht0158o5iwpxuz', {
  reconnect: true,
  connectionParams: {
    authToken: localStorage.getItem(GC_AUTH_TOKEN)
  }
})


const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  const token = localStorage.getItem(GC_AUTH_TOKEN)
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : null
    }
  })
  return forward(operation)
})


const httpLinkWithSubscriptions = addGraphQLSubscriptions(
  authMiddleware.concat(httpLink),
  wsClient
)


const apolloClient = new ApolloClient({
  // 2
  link: httpLinkWithSubscriptions,
  cache: new InMemoryCache(),
  connectToDevTools: true
})


Vue.use(VueApollo)

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
  defaultOptions: {
    $loadingKey: 'loading'
  }
})

let userId = localStorage.getItem(GC_USER_ID)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  provide: apolloProvider.provide(),
  router,
  data: {
    userId
  },
  render: h => h(App)
})
