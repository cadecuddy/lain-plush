import type { LainPlush } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";

export default function ListingCard(listing: LainPlush) {
  return (
    <div className="flex border-2 border-slate-500 bg-background p-4">
      <Link href={listing.url} target="_blank">
        <Image
          src={listing.image}
          alt={listing.title}
          width={150}
          height={150}
          className="min-h-full min-w-full rounded-md shadow-sm transition-all duration-300 hover:scale-105 hover:cursor-pointer"
        />
      </Link>
      <div className="ml-3 w-full flex-col items-center">
        <Link href={listing.url} target="_blank">
          <h1
            className="max-w-md px-1 text-base font-thin hover:cursor-pointer hover:bg-neutral-300 hover:text-background md:text-lg lg:text-xl
          "
          >
            [{listing.title}]
          </h1>
          {listing.endTime < Date.now() / 1000 ? (
            <h2 className="inline-block px-1 text-lg text-green-700 hover:bg-green-700 hover:text-background md:text-lg">
              Sold {new Date(listing.endTime * 1000).toLocaleDateString()}
            </h2>
          ) : (
            <h2 className="inline-block px-1 text-lg text-red-700 hover:bg-red-700 hover:text-background">
              Ends {new Date(listing.endTime * 1000).toLocaleDateString()}
            </h2>
          )}
        </Link>
        {listing.watchCount && (
          <div className="flex items-center px-1">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1 h-5 align-middle text-neutral-300"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M1.5 12c0-2.25 3.75-7.5 10.5-7.5S22.5 9.75 22.5 12s-3.75 7.5-10.5 7.5S1.5 14.25 1.5 12zM12 16.75a4.75 4.75 0 1 0 0-9.5 4.75 4.75 0 0 0 0 9.5zM14.7 12a2.7 2.7 0 1 1-5.4 0 2.7 2.7 0 0 1 5.4 0z"
                  fill="#6B7280"
                ></path>
              </g>
            </svg>
            <h2 className="text-sm font-extrabold text-neutral-300">
              {listing.watchCount} watchers
            </h2>
          </div>
        )}
        <br />
        <h2 className="inline-block px-1 text-2xl font-bold">
          ${listing.currentPrice.toFixed(2)}
        </h2>
      </div>
    </div>
  );
}
