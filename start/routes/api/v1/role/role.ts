import Route from '@ioc:Adonis/Core/Route'

export default () => {
  Route.resource('role', 'RoleController').only(['index', 'store', 'update', 'destroy'])
}
