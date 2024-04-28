import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import fastify from 'fastify'
import { env } from '@/env'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { errorHandler } from '@/http/error-handler'

import { authenticate } from '@/http/controllers/auth/authenticate'
import { createUser } from '@/http/controllers/users/create-user'
import { profile } from '@/http/controllers/users/profile-user'

const app = fastify().withTypeProvider<ZodTypeProvider>()
app.register(fastifyCors)

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.setErrorHandler(errorHandler)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Hórus api',
      description: '',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.get('/', function (request, reply) {
  reply.send({ data: new Date() })
})
app.register(authenticate)
app.register(createUser)
app.register(profile)

app
  .listen({
    host: '0.0.0.0',
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running!', env.PORT)
  })
