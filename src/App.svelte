<script lang='ts'>
	import { isPrime } from './algebra/utils/int'
	import TreeCanvas from './Tree/TreeCanvas.svelte'
	import NumberInput, { ChangeEvent } from './UI/NumberInput.svelte'

	let p: number = 2

	let depth = 7
	let depthInputValue: string

	let depthState: [number, number] = [depth, p]

	function validateP(p: number) {
		return isPrime(p)
	}

	function onDepthChange(event: ChangeEvent) {
		depthState = [event.detail.state, p]
	}

	$: depth = Math.max(2, Math.min(depthState[0], Math.floor(depthState[0] * (depthState[1]+1) / (p+1))))
	$: depthInputValue = depth.toString()
</script>

<main>
	<div class='container'>
		<div class='tree-container'>
			<TreeCanvas width={800} height={800} p={p} depth={depth} />
		</div>
		<div class='sidebar'>
			<div class='sidebar-row'>p<NumberInput min={2} max={11} init={p} valid={validateP} bind:state={p}/></div>
			<div class='sidebar-row'>Depth<NumberInput min={1} max={10} init={depth} bind:value={depthInputValue} on:change={onDepthChange}/></div>
			<hr />
			<div class='sidebar-row'>
				<input type='checkbox' />End<input type='text' />
			</div>
			<div class='sidebar-row'>
				<input type='checkbox' />Show end at infinity
			</div>
			<div class='sidebar-row'>
				<input type='checkbox' />Isometry
			</div>
			<div class='sidebar-row'>
				<input type='checkbox' />Show image of origin
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

	input[type='text'] {
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
</style>