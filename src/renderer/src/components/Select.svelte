<script lang="ts">
  export let options: { value: string; label: string }[]
  export let value: string
  export let onChange: (e: Event) => void
</script>

<select bind:value on:change={onChange}>
  {#each options as { value, label }}
    <option {value}>{label}</option>
  {/each}
</select>
