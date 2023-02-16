import type { LainPlush } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";

export default function ListingCard(listing: LainPlush) {
  return (
    <div className="flex">
      <Link href={listing.url} target="_blank">
        <Image
          src={listing.image}
          alt={listing.title}
          width={100}
          height={150}
          className="h-[150px] w-[100px] rounded-sm shadow-sm transition-all duration-300 hover:scale-105 hover:cursor-pointer"
        />
      </Link>
      <div className="ml-3 flex-col items-center">
        <Link href={listing.url} target="_blank">
          <h1 className="px-1 text-lg font-thin hover:cursor-pointer hover:bg-neutral-300 hover:text-background">
            [
            {listing.title.length > 50
              ? listing.title.slice(0, 50) + "..."
              : listing.title}
            ]
          </h1>
          <h2 className="inline-block px-1 text-base text-green-700 hover:bg-green-700 hover:text-background">
            Sold {new Date(listing.endTime * 1000).toLocaleDateString()}
          </h2>
          <br />
          <h2 className="inline-block px-1 text-2xl font-bold hover:cursor-pointer hover:bg-neutral-300 hover:text-background">
            ${listing.currentPrice.toFixed(2)}
          </h2>
        </Link>
      </div>
    </div>
  );
}
