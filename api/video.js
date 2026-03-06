// api/video.js - Proxy para ClaroVideo en Vercel Edge Runtime

// Lista extensa de User-Agents (más de 30 opciones)
const USER_AGENTS = [
  // Windows 10/11 - Chrome
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
  // Windows 10/11 - Firefox
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0',
  // Windows 10/11 - Edge
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
  // macOS - Chrome
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  // macOS - Safari
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
  // Linux - Chrome
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  // Linux - Firefox
  'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0',
  // Android - Chrome
  'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
  // Android - Samsung Browser
  'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/21.0 Chrome/110.0.5481.154 Mobile Safari/537.36',
  // iOS - Safari (iPhone)
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 15_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6.1 Mobile/15E148 Safari/604.1',
  // iOS - Chrome (iPhone)
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) CriOS/119.0.6045.169 Mobile/15E148 Safari/604.1',
  // iPad - Safari
  'Mozilla/5.0 (iPad; CPU OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
  // Consolas y Smart TV
  'Mozilla/5.0 (PlayStation; PlayStation 5/2.26) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (Xbox; Xbox Series X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edge/120.0.0.0',
  'Mozilla/5.0 (Web0; SmartTV; Linux) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
];

const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 segundo

// Caché en memoria para el token (simula KV)
let cachedToken = null;
let tokenExpiry = 0;
const TOKEN_TTL = 3600 * 1000; // 1 hora en milisegundos

export const config = {
  runtime: 'edge',
  // Para forzar región Chile (opcional, descomentar si se desea)
  // preferredRegion: 'scl1', // Santiago de Chile
};

export default async function handler(request) {
  // Manejar OPTIONS (CORS)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  const url = new URL(request.url);
  const groupId = url.searchParams.get('id');
  
  if (!groupId) {
    return new Response('Falta el parámetro "id" (group_id)', {
      status: 400,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  try {
    // 1. Obtener token (desde caché en memoria)
    const paywayToken = await getCachedPaywayToken();

    // 2. Obtener URL original del video
    const regionApi2 = 'mexico'; // Cambia si es necesario
    let videoUrl = await getVideoUrl(groupId, paywayToken, regionApi2);

    // 3. Transformar "live" a "vod" en el hostname
    videoUrl = transformLiveToVod(videoUrl);

    // 4. Obtener IP real del cliente (de las cabeceras de Vercel)
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('cf-connecting-ip') || 
                     '0.0.0.0';

    // 5. Reemplazar la IP en la URL por la del cliente
    videoUrl = replaceIpInUrl(videoUrl, clientIp);

    // 6. Redirigir a la URL final
    return Response.redirect(videoUrl, 302);

  } catch (error) {
    return new Response(`Error: ${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Función para obtener token con caché en memoria
async function getCachedPaywayToken() {
  const now = Date.now();
  if (cachedToken && tokenExpiry > now) {
    return cachedToken;
  }

  const token = await fetchPaywayTokenFromAPI();
  cachedToken = token;
  tokenExpiry = now + TOKEN_TTL;
  return token;
}

// Solicita token a la API con reintentos
async function fetchPaywayTokenFromAPI(retries = 0) {
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  const headers = {
    'User-Agent': userAgent,
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://www.clarovideo.com/',
    'Origin': 'https://www.clarovideo.com',
    'Connection': 'keep-alive',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  };

  const tokenUrl = 'https://mfwkweb-api.clarovideo.net/services/payway/linealchannels';
  const params = {
    device_id: 'web',
    device_category: 'web',
    device_model: 'web',
    device_type: 'web',
    device_so: 'Chrome',
    format: 'json',
    device_manufacturer: 'generic',
    authpn: 'webclient',
    authpt: 'tfg1h3j4k6fd7',
    api_version: 'v5.93',
    region: 'uruguay',
    HKS: '2n9ru0n9kgrr9vv4b893bo7570'
  };

  const url = new URL(tokenUrl);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  const response = await fetch(url.toString(), { headers });
  
  if (response.status === 403) {
    if (retries < MAX_RETRIES) {
      const delay = BASE_DELAY * Math.pow(2, retries) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchPaywayTokenFromAPI(retries + 1);
    } else {
      throw new Error('Acceso denegado después de múltiples reintentos (403)');
    }
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text.substring(0, 200)}`);
  }

  const data = await response.json();
  const token = data?.response?.paqs?.paq?.[0]?.payway_token;
  if (!token) throw new Error('Token no encontrado: ' + JSON.stringify(data));
  return token;
}

// Solicita URL del video con reintentos
async function getVideoUrl(groupId, paywayToken, regionApi2, retries = 0) {
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  const headers = {
    'User-Agent': userAgent,
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://www.clarovideo.com/',
    'Origin': 'https://www.clarovideo.com',
    'Connection': 'keep-alive',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  };

  const baseUrl = 'https://mfwkweb-api.clarovideo.net/services/player/getmedia';
  const params = {
    device_category: 'web',
    group_id: groupId,
    device_model: 'web',
    device_type: 'web',
    format: 'json',
    device_manufacturer: 'generic',
    authpn: 'webclient',
    authpt: 'tfg1h3j4k6fd7',
    stream_type: 'hls_kr',
    crDomain: 'https://www.clarovideo.com',
    api_version: 'v5.94',
    device_id: '693e9af84d3dfcc71e640e005bdc5e2e',
    preview: '0',
    css: '0',
    region: regionApi2,
    payway_token: paywayToken
  };

  const url = new URL(baseUrl);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  const response = await fetch(url.toString(), { headers });

  if (response.status === 403) {
    if (retries < MAX_RETRIES) {
      const delay = BASE_DELAY * Math.pow(2, retries) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return getVideoUrl(groupId, paywayToken, regionApi2, retries + 1);
    } else {
      throw new Error('Acceso denegado al obtener video después de múltiples reintentos (403)');
    }
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text.substring(0, 200)}`);
  }

  const data = await response.json();
  const videoUrl = data?.response?.media?.video_url;
  if (!videoUrl || !videoUrl.includes('.m3u8')) {
    throw new Error('URL no válida: ' + JSON.stringify(data));
  }
  return videoUrl;
}

// Reemplaza "live" por "vod" en el hostname
function transformLiveToVod(urlString) {
  try {
    const url = new URL(urlString);
    url.hostname = url.hostname.replace('live', 'vod');
    return url.toString();
  } catch {
    return urlString;
  }
}

// Reemplaza la IP en la URL por la IP del cliente
function replaceIpInUrl(urlString, clientIp) {
  try {
    const url = new URL(urlString);
    if (url.searchParams.has('ip')) {
      url.searchParams.set('ip', clientIp);
    }
    const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
    const hostnameMatch = url.hostname.match(ipRegex);
    if (hostnameMatch) {
      url.hostname = url.hostname.replace(hostnameMatch[0], clientIp);
    }
    return url.toString();
  } catch {
    return urlString;
  }
}
