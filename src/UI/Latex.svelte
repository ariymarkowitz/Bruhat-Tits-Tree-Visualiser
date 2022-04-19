<script lang="ts">
  import katex from "katex"
  export let text: string

  let element: HTMLElement
  $: if (element) katex.render(text, element)
</script>
<span class='latex' bind:this={element}></span>