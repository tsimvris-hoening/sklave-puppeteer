const puppeteer = require('puppeteer');
const shell = require("shelljs");

function runScripts(){
    let run = 0;

    setInterval(()=>{
        run +=1;
        console.log("Starting ",run," run!")
            startScript(run)
    },30000)
}
async function startScript(run){
    const browser = await puppeteer.launch({
        headless:"new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // Add these if you're running on a Linux server
        userDataDir: './opt/render/.cache/puppeteer', // The path to your user data directory
        executablePath: './opt/render/.cache/puppeteer/chrome/linux-119.0.6045.105/chrome-linux64/chrome', // e.g., '/usr/bin/chromium-browser' on Ubuntu


    }).catch(e => console.error(e));
    const page = await browser.newPage();
    await page.setViewport({
        width: 3840,
        height: 2160
    });
    await page.goto('http://dashboard.hoening.local/ProductionUnits/');
    await new Promise(resolve => setTimeout(resolve, 2000));
    const reps = 3;
    for(let i = 0;i<reps;i++){
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.screenshot({path:`./shots/screenshot-${i+1}.png`})
        await page.click(".displayContainer")
    }
    await browser.close();
    shell.exec("npm run deploy");
    console.log("Run ",run," completed")
}

runScripts()