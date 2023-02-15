import { prisma } from "../../db";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const listingsRouter = createTRPCRouter({
  getListings: publicProcedure.query(async () => {
    const listings = await prisma.lainPlush.findMany();
    // TODO: add time updated at
    return listings;
  }),
});
