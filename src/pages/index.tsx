import type { LainPlush } from "@prisma/client";
import type { InferGetStaticPropsType } from "next";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { listingsRouter } from "../server/api/routers/listings";
import { prisma } from "../server/db";

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  data,
}) => {
  const [selected, setSelected] = useState<string>("listings");

  const computeAveragePrice = (data: LainPlush[]) => {
    const prices = data.map((listing) => listing.currentPrice);
    const sum = prices.reduce((a, b) => a + b, 0);
    const avg = sum / prices.length || 0;
    return avg;
  };

  return (
    <>
      <Head>
        <title>lain plush</title>
        <meta
          name="description"
          content="home of the lain plush economic hub."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="flex-col text-neutral-300 md:flex md:flex-row">
        <div className="w-full p-4 md:w-1/2">
          <h1 className="mt-12 text-center text-5xl">LAIN PLUSH</h1>

          <div className="pointer-events-none mt-8 flex flex-col items-center justify-center">
            <Image
              className="h-[300px] w-[200px]"
              src="/plush.png"
              alt="lain plush"
              width={200}
              height={200}
            />
          </div>

          <div className="mt-8 flex flex-col items-center">
            <div className="select-none rounded-md border-2 p-4 text-center hover:cursor-pointer hover:bg-[#2a2929]">
              <h2 className="text-5xl font-thin">
                ${computeAveragePrice(data)}
              </h2>
              <h3 className="tracking-tightest mt-2 text-2xl text-green-700">
                ▲ $23 (18%)
              </h3>
            </div>
          </div>

          <div className="mt-4 text-center text-neutral-500">
            last updated: 1 minute ago
          </div>
        </div>

        <div className="w-full p-4 md:w-1/2">
          <div className="items my-12 flex justify-center gap-8 text-4xl">
            <h2
              className="pb-1 hover:cursor-pointer hover:bg-neutral-300 hover:text-[#1A1A1A]"
              onClick={() => setSelected("listings")}
            >
              [listings]
            </h2>
            <h2
              className="pb-1 hover:cursor-pointer hover:bg-neutral-300 hover:text-[#1A1A1A]"
              onClick={() => setSelected("sold")}
            >
              [sold]
            </h2>
          </div>

          {selected === "sold" && data && (
            <div className="mx-auto flex flex-col gap-4">
              {data.map((listing: LainPlush, idx) => (
                <div key={idx}>
                  <ListingCard {...listing} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

const ListingCard = (listing: LainPlush) => {
  return (
    <div className="flex flex-col gap-2 align-middle">
      <div className="flex items-center justify-evenly">
        <Image
          src={listing.image}
          alt={listing.title}
          width={100}
          height={100}
          className="h-[150px] w-[100px]"
        />
        <h2 className="ml-4 text-left text-lg font-thin">
          {listing.title.length > 40
            ? listing.title.slice(0, 40) + "..."
            : listing.title}
        </h2>
        <h2>${listing.currentPrice}</h2>
      </div>
    </div>
  );
};

export async function getStaticProps() {
  const ssg = createProxySSGHelpers({
    router: listingsRouter,
    ctx: {
      prisma,
    },
  });

  const data = await ssg.getListings.fetch();
  const FIVE_MINUTES = 10 * 60;

  return {
    props: {
      data,
    },
    revalidate: FIVE_MINUTES,
  };
}

export default Home;
