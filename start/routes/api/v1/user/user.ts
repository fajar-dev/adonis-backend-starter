import Route from '@ioc:Adonis/Core/Route'

export default () => {
  Route.resource('user', 'UsersController').only(['index', 'store', 'update', 'destroy'])
}
