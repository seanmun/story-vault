import { ImageResponse } from "next/og";

export const alt = "To Posterity — Letters to posterity. In your own voice.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadGoogleFont(
  family: string,
  text: string,
  italic = false,
  weight = 400
): Promise<ArrayBuffer> {
  const familyParam = family.replace(/ /g, "+");
  const style = italic ? "ital,wght@1," + weight : "wght@" + weight;
  const url = `https://fonts.googleapis.com/css2?family=${familyParam}:${style}&text=${encodeURIComponent(text)}`;

  // Old browser UA forces Google to return .ttf URLs that Satori can parse
  const cssResponse = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.151 Safari/535.19",
    },
  });
  const css = await cssResponse.text();

  // Match any url() inside src — covers ttf, woff, woff2
  const fontUrl = css.match(/src:[^}]*url\((https:\/\/[^)]+)\)/)?.[1];
  if (!fontUrl) {
    throw new Error(
      `Could not extract font URL for ${family}. CSS response: ${css.slice(0, 200)}`
    );
  }

  const fontResponse = await fetch(fontUrl);
  return await fontResponse.arrayBuffer();
}

export default async function Image() {
  const logoText = "To Posterity TP";
  const taglineText = "Letters to posterity. In your own voice.";
  const labelText = "Ad Posteros · Since 1350";

  const [imFell, cormorantItalic, cormorantBold] = await Promise.all([
    loadGoogleFont("IM Fell English", logoText, true),
    loadGoogleFont("Cormorant Garamond", taglineText, true),
    loadGoogleFont("Cormorant Garamond", labelText, false, 600),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F5F0EB",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "70px",
          }}
        >
          {/* Wax seal */}
          <div
            style={{
              width: "260px",
              height: "260px",
              borderRadius: "130px",
              background:
                "radial-gradient(circle at 38% 32%, #9B3939 0%, #6E2525 45%, #4A1515 85%, #3A0F0F 100%)",
              boxShadow:
                "0 20px 50px rgba(50, 15, 15, 0.35), inset 0 4px 10px rgba(232, 200, 184, 0.15), inset 0 -6px 15px rgba(20, 5, 5, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontFamily: "IMFell",
                fontSize: "120px",
                color: "#2A0A0A",
                lineHeight: 1,
                fontStyle: "italic",
                letterSpacing: "2px",
              }}
            >
              TP
            </div>
          </div>

          {/* Text block */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: "22px",
                letterSpacing: "8px",
                textTransform: "uppercase",
                color: "#735000",
                fontFamily: "CormorantBold",
                marginBottom: "24px",
              }}
            >
              {labelText}
            </div>

            <div
              style={{
                fontFamily: "IMFell",
                fontStyle: "italic",
                fontSize: "110px",
                color: "#5C1A1A",
                lineHeight: 1,
                letterSpacing: "2px",
                marginBottom: "28px",
              }}
            >
              To Posterity
            </div>

            <div
              style={{
                fontFamily: "CormorantItalic",
                fontSize: "36px",
                color: "#3D2D20",
                fontStyle: "italic",
                lineHeight: 1.3,
              }}
            >
              {taglineText}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "IMFell", data: imFell, style: "italic", weight: 400 },
        {
          name: "CormorantItalic",
          data: cormorantItalic,
          style: "italic",
          weight: 400,
        },
        {
          name: "CormorantBold",
          data: cormorantBold,
          style: "normal",
          weight: 600,
        },
      ],
    }
  );
}
