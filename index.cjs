const axios = require('axios');
const {HttpProxyAgent} = require('http-proxy-agent');
const fs = require('fs')

const proxyList = fs.readFileSync('./proxy.txt', 'utf-8').split('\n').map(item => item.replace('\r', ''))

const targetUrl = 'https://api-mainnet.magiceden.io/v2/ord/btc/collections';
const pings = []

// Test proxy
async function testProxy(proxy) {
    const [host, port, username, password] = proxy.split(':');
    const agent = new HttpProxyAgent({
      host,
      port,
      auth: `${username}:${password}`
    });

    const start = Date.now();
    const response = await axios.get(targetUrl, { proxy: false, httpAgent: agent }).catch(error => {});
    const end = Date.now();

    console.log(`Proxy ${proxy}: ${end - start}ms`);
    pings.push(end - start)
}

// Test all proxies
async function testAllProxies() {
  for (const proxy of proxyList) {
    await testProxy(proxy);
  }
  console.log('Average: ', calculateAverage(pings))
  await sleep(10000)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateAverage(numbers) {
  if (numbers.length === 0) {
    return 0; // Обрабатываем случай, когда массив пустой, возвращая 0 в качестве среднего арифметического.
  }

  const sum = numbers.reduce((accumulator, currentValue) => accumulator + currentValue);
  const average = sum / numbers.length;

  return average;
}

testAllProxies();