import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import ApiResponse from 'App/Helpers/ApiResponse'
import User from 'App/Models/User'

export default class AuthController {
  public async register({ request, response }: HttpContextContract) {
    const newRoleSchema = schema.create({
      name: schema.string(),
      email: schema.string([rules.email(), rules.unique({ table: 'users', column: 'email' })]),
      password: schema.string([rules.minLength(6)]),
    })
    const payload = await request.validate({ schema: newRoleSchema })

    const user = new User()
    user.name = payload.name
    user.email = payload.email
    user.password = payload.password
    const data = await user.save()

    return ApiResponse.created(response, data, 'User register created successfully')
  }

  public async login({ auth, request, response }: HttpContextContract) {
    try {
      const newRoleSchema = schema.create({
        email: schema.string([rules.email()]),
        password: schema.string(),
      })
      const payload = await request.validate({ schema: newRoleSchema })

      const user = await User.query().where('email', payload.email).preload('role').first()
      const email = payload.email
      const password = payload.password
      const token = await auth.use('api').attempt(email, password)

      return ApiResponse.ok(
        response,
        { user: user, access_token: token },
        'User Login successfully'
      )
    } catch (error) {
      return ApiResponse.unauthorized(response, 'Invalid Credentials')
    }
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.use('api').revoke()
    return ApiResponse.ok(response, null, 'User logged out successfully')
  }

  public async me({ auth, response }: HttpContextContract) {
    const user = await auth.use('api').authenticate()
    // Assuming you want to preload the 'role' relationship
    await user.preload('role')
    return ApiResponse.ok(response, { user }, 'User details fetched successfully')
  }
}
