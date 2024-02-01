import { Prisma, PrismaClient } from "@prisma/client";
import { useSession } from "next-auth/react";
import { z } from "zod";
export interface createProject {
  id: string;
  ProjectName: string;
  CreatedBy: string;
  name: string;
  image: String;
  userId: string;
}

interface getUsersofAProjectSchemaInput{
  projectId:string
}

export interface getProjectsOfUserSchemaInput{
  userId:string
}

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { getProjectTicketsIdSchemainput } from "./tickets";

export const getProjectsOfUser = async (db:PrismaClient,input:getProjectsOfUserSchemaInput) => {
  return await db.$queryRaw`select "Project".*,"User".name,"User".id as "userId" from "ProjectUserMapping" join "Project" on "ProjectUserMapping"."projectId"="Project".id join "User" on "User".id="Project"."CreatedBy" where "ProjectUserMapping"."userId"=${input.userId}`
}

export const getUsersofAProject = async (db: PrismaClient, input: getUsersofAProjectSchemaInput) => {
  const data= await db.$queryRaw`select "User".* from "ProjectUserMapping" join "User" on "ProjectUserMapping"."userId"="User".id where "ProjectUserMapping"."projectId"=${input.projectId}`
  return data
}

export const getUsersOfProjectsOfCurrentUser = async (db: PrismaClient, input: getProjectsOfUserSchemaInput) => {
  const query=Prisma.sql`SELECT "pum"."projectId", ARRAY_AGG("u".*) AS "User"
FROM "User" "u"
JOIN "ProjectUserMapping" "pum" ON "u"."id" = "pum"."userId"
JOIN "ProjectUserMapping" "pum2" ON "pum"."projectId" = "pum2"."projectId" AND "pum2"."userId" = ${input.userId}
GROUP BY "pum"."projectId"`
  return await db.$queryRaw`${query}`
}

export const getprojectDetails = async (db: PrismaClient, input: getProjectTicketsIdSchemainput)=>{
  return await db.project.findUnique({
    where:input
  })
}

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  
  createProject: protectedProcedure
    .input(z.object({
      projectName: z.string().min(1),
      user: z.string()
    })).mutation(async ({ ctx, input }) => {
      const prismaProject = await ctx.db.project.create({
        data: {
          ProjectName: input.projectName,
          CreatedBy: input.user,
        },
      });
      await ctx.db.projectUserMapping.create({
        data: {
          projectId: prismaProject.id,
          userId: ctx.session?.user.id || "",
        }
      })
      const data: createProject = {
        id: prismaProject.id,
        ProjectName: prismaProject.ProjectName,
        CreatedBy: prismaProject.CreatedBy,
        userId: ctx.session?.user.id||"",
        name: ctx.session?.user.name ||"unknown user",
        image: ctx.session?.user.image || "",
      };
      return data
    }),

  getProjects: publicProcedure.input(z.object({
    userId:z.string()
  })).query(async ({ ctx , input}) => {
    return getProjectsOfUser(ctx.db,input)
  }),

  getUsersOfProject: publicProcedure
    .input(z.object({
    projectId: z.string().min(1),
    })).mutation(async ({ ctx, input }) => {
      const data=await ctx.db.projectUserMapping.findMany({
        where: {
          projectId:input.projectId
        }
      })
      console.log(data,input.projectId)
      const userData = await ctx.db.user.findMany({
        where: {
          id: { in:data.map((element) => element.userId) }
        }
      })
      console.log(userData,'users')
      return userData
  }),


  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),

  updateDeadLine: protectedProcedure.input(z.object({
    id: z.string(),
    deadLine:z.date()
  })).mutation(async ({ ctx, input }) => {
    return await ctx.db.project.update({
      where: {
        id:input.id
      },
      data: {
        deadLine:input.deadLine
      }
    })
  }),

  addUsersToProject: protectedProcedure.input(z.object({
    projectId: z.string(),
    email:z.string()
  })).mutation(async ({ ctx, input }) => {
    const userDetails = await ctx.db.user.findUniqueOrThrow({
      where: {
        email:input.email
      }
    })
    await ctx.db.projectUserMapping.create({
      data: {
        projectId: input.projectId,
        userId:userDetails?.id
      }
    })
    return userDetails
  })

});
