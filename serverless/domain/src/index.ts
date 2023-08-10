/* eslint-disable @typescript-eslint/no-explicit-any */
import { Context, StructuredReturn } from 'faas-js-runtime'
import axios from 'axios'

export const handle = async (context: Context): Promise<StructuredReturn> => {
  if (!process.env.API_KEY) {
    throw new Error('Missing Enviroment')
  }
  const api_key = process.env.API_KEY
  if (context.headers['x-api-key'] === api_key) {
    const body = await listDomains()
    return {
      body: body,
      headers: {
        'content-type': 'application/json'
      },
      statusCode: 200
    }
  }
  return {
    body: { error: 'Unauthorized' },
    statusCode: 401
  }
}

async function getToken(apiUrl: string, requestData: Record<string, string>): Promise<Record<string, string>> {
  return await axios
    .post(apiUrl + '/tokens', requestData)
    .then((response) => {
      return response.data
    })
    .catch((error) => {
      console.log('Error:', error)
    })
}

async function getDomains(apiUrl: string, token: string): Promise<Record<string, any>[]> {
  const headers = {
    Authorization: `Bearer ${token}`
  }
  const hosts = await axios
    .get(apiUrl, {
      headers
    })
    .then((response) => {
      return response.data
    })
    .catch((error) => {
      console.error('Error:', error)
    })
  console.log(hosts)
  const listDomains = hosts.map((key) => ({ domain_names: key.domain_names, id: key.id }))
  console.log(listDomains)
  return listDomains.flat()
}

async function listDomains(): Promise<Record<string, any>[]> {
  if (!(process.env.NGINX_USER && process.env.NGINX_PASSWORD)) {
    throw new Error('Missing Enviroment')
  }
  const requestData = {
    identity: process.env.NGINX_USER,
    secret: process.env.NGINX_PASSWORD
  }
  const nginxApiUrl = 'http://10.158.0.111:81/api/'

  const response = await getToken(nginxApiUrl, requestData)
  const proxy_domains = await getDomains(
    nginxApiUrl + '/nginx/proxy-hosts?expand=owner,access_list,certificate',
    response['token']
  )
  const redirect_domains = await getDomains(
    nginxApiUrl + '/nginx/redirection-hosts?expand=owner,certificate',
    response['token']
  )
  const listDomains: Record<string, any>[] = [...proxy_domains, ...redirect_domains]
  return listDomains
}
