const express = require("express");
const app = express();
const puppeteer = require('puppeteer');
const shell = require("shelljs");
const PORT = process.env.PORT || 4000;
require("dotenv").config();



app.get("/",(req,res)=>{
    let body = `Puppeteer server running on ${PORT}`
    res.status(200).send(body)
})

app.listen(PORT,()=>{
    console.log("Listening on ",PORT)
})
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
        executablePath: process.env.NODE_ENV === "production" ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath(),
        args:["--disable-setuid-sandbox","--no-sandbox","--single-process","--no-zygote"]

    })
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