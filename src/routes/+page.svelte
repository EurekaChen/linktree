<script lang="ts">
	//import {data} from '$lib/store/data'
	import { onMount } from 'svelte';

	const iconRoot ='https://dl.eeurl.com/svg/icon/brand/'  // 'https://linktree.ar.io/images/icons/';
	let data = {
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
				'icon': iconRoot + 'github.svg',
				text: 'GitHub'
			},
			{
				class: 'pinterest',
				url: 'https://www.pinterest.com/eureka2093',
				'icon': iconRoot + 'pinterest.svg',
				text: 'Pinterest'
			},
			{
				class: 'discord',
				url: 'https://discord.com',
				'icon': iconRoot + 'discord.svg',
				text: 'Discord'
			},
			{
				class: 'linked',
				url: 'https://linkedin.com',
				'icon': iconRoot + 'linkedin.svg',
				text: 'LinkedIn'
			}
		]
	};

	onMount(() => {
		const storageData = localStorage.getItem('data');
		if (storageData) {
			data = JSON.parse(storageData);
		}
	});
</script>

<!-- Your Image Here -->
<img
	src="https://arweave.net/8MfM94Fd7MRBeQ9-265gGL-EgqMXE6OINSZx5bAu780"
	class="avatar"
	srcset="https://arweave.net/8MfM94Fd7MRBeQ9-265gGL-EgqMXE6OINSZx5bAu780 2x"
	alt="linktree AR"
/>
<span title="edit" style="font-size:1em;vertical-align:30px;">🖉</span>
<span title="edit" style="font-size:1em;vertical-align:30px;">✓</span>

<!-- Title -->
<h1 class="editable" contenteditable="false">
	{data.title} <span title="edit" style="font-size:0.4em;vertical-align: middle;">🖉</span>
	<span title="edit" style="font-size:0.4em;vertical-align: middle;">✓</span>
</h1>

<p>
	{data.description} <span title="edit" style="font-size:1em">🖉</span><span title="edit" style="font-size:1em;vertical-align: middle;">✓</span>
</p>

{#each data.links as link }
<a
	class="button button-{link.class}"
	href={link.url}
	target="_blank"
	rel="noopener"
	role="button"
	><img
		class="icon"
		aria-hidden="true"
		src={link.icon}
		alt={link.text}
	/>{link.text}</a> <sup title="delete">✖</sup>
	
{/each}

<!-- Generic Website -->
<a
	class="button button-default"
	href="https://linktree.ar.io"
	target="_blank"
	rel="noopener"
	role="button"
	><img
		class="icon"
		aria-hidden="true"
		src="images/icons/generic-website.svg"
		alt="Website Icon"
	/>Visit Website</a
> <sup title="delete">✖</sup>


<a
	class="button button-github"
	href="https://github.com/eurekachen"
	target="_blank"
	rel="noopener"
	role="button"
	><img class="icon" aria-hidden="true" src="images/icons/github.svg" alt="GitHub Logo" />GitHub</a
><br />

<!-- GitLab -->
<a class="button button-gitlab" href="#" target="_blank" rel="noopener" role="button"
	><img class="icon" aria-hidden="true" src="images/icons/gitlab.svg" alt="GitLab Logo" />GitLab</a
><br />

<!-- Instagram -->
<a class="button button-instagram" href="#" target="_blank" rel="noopener" role="button"
	><img
		class="icon"
		aria-hidden="true"
		src="images/icons/instagram.svg"
		alt="Instagram Logo"
	/>Instagram</a
><br />

<!-- LinkedIn -->
<a class="button button-linked" href="#" target="_blank" rel="noopener" role="button"
	><img
		class="icon"
		aria-hidden="true"
		src="images/icons/linkedin.svg"
		alt="LinkedIn Logo"
	/>LinkedIn</a
><br />

<!-- Mastodon -->
<a class="button button-mastodon" href="#" target="_blank" rel="noopener" role="button"
	><img
		class="icon"
		aria-hidden="true"
		src="images/icons/mastodon.svg"
		alt="Mastodon Logo"
	/>Mastodon</a
><br />

<!-- Medium -->
<a class="button button-medium" href="#" target="_blank" rel="noopener" role="button"
	><img class="icon" aria-hidden="true" src="images/icons/medium.svg" alt="Medium Logo" />Medium</a
><br />

<!-- Pinterest -->
<a class="button button-pinterest" href="#" target="_blank" rel="noopener" role="button"
	><img
		class="icon"
		aria-hidden="true"
		src="images/icons/pinterest.svg"
		alt="Pinterest Logo"
	/>Pinterest</a
><br />

<!-- Telegram -->
<a class="button button-telegram" href="#" target="_blank" rel="noopener" role="button"
	><img
		class="icon"
		aria-hidden="true"
		src="images/icons/telegram.svg"
		alt="Telegram Logo"
	/>Telegram</a
><br />

<!-- X -->
<a class="button button-x" href="#" target="_blank" rel="noopener" role="button"
	><img class="icon" aria-hidden="true" src="images/icons/x.svg" alt="X Logo" />Follow on X</a
><br />

<!-- YouTube -->
<a class="button button-yt" href="#" target="_blank" rel="noopener" role="button"
	><img
		class="icon"
		aria-hidden="true"
		src="images/icons/youtube.svg"
		alt="YouTube Logo"
	/>YouTube</a
><br />

<br />

<p>+ Add Brand Link + Add Custom Link</p>
<form>
	<label for="class">Class:</label>
	<select id="class">
		<option value="default">Default</option>
		<option value="github"></option>
		<option value="gitlab">GitLab</option>
		<option value="instagram">Instagram</option>
		<option value="linkedin">LinkedIn</option>
		<option value="mastodon">Mastodon</option>
		<option value="medium">Medium</option>
		<option value="pinterest">Pinterest</option>
		<option value="telegram">Telegram</option>
		<option value="x">X</option>
	</select>

	<label for="href">Href:</label>
	<input id="href" type="text" placeholder="Enter URL" />

	<button type="submit">Add Brand Link</button>
</form>

<form>
	<label for="class">Style</label>
	<input id="href" type="text" placeholder="Enter URL" />

	<label for="class">Icon</label>
	<input id="href" type="text" placeholder="Enter URL" />

	<label for="class">Link Text</label>
	<input id="href" type="text" placeholder="Enter URL" />

	<label for="href">Link Url</label>
	<input id="href" type="text" placeholder="Enter URL" />

	<button type="submit">Add Custom Link</button>
</form>
<!--
        Footer:
        This includes a link to privacy.html page which can be setup for your Privacy Policy.
        This also includes a link to the LittleLink repository to make forking LittleLink easier.
        You can edit or remove anything here to make your own footer.
                                            -->
<p>
	Publish this page to <a href="https://arweave.net" target="_blank" rel="noopener" role="button"
		>demo_linktree.ar.io</a
	>.
</p>

<style>
	.hidden {
		display: none;
	}
</style>
