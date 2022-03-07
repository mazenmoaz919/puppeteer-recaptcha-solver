const fetch = require('node-fetch')
const axios = require('axios')
function rdn(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
async function solve(page, API_KEY ) {
if(!API_KEY || !page) return {solved : false , error : 'Please specific API_KEY and page'}
try {
    await page.waitForSelector('iframe[title=\"reCAPTCHA\"]',{visible : true})
    let frame =   await page.waitForFrame(async frame => {
    let frames = await  frame.title()==='reCAPTCHA' && frame.url().includes('https://www.google.com/recaptcha/api2/anchor')
    if(frame) {
    return  {finded : true , fame : frames}
    } else {
    return {finded : false , frame : null}
    }})
    if(!frame) return {solved : false , error : 'Not found any captcha'}
    const mainCaptchaElement = await  page.$('iframe[title=\"reCAPTCHA\"]')
    if(!mainCaptchaElement) return {solved : false , error : 'Not found any captcha'}
    let reCAPTCHA = await mainCaptchaElement.contentFrame();
    if(!reCAPTCHA) return {solved : false , error : 'Not found any captcha'}
    await page.waitForTimeout(500)
    await reCAPTCHA.waitForSelector('div[class="recaptcha-checkbox-border"]' ,{visible : true} )
    let checkbox = await reCAPTCHA.$('div[class="recaptcha-checkbox-border"]')
    if(!checkbox) return {solved : false , error : 'can\'t click checkbox'}
    await checkbox.click({ delay: rdn(30, 150) })
    await page.waitForTimeout(800)
    const challengeID = await page.evaluate(() => {
    for (let index = 0; index < 20; index++) {
    const captcha = document.querySelectorAll('iframe')[index];
    if (captcha && captcha.title.includes('recaptcha') && captcha.src.includes("api2/bframe")) {return index;} } });
    if (!challengeID) return {solved : false , error : 'No captcha challengeID'}
    const challengeCaptchaElement = await page.$$('iframe');
    const captchaChallengeFrame = await challengeCaptchaElement[challengeID].contentFrame();
    await page.waitForTimeout(800)
    if(!captchaChallengeFrame) return {solved : false , error : 'No captcha captcha Challenge Frame'}
    let solved = await  page.$eval('textarea[id="g-recaptcha-response"]', captcha => captcha.value )
    if(solved.length > 0)      return {solved : true , error : null, token : solved}
    let waitcaptcha = await captchaChallengeFrame.waitForSelector('button[id="recaptcha-help-button"]'  , {visible: true })
    if(!waitcaptcha) return {solved : true , error : null}
    let audiobutton = await captchaChallengeFrame.$('button[id="recaptcha-audio-button"]')
    await captchaChallengeFrame.waitForTimeout(500)
    if(audiobutton) await audiobutton.click({ delay: rdn(30, 150) })
    await captchaChallengeFrame.waitForTimeout(500)
    let networkerror =  await captchaChallengeFrame.$('div[class="rc-doscaptcha-header-text"]')
    if(networkerror) return {solved : false , error : 'Network Error Change Ip'}
    let aduiolink = await captchaChallengeFrame.$eval('audio[id="audio-source"]', (a) => a.src);
    if(!aduiolink) {
    let reloadbutton = await captchaChallengeFrame.$('button[id="recaptcha-reload-button"]')
    await reloadbutton.click({ delay: rdn(30, 150) })
    await captchaChallengeFrame.waitForTimeout(500)
    aduiolink = await captchaChallengeFrame.$eval('audio[id="audio-source"]', (a) => a.src);
    }
    let audioBytes = await axios.get(aduiolink ,  {responseType: 'arraybuffer'})
    if(!audioBytes)  return {solved : false , error : 'Network Error Aduio Change Ip'}
    let audiobuffer= new Uint8Array(audioBytes.data).buffer
    if(!audiobuffer)  return {solved : false , error : 'Error Aduio Buffer'}

    let response = await fetch('https://api.wit.ai/speech', { method: 'POST', body: audiobuffer,
    headers: {
            "authorization": 'Bearer '+API_KEY,
            'content-type': 'audio/mpeg3'
        }});
    let responsetext = await response.text()
    if(!responsetext || responsetext.length < 1) {
        reloadbutton = await captchaChallengeFrame.$('button[id="recaptcha-reload-button"]')
        await reloadbutton.click({ delay: rdn(30, 150) })
        await captchaChallengeFrame.waitForTimeout(500)
        aduiolink = await captchaChallengeFrame.$eval('audio[id="audio-source"]', (a) => a.src);
        audioBytes = await axios.get(aduiolink ,  {responseType: 'arraybuffer'})
        if(!audioBytes)  return {solved : false , error : 'Network Error Aduio Change Ip'}
        audiobuffer= new Uint8Array(audioBytes).buffer
        if(!audiobuffer)  return {solved : false , error : 'Error Aduio Buffer'}
        response = await fetch('https://api.wit.ai/speech', { method: 'POST', body: audiobuffer,
        headers: {
                "authorization": 'Bearer '+API_KEY,
                'content-type': 'audio/mpeg3'
            }});
        responsetext = await response.text()
    }
    let aduiotext = responsetext.match('"text": "(.*)",')[1].trim();
    if(!aduiotext || aduiotext.length < 1) {
        reloadbutton = await captchaChallengeFrame.$('button[id="recaptcha-reload-button"]')
        await reloadbutton.click({ delay: rdn(30, 150) })
        await captchaChallengeFrame.waitForTimeout(500)
        aduiolink = await captchaChallengeFrame.$eval('audio[id="audio-source"]', (a) => a.src);
        audioBytes = await axios.get(aduiolink ,  {responseType: 'arraybuffer'})
        if(!audioBytes)  return {solved : false , error : 'Network Error Aduio Change Ip'}
        audiobuffer= new Uint8Array(audioBytes).buffer
        if(!audiobuffer)  return {solved : false , error : 'Error Aduio Buffer'}
        response = await fetch('https://api.wit.ai/speech', { method: 'POST', body: audiobuffer,
        headers: {
                "authorization": 'Bearer '+API_KEY,
                'content-type': 'audio/mpeg3'
            }});
        responsetext = await response.text()
        aduiotext = responsetext.match('"text": "(.*)",')[1].trim();
    }
    await captchaChallengeFrame.type('input[id="audio-response"]' , aduiotext)
    let verifybutton = await captchaChallengeFrame.$('button[id="recaptcha-verify-button"]')
    if(!verifybutton)  return {solved : false , error : 'Error verify button'}
    await verifybutton.click({ delay: rdn(30, 150) })
    await captchaChallengeFrame.waitForTimeout(800)
    let solved2 = await  page.$eval('textarea[id="g-recaptcha-response"]', captcha => captcha.value )
    if(solved2.length <= 0 || !solved2  ) return {solved : false , error : 'captcha not solved'}
    return {solved : true , error : null, token : solved2}
} catch (error) { 
    return {solved : false , error : 'Unknow error' , errors : error}
}
}
module.exports = solve
