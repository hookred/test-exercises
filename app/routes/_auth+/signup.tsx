import { getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { data, useSearchParams } from 'react-router'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { z } from 'zod'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { FormTemplate } from '#app/components/forms/default-form.tsx'
import { InputField } from '#app/components/forms.tsx'
import { requireAnonymous, sessionKey, signup } from '#app/utils/auth.server.ts'
import {
	ProviderConnectionForm,
	providerNames,
} from '#app/utils/connections.tsx'
import { prisma } from '#app/utils/db.server.ts'
import { checkHoneypot } from '#app/utils/honeypot.server.ts'
import { useIsPending } from '#app/utils/misc.tsx'
import { authSessionStorage } from '#app/utils/session.server.ts'
import { redirectWithToast } from '#app/utils/toast.server.ts'
import { EmailSchema, NameSchema, PasswordAndConfirmPasswordSchema } from '#app/utils/user-validation.ts'
import { verifySessionStorage } from '#app/utils/verification.server.ts'
import { type Route } from './+types/signup.ts'

export const handle: SEOHandle = {
	getSitemapEntries: () => null,
}

const SignupFormSchema = z.object({
	email: EmailSchema,
	name: NameSchema,
	remember: z.boolean().optional(),
	redirectTo: z.string().optional(),
}).and(PasswordAndConfirmPasswordSchema)

export async function loader({ request }: Route.LoaderArgs) {
	await requireAnonymous(request)
	return null
}

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData()

	await checkHoneypot(formData)

	const submission = await parseWithZod(formData, {
		schema: SignupFormSchema.superRefine(async (data, ctx) => {
			const existingUser = await prisma.user.findUnique({
				where: { email: data.email },
				select: { id: true },
			})
			if (existingUser) {
				ctx.addIssue({
					path: ['email'],
					code: z.ZodIssueCode.custom,
					message: 'A user already exists with this email',
				})
				return
			}
		}).transform(async (data) => {
			const session = await signup({ ...data })
			return { ...data, session }
		}),
		async: true,
	})

	if (submission.status !== 'success') {
		return data(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}
	const { session, remember, redirectTo } = submission.value
	const authSession = await authSessionStorage.getSession(
			request.headers.get('cookie'),
		)
		authSession.set(sessionKey, session.id)
		const verifySession = await verifySessionStorage.getSession()
		const headers = new Headers()
		headers.append(
			'set-cookie',
			await authSessionStorage.commitSession(authSession, {
				expires: remember ? session.expirationDate : undefined,
			}),
		)
		headers.append(
			'set-cookie',
			await verifySessionStorage.destroySession(verifySession),
		)
	
		return redirectWithToast(
			safeRedirect(redirectTo),
			{ title: 'Welcome', description: 'Thanks for signing up!' },
			{ headers },
		)
}

export const meta: Route.MetaFunction = () => {
	return [{ title: 'Sign Up | Epic Notes' }]
}

export default function SignupRoute({ actionData }: Route.ComponentProps) {
	const isPending = useIsPending()
	const [searchParams] = useSearchParams()
	const redirectTo = searchParams.get('redirectTo')

	const [form, fields] = useForm({
		id: 'signup-form',
		constraint: getZodConstraint(SignupFormSchema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			const result = parseWithZod(formData, { schema: SignupFormSchema })
			return result
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<div className="container flex flex-col justify-center pt-20 pb-32">
			<div className="text-center">
				<h1 className="text-h1">Let's start your journey!</h1>
				<p className="text-body-md text-muted-foreground mt-3">
					Please enter your email.
				</p>
			</div>
			<div className="mx-auto mt-16 max-w-sm min-w-full sm:min-w-[368px]">
				<FormTemplate
					form={form}
					title='Sign Up'
					isPending={isPending}
					method='POST'
				>
					<HoneypotInputs />

					<InputField
						label='Name'
						errors={fields.name.errors}
						autoComplete="name"
						{...getInputProps(fields.name, { type: 'text' })}
					/>
					<InputField
						label='Email'
						errors={fields.email.errors}
						autoComplete="email"
						{...getInputProps(fields.email, { type: 'email' })}
					/>
					<InputField
						label='Password'
						errors={fields.password.errors}
						{...getInputProps(fields.password, { type: 'password' })}
					/>
					<InputField
						label='Confirm Password'
						errors={fields.confirmPassword.errors}
						{...getInputProps(fields.confirmPassword, { type: 'password' })}
					/>

				</FormTemplate>
				<ul className="flex flex-col gap-4 py-4">
					{providerNames.map((providerName) => (
						<>
							<hr />
							<li key={providerName}>
								<ProviderConnectionForm
									type="Signup"
									providerName={providerName}
									redirectTo={redirectTo}
								/>
							</li>
						</>
					))}
				</ul>
			</div>
		</div>
	)
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
