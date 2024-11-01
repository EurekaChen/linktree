<script>
	// or use @ardrive/turbo-sdk/web depending on your environment
	import {
		TurboFactory,
		USD,
		WinstonToTokenAmount,
		developmentTurboConfiguration
	} from '@ardrive/turbo-sdk/node';
	import Arweave from 'arweave';
	import fs from 'fs';
	import { Readable } from 'stream';

	(async () => {
		/**
		 * 从arweave钱包生成 key.
		 */
		const arweave = new Arweave({});
		const jwk = await arweave.wallets.generate();
		/**
		 * 使用arweave key 创建授权的turbo client
		 */
		const turboAuthClient = TurboFactory.authenticated({
			privateKey: jwk,
			...developmentTurboConfiguration
		});

		/**
		 * 从私钥获取余额.
		 */
		const balance = await turboAuthClient.getBalance();
		console.log('Balance:', balance);

		/**
		 * Fetch the estimated amount of winc returned for 10 USD (1000 cents).
		 * 获取法币10USD返回和winc数量
		 */
		const estimatedWinc = await turboAuthClient.getWincForFiat({
			amount: USD(10)
		});
		console.log('10 USD to winc:', estimatedWinc);

		/**
		 * Post local files to the Turbo service.
		 * 将本地文件放到Turbo服务
		 */
		console.log('Posting raw file to Turbo service...');
		const filePath = new URL('./index.html', import.meta.url).pathname;
		const fileContent = `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<title>Link Tree AR</title>
		<meta name="description" content="link tree ar" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<link rel="stylesheet" href="css/normalize.css" />
		<link rel="stylesheet" href="css/skeleton-auto.css" />
		<link rel="stylesheet" href="css/brands.css" />
	</head>
	<body>
		<div class="container">
			<div class="row">
				<div class="column" style="margin-top: 10%">
					<img src="https://arweave.net/8MfM94Fd7MRBeQ9-265gGL-EgqMXE6OINSZx5bAu780" style="width:120px;height: 120px;" />
					<h1 role="heading">Link Tree AR</h1>
					<p>Link Tree On Permaweb.</p>
          <a class="button button-default" href="#" target="_blank" rel="noopener" role="button"
						><img
							class="icon"
							aria-hidden="true"
							src="images/icons/generic-website.svg"
							alt="website"
						/>Website</a
					><br />
					<a class="button button-github" href="#" target="_blank" rel="noopener" role="button"
						><img
							class="icon"
							aria-hidden="true"
							src="images/icons/github.svg"
							alt="GitHub Logo"
						/>GitHub</a
					><br />
					<a class="button button-x" href="#" target="_blank" rel="noopener" role="button"
						><img class="icon" aria-hidden="true" src="images/icons/x.svg" alt="X Logo" />Follow on
						X</a
					><br />
					<a class="button button-yt" href="#" target="_blank" rel="noopener" role="button"
						><img
							class="icon"
							aria-hidden="true"
							src="images/icons/youtube.svg"
							alt="YouTube Logo"
						/>YouTube</a
					><br />
				</div>
			</div>
		</div>
	</body>
</html>`;
		//const fileSize = fs.statSync(filePath).size;
		const fileSize = Buffer.byteLength(fileContent, 'utf-8');
		const uploadResult = await turboAuthClient.uploadFile({
			fileStreamFactory: () => {
				const readable = new Readable();
				readable._read = () => {}; // _read is required but you can noop it
				readable.push(fileContent);
				readable.push(null); // indicates end of file
				return readable;
			},
			fileSizeFactory: () => fileSize,
			//contentType:'text/html',

			dataItemOpts: {
				// optional
				tags: [
					{
						name: 'Content-Type',
						value: 'text/html'
					}					
				]
				// no timeout or AbortSignal provided
			},

			signal: AbortSignal.timeout(10_000) // cancel the upload after 10 seconds
		});
		console.log(JSON.stringify(uploadResult, null, 2));

		/**
		 * Tops up a wallet with Credits using tokens.
		 * Default token is AR, using Winston as the unit.
		 */
		/* const topUpResult = await turboAuthClient.topUpWithTokens({
			tokenAmount: WinstonToTokenAmount(100_000_000) // 0.0001 AR
		});
		console.log(JSON.stringify(topUpResult, null, 2)); */
	})();
</script>

<!-- Your Image Here -->
<img
	src="https://arweave.net/8MfM94Fd7MRBeQ9-265gGL-EgqMXE6OINSZx5bAu780"
	class="avatar"
	srcset="https://arweave.net/8MfM94Fd7MRBeQ9-265gGL-EgqMXE6OINSZx5bAu780 2x"
	alt="linktree AR"
/>

<!-- Title -->
<h1 role="heading">Link Tree AR</h1>

<!-- Short Bio -->
<p>
	You can directly edit this page and permanently publish it to Arweave, then accessing your page
	through the ar.io gateway
</p>

<!--

      ## Breaking down <a> attributes:
      
      1.) class="button button-default" | The first "button" here is telling this <a> tag that it should make this element a button and applies the default styling in `css/brands.css`.这里的第一个“按钮”告诉这个<a>标签，它应该使这个元素成为一个按钮，并在`css/brands.css`中应用默认样式。
      The second portion, button-default, is declaring the specific brand style you would like to apply. Here we're applying the "default" style and color.
      第二部分，按钮默认值，声明您要应用的特定品牌风格。在这里，我们应用“默认”样式和颜色。
      If you want to make this button to use the brand colors for Discord, just change "button-default" to "button-discord". Brands are found in `css/brands.css`. You can always edit & add your own there.
      如果你想让这个按钮使用Discord的品牌颜色，只需将“button-default”更改为“button-discord”。品牌可以在`css/Brands.css`中找到。您始终可以在那里编辑和添加自己的。

      2.) Replace the # in href="#" with the desired target URL for the button.

      3.) target="_blank" | This attribute opens links in a new tab. Remove this attribute to prevent links from opening in a new tab.

      4.) rel="noopener" | This attribute instructs the browser to navigate to the target resource without granting the new browsing context access to the document that opened it.此属性指示浏览器导航到目标资源，而不授予新的浏览上下文访问打开它的文档的权限。
      This is especially useful when opening untrusted links. https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/noopener

      5.) role="button" | The button role identifies an element as a button to assistive technology such as screen readers.按钮角色将元素标识为屏幕阅读器等辅助技术的按钮。

      ## Breaking down the <img> attributes:
      
      1.) class="icon" | This class is telling the <img> tag that it should use the styling for icons found in `css/brands.css`.此类告诉<img>标签，它应该使用`css/brands.css`中的图标样式。

      2.) src="images/icons/[icon-name].svg" | This defines the icon you would like to display from the 'images/icons/' folder. For example, you can change this to src="images/icons/discord.svg" to use the Discord icon.这定义了您要在“images/icons/”文件夹中显示的图标。例如，您可以将其更改为src=“images/icons/discord.svg”以使用discord图标。
      Add your own 24x24 icons to the "icons" folder to reference them. We recommend providing a SVG.将您自己的24x24图标添加到“icons”文件夹中以引用它们。我们建议提供SVG。

      3.) alt="" | Since the text at the end of the snippet, "..>[Button Text]</a><br>", explains what the button is, we use "alt=""" to nullify the icon annoucement from the accessibility tree. 
      This can improve the experience for assistive technology users by hiding what is essentially duplicated
      这可以通过隐藏本质上重复的内容来改善辅助技术用户的体验

    -->

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
><br />

<!-- GitHub -->
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

<p>+ Add Link</p>
<!-- 
        Footer:
        This includes a link to privacy.html page which can be setup for your Privacy Policy.
        This also includes a link to the LittleLink repository to make forking LittleLink easier.
        You can edit or remove anything here to make your own footer.
    -->
<p>
	Publish this page to <a href="https://arweave.net" target="_blank" rel="noopener" role="button"
		>Arweave</a
	>.
</p>
