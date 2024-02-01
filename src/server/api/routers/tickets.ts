import { PrismaClient } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { getUserDetails } from "./user";
export interface getProjectTicketsIdSchemainput {
    id: string;
}
export interface getTicketDetailsSchemaInput{
    id: number,
    projectId: string
}
export const getTicketsOfAProject = async (db: PrismaClient, input: getProjectTicketsIdSchemainput) => {
    if (!input.id) {
        return []
    }
    return await db.ticket.findMany({
        where: {
        projectId: input.id
    }})
}

export const getTicketDetails = async (db: PrismaClient, input: getTicketDetailsSchemaInput) => {
    const data = await db.ticket.findUnique({
        where: input
    })
    if (!data) {
        return data
    }
    const userDetails = await getUserDetails(db, { id: data.assignedTo })
    return { data,"userDetails":userDetails }
}

export const ticketsRouter = createTRPCRouter({
    createTicket: protectedProcedure.input(
        z.object({
            projectId: z.string(),
            ticketType: z.number(),
            ticketStatus:z.number(),
            assignTo: z.string(),
            name: z.string(),
            description: z.string(),
            priority: z.number()
        })).mutation(async ({ ctx, input }) => {
            return await ctx.db.ticket.create({
                data: {
                    projectId: input.projectId,
                    ticketStatus: input.ticketStatus,
                    ticketType: input.ticketType,
                    assignedTo:input.assignTo,
                    name:input.name,
                    description:input.description,
                    priority:input.priority,
                    labels:[]
                }
            })
        }),
    getProjectTickets: protectedProcedure.input(z.object({
        id: z.string()
    })).query(({ ctx,input }) => {
        getTicketsOfAProject(ctx.db,input)
    }),
    updateTicketDetails: protectedProcedure.input(
        z.object({
            id: z.number(),
            name: z.string(),
            assignTo: z.string(),
            ticketStatus: z.number(),
            description:z.string()
        })).mutation(async ({ ctx, input }) => {
            return await ctx.db.ticket.update({
                where: {
                    id:input.id
                },
                data: {
                    name: input.name,
                    assignedTo: input.assignTo,
                    ticketStatus: input.ticketStatus,
                    description:input.description
                }
            })
        })
})