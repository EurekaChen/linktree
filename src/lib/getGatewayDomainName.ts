export function getGatewayDomainName() {
	const defaultGatewayDomainName = 'ar.io';
	const hostname = window.location.hostname; // 获取当前主机名
	console.log('hostname:', hostname);
	if (hostname == 'localhost') {
		return defaultGatewayDomainName;
	} else {
		const parts = hostname.split('.'); // 按点分割
		return parts.slice(-2).join('.'); // 返回最后两部分
	}
}
