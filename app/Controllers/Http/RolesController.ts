import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Role from 'App/Models/Role'
import ApiResponse from 'App/Helpers/ApiResponse'
import { schema } from '@ioc:Adonis/Core/Validator'

export default class RolesController {
  public async index({ response }: HttpContextContract) {
    const data = await Role.all()
    return ApiResponse.ok(response, data, 'Roles retrieved successfully')
  }

  public async store({ request, response }: HttpContextContract) {
    const newRoleSchema = schema.create({
      name: schema.string(),
    })
    const payload = await request.validate({ schema: newRoleSchema })

    const role = new Role()
    role.name = payload.name
    const data = await role.save()
    return ApiResponse.created(response, data, 'Roles created successfully')
  }

  public async update({ request, response, params }: HttpContextContract) {
    const newRoleSchema = schema.create({
      name: schema.string(),
    })
    const payload = await request.validate({ schema: newRoleSchema })

    const role = await Role.find(params.id)
    if (!role) return ApiResponse.badRequest(response, 'No data to update.')
    role.name = payload.name
    const data = await role.save()
    return ApiResponse.ok(response, data, 'Roles updated successfully')
  }

  public async destroy({ response, params }: HttpContextContract) {
    const role = await Role.find(params.id)
    if (!role) return ApiResponse.badRequest(response, 'No data to delete.')
    const data = await role.delete()
    return ApiResponse.ok(response, data, 'Roles deleted successfully')
  }
}
