import { data } from 'react-router'
import { getUserId, requireUserId } from './auth.server.ts'
import { prisma } from './db.server.ts'
import { type PermissionString, parsePermissionString } from './user.ts'

export async function userWithPermission(
	request: Request,
	permission: PermissionString
) {
	const userId = await getUserId(request)
	const permissionData = parsePermissionString(permission)
	if (!userId) return;

	if (await userWithRole(request, 'admin')) {
		return userId;
	}

	const user = await prisma.user.findFirst({
		select: { id: true },
		where: {
			id: userId,
			roles: {
				some: {
					permissions: {
						some: {
							...permissionData,
							access: permissionData.access
								? { in: permissionData.access }
								: undefined,
						},
					},
				},
			},
		},
	});

	return user?.id;
}

export async function userWithRole(
	request: Request,
	name: string
) {
	const userId = await getUserId(request)
	if (!userId) return;

	const user = await prisma.user.findFirst({
		select: { id: true },
		where: { id: userId, roles: { some: { name } } },
	})

	return user?.id
}

export async function requireUserWithPermission(
	request: Request,
	permission: PermissionString,
) {
	const userId = await userWithPermission(request, permission)
	const permissionData = parsePermissionString(permission)

	if (!userId) {
		throw data(
			{
				error: 'Unauthorized',
				requiredPermission: permissionData,
				message: `Unauthorized: required permissions: ${permission}`,
			},
			{ status: 403 },
		)
	}
	return userId
}

export async function requireUserWithRole(request: Request, name: string) {
	const userId = await requireUserId(request)
	const user = await prisma.user.findFirst({
		select: { id: true },
		where: { id: userId, roles: { some: { name } } },
	})
	if (!user) {
		throw data(
			{
				error: 'Unauthorized',
				requiredRole: name,
				message: `Unauthorized: required role: ${name}`,
			},
			{ status: 403 },
		)
	}
	return user.id
}
