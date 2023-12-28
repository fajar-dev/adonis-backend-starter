import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Role from 'App/Models/Role'
import ApiResponse from 'App/Helpers/ApiResponse'

export default class RolesController {
  public async index({ response }: HttpContextContract) {
    try {
      const data = await Role.all()
      ApiResponse.sendSuccess(response, data, 'Roles retrieved successfully')
    } catch (error) {
      ApiResponse.sendInternalServerError(response, error.message)
    }
  }

  public async store({ request, response }: HttpContextContract) {
    try {
      const role = new Role()
      role.name = request.input('name')
      const data = await role.save()
      ApiResponse.sendCreated(response, data, 'Roles created successfully')
    } catch (error) {
      ApiResponse.sendInternalServerError(response, error.message)
    }
  }

  public async update({ request, response, params }: HttpContextContract) {
    try {
      const role = await Role.find(params.id)
      if (!role) return ApiResponse.sendBadRequest(response, 'No data to update.')
      role.name = request.input('name')
      const data = await role.save()
      ApiResponse.sendSuccess(response, data, 'Roles updated successfully')
    } catch (error) {
      ApiResponse.sendInternalServerError(response, error.message)
    }
  }

  public async destroy({ response, params }: HttpContextContract) {
    try {
      const role = await Role.findOrFail(params.id)
      const data = await role.delete()
      ApiResponse.sendSuccess(response, data, 'Roles deleted successfully')
    } catch (error) {
      ApiResponse.sendInternalServerError(response, error.message)
    }
  }
}
