import axios from "axios"

import express, { Request, Response } from 'express';

const app = express();
const PORT = 3000;
const API_KEY = 'your-api-key'; // Replace with your actual API key

// Middleware to check API key
const apiKeyMiddleware = (req: Request, res: Response, next: any) => {
  const apiKey = req.headers['api-key'];

  if (apiKey === API_KEY) {
    next(); // API key is valid, proceed to the next middleware or route
  } else {
    res.status(401).json({ error: 'Unauthorized' }); // Invalid API key
  }
};

app.use(express.json());

app.use(apiKeyMiddleware);

app.get('/hello', (req: Request, res: Response) => {
  res.json({ message: 'Hello!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const apiUrl = "http://10.158.0.111:81/api/"

const requestData = {
  identity: process.env.NGINX_USER,
  secret: process.env.NGINX_PASSWORD
}
let auth: Record<string, string>

async function getToken(
  apiUrl: string,
  requestData: Record<string, string>
): Promise<Record<string, string>> {
  return await axios
    .post(apiUrl + "/tokens", requestData)
    .then((response) => {
      return response.data
    })
    .catch((error) => {
      console.error("Error:", error)
    })
}

async function getDomains (apiUrl: string, token: string): Promise<string[]> {
    const headers = {
        Authorization: `Bearer ${token}`,
      }    
    const hosts = await axios
      .get(apiUrl, {
        headers,
      })
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        console.error("Error:", error)
      })
    const listDomains = hosts.map(
      (key: { domain_names: string[] }) => key.domain_names
    )
    return listDomains.flat()
}

async function main() {
  const response = await getToken(apiUrl, requestData)
  const proxy_domains = await getDomains(apiUrl+ "/nginx/proxy-hosts?expand=owner,access_list,certificate", response["token"])
  const redirect_domains = await getDomains(apiUrl+ "/nginx/redirection-hosts?expand=owner,certificate", response["token"])
  const listDomains: string[] = [...proxy_domains, ...redirect_domains]
  console.log(listDomains)
}
main()
