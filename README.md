# puppeteer-recaptcha-solver

## Installation

**Node.js 16.9.0 or newer is required.**

```sh-session
npm install puppeteer-recaptcha-solver
```
## Example usage

Install all required dependencies:

```sh-session
npm install puppeteer
```


```js
const puppeteer = require('puppeteer');
const solve = require('puppeteer-recaptcha-solver');
(async () => {
    
let browser = await puppeteer.launch({slowMo: 10,
    headless :false,
    args: [
        "--window-size=360,500",
        "--window-position=000,000",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-web-security",
       "--disable-infobars",
       '--disable-features=IsolateOrigins,site-per-process',
       "--disable-setuid-sandbox",
       "--disable-accelerated-2d-canvas",
       "--disable-gpu",
       '--disable-site-isolation-trials'
      ],
      ignoreHTTPSErrors: true, })
let page = await browser.newPage()
await page.goto('https://www.google.com/recaptcha/api2/demo')
let solver = await solve(page , "API_KEY")   // get server api key from https://wit.ai/
console.log(solver)
//// return solved : true or false 
/// error : if there any error 
/// token : recaptcha response 
})() 
```

## Help
If you need any help or having problems please contact me in discord : @RACOON#8980 