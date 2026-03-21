const NCMDecrypt = (function() {
    const coreKey = new Uint8Array([
        0x68, 0x7A, 0x48, 0x52, 0x41, 0x6D, 0x73, 0x6F,
        0x35, 0x6B, 0x49, 0x6E, 0x62, 0x61, 0x78, 0x57
    ]);
    
    const metaKey = new Uint8Array([
        0x23, 0x31, 0x34, 0x6C, 0x6A, 0x6B, 0x5F, 0x21,
        0x5C, 0x5D, 0x26, 0x30, 0x55, 0x3C, 0x27, 0x28
    ]);
    
    const magicHeader = new Uint8Array([0x43, 0x54, 0x45, 0x4E, 0x46, 0x44, 0x41, 0x4D]);
    
    const sBox = new Uint8Array([
        0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
        0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
        0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
        0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
        0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
        0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
        0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
        0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
        0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
        0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
        0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
        0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
        0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
        0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
        0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
        0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
    ]);
    
    const invSBox = new Uint8Array([
        0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e, 0x81, 0xf3, 0xd7, 0xfb,
        0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87, 0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb,
        0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23, 0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e,
        0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25,
        0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92,
        0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84,
        0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a, 0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06,
        0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02, 0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b,
        0x3a, 0x91, 0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73,
        0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8, 0x1c, 0x75, 0xdf, 0x6e,
        0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89, 0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b,
        0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2, 0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4,
        0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f,
        0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d, 0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef,
        0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61,
        0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26, 0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d
    ]);
    
    const rcon = new Uint8Array([
        0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36
    ]);
    
    function xorBytes(data, value) {
        const result = new Uint8Array(data.length);
        for (let i = 0; i < data.length; i++) {
            result[i] = data[i] ^ value;
        }
        return result;
    }
    
    function subWord(word) {
        return new Uint8Array([sBox[word[0]], sBox[word[1]], sBox[word[2]], sBox[word[3]]]);
    }
    
    function rotWord(word) {
        return new Uint8Array([word[1], word[2], word[3], word[0]]);
    }
    
    function keyExpansion(key) {
        const Nk = 4;
        const Nb = 4;
        const Nr = 10;
        const expandedKey = new Uint8Array(4 * Nb * (Nr + 1));
        
        for (let i = 0; i < 4 * Nk; i++) {
            expandedKey[i] = key[i];
        }
        
        for (let i = Nk; i < Nb * (Nr + 1); i++) {
            const temp = new Uint8Array([
                expandedKey[(i - 1) * 4],
                expandedKey[(i - 1) * 4 + 1],
                expandedKey[(i - 1) * 4 + 2],
                expandedKey[(i - 1) * 4 + 3]
            ]);
            
            if (i % Nk === 0) {
                const rotated = rotWord(temp);
                const substituted = subWord(rotated);
                temp[0] = substituted[0] ^ rcon[i / Nk];
                temp[1] = substituted[1];
                temp[2] = substituted[2];
                temp[3] = substituted[3];
            }
            
            expandedKey[i * 4] = expandedKey[(i - Nk) * 4] ^ temp[0];
            expandedKey[i * 4 + 1] = expandedKey[(i - Nk) * 4 + 1] ^ temp[1];
            expandedKey[i * 4 + 2] = expandedKey[(i - Nk) * 4 + 2] ^ temp[2];
            expandedKey[i * 4 + 3] = expandedKey[(i - Nk) * 4 + 3] ^ temp[3];
        }
        
        return expandedKey;
    }
    
    function addRoundKey(state, roundKey) {
        for (let i = 0; i < 16; i++) {
            state[i] ^= roundKey[i];
        }
    }
    
    function invSubBytes(state) {
        for (let i = 0; i < 16; i++) {
            state[i] = invSBox[state[i]];
        }
    }
    
    function invShiftRows(state) {
        const temp = new Uint8Array(16);
        temp[0] = state[0]; temp[1] = state[13]; temp[2] = state[10]; temp[3] = state[7];
        temp[4] = state[4]; temp[5] = state[1]; temp[6] = state[14]; temp[7] = state[11];
        temp[8] = state[8]; temp[9] = state[5]; temp[10] = state[2]; temp[11] = state[15];
        temp[12] = state[12]; temp[13] = state[9]; temp[14] = state[6]; temp[15] = state[3];
        for (let i = 0; i < 16; i++) state[i] = temp[i];
    }
    
    function gmul(a, b) {
        let p = 0;
        for (let i = 0; i < 8; i++) {
            if (b & 1) p ^= a;
            const hiBitSet = a & 0x80;
            a = (a << 1) & 0xFF;
            if (hiBitSet) a ^= 0x1b;
            b >>= 1;
        }
        return p;
    }
    
    function invMixColumns(state) {
        const temp = new Uint8Array(16);
        for (let c = 0; c < 4; c++) {
            const i = c * 4;
            temp[i] = gmul(state[i], 14) ^ gmul(state[i + 1], 11) ^ gmul(state[i + 2], 13) ^ gmul(state[i + 3], 9);
            temp[i + 1] = gmul(state[i], 9) ^ gmul(state[i + 1], 14) ^ gmul(state[i + 2], 11) ^ gmul(state[i + 3], 13);
            temp[i + 2] = gmul(state[i], 13) ^ gmul(state[i + 1], 9) ^ gmul(state[i + 2], 14) ^ gmul(state[i + 3], 11);
            temp[i + 3] = gmul(state[i], 11) ^ gmul(state[i + 1], 13) ^ gmul(state[i + 2], 9) ^ gmul(state[i + 3], 14);
        }
        for (let i = 0; i < 16; i++) state[i] = temp[i];
    }
    
    function aesDecryptBlock(block, expandedKey) {
        const state = new Uint8Array(block);
        const Nr = 10;
        
        addRoundKey(state, expandedKey.slice(Nr * 16, (Nr + 1) * 16));
        
        for (let round = Nr - 1; round >= 1; round--) {
            invShiftRows(state);
            invSubBytes(state);
            addRoundKey(state, expandedKey.slice(round * 16, (round + 1) * 16));
            invMixColumns(state);
        }
        
        invShiftRows(state);
        invSubBytes(state);
        addRoundKey(state, expandedKey.slice(0, 16));
        
        return state;
    }
    
    function aesDecryptECB(encryptedData, key) {
        const expandedKey = keyExpansion(key);
        const numBlocks = encryptedData.length / 16;
        const decrypted = new Uint8Array(encryptedData.length);
        
        for (let i = 0; i < numBlocks; i++) {
            const block = encryptedData.slice(i * 16, (i + 1) * 16);
            const decryptedBlock = aesDecryptBlock(block, expandedKey);
            decrypted.set(decryptedBlock, i * 16);
        }
        
        return decrypted;
    }
    
    function removePKCS7Padding(data) {
        const paddingLength = data[data.length - 1];
        if (paddingLength > 0 && paddingLength <= 16) {
            let valid = true;
            for (let i = 1; i <= paddingLength; i++) {
                if (data[data.length - i] !== paddingLength) {
                    valid = false;
                    break;
                }
            }
            if (valid) {
                return data.slice(0, data.length - paddingLength);
            }
        }
        return data;
    }
    
    function readUint32LE(data, offset) {
        return data[offset] | (data[offset + 1] << 8) | 
               (data[offset + 2] << 16) | (data[offset + 3] << 24);
    }
    
    class CR4 {
        constructor() {
            this.box = new Uint8Array(256);
        }
        
        KSA(key) {
            const len = key.length;
            for (let i = 0; i < 256; i++) {
                this.box[i] = i;
            }
            for (let i = 0, j = 0; i < 256; i++) {
                j = (j + this.box[i] + key[i % len]) & 0xff;
                [this.box[i], this.box[j]] = [this.box[j], this.box[i]];
            }
        }
        
        PRGA(data, length) {
            for (let k = 0; k < length; k++) {
                const i = (k + 1) & 0xff;
                const j = (this.box[i] + i) & 0xff;
                data[k] ^= this.box[(this.box[i] + this.box[j]) & 0xff];
            }
            return data;
        }
    }
    
    function detectAudioFormat(data) {
        if (data[0] === 0x49 && data[1] === 0x44 && data[2] === 0x33) {
            return { ext: 'mp3', mime: 'audio/mpeg' };
        }
        if (data[0] === 0xFF && (data[1] & 0xE0) === 0xE0) {
            return { ext: 'mp3', mime: 'audio/mpeg' };
        }
        if (data[0] === 0x66 && data[1] === 0x4C && data[2] === 0x61 && data[3] === 0x43) {
            return { ext: 'flac', mime: 'audio/flac' };
        }
        if (data.length > 10 && data[4] === 0x66 && data[5] === 0x74 && data[6] === 0x79 && data[7] === 0x70) {
            if (data[8] === 0x4D && data[9] === 0x34 && data[10] === 0x41) {
                return { ext: 'm4a', mime: 'audio/mp4' };
            }
            return { ext: 'mp4', mime: 'audio/mp4' };
        }
        if (data[0] === 0x4F && data[1] === 0x67 && data[2] === 0x67 && data[3] === 0x53) {
            return { ext: 'ogg', mime: 'audio/ogg' };
        }
        return { ext: 'mp3', mime: 'audio/mpeg' };
    }
    
    function base64ToUint8Array(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }
    
    async function parseNCM(arrayBuffer, onProgress) {
        const data = new Uint8Array(arrayBuffer);
        let offset = 0;
        
        if (data.length < 10) {
            throw new Error('文件太小，不是有效的 NCM 文件');
        }
        
        for (let i = 0; i < 8; i++) {
            if (data[i] !== magicHeader[i]) {
                throw new Error('不是有效的 NCM 文件格式');
            }
        }
        offset = 8;
        
        if (data[8] !== 0x01 || data[9] !== 0x70) {
            throw new Error('不是有效的 NCM 文件格式（版本号错误）');
        }
        offset = 10;
        
        if (offset + 4 > data.length) {
            throw new Error('文件格式错误');
        }
        const keyDataLength = readUint32LE(data, offset);
        offset += 4;
        
        if (offset + keyDataLength > data.length) {
            throw new Error('文件格式错误：密钥数据不完整');
        }
        const encryptedKeyData = data.slice(offset, offset + keyDataLength);
        offset += keyDataLength;
        
        const xoredKeyData = xorBytes(encryptedKeyData, 0x64);
        
        const decryptedKeyData = aesDecryptECB(xoredKeyData, coreKey);
        const keyData = removePKCS7Padding(decryptedKeyData);
        
        const keyString = new TextDecoder('utf-8').decode(keyData.slice(17));
        const audioKey = new TextEncoder().encode(keyString);
        
        if (onProgress) onProgress(0.2);
        
        if (offset + 4 > data.length) {
            throw new Error('文件格式错误');
        }
        const metaDataLength = readUint32LE(data, offset);
        offset += 4;
        
        let metadata = null;
        if (metaDataLength > 0) {
            if (offset + metaDataLength > data.length) {
                throw new Error('文件格式错误：元数据不完整');
            }
            const encryptedMetaData = data.slice(offset, offset + metaDataLength);
            offset += metaDataLength;
            
            const xoredMetaData = xorBytes(encryptedMetaData, 0x63);
            
            const base64String = new TextDecoder('utf-8').decode(xoredMetaData.slice(22));
            
            try {
                const metaBytes = base64ToUint8Array(base64String);
                const decryptedMeta = aesDecryptECB(metaBytes, metaKey);
                const metaData = removePKCS7Padding(decryptedMeta);
                const metaString = new TextDecoder('utf-8').decode(metaData.slice(6));
                metadata = JSON.parse(metaString);
            } catch (e) {
                console.warn('元数据解析失败:', e);
            }
        }
        
        if (onProgress) onProgress(0.4);
        
        offset += 9;
        
        if (offset + 4 > data.length) {
            throw new Error('文件格式错误');
        }
        const imageSize = readUint32LE(data, offset);
        offset += 4;
        
        let coverImage = null;
        if (imageSize > 0) {
            if (offset + imageSize > data.length) {
                throw new Error('文件格式错误：封面数据不完整');
            }
            coverImage = data.slice(offset, offset + imageSize);
            offset += imageSize;
        }
        
        if (onProgress) onProgress(0.5);
        
        const audioData = data.slice(offset);
        
        const cr4 = new CR4();
        cr4.KSA(audioKey);
        const decryptedAudio = cr4.PRGA(new Uint8Array(audioData), audioData.length);
        
        if (onProgress) onProgress(0.9);
        
        const format = detectAudioFormat(decryptedAudio);
        
        let songName = 'Unknown';
        let artist = 'Unknown';
        
        if (metadata) {
            if (metadata.musicName) {
                songName = metadata.musicName;
            }
            if (metadata.artist && metadata.artist.length > 0) {
                artist = metadata.artist.map(a => a[0]).join(', ');
            }
        }
        
        return {
            audioData: decryptedAudio,
            format: format,
            metadata: metadata,
            coverImage: coverImage,
            songName: songName,
            artist: artist
        };
    }
    
    return {
        parse: parseNCM,
        detectFormat: detectAudioFormat
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = NCMDecrypt;
}
