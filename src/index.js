const puppeteer = require("puppeteer");
const ora = require("ora");

const USERNAME = process.env.SB_USERNAME;
const PASSWORD = process.env.SB_PASSWORD;

if (!USERNAME || !PASSWORD) {
  console.log("Username password is missing");
  console.log(
    "use ENV vars SB_USERNAME for username & SB_PASSWORD for password",
  );
  process.exit();
}

(async () => {
  let spinner;
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    spinner = ora("Loading page").start();
    await page.goto("https://www.airtel.in/s/selfcare?normalLogin");
    await page.waitFor("input[name=mobileNumber]");
    const username = await page.$("input[name=mobileNumber]");
    await username.type(process.env.SB_USERNAME);
    const password = await page.$("input[name=password]");
    await password.type(process.env.SB_PASSWORD);
    await page.click('[type="submit"]');

    spinner.text = "Login in process";

    page.on("dialog", async dialog => {
      console.log(dialog.message());
      await dialog.dismiss();
      await browser.close();
    });

    await page.waitForNavigation({ waitUntil: "networkidle0" });

    await page.waitFor(".chart-horiz-bar");
    spinner.stop();

    const used = await page.$eval(".used_tooltip", el => el.textContent);
    const totalAvailable = await page.$eval(
      ".myvaluehomeinternet0",
      el => el.textContent,
    );
    console.log("Used :: ", used);
    console.log("totalAvailable :: ", totalAvailable);

    await browser.close();
  } catch (err) {
    console.log(err.message);
    spinner.stop();
    process.exit();
  }
})();
