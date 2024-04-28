import { hash } from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { BadRequestError } from '@/http/controllers/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'

export async function createUser(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/users',
      {
        schema: {
          tags: ['Users'],
          summary: 'Create a new user',
          body: z.object({
            first_name: z.string(),
            email: z.string().email(),
            document: z.string().min(11),
          }),
        },
      },
      async (request, reply) => {
        const { first_name, email, document } = request.body

        const userWithSameEmail = await prisma.user.findUnique({
          where: {
            email,
          },
        })

        if (userWithSameEmail) {
          throw new BadRequestError('User with same e-mail already exists.')
        }

        const userWithSameDocement = await prisma.user.findUnique({
          where: {
            document,
          },
        })

        if (userWithSameDocement) {
          throw new BadRequestError('User with same Cpf already exists.')
        }

        const passwordHash = await hash(document, 6)

        await prisma.user.create({
          data: {
            first_name,
            document,
            email,
            password: passwordHash,
          },
        })

        return reply.status(201).send()
      },
    )
}
