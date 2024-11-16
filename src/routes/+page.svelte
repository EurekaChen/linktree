<script lang="ts">
	import preset from './preset.json';
	import { onMount } from 'svelte';
	//严重怀疑这个库问题导至刷新出错！！或者跟网络也有关系！一开始暂不导入
	//import { ANT } from '@ar.io/sdk/web';

	import { upload } from '$lib/upload';
	import { getGatewayDomainName } from '$lib/getGatewayDomainName';
	import { createDataItemSigner, dryrun, message, result } from '@permaweb/aoconnect';

	let walletConnected = $state(false);

	let isLogoEditing = $state(false);
	let isLinkAdding = $state(false);

	let isUploading = $state(false);
	let showLinktreeId = $state(false);
	let uploadFailed = $state(false);

	let uploadEnabled = $state(false);

	let isPublishUndername = $state(false);

	let undername = $state('demo'); //onmount中改变
	let linktreeId = $state('4zxHDSCFspfjijZy3XY6QMr28LKEgqICwv7iw-zzR3Y'); //demo
	let nameAvailable = $state(false);
	let antWarning = $state(true);

	let showAvialableCheck = $state(false);
	let showAlphabetOnly = $state(false);
	let isChecking = $state(false);
	let underNameChanged = $state(false);

	let showPublish = $state(false);
	let isAoSending = $state(false);
	let showSuccess = $state(false);
	let showFail = $state(false);

	let defaultGatewayDomainName = 'ar.io';

	let defaultRoot = 'https://linktree.' + defaultGatewayDomainName;

	let defaultIconRoot = defaultRoot + '/img/icon/';
	//let defaultIconRoot = 'https://dl.eeurl.com/svg/icon/brand/';

	//默认数据，没有保存时使用
	let deaultData = {
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

		//获取之前保存的数据
		const storageData = localStorage.getItem('data');
		console.log('获取到本地内存缓存数据', storageData);
		if (storageData) {
			data = JSON.parse(storageData);
		}

		//获取之前设置的undername
		const storageUndername = localStorage.getItem('undername');
		if (storageUndername) {
			undername = storageUndername;
		}

		let getlinktreeId = localStorage.getItem('linktreeId');
		if (getlinktreeId) {
			linktreeId = getlinktreeId;
			showLinktreeId = true;
		}

		console.log(document.styleSheets);

		// 获取linktree记录信息
		//const io = IO.init();
		//const record = await io.getArNSRecord({ name: 'linktree' });
		//12345678:vDeH1apk0WMyMFCBH1W76D2-8tZG2hstwFNZJqYZUGA
		//linktree:gJKH_MlxgDI3j912HdppmuJnqzsSvo3nRuvb5PVPxOk

		(async () => {
			try {
				const module = await import('@ar.io/sdk/web');
				const ANT = module.ANT;
				const ant = ANT.init({ processId: 'gJKH_MlxgDI3j912HdppmuJnqzsSvo3nRuvb5PVPxOk' });
				const records = await ant.getRecords();
				if (undername in records) {
					nameAvailable = false;
				} else {
					nameAvailable = true;
				}
				antWarning = false;
			} catch (error) {
				console.error('导入失败ANT:', error);
				antWarning = true;
			}
		})();
	});

	let selectedPreset = $state(preset[0]);
	let addLinkClass = $state(preset[0].buttonClass);
	let addLinkIcon = $state(defaultIconRoot + preset[0].icon);
	let addLinkText = $state(preset[0].text);
	let addLinkUrl = $state(defaultRoot);

	function save() {
		localStorage.setItem('data', JSON.stringify(data));
		showLinktreeId = false;
		uploadEnabled = true;
		console.log('saved:' + localStorage.getItem('data'));
	}

	function deleteLink(index: number) {
		data.links.splice(index, 1);
		save();
	}

	function onSelectChange() {
		addLinkClass = selectedPreset.buttonClass;
		addLinkIcon = iconRoot + selectedPreset.icon;
		addLinkText = selectedPreset.text;
	}

	function addLink() {
		let item = { class: addLinkClass, icon: addLinkIcon, text: addLinkText, url: addLinkUrl };
		data.links.push(item);
		save();
	}

	function onUnderNameChanged() {
		underNameChanged = true;
		isChecking = false;
		showAvialableCheck = false;
		showAlphabetOnly = false;
		nameAvailable = true;
	}

	async function checkName() {
		isChecking = true;
		showSuccess = false;
		showFail = false;
		const regex = /^[a-z0-9-]+$/; // 允许字母和连字符
		let valid = regex.test(undername);
		if (valid) {
			//检查是否可用
			showAvialableCheck = false;
			const { ANT } = await import('@ar.io/sdk/web');
			const ant = ANT.init({ processId: 'gJKH_MlxgDI3j912HdppmuJnqzsSvo3nRuvb5PVPxOk' });
			const records = await ant.getRecords();
			if (undername in records) {
				nameAvailable = false;
			} else {
				nameAvailable = true;
				localStorage.setItem('undername', undername);
			}
			showAvialableCheck = true;
		} else {
			showAlphabetOnly = true;
		}
		isChecking = false;
		underNameChanged = false;
	}

	async function turboUpload() {
		isUploading = true;
		showLinktreeId = false;
		linktreeId = await upload();
		if (linktreeId == 'failed') {
			isUploading = false;
			uploadFailed = true;
			showLinktreeId = false;
		} else {
			isUploading = false;
			showLinktreeId = true;
			localStorage.setItem('linktreeId', linktreeId);
		}
	}

	let activeAddress;
	async function connectWallet() {
		try {
			await window.arweaveWallet.connect([
				'ACCESS_ADDRESS',
				'ACCESS_PUBLIC_KEY',
				'SIGN_TRANSACTION'
			]);
			walletConnected = true;
			activeAddress = await window.arweaveWallet.getActiveAddress();
			//connected(activeAddress);
			//获取已经有的undername
			let getPlayerMsg = await dryrun({
				process: 'GhMUqZB7qFf9iJ5myIsJJkeFH8CN9QeOQjJoLvhHV5E',
				tags: [{ name: 'Action', value: 'GetUser' }],
				data: activeAddress
			});

			//是否查询到玩家信息
			if (getPlayerMsg.Messages.length > 0) {
				//
				//return JSON.parse(getPlayerMsg.Messages[0].Data);

			} else {
				//return null;
			}
		} catch (error) {
			console.log('Connect error:', error);
			walletConnected = false;
		}
	}

	async function disconnectWallet() {
		try {
			// 请求断开 ArConnect 钱包
			await window.arweaveWallet.disconnect();
			walletConnected = false;
		} catch (error) {
			console.error('Failed to disconnect from ArConnect wallet', error);
		}
	}

	async function publish() {
		//发到AO进行发布

		showPublish = true;
		isAoSending = true;
		const undernameProcessId = 'GhMUqZB7qFf9iJ5myIsJJkeFH8CN9QeOQjJoLvhHV5E';
		const msgId = await message({
			process: undernameProcessId,
			tags: [
				{ name: 'Action', value: 'Add' },
				{ name: 'Undername', value: undername },
				{ name: 'Target', value: linktreeId }
			],
			signer: createDataItemSigner(window.arweaveWallet),
			data: 'linktree'
		});
		console.log('toAoMsgId:', msgId);

		const readResult = await result({ message: msgId, process: undernameProcessId });
		let reply = readResult.Messages[0].Data;
		isAoSending = false;
		if (reply == 'success') {
			showSuccess = true;
			showFail = false;
		} else {
			showFail = true;
			showSuccess = false;
		}
	}
</script>

<img src={data.logo} class="avatar" srcset="{data.logo} 2x" alt={data.title} />

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
<p contenteditable="true" bind:textContent={data.description} onblur={save}></p>

{#each data.links as link, index}
	<a class="button button-{link.class}" href={link.url} target="_blank" rel="noopener" role="button"
		><img class="icon" aria-hidden="true" src={link.icon} alt={link.text} />{link.text}</a
	>
	<span
		title="delete"
		role="button"
		tabindex="0"
		onkeydown={() => deleteLink(index)}
		style="color:red;vertical-align:super"
		onclick={() => deleteLink(index)}>✖</span
	>
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
			role="button"
			tabindex="0"
			onkeydown={() => {
				isLinkAdding = false;
			}}
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
			bind:value={addLinkIcon}
		/>
	</div>
	<div>
		<label for="custom_text">Text</label>
		<input
			class="form-control"
			type="text"
			placeholder="Enter Your Link Text Or Keep Default"
			bind:value={addLinkText}
		/>
	</div>
	<div>
		<label for="custom_text">Link</label>
		<input
			class="form-control"
			type="text"
			placeholder="Enter Your Link URL"
			bind:value={addLinkUrl}
		/>
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
<button
	disabled={!uploadEnabled}
	title="Modify this page to active this button"
	onclick={turboUpload}>Upload this linktree page to Arweave</button
>
<p style="font-size: 12px;margin-bottom:5px;" class:hidden={!isUploading}>
	Upload your linktree to Arweave...
</p>
<p style="font-size:12px; margin-bottom:5px;color:darkgreen" class:hidden={!showLinktreeId}>
	Link Tree ID:{linktreeId}
</p>
<p style="font-size:12px; margin-bottom:5px;color:darkred" class:hidden={!uploadFailed}>
	Upload to Arweave Failed, try it layter.
</p>
<hr />
<button
	class:hidden={isPublishUndername}
	onclick={() => {
		isPublishUndername = true;
	}}>Publish Undername</button
>
<br />
<div
	style="border:1px solid gray;padding:14px; background-color:#e3f2fd;border-radius:4px"
	class:hidden={!isPublishUndername}
>
	<div style="text-align: right;">
		{#if walletConnected}
			<button style="font-size: 14px; color:darkblue" type="button" onclick={disconnectWallet}
				>Disconnect</button
			>
		{:else}
			<span style="font-size: 14px;color:darkblue">Info:Connect wallet to publish undername </span>
			<button
				style="font-size: 14px; color:darkblue"
				type="button"
				class="btn btn-primary"
				onclick={connectWallet}>Connect Wallet</button
			>
		{/if}
		<span
			role="button"
			tabindex="0"
			onkeydown={() => {
				isPublishUndername = false;
			}}
			onclick={() => {
				isPublishUndername = false;
			}}
		>
			✖close</span
		>
	</div>
	<hr />
	<table
		style="font-size:12px;background-color:#bbdefb;width:100%;border:1px solid #ddd;border-collapse:collapse;"
	>
		<caption style="font-size: 14px;"><strong>Your undernames</strong></caption>
		<thead>
			<tr style="background:#f5f5f5">
				<th style="padding:4px;text-align:center;border:1px solid #ddd">Undername</th>
				<th style="padding:4px;text-align:center;border:1px solid #ddd">Linktree Id</th>
				<th style="padding:4px;text-align:center;border:1px solid #ddd">Edit</th>
				<th style="padding:4px;text-align:center;border:1px solid #ddd">Delete</th>
			</tr></thead
		>
		<tbody>
			<tr>
				<td style="padding:4px;border:1px solid #ddd">{undername}</td>
				<td style="padding:4px;border:1px solid #ddd"
					>4zxHDSCFspfjijZy3XY6QMr28LKEgqICwv7iw-zzR3Y
				</td>
				<td style="padding:4px;border:1px solid #ddd">🖉</td>
				<td style="padding:4px;border:1px solid #ddd">✖</td>
			</tr>
			<tr>
				<td style="padding:4px;border:1px solid #ddd">emily</td>
				<td style="padding:4px;border:1px solid #ddd">
					IVbHJBVdBEzv_90VUS19f2NTps-fHDG1a7a9LX-Lg8g
				</td>
				<td style="padding:4px;border:1px solid #ddd">🖉</td>
				<td style="padding:4px;border:1px solid #ddd">✖</td>
			</tr>
		</tbody>
	</table>
	<hr />
	<div style="font-size: 14px; font-weight:bolder">Publish new undername</div>

	<div class:hidden={antWarning} style="background-color: #bbdefb;padding:10px; font-size:14px">
		<div>
			<label for="custom_text">Linktree Id</label>
			<input
				type="text"
				style="width: 350px;margin-bottom:5px"
				id="custom_text"
				placeholder="Enter you Linktree Id"
				bind:value={linktreeId}
			/>
		</div>
		<div>
			<label for="custom_text">UnderName</label>
			<input
				type="text"
				style="width: 150px;margin-bottom:5px"
				id="custom_text"
				placeholder="Enter you undername"
				bind:value={undername}
				onkeydown={onUnderNameChanged}
			/>
			<button onclick={checkName}>Check Validity</button>
			<span style="font-size:12px;color:coral" class:hidden={!isChecking}> 🛑 checking</span>
			<span style="font-size:12px" class:hidden={!showAvialableCheck}>
				<span style="font-size:12px;color:darkgreen" class:hidden={!nameAvailable}>
					✔ {undername} is available</span
				>
				<span style="font-size:12px;color:darkorange" class:hidden={nameAvailable}>
					✖ {undername} is taken</span
				>
			</span>
			<span style="font-size:12px;color:darkred" class:hidden={!showAlphabetOnly}
				>⚠invalid character</span
			>
		</div>
		<div style="font-size:12px;color:darkgreen">
			Publish <code>{linktreeId}</code> to <code>{undername}_linktree.{gatewayDomainName}</code>
		</div>
		<div class:hidden={underNameChanged || showAlphabetOnly}>
			<button
				class:hidden={!nameAvailable}
				disabled={!walletConnected}
				onclick={publish}
				title="connect wallet to publish"
				><span class:hidden={!walletConnected}>Publish</span><span class:hidden={walletConnected}
					>Connect Wallet Before Publishing</span
				>
			</button>
			<div class:hidden={!showPublish}>
				<p style="color:darkblue" class:hidden={!isAoSending}>
					<!--正在发往AO处理域名解析事项...-->
					Sending to AO to handle undername resolution...
				</p>
				<p style="color:darkorange" class:hidden={!showFail}>
					<!--AO处理过程中遇到问题，请稍候再试-->
					We encountered an issue during the AO processing. Please try again later.
				</p>
				<p style="color:darkgreen" class:hidden={!showSuccess}>
					<!-- 解析undername到生效需要一些时间，请过些时间访问你的linktree域名或到本页查看结果-->
					It will take some time to resolve the undername until it takes effect. Please visit your linktree
					(https://{undername}_linktree.{gatewayDomainName}) or check the results on this page
					later.
				</p>
			</div>
		</div>
	</div>
	<div style="color:orangered;margin:10px" class:hidden={!antWarning}>
		Warning: ANT service is unvailable now, refresh or try it later.
	</div>
</div>
<hr />
<div class:hidden={nameAvailable}>
	<strong style="color:green">{undername} is ready! </strong> vist
	<code>
		<a style="text-decoration: none;" href="https://{undername}_linktree.{gatewayDomainName}"
			>https://{undername}_linktree.{gatewayDomainName}</a
		></code
	>
	or
	<code
		><a style="text-decoration: none;" href="/gateway?undername={undername}">more domain names</a
		></code
	>
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
