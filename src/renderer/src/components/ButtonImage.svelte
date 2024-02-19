<script lang="ts">
    export let onClick: (e: Event) => void
    export let src: string
    export let alt: string
    export let text: string
</script>


<button class="btn" on:click={onClick}>
    <img {src} {alt} />
    {text}
</button>
