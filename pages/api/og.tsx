import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge", // Use the Edge runtime for faster responses
};

export default async function handler(req: Request) {
  // Make sure the font exists in the specified path:
  const fontData = await fetch(
    new URL("./../../public/fonts/Inter_18pt-SemiBold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "Polizeilicher Todesschuss";
  const line1 = searchParams.get("line1") || "am 11.3.2024";
  const line2 = searchParams.get("line2") || "in Schramberg, Baden-Württemberg";

  return new ImageResponse(
    (
      <div
        style={{
          backgroundImage:
            "url('https://polizeischuesse.cilip.de/images/cover_og.jpg')",
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          alignItems: "center",
          // background: "lavender",
          justifyContent: "center",
          padding: 40,
          color: "black",
        }}
      >
        <div
          style={{
            opacity: 1,
            textAlign: "center",
            lineHeight: 1,
            fontSize: 128,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: "black",
            textAlign: "center",
            marginTop: 40,
            fontSize: 70,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {line1}
        </div>
        <div
          style={{
            color: "black",
            textAlign: "center",
            marginTop: 20,
            fontSize: 60,
            fontFamily: "'Inter', sans-serif",
            marginBottom: 100,
          }}
        >
          {line2}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: fontData,
          style: "normal",
        },
      ],
    }
  );
}

async function fetchFont(url: string) {
  const res = await fetch(url);
  return res.arrayBuffer();
}
