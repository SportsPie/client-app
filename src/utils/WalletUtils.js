import { getStorage, setStorage } from './AsyncStorageUtils';

import { STORAGE_KEY } from '../common/constants/storageKey';
import CustomException from '../common/exceptions/CustomException';
import { getTranslation } from './TranslationContext';
import Utils from './Utils';
import { CONSTANTS } from '../common/constants/constants';

const bip39 = require('bip39');
// const { ethers } = require('ethers');
const { ethers } = require('ethers');

const walletUtils = {
  // mnemonic 생성
  getMnemonic: () => {
    const mnemonic = bip39.generateMnemonic(); // 12개의 단어로 구성된 랜덤 니모닉 키 생성
    return mnemonic;
  },

  // mnemonic을 통한 지갑 찾기 && 지갑 생성
  getWalletByMnemonnic: async mnemonic => {
    try {
      const bscPath = "m/44'/714'/0'/0/0";

      const HDNodeWallet = ethers.HDNodeWallet.fromPhrase(
        mnemonic,
        null,
        bscPath,
      );
      return HDNodeWallet;
    } catch (error) {
      console.log('error', error);
      const translation = await getTranslation();
      throw new CustomException(translation.failGetWallet); // 지갑 주소를 가져오는데 실패했습니다.
    }
  },

  // 개인키로 지갑 찾기
  getWalletByPrivateKey: privateKey => {
    const wallet = new ethers.Wallet(privateKey);
    return wallet;
  },

  saveWalletAddress: (mbIdx, address) => {
    setStorage(mbIdx + STORAGE_KEY.WALLET_ADDR, address);
  },
  saveWalletPrivateKey: (mbIdx, privateKey) => {
    setStorage(mbIdx + STORAGE_KEY.WALLET_PRIVATE_KEY, privateKey);
  },
  saveWalletMnemonnic: (mbIdx, mnemonnic) => {
    setStorage(mbIdx + STORAGE_KEY.WALLET_MNEMONNIC, mnemonnic);
  },
  getWalletAddress: async () => {
    const { auth } = await Utils.getUserInfo();
    const walletAddress = await getStorage(auth + STORAGE_KEY.WALLET_ADDR);
    return walletAddress;
  },
  getWalletPrivateKey: async () => {
    const { auth } = await Utils.getUserInfo();
    const privateKey = await getStorage(auth + STORAGE_KEY.WALLET_PRIVATE_KEY);
    return privateKey;
  },
  getWalletMnemonnic: async () => {
    const { auth } = await Utils.getUserInfo();
    const walletMnemonnic = await getStorage(
      auth + STORAGE_KEY.WALLET_MNEMONNIC,
    );
    return walletMnemonnic;
  },
  getWalletPinCode: async () => {
    const pinCode = await getStorage(CONSTANTS.KEY_WALLET_PIN_CODE);
    return pinCode;
  },
  saveWalletPinCode: async pinCode => {
    await setStorage(CONSTANTS.KEY_WALLET_PIN_CODE, pinCode);
  },
};
export default walletUtils;
