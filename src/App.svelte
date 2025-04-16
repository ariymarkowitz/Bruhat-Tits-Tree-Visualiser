<script lang='ts'>
	import { isPrime } from './algebra/utils/int'
	import { setTheme, themes } from './style/themes/themes'
	import TreeCanvas from './Tree/TreeCanvas.svelte'
	import TreeCanvasAnim from './Tree/TreeCanvasAnim.svelte'
	import TreeCanvasAnimDownload from './Tree/TreeCanvasAnimDownload.svelte'
  import StepperInput from './ui/StepperInput.svelte'
	import Latex from './ui/Latex.svelte'
	import MatrixInput from './ui/MatrixInput.svelte'
	import RationalInput from './ui/RationalInput.svelte'

	const inits = {
		p: 2,
		depth: 7,
		end: undefined,
		isometry: undefined,
		resolution: 1,
	}

	let themeInput: string = $state(themes[0].name)
	const theme = $derived(themes.find(t => t.name === themeInput) || themes[0])
	$effect(() => setTheme(theme))

	let p = $state(inits.p)
	function validateP(p: number) {
		return isPrime(p)
	}

	let depthElt: StepperInput
	let depthState: [number, number] = $state([inits.depth, inits.p])
	let depth = $derived(Math.max(
		1, Math.min(
			depthState[0], Math.floor(depthState[0] * (depthState[1]+1) / (p+1))
		)
	))
	$effect(() => depthElt.set(depth))

	let end: [number, number] | undefined = $state(inits.end)
	let showEnd = $state(false)

	let isometry: [number, number][][] | undefined = $state(inits.isometry)
	let showIsometry = $state(false)

	let resolution: number = $state(inits.resolution)

	const Static = Symbol("Static")
	const Animate = Symbol("Animate")
	const Download = Symbol("Download")
	type AnimationType = typeof Animate | typeof Download | typeof Static
	let animate: AnimationType = $state(Static)

	const treeOptions = $derived({end, showEnd, isometry, showIsometry, theme: theme})

	$inspect(isometry)
</script>

<main>
	<div class='container'>
		<div class='tree-container'>
			{#if animate == Animate}
			<TreeCanvasAnim width={800} height={800} p={p} depth={depth} options={treeOptions} resolution={resolution}/>
			{:else if animate == Download}
			<TreeCanvasAnimDownload width={800} height={800} p={p} depth={depth} options={treeOptions} resolution={resolution}
			oncomplete={() => animate = Static}/>
			{:else}
			<TreeCanvas width={800} height={800} p={p} depth={depth} options={treeOptions}/>
			{/if}
		</div>
		<div class='sidebar'>
			<div class='sidebar-row'>p
				<StepperInput min={2} max={11} init={p} valid={validateP} onchange={e => p = e.detail} />
			</div>
			<div class='sidebar-row'>Depth
				<StepperInput min={1} max={10} init={depth} bind:this={depthElt} onchange={e => depthState = [e.detail, p]} />
			</div>
			<hr />
			<div class='sidebar-row'>
				<input type='checkbox' name='end' bind:checked={showEnd} />End<RationalInput allowInf={true} onchange={e => end = e.detail} />
			</div>
			<div class='sidebar-row'>
				<input type='checkbox' name='isometry' bind:checked={showIsometry}/>Isometry
				<div class='combined-elements'>
					<Latex text='\left[\rule{'{'}0cm{'}'}{'{'}3em{'}'}\right.'/>
					<MatrixInput onchange={e => isometry = e.detail} />
					<Latex text='\left.\rule{'{'}0cm{'}'}{'{'}3em{'}'}\right]'/>
				</div>
			</div>
			<hr />
			<div class="sidebar-row">
				<button onclick={e => animate = (animate == Animate ? Static : Animate)}>
					{#if animate == Animate}Stop animation{:else}Animate!{/if}
				</button>
			</div>
			<div class="sidebar-row">
				<button onclick={e => animate = (animate == Download ? Static : Download)}>
					{#if animate == Download}Cancel download{:else}Download animation{/if}
				</button>
			</div>
			<div class="sidebar-row">
				Resolution <select value={resolution.toString()} oninput={e => resolution = Number(e.currentTarget.value)}>
					<option>0.25</option>
					<option>0.5</option>
					<option>1</option>
				</select>
			</div>
			<div class="sidebar-row">
				Theme <select bind:value={themeInput}>
					{#each Object.values(themes) as theme, _}
						<option>{theme.name}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>
</main>