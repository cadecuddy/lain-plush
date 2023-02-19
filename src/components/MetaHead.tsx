import Head from "next/head";

export default function MetaHead() {
  return (
    <>
      <Head>
        <title>lain plush</title>
        <meta
          name="description"
          content="home of the lain plush economic hub."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/favicon-16x16.png"
        />
        <meta property="og:image" content="/plush.png" />
        <meta property="og:image:width" content="200" />
        <meta property="og:image:height" content="200" />
        <meta property="og:image:alt" content="lain plush" />
        <meta property="og:title" content="lain plush" />
        <meta
          property="og:description"
          content="home of the lain plush economic hub."
        />
      </Head>
    </>
  );
}
