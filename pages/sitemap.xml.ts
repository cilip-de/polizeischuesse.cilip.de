import { setupData, setupTaserData } from "../lib/data";

const hostname = "https://polizeischuesse.cilip.de";

async function createSitemap(data: any[]) {
  const caseRoutes = data.map((x) => `/fall/${x["Fall"]}`);

  const localRoutes = [
    "",
    "/methodik",
    "/visualisierungen",
    "/taser",
    "/statistik",
    "/kontakt",
    "/fall-melden",
  ];

  const pages = localRoutes.concat(caseRoutes);

  const urlSet = pages
    .map((page) => {
      // Build url portion of sitemap.xml
      return `<url><loc>${hostname}${page}</loc></url>`;
    })
    .join("");

  // Add urlSet to entire sitemap string
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlSet}</urlset>`;
}

const Sitemap = () => {};

Sitemap.getInitialProps = async ({ res, req }: { res: any; req: any }) => {
  const { data } = await setupData();
  const taserData = await setupTaserData();

  const sitemap = await createSitemap(data.concat(taserData));

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();
  return res;
};

export default Sitemap;
