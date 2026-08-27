<script lang="ts">
  import katex from "katex"
  let {text, displayStyle = false}: {text: string, displayStyle?: boolean} = $props()

  let element: HTMLElement
  $effect(() => {
    const rendered = displayStyle ? `\\displaystyle ${text}` : text
    katex.render(rendered, element)
  })
</script>
<span class='latex' bind:this={element}></span>
