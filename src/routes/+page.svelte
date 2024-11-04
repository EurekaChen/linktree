<script lang="ts">
	import preset from './preset.json';
	import { onMount } from 'svelte';
	//严重怀疑这个库问题导至刷新出错！！或者跟网络也有关系！
	//import { ANT } from '@ar.io/sdk/web';

	import { upload } from '$lib/upload';
	import { getGatewayDomainName } from '$lib/getGatewayDomainName';
	let isLogoEditing = $state(false);
	let isLinkAdding = $state(false);

	let uploadEnabled = $state(false);

	let underName = $state('demo'); //onmount中改变
	let linktreeId = $state('');
	let nameAvailable = $state(false);

	let showAvialableCheck = $state(false);
	let showAlphabetOnly = $state(false);
	let isChecking = $state(false);
	let underNameChanged = $state(false);

	let defaultGatewayDomainName = 'ar.io';

	let defaultRoot = 'https://linktree' + defaultGatewayDomainName;

	//let defaultIconRoot= defaultRoot+'/img/icon/';
	let defaultIconRoot = 'https://dl.eeurl.com/svg/icon/brand/';

	let deaultData = {
		underName: 'main',
		title: 'AR Link Tree',
		logo: 'https://arweave.net/8MfM94Fd7MRBeQ9-265gGL-EgqMXE6OINSZx5bAu780',
		description:
			'You can directly edit this page and permanently publish it to Arweave, then accessing your linktree page through the ArNS',
		links: [
			{
				class: 'default',
				url: defaultRoot,
				icon: defaultIconRoot + 'generic-website.svg',
				text: 'Visit Website'
			},
			{
				class: 'github',
				url: 'https://github.com/eurekachen',
				icon: defaultIconRoot + 'github.svg',
				text: 'GitHub'
			},
			{
				class: 'pinterest',
				url: 'https://www.pinterest.com/eureka2093',
				icon: defaultIconRoot + 'pinterest.svg',
				text: 'Pinterest'
			},
			{
				class: 'discord',
				url: 'https://discord.com',
				icon: defaultIconRoot + 'discord.svg',
				text: 'Discord'
			},
			{
				class: 'linked',
				url: 'https://linkedin.com',
				icon: defaultIconRoot + 'linkedin.svg',
				text: 'LinkedIn'
			}
		]
	};

	let gatewayDomainName = $state(defaultGatewayDomainName);
	let data = $state(deaultData);
	let iconRoot = $state(defaultIconRoot);
	onMount(async () => {
		//获取当前网关域名		
		gatewayDomainName = getGatewayDomainName();

		const storageData = localStorage.getItem('data');
		console.log('获取到本地内存缓存数据', storageData);
		if (storageData) {
			data = JSON.parse(storageData);
			underName = data.underName;
		}

		let getlinktreeId = localStorage.getItem('linktreeId');
		if (getlinktreeId) {
			linktreeId = getlinktreeId;
		}
		// 获取linktree记录信息
		//const io = IO.init();
		//const record = await io.getArNSRecord({ name: 'linktree' });
		//12345678:vDeH1apk0WMyMFCBH1W76D2-8tZG2hstwFNZJqYZUGA
		//linktree:gJKH_MlxgDI3j912HdppmuJnqzsSvo3nRuvb5PVPxOk

		// import('@ar.io/sdk/web').then(module => {
		//     const ANT = module.ANT;
		//     // 使用 ANT
		// }).catch(error => {
		//     console.error('导入失败:', error);
		// });

		// const { ANT } = await import('@ar.io/sdk/web');
		// const ant = ANT.init({ processId: 'gJKH_MlxgDI3j912HdppmuJnqzsSvo3nRuvb5PVPxOk' });
		// const records = await ant.getRecords();
		// if (underName in records) {
		// 	nameAvailable = false;
		// }
	});

	let selectedPreset = $state(preset[0]);
	let addLinkClass = $state(preset[0].buttonClass);
	let addLinkIcon = $state(defaultIconRoot + preset[0].icon);
	let addLinkText = $state(preset[0].text);
	let addLinkUrl = $state(defaultRoot);

	function save() {
		localStorage.setItem('data', JSON.stringify(data));
		uploadEnabled = true;
		console.log('saved:' + localStorage.getItem('data'));
	}

	function deleteLink(index: number) {
		data.links.splice(index, 1);

		localStorage.setItem('data', JSON.stringify(data));
		uploadEnabled = true;
	}

	function onSelectChange() {
		addLinkClass = selectedPreset.buttonClass;
		addLinkIcon = iconRoot + selectedPreset.icon;
		addLinkText = selectedPreset.text;
	}

	function addLink() {
		let item = { class: addLinkClass, icon: addLinkIcon, text: addLinkText, url: addLinkUrl };
		data.links.push(item);
		localStorage.setItem('data', JSON.stringify(data));
		uploadEnabled = true;
	}

	function onUnderNameChanged() {
		underNameChanged = true;
		isChecking = false;
		showAvialableCheck = false;
		showAlphabetOnly = false;
	}

	async function checkName() {
		isChecking = true;
		const regex = /^[a-z0-9-]+$/; // 允许字母和连字符
		let valid = regex.test(underName);
		if (valid) {
			//检查是否可用
			showAvialableCheck = false;
			const { ANT } = await import('@ar.io/sdk/web');
			const ant = ANT.init({ processId: 'gJKH_MlxgDI3j912HdppmuJnqzsSvo3nRuvb5PVPxOk' });
			const records = await ant.getRecords();
			if (underName in records) {
				nameAvailable = false;
			} else {
				nameAvailable = true;
			}
			showAvialableCheck = true;
		} else {
			showAlphabetOnly = true;
		}
		isChecking = false;
		underNameChanged = false;
	}

	//let publishResult = $state(publish());
	async function publishIt() {
		//publishResult = publish();
		//getHtml();
	}
</script>

<!-- Your Image Here -->
<img
	src="https://arweave.net/8MfM94Fd7MRBeQ9-265gGL-EgqMXE6OINSZx5bAu780"
	class="avatar"
	srcset="https://arweave.net/8MfM94Fd7MRBeQ9-265gGL-EgqMXE6OINSZx5bAu780 2x"
	alt="linktree AR"
/>

<span
	title="editlogo"
	role="button"
	tabindex="0"
	style="font-size:1em;vertical-align:30px;width:30px;heigt:30px"
	aria-label="edit logo url"
	class:hidden={isLogoEditing}
	onkeydown={() => {
		isLogoEditing = true;
	}}
	onclick={() => {
		isLogoEditing = true;
	}}>🖉</span
>
<div style="font-size: 14px;" class:hidden={!isLogoEditing}>
	<label for="class">Enter Logo Url</label>
	<input
		id="href"
		style="width:350px"
		type="text"
		placeholder="Enter Logo URL"
		title="you can upload your logo to arweave"
		bind:value={data.logo}
	/>
	<span
		title="confirm"
		role="button"
		tabindex="0"
		style="font-size:1em;color:green;font-weight:bolder"
		aria-label="confirm logo url"
		class:hidden={!isLogoEditing}
		onkeydown={() => {
			isLogoEditing = false;
		}}
		onclick={() => {
			isLogoEditing = false;
		}}>✓</span
	>
</div>

<!-- Title -->
<div>
	<h1
		style="display: inline;"
		contenteditable="true"
		bind:textContent={data.title}
		onblur={save}
	></h1>
</div>
<!--Description-->
<p contenteditable="true" bind:innerHTML={data.description} onblur={save}></p>

{#each data.links as link, index}
	<a class="button button-{link.class}" href={link.url} target="_blank" rel="noopener" role="button"
		><img class="icon" aria-hidden="true" src={link.icon} alt={link.text} />{link.text}</a
	> <sup title="delete" style="color:red" onclick={() => deleteLink(index)}>✖</sup>
{/each}

<hr />
<button
	class:hidden={isLinkAdding}
	onclick={() => {
		isLinkAdding = true;
	}}>+ Add Custom Link</button
>
<br />

<div
	style="border:1px solid gray;padding:8px; background-color:#e3f2fd;border-radius:4px"
	class:hidden={!isLinkAdding}
>
	<div style="text-align: right;">
		<span
			onclick={() => {
				isLinkAdding = false;
			}}
		>
			✖close</span
		>
	</div>
	<br />
	<div>
		<label for="class">Preset</label>
		<select id="class" class="form-control" bind:value={selectedPreset} onchange={onSelectChange}>
			{#each preset as item}
				<option value={item}>
					{item.name}
				</option>
			{/each}
		</select>
	</div>

	<div>
		<label for="custom_icon">Icon</label>
		<input
			class="form-control"
			type="text"
			placeholder="Enter Your Icon URL OR Keep Default"
			value={addLinkIcon}
		/>
	</div>
	<div>
		<label for="custom_text">Text</label>
		<input
			class="form-control"
			type="text"
			placeholder="Enter Your Link Text Or Keep Default"
			value={addLinkText}
		/>
	</div>
	<div>
		<label for="custom_text">Link</label>
		<input class="form-control" type="text" placeholder="Enter Your Link URL" value={addLinkUrl} />
	</div>

	<a
		class="button button-{addLinkClass}"
		href={addLinkUrl}
		target="_blank"
		rel="noopener"
		role="button"><img class="icon" aria-hidden="true" src={addLinkIcon} alt="" />{addLinkText}</a
	>
	<br />
	<button type="submit" onclick={addLink}>Add Link</button>
	<br />
</div>
<hr />
<button title="Modify this page to active this button" onclick={upload}
	>Upload this linktree page to Arweave</button
>
<div>Link Tree ID:{linktreeId}</div>
<div>
	<p>Upload your linktree to Arweave...</p>
	<p>you linktree upload sucessful, ID：</p>
	<p>sign undername for you, this will take time, waiting</p>
	<!-- {#await publishResult}
		<p>...rolling</p>
	{:then result}
		<p>get Result: {result}!</p>
	{:catch error}
		<p style="color: red">{error.message}</p>
	{/await} -->
</div>

<hr />
<div>
	<div>
		<label for="custom_text">UnderName</label>
		<input
			type="text"
			style="width: 100px;"
			id="custom_text"
			placeholder="Enter you undername"
			bind:value={underName}
			onkeydown={onUnderNameChanged}
		/>
		<button onclick={checkName}>Valid Check</button>
		<span class:hidden={!isChecking}>🛑checking</span>
		<span class:hidden={!showAvialableCheck}>
			<span class:hidden={!nameAvailable}>✔available</span>
			<span class:hidden={nameAvailable}>✖taken</span>
		</span>
		<span class:hidden={!showAlphabetOnly}>🔤invalid character</span>
	</div>

	<div class:hidden={underNameChanged || showAlphabetOnly}>
		<div class:hidden={nameAvailable}>
			<strong>{underName} is ready!</strong> vist {underName}_{gatewayDomainName} or
			<a href="...">more domain names</a>
		</div>
		<button class:hidden={!nameAvailable} disabled={!nameAvailable}
			>Publish this page to {underName}_{gatewayDomainName}</button
		>
	</div>
</div>
<hr />

<style>
	.hidden {
		display: none;
	}
	.form-control {
		width: 350px;
	}
</style>
