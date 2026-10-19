import bcrypt from 'bcryptjs'
import { prisma } from './db'
import type { AuthUser } from '@/types'

export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({ where: { username } })
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12)
}

export async function createUser(data: {
  username: string
  name: string
  email: string
  password: string
  role: 'admin' | 'viewer'
}): Promise<AuthUser> {
  const passwordHash = await hashPassword(data.password)
  const user = await prisma.user.create({
    data: {
      username: data.username,
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
    },
  })
  return { id: user.id, username: user.username, name: user.name, role: user.role }
}
