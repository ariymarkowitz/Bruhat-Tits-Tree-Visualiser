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
  import RationalPolyInput from './ui/RationalPolyInput.svelte';

	const inits = {
		characteristic: "nonzero",
		p: 2,
		depth: 3,
		end: undefined,
		isometry: undefined,
		resolution: 1,
	}

	let themeInput: string = $state(themes[0].name)
	const theme = $derived(themes.find(t => t.name === themeInput) || themes[0])
	$effect(() => setTheme(theme))

	let characteristic = $state(inits.characteristic) as "zero" | "nonzero"
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
	$effect(() => { depthElt.set(depth) })

	let char0end: [number, number] | undefined = $state(inits.end)
	let charpend: [number[], number[]] | undefined = $state(inits.end)
	let showEnd = $state(false)

	let char0isometry: [unknown, unknown][][] | undefined = $state(inits.isometry)
	let charpisometry: [unknown, unknown][][] | undefined = $state(inits.isometry)
	let showIsometry = $state(false)

	let resolution: number = $state(inits.resolution)

	type AnimationType = "animate" | "download" | "static"
	let animate: AnimationType = $state("static")

	const treeOptions = $derived({
		end: characteristic === "zero" ? char0end : charpend,
		showEnd,
		isometry: characteristic === "zero" ? char0isometry : charpisometry,
		showIsometry,
		theme: theme
	})
</script>

<main>
	<div class='container'>
		<div class='tree-container'>
			{#if animate === "animate"}
			<TreeCanvasAnim width={800} height={800} characteristic={characteristic} p={p} depth={depth} options={treeOptions} resolution={resolution}/>
			{:else if animate === "download"}
			<TreeCanvasAnimDownload width={800} height={800} characteristic={characteristic} p={p} depth={depth} options={treeOptions} resolution={resolution}
			oncomplete={() => animate = "static"}/>
			{:else}
			<TreeCanvas width={800} height={800} characteristic={characteristic} p={p} depth={depth} options={treeOptions}/>
			{/if}
		</div>
		<div class='sidebar'>
			<div class='sidebar-row'>
				Characteristic
				<select value={characteristic} oninput={e => characteristic = e.currentTarget.value as "zero" | "nonzero"}>
					<option value="zero">0</option>
					<option value="nonzero">p</option>
				</select>
			</div>
			<div class='sidebar-row'>p
				<StepperInput min={2} max={11} init={p} valid={validateP} onchange={e => p = e.detail} />
			</div>
			<div class='sidebar-row'>Depth
				<StepperInput min={1} max={10} init={depth} bind:this={depthElt} onchange={e => depthState = [e.detail, p]} />
			</div>
			<hr />
			<div class='sidebar-row'>
				<input type='checkbox' name='end' bind:checked={showEnd} />End
				<div style:display={characteristic === 'zero' ? '' : 'none'}>
					<RationalInput allowInf={true} onchange={e => char0end = e.detail} />
				</div>
				<div style:display={characteristic === 'nonzero' ? '' : 'none'}>
					<RationalPolyInput allowInf={true} onchange={e => charpend = e.detail}/>
				</div>
			</div>
			<div class='sidebar-row'>
			</div>
			<div class='sidebar-row'>
				<input type='checkbox' name='isometry' bind:checked={showIsometry}/>Isometry
					<div class='combined-elements' style:display={characteristic === 'zero' ? '' : 'none'}>
						<Latex text='\left[\rule{'{'}0cm{'}'}{'{'}3em{'}'}\right.'/>
						<MatrixInput characteristic={"zero"} onchange={e => char0isometry = e.detail} />
						<Latex text='\left.\rule{'{'}0cm{'}'}{'{'}3em{'}'}\right]'/>
					</div>
					<div class='combined-elements' style:display={characteristic === 'nonzero' ? '' : 'none'}>
						<Latex text='\left[\rule{'{'}0cm{'}'}{'{'}3em{'}'}\right.'/>
						<MatrixInput characteristic={"nonzero"} onchange={e => charpisometry = e.detail} />
						<Latex text='\left.\rule{'{'}0cm{'}'}{'{'}3em{'}'}\right]'/>
					</div>
			</div>
			<hr />
			<div class="sidebar-row">
				<button onclick={_ => animate = (animate === "animate" ? "static" : "animate")}>
					{#if animate == "animate"}Stop animation{:else}Animate!{/if}
				</button>
			</div>
			<div class="sidebar-row">
				<button onclick={_ => animate = (animate === "download" ? "static" : "download")}>
					{#if animate == "download"}Cancel download{:else}Download animation{/if}
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
	<a href="https://github.com/ariymarkowitz/Bruhat-Tits-Tree-Visualiser/" class="github" draggable=false target="_blank" rel="noopener noreferrer">
    <img src={theme.ui.githubColor === "white" ? "src/github-mark-white.svg" : "src/github-mark.svg"}
		alt="Link to GitHub" width="40" height="40" draggable=false />
  </a>
</main>