import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { BadRequestError } from '@/http/controllers/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'

export async function profile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/profile',
      {
        schema: {
          tags: ['Users'],
          summary: 'Get authenticated user profile',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              user: z.object({
                id: z.string().uuid(),
                first_name: z.string().nullable(),
                email: z.string().email(),
                avatar: z.string().url().nullable(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const user = await prisma.user.findUnique({
          select: {
            id: true,
            first_name: true,
            email: true,
            avatar: true,
          },
          where: {
            id: userId,
          },
        })

        if (!user) {
          throw new BadRequestError('User not found.')
        }

        return reply.send({ user })
      },
    )
}
