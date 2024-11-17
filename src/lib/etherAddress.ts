import isString from 'lodash/isString';
import { isAddress } from '@ethersproject/address';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { createData } from 'arseeding-arbundles';
import { InjectedEthereumSigner } from 'arseeding-arbundles/src/signing';

export const isEthereumAddress = isAddress;

export const isArweaveAddress = (address: string): boolean => {
	return isString(address) && address.length === 43 && address.search(/[a-z0-9A-Z_-]{43}/g) === 0;
};

export const getChecksumAddress =(address:string):string=>{return  ethers.getAddress(address);}

export function createEthereumSigner() {
	return async function ({
		data,
		tags = [],
		target,
		anchor
	}: {
		data: any;
		tags?: { name: string; value: string }[];
		target?: string;
		anchor?: string;
	}) {
		// 创建 Web3Provider 和 InjectedEthereumSigner 实例
		const provider = new Web3Provider(window.ethereum);
		const signer = new InjectedEthereumSigner(provider);

		// 设置公钥
		await signer.setPublicKey();

		// 创建数据项
		const dataItem = createData(data, signer, { tags, target, anchor });

		// 签署数据项
		await dataItem.sign(signer);

		// 返回数据项的 ID 和原始数据
		return {
			id: dataItem.id,
			raw: dataItem.getRaw()
		};
	};
}