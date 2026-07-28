<script lang='ts'>
	import { isPrime } from './algebra/utils/int'
	import { setTheme, themes } from './style/themes/themes'
	import TreeCanvas, { type Characteristic } from './Tree/TreeCanvas.svelte'
	import MatrixInput from './ui/MatrixInput.svelte'
	import RationalInput from './ui/RationalInput.svelte'
	import RationalPolyInput from './ui/RationalPolyInput.svelte'
	import StepperInput from './ui/StepperInput.svelte'

	let themeInput: string = $state(themes[0].name)
	const theme = $derived(themes.find(t => t.name === themeInput) || themes[0])
	$effect(() => setTheme(theme))

	let characteristic: Characteristic = $state("zero")
	let p = $state(2)

	// The depth the user asked for, and the p it was asked at. Raising p caps the drawn
	// depth (keeping the vertex count manageable), but the original request is remembered,
	// so lowering p again restores it.
	let chosenDepth = $state({ depth: 7, p: 2 })
	let depth = $derived(Math.max(
		1, Math.min(
			chosenDepth.depth, Math.floor(chosenDepth.depth * (chosenDepth.p + 1) / (p + 1))
		)
	))

	let end: { zero?: [number, number], nonzero?: [number[], number[]] } = $state({})
	let showEnd = $state(true)

	let isometry: { zero?: [unknown, unknown][][], nonzero?: [unknown, unknown][][] } = $state({})
	let showIsometry = $state(true)

	let resolution: number = $state(1)

	type Mode = "animate" | "download" | "static"
	let mode: Mode = $state("static")

	const treeOptions = $derived({
		end: end[characteristic],
		showEnd,
		isometry: isometry[characteristic],
		showIsometry,
		theme
	})
</script>

<main>
	<div class='container'>
		<div class='tree-container'>
			<TreeCanvas
				{mode} {characteristic} {p} {depth} {resolution}
				width={800} height={800}
				options={treeOptions}
				oncomplete={() => mode = "static"}
			/>
		</div>
		<div class='sidebar'>
			<div class='sidebar-row'>
				Characteristic
				<select bind:value={characteristic}>
					<option value="zero">0</option>
					<option value="nonzero">p</option>
				</select>
			</div>
			<div class='sidebar-row'>p
				<StepperInput min={2} max={11} value={p} valid={isPrime} onchange={n => p = n} />
			</div>
			<div class='sidebar-row'>Depth
				<StepperInput min={1} max={10} value={depth} onchange={n => chosenDepth = { depth: n, p }} />
			</div>
			<hr />
			<div class='sidebar-row'>
				<input type='checkbox' name='end' bind:checked={showEnd} />End
				<div style:display={characteristic === 'zero' ? '' : 'none'}>
					<RationalInput allowInf={true} onchange={v => end.zero = v} />
				</div>
				<div style:display={characteristic === 'nonzero' ? '' : 'none'}>
					<RationalPolyInput allowInf={true} onchange={v => end.nonzero = v}/>
				</div>
			</div>
			<div class='sidebar-row'>
				<input type='checkbox' name='isometry' bind:checked={showIsometry}/>Isometry
					<div style:display={characteristic === 'zero' ? '' : 'none'}>
						<MatrixInput characteristic={"zero"} onchange={v => isometry.zero = v} />
					</div>
					<div style:display={characteristic === 'nonzero' ? '' : 'none'}>
						<MatrixInput characteristic={"nonzero"} onchange={v => isometry.nonzero = v} />
					</div>
			</div>
			<hr />
			<div class="sidebar-row">
				<button onclick={() => mode = (mode === "animate" ? "static" : "animate")}>
					{#if mode === "animate"}Stop animation{:else}Animate!{/if}
				</button>
			</div>
			<div class="sidebar-row">
				<button onclick={() => mode = (mode === "download" ? "static" : "download")}>
					{#if mode === "download"}Cancel download{:else}Download animation{/if}
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
					{#each themes as theme}
						<option>{theme.name}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>
	<a href="https://github.com/ariymarkowitz/Bruhat-Tits-Tree-Visualiser/" class="github" draggable=false target="_blank" rel="noopener noreferrer">
    <img src={theme.ui.githubColor === "white" ? "./github-mark-white.svg" : "./github-mark.svg"}
		alt="Link to GitHub" width="40" height="40" draggable=false />
  </a>
</main>
