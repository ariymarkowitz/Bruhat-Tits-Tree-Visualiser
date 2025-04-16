<script lang="ts">
  import katex from "katex"
  let {text}: {text: string} = $props()

  let element: HTMLElement
  $effect(() => {
    if (element) katex.render(text, element)
  })
</script>
<span class='latex' bind:this={element}></span>