import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import ApiResponse from 'App/Helpers/ApiResponse'
import { schema, ValidationException, rules } from '@ioc:Adonis/Core/Validator'
import Application from '@ioc:Adonis/Core/Application'

export default class UsersController {
  public async index({ response }: HttpContextContract) {
    try {
      const data = await User.query().preload('role')
      ApiResponse.sendSuccess(response, data, 'Roles retrieved successfully')
    } catch (error) {
      ApiResponse.sendInternalServerError(response, error.message)
    }
  }

  public async store({ request, response }: HttpContextContract) {
    try {
      const newRoleSchema = schema.create({
        name: schema.string(),
        email: schema.string([rules.email(), rules.unique({ table: 'users', column: 'email' })]),
        password: schema.string([rules.minLength(6)]),
        image: schema.file({
          size: '2mb',
          extnames: ['jpg', 'gif', 'png'],
        }),
        roleId: schema.string.optional([rules.exists({ table: 'roles', column: 'id' })]),
      })
      const payload = await request.validate({ schema: newRoleSchema })

      // Handle file upload for the image
      await payload.image.move(Application.publicPath('user'))

      const user = new User()
      user.name = payload.name
      user.email = payload.email
      user.password = payload.password
      user.image = payload.image?.clientName
      user.roleId = payload.roleId
      const data = await user.save()
      ApiResponse.sendCreated(response, data, 'User created successfully')
    } catch (error) {
      if (error instanceof ValidationException) {
        return ApiResponse.sendValidationError(response, error.messages.errors)
      }
      ApiResponse.sendInternalServerError(response, error.message)
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    try {
      const newRoleSchema = schema.create({
        name: schema.string(),
        email: schema.string([
          rules.email(),
          rules.unique({
            table: 'users',
            column: 'email',
            whereNot: { id: params.id }, // Exclude the current user
          }),
        ]),
        password: schema.string.optional([rules.minLength(6)]),
        image: schema.file.optional({
          size: '2mb',
          extnames: ['jpg', 'gif', 'png'],
        }),
        roleId: schema.string.optional([rules.exists({ table: 'roles', column: 'id' })]),
      })
      const payload = await request.validate({ schema: newRoleSchema })

      // Handle file upload for the image
      if (payload.image) {
        await payload.image.move(Application.publicPath('user'))
      }

      const user = await User.find(params.id)
      if (!user) return ApiResponse.sendBadRequest(response, 'No data to update.')
      user.name = payload.name
      user.email = payload.email
      if (payload.password) {
        user.password = payload.password
      }
      user.roleId = payload.roleId
      if (payload.image) {
        user.image = payload.image?.clientName
      }
      const data = await user.save()

      ApiResponse.sendSuccess(response, data, 'User created successfully')
    } catch (error) {
      if (error instanceof ValidationException) {
        return ApiResponse.sendValidationError(response, error.messages.errors)
      }
      ApiResponse.sendInternalServerError(response, error.message)
    }
  }

  public async destroy({ response, params }: HttpContextContract) {
    try {
      const user = await User.find(params.id)
      if (!user) return ApiResponse.sendBadRequest(response, 'No data to delete.')
      const data = await user.delete()
      ApiResponse.sendSuccess(response, data, 'Roles deleted successfully')
    } catch (error) {
      ApiResponse.sendInternalServerError(response, error.message)
    }
  }
}
