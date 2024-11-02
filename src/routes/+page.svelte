<script lang="ts">
	import preset from './preset.json';

	import { onMount } from 'svelte';

	let isLogoEditing = $state(false);
	let isLinkEditing = $state(false);

	let underName = $state('demo');

	const iconRoot = 'https://dl.eeurl.com/svg/icon/brand/'; // 'https://linktree.ar.io/images/icons/';
	let data = $state({
		underName: 'main',
		title: 'Link Tree AR',
		logo: 'https://arweave.net/8MfM94Fd7MRBeQ9-265gGL-EgqMXE6OINSZx5bAu780',
		description:
			'You can directly edit this page and permanently publish it to Arweave, then accessing your linktree page through the ArNS',
		links: [
			{
				class: 'default',
				url: 'https://linktree.ar.io',
				icon: iconRoot + 'generic-website.svg',
				text: 'Visit Website'
			},
			{
				class: 'github',
				url: 'https://github.com/eurekachen',
				icon: iconRoot + 'github.svg',
				text: 'GitHub'
			},
			{
				class: 'pinterest',
				url: 'https://www.pinterest.com/eureka2093',
				icon: iconRoot + 'pinterest.svg',
				text: 'Pinterest'
			},
			{
				class: 'discord',
				url: 'https://discord.com',
				icon: iconRoot + 'discord.svg',
				text: 'Discord'
			},
			{
				class: 'linked',
				url: 'https://linkedin.com',
				icon: iconRoot + 'linkedin.svg',
				text: 'LinkedIn'
			}
		]
	});

	onMount(async () => {
		const storageData = localStorage.getItem('data');
		console.log(storageData);
		if (storageData) {
			data = JSON.parse(storageData);
		}
		//const response = await fetch('preset.json'); // 替换为您的JSON文件路径
		//preset = await response.json();
		//console.log(preset);
	});

	let selectedPreset = $state(preset[0]);
	let addLinkClass = $state(preset[0].buttonClass);
	let addLinkIcon = $state(iconRoot + preset[0].icon);
	let addLinkText = $state(preset[0].text);
	let addLinkUrl = $state('https://'+underName+'_linktree.ar.io');

	function save() {
		localStorage.setItem('data', JSON.stringify(data));
		console.log('saveed:' + localStorage.getItem('data'));
	}

	function deleteLink(index: number) {
		data.links.splice(index, 1);
	}

	function onchange() {
		addLinkClass = selectedPreset.buttonClass;
		addLinkIcon = iconRoot+ selectedPreset.icon;
		addLinkText = selectedPreset.text;
	}

	function addLink() {
		let item = { class: addLinkClass, icon: addLinkIcon, text: addLinkText, url: addLinkUrl };
		data.links.push(item);
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
	class:hidden={isLinkEditing}
	onclick={() => {
		isLinkEditing = true;
	}}>+ Add Custom Link</button
>
<br />

<div
	style="border:1px solid gray;padding:8px; background-color:#e3f2fd;border-radius:4px"
	class:hidden={!isLinkEditing}
>
	<div style="text-align: right;">
		<span
			onclick={() => {
				isLinkEditing = false;
			}}
		>
			✖close</span
		>
	</div>
	<br />
	<div>
		<label for="class">Preset</label>
		<select id="class" class="form-control" bind:value={selectedPreset} onchange={onchange}>
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

	<a class="button button-{addLinkClass}" href={addLinkUrl} target="_blank" rel="noopener" role="button"
		><img class="icon" aria-hidden="true" src="{addLinkIcon}" alt="" />{addLinkText}</a
	>
	<br />
	<button type="submit" onclick={addLink}>Add Link</button>
	<br />
</div>

<hr />
<div>
	<div>
		<label for="custom_text">UnderName</label>
		<input type="text" id="custom_text" placeholder="Enter you undername" bind:value={underName} />
		<span title="check availabilty">✅check availabilty</span>
	</div>
	<button>Publish this page to {underName}_linktree.ar.io</button>
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
