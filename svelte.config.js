import adapter from '@sveltejs/adapter-static';

export default {
	kit: {
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically — see below
			pages: 'build',
			assets: 'build',
			//fallback:false,
			fallback: "index.html",
			precompress: false,
			strict: false
		}),
		prerender: {
			// 启用预渲染
			//default: true,
			// 明确指定需要预渲染的路由
			entries: [
				'*',
				'/gateway'
			]
		  }
	}
};