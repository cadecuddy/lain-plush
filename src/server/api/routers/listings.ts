import { prisma } from "../../db";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const listingsRouter = createTRPCRouter({
  getListings: publicProcedure.query(async () => {
    const listings = await prisma.lainPlush.findMany({
      orderBy: {
        endTime: "desc",
      },
    });

    return { listings, time: new Date().toJSON() };
  }),
});
