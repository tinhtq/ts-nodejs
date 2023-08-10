"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handle = void 0;
const axios_1 = __importDefault(require("axios"));
const handle = async (context) => {
    if (!process.env.API_KEY) {
        throw new Error('Missing Enviroment');
    }
    const api_key = process.env.API_KEY;
    if (context.headers['x-api-key'] === api_key) {
        const body = await listDomains();
        return {
            body: body,
            headers: {
                'content-type': 'application/json'
            },
            statusCode: 200
        };
    }
    return {
        body: { error: 'Unauthorized' },
        statusCode: 401
    };
};
exports.handle = handle;
async function getToken(apiUrl, requestData) {
    return await axios_1.default
        .post(apiUrl + '/tokens', requestData)
        .then((response) => {
        return response.data;
    })
        .catch((error) => {
        console.log('Error:', error);
    });
}
async function getDomains(apiUrl, token) {
    const headers = {
        Authorization: `Bearer ${token}`
    };
    const hosts = await axios_1.default
        .get(apiUrl, {
        headers
    })
        .then((response) => {
        return response.data;
    })
        .catch((error) => {
        console.error('Error:', error);
    });
    console.log(hosts);
    const listDomains = hosts.map((key) => ({ domain_names: key.domain_names, id: key.id }));
    console.log(listDomains);
    return listDomains.flat();
}
async function listDomains() {
    if (!(process.env.NGINX_USER && process.env.NGINX_PASSWORD)) {
        throw new Error('Missing Enviroment');
    }
    const requestData = {
        identity: process.env.NGINX_USER,
        secret: process.env.NGINX_PASSWORD
    };
    const nginxApiUrl = 'http://10.158.0.111:81/api/';
    const response = await getToken(nginxApiUrl, requestData);
    const proxy_domains = await getDomains(nginxApiUrl + '/nginx/proxy-hosts?expand=owner,access_list,certificate', response['token']);
    const redirect_domains = await getDomains(nginxApiUrl + '/nginx/redirection-hosts?expand=owner,certificate', response['token']);
    const listDomains = [...proxy_domains, ...redirect_domains];
    return listDomains;
}
