import { expect, test } from "@playwright/test";
import _ from "lodash";

test("navigate to all pages", async ({ page }) => {
  await page.goto("http://localhost:3000/");

  await page.click("text=VISUALISIERUNGEN >> visible=true", { timeout: 5000 });
  await expect(page).toHaveURL("http://localhost:3000/visualisierungen");
  await expect(page).toHaveTitle(/.*Visualisierungen.*/);
  await page.goBack();

  await page.click("text=METHODIK >> visible=true", { timeout: 5000 });
  await expect(page).toHaveURL("http://localhost:3000/methodik");
  await expect(page).toHaveTitle(/.*Methodik.*/);
  await page.goBack();

  await page.click("text=OFFIZIELLE STATISTIK >> visible=true", {
    timeout: 5000,
  });
  await expect(page).toHaveURL("http://localhost:3000/statistik");
  await expect(page).toHaveTitle(/.*Statistik.*/);
  await page.goBack();

  await page.click("text=TOD MIT TASER >> visible=true", {
    timeout: 5000,
  });
  await expect(page).toHaveURL("http://localhost:3000/taser");
  await expect(page).toHaveTitle(/.*Taser.*/);
  await page.goBack();

  await page.click("text=Kontakt, Impressum und Datenschutz >> visible=true", {
    timeout: 5000,
  });
  await expect(page).toHaveURL("http://localhost:3000/kontakt");
  await expect(page).toHaveTitle(/.*uns.*/);
  await page.goBack();

  for (const i of _.range(2, 25)) {
    await page.click(".mantine-Pagination-item >> text=" + i, {
      timeout: 5000,
    });
    await expect(page).toHaveTitle(/.*Todesschüsse.*/);
  }
});
