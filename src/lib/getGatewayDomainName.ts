import { defaultGatewayDomainName } from "./constant";
export function getGatewayDomainName() {
    if (import.meta.env.MODE === "production") {       
        const hostname = window.location.hostname; // 获取当前主机名       
        if (hostname == "localhost") {
            return defaultGatewayDomainName;
        } else {
            const parts = hostname.split("."); // 按点分割
            return parts.slice(-2).join("."); // 返回最后两部分
        }
    } else {
        return import.meta.env.VITE_TEST_GATEWAY;
    }
}
