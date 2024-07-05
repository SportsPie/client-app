import {
  BNB_TOKEN_CONTRACT_ADDRESS,
  SMART_CHAIN_END_POINT,
  ADMIN_WALLET,
} from '@env';
import Decimal from 'decimal.js';
import { Buffer } from 'buffer';
import CustomException from '../common/exceptions/CustomException';
import walletUtils from './WalletUtils';
import SPAbis from '../common/SPAbi';
import { getTranslation } from './TranslationContext';

let web3 = null;

const web3Utils = {
  web3Connect: () => {
    // eslint-disable-next-line global-require
    const Web3 = require('web3');
    web3 = new Web3(new Web3.providers.HttpProvider(SMART_CHAIN_END_POINT));
  },
  getBalanceToOriPrice: (balance, unitPrice) => {
    if (!balance || !unitPrice) {
      return '';
    }
    return new Decimal(balance * unitPrice);
  },
  getBalance: async () => {
    try {
      const wallet = await walletUtils.getWalletAddress();

      const balanceInWei = await web3.eth.getBalance(wallet);
      const balanceInEth = web3.utils.fromWei(balanceInWei, 'ether');

      return new Decimal(balanceInEth);
    } catch (error) {
      console.log('error', error);
      throw new CustomException('잔액 조회에 실패하였습니다.');
    }
  },
  getTokenBalance: async () => {
    try {
      const wallet = await walletUtils.getWalletAddress();
      const contract = new web3.eth.Contract(
        SPAbis.bnbPie,
        BNB_TOKEN_CONTRACT_ADDRESS,
      );
      const tokenBalance = await contract.methods.balanceOf(wallet).call();
      const actualTokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
      return actualTokenBalance;
    } catch (error) {
      console.log('error', error);
      throw new CustomException('잔액 조회에 실패하였습니다.');
    }
  },
  // getAllowance: async () => {
  //   try {
  //     const wallet = await walletUtils.getWalletAddress();
  //     const contract = new web3.eth.Contract(
  //       SPAbis.bnbPie,
  //       BNB_TOKEN_CONTRACT_ADDRESS,
  //     );
  //     const allowance = await contract.methods
  //       .allowance(wallet, ADMIN_WALLET)
  //       .call();
  //     return allowance;
  //   } catch (error) {
  //     console.log('error', error);
  //     throw new CustomException('PIE 전송에 실패하였습니다.');
  //   }
  // },
  sendToken: async (toWallet, toValue) => {
    try {
      const wallet = await walletUtils.getWalletAddress();
      const contract = new web3.eth.Contract(
        SPAbis.bnbPie,
        BNB_TOKEN_CONTRACT_ADDRESS,
      );

      if (toValue instanceof Decimal) {
        // eslint-disable-next-line no-param-reassign
        toValue = toValue.toNumber();
      }

      // transfer 함수를 위한 호출 데이터 생성
      const data = contract.methods
        .transfer(toWallet, web3.utils.toWei(toValue, 'ether'))
        .encodeABI();

      const gasPrice = await web3.eth.getGasPrice();
      const gasLimit = await web3.eth.estimateGas({
        from: wallet,
        to: BNB_TOKEN_CONTRACT_ADDRESS,
        data,
      });

      const privateKey = await walletUtils.getWalletPrivateKey();

      // 원시 트랜잭션 객체 생성
      const rawTransaction = {
        from: wallet,
        to: BNB_TOKEN_CONTRACT_ADDRESS,
        gas: web3.utils.toHex(gasLimit),
        gasPrice: web3.utils.toHex(gasPrice),
        data,
      };

      // 트랜잭션 서명
      const signedTransaction = await web3.eth.accounts.signTransaction(
        rawTransaction,
        privateKey,
      );

      // 서명된 트랜잭션 전송
      const receipt = await web3.eth.sendSignedTransaction(
        signedTransaction.rawTransaction,
      );
      const gasUsed = Number(receipt.gasUsed);
      const effectiveGasPrice = Number(receipt.effectiveGasPrice);
      const totalGasFee = gasUsed * effectiveGasPrice;
      const totalGasFeeInBnb = web3.utils.fromWei(totalGasFee, 'ether');

      return { ...receipt, totalGasFeeInBnb };
    } catch (error) {
      console.log('error', error);
      throw new CustomException('PIE 전송에 실패하였습니다.');
    }
  },

  weiToBnb: value => {
    const bnbValue = value / 10 ** 18;

    return bnbValue;
  },

  contributeNFT: async (to, tokenId, amount, nftContractAddress) => {
    const wallet = await walletUtils.getWalletAddress();
    const privateKey = await walletUtils.getWalletPrivateKey();
    const tokenIdNum = Number(tokenId);
    const amountNum = Number(amount);

    const amountToPadLeft = web3.utils.padLeft(web3.utils.toHex(amountNum), 64);
    const nonce = new Date().getTime();
    const nonceToPadLeft = web3.utils.padLeft(web3.utils.toHex(nonce), 64);
    const tokenIdToPadLeft = web3.utils.padLeft(
      web3.utils.toHex(tokenIdNum),
      64,
    );

    const combined = web3.utils.encodePacked(
      wallet,
      to,
      tokenIdToPadLeft,
      amountToPadLeft,
      nonceToPadLeft,
      nftContractAddress,
    );
    const hashMessage = web3.utils.keccak256(combined);
    const { signature } = await web3.eth.accounts.sign(hashMessage, privateKey);

    return { signature, nonce };
  },
  isValidAddress: address => {
    const result = web3.utils.isAddress(address);
    return result;
  },
};
export default web3Utils;
