import puppeteer from "puppeteer";

const urlToOpen = "https://tree.ollieq.co.uk/?bot=tweet-bot"; // Replace with the URL you want to open

const takeScreenshot = async (): Promise<Buffer> => {
  console.log("launch puppeteer");
  const browser = await puppeteer.launch({
    headless: "new",
    // executablePath: "/usr/bin/chromium-browser",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  await page.setViewport({ width: 1200, height: 2000 });
  await page.goto(urlToOpen);
  console.log("load page");

  // Wait for the video element to be present
  await page.waitForSelector("video");
  // reject cookies (skews analytics)
  await page.click(".iubenda-cs-reject-btn");
  // Use Puppeteer's `page.$` method to check if the element exists
  const closeButton = await page.$('[data-test-id="button-close"]');

  if (closeButton) {
    // If the button exists, click it
    await closeButton.click();
    console.log("Clicked on the button-close");
  } else {
    // If the button doesn't exist, log a message
    console.log("Button-close not found");
  }

  // Wait for 10 seconds (adjust as needed)
  console.log("waiting for video");
  await page.waitForTimeout(10000);

  // Click the button with the id "hide-overlay-button"
  await page.click("#hide-overlay-button");

  // Wait for the overlay to hide (assuming it triggers some asynchronous action)
  // You might need to adjust this waiting logic based on your specific scenario
  await page.waitForTimeout(500); // Adjust the time as needed

  // Capture a screenshot of the video element
  const videoElement = await page.$("video");
  if (!videoElement) {
    throw "Video element not found";
  }
  console.log("take screenshot");
  const screenshotBuffer = await videoElement.screenshot();
  await browser.close();
  console.log("returning buffer");
  return screenshotBuffer;
  await browser.close();
};

export default takeScreenshot;
