const {Builder, By, Key, until, Options} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require("path");
const fs = require('fs').promises; // File system module to save the screenshot
let reps = 3;
let chromeOptions = new chrome.Options();
chromeOptions.addArguments("--headless"); // Run Chrome in headless mode.
chromeOptions.addArguments("--no-sandbox"); // Applicable to Windows OS only
chromeOptions.addArguments("--disable-dev-shm-usage"); // Applicable to Windows OS only

const url = 'http://dashboard.hoening.local/ProductionUnits/'
async function runHorizontal() {
    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions)
        .build();
    await driver.manage().window().setRect({width: 3840, height: 2160});
    await driver.get(url);
    await sleep(4000);
    for(let i = 0; i<reps;i++){
        await sleep(4000);
        let screenshot = await driver.takeScreenshot();
        await ensureDirExists('./shots');
        await fs.writeFile(`./shots/screenshot-${i}.png`, screenshot, 'base64');
        if(i<2){
            let element = await driver.findElement(By.className('displayContainer'));
            await element.click();
        }
    }
    await driver.quit();
}

async function runVertikal() {
    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions)
        .build();
    await driver.manage().window().setRect({width: 1440, height: 2550});
    await driver.get(url);
    await sleep(4000);
    for(let i = 0; i<reps;i++){
        await sleep(1500);
        let element = await driver.findElement(By.xpath('/html/body/app-root/div[3]/app-vertikale-display/div'));
        await driver.executeScript("arguments[0].scrollIntoView(true);", element);
        await sleep(2500);
        await driver.executeScript("arguments[0].click();", element);
        await sleep(5000);
        let screenshot = await driver.takeScreenshot();
        await ensureDirExists('./shots');
        await fs.writeFile(`./shots/vertikal-screenshot-${i}.png`, screenshot, 'base64');
    }
    await driver.quit();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function ensureDirExists(path) {
    try {
        await fs.mkdir(path, { recursive: true });
    } catch (error) {
        if (error.code !== 'EEXIST') throw error; // Only ignore error if dir already exists
    }
}
async function loadFiles() {
    const SftpClient = require('ssh2-sftp-client');
    const path = require('path');
    const fs = require('fs').promises;
    const localDir = './shots';
    const remoteDir = "/kunden/438742_04838/webseiten/hoening-de/live/wordpress/de/dashboard/shots/";
    const sftp = new SftpClient();
    try {
        await sftp.connect({
            host: 'ftp.hoening.de',
            port: '22', // Default port for SFTP
            username: '438742-tsimvris',
            password: 'mf\$vfvsfZx2n'
        });
        console.log("Connected");
        try {
            await sftp.list(remoteDir);
        } catch (err) {
            console.log(`Directory not found, creating: ${remoteDir}`);
            await sftp.mkdir(remoteDir, true); // true for recursive creation
        }

        const files = await fs.readdir(localDir); // Use fs.promises.readdir
        for (const file of files) {
            const localFilePath = path.join(localDir, file);
            const remoteFilePath = remoteDir + file; // Direct concatenation
            try {
                await sftp.put(localFilePath, remoteFilePath);
            } catch (err) {
                console.error(`Error uploading file - ${file}: ${err.message}`);
            }
        }
    } catch (err) {
        console.error(err.message);
    } finally {
        sftp.end(); // Make sure to close the SFTP connection
        console.log("SFTP connection closed.");
    }
}
let index = 1;
(async function main() {
    while (true) {
        let date = new Date();
        console.log(`Current run: ${index} at ${date.getHours()}:${date.getMinutes()}`);
        index += 1;
        try {
            await runHorizontal();
            await runVertikal();
            await loadFiles();
            await sleep(10000);
        } catch (error) {
            console.error("An error occurred: ", error);

        }
    }
})();
