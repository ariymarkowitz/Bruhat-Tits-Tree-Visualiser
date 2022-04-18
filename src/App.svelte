<script lang='ts'>
	import { isPrime } from './algebra/utils/int'
	import TreeCanvas from './Tree/TreeCanvas.svelte'
	import TreeCanvasAnim from './Tree/TreeCanvasAnim.svelte'
import TreeCanvasAnimDownload from './Tree/TreeCanvasAnimDownload.svelte';
	import type { TreeOptions } from './Tree/TreeRenderer'
	import MatrixInput from './UI/MatrixInput.svelte'
	import NumberInput, { ChangeEvent } from './UI/NumberInput.svelte'
	import RationalInput from './UI/RationalInput.svelte'

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

	$: depth = Math.max(2, Math.min(depthState[0], Math.floor(depthState[0] * (depthState[1]+1) / (p+1))))
	$: depthInputValue = depth.toString()
	$: treeOptions = {end, showEnd, isometry, showIsometry}
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
				<input type='checkbox' bind:checked={showEnd} />End<RationalInput allowInf={true} bind:state={endInput}/>
			</div>
			<div class='sidebar-row'>
				<input type='checkbox' bind:checked={showIsometry}/>Isometry
				<MatrixInput bind:state={isometry}/>
			</div>
			<div class='sidebar-row'>
				<input type='checkbox' />Show image of origin
			</div>
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
		</div>
	</div>
</main>
<style lang='scss' global>
	$textColor: white;
	$bgColor: black;
	$borderColor: rgba(255, 255, 255, 0.6);
	$focusBorderColor: white;

	body {
		color: $textColor;
		background-color: $bgColor;
		font: 15px sans-serif;
		margin: 0;
	}

	.container {
		display: flex;
		justify-content: center;
		flex-direction: row;
		gap: 10px;
	}

	.tree-container {
		max-width: 900px;
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.sidebar {
		width: 200px;
		display: flex;
		flex-direction: column;
		gap: 1em;
		padding-top: 10px;
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
		border: 1px solid $borderColor;
		padding: 0.7em;
		box-sizing: border-box;
		border-radius: 4px;

		&:focus {
			outline: none;
			border-color: $focusBorderColor;
		}
	}

	option {
		background-color: $bgColor;
	}

	input[type='checkbox'] {
		margin: 0;
		width: 18px;
		height: 18px;
		flex-shrink: 0;
	}

	hr {
		border: none;
		width: 80%;
		height: 1px;
		background-color: $borderColor;
	}

	.number-input {
		display: flex;
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
				border: 1px solid $borderColor;
				border-left: none;

				border-radius: 0 4px 0 0;

				position: relative;

				i {
					border-width: 0 .3em .3em;
					border-color: transparent transparent rgba(255, 255, 255, 0.6);
					border-style: solid;
					margin: -0.2em 0 0 -0.3em;
				}

				&:hover i {
					border-color: transparent transparent $focusBorderColor;
				}
			}

			.number-input-down {
				flex: 1;
				border: 1px solid $borderColor;
				border-left: none;
				border-top: none;

				border-radius: 0 0 4px 0;

				position: relative;

				i {
					border-width: .3em .3em 0;
					border-color: $borderColor transparent transparent;
					border-style: solid;
					margin: -0.1em 0 0 -0.3em;
				}

				&:hover i {
					border-color: $focusBorderColor transparent transparent;
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
		margin-left: -5px;

		.matrix-input {
			display: inline-grid;
			grid-template-columns: repeat(2, 1fr);
			grid-template-rows: repeat(2, 1fr);
			gap: 2px;
			width: 100px;
			height: 80px;
		
			input {
				background: none;
				color: inherit;
				border: 1px dashed $borderColor;
				padding: 2px;
				text-align: center;
			}
		
			input:focus {
				border-color: $focusBorderColor;
			}
		}
	}
</style>