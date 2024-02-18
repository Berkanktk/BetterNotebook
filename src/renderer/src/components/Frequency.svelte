<script lang="ts">
    export let frequencyData: { [key: string]: number } = {};
    function hasData(frequencyData: { [key: string]: number }): boolean {
        return Object.keys(frequencyData).length > 0;
    }
</script>

<div class="frequency-view">
    <h1 class="title">Frequency</h1>
    {#if hasData(frequencyData)}
        <div class="overflow-auto">
            <table class="table">
                <thead>
                    <tr>
                        <th>Frequency</th>
                        <th>Occurance</th>
                    </tr>
                </thead>
                <tbody>
                    {#each Object.entries(frequencyData) as [word, count]}
                        <tr class="hover">
                            <td>{word}</td>
                            <td>{count}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {:else}
        <div class="error">No data to display</div>
    {/if}
</div>

<style>
    .frequency-view {
        padding: 1rem;
        width: 25%;
        height: auto;
        overflow: auto;
    }

    .title {
        font-weight: 700;
        text-align: center;
    }

    .overflow-auto {
        overflow: auto;
        height: auto;
    }

    .table {
        width: 100%;
        border-collapse: collapse;
    }

    thead {
        position: relative;
    }

    th {
        text-align: left;
        padding: 0.5rem;
        font-weight: 700;
    }

    tr {
        border-bottom: 1px solid #8080807c;
    }

    .hover:hover {
        background-color: #4747477c;
    }

    .error {
        text-align: center;
        color: #808080;
    }
</style>