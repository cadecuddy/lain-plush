import type { LainPlush } from "@prisma/client";
import type { InferGetStaticPropsType } from "next";
import { type NextPage } from "next";
import Image from "next/image";
import { useState } from "react";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { listingsRouter } from "../server/api/routers/listings";
import { prisma } from "../server/db";
import TabArea from "../components/TabArea";
import MetaHead from "../components/MetaHead";

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  data,
}) => {
  const [selected, setSelected] = useState<string>("sold");
  const { listings, time } = data;

  const computeAveragePrice = (data: LainPlush[]) => {
    const prices = data
      .filter((listing) => !listing.active)
      .map((listing) => listing.currentPrice);
    const sum = prices.reduce((a, b) => a + b, 0);
    const avg = sum / prices.length || 0;
    return avg;
  };

  const computeAverageChange = (data: LainPlush[]) => {
    let change = 0;
    let percentChange = 0;

    // prices of non active listings
    const prices = data
      .filter((listing) => !listing.active)
      .map((listing) => listing.currentPrice);
    const sum = prices.reduce((a, b) => a + b, 0);
    const avg = sum / prices.length || 0;

    if (prices.length >= 1 && prices[0]) {
      const avgWithoutMostRecent = (sum - prices[0]) / (prices.length - 1) || 0;
      change = avg - avgWithoutMostRecent;
      percentChange = (change / avg) * 100;
    }

    if (!change || !percentChange)
      return {
        change: 0,
        percentChange: 0,
      };

    return { change, percentChange };
  };

  return (
    <>
      <MetaHead />

      <main className="flex-col text-neutral-300 md:flex md:flex-row">
        <div className="w-full p-4 md:w-1/2">
          <h1 className="mt-12 text-center text-5xl">LAIN PLUSH</h1>

          <div className="mt-8 flex flex-col items-center justify-center">
            <Image
              className="h-[300px] w-[200px] hover:animate-spin hover:cursor-pointer"
              src="/plush.png"
              alt="lain plush"
              width={200}
              height={200}
            />
          </div>

          <div className="mt-8 flex flex-col items-center">
            <div className="select-none rounded-sm border-2 p-4 text-center hover:cursor-pointer hover:bg-[#2a2929]">
              <h2 className="text-5xl font-extrabold">
                ${computeAveragePrice(listings).toFixed(2)}
              </h2>
              <h3 className="tracking-tightest mt-2 text-2xl">
                {computeAverageChange(listings)?.change > 0 ? (
                  <span className="text-green-500">
                    ▲ {computeAverageChange(listings)?.change.toFixed(2)} (
                    {computeAverageChange(listings)?.percentChange.toFixed(2)}
                    %)
                  </span>
                ) : (
                  <span className="text-red-500">
                    ▼{" "}
                    {Math.abs(computeAverageChange(listings)?.change).toFixed(
                      2
                    )}{" "}
                    (
                    {Math.abs(
                      computeAverageChange(listings)?.percentChange
                    ).toFixed(2)}
                    %)
                  </span>
                )}
              </h3>
            </div>
          </div>

          <div className="mt-4 text-center text-neutral-500">
            last updated: {new Date(time).toLocaleString()}
          </div>
        </div>

        <TabArea
          listings={listings}
          selected={selected}
          setSelected={setSelected}
        />
      </main>
    </>
  );
};

// Get all the latest listings from the database
// and pass them to the page as props.
//
// This will be revalidated every 15 minutes.
export async function getStaticProps() {
  const ssg = createProxySSGHelpers({
    router: listingsRouter,
    ctx: {
      prisma,
    },
  });

  const data = await ssg.getListings.fetch();

  return {
    props: {
      data,
    },
    revalidate: 15 * 60,
  };
}

export default Home;
