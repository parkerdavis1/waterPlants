<script lang="ts">
	import { Button } from 'src/lib/components/ui/button'
	import { Input } from 'src/lib/components/ui/input'
	import { Label } from 'src/lib/components/ui/label'
	import { enhance } from '$app/forms'
	import type { ActionData } from './$types'

	let { form }: { form: ActionData } = $props()
</script>

<h1>Login</h1>
<form method="POST" action="?/login">
	<Label>
		Username
		<Input name="username" autofocus />
	</Label>
	<Label>
		Password
		<Input type="password" name="password" />
	</Label>
	<Button type="submit">Login</Button>
	<!-- <Button type="submit" formaction="?/register" variant="secondary">Register</Button> -->
</form>
<p style="color: red">{form?.message ?? ''}</p>
