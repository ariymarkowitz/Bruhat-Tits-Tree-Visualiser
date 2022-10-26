<script lang='ts'>
	import { isPrime } from './algebra/utils/int'
	import { setTheme, theme, themes } from './style/themes/themes'
	import TreeCanvas from './Tree/TreeCanvas.svelte'
	import TreeCanvasAnim from './Tree/TreeCanvasAnim.svelte'
	import TreeCanvasAnimDownload from './Tree/TreeCanvasAnimDownload.svelte'
	import type { TreeOptions } from './Tree/TreeRenderer'
	import Latex from './UI/Latex.svelte'
	import MatrixInput from './UI/MatrixInput.svelte'
	import NumberInput, { ChangeEvent } from './UI/NumberInput.svelte'
	import RationalInput from './UI/RationalInput.svelte'

	let themeInput: string
	$: {
		const newTheme = themes.find(t => t.name === themeInput) || themes[0]
		theme.set(newTheme)
	}
	$: setTheme($theme)

	let p: number = 2

	let depth = 7
	let depthInputValue: string

	let depthState: [number, number] = [depth, p]

	let endInput: [number, number] | undefined
	let end: [number, number] | undefined
	let showEnd: boolean = false
	$: end = endInput && [endInput[1], endInput[0]]

	let isometry: [number, number][][] | undefined
	let showIsometry: boolean = false

	let treeOptions: TreeOptions

	let resolutionInput: string = '1'
	let resolution: number = 1
	$: resolution = Number(resolutionInput)

	const STATIC = Symbol("Static")
	const ANIMATE = Symbol("Animate")
	const DOWNLOAD = Symbol("Download")
	type AnimationType = typeof ANIMATE | typeof DOWNLOAD | typeof STATIC
	let animate: AnimationType = STATIC

	function validateP(p: number) {
		return isPrime(p)
	}

	function onDepthChange(event: ChangeEvent) {
		depthState = [event.detail.state, p]
	}

	$: depth = Math.max(1, Math.min(depthState[0], Math.floor(depthState[0] * (depthState[1]+1) / (p+1))))
	$: depthInputValue = depth.toString()
	$: treeOptions = {end, showEnd, isometry, showIsometry, theme: $theme}
</script>

<main>
	<div class='container'>
		<div class='tree-container'>
			{#if animate == ANIMATE}
			<TreeCanvasAnim width={800} height={800} p={p} depth={depth} options={treeOptions} resolution={resolution}/>
			{:else if animate == DOWNLOAD}
			<TreeCanvasAnimDownload width={800} height={800} p={p} depth={depth} options={treeOptions} resolution={resolution}
			on:download-complete={_ => animate = STATIC}/>
			{:else}
			<TreeCanvas width={800} height={800} p={p} depth={depth} options={treeOptions}/>
			{/if}
		</div>
		<div class='sidebar'>
			<div class='sidebar-row'>p<NumberInput min={2} max={11} init={p} valid={validateP} bind:state={p}/></div>
			<div class='sidebar-row'>Depth<NumberInput min={1} max={10} init={depth} bind:value={depthInputValue} on:change={onDepthChange}/></div>
			<hr />
			<div class='sidebar-row'>
				<input type='checkbox' name='end' bind:checked={showEnd} />End<RationalInput allowInf={true} bind:state={endInput}/>
			</div>
			<div class='sidebar-row'>
				<input type='checkbox' name='isometry' bind:checked={showIsometry}/>Isometry
				<div class='combined-elements'>
					<Latex text='\left[\rule{'{'}0cm{'}'}{'{'}3em{'}'}\right.'/>
					<MatrixInput bind:state={isometry}/>
					<Latex text='\left.\rule{'{'}0cm{'}'}{'{'}3em{'}'}\right]'/>
				</div>
			</div>
			<hr />
			<div class="sidebar-row">
				<button on:click={e => animate = (animate == ANIMATE ? STATIC : ANIMATE)}>
					{#if animate == ANIMATE}Stop animation{:else}Animate!{/if}
				</button>
			</div>
			<div class="sidebar-row">
				<button on:click={e => animate = (animate == DOWNLOAD ? STATIC : DOWNLOAD)}>
					{#if animate == DOWNLOAD}Cancel download{:else}Download animation{/if}
				</button>
			</div>
			<div class="sidebar-row">
				Resolution <select bind:value={resolutionInput}>
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
<style lang='scss' global>
	body {
		color: var(--textColor);
		background-color: var(--bgColor);
		font: 15px sans-serif;
		margin: 0;
	}

	.container {
		display: flex;
		justify-content: center;
		flex-direction: row;
		gap: 0px 10px;
		padding: 10px;

		@media screen and (max-width: 600px) {
			flex-direction: column;
		}
	}

	.tree-container {
		max-width: 800px;
		flex: 1;

		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.sidebar {
		width: 230px;
		display: flex;
		flex-direction: column;
		gap: 1em;

		@media screen and (max-width: 600px) {
			width: 100%;
		}
	}

	.sidebar-row {
		display: flex;
		flex-direction: row;
		gap: 10px;
		align-items: center;
	}

	input[type='text'], select, button {
		font: inherit;
		background-color: inherit;
		color: inherit;
		width: 100%;
		border: 1px solid var(--borderColor);
		padding: 0.7em;
		box-sizing: border-box;
		border-radius: 4px;
	}

	input[type='text'], select {
		&:focus {
			outline: none;
			border-color: var(--focusBorderColor);
		}
	}

	option {
		background-color: var(--bgColor);
	}

	input[type='checkbox'] {
		appearance: none;
		flex-shrink: 0;
		display: grid;
  	place-content: center;
		margin: 0;
		width: 18px;
		height: 18px;
		border: 2px solid var(--thickBorderColor);
		background-color: none;
	}

	input[type="checkbox"]::before {
		content: "";
		width: 10px;
		height: 10px;
	}

	input[type="checkbox"]:checked::before {
		background-color: white;
	}

	input[type="checkbox"][name="end"]:checked::before {
		background-color: var(--endColor);
	}

	input[type="checkbox"][name="isometry"]:checked::before {
		width: 9px;
		height: 9px;
		background: none;
		border-style: solid;
		border-width: 0px 0px 9px 9px;
		border-color: transparent transparent var(--translationAxisColor) transparent;
		box-sizing: border-box;
		margin-top: 3px;
		position: absolute;
		margin-left: 3px;
	}

	input[type="checkbox"][name="isometry"]:checked::after {
		content: "";
		width: 9px;
		height: 9px;
		background: none;
		border-style: solid;
		border-width: 9px 9px 0px 0px;
		border-color: var(--fixedPointColor) transparent transparent transparent;
		box-sizing: border-box;
		margin-top: 2px;
		position: absolute;
		margin-left: 2px;
	}

	hr {
		border: none;
		width: 80%;
		height: 1px;
		background-color: var(--borderColor);
	}

	.number-input {
		display: flex;
		width: 100%;
		flex-direction: row;
		input[type='text'] {
			border-radius: 4px 0 0 4px;
		}

		.number-input-buttons {
			flex-shrink: 0;
			width: 20px;

			display: flex;
			flex-direction: column;

			.number-input-up {
				flex: 1;
				border: 1px solid var(--borderColor);
				border-left: none;

				border-radius: 0 4px 0 0;

				position: relative;

				i {
					border-width: 0 .3em .3em;
					border-color: transparent transparent var(--borderColor);
					border-style: solid;
					margin: -0.2em 0 0 -0.3em;
				}

				&:hover i {
					border-color: transparent transparent var(--focusBorderColor);
				}
			}

			.number-input-down {
				flex: 1;
				border: 1px solid var(--borderColor);;
				border-left: none;
				border-top: none;

				border-radius: 0 0 4px 0;

				position: relative;

				i {
					border-width: .3em .3em 0;
					border-color: var(--borderColor) transparent transparent;
					border-style: solid;
					margin: -0.1em 0 0 -0.3em;
				}

				&:hover i {
					border-color: var(--focusBorderColor) transparent transparent;
				}
			}

			i {
				position: absolute;
				top: 50%;
				left: 50%;
			}
		}
	}
	.matrix-input-container {
		display: flex;
		gap: 0.5em;
		align-items: center;

		.matrix-input {
			display: inline-grid;
			grid-template-columns: repeat(2, 1fr);
			grid-template-rows: repeat(2, 1fr);
			gap: 3px;
			width: 100px;
			height: 80px;
		
			input {
				background: none;
				color: inherit;
				border: 1px dashed var(--borderColor);;
				padding: 2px;
				text-align: center;
			}
		
			input:focus {
				border-color: var(--focusBorderColor);;
			}
		}
	}
	
	.combined-elements {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.2em;
	}

	.latex {
		color: var(--thickBorderColor);;
	}
</style>