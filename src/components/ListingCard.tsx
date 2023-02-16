import type { LainPlush } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";

export default function ListingCard(listing: LainPlush) {
  return (
    // temp border decision TODO: CHANGE
    <div className="flex border-2 border-slate-500 bg-background p-4">
      <Link href={listing.url} target="_blank">
        <Image
          src={listing.image}
          alt={listing.title}
          width={100}
          height={150}
          className="h-[150px] w-[150px] rounded-sm shadow-sm transition-all duration-300 hover:scale-105 hover:cursor-pointer md:h-[150px] md:w-[125px]"
        />
      </Link>
      <div className="ml-3 flex-col items-center">
        <Link href={listing.url} target="_blank">
          <h1 className="px-1 text-base font-thin hover:cursor-pointer hover:bg-neutral-300 hover:text-background md:text-lg lg:text-xl">
            [{listing.title}]
          </h1>
          {listing.endTime < Date.now() / 1000 ? (
            <h2 className="inline-block px-1 text-sm text-green-700 hover:bg-green-700 hover:text-background md:text-lg">
              Sold {new Date(listing.endTime * 1000).toLocaleDateString()}
            </h2>
          ) : (
            <h2 className="inline-block px-1 text-base text-red-700 hover:bg-red-700 hover:text-background">
              Ends {new Date(listing.endTime * 1000).toLocaleDateString()}
            </h2>
          )}
          <br />
          <h2 className="inline-block px-1 text-2xl font-bold hover:cursor-pointer hover:bg-neutral-300 hover:text-background">
            ${listing.currentPrice.toFixed(2)}
          </h2>
        </Link>
      </div>
    </div>
  );
}
