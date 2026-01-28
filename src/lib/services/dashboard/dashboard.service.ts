import { getUser } from '../users/users.service'
import type { User } from '../users/users.types'

export const getDashboardUser = async (): Promise<User> => getUser()
