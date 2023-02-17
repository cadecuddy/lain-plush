import type { LainPlush } from ".prisma/client";
import React from "react";
import ListingCard from "./ListingCard";

type Props = {
  listings: LainPlush[];
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
};

export default function TabArea({ listings, selected, setSelected }: Props) {
  return (
    <div className="mb-8 mr-8 w-full p-4 md:w-1/2">
      <div className="my-12 mx-auto flex justify-center gap-8 text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
        <h2
          className="pb-1 hover:cursor-pointer hover:bg-neutral-300 hover:text-background"
          onClick={() => setSelected("listings")}
        >
          [
          <span className={selected === "listings" ? "underline" : ""}>
            listings
          </span>
          ]
        </h2>
        <h2
          className="pb-1 hover:cursor-pointer hover:bg-neutral-300 hover:text-background"
          onClick={() => setSelected("sold")}
        >
          [<span className={selected === "sold" ? "underline" : ""}>sold</span>]
        </h2>
        {/* <h2
          className="pb-1 hover:cursor-pointer hover:bg-neutral-300 hover:text-background"
          onClick={() => setSelected("graph")}
        >
          [
          <span className={selected === "graph" ? "underline" : ""}>graph</span>
          ]
        </h2> */}
      </div>

      <div>
        {selected === "listings" &&
          listings.filter((listing: LainPlush) => listing.active).length ===
            0 && (
            <div className="mx-auto flex flex-col gap-4 p-4">
              <h1 className="text-center text-xl">
                no active lain plush listings :(
              </h1>
            </div>
          )}

        {selected === "listings" && listings && (
          <div className="scrollbar-hide flex flex-col items-center gap-8">
            {listings
              .filter((listing: LainPlush) => listing.active)
              .map((listing, idx) => (
                <div key={idx}>
                  <ListingCard {...listing} />
                </div>
              ))}
          </div>
        )}

        {selected === "sold" && listings && (
          <div className="scrollbar-hide flex flex-col items-center gap-8">
            {listings
              .filter((listing: LainPlush) => !listing.active)
              .map((listing, idx) => (
                <div key={idx}>
                  <ListingCard {...listing} />
                </div>
              ))}
          </div>
        )}

        {/* {selected === "graph" && listings && <Graph />} */}
      </div>
    </div>
  );
}
