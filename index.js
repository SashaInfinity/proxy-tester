import fetch from 'node-fetch'
import {HttpsProxyAgent} from 'https-proxy-agent'
import fs from 'fs'
import inquirer from 'inquirer'

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


(async () => {
  const proxyList = fs.readFileSync('./proxy.txt', 'utf-8').split('\n').map(item => item.replace('\r', ''))

  const prompt = inquirer.createPromptModule();

  const pings = []
  async function testProxy(proxy) {
    let agent = null
    if (proxy) {
      const [host, port, username, password] = proxy.split(':');
      agent = new HttpsProxyAgent(`http://${username}:${password}@${host}:${port}`);
    }
  
    const start = Date.now();
    const res = await fetch('https://api-mainnet.magiceden.io/v2/ord/btc/collections', { 
      agent,
      "method": "GET",
    })
    const end = Date.now();
  
    console.log(`Proxy ${proxy}: ${end - start}ms`);
    pings.push(end - start)
  }

  const { confirmation } = await prompt([{
      type: 'confirm',
      name: 'confirmation',
      message: `Send with proxy?`,
      loop: false,
      pageSize: 10
  }])

  if (confirmation) {
    for (const proxy of proxyList) {
      await testProxy(proxy);
    }
    console.log('Average: ', calculateAverage(pings))
  } else {
    for (let index = 0; index < 100; index++) {
      await testProxy();
    }
    console.log('Average: ', calculateAverage(pings))
  }

  await sleep(10000)
})()