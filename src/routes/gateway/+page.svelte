<script lang="ts">
	//import { onMount } from 'svelte';
	//严重怀疑这个库问题导至刷新出错！！或者跟网络也有关系！一开始暂不导入
	//import { ANT } from '@ar.io/sdk/web';
	//let data;
	//let gateways;
	// onMount(async () => {
	// 	//获取当前网关域名
	// 	(async () => {
	// 		try {
	// 			const module = await import('@ar.io/sdk');
	// 			const IO = module.IO;
	//             const io=IO.init();
	// 			gateways = await io.getGateways();
	//             console.log(gateways);
	// 		} catch (error) {
	// 			console.error('导入IO失败:', error);
	// 		}
	// 	})();
	// });

	async function getAll() {
		try {
			const module = await import('@ar.io/sdk');
			const IO = module.IO;
			const io = IO.init();
		   let g=	await io.getGateways();
           console.log(g);
            //return io.getGateways();
			//console.log(gateways);
		} catch (error) {
			console.error('导入IO失败:', error);
		}
	}

	let promise = $state(getAll());
</script>

<img
	src="https://arweave.net/8MfM94Fd7MRBeQ9-265gGL-EgqMXE6OINSZx5bAu780"
	class="avatar"
	srcset="https://arweave.net/8MfM94Fd7MRBeQ9-265gGL-EgqMXE6OINSZx5bAu780 2x"
	alt="Gateways"
/>

<!-- Title -->
<div>
	<h1>Gateways</h1>
</div>
<!--Description-->
<p>many</p>
{#await promise}
	<p>waiting</p>
{:then gateways}
	{#each gateways.items as gateway, index}
		<a class="button button-default" href={gateway.url} target="_blank" rel="noopener" role="button"
			><img
				class="icon"
				aria-hidden="true"
				src={gateway.icon}
				alt={gateway.text}
			/>{gateway.text}</a
		>
	{/each}
{:catch error}
	<p>{error}</p>
{/await}
