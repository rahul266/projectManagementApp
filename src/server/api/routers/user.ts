import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { PrismaClient } from "@prisma/client";

export interface getUserDetailsSchemaInput{
    id:string
}

export const getUserDetails = async (db:PrismaClient,input:getUserDetailsSchemaInput) => {
    return await db.user.findUnique({
        where:input
    })
}

export const usersRouter = createTRPCRouter({
    getUser: protectedProcedure.input(
        z.object({
            id: z.string()
        })).mutation(async ({ ctx, input }) => {
            getUserDetails(ctx.db,input)
        }),
    
    getUserByEmail: protectedProcedure.input(
        z.object({
            email:z.string()
        })).mutation(async ({ ctx, input }) => {
            return await ctx.db.user.findUnique({
                where: {
                    email:input.email
                }
            })
        })
})