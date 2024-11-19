<script>
    import { log } from "$lib/store/Debug";
    import { onMount } from "svelte";

    let gateways = $state([]); // 移除 $state，使用普通声明

    async function fetchGateways() {
        try {
            log("获取网关");
            const module = await import("@ar.io/sdk/web");
            const IO = module.IO;
            const io = IO.init();
            const result = await io.getGateways({
                limit: 500,
                sortOrder: "asc",
                sortBy: "settings.fqdn"
            });
            gateways = result.items; // 直接赋值更新
            log(gateways);
        } catch (error) {
            console.error("导入IO失败:", error);
        }
    }

	onMount(() => {
		fetchGateways();
	});


    // 组件加载时获取数据
    //fetchGateways();
</script>

<img
    src="https://arweave.net/8MfM94Fd7MRBeQ9-265gGL-EgqMXE6OINSZx5bAu780"
    class="avatar"
    srcset="https://arweave.net/8MfM94Fd7MRBeQ9-265gGL-EgqMXE6OINSZx5bAu780 2x"
    alt="Gateways" />

<div>
    <h1>linktree.ar.io</h1>
</div>

{#if gateways.length > 0}
    <table>
        <thead>
            <tr>
                <th>标签</th>
				<th>抵押</th>
                <th>域名</th>
                <th>状态</th>
                <th>protocol</th>
            </tr>
        </thead>
        <tbody>
            {#each gateways as gateway}
                <tr>
                    <td>{gateway.settings.label}</td>
					<td>{gateway.operatorStake/100000000}</td>
                    <td>{gateway.settings?.fqdn || "未设置"}</td>
                    <td>{gateway.status}</td>
                    <td>{gateway.settings.protocol}</td>
                </tr>
            {/each}
        </tbody>
    </table>
{:else}
    <h2>正在加载网关数据...</h2>
{/if}

<style>
    table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
    }

    th,
    td {
        padding: 8px;
        text-align: left;
        border: 1px solid #ddd;
    }

    th {
        background-color: #f2f2f2;
    }

    tr:nth-child(even) {
        background-color: #f9f9f9;
    }
</style>
