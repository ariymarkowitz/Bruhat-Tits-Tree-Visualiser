<script lang='ts'>
	import { isPrime } from './algebra/utils/int'
	import { setTheme, themes } from './style/themes/themes'
	import TreeCanvas, { type Characteristic } from './Tree/TreeCanvas.svelte'
	import MatrixInput from './ui/MatrixInput.svelte'
	import RationalInput from './ui/RationalInput.svelte'
	import RationalPolyInput from './ui/RationalPolyInput.svelte'
	import StepperInput from './ui/StepperInput.svelte'
	import { examples } from './ui/examples'
	import { deepEquals } from './utils/equals'

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

	// An example is 'chosen' exactly while the field and the matrix still match it,
	// so editing the matrix by hand takes the dropdown back to its placeholder.
	const chosenExample = $derived(examples.find(e =>
		e.characteristic === characteristic && e.p === p
		&& deepEquals(e.matrix, isometry[e.characteristic])
	))

	function chooseExample(name: string) {
		const example = examples.find(e => e.name === name)
		if (!example) {
			isometry[characteristic] = undefined
			return
		}
		characteristic = example.characteristic
		p = example.p
		isometry[example.characteristic] = example.matrix
		showIsometry = true
	}

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
						<MatrixInput characteristic={"zero"}
							value={isometry.zero} onchange={v => isometry.zero = v} />
					</div>
					<div style:display={characteristic === 'nonzero' ? '' : 'none'}>
						<MatrixInput characteristic={"nonzero"}
							value={isometry.nonzero} onchange={v => isometry.nonzero = v} />
					</div>
			</div>
			<div class='sidebar-row'>
				<select value={chosenExample?.name ?? ''} onchange={e => chooseExample(e.currentTarget.value)}>
					<option value=''>Examples</option>
					<optgroup label='Characteristic 0'>
						{#each examples.filter(e => e.characteristic === 'zero') as example}
							<option value={example.name}>{example.name}</option>
						{/each}
					</optgroup>
					<optgroup label='Characteristic p'>
						{#each examples.filter(e => e.characteristic === 'nonzero') as example}
							<option value={example.name}>{example.name}</option>
						{/each}
					</optgroup>
				</select>
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
