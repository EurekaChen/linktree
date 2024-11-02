import { writable } from 'svelte/store';

const iconRoot = 'https://linktree.ar.io/images/icons/';

const initialData = {
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
			'icon-src': iconRoot + 'github.svg',
			text: 'GitHub'
		},
		{
			class: 'pinterest',
			url: 'https://www.pinterest.com/eureka2093',
			'icon-src': iconRoot + 'pinterest.svg',
			text: 'Pinterest'
		},
		{
			class: 'Discord',
			url: 'https://discord.com',
			'icon-src': iconRoot + 'discord.svg',
			text: 'Discord'
		},
		{
			class: 'linked',
			url: 'https://linkedin.com',
			'icon-src': iconRoot + 'linkedin.svg',
			text: 'LinkedIn'
		}
	]
};

function getData() {
    //initialData.t
    const storageData=localStorage.getItem("data");
    const data=storageData?storageData:initialData;   
    return  writable(data);
	
}

export const data = getData();
